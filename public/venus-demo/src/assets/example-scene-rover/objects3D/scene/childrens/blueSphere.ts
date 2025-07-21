import {
  Object3D,
  Object3DEventMap,
} from 'three';
import {
  IBehaviourObject,
} from '../../../../../../../../dist/lib/interfaces/behaviourObject.interface';
import { VenusRenderer } from '../../../../../../../../dist/lib/renderer/venusRenderer';
import { defaultControllerActions as a } from '../../../rover/controllers/default.controller';

export class BlueSphere implements IBehaviourObject<Object3D, null> {
  obj?: Object3D<Object3DEventMap> | undefined;

  key = 'blueSphere';

  BeforeRender?(venusRenderer: VenusRenderer, delta: number): void {
    const aControllerRef = venusRenderer.GetActiveRoverController();
    if (aControllerRef.disabled == true) return;

    if (
      this.obj &&
      (aControllerRef.inputs[a.down].isTapped ||
        aControllerRef.inputs[a.up].isTapped)
    ) {
      const direction =
        (aControllerRef.inputs[a.down].isTapped ? -1 : 0) +
        (aControllerRef.inputs[a.up].isTapped ? 1 : 0);

      this.obj.position.y += direction * delta * 2;
    }
  }
}
