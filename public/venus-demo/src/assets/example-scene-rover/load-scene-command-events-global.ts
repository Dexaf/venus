import {
  PointerButtons,
  Reaction,
  RoverControllerInterface,
} from '../../../../../dist/lib/interfaces/rover-controller.interface';
import { VenusRenderer } from '../../../../../dist/lib/renderer/venusRenderer';
import { Rover } from '../../../../../dist/lib/rover/rover';
import { secondControllerName } from './example-scene-state';

export const loadSceneCommandEventsGlobal = (venusRenderer: VenusRenderer) => {
  const rover = venusRenderer.GetRoverByControllerName(secondControllerName);
  rover.controller.reactions.set('keyboardFlashPress', () => {
    pressReaction(venusRenderer.activeRover);
  });
  rover.controller.reactions.set('keyboardFlashHold', () => {
    holdedReaction(venusRenderer.activeRover);
  });
  rover.controller.reactions.set('keyboardDeflashRel', () => {
    releaseReaction(venusRenderer.activeRover);
  });
  rover.controller.reactions.set('wheelFlash', () => {
    wheelUseReaction(venusRenderer.activeRover);
  });

  rover.controller.reactions.set('touchFlashTDown', (e: PointerEvent) => {
    touchDownReaction(e);
  });

  rover.controller.reactions.set('touchDeflashTUp', (e: PointerEvent) => {
    touchUpReaction(e, venusRenderer.activeRover.controller);
  });

  rover.controller.reactions.set('touchFlashTMove', (e: PointerEvent) => {
    touchMoveReaction(e);
  });
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

const releaseReaction: Reaction = (rover: Rover) => {
  const key = rover.controller.keys.released.input;
  const elem = document.getElementById(key);
  if (elem) elem.classList.remove('active');
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

const touchDownReaction: Reaction = (e: PointerEvent | null) => {
  if (e?.type == 'pointerdown')
    switch (e.buttons) {
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

const touchUpReaction: Reaction = (
  e: PointerEvent | null,
  controller: RoverControllerInterface
) => {
  const wheelUseIsActive = controller.wheel.event != null;
  if (e?.type == 'pointerup') {
    document.getElementById('MouseLeft')?.classList.remove('active');
    document.getElementById('MouseRight')?.classList.remove('active');
    if (wheelUseIsActive == false) {
      document.getElementById('MouseWheel-U')?.classList.remove('active');
      document.getElementById('MouseWheel-L')?.classList.remove('active');
    }
  }
};

let timeoutId: any = 0;

const touchMoveReaction: Reaction = (e: PointerEvent | null) => {
  if (e?.type != 'pointermove') return;

  timeoutId = setTimeout(() => {
    document.getElementById('MouseBody')?.classList.remove('active');
  }, 30);
  
  document.getElementById('MouseBody')?.classList.add('active');
};
