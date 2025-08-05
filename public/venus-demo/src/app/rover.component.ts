import { Component, OnInit } from '@angular/core';
import { PerspectiveCamera } from 'three';
import {
  defaultControllerName,
  ExampleSceneState,
  secondControllerName,
} from '../assets/example-scene-rover/example-scene-state';
import { VenusRenderer } from '../../../../dist/lib/renderer/venusRenderer';
import { Terraform } from '../../../../dist/lib/terraform/terraform';
import { loadSceneCommandEventsLocal } from '../assets/example-scene-rover/load-scene-command-events-local';
import { loadSceneCommandEventsGlobal } from '../assets/example-scene-rover/load-scene-command-events-global';

@Component({
  selector: 'rover',
  templateUrl: './rover.component.html',
  styleUrl: './rover.component.css',
})
export class RoverComponent implements OnInit {
  venusRenderer: VenusRenderer | null = null;
  containerId = 'canvas';
  activeController = defaultControllerName;

  ngOnInit(): void {
    const containerDiv = document.getElementById(this.containerId);
    const state = ExampleSceneState;
    state.camera = this.setCamera(containerDiv!);

    const terraform = new Terraform();
    terraform.LoadState(state);
    this.venusRenderer = terraform.LoadRenderer(this.containerId);
    this.venusRenderer.StartRender();

    loadSceneCommandEventsLocal(this.venusRenderer);
    loadSceneCommandEventsGlobal(this.venusRenderer);
  }

  swtichController() {
    if (
      this.venusRenderer!.activeRover.controller.name == defaultControllerName
    ) {
      this.activeController = secondControllerName;
      this.venusRenderer!.ActivateRoverController(secondControllerName);
    } else {
      this.activeController = defaultControllerName;
      this.venusRenderer!.ActivateRoverController(defaultControllerName);
    }
  }

  private setCamera(containerDiv: HTMLElement) {
    const height = containerDiv.clientHeight;
    const width = containerDiv.clientWidth;
    const camera = new PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.x = 3;
    camera.position.y = 2;
    camera.lookAt(0, 0, 0);
    return camera;
  }
}
