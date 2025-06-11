import * as THREE from "three";
import { IHashedItem } from "../hashedItem/hashedItem.inteface";

export class VenusRenderer {
	private renderer: THREE.WebGLRenderer;
	public scene: THREE.Scene | null = null; //todo make accessible only by method
	private camera: THREE.Camera | null = null;
	private lights: Map<string, THREE.Light> = new Map();
	private objects3D: Map<string, THREE.Object3D> = new Map();

	constructor(_renderer: THREE.WebGLRenderer, _scene: THREE.Scene) {
		this.renderer = _renderer;
		this.scene = _scene;
	}

	//SECTION - addable items
	public AddCamera = (_camera: THREE.Camera) => {
		this.camera = _camera;
	};

	//LIGHTS
	public AddLights = (key: string, light: THREE.Light) => {
		if (this.lights.get(key) == null) {
			this.lights.set(key, light);

			if (!this.scene) throw new Error("no scene was added to render");
			this.scene.add(this.lights.get(key)!);
		} else {
			throw new Error(`key already used for light ${key}`);
		}
	};
	public GetLight = (key: string): THREE.Light | null => {
		return this.lights.get(key) ?? null;
	};
	public ModifyLight = (key: string, light: Partial<THREE.Light>) => {
		const lightOrig = this.lights.get(key);
		if (lightOrig) Object.assign(lightOrig, light);
		else throw new Error(`no light with name ${key}`);
	};
	//!SECTION

	//3D OBJECTS
	public AddObject3D = (key: string, object3D: THREE.Object3D) => {
		if (this.objects3D.get(key) == null) {
			this.objects3D.set(key, object3D);

			if (!this.scene) throw new Error("no scene was added to render");
			this.scene.add(this.objects3D.get(key)!);
		} else {
			throw new Error(`key already used for objects3D ${key}`);
		}
	};
	public GetObject3D = (key: string): THREE.Object3D | null => {
		return this.objects3D.get(key) ?? null;
	};
	public ModifyObject3D = (key: string, object3D: Partial<THREE.Object3D>) => {
		const object3DOrig = this.objects3D.get(key);
		if (object3DOrig) Object.assign(object3DOrig, object3D);
		else throw new Error(`no object3D with name ${key}`);
	};
	//!SECTION

	//SECTION - core
	public StartRender() {
		if (!this.scene) throw new Error("no scene was added to render");
		if (!this.camera) throw new Error("no camera was added to render");
		this.renderer.setAnimationLoop(this.Animate.bind(this));
	}

	private Animate() {
		this.renderer.render(this.scene!, this.camera!);
	}
	//!SECTION
}
