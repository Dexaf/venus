import { AnimationMixer } from 'three';
import { ILocatedBehaviourObject3D } from '../../../../../../dist/lib/interfaces/terraformObjects.interface';

const characterKey = 'character_0';

export const character: ILocatedBehaviourObject3D = {
  gltfPath: '/assets/gltf/character/character.gltf',
  key: characterKey,
  OnAdd: (venusRenderer) => {
    const objRef = venusRenderer.GetObject3D(characterKey);
    if (!objRef) throw new Error(`can't find ${characterKey} in OnAdd`);

    objRef.obj.position.set(-10, 0, -40);

    objRef.obj.traverse((child) => {
      child.castShadow = true;
    });

    objRef.animationMixer = new AnimationMixer(objRef!.obj);
    if (objRef.obj.animations.length > 0) {
      const action = objRef.animationMixer.clipAction(objRef.obj.animations[0]);
      action.paused = true;
    }
  },
};
