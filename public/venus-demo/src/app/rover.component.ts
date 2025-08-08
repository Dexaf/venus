import { Component, OnInit } from '@angular/core';
import { PerspectiveCamera } from 'three';
import {
  defaultControllerName,
  ExampleSceneState,
  secondControllerName,
} from '../assets/example-scene-rover/example-scene-state';
import { VenusRenderer } from '../../../../dist/index';
import { Terraform } from '../../../../dist/index';
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
    terraform.loadState(state);
    this.venusRenderer = terraform.loadRenderer(this.containerId);
    this.venusRenderer.startRender();

    loadSceneCommandEventsLocal(this.venusRenderer);
    loadSceneCommandEventsGlobal(this.venusRenderer);
  }

  swtichController() {
    if (
      this.venusRenderer!.activeRover.controller.name == defaultControllerName
    ) {
      this.activeController = secondControllerName;
      this.venusRenderer!.activateRoverController(secondControllerName);
    } else {
      this.activeController = defaultControllerName;
      this.venusRenderer!.activateRoverController(defaultControllerName);
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
