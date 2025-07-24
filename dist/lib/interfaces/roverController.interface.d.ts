export interface IRoverController {
    inputs: {
        [key: string]: IRoverInput;
    };
    disabled: boolean;
    events: {
        eventType: keyof DocumentEventMap;
        event: any;
    }[];
    name: string;
}
export interface IRoverInput {
    type: "keyboard" | "pointer" | "pointermove";
    value: string;
    alias: string;
    isTapped: boolean;
    isPressed: boolean;
    event?: Event;
}
