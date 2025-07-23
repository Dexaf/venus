import { ITerraformState } from "../interfaces/terraformState.interface";
import { VenusRenderer } from "../renderer/venusRenderer";
export declare class Terraform {
    private _currentState;
    private _venusRenderer;
    constructor(state?: ITerraformState, venusRenderer?: VenusRenderer);
    LoadState(state: ITerraformState): void;
    LoadRenderer(htmlContainerId: string): VenusRenderer;
    SetRenderer(venusRenderer: VenusRenderer): void;
    ApplyStateToRenderer(): void;
    private applyState;
    private loadObj3D;
    private loadChildren;
    private loadLight;
}
