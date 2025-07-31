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
    click: {
      type: 'pointer',
      value: 'pointerdown',
      alias: 'click',
      isTapped: false,
    },
    wheel: {
      type: 'wheel',
      value: 'wheel',
      alias: 'wheel',
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
  click: 'click',
  wheel: 'wheel',
};
