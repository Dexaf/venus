import * as THREE from "three";
import { AudioConfigInterface } from "./audio-config.interface";
import { BehaviourObjectInterface } from "./behaviour-object.interface";
import { Object3D, Light } from "three";
import { Rover } from "../rover/rover";
import { BehaviourProcessInterface } from "./behaviour-process.interface";

export interface TerraformStateInterface {
	camera?: THREE.Camera;
	objects: BehaviourObjectInterface<Object3D>[];
	lights: BehaviourObjectInterface<Light>[];
	processes: BehaviourProcessInterface[];
	audios: AudioConfigInterface[];
	roverConfig: {
		rover: Rover[];
		activeController: string | null;
	};
}
