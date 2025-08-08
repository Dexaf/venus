import { TerraformStateInterface } from '../../../../../dist/index';
import { getCamera } from './camera/camera';
import { dirLight } from './lights/dir-light';
import { Character } from './objects3D/character.v2';
import { debugGrid } from './objects3D/debug-grid';
import { plane } from './objects3D/plane';
import { debugSpline } from './objects3D/debug-spline';

export const ExampleSceneState: TerraformStateInterface = {
  camera: getCamera(),
  objects: [new Character(), plane, debugSpline, debugGrid],
  lights: [dirLight],
  processes: [],
  audios: [],
  roverConfig: {
    rover: [],
    activeController: null,
  },
};
