import { RoverControllerInterface } from "../interfaces/rover-controller.interface";
export declare class Rover {
    controller: RoverControllerInterface;
    /**
     * if false it stops the controller events from doing anything, updating or firing reactions
     */
    isActive: boolean;
    private _keypressHandler?;
    private _keydownHandler?;
    private _keyupHandler?;
    private _pointerdownHandler?;
    private _pointermoveHandler?;
    private _pointerupHandler?;
    private _pointercancelHandler?;
    private _wheelHandler?;
    private _touchmoveHandler?;
    /**
     * @param canvas the canvas of the working render
     * @description resets the inputs and activate the event listeners to trigger the events of the controller.
     * you need to pass a controller to this object first
     */
    initialize(canvas: HTMLCanvasElement): void;
    /**
     * @description resets the inputs of the controller.
     * you need to pass a controller to this object first
     */
    private resetControllerInputs;
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
    private pointercancel;
    private wheeluse;
    /**
     * @param event: current PointerEvent or null to use for the update
     * @param touchInterface: the touch we are working with
     * @param isReacting: (default is true) if the update should trigger an update for the reactions
     * @param pointerId: (default is null) the pointer id of an event, need in mobile
     * @description find the pointerId to update with the new event/null and check if needed to trigger the reaction
     */
    private updatePointerReaction;
    /**
     * @param reactions
     * @param event
     * @description activates all the reactions
     */
    private touchReactionHandling;
    /**
     * @param reactions
     * @description activates all the reactions
     */
    private reactionHandling;
}
