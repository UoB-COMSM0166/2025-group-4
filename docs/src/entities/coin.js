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
    // 用 coinImage 绘制硬币，并将其尺寸设置为直径的两倍
    window.image(window.coinImage, this.x - cameraOffsetX, this.y, this.r * 2, this.r * 2);
    window.pop();
  }
}


