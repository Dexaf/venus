import { IBehaviourLight, ILocatedBehaviourObject3D } from "./terraformObjects.interface";
import * as THREE from "three";
import { IAudioConfig } from "./audioConfig.interface";

export interface ITerraformState {
	camera: THREE.Camera;
	objects: ILocatedBehaviourObject3D[];
	lights: IBehaviourLight[];
	audios: IAudioConfig[];
}
