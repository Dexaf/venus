import { Component, OnInit } from '@angular/core';
import { Terraform } from '../../../../dist/lib/terraform/terraform';
import { VenusRenderer } from '../../../../dist/lib/renderer/venusRenderer';
import { ExampleSceneState } from '../assets/example-scene/example-scene-state';

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
    this.venusRenderer.StartRender();
  }
}
