import { Object3D, Object3DEventMap } from 'three';
import { IBehaviourObject } from '../../../../../../dist/lib/interfaces/behaviourObject.interface';
import { VenusRenderer } from '../../../../../../dist/lib/renderer/venusRenderer';
import { defaultControllerActions as a } from '../rover/controllers/default.controller';

interface sceneProperites {
  divId: string;
  div: HTMLElement | null;
  children: string[];
  blueOrb: Object3D | null;
}

export class Scene implements IBehaviourObject<Object3D, sceneProperites> {
  obj?: Object3D<Object3DEventMap> | undefined;

  key = 'scene_0';

  loadPath = '/assets/gltf/diorama/Diorama_Test.gltf';

  properties: sceneProperites = {
    divId: 'command-log',
    div: null,
    children: ['RedCube', 'SM_BlueSphere', 'SM_YellowCone', 'SM_Theforbidden'],
    blueOrb: null,
  };

  OnAdd?(venusRenderer: VenusRenderer): void {
    if (!this.obj) return;
    console.log(this.obj);
    this.obj.traverse((obj) => {
      if (this.properties.children.includes(obj.name)) console.log(obj);
      if (obj.name == 'SM_BlueSphere') this.properties.blueOrb = obj;
    });
    this.properties.div = document.getElementById(this.properties.divId);
  }

  BeforeRender(venusRenderer: VenusRenderer, delta: number): void {
    const aControllerRef = venusRenderer.GetActiveRoverController();
    if (aControllerRef.disabled == true) return;

    //DEBUG
    if (this.properties.div)
      this.properties.div.innerHTML = `
        <b>Up is tapped</b>: ${aControllerRef.inputs[a.up].isTapped} 
        from <b>${aControllerRef.inputs[a.up].value}</b>
        <br/> 
        <b>Down is tapped</b>: ${aControllerRef.inputs[a.down].isTapped}
        from <b>${aControllerRef.inputs[a.down].value}</b>
      `;

    const blueOrb = this.properties.blueOrb;
    if (
      blueOrb &&
      (aControllerRef.inputs[a.down].isTapped ||
        aControllerRef.inputs[a.up].isTapped)
    ) {
      const direction =
        (aControllerRef.inputs[a.down].isTapped ? -1 : 0) +
        (aControllerRef.inputs[a.up].isTapped ? 1 : 0);

      blueOrb.position.y += direction * delta * 2;
    }
  }
}
