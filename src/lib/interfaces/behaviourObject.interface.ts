import { AnimationClip, AnimationMixer } from "three";
import { VenusRenderer } from "../renderer/venusRenderer";

export interface IBehaviourObject<T, Y> {
	obj: T;
	animations?: AnimationClip[];
	properties?: Y;
	key: string;
	animationMixer?: AnimationMixer;
	tag?: string;
	OnAdd?(venusRenderer: VenusRenderer): void;
	OnRemove?(venusRenderer: VenusRenderer): void;
	BeforeRender?(venusRenderer: VenusRenderer, delta: number): void;
	AfterRender?(venusRenderer: VenusRenderer, delta: number): void;
}
