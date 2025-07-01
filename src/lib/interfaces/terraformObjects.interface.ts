import { Light } from "three";
import { VenusRenderer } from "../renderer/venusRenderer";

export interface ILocatedBehaviourObject3D {
	gltfPath: string;
	key: string;
	tag?: string;
	OnAdd?(venusRenderer: VenusRenderer): void;
	OnRemove?(venusRenderer: VenusRenderer): void;
	BeforeRender?(venusRenderer: VenusRenderer, delta: number): void;
	AfterRender?(venusRenderer: VenusRenderer, delta: number): void;
}
export interface IBehaviourLight {
	light: Light;
	key: string;
	tag?: string;
	OnAdd?(venusRenderer: VenusRenderer): void;
	OnRemove?(venusRenderer: VenusRenderer): void;
	BeforeRender?(venusRenderer: VenusRenderer, delta: number): void;
	AfterRender?(venusRenderer: VenusRenderer, delta: number): void;
}
