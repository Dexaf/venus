import {
  AnimationMixer,
  CatmullRomCurve3,
  Object3D,
  Vector3,
} from 'three';
import { ILocatedBehaviourObject3D } from '../../../../../../dist/lib/interfaces/terraformObjects.interface';
import { VenusRenderer } from '../../../../../../dist/lib/renderer/venusRenderer';
import { CalcSplinePointsDistance } from '../utils/calcSplinePointsDistance';
import { IBehaviourObject } from '../../../../../../dist/lib/interfaces/behaviourObject.interface';
import { Lerp } from '../utils/lerp';

const characterKey = 'character_0';

export interface ICharacterProperties {
  speed: number;
  startSec: number;
  currSec: number;
  targSec: number;
  shouldMove: boolean;
  timeToTarget: number;
  currTimeToTarget: number;
}

const characterProperties: ICharacterProperties = {
  speed: 5, // percentage/seconds
  startSec: 0, // percentage
  currSec: 0, // percentage
  targSec: 0, // percentage
  shouldMove: false,
  timeToTarget: 0, // seconds
  currTimeToTarget: 0, // seconds
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
  const thisObjRef =
    venusRenderer.GetObject3D<ICharacterProperties>(characterKey);
  if (
    !thisObjRef ||
    !thisObjRef.properties ||
    !thisObjRef.properties.shouldMove
  )
    return;

  thisObjRef.properties.currTimeToTarget += delta;

  if (
    thisObjRef.properties.currTimeToTarget > thisObjRef.properties.timeToTarget
  ) {
    thisObjRef.properties.shouldMove = false;
    thisObjRef.properties.timeToTarget = 0;
    thisObjRef.properties.currTimeToTarget = 0;

    const action = thisObjRef.animationMixer?.clipAction(
      thisObjRef.animations![0]
    );
    action!.fadeOut(0.25);
    action!.paused = true;
  } else {
    const curve =
      venusRenderer.GetSceneStateVarValue<CatmullRomCurve3>('curve');
    const currPos = curve.getPointAt(thisObjRef.properties.currSec);
    thisObjRef.properties.currSec = Lerp(
      thisObjRef.properties.startSec,
      thisObjRef.properties.targSec,
      thisObjRef.properties.currTimeToTarget /
        thisObjRef.properties.timeToTarget
    );
    const newPos = curve.getPointAt(thisObjRef.properties.currSec);

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
};

//MAIN EXPORT
export const character: ILocatedBehaviourObject3D = {
  gltfPath: '/assets/gltf/character/character.gltf',
  properties: characterProperties,
  key: characterKey,
  OnAdd: onAdd,
  BeforeRender: beforeRender,
};

//SECTION - utils functions
export const OnScrollProgressUpdate = (venusRenderer: VenusRenderer) => {
  const progress =
    venusRenderer.GetSceneStateVarValue<string>('scroll_progress');
  const catMullCurve = venusRenderer.GetSceneStateVarValue(
    'curve'
  ) as CatmullRomCurve3;
  const thisObjRef =
    venusRenderer.GetObject3D<ICharacterProperties>(characterKey);

  updateObjProperties(thisObjRef!, progress, catMullCurve);
  handleActionState(thisObjRef!);
};

const updateObjProperties = (
  thisObjRef: IBehaviourObject<Object3D, ICharacterProperties>,
  progress: string,
  catMullCurve: CatmullRomCurve3
) => {
  if (!thisObjRef.properties) return;

  thisObjRef.properties.startSec = thisObjRef.properties.currSec;
  thisObjRef.properties.shouldMove = true;
  thisObjRef.properties.currTimeToTarget = 0;
  thisObjRef.properties.timeToTarget = 0;

  //there are 100 nodes in the spline
  thisObjRef.properties.targSec = Number.parseFloat(progress);
  const distance = CalcSplinePointsDistance(
    thisObjRef.properties.startSec,
    thisObjRef.properties.targSec,
    catMullCurve
  );

  thisObjRef.properties.timeToTarget = Math.abs(
    distance / thisObjRef.properties.speed
  );
};

const handleActionState = (
  thisObjRef: IBehaviourObject<Object3D, ICharacterProperties>
) => {
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
