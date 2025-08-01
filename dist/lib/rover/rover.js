//NOTE -  ROVER SEEMS TO BE COMPLETED BUT NEEDS TO BE TESTED MORE AS
//        CONTROLLERS ARE COMPLICATED
export class Rover {
    constructor() {
        this.controllers = [];
        //NOTE - default controller is the first one
        this.activeControllerIndex = 0;
    }
    /**
     * set the active index for the controller to use, the method will check for usability of the param and throw error if necessary
     * @param searchParam - string to search controller by name or number to assign directly the index
     */
    SetActiveController(searchParam, canvas) {
        switch (typeof searchParam) {
            case "string":
                const index = this.controllers.findIndex((c) => c.name === searchParam);
                if (index == -1)
                    throw new Error(`controller with name ${searchParam} wasn't found`);
                this.CleanController();
                this.activeControllerIndex = index;
                break;
            case "number":
                if (searchParam < 0)
                    throw new Error(`can't use negative index to set active (${searchParam}) controller`);
                if (this.controllers.length < searchParam)
                    throw new Error(`the controller index chosen (${searchParam}) is out of bound`);
                this.CleanController();
                this.activeControllerIndex = searchParam;
                break;
        }
        this.activateController(canvas);
    }
    /**
     * cleans last controller events and set up the events for the new one
     */
    activateController(canvas) {
        //wire up the new commands
        //NOTE -  no need to check if the controller is undefined, the active index is
        //        checked on activation
        const controller = this.controllers[this.activeControllerIndex];
        const keys = Object.keys(controller.inputs);
        for (let i = 0; i < keys.length; i++) {
            const input = controller.inputs[keys[i]];
            switch (input.type) {
                case "keyboard":
                    this.bindKeyboardInput(input, controller);
                    break;
                case "pointer":
                    this.bindPointerInput(input, controller, canvas);
                    break;
                case "pointerMove":
                    this.bindPointerMoveInput(input, controller, canvas);
                    break;
                case "wheel":
                    this.bindWheelInput(input, controller, canvas);
                    break;
            }
        }
    }
    /**
     * bind the input and save event wrapper to remove it later
     */
    bindKeyboardInput(input, controller) {
        const keyDown = (e) => {
            if (e.key == input.value) {
                input.isTapped = true;
            }
        };
        const keyRelease = (e) => {
            if (e.key == input.value) {
                input.isTapped = false;
            }
        };
        document.addEventListener("keydown", keyDown);
        document.addEventListener("keyup", keyRelease);
        controller.events.push({ eventType: "keydown", event: keyDown });
        controller.events.push({ eventType: "keyup", event: keyRelease });
    }
    /**
     * bind the input and save event wrapper to remove it later
     */
    bindPointerInput(input, controller, canvas) {
        const pointerDown = (e) => {
            input.isTapped = true;
            input.event = e;
        };
        const pointerUp = (e) => {
            input.isTapped = false;
            input.event = undefined;
        };
        canvas.addEventListener("pointerdown", pointerDown);
        canvas.addEventListener("pointerup", pointerUp);
        controller.events.push({ eventType: "pointerdown", event: pointerDown });
        controller.events.push({ eventType: "pointerup", event: pointerUp });
    }
    bindPointerMoveInput(input, controller, canvas) {
        let previousPositionX = null;
        let previousPositionY = null;
        const pointerMoveDown = (e) => {
            //INIT
            if (previousPositionY == null)
                previousPositionY = e.clientY;
            if (previousPositionX == null)
                previousPositionX = e.clientX;
            const deltaY = e.clientY - previousPositionY;
            const deltaX = e.clientX - previousPositionX;
            if (deltaY != 0 || deltaX != 0) {
                input.isTapped = true;
                input.event = e;
            }
            else {
                input.isTapped = false;
                input.event = undefined;
            }
            //UPDATE FOR NEXT ITERATION
            previousPositionY = e.clientY;
            previousPositionX = e.clientX;
        };
        canvas.addEventListener("pointermove", pointerMoveDown);
        controller.events.push({ eventType: "pointermove", event: pointerMoveDown });
    }
    bindWheelInput(input, controller, canvas) {
        let timeoutCode;
        const wheeling = (e) => {
            input.isTapped = true;
            input.event = e;
            if (timeoutCode) {
                clearTimeout(timeoutCode);
            }
            timeoutCode = setTimeout(() => {
                input.isTapped = false;
                input.event = undefined;
                timeoutCode = null;
            }, 20);
        };
        canvas.addEventListener("wheel", wheeling);
        controller.events.push({ eventType: "wheel", event: wheeling });
    }
    /**
     * cleans all the events of the old controller
     */
    CleanController() {
        const controller = this.controllers[this.activeControllerIndex];
        for (let i = 0; i < controller.events.length; i++) {
            const eventObj = controller.events[i];
            document.removeEventListener(eventObj.eventType, eventObj.event);
        }
    }
    RemoveController(index) {
        if (index > this.controllers.length)
            throw new Error(`can't remove controller as index ${index} is out of bound`);
        if (index == this.activeControllerIndex) {
            this.CleanController();
            this.controllers.splice(index, 1);
            //reset to have a predicatble behaviour
            this.activeControllerIndex = 0;
        }
        else {
            //adjust the active index to avoid weird cleans later
            if (this.activeControllerIndex > index)
                this.activeControllerIndex--;
            this.controllers.splice(index, 1);
        }
    }
    AddController(controller) {
        this.controllers.push(controller);
    }
    GetActiveController() {
        return this.controllers[this.activeControllerIndex];
    }
}
