import * as THREE from "three";
import { IAudioConfig } from "./audioConfig.interface";
import { IBehaviourObject } from "./behaviourObject.interface";
import { Object3D, Light } from "three";
import { Rover } from "../rover/rover";

export interface ITerraformState {
	camera?: THREE.Camera;
	objects: IBehaviourObject<Object3D, any>[];
	lights: IBehaviourObject<Light, any>[];
	audios: IAudioConfig[];
	roverConfig: {
		rover: Rover[];
		activeController: string | null;
	};
}
