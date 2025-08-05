import {
  PointerButtons,
  Reaction,
  RoverControllerInterface,
} from '../../../../../dist/lib/interfaces/rover-controller.interface';
import { VenusRenderer } from '../../../../../dist/lib/renderer/venusRenderer';
import { Rover } from '../../../../../dist/lib/rover/rover';
import { defaultControllerName } from './example-scene-state';

export const loadSceneCommandEventsLocal = (venusRenderer: VenusRenderer) => {
  const rover = venusRenderer.GetRoverByControllerName(defaultControllerName);

  rover.controller.keys.pressed.reactions.set('keyboardFlash', () => {
    pressReaction(rover);
  });
  rover.controller.keys.holded.reactions.set('keyboardFlash', () => {
    holdedReaction(rover);
  });
  rover.controller.keys.released.reactions.set('keyboardDeflash', () => {
    releaseReaction(rover);
  });
  rover.controller.wheel.reactions.set('wheel', () => {
    wheelUseReaction(rover);
  });

  rover.controller.touch.down.reactions.set('touchFlash', (e: PointerEvent) => {
    touchDownReaction(e);
  });
  rover.controller.touch.up.reactions.set('touchDeflash', (e: PointerEvent) => {
    touchUpReaction(e);
  });
  rover.controller.touch.moving.reactions.set(
    'touchFlash',
    (e: PointerEvent) => {
      touchMoveReaction(rover.controller, e);
    }
  );
};

const pressReaction: Reaction = (rover: Rover) => {
  const key = rover.controller.keys.pressed.input;
  const elem = document.getElementById(key);
  if (elem) elem.classList.add('active');
};

const holdedReaction: Reaction = (rover: Rover) => {
  const inputs = rover.controller.keys.holded.inputs;

  const keyboardKeys = Object.keys(inputs);
  for (let i = 0; i < keyboardKeys.length; i++) {
    const keyboardKey = keyboardKeys[i];
    const isActive = inputs[keyboardKey];
    if (isActive) {
      const elem = document.getElementById(keyboardKey);
      if (elem) elem.classList.add('active');
    }
  }
};

const wheelUseReaction: Reaction = (rover: Rover) => {
  if (rover.controller.wheel.event) {
    if (rover.controller.wheel.event.deltaY < 0)
      document.getElementById('MouseWheel-U')?.classList.add('active');
    else document.getElementById('MouseWheel-L')?.classList.add('active');
  } else {
    document.getElementById('MouseWheel-U')?.classList.remove('active');
    document.getElementById('MouseWheel-L')?.classList.remove('active');
  }
};

const releaseReaction: Reaction = (rover: Rover) => {
  const key = rover.controller.keys.released.input;
  const elem = document.getElementById(key);
  if (elem) elem.classList.remove('active');
};

const touchDownReaction: Reaction = (e: PointerEvent) => {
  switch (e!.buttons) {
    case PointerButtons.LeftTouch:
      document.getElementById('MouseLeft')?.classList.add('active');
      break;
    case PointerButtons.RightTouch:
      document.getElementById('MouseRight')?.classList.add('active');
      break;
    case PointerButtons.MiddleTouch:
      document.getElementById('MouseWheel-U')?.classList.add('active');
      document.getElementById('MouseWheel-L')?.classList.add('active');
      break;
  }
};

const touchUpReaction: Reaction = (e: PointerEvent) => {
  document.getElementById('MouseLeft')?.classList.remove('active');
  document.getElementById('MouseRight')?.classList.remove('active');
  document.getElementById('MouseWheel-U')?.classList.remove('active');
  document.getElementById('MouseWheel-L')?.classList.remove('active');
};

let timeoutId: any = 0;

const touchMoveReaction: Reaction = (
  controller: RoverControllerInterface,
  e: PointerEvent
) => {
  timeoutId = setTimeout(() => {
    document.getElementById('MouseBody')?.classList.remove('active');
  }, 30);
  if (controller.touch.moving.inputs.length > 0)
    document.getElementById('MouseBody')?.classList.add('active');
};
