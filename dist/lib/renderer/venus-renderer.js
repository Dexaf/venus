import * as THREE from "three";
import { CSS2DRenderer, CSS3DRenderer } from "three/examples/jsm/Addons";
export class VenusRenderer {
    get lastDelta() {
        return this._lastDelta;
    }
    constructor(renderer, scene) {
        // Scene to render
        this.scene = null;
        // Camera used for rendering
        this.camera = null;
        // Rover slot to use for eventual controller
        this.rovers = [];
        this.activeRoverName = "";
        // Maps for global vars of scene
        // the key is the name of the var in the state
        this.sceneState = new Map();
        //the key is the name of the var in the scene state
        //the value is an object that handles the callbacks of an object for that var
        this.sceneStateOberservers = new Map();
        // Html slices
        this.htmlSlices2D = new Map();
        this.css2DRender = new CSS2DRenderer();
        this.htmlSlices3D = new Map();
        this.css3DRender = new CSS3DRenderer();
        // Audio components
        this.audioListener = null;
        this.audioLoader = null;
        this.audios = new Map();
        // Maps for lights and 3D objects with behavior interfaces
        this.lights = new Map();
        this.objects3D = new Map();
        this.processes = new Map();
        // Arrays of keys to track before/after render callbacks
        this.objects3DBehaviourBefore = [];
        this.objects3DBehaviourAfter = [];
        this.lightsBehaviourBefore = [];
        this.lightsBehaviourAfter = [];
        // Time elapsed since rendering started
        this.timeFromStart = 0;
        this._lastDelta = 0;
        this.clock = null;
        //===============================
        // SECTION: Scene
        //===============================
        this.setSize = (width, height) => {
            this.renderer.setSize(width, height);
        };
        this.getCanvas = () => {
            return this.renderer.domElement;
        };
        //===============================
        // SECTION: Camera
        //===============================
        /** Assigns the camera to be used for rendering */
        this.addCamera = (camera) => {
            this.camera = camera;
        };
        /** Modifies current camera parameters */
        this.modifyCamera = (cameraPartial) => {
            if (this.camera == null) {
                throw new Error("can't modify camera as there's no camera");
            }
            this.camera = {
                ...cameraPartial,
                ...this.camera,
            };
        };
        //===============================
        // SECTION: Html slices
        //===============================
        this.addHtmlSlice2D = (key, css2DObj) => {
            if (this.htmlSlices2D.get(key))
                throw new Error(`key already used for html slice ${key}`);
            this.htmlSlices2D.set(key, css2DObj);
            this.scene.add(css2DObj);
        };
        this.getHtmlSlice2D = (key) => {
            const css2DObj = this.htmlSlices2D.get(key);
            if (!css2DObj)
                throw new Error(`can't find html slice with key ${key}`);
            return css2DObj;
        };
        this.removeHtmlSlice2D = (key) => {
            const css2DObj = this.htmlSlices2D.get(key);
            if (!css2DObj)
                throw new Error(`no html slice with name ${key}`);
            this.htmlSlices2D.delete(key);
            this.scene.remove(css2DObj);
        };
        this.addHtmlSlice3D = (key, css3DObj) => {
            if (this.htmlSlices3D.get(key))
                throw new Error(`key already used for html slice ${key}`);
            this.htmlSlices3D.set(key, css3DObj);
            this.scene.add(css3DObj);
        };
        this.getHtmlSlice3D = (key) => {
            const css3DObj = this.htmlSlices3D.get(key);
            if (!css3DObj)
                throw new Error(`can't find html slice with key ${key}`);
            return css3DObj;
        };
        this.removeHtmlSlice3D = (key) => {
            const css3DObj = this.htmlSlices3D.get(key);
            if (!css3DObj)
                throw new Error(`no html slice with name ${key}`);
            this.htmlSlices3D.delete(key);
            this.scene.remove(css3DObj);
        };
        this.renderer = renderer;
        this.scene = scene;
        this.css2DRender.setSize(renderer.domElement.width, renderer.domElement.height);
        this.css2DRender.domElement.style.position = "absolute";
        this.css2DRender.domElement.style.pointerEvents = "none";
        this.css2DRender.domElement.style.top = "0px";
        renderer.domElement.parentElement.appendChild(this.css2DRender.domElement);
        this.css3DRender.setSize(renderer.domElement.width, renderer.domElement.height);
        this.css3DRender.domElement.style.position = "absolute";
        this.css3DRender.domElement.style.pointerEvents = "none";
        this.css3DRender.domElement.style.top = "0px";
        renderer.domElement.parentElement.appendChild(this.css3DRender.domElement);
    }
    //===============================
    // SECTION: Scene state
    //===============================
    /** Add or Modify a value for a key.
     *  Normally it triggers the callbacks for the key, if they exists */
    setSceneState(key, value, shouldTriggerCallbacks = true) {
        this.sceneState.set(key, value);
        if (shouldTriggerCallbacks)
            //trigger observers
            this.callStateVarCallbacks(key);
    }
    getSceneStateVarValue(key) {
        return this.sceneState.get(key);
    }
    /** Remove a key from the state.
     *  Normally it removes the callbacks for the key */
    removeSceneState(key, shouldRemoveCallbacks = true) {
        this.sceneState.delete(key);
        if (shouldRemoveCallbacks)
            this.removeSceneStateCallback(key);
    }
    //===============================
    // SECTION: Scene state callback
    //===============================
    /** Sets a callback for the state var specified by the key for the obj specified by objKey;
     *  this means it either adds it or modify if the callbackKey already exists
     */
    setSceneStateCallback(stateVarKey, objKey, callbackKey, callback) {
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
    removeSceneStateCallback(stateVarKey = null, observerKey = null, callbackKey = null) {
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
    callStateVarCallbacks(key) {
        const observersCallbacks = this.sceneStateOberservers.get(key);
        if (observersCallbacks == null)
            return;
        observersCallbacks.forEach((ocs) => {
            ocs.forEach((oc) => {
                oc.call(this);
            });
        });
    }
    //===============================
    // !SECTION: Html slices
    //===============================
    //===============================
    // SECTION: Audio
    //===============================
    /** Attaches an audio listener to the camera (camera must be set first) */
    addAudioListener(audioListener) {
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
    addAudio(audioConfig) {
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
                    const obj3D = this.getObject3D(audioConfig.positionalConfig.meshToAttachKey);
                    if (obj3D)
                        obj3D.obj.add(sound);
                }
            }
        });
    }
    /** Plays the audio associated with the given key */
    playAudio(key) {
        const audio = this.audios.get(key);
        if (!audio) {
            throw new Error(`no audio with name ${key}`);
        }
        audio.play();
    }
    /** Removes and disposes of the audio resource by key */
    removeAudio(key) {
        const removed = this.audios.delete(key);
        if (!removed) {
            throw new Error(`no audio with name ${key}`);
        }
    }
    //===============================
    // SECTION: Tagging
    //===============================
    /** Returns all lights and objects that match the specified tag */
    getByTag(tag) {
        const result = [];
        this.objects3D.forEach((obj) => {
            if (obj.tag === tag && obj)
                result.push(obj);
        });
        this.lights.forEach((light) => {
            if (light.tag === tag && light)
                result.push(light);
        });
        return result;
    }
    /** Deletes all lights and objects associated with the specified tag */
    deleteByTag(tag) {
        this.objects3D.forEach((obj, key) => {
            if (obj.tag === tag)
                this.removeObject3D(key);
        });
        this.lights.forEach((light, key) => {
            if (light.tag === tag)
                this.removeLight(key);
        });
        return [];
    }
    //===============================
    // SECTION: Lights
    //===============================
    /** Adds a light with behaviour hooks */
    addLights(light) {
        if (this.lights.has(light.key)) {
            throw new Error(`key already used for light ${light.key}`);
        }
        light.obj.name = light.key;
        this.lights.set(light.key, light);
        if (!this.scene) {
            throw new Error("no scene was added to render");
        }
        this.scene.add(light.obj);
        if (light.onAdd)
            light.onAdd(this);
        // Register before/after render callbacks if present
        if (light.beforeRender)
            this.flattenBehaviours(this.lightsBehaviourBefore, light.key);
        if (light.afterRender)
            this.flattenBehaviours(this.lightsBehaviourAfter, light.key);
    }
    /** Retrieves a light behaviour object by key */
    getLight(key) {
        return this.lights.get(key) ?? null;
    }
    /** Modifies properties or callbacks of a given light */
    modifyLight(key, light) {
        const orig = this.lights.get(key);
        if (!orig)
            throw new Error(`no light with name ${key}`);
        Object.assign(orig, light);
        // Update before/after render registration
        this.flattenBehaviours(this.lightsBehaviourBefore, key, !!light.beforeRender, false);
        this.flattenBehaviours(this.lightsBehaviourAfter, key, !!light.afterRender, false);
    }
    /** Removes a light and its render callbacks and fires it's onRemove */
    removeLight(key) {
        const light = this.lights.get(key);
        if (!light)
            throw new Error(`no light with name ${key}`);
        if (light.onRemove)
            light.onRemove(this);
        this.lights.delete(key);
        this.flattenBehaviours(this.lightsBehaviourBefore, key, false);
        this.flattenBehaviours(this.lightsBehaviourAfter, key, false);
        this.removeSceneStateCallback(null, key);
        //don't ask please...
        light.obj.parent.remove(light.obj);
    }
    //===============================
    // SECTION: 3D Objects
    //===============================
    /** Adds a 3D object with behaviour hooks */
    addObject3D(object3D) {
        if (this.objects3D.has(object3D.key)) {
            throw new Error(`key already used for objects3D ${object3D.key}`);
        }
        object3D.obj.name = object3D.key;
        this.objects3D.set(object3D.key, object3D);
        if (!this.scene) {
            throw new Error("no scene was added to render");
        }
        this.scene.add(object3D.obj);
        if (object3D.onAdd)
            object3D.onAdd(this);
        if (object3D.beforeRender)
            this.flattenBehaviours(this.objects3DBehaviourBefore, object3D.key);
        if (object3D.afterRender)
            this.flattenBehaviours(this.objects3DBehaviourAfter, object3D.key);
    }
    /** Retrieves a 3D object behaviour by key */
    getObject3D(key) {
        return this.objects3D.get(key) ?? null;
    }
    /** Modifies a 3D object’s properties or callbacks */
    modifyObject3D(key, object3D) {
        const orig = this.objects3D.get(key);
        if (!orig)
            throw new Error(`no object3D with name ${key}`);
        Object.assign(orig, object3D);
        this.flattenBehaviours(this.objects3DBehaviourBefore, key, !!object3D.beforeRender, false);
        this.flattenBehaviours(this.objects3DBehaviourAfter, key, !!object3D.afterRender, false);
    }
    /** Removes a 3D object and its render callbacks and fires it's onRemove */
    removeObject3D(key) {
        const obj = this.objects3D.get(key);
        if (!obj)
            throw new Error(`no object3D with name ${key}`);
        if (obj.onRemove)
            obj.onRemove(this);
        this.objects3D.delete(key);
        this.flattenBehaviours(this.objects3DBehaviourBefore, key, false);
        this.flattenBehaviours(this.objects3DBehaviourAfter, key, false);
        this.removeSceneStateCallback(null, key);
        //don't ask please...
        obj.obj.parent.remove(obj.obj);
    }
    //===============================
    // SECTION: Processes
    //===============================
    /** Adds a process to the processes maps */
    addProcess(process) {
        if (this.processes.has(process.key)) {
            throw new Error(`key already used for process ${process.key}`);
        }
        this.processes.set(process.key, process);
        if (!this.scene) {
            throw new Error("no scene was added to render");
        }
        if (process.onAdd)
            process.onAdd(this);
    }
    /** Tries to retrieve a process */
    getProcess(key) {
        return this.processes.get(key) ?? null;
    }
    /** Removes a process and fires it's onRemove */
    removeProcess(key) {
        const prcs = this.processes.get(key);
        if (!prcs)
            throw new Error(`no process with name ${key}`);
        if (prcs.onRemove)
            prcs.onRemove(this);
        this.processes.delete(prcs.key);
    }
    //===============================
    // SECTION: Rover handling
    //===============================
    /** Get active rover */
    get activeRover() {
        if (this.rovers.length < 1)
            throw new Error("can't activate controller as there is no rover deployed");
        const ri = this.rovers.findIndex((r) => r.controller?.name == this.activeRoverName);
        if (ri == -1)
            throw new Error(`rover controller with name ${this.activeRoverName} doesn't exist and can't be activated`);
        return this.rovers[ri];
    }
    /** Add a rover object to the renderer */
    deployRover(rover) {
        this.rovers.push(rover);
    }
    /** Activate a controller of the current rover */
    activateRoverController(roverControllerName) {
        if (this.rovers.length < 1)
            throw new Error("can't activate controller as there is no rover deployed");
        const ri = this.rovers.findIndex((r) => r.controller?.name == roverControllerName);
        if (ri == -1)
            throw new Error(`rover controller with name ${roverControllerName} doesn't exist and can't be activated`);
        for (let i = 0; i < this.rovers.length; i++) {
            const rover = this.rovers[i];
            rover.stop(this.getCanvas());
        }
        this.rovers[ri].initialize(this.getCanvas());
        this.activeRoverName = roverControllerName;
    }
    /** Pause a controller of the current rover */
    pauseRoverController(roverControllerName) {
        if (this.rovers.length < 1)
            throw new Error("can't activate controller as there is no rover deployed");
        const ri = this.rovers.findIndex((r) => r.controller?.name == roverControllerName);
        if (ri == -1)
            throw new Error(`rover controller with name ${roverControllerName} doesn't exist and can't be activated`);
        this.rovers[ri].isActive = false;
    }
    /** Removes rover safely disabling the current controls */
    removeRover(roverControllerName) {
        if (this.rovers.length < 1)
            throw new Error("can't remove controller as there is no rover deployed");
        const ri = this.rovers.findIndex((r) => r.controller?.name == roverControllerName);
        if (ri == -1)
            throw new Error(`rover controller with name ${roverControllerName} doesn't exist and can't be removed`);
        const rover = this.rovers[ri];
        if (rover.isActive) {
            rover.stop(this.getCanvas());
            this.activeRoverName = "";
        }
        this.rovers.splice(ri, 1);
    }
    getRoverByControllerName(roverControllerName) {
        if (this.rovers.length < 1)
            throw new Error("can't find controller as there is no rover deployed");
        const ri = this.rovers.findIndex((r) => r.controller?.name == roverControllerName);
        const rover = this.rovers[ri];
        return rover;
    }
    //===============================
    // SECTION: Core Rendering Loop
    //===============================
    /** Initializes clock and starts the animation loop */
    startRender() {
        if (!this.scene)
            throw new Error("no scene was added to render");
        if (!this.camera)
            throw new Error("no camera was added to render");
        this.clock = new THREE.Clock();
        this.renderer.setAnimationLoop(this.animate.bind(this));
    }
    /** Internal animation callback for each frame */
    animate() {
        const delta = this.clock.getDelta();
        this.objects3D.forEach((obj3D) => {
            obj3D.animationMixer?.update(delta);
        });
        this.timeFromStart += delta;
        this._lastDelta = delta;
        this.runBehavioursBefore(delta);
        this.css2DRender.render(this.scene, this.camera);
        this.renderer.render(this.scene, this.camera);
        this.runBehavioursAfter(delta);
    }
    /** Returns time elapsed since rendering started */
    getTimeFromStart() {
        return this.timeFromStart;
    }
    /** Resets the elapsed time counter to zero */
    resetTimeFromStart() {
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
    flattenBehaviours(arrayToFlatten, key, isAdding = true, throwError = true) {
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
        }
    }
    /** Executes all beforeRender callbacks */
    runBehavioursBefore(delta) {
        this.processes.forEach((prcs) => {
            if (prcs.beforeRender)
                prcs.beforeRender(this, delta);
        });
        this.objects3DBehaviourBefore.forEach((key) => {
            const obj = this.objects3D.get(key);
            if (!obj || !obj.beforeRender) {
                throw new Error(`can't run before behaviour for key ${key}`);
            }
            obj.beforeRender(this, delta);
        });
        this.lightsBehaviourBefore.forEach((key) => {
            const light = this.lights.get(key);
            if (!light || !light.beforeRender) {
                throw new Error(`can't run before behaviour for light ${key}`);
            }
            light.beforeRender(this, delta);
        });
    }
    /** Executes all afterRender callbacks */
    runBehavioursAfter(delta) {
        this.processes.forEach((prcs) => {
            if (prcs.afterRender)
                prcs.afterRender(this, delta);
        });
        this.objects3DBehaviourAfter.forEach((key) => {
            const obj = this.objects3D.get(key);
            if (!obj || !obj.afterRender) {
                throw new Error(`can't run after behaviour for key ${key}`);
            }
            obj.afterRender(this, delta);
        });
        this.lightsBehaviourAfter.forEach((key) => {
            const light = this.lights.get(key);
            if (!light || !light.afterRender) {
                throw new Error(`can't run after behaviour for light ${key}`);
            }
            light.afterRender(this, delta);
        });
    }
}
