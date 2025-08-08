import { VenusRenderer } from "../renderer/venus-renderer";
export interface BehaviourProcessInterface {
    key: string;
    onAdd?(venusRenderer: VenusRenderer): void;
    onRemove?(venusRenderer: VenusRenderer): void;
    beforeRender?(venusRenderer: VenusRenderer, delta: number): void;
    afterRender?(venusRenderer: VenusRenderer, delta: number): void;
}
