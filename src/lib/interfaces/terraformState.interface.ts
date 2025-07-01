import { IBehaviourLight, ILocatedBehaviourObject3D, IBehaviourPrimitiveObject3D } from "./terraformObjects.interface";
import * as THREE from "three";
import { IAudioConfig } from "./audioConfig.interface";

export interface ITerraformState {
	camera: THREE.Camera;
	objects: (IBehaviourPrimitiveObject3D | ILocatedBehaviourObject3D)[];
	lights: IBehaviourLight[];
	audios: IAudioConfig[];
}
