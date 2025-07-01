import { GridHelper } from 'three';
import { IBehaviourPrimitiveObject3D } from '../../../../../../dist/lib/interfaces/terraformObjects.interface';

const debuGridKey = 'grid_0';

export const debugGrid: IBehaviourPrimitiveObject3D = {
  obj: new GridHelper(150, 150),
  key: debuGridKey,
};
