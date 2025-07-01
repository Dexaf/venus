import { PlaneGeometry, MeshStandardMaterial, Mesh } from 'three';
import { IBehaviourPrimitiveObject3D } from '../../../../../../dist/lib/interfaces/terraformObjects.interface';

const planeKey = 'plane';

const getPlane = () => {
  const planeGeometry = new PlaneGeometry(70, 120, 1, 1);
  const planeMaterial = new MeshStandardMaterial({ color: 0xffffff });
  const plane = new Mesh(planeGeometry, planeMaterial);
  plane.receiveShadow = true;
  plane.rotateX((Math.PI / 180) * -90);
  plane.position.y = -0.1;
  plane.receiveShadow = true;

  return plane;
};

export const plane: IBehaviourPrimitiveObject3D = {
  key: planeKey,
  obj: getPlane(),
};
