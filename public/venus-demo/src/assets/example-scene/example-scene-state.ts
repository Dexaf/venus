import { ITerraformState } from '../../../../../dist/lib/interfaces/terraformState.interface';
import { GetCamera } from './camera/camera';
import { dirLight } from './lights/dirLight';
import { character } from './objects3D/character.v2';
import { debugGrid } from './objects3D/debugGrid';
import { plane } from './objects3D/plane';
import { debugSpline } from './objects3D/debugSpline';

export const ExampleSceneState: ITerraformState = {
  camera: GetCamera(),
  objects: [new character(), plane, debugSpline, debugGrid],
  lights: [dirLight],
  audios: [],
};
