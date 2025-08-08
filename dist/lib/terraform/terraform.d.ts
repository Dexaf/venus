import { VenusRenderer } from "../renderer/venus-renderer";
import { TerraformStateInterface } from "../interfaces/terraform-state.interface";
export declare class Terraform {
    private _currentState;
    private _venusRenderer;
    constructor(state?: TerraformStateInterface, venusRenderer?: VenusRenderer);
    loadState(state: TerraformStateInterface): void;
    loadRenderer(htmlContainerId: string): VenusRenderer;
    setRenderer(venusRenderer: VenusRenderer): void;
    applyStateToRenderer(): void;
    private applyState;
    private loadObj3D;
    private loadChildren;
    private loadLight;
}
