import { RoverControllerInterface } from "../interfaces/rover-controller.interface";
export declare class Rover {
    controller: RoverControllerInterface | null;
    /**
     * if false it stops the controller events from doing anything, updating or firing reactions
     */
    isActive: boolean;
    /**
     * @param canvas the canvas of the working render
     * @description resets the inputs and activate the event listeners to trigger the events of the controller.
     * you need to pass a controller to this object first
     */
    initialize(canvas: HTMLCanvasElement): void;
    /**
     * @param canvas the canvas of the working render
     * @description resets the inputs of the controller.
     * you need to pass a controller to this object first
     */
    resetControllerInputs(): void;
    /**
     *
     * @param canvas the canvas of the working render
     * @description stops the controller by removing the events, the value of the controller won't be updated anymore.
     * you need to pass a controller to this object first
     */
    stop(canvas: HTMLCanvasElement): void;
    private keypress;
    private keydown;
    private keyup;
    private pointerdown;
    private pointermove;
    private pointerup;
    /**
     * @param event: current PointerEvent or null to use for the update
     * @param pointerId: the pointer Id we are updating (needed for mobile)
     * @param pointerArray: the pointer array where to look for the update, based on the event
     * @param isReacting: (default is true) if the update should trigger an update for the reactions
     * @description find the pointerId to update with the new event/null and check if need to trigger the reaction
     */
    private updatePointerReaction;
    /**
     * @param reactions
     * @description activates all the reactions
     */
    private reactionHandling;
}
