import { AnimationMixer } from "three";
import { VenusRenderer } from "../renderer/venusRenderer";

export interface IBehaviourObject<T> {
	obj: T;
	key: string;
  animationMixer?: AnimationMixer; 
	tag?: string;
	OnAdd?(venusRenderer: VenusRenderer): void;
	OnRemove?(venusRenderer: VenusRenderer): void;
	BeforeRender?(venusRenderer: VenusRenderer, delta: number): void;
	AfterRender?(venusRenderer: VenusRenderer, delta: number): void;
}
