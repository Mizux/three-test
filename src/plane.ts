import {
  // Clock,
  Mesh,
  MeshLambertMaterial,
  PlaneGeometry,
} from "three";

export default class Plane extends Mesh {
  constructor() {
    super();

    const sideLength = 3;
    this.geometry = new PlaneGeometry(sideLength, sideLength);
    this.material = new MeshLambertMaterial({
      color: "gray",
      emissive: "teal",
      emissiveIntensity: 0.2,
      side: 2,
      transparent: true,
      opacity: 0.4,
    });
    this.rotateX(Math.PI / 2);
    this.receiveShadow = true;
  }

  update(/*clock: Clock*/) {}

  dispose() {
    this.geometry.dispose();
  }
}
