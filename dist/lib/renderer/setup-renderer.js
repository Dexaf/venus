import * as THREE from "three";
import { VenusRenderer } from "./venus-renderer";
export const setupRenderer = (containerDiv) => {
    const height = containerDiv.clientHeight;
    const width = containerDiv.clientWidth;
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    containerDiv.appendChild(renderer.domElement);
    return new VenusRenderer(renderer, scene);
};
