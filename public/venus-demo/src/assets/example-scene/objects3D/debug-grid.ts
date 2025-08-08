import { GridHelper, Object3D } from 'three';
import { BehaviourObjectInterface } from '../../../../../../dist/index';

const debugGridKey = 'grid_0';

export const debugGrid: BehaviourObjectInterface<Object3D> = {
  obj: new GridHelper(150, 150),
  key: debugGridKey,
};
