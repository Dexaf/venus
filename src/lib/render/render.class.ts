import * as THREE from "three";
import { IBehaviourObject } from "../interfaces/behaviourObject.interface";
import { IAudioConfig } from "../interfaces/audioConfig.interface";

export class VenusRenderer {
	private renderer: THREE.WebGLRenderer;
	public scene: THREE.Scene | null = null; //todo make accessible only by method
	private camera: THREE.Camera | null = null;
	private audioListener: THREE.AudioListener | null = null;
	private audioLoader: THREE.AudioLoader | null = null;
	private clock: THREE.Clock | null = null;
	private audios: Map<string, THREE.Audio<GainNode | PannerNode> | THREE.PositionalAudio> = new Map();
	private lights: Map<string, IBehaviourObject<THREE.Light>> = new Map();
	private objects3D: Map<string, IBehaviourObject<THREE.Object3D>> = new Map();

	private objects3DBehaviourBefore: string[] = [];
	private objects3DBehaviourAfter: string[] = [];
	private lightsBehaviourBefore: string[] = [];
	private lightsBehaviourAfter: string[] = [];

	private timeFromStart = 0;

	constructor(_renderer: THREE.WebGLRenderer, _scene: THREE.Scene) {
		this.renderer = _renderer;
		this.scene = _scene;
	}

	//SECTION - addable items
	public AddCamera = (_camera: THREE.Camera) => {
		this.camera = _camera;
	};

	//SECTION - audio
	public AddAudioListener = (_audioListener: THREE.AudioListener) => {
		if (this.camera == null) throw new Error("can't add audio listener as there's no camera");
		this.audioListener = _audioListener;
		this.audioLoader = new THREE.AudioLoader();
		this.camera.add(this.audioListener);
	};
	public AddAudio = (audioConfig: IAudioConfig) => {
		if (this.audioListener == null) throw new Error("can't add audio as there's no audio listener");

		let sound: THREE.Audio<GainNode | PannerNode> | THREE.PositionalAudio | null = null;
		//const sound = new THREE.Audio(this.audioListener);
		if (!audioConfig.positionalConfig) sound = new THREE.Audio(this.audioListener);
		else sound = new THREE.PositionalAudio(this.audioListener);

		let usedKey = audioConfig.key;
		if (usedKey == null) {
			const pathPieces = audioConfig.path.split("/");
			usedKey = pathPieces[pathPieces.length - 1].split(".")[0];
		}
		if (usedKey == null) {
			throw new Error(`can't add audio as the generated key from the path is non existent: ${audioConfig.path}`);
		}
		sound.name = usedKey;
		this.audios.set(usedKey, sound);

		this.audioLoader!.load(audioConfig.path, (buffer) => {
			sound.setBuffer(buffer);
			sound.setLoop(audioConfig.loop ?? false);
			sound.setVolume(audioConfig.volume ?? 0.5);
			if (audioConfig.playOnLoad) sound.play();
			if (sound instanceof THREE.PositionalAudio) {
				sound.setRefDistance(audioConfig.positionalConfig!.refDistance);
				if (audioConfig.positionalConfig!.meshToAttachKey) {
					const obj3D = this.GetObject3D(audioConfig.positionalConfig!.meshToAttachKey);
					if (obj3D) obj3D.obj.add(sound);
				}
			}
		});
	};
	public PlayAudio = (key: string) => {
		const audio = this.audios.get(key);
		if (!audio) throw new Error(`no audio with name ${key}`);
		audio.play;
	};
	public RemoveAudio = (key: string) => {
		const wasAudioDeleted = this.audios.delete(key);
		if (!wasAudioDeleted) throw new Error(`no audio with name ${key}`);
	};
	//!SECTION
	//SECTION - TAGS
	public GetByTag = (tag: string): IBehaviourObject<THREE.Light | THREE.Object3D>[] => {
		const array: IBehaviourObject<THREE.Light | THREE.Object3D>[] = [];
		this.objects3D.forEach((obj3d) => {
			if (obj3d.tag === tag) array.push(obj3d);
		});
		this.lights.forEach((light) => {
			if (light.tag === tag) array.push(light);
		});
		return array;
	};

	public DeleteByTag = (tag: string): IBehaviourObject<THREE.Light | THREE.Object3D>[] => {
		const array: IBehaviourObject<THREE.Light | THREE.Object3D>[] = [];
		this.objects3D.forEach((obj3d, key) => {
			if (obj3d.tag === tag) this.RemoveObject3D(key);
		});
		this.lights.forEach((light, key) => {
			if (light.tag === tag) this.RemoveLight(key);
		});
		return array;
	};
	//!SECTION
	//SECTION - LIGHTS
	public AddLights = (key: string, light: IBehaviourObject<THREE.Light>) => {
		if (this.lights.get(key) == null) {
			light.obj.name = key;
			this.lights.set(key, light);

			if (!this.scene) throw new Error("no scene was added to render");
			this.scene.add(this.lights.get(key)!.obj);
			if (light.OnAdd) light.OnAdd();

			if (light.BeforeRender) this.FlattenBehaviours(this.lightsBehaviourBefore, key);
			if (light.AfterRender) this.FlattenBehaviours(this.lightsBehaviourAfter, key);
		} else {
			throw new Error(`key already used for light ${key}`);
		}
	};
	public GetLight = (key: string): IBehaviourObject<THREE.Light> | null => {
		return this.lights.get(key) ?? null;
	};
	public ModifyLight = (key: string, light: Partial<IBehaviourObject<THREE.Light>>) => {
		const lightOrig = this.lights.get(key);
		if (!lightOrig) throw new Error(`no light with name ${key}`);

		Object.assign(lightOrig, light);
		if (light.BeforeRender) {
			this.FlattenBehaviours(this.lightsBehaviourBefore, key, true, false);
		} else {
			this.FlattenBehaviours(this.lightsBehaviourBefore, key, false, false);
		}
		if (light.AfterRender) {
			this.FlattenBehaviours(this.lightsBehaviourAfter, key, true, false);
		} else {
			this.FlattenBehaviours(this.lightsBehaviourAfter, key, false, false);
		}
	};
	public RemoveLight = (key: string) => {
		const light = this.lights.get(key);
		if (light) {
			this.lights.delete(key);
			if (light.OnRemove) light.OnRemove();

			if (light.BeforeRender) this.FlattenBehaviours(this.lightsBehaviourBefore, key, false);
			if (light.AfterRender) this.FlattenBehaviours(this.lightsBehaviourAfter, key, false);
		} else throw new Error(`no light with name ${key}`);
	};
	//!SECTION

	//SECTION - 3D OBJECTS
	public AddObject3D = (key: string, object3D: IBehaviourObject<THREE.Object3D>) => {
		if (this.objects3D.get(key) == null) {
			object3D.obj.name = key;
			this.objects3D.set(key, object3D);

			if (!this.scene) throw new Error("no scene was added to render");
			this.scene.add(this.objects3D.get(key)!.obj);
			if (object3D.OnAdd) object3D.OnAdd();

			if (object3D.BeforeRender) this.FlattenBehaviours(this.objects3DBehaviourBefore, key);
			if (object3D.AfterRender) this.FlattenBehaviours(this.objects3DBehaviourAfter, key);
		} else {
			throw new Error(`key already used for objects3D ${key}`);
		}
	};
	public GetObject3D = (key: string): IBehaviourObject<THREE.Object3D> | null => {
		return this.objects3D.get(key) ?? null;
	};
	public ModifyObject3D = (key: string, object3D: Partial<IBehaviourObject<THREE.Object3D>>) => {
		const object3DOrig = this.objects3D.get(key);
		if (!object3DOrig) throw new Error(`no object3D with name ${key}`);

		Object.assign(object3DOrig, object3D);
		if (object3D.BeforeRender) {
			this.FlattenBehaviours(this.objects3DBehaviourBefore, key, true, false);
		} else {
			this.FlattenBehaviours(this.objects3DBehaviourBefore, key, false, false);
		}
		if (object3D.AfterRender) {
			this.FlattenBehaviours(this.objects3DBehaviourAfter, key, true, false);
		} else {
			this.FlattenBehaviours(this.objects3DBehaviourAfter, key, false, false);
		}
	};
	public RemoveObject3D = (key: string) => {
		const object3D = this.objects3D.get(key);
		if (object3D) {
			this.lights.delete(key);
			if (object3D.OnRemove) object3D.OnRemove();

			if (object3D.BeforeRender) this.FlattenBehaviours(this.objects3DBehaviourBefore, key, false);
			if (object3D.AfterRender) this.FlattenBehaviours(this.objects3DBehaviourAfter, key, false);
		} else throw new Error(`no object3D with name ${key}`);
	};
	//!SECTION

	//SECTION - core
	public StartRender() {
		if (!this.scene) throw new Error("no scene was added to render");
		if (!this.camera) throw new Error("no camera was added to render");
		this.clock = new THREE.Clock();
		this.renderer.setAnimationLoop(this.Animate.bind(this));
	}

	private Animate() {
		let delta = this.clock!.getDelta();
		this.timeFromStart += delta;

		this.RunBehavioursBefore(delta);
		this.renderer.render(this.scene!, this.camera!);
		this.RunBehavioursAfter(delta);
	}

	public GetTimeFromStart() {
		return this.timeFromStart;
	}

	public ResetTimeFromStart() {
		this.timeFromStart = 0;
	}

	//SECTION - behaviours
	//we flatten the before and after behviours of ours IBehaviourObject
	private FlattenBehaviours(arrayToFlatten: string[], key: string, isAdding: boolean = true, throwError: boolean = true) {
		if (isAdding) {
			if (!arrayToFlatten.includes(key)) {
				arrayToFlatten.push(key);
			} else if (throwError) {
				throw new Error(`can't add ${key}'s before behaviour as it's already present, it may be a duplicate key`);
			}
		} else {
			const index = arrayToFlatten.findIndex((k) => k == key);
			if (index != -1) {
				arrayToFlatten.splice(index, 1);
			} else if (throwError) {
				throw new Error(`can't remove ${key}'s before behaviour as it's already present, it may already be deleted`);
			}
		}
	}

	private RunBehavioursBefore(Delta: number) {
		this.objects3DBehaviourBefore.forEach((obj3DKey) => {
			const obj = this.objects3D.get(obj3DKey);
			if (!obj) throw Error(`cant run before behaviour with key ${obj3DKey} as the obj doesnt exists`);
			if (!obj.BeforeRender) throw Error(`cant run before behaviour with key ${obj3DKey} as the method doesnt exists`);
			obj.BeforeRender(Delta);
		});

		this.lightsBehaviourBefore.forEach((lightKey) => {
			const light = this.lights.get(lightKey);
			if (!light) throw Error(`cant run before behaviour with key ${lightKey} as the light doesnt exists`);
			if (!light.BeforeRender) throw Error(`cant run before behaviour with key ${lightKey} as the method doesnt exists`);
			light.BeforeRender(Delta);
		});
	}

	private RunBehavioursAfter(Delta: number) {
		this.objects3DBehaviourAfter.forEach((obj3DKey) => {
			const obj = this.objects3D.get(obj3DKey);
			if (!obj) throw Error(`cant run after behaviour with key ${obj3DKey} as the obj doesnt exists`);
			if (!obj.AfterRender) throw Error(`cant run after behaviour with key ${obj3DKey} as the method doesnt exists`);
			obj.AfterRender(Delta);
		});

		this.lightsBehaviourAfter.forEach((lightKey) => {
			const light = this.lights.get(lightKey);
			if (!light) throw Error(`cant run after behaviour with key ${lightKey} as the light doesnt exists`);
			if (!light.AfterRender) throw Error(`cant run after behaviour with key ${lightKey} as the method doesnt exists`);
			light.AfterRender(Delta);
		});
	}
	//!SECTION
	//!SECTION
}
