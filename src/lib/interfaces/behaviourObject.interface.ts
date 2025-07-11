import { AnimationClip, AnimationMixer } from "three";
import { VenusRenderer } from "../renderer/venusRenderer";

export interface IBehaviourObject<T, Y> {
	obj?: T;
	key: string;
	loadPath?: string;
	animations?: AnimationClip[];
	properties?: Y;
	animationMixer?: AnimationMixer;
	tag?: string;
	OnAdd?(venusRenderer: VenusRenderer): void;
	OnRemove?(venusRenderer: VenusRenderer): void;
	BeforeRender?(venusRenderer: VenusRenderer, delta: number): void;
	AfterRender?(venusRenderer: VenusRenderer, delta: number): void;
}
