/**
 * ExitGate class
 */
import { tileSize, baseSize } from '../config.js';

export class ExitGate {
  constructor(px, py) {
    this.x = px;
    this.y = py;
    this.w = tileSize;
    this.h = tileSize;
  }

  checkPlayer(pl) {
    // Simple AABB collision check.
    let halfW = this.w * 0.5;
    let halfH = this.h * 0.5;
    let plHalfW = pl.w * 0.5;
    let plHalfH = pl.h * 0.5;

    if (
      Math.abs(this.x - pl.x) < halfW + plHalfW &&
      Math.abs(this.y - pl.y) < halfH + plHalfH
    ) {
      return true; // Player reached the exit!
    }
    return false;
  }

  draw(cameraOffsetX) {
    // Update dimensions based on current tile size
    this.w = tileSize;
    this.h = tileSize;

    window.push();
    // Draw the exit gate.
    window.fill(0, 200, 255);
    window.rectMode(CENTER);
    window.rect(this.x - cameraOffsetX, this.y, this.w, this.h, 4);

    // Draw a door symbol.
    window.fill(0, 100, 200);
    window.rect(
      this.x - cameraOffsetX,
      this.y,
      this.w * 0.6,
      this.h * 0.8,
      2
    );
    // Draw a doorknob.
    window.fill(255);
    window.ellipse(
      this.x - cameraOffsetX + this.w * 0.15,
      this.y,
      this.w * 0.15,
      this.w * 0.15
    );
    window.pop();
  }
}
