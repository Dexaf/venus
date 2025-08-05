import { Component, OnInit } from '@angular/core';
import { PCFShadowMap, PerspectiveCamera } from 'three';
import { VenusRenderer } from '../../../../dist/lib/renderer/venusRenderer';
import { Terraform } from '../../../../dist/lib/terraform/terraform';
import { loadSceneCommandEventsLocal } from '../assets/example-scene-rover-mobile/load-scene-command-events-local';
import {
  defaultControllerName,
  ExampleSceneState,
} from '../assets/example-scene-rover-mobile/example-scene-state';

@Component({
  selector: 'rover-mobile',
  templateUrl: './rover-mobile.component.html',
  styleUrl: './rover-mobile.component.css',
})
export class RoverMobileComponent implements OnInit {
  venusRenderer: VenusRenderer | null = null;
  containerId = 'canvas-container';
  activeController = defaultControllerName;

  ngOnInit(): void {
    const containerDiv = document.getElementById(this.containerId);
    const state = ExampleSceneState;
    state.camera = this.setCamera(containerDiv!);

    const terraform = new Terraform();
    terraform.LoadState(state);
    this.venusRenderer = terraform.LoadRenderer(this.containerId);
    this.venusRenderer.renderer.shadowMap.enabled = true;
    this.venusRenderer.renderer.shadowMap.type = PCFShadowMap;

    this.venusRenderer.StartRender();

    loadSceneCommandEventsLocal(this.venusRenderer);
  }

  private setCamera(containerDiv: HTMLElement) {
    const height = containerDiv.clientHeight;
    const width = containerDiv.clientWidth;
    const camera = new PerspectiveCamera(75, width / height, 0.1, 100);
    camera.position.z = 5;
    camera.position.y = 5;
    camera.lookAt(0, 0, 0);
    return camera;
  }
}
