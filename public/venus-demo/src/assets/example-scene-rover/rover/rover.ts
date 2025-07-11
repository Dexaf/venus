import { Rover } from '../../../../../../dist/lib/rover/rover';
import { defaultController } from './controllers/default.controller';
import { secondController } from './controllers/second.controller';

export const getRover = () => {
  const rover = new Rover();
  rover.AddController(defaultController);
  rover.AddController(secondController);
  return rover;
};
