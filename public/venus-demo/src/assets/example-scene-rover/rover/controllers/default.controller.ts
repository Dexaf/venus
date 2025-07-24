import { IRoverController } from '../../../../../../../dist/lib/interfaces/roverController.interface';

export const defaultController: IRoverController = {
  inputs: {
    up: {
      type: 'keyboard',
      value: 'ArrowUp',
      alias: 'up',
      isTapped: false,
      isPressed: false
    },
    down: {
      type: 'keyboard',
      value: 'ArrowDown',
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
  name: 'default',
};

export const defaultControllerActions = {
  up: 'up',
  down: 'down',
  click: 'click',
};
