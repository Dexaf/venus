import { Component, OnInit } from '@angular/core';
import { Terraform } from '../../../../dist/lib/terraform/terraform';
import { VenusRenderer } from '../../../../dist/lib/renderer/venusRenderer';
import { ExampleSceneState } from '../assets/example-scene/example-scene-state';
import { OrthographicCamera } from 'three';

@Component({
  selector: 'terraform-component',
  template: ` <div id="expander">
    <div id="terraform-rendered-container"></div>
  </div>`,
  styleUrl: './terraform.component.css',
})
export class TerraformComponent implements OnInit {
  venusRenderer: VenusRenderer | null = null;
  terraform: Terraform | null = null;

  ngOnInit(): void {
    this.terraform = new Terraform();
    this.terraform.LoadState(ExampleSceneState);
    this.venusRenderer = this.terraform.LoadRenderer(
      'terraform-rendered-container'
    );

    this.updateCameraFrustrum();
    this.venusRenderer.camera!.position.set(0, 10, 10);
    this.venusRenderer.camera!.lookAt(0, 0, 0);

    this.venusRenderer.StartRender();
  }

  private updateCameraFrustrum() {
    const doc = document.getElementById('terraform-rendered-container');
    const aspect = doc!.clientWidth / doc!.clientHeight;
    const d = 40;
    (this.venusRenderer!.camera as OrthographicCamera).left = -d * aspect;
    (this.venusRenderer!.camera as OrthographicCamera).right = d * aspect;
    (this.venusRenderer!.camera as OrthographicCamera).top = d;
    (this.venusRenderer!.camera as OrthographicCamera).bottom = -d;
    (this.venusRenderer!.camera as OrthographicCamera).near = -30;
    (this.venusRenderer!.camera as OrthographicCamera).far = 2000;
    (this.venusRenderer!.camera as OrthographicCamera).updateProjectionMatrix();
  }
}
