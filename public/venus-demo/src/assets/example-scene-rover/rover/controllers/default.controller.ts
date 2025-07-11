import { IRoverController } from '../../../../../../../dist/lib/interfaces/roverController.interface';

export const defaultController: IRoverController = {
  inputs: {
    up: {
      type: 'keyboard',
      value: 'ArrowUp',
      alias: 'up',
      isTapped: false,
    },
    down: {
      type: 'keyboard',
      value: 'ArrowDown',
      alias: 'down',
      isTapped: false,
    },
  },
  disabled: false,
  events: [],
  name: 'default',
};

export const defaultControllerActions = {
  up: 'up',
  down: 'down',
};
