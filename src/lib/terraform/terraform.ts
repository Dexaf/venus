import { GLTFLoader } from "three/examples/jsm/Addons";
import { ITerraformState } from "../interfaces/terraformState.interface";
import { IBehaviourObject } from "../interfaces/behaviourObject.interface";
import { SetupRenderer } from "../renderer/setupRenderer";
import { VenusRenderer } from "../renderer/venusRenderer";
import { AudioListener, Light, Object3D } from "three";
import { IBehaviourLight, ILocatedBehaviourObject3D, IBehaviourPrimitiveObject3D } from "../interfaces/terraformObjects.interface";

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
		//CAMERA
		this._venusRenderer!.AddCamera(this._currentState!.camera);

		//3D OBJS
		{
			const gltfLoader = new GLTFLoader();
			for (let i = 0; i < this._currentState!.objects.length; i++) {
				if (this._currentState!.objects[i]) this.loadObj3D(this._currentState!.objects[i], gltfLoader);
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
	}

	private loadObj3D(locatedBehaviourObject3D: IBehaviourPrimitiveObject3D | ILocatedBehaviourObject3D, gltfLoader: GLTFLoader) {
		if ((locatedBehaviourObject3D as ILocatedBehaviourObject3D).gltfPath !== undefined)
			gltfLoader.loadAsync((locatedBehaviourObject3D as ILocatedBehaviourObject3D).gltfPath).then((gltf) => {
				const obj3D: IBehaviourObject<Object3D> = {
					obj: gltf.scene,
					animations: gltf.animations,
					properties: locatedBehaviourObject3D.properties,
					key: locatedBehaviourObject3D.key,
					tag: locatedBehaviourObject3D.tag,
					BeforeRender: locatedBehaviourObject3D.BeforeRender,
					AfterRender: locatedBehaviourObject3D.AfterRender,
					OnAdd: locatedBehaviourObject3D.OnAdd,
					OnRemove: locatedBehaviourObject3D.OnRemove,
				};

				this._venusRenderer!.AddObject3D(obj3D);
			});
		else {
			const obj3D: IBehaviourObject<Object3D> = {
				obj: (locatedBehaviourObject3D as IBehaviourPrimitiveObject3D).obj,
				properties: locatedBehaviourObject3D.properties,
				key: locatedBehaviourObject3D.key,
				tag: locatedBehaviourObject3D.tag,
				BeforeRender: locatedBehaviourObject3D.BeforeRender,
				AfterRender: locatedBehaviourObject3D.AfterRender,
				OnAdd: locatedBehaviourObject3D.OnAdd,
				OnRemove: locatedBehaviourObject3D.OnRemove,
			};

			this._venusRenderer!.AddObject3D(obj3D);
		}
	}

	private loadLight(behaviourLight: IBehaviourLight) {
		const light: IBehaviourObject<Light> = {
			obj: behaviourLight.light,
			properties: behaviourLight.properties,
			key: behaviourLight.key,
			tag: behaviourLight.tag,
			BeforeRender: behaviourLight.BeforeRender,
			AfterRender: behaviourLight.AfterRender,
			OnAdd: behaviourLight.OnAdd,
			OnRemove: behaviourLight.OnRemove,
		};

		this._venusRenderer!.AddLights(light);
	}
}
