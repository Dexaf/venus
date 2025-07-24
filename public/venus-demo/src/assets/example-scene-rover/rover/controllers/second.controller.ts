import { IRoverController } from '../../../../../../../dist/lib/interfaces/roverController.interface';

export const secondController: IRoverController = {
  inputs: {
    up: {
      type: 'keyboard',
      value: 'w',
      alias: 'up',
      isTapped: false,
    },
    down: {
      type: 'keyboard',
      value: 's',
      alias: 'down',
      isTapped: false,
    },
    click: {
      type: 'pointer',
      value: 'pointerdown',
      alias: 'click',
      isTapped: false,
    },
  },
  disabled: false,
  events: [],
  name: 'second',
};

export const defaultControllerActions = {
  up: 'up',
  down: 'down',
  click: 'click',
};
