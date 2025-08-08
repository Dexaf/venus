import { Component, OnInit } from '@angular/core';
import { Terraform } from '../../../../dist/lib/terraform/terraform';
import { VenusRenderer } from '../../../../dist/index';
import { ExampleSceneState } from '../assets/example-scene/example-scene-state';
import { CatmullRomCurve3, OrthographicCamera } from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { catmullRomCurve3Params } from '../assets/example-scene/objects3D/debug-spline';

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
    this.terraform.loadState(ExampleSceneState);
    this.venusRenderer = this.terraform.loadRenderer(
      'terraform-rendered-container'
    );
    this.updateCameraFrustrum();
    this.venusRenderer.camera!.position.set(0, 10, 10);
    this.venusRenderer.camera!.lookAt(0, 0, 0);

    this.loadSceneState();
    this.venusRenderer.startRender();
    this.loadGsapHooks();
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

  loadSceneState() {
    if (this.venusRenderer) {
      this.venusRenderer.setSceneState('scroll_progress', 0, false);
      this.venusRenderer.setSceneState(
        'curve',
        new CatmullRomCurve3(catmullRomCurve3Params),
        false
      );
    }
  }

  private loadGsapHooks() {
    gsap.registerPlugin(ScrollTrigger);
    gsap.to(
      { a: 0 },
      {
        a: 1,
        scrollTrigger: {
          trigger: '#expander',
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: (self) => {
            if (this.venusRenderer)
              this.venusRenderer.setSceneState(
                'scroll_progress',
                self.progress.toFixed(2)
              );
          },
        },
      }
    );
  }
}
