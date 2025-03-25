/**
 * Exit Gate class
 */
import { tileSize } from '../config.js';

export class ExitGate {
  constructor(px, py) {
    this.x = px;
    this.y = py;
    this.w = tileSize * 0.8;
    this.h = tileSize * 0.8;
  }

  checkPlayer(pl) {
    let dx = this.x - pl.x;
    let dy = this.y - pl.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    let minDist = this.w / 2 + pl.w / 2;

    return distance < minDist;
  }

  draw(cameraOffsetX) {
    window.push();
    window.imageMode(window.CENTER);
    
    // Use exitGateImage if available, otherwise fallback to rectangle
    if (window.exitGateImage) {
      window.image(window.exitGateImage, this.x - cameraOffsetX, this.y, this.w, this.h);
    } else {
      // Fallback to drawing a rectangle if image is not loaded
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
      }
    window.pop();
  }
}
