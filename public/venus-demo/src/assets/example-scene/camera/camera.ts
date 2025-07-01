import { OrthographicCamera } from 'three';

const aspect = 0.79;
const d = 40;

export const GetCamera = () => {
  const camera = new OrthographicCamera(
    -d * aspect,
    d * aspect,
    d,
    -d,
    -30,
    2000
  );

  camera.position.set(0, 10, 10);
  camera.lookAt(0, 0, 0);

  return camera;
};
