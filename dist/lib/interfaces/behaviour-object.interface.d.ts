import { AnimationClip, AnimationMixer } from "three";
import { VenusRenderer } from "../renderer/venus-renderer";
export interface BehaviourObjectInterface<T> {
    obj?: T;
    key: string;
    loadPath?: string;
    childrens?: BehaviourObjectChildrenInterface<T>[];
    animations?: AnimationClip[];
    animationMixer?: AnimationMixer;
    properties?: any;
    tag?: string;
    onAdd?(venusRenderer: VenusRenderer): void;
    onRemove?(venusRenderer: VenusRenderer): void;
    beforeRender?(venusRenderer: VenusRenderer, delta: number): void;
    afterRender?(venusRenderer: VenusRenderer, delta: number): void;
}
export interface BehaviourObjectChildrenInterface<T> {
    name: string;
    behaviour: BehaviourObjectInterface<T>;
}
