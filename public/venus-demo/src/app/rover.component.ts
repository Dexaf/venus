import { Component, OnDestroy, OnInit } from '@angular/core';
import { PerspectiveCamera } from 'three';
import { ExampleSceneState } from '../assets/example-scene-rover/example-scene-state';
import { VenusRenderer } from '../../../../dist/lib/renderer/venusRenderer';
import { Terraform } from '../../../../dist/lib/terraform/terraform';

@Component({
  selector: 'rover',
  template: `
    <div id="expander">
      <div id="terraform-w-rover-rendered-container"></div>
    </div>
    <div id="ui">
      <p id="command-log"></p>
      <p id="keyboard-log"></p>
      <button (click)="toggle()">Toggle Controllers</button>
    </div>
  `,
  styleUrl: './rover.component.css',
})
export class RoverComponent implements OnInit, OnDestroy {
  venusRenderer: VenusRenderer | null = null;
  containerId = 'terraform-w-rover-rendered-container';
  activeController = 'default';

  ngOnInit(): void {
    const containerDiv = document.getElementById(this.containerId);
    const state = ExampleSceneState;
    state.camera = this.setCamera(containerDiv!);

    const terraform = new Terraform();
    terraform.LoadState(state);
    this.venusRenderer = terraform.LoadRenderer(this.containerId);
    this.venusRenderer.StartRender();

    this.startKeyboardLog();
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

  private startKeyboardLog() {
    const div = document.getElementById('keyboard-log');
    div!.innerHTML = `
      last pressed key is NONE
      `;
    document.addEventListener('keydown', this.print);
    document.addEventListener('pointerdown', this.printPointer);
  }

  private print(e: KeyboardEvent) {
    const div = document.getElementById('keyboard-log');
    div!.innerHTML = `last pressed key is ${e.key}`;
  }

  private printPointer(e: PointerEvent) {
    const div = document.getElementById('keyboard-log');
    div!.innerHTML = `last pressed key is POINTER CLICK`;
  }

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.print);
    document.removeEventListener('pointerdown', this.printPointer);
    //removes events listeners
    this.venusRenderer?.RemoveRover();
  }

  toggle() {
    if (this.activeController == 'default') this.activeController = 'second';
    else this.activeController = 'default';

    const canvas = document.querySelector(
      '#terraform-w-rover-rendered-container>canvas'
    );
    this.venusRenderer?.ActivateRoverController(
      this.activeController,
      canvas as HTMLCanvasElement
    );
  }
}
