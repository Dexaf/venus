import { Light } from "three";

export interface ILocatedBehaviourObject3D {
	gltfPath: string;
	key: string;
	tag?: string;
	BeforeRender?(delta: number): void;
	AfterRender?(delta: number): void;
	OnAdd?(): void;
	OnRemove?(): void;
}

export interface IBehaviourLight {
	light: Light;
	key: string;
	tag?: string;
	BeforeRender?(delta: number): void;
	AfterRender?(delta: number): void;
	OnAdd?(): void;
	OnRemove?(): void;
}