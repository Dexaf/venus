import * as THREE from "three";
import { IBehaviourObject } from "../interfaces/behaviourObject.interface";
import { IAudioConfig } from "../interfaces/audioConfig.interface";

export class VenusRenderer {
	// Three.js WebGL renderer instance
	private renderer: THREE.WebGLRenderer;

	// Scene to render
	private scene: THREE.Scene | null = null;

	// Camera used for rendering
	public camera: THREE.Camera | null = null;

	// Maps for global vars of scene
	public sceneState: Map<string, any> = new Map();

	// Audio components
	private audioListener: THREE.AudioListener | null = null;
	private audioLoader: THREE.AudioLoader | null = null;
	private audios: Map<string, THREE.Audio<GainNode | PannerNode> | THREE.PositionalAudio> = new Map();

	// Maps for lights and 3D objects with behavior interfaces
	private lights: Map<string, IBehaviourObject<THREE.Light>> = new Map();
	private objects3D: Map<string, IBehaviourObject<THREE.Object3D>> = new Map();

	// Arrays of keys to track before/after render callbacks
	private objects3DBehaviourBefore: string[] = [];
	private objects3DBehaviourAfter: string[] = [];
	private lightsBehaviourBefore: string[] = [];
	private lightsBehaviourAfter: string[] = [];

	// Time elapsed since rendering started
	private timeFromStart = 0;
	private clock: THREE.Clock | null = null;

	constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene) {
		this.renderer = renderer;
		this.scene = scene;
	}

	//===============================
	// SECTION: Camera
	//===============================
	/** Assigns the camera to be used for rendering */
	public AddCamera = (camera: THREE.Camera) => {
		this.camera = camera;
	};

	/** Modifies current camera parameters */
	public ModifyCamera = (cameraPartial: Partial<THREE.Camera>) => {
		if (this.camera == null) {
			throw new Error("can't modify camera as there's no camera");
		}

		this.camera = {
			...cameraPartial,
			...this.camera,
		} as THREE.Camera;
	};

	//===============================
	// SECTION: Audio
	//===============================
	/** Attaches an audio listener to the camera (camera must be set first) */
	public AddAudioListener = (audioListener: THREE.AudioListener) => {
		if (this.camera == null) {
			throw new Error("can't add audio listener as there's no camera");
		}
		this.audioListener = audioListener;
		this.audioLoader = new THREE.AudioLoader();
		this.camera.add(this.audioListener);
	};

	/**
	 * Creates and configures an audio source.
	 * Chooses positional or non-positional audio based on config.
	 * Generates a key from the file path if not provided.
	 */
	public AddAudio = (audioConfig: IAudioConfig) => {
		if (this.audioListener == null) {
			throw new Error("can't add audio as there's no audio listener");
		}

		let sound: THREE.Audio<GainNode | PannerNode> | THREE.PositionalAudio;
		if (!audioConfig.positionalConfig) {
			sound = new THREE.Audio(this.audioListener);
		} else {
			sound = new THREE.PositionalAudio(this.audioListener);
		}

		// Determine key to store this audio
		let usedKey = audioConfig.key;
		if (usedKey == null) {
			const pathSegments = audioConfig.path.split("/");
			usedKey = pathSegments[pathSegments.length - 1].split(".")[0];
		}
		if (usedKey == null) {
			throw new Error(`can't add audio as generated key is invalid: ${audioConfig.path}`);
		}

		sound.name = usedKey;
		this.audios.set(usedKey, sound);

		// Load the audio buffer and apply settings
		this.audioLoader!.load(audioConfig.path, (buffer) => {
			sound.setBuffer(buffer);
			sound.setLoop(audioConfig.loop ?? false);
			sound.setVolume(audioConfig.volume ?? 0.5);
			if (audioConfig.playOnLoad) sound.play();

			// Additional setup for positional audio
			if (sound instanceof THREE.PositionalAudio) {
				sound.setRefDistance(audioConfig.positionalConfig!.refDistance);
				if (audioConfig.positionalConfig!.meshToAttachKey) {
					const obj3D = this.GetObject3D(audioConfig.positionalConfig!.meshToAttachKey);
					if (obj3D) obj3D.obj.add(sound);
				}
			}
		});
	};

	/** Plays the audio associated with the given key */
	public PlayAudio = (key: string) => {
		const audio = this.audios.get(key);
		if (!audio) {
			throw new Error(`no audio with name ${key}`);
		}
		audio.play();
	};

	/** Removes and disposes of the audio resource by key */
	public RemoveAudio = (key: string) => {
		const removed = this.audios.delete(key);
		if (!removed) {
			throw new Error(`no audio with name ${key}`);
		}
	};

	//===============================
	// SECTION: Tagging
	//===============================
	/** Returns all lights and objects that match the specified tag */
	public GetByTag = (tag: string): IBehaviourObject<THREE.Light | THREE.Object3D>[] => {
		const result: IBehaviourObject<THREE.Light | THREE.Object3D>[] = [];
		this.objects3D.forEach((obj) => {
			if (obj.tag === tag) result.push(obj);
		});
		this.lights.forEach((light) => {
			if (light.tag === tag) result.push(light);
		});
		return result;
	};

	/** Deletes all lights and objects associated with the specified tag */
	public DeleteByTag = (tag: string): IBehaviourObject<THREE.Light | THREE.Object3D>[] => {
		this.objects3D.forEach((obj, key) => {
			if (obj.tag === tag) this.RemoveObject3D(key);
		});
		this.lights.forEach((light, key) => {
			if (light.tag === tag) this.RemoveLight(key);
		});
		return [];
	};

	//===============================
	// SECTION: Lights
	//===============================
	/** Adds a light with behaviour hooks */
	public AddLights = (light: IBehaviourObject<THREE.Light>) => {
		if (this.lights.has(light.key)) {
			throw new Error(`key already used for light ${light.key}`);
		}

		light.obj.name = light.key;
		this.lights.set(light.key, light);

		if (!this.scene) {
			throw new Error("no scene was added to render");
		}
		this.scene.add(light.obj);
		if (light.OnAdd) light.OnAdd(this);

		// Register before/after render callbacks if present
		if (light.BeforeRender) this.FlattenBehaviours(this.lightsBehaviourBefore, light.key);
		if (light.AfterRender) this.FlattenBehaviours(this.lightsBehaviourAfter, light.key);
	};

	/** Retrieves a light behaviour object by key */
	public GetLight = (key: string): IBehaviourObject<THREE.Light> | null => {
		return this.lights.get(key) ?? null;
	};

	/** Modifies properties or callbacks of a given light */
	public ModifyLight = (key: string, light: Partial<IBehaviourObject<THREE.Light>>) => {
		const orig = this.lights.get(key);
		if (!orig) throw new Error(`no light with name ${key}`);

		Object.assign(orig, light);

		// Update before/after render registration
		this.FlattenBehaviours(this.lightsBehaviourBefore, key, !!light.BeforeRender, false);
		this.FlattenBehaviours(this.lightsBehaviourAfter, key, !!light.AfterRender, false);
	};

	/** Removes a light and its render callbacks */
	public RemoveLight = (key: string) => {
		const light = this.lights.get(key);
		if (!light) throw new Error(`no light with name ${key}`);

		if (light.OnRemove) light.OnRemove(this);
		this.lights.delete(key);

		this.FlattenBehaviours(this.lightsBehaviourBefore, key, false);
		this.FlattenBehaviours(this.lightsBehaviourAfter, key, false);
	};

	//===============================
	// SECTION: 3D Objects
	//===============================
	/** Adds a 3D object with behaviour hooks */
	public AddObject3D = (object3D: IBehaviourObject<THREE.Object3D>) => {
		if (this.objects3D.has(object3D.key)) {
			throw new Error(`key already used for objects3D ${object3D.key}`);
		}

		object3D.obj.name = object3D.key;
		this.objects3D.set(object3D.key, object3D);

		if (!this.scene) {
			throw new Error("no scene was added to render");
		}
		this.scene.add(object3D.obj);
		if (object3D.OnAdd) object3D.OnAdd(this);

		if (object3D.BeforeRender) this.FlattenBehaviours(this.objects3DBehaviourBefore, object3D.key);
		if (object3D.AfterRender) this.FlattenBehaviours(this.objects3DBehaviourAfter, object3D.key);
	};

	/** Retrieves a 3D object behaviour by key */
	public GetObject3D = (key: string): IBehaviourObject<THREE.Object3D> | null => {
		return this.objects3D.get(key) ?? null;
	};

	/** Modifies a 3D object’s properties or callbacks */
	public ModifyObject3D = (key: string, object3D: Partial<IBehaviourObject<THREE.Object3D>>) => {
		const orig = this.objects3D.get(key);
		if (!orig) throw new Error(`no object3D with name ${key}`);

		Object.assign(orig, object3D);

		this.FlattenBehaviours(this.objects3DBehaviourBefore, key, !!object3D.BeforeRender, false);
		this.FlattenBehaviours(this.objects3DBehaviourAfter, key, !!object3D.AfterRender, false);
	};

	/** Removes a 3D object and its render callbacks */
	public RemoveObject3D = (key: string) => {
		const obj = this.objects3D.get(key);
		if (!obj) throw new Error(`no object3D with name ${key}`);

		if (obj.OnRemove) obj.OnRemove(this);
		this.objects3D.delete(key);

		this.FlattenBehaviours(this.objects3DBehaviourBefore, key, false);
		this.FlattenBehaviours(this.objects3DBehaviourAfter, key, false);
	};

	//===============================
	// SECTION: Core Rendering Loop
	//===============================
	/** Initializes clock and starts the animation loop */
	public StartRender() {
		if (!this.scene) throw new Error("no scene was added to render");
		if (!this.camera) throw new Error("no camera was added to render");

		this.clock = new THREE.Clock();
		this.renderer.setAnimationLoop(this.Animate.bind(this));
	}

	/** Internal animation callback for each frame */
	private Animate() {
		const delta = this.clock!.getDelta();
		this.timeFromStart += delta;

		this.RunBehavioursBefore(delta);
		this.renderer.render(this.scene!, this.camera!);
		this.RunBehavioursAfter(delta);
	}

	/** Returns time elapsed since rendering started */
	public GetTimeFromStart() {
		return this.timeFromStart;
	}

	/** Resets the elapsed time counter to zero */
	public ResetTimeFromStart() {
		this.timeFromStart = 0;
	}

	//===============================
	// SECTION: Behavior Management
	//===============================
	/**
	 * Adds or removes a key from a before/after render behavior array.
	 * @param arrayToFlatten the target behavior array
	 * @param key the key to add/remove
	 * @param isAdding true to add, false to remove
	 * @param throwError whether to throw if duplicate/missing
	 */
	private FlattenBehaviours(arrayToFlatten: string[], key: string, isAdding: boolean = true, throwError: boolean = true) {
		const idx = arrayToFlatten.indexOf(key);

		if (isAdding) {
			if (idx === -1) {
				arrayToFlatten.push(key);
			} else if (throwError) {
				throw new Error(`can't add ${key}'s behaviour as it's already present`);
			}
		} else {
			if (idx !== -1) {
				arrayToFlatten.splice(idx, 1);
			} else if (throwError) {
				throw new Error(`can't remove ${key}'s behaviour as it's not present`);
			}
		}
	}

	/** Executes all registered BeforeRender callbacks */
	private RunBehavioursBefore(delta: number) {
		this.objects3DBehaviourBefore.forEach((key) => {
			const obj = this.objects3D.get(key);
			if (!obj || !obj.BeforeRender) {
				throw new Error(`can't run before behaviour for key ${key}`);
			}
			obj.BeforeRender(this, delta);
		});

		this.lightsBehaviourBefore.forEach((key) => {
			const light = this.lights.get(key);
			if (!light || !light.BeforeRender) {
				throw new Error(`can't run before behaviour for light ${key}`);
			}
			light.BeforeRender(this, delta);
		});
	}

	/** Executes all registered AfterRender callbacks */
	private RunBehavioursAfter(delta: number) {
		this.objects3DBehaviourAfter.forEach((key) => {
			const obj = this.objects3D.get(key);
			if (!obj || !obj.AfterRender) {
				throw new Error(`can't run after behaviour for key ${key}`);
			}
			obj.AfterRender(this, delta);
		});

		this.lightsBehaviourAfter.forEach((key) => {
			const light = this.lights.get(key);
			if (!light || !light.AfterRender) {
				throw new Error(`can't run after behaviour for light ${key}`);
			}
			light.AfterRender(this, delta);
		});
	}
}
