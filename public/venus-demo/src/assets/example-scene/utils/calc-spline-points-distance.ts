import { CatmullRomCurve3 } from 'three';

export const CalcSplinePointsDistance = (
  Pi: number,
  Pf: number,
  curve: CatmullRomCurve3
): number => {
  let length = 0;

  //to allow to go back
  if (Pi > Pf) {
    let tmp = Pi;
    Pi = Pf;
    Pf = tmp;
  }

  Pf *= 100;
  Pi *= 100;

  for (let i = Pi; i < Pf; i++) {
    const point_a = curve.getPoint(i / 100);
    const point_b = curve.getPoint((i + 1) / 100);
    length += point_a.distanceTo(point_b);
  }

  return Number.parseFloat(length.toFixed(2));
};
