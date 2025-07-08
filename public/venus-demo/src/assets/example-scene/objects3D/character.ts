import {
  AnimationMixer,
  CatmullRomCurve3,
  Line,
  Object3D,
  Vector3,
} from 'three';
import { ILocatedBehaviourObject3D } from '../../../../../../dist/lib/interfaces/terraformObjects.interface';
import { VenusRenderer } from '../../../../../../dist/lib/renderer/venusRenderer';
import { CalcSplinePointsDistance } from '../utils/calcSplinePointsDistance';
import { IBehaviourObject } from '../../../../../../dist/lib/interfaces/behaviourObject.interface';
import { Lerp } from '../utils/lerp';

const characterKey = 'character_0';

const getProperties = () => {
  const map = new Map<string, any>();
  map.set('speed', 5); // percentage/seconds
  map.set('startSec', 0); //percentage
  map.set('currSec', 0); //percentage
  map.set('targSec', 0); //percentage
  map.set('shouldMove', false);
  map.set('timeToTarget', 0); // seconds
  map.set('currTimeToTarget', 0); // seconds

  return map;
};

const onAdd = (venusRenderer: VenusRenderer) => {
  const objRef = venusRenderer.GetObject3D(characterKey);
  if (!objRef) throw new Error(`can't find ${characterKey} in OnAdd`);

  objRef.obj.position.set(-10, 0, -40);

  objRef.obj.traverse((child) => {
    child.castShadow = true;
  });

  objRef.animationMixer = new AnimationMixer(objRef!.obj);
  const action = objRef.animationMixer.clipAction(objRef.animations![0]);
  action.paused = true;

  venusRenderer.SetSceneStateCallback(
    'scroll_progress',
    'character',
    'OnScrollProgressUpdate',
    () => {
      OnScrollProgressUpdate(venusRenderer);
    }
  );
};

const beforeRender = (venusRenderer: VenusRenderer, delta: number) => {
  const thisObjRef = venusRenderer.GetObject3D(characterKey);
  if (!thisObjRef) return;
  const shouldMove = thisObjRef.properties!.get('shouldMove');
  if (shouldMove) {
    thisObjRef.properties!.set(
      'currTimeToTarget',
      thisObjRef.properties!.get('currTimeToTarget') + delta
    );

    const currTimeToTarget = thisObjRef.properties!.get('currTimeToTarget');
    const timeToTarget = thisObjRef.properties!.get('timeToTarget');

    if (currTimeToTarget > timeToTarget) {
      thisObjRef.properties!.set('shouldMove', false);
      thisObjRef.properties!.set('timeToTarget', 0);
      thisObjRef.properties!.set('currTimeToTarget', 0);

      const action = thisObjRef.animationMixer?.clipAction(
        thisObjRef.animations![0]
      );
      action!.fadeOut(0.25);
      action!.paused = true;
    } else {
      let currSec = thisObjRef.properties!.get('currSec');
      const curve = venusRenderer.GetSceneStateVarValue('curve');
      const currPos = curve.getPointAt(currSec);
      const startSec = thisObjRef.properties!.get('startSec');
      const targSec = thisObjRef.properties!.get('targSec');
      thisObjRef.properties!.set(
        'currSec',
        Lerp(startSec, targSec, currTimeToTarget / timeToTarget)
      );
      currSec = thisObjRef.properties!.get('currSec');
      const newPos = curve.getPointAt(currSec);

      const direction = newPos.clone().sub(currPos);
      direction.y = 0;
      direction.normalize();
      const forward = new Vector3(0, 0, 1);
      let angle = forward.angleTo(direction);
      const cross = forward.cross(direction);
      const sign = cross.y < 0 ? -1 : 1;
      angle = angle * sign;
      thisObjRef.obj.position.set(newPos.x, newPos.y, newPos.z);
      thisObjRef.obj.rotation.y = angle;
    }
  }
};

//MAIN EXPORT
export const character: ILocatedBehaviourObject3D = {
  gltfPath: '/assets/gltf/character/character.gltf',
  properties: getProperties(),
  key: characterKey,
  OnAdd: onAdd,
  BeforeRender: beforeRender,
};

//SECTION - utils functions
export const OnScrollProgressUpdate = (venusRenderer: VenusRenderer) => {
  const progress = venusRenderer.GetSceneStateVarValue('scroll_progress');
  const catMullCurve = venusRenderer.GetSceneStateVarValue(
    'curve'
  ) as CatmullRomCurve3;
  const thisObjRef = venusRenderer.GetObject3D(characterKey);

  updateObjProperties(thisObjRef!, progress, catMullCurve);
  handleActionState(thisObjRef!);
};

const updateObjProperties = (
  thisObjRef: IBehaviourObject<Object3D>,
  progress: string,
  catMullCurve: CatmullRomCurve3
) => {
  thisObjRef.properties!.set('startSec', thisObjRef.properties!.get('currSec'));
  thisObjRef.properties!.set('shouldMove', true);
  thisObjRef.properties!.set('currTimeToTarget', 0);
  thisObjRef.properties!.set('timeToTarget', 0);

  //there are 100 nodes in the spline
  thisObjRef.properties!.set('targSec', progress);
  const distance = CalcSplinePointsDistance(
    thisObjRef.properties!.get('startSec'),
    Number.parseFloat(progress),
    catMullCurve
  );

  thisObjRef.properties!.set(
    'timeToTarget',
    Math.abs(Number.parseFloat(distance) / thisObjRef.properties!.get('speed'))
  );
};

const handleActionState = (thisObjRef: IBehaviourObject<Object3D>) => {
  const action = thisObjRef!.animationMixer!.clipAction(
    thisObjRef!.animations![0]
  );

  if (action && action.paused) {
    action.play();
    action.enabled = true;
    action.paused = false;
    action.fadeIn(0.2);
  }
};
//!SECTION - utils functions
