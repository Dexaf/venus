import { PlaneGeometry, MeshStandardMaterial, Mesh, Object3D } from 'three';
import { IBehaviourObject } from '../../../../../../dist/lib/interfaces/behaviourObject.interface';

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

export const plane: IBehaviourObject<Object3D, any> = {
  key: planeKey,
  obj: getPlane(),
};
