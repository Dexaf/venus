import { Object3D, Object3DEventMap } from 'three';
import {
  IBehaviourObject,
  IBehaviourObjectChildren,
} from '../../../../../../../dist/lib/interfaces/behaviourObject.interface';
import { VenusRenderer } from '../../../../../../../dist/lib/renderer/venusRenderer';
import { defaultControllerActions as a } from '../../rover/controllers/default.controller';
import { BlueSphere } from './childrens/blueSphere';

interface sceneProperites {
  divId: string;
  div: HTMLElement | null;
}

export class Scene implements IBehaviourObject<Object3D, sceneProperites> {
  obj?: Object3D<Object3DEventMap> | undefined;

  key = 'scene_0';

  loadPath = '/assets/gltf/diorama/Diorama_Test.gltf';

  properties: sceneProperites = {
    divId: 'command-log',
    div: null,
  };

  childrens?: IBehaviourObjectChildren<Object3D<Object3DEventMap>>[] = [
    {
      name: 'SM_BlueSphere',
      behaviour: new BlueSphere(),
    },
  ];

  OnAdd?(venusRenderer: VenusRenderer): void {
    if (!this.obj) return;
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
        <hr/>  
        <b>Click is tapped</b>: ${aControllerRef.inputs[a.click].isTapped}
        from <b>${aControllerRef.inputs[a.click].value}</b>
        <br/> 
        <b>Click is pressed</b>: ${aControllerRef.inputs[a.click].isPressed}
        from <b>${aControllerRef.inputs[a.click].value}</b>
      `;
  }
}
