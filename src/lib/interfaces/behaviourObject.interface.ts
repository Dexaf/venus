export interface IBehaviourObject<T> {
	obj: T;
	tag?: string;
	BeforeRender?(delta: number): void;
	AfterRender?(delta: number): void;
	OnAdd?(): void;
	OnRemove?(): void;
}
