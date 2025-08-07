import * as THREE from "three";
import { IBehaviourObject } from "../interfaces/behaviourObject.interface";
import { IAudioConfig } from "../interfaces/audioConfig.interface";
import { Rover } from "../rover/rover";
export declare class VenusRenderer {
    renderer: THREE.WebGLRenderer;
    private scene;
    camera: THREE.Camera | null;
    private rovers;
    private activeRoverName;
    private sceneState;
    private sceneStateOberservers;
    private audioListener;
    private audioLoader;
    private audios;
    private lights;
    private objects3D;
    private objects3DBehaviourBefore;
    private objects3DBehaviourAfter;
    private lightsBehaviourBefore;
    private lightsBehaviourAfter;
    private timeFromStart;
    private _lastDelta;
    get lastDelta(): number;
    private clock;
    constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene);
    SetSize: (width: number, height: number) => void;
    GetCanvas: () => HTMLCanvasElement;
    /** Assigns the camera to be used for rendering */
    AddCamera: (camera: THREE.Camera) => void;
    /** Modifies current camera parameters */
    ModifyCamera: (cameraPartial: Partial<THREE.Camera>) => void;
    /** Add or Modify a value for a key.
     *  Normally it triggers the callbacks for the key, if they exists */
    SetSceneState<T>(key: string, value: T, shouldTriggerCallbacks?: boolean): void;
    GetSceneStateVarValue<T>(key: string): T;
    /** Remove a key from the state.
     *  Normally it removes the callbacks for the key */
    RemoveSceneState(key: string, shouldRemoveCallbacks?: boolean): void;
    /** Sets a callback for the state var specified by the key for the obj specified by objKey;
     *  this means it either adds it or modify if the callbackKey already exists
     */
    SetSceneStateCallback(stateVarKey: string, objKey: string, callbackKey: string, callback: Function): void;
    /**
     * It removes entries in the state callback map, the operation is done
     * depending by the params.
     * (observerKey): remove all the istances for the observer around the whole map
     * (stateVarKey): remove all the callbacks for the state var
     * (stateVarKey > observerKey): removes all the istances for the observer for the state var
     * (stateVarKey > observerKey > callbackKey): removes the callback for the observer of the state var
     */
    RemoveSceneStateCallback(stateVarKey?: string | null, observerKey?: string | null, callbackKey?: string | null): void;
    CallStateVarCallbacks(key: string): void;
    /** Attaches an audio listener to the camera (camera must be set first) */
    AddAudioListener(audioListener: THREE.AudioListener): void;
    /**
     * Creates and configures an audio source.
     * Chooses positional or non-positional audio based on config.
     * Generates a key from the file path if not provided.
     */
    AddAudio(audioConfig: IAudioConfig): void;
    /** Plays the audio associated with the given key */
    PlayAudio(key: string): void;
    /** Removes and disposes of the audio resource by key */
    RemoveAudio(key: string): void;
    /** Returns all lights and objects that match the specified tag */
    GetByTag(tag: string): IBehaviourObject<THREE.Light | THREE.Object3D, any>[];
    /** Deletes all lights and objects associated with the specified tag */
    DeleteByTag(tag: string): IBehaviourObject<THREE.Light | THREE.Object3D, any>[];
    /** Adds a light with behaviour hooks */
    AddLights<T>(light: IBehaviourObject<THREE.Light, T>): void;
    /** Retrieves a light behaviour object by key */
    GetLight(key: string): IBehaviourObject<THREE.Light, any> | null;
    /** Modifies properties or callbacks of a given light */
    ModifyLight(key: string, light: Partial<IBehaviourObject<THREE.Light, any>>): void;
    /** Removes a light and its render callbacks */
    RemoveLight(key: string): void;
    /** Adds a 3D object with behaviour hooks */
    AddObject3D(object3D: IBehaviourObject<THREE.Object3D, any>): void;
    /** Retrieves a 3D object behaviour by key */
    GetObject3D<T>(key: string): IBehaviourObject<THREE.Object3D, T> | null;
    /** Modifies a 3D object’s properties or callbacks */
    ModifyObject3D(key: string, object3D: Partial<IBehaviourObject<THREE.Object3D, any>>): void;
    /** Removes a 3D object and its render callbacks */
    RemoveObject3D(key: string): void;
    /** Get active rover */
    get activeRover(): Rover;
    /** Add a rover object to the renderer */
    DeployRover(rover: Rover): void;
    /** Activate a controller of the current rover */
    ActivateRoverController(roverControllerName: string): void;
    /** Pause a controller of the current rover */
    PauseRoverController(roverControllerName: string): void;
    /** Removes rover safely disabling the current controls */
    RemoveRover(roverControllerName: string): void;
    GetRoverByControllerName(roverControllerName: string): Rover;
    /** Initializes clock and starts the animation loop */
    StartRender(): void;
    /** Internal animation callback for each frame */
    private Animate;
    /** Returns time elapsed since rendering started */
    GetTimeFromStart(): number;
    /** Resets the elapsed time counter to zero */
    ResetTimeFromStart(): void;
    /**
     * Adds or removes a key from a before/after render behavior array.
     * @param arrayToFlatten the target behavior array
     * @param key the key to add/remove
     * @param isAdding true to add, false to remove
     * @param throwError whether to throw if duplicate/missing
     */
    private FlattenBehaviours;
    /** Executes all registered BeforeRender callbacks */
    private RunBehavioursBefore;
    /** Executes all registered AfterRender callbacks */
    private RunBehavioursAfter;
}
