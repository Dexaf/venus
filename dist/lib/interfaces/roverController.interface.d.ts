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
    type: "keyboard" | "pointer";
    value: string;
    alias: string;
    isTapped: boolean;
    event?: Event;
}
