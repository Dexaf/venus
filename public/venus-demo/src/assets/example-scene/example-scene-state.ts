import { ITerraformState } from '../../../../../dist/lib/interfaces/terraformState.interface';
import { GetCamera } from './camera/camera';
import { dirLight } from './lights/dirLight';
import { character } from './objects3D/character';
import { plane } from './objects3D/plane';

export const ExampleSceneState: ITerraformState = {
  camera: GetCamera(),
  objects: [character, plane],
  lights: [dirLight],
  audios: [],
};
