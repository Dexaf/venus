import { Light, Object3D } from "three";
import { VenusRenderer } from "../renderer/venusRenderer";

interface IBaseBehaviour {
	key: string;
	tag?: string;
	OnAdd?(venusRenderer: VenusRenderer): void;
	OnRemove?(venusRenderer: VenusRenderer): void;
	BeforeRender?(venusRenderer: VenusRenderer, delta: number): void;
	AfterRender?(venusRenderer: VenusRenderer, delta: number): void;
}

export interface IBehaviourPrimitiveObject3D extends IBaseBehaviour{
	obj: Object3D;
}

export interface ILocatedBehaviourObject3D extends IBaseBehaviour{
	gltfPath: string;
}

export interface IBehaviourLight extends IBaseBehaviour{
	light: Light;
}
