/**
 * Coin class
 */
import { tileSize } from '../config.js';

export class Coin {
  constructor(px, py) {
    this.x = px;
    this.y = py;
    this.r = tileSize * 0.3;
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
      window.getCoinSound.play();
      return true;
    }
    return false;
  }

  draw(cameraOffsetX) {
    if (this.collected) return;
    // Update radius based on current tile size
    this.r = tileSize * 0.3;
    window.push();
    window.imageMode(window.CENTER);
    
    // Use coinImage if available, otherwise fallback to circle
    if (window.coinImage) {
      const bobOffset = Math.sin(window.frameCount * 0.05 + this.x) * 1; // 上下浮动
      window.push();
      window.translate(this.x, this.y + bobOffset);
      window.rotate(window.frameCount * 0.05); // 轻微旋转
      window.image(window.coinImage, 0, 0, this.r * 2, this.r * 2);
      window.pop();
    } else {
      // Fallback to drawing a circle if image is not loaded
      window.fill(255, 215, 0);
      window.ellipse(this.x, this.y, this.r * 2);
    }
    
    window.pop();
  }
}


