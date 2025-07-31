import { IRoverController, IRoverInput } from "../interfaces/roverController.interface";
export declare class Rover {
    controllers: IRoverController[];
    private activeControllerIndex;
    /**
     * set the active index for the controller to use, the method will check for usability of the param and throw error if necessary
     * @param searchParam - string to search controller by name or number to assign directly the index
     */
    SetActiveController(searchParam: string | number, canvas: HTMLCanvasElement): void;
    /**
     * cleans last controller events and set up the events for the new one
     */
    private activateController;
    /**
     * bind the input and save event wrapper to remove it later
     */
    private bindKeyboardInput;
    /**
     * bind the input and save event wrapper to remove it later
     */
    private bindPointerInput;
    bindPointerMoveInput(input: IRoverInput, controller: IRoverController, canvas: HTMLCanvasElement): void;
    bindWheelInput(input: IRoverInput, controller: IRoverController, canvas: HTMLCanvasElement): void;
    /**
     * cleans all the events of the old controller
     */
    CleanController(): void;
    RemoveController(index: number): void;
    AddController(controller: IRoverController): void;
    GetActiveController(): IRoverController;
}
