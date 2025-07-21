import { AnimationClip, AnimationMixer } from "three";
import { VenusRenderer } from "../renderer/venusRenderer";

export interface IBehaviourObject<T, Y> {
	obj?: T;
	key: string;
	loadPath?: string;
  childrens?: IBehaviourObjectChildren<T>[];
	animations?: AnimationClip[];
	animationMixer?: AnimationMixer;
	properties?: Y;
	tag?: string;
	OnAdd?(venusRenderer: VenusRenderer): void;
	OnRemove?(venusRenderer: VenusRenderer): void;
	BeforeRender?(venusRenderer: VenusRenderer, delta: number): void;
	AfterRender?(venusRenderer: VenusRenderer, delta: number): void;
}

export interface IBehaviourObjectChildren<T> {
  name: string,
  behaviour: IBehaviourObject<T, any>,
}