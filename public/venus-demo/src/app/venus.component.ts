import { Component, OnInit } from '@angular/core';
import { SetupRenderer } from '../../../../dist/lib/renderer/setupRenderer';
import { VenusRenderer } from '../../../../dist/lib/renderer/venusRenderer';
import * as THREE from 'three';
import { IBehaviourObject } from '../../../../dist/lib/interfaces/behaviourObject.interface';

@Component({
  selector: 'venus-component',
  template: `
    <div id="expander">
      <div id="venus-rendered-container"></div>
    </div>
  `,
  styleUrl: './venus.component.css',
})
export class VenusComponent implements OnInit {
  renderer: VenusRenderer | null = null;

  async ngOnInit() {
    const containerDiv = document.getElementById('venus-rendered-container');
    if (containerDiv) {
      this.renderer = SetupRenderer(containerDiv);
      const height = containerDiv.clientHeight;
      const width = containerDiv.clientWidth;
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 5;
      camera.position.y = 1;

      this.renderer.AddCamera(camera);

      this.renderer.StartRender();

      const planeSize = 40;

      const loader = new THREE.TextureLoader();
      const texture = loader.load('assets/checker.png');
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.magFilter = THREE.NearestFilter;
      texture.colorSpace = THREE.SRGBColorSpace;
      const repeats = planeSize / 2;
      texture.repeat.set(repeats, repeats);

      const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
      const planeMat = new THREE.MeshPhongMaterial({
        map: texture,
        side: THREE.DoubleSide,
      });
      const plane = {
        key: 'plane_0',
        obj: new THREE.Mesh(planeGeo, planeMat),
      } as IBehaviourObject<THREE.Object3D, null>;
      plane.obj!.rotation.x = Math.PI * -0.5;
      plane.obj!.position.y = -0.5;
      this.renderer.AddObject3D(plane);

      const cubeSize = 1;
      const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
      const cubeMat = new THREE.MeshPhongMaterial({ color: '#8AC' });
      const cube: IBehaviourObject<THREE.Object3D, null> = {
        key: 'cube_0',
        obj: new THREE.Mesh(cubeGeo, cubeMat),
        BeforeRender: (delta) => {
          cube.obj!.position.x = Math.sin(this.renderer!.GetTimeFromStart());
        },
      };
      this.renderer.AddObject3D(cube);

      const color = 0x00fff0;
      const intensity = 2;
      const light = {
        key: 'ambient_0',
        obj: new THREE.AmbientLight(color, intensity),
      } as IBehaviourObject<THREE.Light, null>;
      this.renderer.AddLights(light);

      this.renderer.AddAudioListener(new THREE.AudioListener());
      this.renderer.AddAudio({
        path: 'assets/sample.ogg',
        positionalConfig: { refDistance: 200, meshToAttachKey: 'cube_0' },
      });
    }
  }
}
