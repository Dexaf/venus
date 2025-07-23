import * as THREE from "three";
export class VenusRenderer {
    constructor(renderer, scene) {
        // Scene to render
        this.scene = null;
        // Camera used for rendering
        this.camera = null;
        // Rover slot to use for eventual controller
        this.rover = null;
        // Maps for global vars of scene
        // the key is the name of the var in the state
        this.sceneState = new Map();
        //the key is the name of the var in the scene state
        //the value is an object that handles the callbacks of an object for that var
        this.sceneStateOberservers = new Map();
        // Audio components
        this.audioListener = null;
        this.audioLoader = null;
        this.audios = new Map();
        // Maps for lights and 3D objects with behavior interfaces
        this.lights = new Map();
        this.objects3D = new Map();
        // Arrays of keys to track before/after render callbacks
        this.objects3DBehaviourBefore = [];
        this.objects3DBehaviourAfter = [];
        this.lightsBehaviourBefore = [];
        this.lightsBehaviourAfter = [];
        // Time elapsed since rendering started
        this.timeFromStart = 0;
        this.clock = null;
        //===============================
        // SECTION: Camera
        //===============================
        /** Assigns the camera to be used for rendering */
        this.AddCamera = (camera) => {
            this.camera = camera;
        };
        /** Modifies current camera parameters */
        this.ModifyCamera = (cameraPartial) => {
            if (this.camera == null) {
                throw new Error("can't modify camera as there's no camera");
            }
            this.camera = {
                ...cameraPartial,
                ...this.camera,
            };
        };
        this.renderer = renderer;
        this.scene = scene;
    }
    //===============================
    // SECTION: Scene state
    //===============================
    /** Add or Modify a value for a key.
     *  Normally it triggers the callbacks for the key, if they exists */
    SetSceneState(key, value, shouldTriggerCallbacks = true) {
        this.sceneState.set(key, value);
        if (shouldTriggerCallbacks)
            //trigger observers
            this.CallStateVarCallbacks(key);
    }
    GetSceneStateVarValue(key) {
        return this.sceneState.get(key);
    }
    /** Remove a key from the state.
     *  Normally it removes the callbacks for the key */
    RemoveSceneState(key, value, shouldRemoveCallbacks = true) {
        this.sceneState.set(key, value);
        if (shouldRemoveCallbacks)
            this.RemoveSceneStateCallback(key);
    }
    //===============================
    // SECTION: Scene state callback
    //===============================
    /** Sets a callback for the state var specified by the key for the obj specified by objKey;
     *  this means it either adds it or modify if the callbackKey already exists
     */
    SetSceneStateCallback(stateVarKey, objKey, callbackKey, callback) {
        const stateVar = this.sceneState.get(stateVarKey);
        if (stateVar == null) {
            throw new Error(`can't add event callback to state var ${stateVarKey} as the state var can't be found`);
        }
        const stateVarObserversCallbacks = this.sceneStateOberservers.get(stateVarKey);
        //create the entry of the callback
        const observerCallback = new Map();
        observerCallback.set(callbackKey, callback);
        //if the var as no observers we set the first one
        if (stateVarObserversCallbacks == null) {
            //create the entry for the observer regarding the state var
            const observerCallbacks = new Map();
            observerCallbacks.set(objKey, observerCallback);
            //set the observer for the state var
            this.sceneStateOberservers.set(stateVarKey, observerCallbacks);
        }
        //if the var as observers...
        else {
            //...we check if our observer is there
            let observerCallbacks = stateVarObserversCallbacks.get(objKey);
            //if the var isn't observed by the object we set it up
            if (observerCallbacks == null) {
                observerCallbacks = new Map();
            }
            observerCallbacks.set(callbackKey, callback);
        }
    }
    /**
     * It removes entries in the state callback map, the operation is done
     * depending by the params.
     * (observerKey): remove all the istances for the observer around the whole map
     * (stateVarKey): remove all the callbacks for the state var
     * (stateVarKey > observerKey): removes all the istances for the observer for the state var
     * (stateVarKey > observerKey > callbackKey): removes the callback for the observer of the state var
     */
    RemoveSceneStateCallback(stateVarKey = null, observerKey = null, callbackKey = null) {
        //if we have no specific state var to work with...
        if (stateVarKey == null) {
            if (observerKey == null)
                throw new Error("can't remove any callback with no usefull param to do so");
            //...we want to delete all the entries for a specific observer
            this.sceneStateOberservers.forEach((observersCallbacks) => {
                observersCallbacks.delete(observerKey);
            });
        }
        //if only stateVarKey is defined we delete the state vars observers
        else {
            if (observerKey == null)
                this.sceneStateOberservers.delete(stateVarKey);
            else {
                const observersCallbacks = this.sceneStateOberservers.get(stateVarKey);
                if (observersCallbacks == null)
                    throw new Error(`can't remove callback ${callbackKey} as state var ${stateVarKey} isn't found`);
                //if callbackKey isn't defined we delete the obj observer
                if (callbackKey == null)
                    observersCallbacks.delete(observerKey);
                else {
                    const observerCallbacks = observersCallbacks.get(observerKey);
                    if (observerCallbacks == null)
                        throw new Error(`can't remove callback ${callbackKey} as observer ${observerKey} isn't found`);
                    //if the callback is defined we delete the entry
                    observerCallbacks.delete(callbackKey);
                }
            }
        }
    }
    CallStateVarCallbacks(key) {
        const observersCallbacks = this.sceneStateOberservers.get(key);
        if (observersCallbacks == null)
            throw new Error(`can't call callbacks for state var ${key} as it's not found`);
        observersCallbacks.forEach((ocs) => {
            ocs.forEach((oc) => {
                oc.call(this);
            });
        });
    }
    //===============================
    // SECTION: Audio
    //===============================
    /** Attaches an audio listener to the camera (camera must be set first) */
    AddAudioListener(audioListener) {
        if (this.camera == null) {
            throw new Error("can't add audio listener as there's no camera");
        }
        this.audioListener = audioListener;
        this.audioLoader = new THREE.AudioLoader();
        this.camera.add(this.audioListener);
    }
    /**
     * Creates and configures an audio source.
     * Chooses positional or non-positional audio based on config.
     * Generates a key from the file path if not provided.
     */
    AddAudio(audioConfig) {
        if (this.audioListener == null) {
            throw new Error("can't add audio as there's no audio listener");
        }
        let sound;
        if (!audioConfig.positionalConfig) {
            sound = new THREE.Audio(this.audioListener);
        }
        else {
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
        this.audioLoader.load(audioConfig.path, (buffer) => {
            sound.setBuffer(buffer);
            sound.setLoop(audioConfig.loop ?? false);
            sound.setVolume(audioConfig.volume ?? 0.5);
            if (audioConfig.playOnLoad)
                sound.play();
            // Additional setup for positional audio
            if (sound instanceof THREE.PositionalAudio) {
                sound.setRefDistance(audioConfig.positionalConfig.refDistance);
                if (audioConfig.positionalConfig.meshToAttachKey) {
                    const obj3D = this.GetObject3D(audioConfig.positionalConfig.meshToAttachKey);
                    if (obj3D)
                        obj3D.obj.add(sound);
                }
            }
        });
    }
    /** Plays the audio associated with the given key */
    PlayAudio(key) {
        const audio = this.audios.get(key);
        if (!audio) {
            throw new Error(`no audio with name ${key}`);
        }
        audio.play();
    }
    /** Removes and disposes of the audio resource by key */
    RemoveAudio(key) {
        const removed = this.audios.delete(key);
        if (!removed) {
            throw new Error(`no audio with name ${key}`);
        }
    }
    //===============================
    // SECTION: Tagging
    //===============================
    /** Returns all lights and objects that match the specified tag */
    GetByTag(tag) {
        const result = [];
        this.objects3D.forEach((obj) => {
            if (obj.tag === tag)
                result.push(obj);
        });
        this.lights.forEach((light) => {
            if (light.tag === tag)
                result.push(light);
        });
        return result;
    }
    /** Deletes all lights and objects associated with the specified tag */
    DeleteByTag(tag) {
        this.objects3D.forEach((obj, key) => {
            if (obj.tag === tag)
                this.RemoveObject3D(key);
        });
        this.lights.forEach((light, key) => {
            if (light.tag === tag)
                this.RemoveLight(key);
        });
        return [];
    }
    //===============================
    // SECTION: Lights
    //===============================
    /** Adds a light with behaviour hooks */
    AddLights(light) {
        if (this.lights.has(light.key)) {
            throw new Error(`key already used for light ${light.key}`);
        }
        light.obj.name = light.key;
        this.lights.set(light.key, light);
        if (!this.scene) {
            throw new Error("no scene was added to render");
        }
        this.scene.add(light.obj);
        if (light.OnAdd)
            light.OnAdd(this);
        // Register before/after render callbacks if present
        if (light.BeforeRender)
            this.FlattenBehaviours(this.lightsBehaviourBefore, light.key);
        if (light.AfterRender)
            this.FlattenBehaviours(this.lightsBehaviourAfter, light.key);
    }
    /** Retrieves a light behaviour object by key */
    GetLight(key) {
        return this.lights.get(key) ?? null;
    }
    /** Modifies properties or callbacks of a given light */
    ModifyLight(key, light) {
        const orig = this.lights.get(key);
        if (!orig)
            throw new Error(`no light with name ${key}`);
        Object.assign(orig, light);
        // Update before/after render registration
        this.FlattenBehaviours(this.lightsBehaviourBefore, key, !!light.BeforeRender, false);
        this.FlattenBehaviours(this.lightsBehaviourAfter, key, !!light.AfterRender, false);
    }
    /** Removes a light and its render callbacks */
    RemoveLight(key) {
        const light = this.lights.get(key);
        if (!light)
            throw new Error(`no light with name ${key}`);
        if (light.OnRemove)
            light.OnRemove(this);
        this.lights.delete(key);
        this.FlattenBehaviours(this.lightsBehaviourBefore, key, false);
        this.FlattenBehaviours(this.lightsBehaviourAfter, key, false);
        this.RemoveSceneStateCallback(null, key);
    }
    //===============================
    // SECTION: 3D Objects
    //===============================
    /** Adds a 3D object with behaviour hooks */
    AddObject3D(object3D) {
        if (this.objects3D.has(object3D.key)) {
            throw new Error(`key already used for objects3D ${object3D.key}`);
        }
        object3D.obj.name = object3D.key;
        this.objects3D.set(object3D.key, object3D);
        if (!this.scene) {
            throw new Error("no scene was added to render");
        }
        this.scene.add(object3D.obj);
        if (object3D.OnAdd)
            object3D.OnAdd(this);
        if (object3D.BeforeRender)
            this.FlattenBehaviours(this.objects3DBehaviourBefore, object3D.key);
        if (object3D.AfterRender)
            this.FlattenBehaviours(this.objects3DBehaviourAfter, object3D.key);
    }
    /** Retrieves a 3D object behaviour by key */
    GetObject3D(key) {
        return this.objects3D.get(key) ?? null;
    }
    /** Modifies a 3D object’s properties or callbacks */
    ModifyObject3D(key, object3D) {
        const orig = this.objects3D.get(key);
        if (!orig)
            throw new Error(`no object3D with name ${key}`);
        Object.assign(orig, object3D);
        this.FlattenBehaviours(this.objects3DBehaviourBefore, key, !!object3D.BeforeRender, false);
        this.FlattenBehaviours(this.objects3DBehaviourAfter, key, !!object3D.AfterRender, false);
    }
    /** Removes a 3D object and its render callbacks */
    RemoveObject3D(key) {
        const obj = this.objects3D.get(key);
        if (!obj)
            throw new Error(`no object3D with name ${key}`);
        if (obj.OnRemove)
            obj.OnRemove(this);
        this.objects3D.delete(key);
        this.FlattenBehaviours(this.objects3DBehaviourBefore, key, false);
        this.FlattenBehaviours(this.objects3DBehaviourAfter, key, false);
        this.RemoveSceneStateCallback(null, key);
    }
    //===============================
    // SECTION: Rover handling
    //===============================
    /** Add a rover object to the renderer */
    DeployRover(rover) {
        if (this.rover)
            this.rover.CleanController();
        this.rover = rover;
    }
    /** Activate a controller of the current rover */
    ActivateRoverController(searchParam) {
        if (!this.rover)
            throw new Error("can't activate controller as there is no rover deployed");
        this.rover.SetActiveController(searchParam);
    }
    /** Removes rover safely disabling the current controls */
    RemoveRover() {
        if (!this.rover)
            throw new Error("can't remove controller as there is no rover deployed");
        this.rover.CleanController();
    }
    GetActiveRoverController() {
        if (!this.rover)
            throw new Error("can't get controller inputs as there is no rover deployed");
        return this.rover.GetActiveController();
    }
    //===============================
    // SECTION: Core Rendering Loop
    //===============================
    /** Initializes clock and starts the animation loop */
    StartRender() {
        if (!this.scene)
            throw new Error("no scene was added to render");
        if (!this.camera)
            throw new Error("no camera was added to render");
        this.clock = new THREE.Clock();
        this.renderer.setAnimationLoop(this.Animate.bind(this));
    }
    /** Internal animation callback for each frame */
    Animate() {
        const delta = this.clock.getDelta();
        this.objects3D.forEach((o3D) => {
            o3D.animationMixer?.update(delta);
        });
        this.timeFromStart += delta;
        this.RunBehavioursBefore(delta);
        this.renderer.render(this.scene, this.camera);
        this.RunBehavioursAfter(delta);
    }
    /** Returns time elapsed since rendering started */
    GetTimeFromStart() {
        return this.timeFromStart;
    }
    /** Resets the elapsed time counter to zero */
    ResetTimeFromStart() {
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
    FlattenBehaviours(arrayToFlatten, key, isAdding = true, throwError = true) {
        const idx = arrayToFlatten.indexOf(key);
        if (isAdding) {
            if (idx === -1) {
                arrayToFlatten.push(key);
            }
            else if (throwError) {
                throw new Error(`can't add ${key}'s behaviour as it's already present`);
            }
        }
        else {
            if (idx !== -1) {
                arrayToFlatten.splice(idx, 1);
            }
            else if (throwError) {
                throw new Error(`can't remove ${key}'s behaviour as it's not present`);
            }
        }
    }
    /** Executes all registered BeforeRender callbacks */
    RunBehavioursBefore(delta) {
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
    RunBehavioursAfter(delta) {
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
