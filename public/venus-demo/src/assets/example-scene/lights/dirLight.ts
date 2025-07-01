import { DirectionalLight, Vector2 } from 'three';
import { IBehaviourLight } from '../../../../../../dist/lib/interfaces/terraformObjects.interface';

const lightKey = 'dir_light_0';

const getDirLight = () => {
  const dirLight = new DirectionalLight(0xffffff, 3);

  dirLight.castShadow = true;
  dirLight.position.set(10, 20, 10);

  const shadowQuality = 4;
  dirLight.shadow.mapSize = new Vector2(
    1024 * shadowQuality,
    1024 * shadowQuality
  );

  dirLight.shadow.camera.top = 120;
  dirLight.shadow.camera.left = -70;
  dirLight.shadow.camera.right = 70;
  dirLight.shadow.camera.bottom = -120;

  dirLight.shadow.camera.near = 0;
  dirLight.shadow.camera.far = 3000;

  return dirLight;
};

export const dirLight: IBehaviourLight = {
  light: getDirLight(),
  key: lightKey,
};
