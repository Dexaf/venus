import {
  BoxGeometry,
  DirectionalLight,
  Mesh,
  MeshPhongMaterial,
  Object3D,
  PlaneGeometry,
} from 'three';
import {
  createRoverController,
  Rover,
  TerraformStateInterface,
  BehaviourObjectInterface,
} from '../../../../../dist/index';
import { degToRad } from 'three/src/math/MathUtils.js';

export const defaultControllerName = 'default';

const defaultRover = new Rover();
defaultRover.controller = createRoverController(defaultControllerName);

const cubeGeo = new BoxGeometry(1, 1, 1);
const cubeMat = new MeshPhongMaterial({ color: '#8AC' });
const cube: BehaviourObjectInterface<Object3D> = {
  obj: new Mesh(cubeGeo, cubeMat),
  key: 'cube',
  onAdd(vr) {
    this.obj!.castShadow = true;
    this.obj!.rotateY(degToRad(45));
  },
};

const planeGeo = new PlaneGeometry(200, 200);
const planeMat = new MeshPhongMaterial({ color: '#fff' });
const plane: BehaviourObjectInterface<Object3D> = {
  obj: new Mesh(planeGeo, planeMat),
  key: 'plane',
  onAdd(venusRenderer) {
    this.obj!.traverse((o) => {
      o!.receiveShadow = true;
    });
    this.obj!.rotation.x = Math.PI * -0.5;
    this.obj!.position.set(0, -5, 0);
  },
};

const color = 0xffffff;
const intensity = 1.25;
const objLight = new DirectionalLight(color, intensity);
const light = {
  key: 'light',
  obj: objLight,
  onAdd() {
    light.obj!.position.set(4, 5, 5);
    light.obj!.target.position.set(0, 0, 0);
    light.obj!.castShadow = true;
    light.obj!.shadow.camera.near = 0.1;
    light.obj!.shadow.camera.far = 100;
    const cameraSize = 10;
    light.obj!.shadow.camera.top = cameraSize;
    light.obj!.shadow.camera.right = cameraSize;
    light.obj!.shadow.camera.bottom = -cameraSize;
    light.obj!.shadow.camera.left = -cameraSize;
    light.obj!.shadow.bias = 0.01;
  },
} as BehaviourObjectInterface<DirectionalLight>;

export const ExampleSceneState: TerraformStateInterface = {
  objects: [cube, plane],
  lights: [light],
  audios: [],
  processes: [],
  roverConfig: {
    rover: [defaultRover],
    activeController: defaultControllerName,
  },
};
