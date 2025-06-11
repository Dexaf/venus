import { Component, OnInit } from '@angular/core';
import { SetupRenderer } from '../../../../dist/lib/render/render';
import { VenusRenderer } from '../../../../dist/lib/render/render.class';
import * as THREE from 'three';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  renderer: VenusRenderer | null = null;

  ngOnInit() {
    const containerDiv = document.getElementById('container');
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
      const plane = new THREE.Mesh(planeGeo, planeMat);
      plane.rotation.x = Math.PI * -0.5;
      plane.position.y = -0.5;
      this.renderer.AddObject3D('plane_0', plane);

      const cubeSize = 1;
      const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
      const cubeMat = new THREE.MeshPhongMaterial({ color: '#8AC' });
      const cube = new THREE.Mesh(cubeGeo, cubeMat);
      this.renderer.AddObject3D('cube_0', cube);

      const color = 0x00fff0;
      const intensity = 2;
      const light = new THREE.AmbientLight(color, intensity);
      this.renderer.AddLights('ambient_0', light);
    }
  }
}
