import { GLTFLoader } from "three/examples/jsm/Addons";
import { ITerraformState } from "../interfaces/terraformState.interface";
import { IBehaviourObject, IBehaviourObjectChildren } from "../interfaces/behaviourObject.interface";
import { SetupRenderer } from "../renderer/setupRenderer";
import { VenusRenderer } from "../renderer/venusRenderer";
import { AudioListener, Light, Object3D, Object3DEventMap } from "three";

export class Terraform {
	private _currentState: ITerraformState | null = null;
	private _venusRenderer: VenusRenderer | null = null;

	constructor(state?: ITerraformState, venusRenderer?: VenusRenderer) {
		if (venusRenderer) this._venusRenderer = venusRenderer;
		if (state) this._currentState = state;
	}

	LoadState(state: ITerraformState) {
		this._currentState = state;
	}

	LoadRenderer(htmlContainerId: string): VenusRenderer {
		if (this._currentState == null) throw new Error("the state of this instance of terraform is null");

		const rendererContainer = document.getElementById(htmlContainerId);
		if (!rendererContainer) throw new Error(`the html container with id ${htmlContainerId} is null`);

		this._venusRenderer = SetupRenderer(rendererContainer);
		if (!this._venusRenderer) throw new Error(`the renderer couldn't be launched`);

		this.applyState();

		return this._venusRenderer;
	}

	SetRenderer(venusRenderer: VenusRenderer) {
		this._venusRenderer = venusRenderer;
	}

	ApplyStateToRenderer() {
		if (this._currentState == null) throw new Error("the state of this instance of terraform is null");
		if (!this._venusRenderer) throw new Error(`the renderer couldn't be launched`);
		this.applyState();
	}

	private applyState() {
		if (this._currentState!.camera == null) throw new Error("camera is obbligatory, in the interface it was left as optional to let the developer add one later with the height and width of the html container");
		//CAMERA
		this._venusRenderer!.AddCamera(this._currentState!.camera);

		//3D OBJS
		{
			const gltfLoader = new GLTFLoader();
			let currObj;
			for (let i = 0; i < this._currentState!.objects.length; i++) {
				currObj = this._currentState!.objects[i];
				if (currObj) {
					this.loadObj3D(currObj, gltfLoader);
				}
			}
		}

		//LIGHTS
		for (let i = 0; i < this._currentState!.lights.length; i++) {
			this.loadLight(this._currentState!.lights[i]);
		}

		//SOUNDS
		if (this._currentState!.audios.length > 1) {
			this._venusRenderer!.AddAudioListener(new AudioListener());
			for (let i = 0; i < this._currentState!.audios.length; i++) {
				this._venusRenderer!.AddAudio(this._currentState!.audios[i]);
			}
		}

		//ROVER
		if (this._currentState!.roverConfig.rover != null) {
			this._venusRenderer!.DeployRover(this._currentState!.roverConfig.rover);
			if (this._currentState!.roverConfig.activeController != null) {
				this._venusRenderer!.ActivateRoverController(this._currentState!.roverConfig.activeController);
			}
		}
	}

	private loadObj3D(behaviourObject3D: IBehaviourObject<Object3D, any>, gltfLoader: GLTFLoader) {
		if (behaviourObject3D.loadPath !== undefined)
			gltfLoader.loadAsync(behaviourObject3D.loadPath).then((gltf) => {
				behaviourObject3D.obj = gltf.scene;
				behaviourObject3D.obj.animations = gltf.animations;
				this._venusRenderer!.AddObject3D(behaviourObject3D);

				//NOTE - we have load the child here because the load is async
				if (behaviourObject3D.childrens != undefined) {
					for (let j = 0; j < behaviourObject3D.childrens.length; j++) {
						this.loadChildren(behaviourObject3D, behaviourObject3D.childrens[j], gltfLoader);
					}
				}
			});
		else {
			this._venusRenderer!.AddObject3D(behaviourObject3D);

			if (behaviourObject3D.childrens != undefined) {
				for (let j = 0; j < behaviourObject3D.childrens.length; j++) {
					this.loadChildren(behaviourObject3D, behaviourObject3D.childrens[j], gltfLoader);
				}
			}
		}
	}

	private loadChildren(currObj: IBehaviourObject<Object3D<Object3DEventMap>, any>, child: IBehaviourObjectChildren<Object3D<Object3DEventMap>>, gltfLoader: GLTFLoader) {
		currObj.obj?.traverse((t) => {
			if (t.name == child.name) {
				child.behaviour.obj = t;
				this._venusRenderer!.AddObject3D(child.behaviour);
			}
		});
	}

	private loadLight(behaviourLight: IBehaviourObject<Light, any>) {
		this._venusRenderer!.AddLights(behaviourLight);
	}
}
