import { BoxGeometry, Clock, Mesh, MeshStandardMaterial } from "three";
import * as animations from "./helpers/animations";

export default class Cube extends Mesh {
  constructor() {
    super();

    const sideLength = 1;
    this.geometry = new BoxGeometry(sideLength, sideLength, sideLength);
    this.material = new MeshStandardMaterial({
      color: "#f69f1f",
      metalness: 0.5,
      roughness: 0.7,
    });
    this.castShadow = true;
    this.position.y = 0.5;
  }

  update(clock: Clock) {
    animations.rotate(this, clock, Math.PI / 3);
    animations.bounce(this, clock, 1, 0.5, 0.5);
  }

  dispose() {
    this.geometry.dispose();
  }
}
