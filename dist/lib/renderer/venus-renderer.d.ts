import * as THREE from "three";
import { BehaviourObjectInterface } from "../interfaces/behaviour-object.interface";
import { AudioConfigInterface } from "../interfaces/audio-config.interface";
import { Rover } from "../rover/rover";
import { BehaviourProcessInterface } from "../interfaces/behaviour-process.interface";
import { CSS2DObject, CSS2DRenderer } from "three/examples/jsm/Addons";
export declare class VenusRenderer {
    renderer: THREE.WebGLRenderer;
    private scene;
    camera: THREE.Camera | null;
    private rovers;
    private activeRoverName;
    private sceneState;
    private sceneStateOberservers;
    htmlSlices: Map<string, CSS2DObject>;
    css2DRender: CSS2DRenderer;
    private audioListener;
    private audioLoader;
    private audios;
    private lights;
    private objects3D;
    private processes;
    private objects3DBehaviourBefore;
    private objects3DBehaviourAfter;
    private lightsBehaviourBefore;
    private lightsBehaviourAfter;
    private timeFromStart;
    private _lastDelta;
    get lastDelta(): number;
    private clock;
    constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene);
    setSize: (width: number, height: number) => void;
    getCanvas: () => HTMLCanvasElement;
    /** Assigns the camera to be used for rendering */
    addCamera: (camera: THREE.Camera) => void;
    /** Modifies current camera parameters */
    modifyCamera: (cameraPartial: Partial<THREE.Camera>) => void;
    /** Add or Modify a value for a key.
     *  Normally it triggers the callbacks for the key, if they exists */
    setSceneState<T>(key: string, value: T, shouldTriggerCallbacks?: boolean): void;
    getSceneStateVarValue<T>(key: string): T;
    /** Remove a key from the state.
     *  Normally it removes the callbacks for the key */
    removeSceneState(key: string, shouldRemoveCallbacks?: boolean): void;
    /** Sets a callback for the state var specified by the key for the obj specified by objKey;
     *  this means it either adds it or modify if the callbackKey already exists
     */
    setSceneStateCallback(stateVarKey: string, objKey: string, callbackKey: string, callback: Function): void;
    /**
     * It removes entries in the state callback map, the operation is done
     * depending by the params.
     * (observerKey): remove all the istances for the observer around the whole map
     * (stateVarKey): remove all the callbacks for the state var
     * (stateVarKey > observerKey): removes all the istances for the observer for the state var
     * (stateVarKey > observerKey > callbackKey): removes the callback for the observer of the state var
     */
    removeSceneStateCallback(stateVarKey?: string | null, observerKey?: string | null, callbackKey?: string | null): void;
    callStateVarCallbacks(key: string): void;
    addHtmlSlice: (key: string, css2DObj: CSS2DObject) => void;
    getHtmlSlice: (key: string) => CSS2DObject;
    removeHtmlSlice: (key: string) => void;
    /** Attaches an audio listener to the camera (camera must be set first) */
    addAudioListener(audioListener: THREE.AudioListener): void;
    /**
     * Creates and configures an audio source.
     * Chooses positional or non-positional audio based on config.
     * Generates a key from the file path if not provided.
     */
    addAudio(audioConfig: AudioConfigInterface): void;
    /** Plays the audio associated with the given key */
    playAudio(key: string): void;
    /** Removes and disposes of the audio resource by key */
    removeAudio(key: string): void;
    /** Returns all lights and objects that match the specified tag */
    getByTag(tag: string): BehaviourObjectInterface<THREE.Light | THREE.Object3D>[];
    /** Deletes all lights and objects associated with the specified tag */
    deleteByTag(tag: string): BehaviourObjectInterface<THREE.Light | THREE.Object3D>[];
    /** Adds a light with behaviour hooks */
    addLights(light: BehaviourObjectInterface<THREE.Light>): void;
    /** Retrieves a light behaviour object by key */
    getLight(key: string): BehaviourObjectInterface<THREE.Light> | null;
    /** Modifies properties or callbacks of a given light */
    modifyLight(key: string, light: Partial<BehaviourObjectInterface<THREE.Light>>): void;
    /** Removes a light and its render callbacks and fires it's onRemove */
    removeLight(key: string): void;
    /** Adds a 3D object with behaviour hooks */
    addObject3D(object3D: BehaviourObjectInterface<THREE.Object3D>): void;
    /** Retrieves a 3D object behaviour by key */
    getObject3D(key: string): BehaviourObjectInterface<THREE.Object3D> | null;
    /** Modifies a 3D object’s properties or callbacks */
    modifyObject3D(key: string, object3D: Partial<BehaviourObjectInterface<THREE.Object3D>>): void;
    /** Removes a 3D object and its render callbacks and fires it's onRemove */
    removeObject3D(key: string): void;
    /** Adds a process to the processes maps */
    addProcess(process: BehaviourProcessInterface): void;
    /** Tries to retrieve a process */
    getProcess(key: string): BehaviourProcessInterface | null;
    /** Removes a process and fires it's onRemove */
    removeProcess(key: string): void;
    /** Get active rover */
    get activeRover(): Rover;
    /** Add a rover object to the renderer */
    deployRover(rover: Rover): void;
    /** Activate a controller of the current rover */
    activateRoverController(roverControllerName: string): void;
    /** Pause a controller of the current rover */
    pauseRoverController(roverControllerName: string): void;
    /** Removes rover safely disabling the current controls */
    removeRover(roverControllerName: string): void;
    getRoverByControllerName(roverControllerName: string): Rover;
    /** Initializes clock and starts the animation loop */
    startRender(): void;
    /** Internal animation callback for each frame */
    private animate;
    /** Returns time elapsed since rendering started */
    getTimeFromStart(): number;
    /** Resets the elapsed time counter to zero */
    resetTimeFromStart(): void;
    /**
     * Adds or removes a key from a before/after render behavior array.
     * @param arrayToFlatten the target behavior array
     * @param key the key to add/remove
     * @param isAdding true to add, false to remove
     * @param throwError whether to throw if duplicate/missing
     */
    private flattenBehaviours;
    /** Executes all beforeRender callbacks */
    private runBehavioursBefore;
    /** Executes all afterRender callbacks */
    private runBehavioursAfter;
}
