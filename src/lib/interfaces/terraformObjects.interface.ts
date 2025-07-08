import { Light, Object3D } from "three";
import { VenusRenderer } from "../renderer/venusRenderer";

interface IBaseBehaviour<Y> {
	key: string;
	tag?: string;
	properties?: Y;
	OnAdd?(venusRenderer: VenusRenderer): void;
	OnRemove?(venusRenderer: VenusRenderer): void;
	BeforeRender?(venusRenderer: VenusRenderer, delta: number): void;
	AfterRender?(venusRenderer: VenusRenderer, delta: number): void;
}

export interface IBehaviourPrimitiveObject3D extends IBaseBehaviour<any> {
	obj: Object3D;
}

export interface ILocatedBehaviourObject3D extends IBaseBehaviour<any> {
	gltfPath: string;
}

export interface IBehaviourLight extends IBaseBehaviour<any> {
	light: Light;
}
