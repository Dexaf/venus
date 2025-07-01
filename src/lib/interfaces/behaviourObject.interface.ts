import { VenusRenderer } from "../renderer/venusRenderer";

export interface IBehaviourObject<T> {
	obj: T;
	key: string;
	tag?: string;
	OnAdd?(venusRenderer: VenusRenderer): void;
	OnRemove?(venusRenderer: VenusRenderer): void;
	BeforeRender?(venusRenderer: VenusRenderer, delta: number): void;
	AfterRender?(venusRenderer: VenusRenderer, delta: number): void;
}
