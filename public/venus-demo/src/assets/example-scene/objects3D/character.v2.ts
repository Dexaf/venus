import {
  AnimationMixer,
  CatmullRomCurve3,
  Object3D,
  Object3DEventMap,
  Vector3,
} from 'three';
import {
  VenusRenderer,
  BehaviourObjectInterface,
} from '../../../../../../dist/index';
import { CalcSplinePointsDistance } from '../utils/calc-spline-points-distance';
import { lerp } from '../utils/lerp';

export interface ICharacterProperties {
  speed: number;
  startSec: number;
  currSec: number;
  targSec: number;
  shouldMove: boolean;
  timeToTarget: number;
  currTimeToTarget: number;
}

const characterKey = 'character_0';

export class Character implements BehaviourObjectInterface<Object3D> {
  //IT'S GOING TO BE DEFINED BY TERRAFORM
  obj!: Object3D<Object3DEventMap>;
  loadPath = '/assets/gltf/character/character.gltf';
  key = characterKey;
  properties: ICharacterProperties = {
    speed: 5, // percentage/seconds
    startSec: 0, // percentage
    currSec: 0, // percentage
    targSec: 0, // percentage
    shouldMove: false,
    timeToTarget: 0, // seconds
    currTimeToTarget: 0, // seconds
  };
  animationMixer: AnimationMixer | undefined;

  onAdd(venusRenderer: VenusRenderer): void {
    this.obj.position.set(-10, 0, -40);

    this.obj.traverse((child) => {
      child.castShadow = true;
    });

    this.animationMixer = new AnimationMixer(this.obj);
    const action = this.animationMixer.clipAction(this.obj.animations![0]);
    action.paused = true;

    venusRenderer.setSceneStateCallback(
      'scroll_progress',
      'character',
      'OnScrollProgressUpdate',
      () => {
        this.onScrollProgressUpdate(venusRenderer);
      }
    );
  }

  beforeRender?(venusRenderer: VenusRenderer, delta: number): void {
    if (this.properties.shouldMove == false) return;

    this.properties.currTimeToTarget += delta;

    if (this.properties.currTimeToTarget > this.properties.timeToTarget) {
      this.properties.shouldMove = false;
      this.properties.timeToTarget = 0;
      this.properties.currTimeToTarget = 0;

      const action = this.animationMixer?.clipAction(this.obj.animations![0]);
      action!.fadeOut(0.25);
      action!.paused = true;
    } else {
      const curve =
        venusRenderer.getSceneStateVarValue<CatmullRomCurve3>('curve');
      const currPos = curve.getPointAt(this.properties.currSec);
      this.properties.currSec = lerp(
        this.properties.startSec,
        this.properties.targSec,
        this.properties.currTimeToTarget / this.properties.timeToTarget
      );
      const newPos = curve.getPointAt(this.properties.currSec);

      const direction = newPos.clone().sub(currPos);
      direction.y = 0;
      direction.normalize();

      const forward = new Vector3(0, 0, 1);
      let angle = forward.angleTo(direction);
      const cross = forward.cross(direction);
      const sign = cross.y < 0 ? -1 : 1;

      angle = angle * sign;
      this.obj.position.set(newPos.x, newPos.y, newPos.z);
      this.obj.rotation.y = angle;
    }
  }
  //*
  // UTILS
  //  */
  //SECTION - utils functions
  onScrollProgressUpdate = (venusRenderer: VenusRenderer) => {
    const progress =
      venusRenderer.getSceneStateVarValue<string>('scroll_progress');
    const catMullCurve = venusRenderer.getSceneStateVarValue(
      'curve'
    ) as CatmullRomCurve3;

    this.updateObjProperties(progress, catMullCurve);
    this.handleActionState();
  };

  updateObjProperties = (progress: string, catMullCurve: CatmullRomCurve3) => {
    if (!this.properties) return;

    this.properties.startSec = this.properties.currSec;
    this.properties.shouldMove = true;
    this.properties.currTimeToTarget = 0;
    this.properties.timeToTarget = 0;

    //there are 100 nodes in the spline
    this.properties.targSec = Number.parseFloat(progress);
    const distance = CalcSplinePointsDistance(
      this.properties.startSec,
      this.properties.targSec,
      catMullCurve
    );

    this.properties.timeToTarget = Math.abs(distance / this.properties.speed);
  };

  handleActionState = () => {
    const action = this.animationMixer!.clipAction(this.obj.animations![0]);

    if (action && action.paused) {
      action.play();
      action.enabled = true;
      action.paused = false;
      action.fadeIn(0.2);
    }
  };
}
