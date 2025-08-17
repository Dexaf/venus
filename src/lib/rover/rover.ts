import { Reaction, ReactionKey, RoverControllerInterface, TouchInterface } from "../interfaces/rover-controller.interface";

export class Rover {
	public controller!: RoverControllerInterface;

	/**
	 * if false it stops the controller events from doing anything, updating or firing reactions
	 */
	public isActive = false;

	//SECTION - references to events used for init and stop
	private _keypressHandler?: (e: KeyboardEvent) => void;
	private _keydownHandler?: (e: KeyboardEvent) => void;
	private _keyupHandler?: (e: KeyboardEvent) => void;
	private _pointerdownHandler?: (e: PointerEvent) => void;
	private _pointermoveHandler?: (e: PointerEvent) => void;
	private _pointerupHandler?: (e: PointerEvent) => void;
	private _pointercancelHandler?: (e: PointerEvent) => void;
	private _wheelHandler?: (e: WheelEvent) => void;
	private _touchmoveHandler?: (e: TouchEvent) => void;

	/**
	 * @param canvas the canvas of the working render
	 * @description resets the inputs and activate the event listeners to trigger the events of the controller.
	 * you need to pass a controller to this object first
	 */
	public initialize(canvas: HTMLCanvasElement) {
		if (this.controller == null) {
			console.log("trying to initialize empty controller");
			return;
		}

		this.resetControllerInputs();

		this._keypressHandler = (e: KeyboardEvent) => this.keypress(e);
		this._keydownHandler = (e: KeyboardEvent) => this.keydown(e);
		this._keyupHandler = (e: KeyboardEvent) => this.keyup(e);
		this._pointerdownHandler = (e: PointerEvent) => this.pointerdown(e);
		this._pointermoveHandler = (e: PointerEvent) => this.pointermove(e);
		this._pointerupHandler = (e: PointerEvent) => this.pointerup(e);
		this._pointercancelHandler = (e: PointerEvent) => this.pointercancel(e);
		this._wheelHandler = (e: WheelEvent) => this.wheeluse(e);

		// SINGLE INPUT
		document.addEventListener("keypress", this._keypressHandler);
		canvas.addEventListener("pointerdown", this._pointerdownHandler);
		canvas.addEventListener("pointermove", this._pointermoveHandler);
		document.addEventListener("wheel", this._wheelHandler);

		// PARALLEL INPUT
		document.addEventListener("keydown", this._keydownHandler);

		// RESETS
		document.addEventListener("keyup", this._keyupHandler);
		canvas.addEventListener("pointerup", this._pointerupHandler);
		document.addEventListener("pointercancel", this._pointercancelHandler);

		this.isActive = true;
	}

	/**
	 * @description resets the inputs of the controller.
	 * you need to pass a controller to this object first
	 */
	private resetControllerInputs() {
		if (this.controller == null) {
			console.log("trying to reset null controller");
			return;
		}

		this.controller.keys.holded.inputs = {};
		this.controller.keys.pressed.input = "";
		this.controller.keys.released.input = "";
		this.controller.touch.down.inputs = [];
		this.controller.touch.up.inputs = [];
		this.controller.touch.moving.inputs = [];
		this.controller.wheel.event = null;
	}

	/**
	 *
	 * @param canvas the canvas of the working render
	 * @description stops the controller by removing the events, the value of the controller won't be updated anymore.
	 * you need to pass a controller to this object first
	 */
	public stop(canvas: HTMLCanvasElement) {
		if (this.controller == null) {
			console.log("trying to stop null controller");
			return;
		}

		if (this.isActive == false) return;

		this.isActive = false;

		// SINGLE INPUT
		document.removeEventListener("keypress", this._keypressHandler!);
		canvas.removeEventListener("pointerdown", this._pointerdownHandler!);
		canvas.removeEventListener("pointermove", this._pointermoveHandler!);
		document.removeEventListener("wheel", this._wheelHandler!);

		// PARALLEL INPUT
		document.removeEventListener("keydown", this._keydownHandler!);

		// RESETS
		document.removeEventListener("keyup", this._keyupHandler!);
		canvas.removeEventListener("pointerup", this._pointerupHandler!);
		document.addEventListener("pointercancel", this._pointercancelHandler!);
	}

	//SECTION - EVENTS FOR THE ROVER
	//KEYBOARD INPUT
	private keypress = (e: KeyboardEvent) => {
		if (this.isActive) {
			this.controller.keys.pressed.input = e.code;
			//local to the event
			this.reactionHandling(this.controller.keys.pressed.reactions);
			//global
			this.reactionHandling(this.controller.reactions);
		}
	};
	private keydown = (e: KeyboardEvent) => {
		if (this.isActive) {
			this.controller.keys.holded.inputs[e.code] = true;
			//local to the event
			this.reactionHandling(this.controller.keys.holded.reactions);
			//global
			this.reactionHandling(this.controller.reactions);
		}
	};
	private keyup = (e: KeyboardEvent) => {
		if (this.isActive) {
			delete this.controller.keys.holded.inputs[e.code];
			if (this.controller.keys.pressed.input == e.code) this.controller.keys.pressed.input = "";

			this.controller.keys.released.input = e.code;
			//local to the event
			this.reactionHandling(this.controller.keys.released.reactions);
			//global
			this.reactionHandling(this.controller.reactions);
			//NOTE - maybe we should reset the input for released
		}
	};

	//POINTER INPUT
	private pointerdown = (e: PointerEvent) => {
		if (this.isActive) this.updatePointerReaction(e, this.controller.touch.down);
	};
	private pointermove = (e: PointerEvent) => {
		if (this.isActive) this.updatePointerReaction(e, this.controller.touch.moving, true, e.pointerId);
	};
	private pointerup = (e: PointerEvent) => {
		if (this.isActive) {
			this.updatePointerReaction(null, this.controller.touch.down, false, e.pointerId);
			this.updatePointerReaction(null, this.controller.touch.moving, true, e.pointerId);
			this.updatePointerReaction(e, this.controller.touch.up);
		}
	};
	private pointercancel = (e: PointerEvent) => {
		if (this.isActive) {
			this.updatePointerReaction(null, this.controller.touch.down, false, e.pointerId);
			this.updatePointerReaction(null, this.controller.touch.moving, true, e.pointerId);
		}
	};

	//WHEEL INPUT
	private wheeluse = (e: WheelEvent) => {
		if (this.isActive) {
			let timeoutId: number | null = null;

			this.controller.wheel.event = e;
			//local to the event
			this.reactionHandling(this.controller.wheel.reactions);
			//global
			this.reactionHandling(this.controller.reactions);

			//NOTE - without this timeout we don't have a way of telling if the user stopped doing the action
			//NOTE - should check if firing the events again make sense
			timeoutId = setTimeout(() => {
				this.controller.wheel.event = null;
				//local to the event
				this.reactionHandling(this.controller.wheel.reactions);
				//global
				this.reactionHandling(this.controller.reactions);
			}, 30);
		}
	};
	//!SECTION - EVENTS FOR THE ROVER

	//SECTION - UTILS
	/**
	 * @param event: current PointerEvent or null to use for the update
	 * @param touchInterface: the touch we are working with
	 * @param isReacting: (default is true) if the update should trigger an update for the reactions
	 * @param pointerId: (default is null) the pointer id of an event, need in mobile
	 * @description find the pointerId to update with the new event/null and check if needed to trigger the reaction
	 */
	private updatePointerReaction(event: PointerEvent | null, touchInterface: TouchInterface, isReacting = true, pointerId: number | null = null) {
		const currEventIndex = touchInterface.inputs.findIndex((i) => i.event?.pointerId == pointerId);

		if (event)
			if (currEventIndex != -1)
				//UPDATE EVENT
				touchInterface.inputs[currEventIndex] = {
					event: event,
				};
			//ADD EVENT
			else touchInterface.inputs.push({ event: event });
		//DELETE OLD EVENT
		else if (currEventIndex != -1) touchInterface.inputs.splice(currEventIndex, 1);

		if (isReacting) {
			//local to the event
			this.touchReactionHandling(touchInterface.reactions, event);
			//global
			this.touchReactionHandling(this.controller.reactions, event);
		}
	}

	/**
	 * @param reactions
	 * @param event
	 * @description activates all the reactions
	 */
	private touchReactionHandling = (reactions: Map<ReactionKey, Reaction>, event: PointerEvent | null) => {
		reactions.forEach((r) => r(event));
	};

	/**
	 * @param reactions
	 * @description activates all the reactions
	 */
	private reactionHandling = (reactions: Map<ReactionKey, Reaction>) => {
		reactions.forEach((r) => r());
	};
	//!SECTION - UTILS
}
