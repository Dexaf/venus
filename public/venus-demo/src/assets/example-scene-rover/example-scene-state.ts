import { ITerraformState } from '../../../../../dist/lib/interfaces/terraformState.interface';
import { dirLight } from './lights/dirLight';
import { Scene } from './objects3D/scene/scene';
import { getRover } from './rover/rover';

//TODO - make scene, test rover, refactor and go for release 1 of alfa?
export const ExampleSceneState: ITerraformState = {
  objects: [new Scene()],
  lights: [dirLight],
  audios: [],
  roverConfig: {
    rover: getRover(),
    activeController: 0,
  },
};
