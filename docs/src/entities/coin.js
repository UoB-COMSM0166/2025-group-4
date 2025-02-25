/**
 * Coin class
 */
import { tileSize } from '../config.js';

export class Coin {
  constructor(px, py) {
    this.x = px;
    this.y = py;
    this.r = tileSize * 0.4;
    this.collected = false;
  }

  checkCollision(pl) {
    if (this.collected) return false;

    // Simple distance-based collision check.
    let dx = this.x - pl.x;
    let dy = this.y - pl.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    let minDist = this.r + pl.w * 0.3;

    if (distance < minDist) {
      this.collected = true;
      return true;
    }
    return false;
  }

  draw(cameraOffsetX) {
    if (this.collected) return;

    window.push();
    // Draw the coin as a yellow circle.
    window.fill(255, 220, 0);
    window.stroke(200, 180, 0);
    window.strokeWeight(2);
    window.ellipse(this.x - cameraOffsetX, this.y, this.r * 2);
    // Draw a $ symbol.
    window.fill(200, 180, 0);
    window.noStroke();
    window.textAlign(CENTER, CENTER);
    window.textSize(this.r);
    window.text("$", this.x - cameraOffsetX, this.y);
    window.pop();
  }
}
