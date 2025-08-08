import {
  TerraformStateInterface,
  Rover,
  createRoverController,
} from '../../../../../dist/index';

export const defaultControllerName = 'default';
export const secondControllerName = 'second';

const defaultRover = new Rover();
defaultRover.controller = createRoverController(defaultControllerName);

const secondRover = new Rover();
secondRover.controller = createRoverController(secondControllerName);

export const ExampleSceneState: TerraformStateInterface = {
  objects: [],
  lights: [],
  processes: [],
  audios: [],
  roverConfig: {
    rover: [defaultRover, secondRover],
    activeController: defaultControllerName,
  },
};
