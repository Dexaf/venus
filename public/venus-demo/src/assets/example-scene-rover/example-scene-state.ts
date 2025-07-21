import { ITerraformState } from '../../../../../dist/lib/interfaces/terraformState.interface';
import { dirLight } from './lights/dirLight';
import { Scene } from './objects3D/scene/scene';
import { getRover } from './rover/rover';

export const ExampleSceneState: ITerraformState = {
  objects: [new Scene()],
  lights: [dirLight],
  audios: [],
  roverConfig: {
    rover: getRover(),
    activeController: 0,
  },
};
