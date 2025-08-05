import { ITerraformState } from '../../../../../dist/lib/interfaces/terraformState.interface';
import { Rover } from '../../../../../dist/lib/rover/rover';
import { CreateRoverController } from '../../../../../dist/lib/rover/rover-controller';

export const defaultControllerName = 'default';
export const secondControllerName = 'second';

const defaultRover = new Rover();
defaultRover.controller = CreateRoverController(defaultControllerName);

const secondRover = new Rover();
secondRover.controller = CreateRoverController(secondControllerName);

export const ExampleSceneState: ITerraformState = {
  objects: [],
  lights: [],
  audios: [],
  roverConfig: {
    rover: [defaultRover, secondRover],
    activeController: defaultControllerName,
  },
};
