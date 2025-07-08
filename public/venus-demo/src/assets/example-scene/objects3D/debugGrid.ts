import { GridHelper, Object3D } from 'three';
import { IBehaviourObject } from '../../../../../../dist/lib/interfaces/behaviourObject.interface';

const debuGridKey = 'grid_0';

export const debugGrid: IBehaviourObject<Object3D, any> = {
  obj: new GridHelper(150, 150),
  key: debuGridKey,
};
