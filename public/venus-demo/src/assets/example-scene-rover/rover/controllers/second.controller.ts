import { IRoverController } from '../../../../../../../dist/lib/interfaces/roverController.interface';

export const secondController: IRoverController = {
  inputs: {
    up: {
      type: 'keyboard',
      value: 'w',
      alias: 'up',
      isTapped: false,
      isPressed: false
    },
    down: {
      type: 'keyboard',
      value: 's',
      alias: 'down',
      isTapped: false,
      isPressed: false
    },
    click: {
      type: 'pointer',
      value: 'pointerdown',
      alias: 'click',
      isTapped: false,
      isPressed: false
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
