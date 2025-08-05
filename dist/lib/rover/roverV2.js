export class Rover {
    constructor() {
        this.controller = null;
        /**
         * if false it stops the controller events from doing anything, updating or firing reactions
         */
        this.isActive = false;
        //SECTION - EVENTS FOR THE ROVER
        //KEYBOARD INPUT
        this.keypress = (e) => {
            if (this.isActive) {
                this.controller.keys.pressed.input = e.key;
                this.reactionHandling(this.controller.keys.pressed.reactions);
            }
        };
        this.keydown = (e) => {
            if (this.isActive) {
                this.controller.keys.holded.input[e.key] = true;
                this.reactionHandling(this.controller.keys.holded.reactions);
            }
        };
        this.keyup = (e) => {
            if (this.isActive) {
                delete this.controller.keys.holded.input[e.key];
                if (this.controller.keys.pressed.input == e.key)
                    this.controller.keys.pressed.input = "";
                this.controller.keys.released.input = e.key;
                this.reactionHandling(this.controller.keys.released.reactions);
                //NOTE - maybe we should reset the input for released
            }
        };
        //POINTER INPUT
        this.pointerdown = (e) => {
            if (this.isActive) {
                this.updatePointerReaction(e, e.pointerId, this.controller.touch.down);
            }
        };
        this.pointermove = (e) => {
            if (this.isActive) {
                this.updatePointerReaction(e, e.pointerId, this.controller.touch.moving);
            }
        };
        this.pointerup = (e) => {
            if (this.isActive) {
                this.updatePointerReaction(null, e.pointerId, this.controller.touch.down, false);
                this.updatePointerReaction(e, e.pointerId, this.controller.touch.up);
            }
        };
        /**
         * @param reactions
         * @description activates all the reactions
         */
        this.reactionHandling = (reactions) => {
            reactions.forEach((r) => {
                r.reaction();
            });
        };
        //!SECTION - UTILS
    }
    /**
     * @param canvas the canvas of the working render
     * @description resets the inputs and activate the event listeners to trigger the events of the controller.
     * you need to pass a controller to this object first
     */
    initialize(canvas) {
        if (this.controller == null) {
            console.log("trying to initialize empty controller");
            return;
        }
        this.resetControllerInputs();
        // SINGLE INPUT
        document.addEventListener("keypress", this.keypress.bind(this));
        canvas.addEventListener("pointerdown", this.pointerdown.bind(this));
        canvas.addEventListener("pointermove", this.pointermove.bind(this));
        // PARALLEL INPUT
        document.addEventListener("keydown", this.keydown.bind(this));
        // RESETS
        document.addEventListener("keyup", this.keyup.bind(this));
        canvas.addEventListener("pointerup", this.pointerup.bind(this));
        this.isActive = true;
    }
    /**
     * @param canvas the canvas of the working render
     * @description resets the inputs of the controller.
     * you need to pass a controller to this object first
     */
    resetControllerInputs() {
        if (this.controller == null) {
            console.log("trying to reset null controller");
            return;
        }
        this.controller.keys.holded.input = {};
        this.controller.keys.pressed.input = "";
        this.controller.keys.released.input = "";
        this.controller.touch.down.forEach((tir) => (tir.event = null));
        this.controller.touch.up.forEach((tir) => (tir.event = null));
        this.controller.touch.moving.forEach((tir) => (tir.event = null));
    }
    /**
     *
     * @param canvas the canvas of the working render
     * @description stops the controller by removing the events, the value of the controller won't be updated anymore.
     * you need to pass a controller to this object first
     */
    stop(canvas) {
        if (this.controller == null) {
            console.log("trying to stop null controller");
            return;
        }
        this.isActive = false;
        // SINGLE INPUT
        document.removeEventListener("keypress", this.keypress.bind(this));
        canvas.removeEventListener("pointerdown", this.pointerdown.bind(this));
        canvas.removeEventListener("pointermove", this.pointermove.bind(this));
        // PARALLEL INPUT
        document.removeEventListener("keydown", this.keydown.bind(this));
        // RESETS
        document.removeEventListener("keyup", this.keyup.bind(this));
        canvas.removeEventListener("pointerup", this.pointerup.bind(this));
    }
    //!SECTION - EVENTS FOR THE ROVER
    //SECTION - UTILS
    /**
     * @param event: current PointerEvent or null to use for the update
     * @param pointerId: the pointer Id we are updating (needed for mobile)
     * @param pointerArray: the pointer array where to look for the update, based on the event
     * @param isReacting: (default is true) if the update should trigger an update for the reactions
     * @description find the pointerId to update with the new event/null and check if need to trigger the reaction
     */
    updatePointerReaction(event, pointerId, pointerArray, isReacting = true) {
        const pointerIdIndex = pointerArray.findIndex((ir) => ir.pointerId == pointerId);
        if (pointerIdIndex == -1) {
            console.error("this kind of pointerId is not supported, we reach till 5");
        }
        else {
            pointerArray[pointerIdIndex].event = event;
            if (isReacting)
                this.reactionHandling(pointerArray[pointerIdIndex].reactions);
        }
    }
}
