import { Reaction, ReactionKey, RoverControllerInterface, TouchInterface } from "../interfaces/rover-controller.interface";

export class Rover {
	public controller!: RoverControllerInterface;

	/**
	 * if false it stops the controller events from doing anything, updating or firing reactions
	 */
	public isActive = false;

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

		// SINGLE INPUT
		document.addEventListener("keypress", this.keypress.bind(this));
		canvas.addEventListener("pointerdown", this.pointerdown.bind(this));
		canvas.addEventListener("pointermove", this.pointermove.bind(this));
		document.addEventListener("wheel", this.wheeluse.bind(this));

		// PARALLEL INPUT
		document.addEventListener("keydown", this.keydown.bind(this));

		// RESETS
		document.addEventListener("keyup", this.keyup.bind(this));
		canvas.addEventListener("pointerup", this.pointerup.bind(this));
		document.addEventListener("pointercancel", this.pointercancel.bind(this));
		//NOTE blocca lo scroll della pagina
		canvas.addEventListener("touchmove", (e) => {
			e.preventDefault();
		});

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

		this.isActive = false;

		// SINGLE INPUT
		document.removeEventListener("keypress", this.keypress.bind(this));
		canvas.removeEventListener("pointerdown", this.pointerdown.bind(this));
		canvas.removeEventListener("pointermove", this.pointermove.bind(this));
		document.removeEventListener("wheel", this.wheeluse.bind(this));

		// PARALLEL INPUT
		document.removeEventListener("keydown", this.keydown.bind(this));

		// RESETS
		document.removeEventListener("keyup", this.keyup.bind(this));
		canvas.removeEventListener("pointerup", this.pointerup.bind(this));
		document.addEventListener("pointercancel", this.pointercancel.bind(this));
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
		e.preventDefault();
		//NOTE blocca lo scroll della pagina
		if (e) (e.target as HTMLElement).setPointerCapture(e.pointerId);
		if (this.isActive) this.updatePointerReaction(e, this.controller.touch.down);
	};

	private pointermove = (e: PointerEvent) => {
		e.preventDefault();

		if (this.isActive) {
			this.updatePointerReaction(e, this.controller.touch.moving, true, e.pointerId);
		}
	};

	private pointerup = (e: PointerEvent) => {
		e.preventDefault();
		if (this.isActive) {
			this.updatePointerReaction(null, this.controller.touch.down, false, e.pointerId);
			this.updatePointerReaction(null, this.controller.touch.moving, true, e.pointerId);
			this.updatePointerReaction(e, this.controller.touch.up);
		}
	};

	private pointercancel = (e: PointerEvent) => {
		e.preventDefault();
		if (this.isActive) {
			this.updatePointerReaction(null, this.controller.touch.down, false, e.pointerId);
			this.updatePointerReaction(null, this.controller.touch.moving, true, e.pointerId);
		}
	};
	//!SECTION - EVENTS FOR THE ROVER
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
