import {
  CatmullRomCurve3,
  Vector3,
  BufferGeometry,
  LineBasicMaterial,
  Line,
} from 'three';
import { IBehaviourPrimitiveObject3D } from '../../../../../../dist/lib/interfaces/terraformObjects.interface';

export const debugSplineKey = 'spline_0';

export const catmullRomCurve3Params = [
  new Vector3(-10, 0, -40),
  new Vector3(10, 0, 0),
  new Vector3(-10, 0, 40),
];

const GetDebugSpline = () => {
  const curve = new CatmullRomCurve3([...catmullRomCurve3Params]);
  const points = curve.getPoints(20);
  const geometry = new BufferGeometry().setFromPoints(points);
  const material = new LineBasicMaterial({ color: 0xff0000 });
  const curvedObject = new Line(geometry, material);

  return curvedObject;
};

export const debugSpline: IBehaviourPrimitiveObject3D = {
  obj: GetDebugSpline(),
  key: debugSplineKey,
};
