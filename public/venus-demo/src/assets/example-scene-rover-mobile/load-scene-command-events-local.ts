import { Vector2, Vector3 } from 'three';
import { VenusRenderer } from '../../../../../dist/lib/renderer/venusRenderer';
import { defaultControllerName } from './example-scene-state';
import { magnitude2D, pointerEventClientCToVector2 } from '../../../../../dist';

export const loadSceneCommandEventsLocal = (venusRenderer: VenusRenderer) => {
  const rover = venusRenderer.GetRoverByControllerName(defaultControllerName);
  const cube = venusRenderer.GetObject3D('cube');

  if (!cube) return;

  rover.controller.touch.up.reactions.set('pointerup', (e: PointerEvent) => {
    //resets center coord if removing all the fingers
    //(pointerup fire only when ALL the touches goes up)
    lastMiddlePointPosition = null;
    lastTwoTouchDistance = 0;
  });

  /**
   * used for translation, calculating the distance between first and second click and using that delta to move the object
   */
  let lastMiddlePointPosition: Vector2 | null = null;
  let lastTwoTouchDistance: number = 0;
  rover.controller.touch.moving.reactions.set(
    'movecube',
    (e: PointerEvent | null) => {
      const log = document.getElementById('logger');
      //log!.innerHTML = rover.controller.touch.down.inputs.length.toString();

      switch (rover.controller.touch.down.inputs.length) {
        //translation
        case 1:
          if (e) {
            cube.obj!.rotateY(e.movementX * venusRenderer.lastDelta);
            cube.obj!.rotateOnWorldAxis(
              new Vector3(1, 0, 0),
              e.movementY * venusRenderer.lastDelta
            );
          }
          //resets center coord if moving only one
          //(pointerup fire only when ALL the touches goes up)
          lastMiddlePointPosition = null;
          lastTwoTouchDistance = 0;
          break;
        //translation (FIX) and scaling
        case 2:
          if (e) {
            const pntr1 = pointerEventClientCToVector2(
              rover.controller.touch.moving.inputs[0].event!
            );
            const pntr2 = pointerEventClientCToVector2(
              rover.controller.touch.moving.inputs[1].event!
            );

            //translation
            if (lastMiddlePointPosition != null) {
              const currMiddlePointPosition = pntr2
                .clone()
                .sub(pntr1)
                .divideScalar(2)
                .add(pntr1);

              const middlePointPositionDelta = currMiddlePointPosition
                .clone()
                .sub(lastMiddlePointPosition);

              cube.obj!.position.x +=
                middlePointPositionDelta.x * venusRenderer.lastDelta;
              cube.obj!.position.z +=
                middlePointPositionDelta.y * venusRenderer.lastDelta;

              lastMiddlePointPosition = currMiddlePointPosition;
            } else {
              lastMiddlePointPosition = pntr2
                .clone()
                .sub(pntr1)
                .divideScalar(2)
                .add(pntr1);
            }

            //scaling
            const distance = magnitude2D(pntr2.clone().sub(pntr1));
            if (lastTwoTouchDistance != 0) {
              const distanceDelta = distance - lastTwoTouchDistance;
              const currScale = cube.obj!.scale.x;
              const newScale =
                currScale + distanceDelta * venusRenderer.lastDelta;
              cube.obj!.scale.set(newScale, newScale, newScale);
            }
            lastTwoTouchDistance = distance;
          }
          break;
      }
    }
  );
};
