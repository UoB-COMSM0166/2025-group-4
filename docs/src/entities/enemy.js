/**
 * Enemy class
 */
import { tileSize } from '../config.js';

export class Enemy {
  constructor(px, py) {
    this.x = px;
    this.y = py;
    this.w = tileSize * 0.6;
    this.h = tileSize * 0.9;
    // Patrol movement boundaries.
    this.minX = px - tileSize * 3;
    this.maxX = px + tileSize * 3;
    this.speed = 2;
    this.direction = 1; // 1 = right, -1 = left
  }

  update() {
    // Simple patrol movement.
    this.x += this.speed * this.direction;
    if (this.x > this.maxX) {
      this.x = this.maxX;
      this.direction = -1;
    } else if (this.x < this.minX) {
      this.x = this.minX;
      this.direction = 1;
    }
  }

  checkPlayerCollision(pl) {
    // Simple AABB collision check.
    let halfW = this.w * 0.5;
    let halfH = this.h * 0.5;
    let plHalfW = pl.w * 0.5;
    let plHalfH = pl.h * 0.5;

    if (
      Math.abs(this.x - pl.x) < halfW + plHalfW &&
      Math.abs(this.y - pl.y) < halfH + plHalfH
    ) {
      return true; // Collision!
    }
    return false;
  }

  draw(cameraOffsetX) {
    window.push();
    // Draw the enemy as a red rectangle.
    window.fill(255, 0, 0);
    window.rectMode(CENTER);
    window.rect(this.x - cameraOffsetX, this.y, this.w, this.h, 4);

    // Draw eyes.
    window.fill(0);
    let eyeDirection = this.direction * 0.15 * this.w;
    window.ellipse(
      this.x - cameraOffsetX - this.w * 0.15 + eyeDirection,
      this.y - this.h * 0.2,
      this.w * 0.2,
      this.w * 0.2
    );
    window.ellipse(
      this.x - cameraOffsetX + this.w * 0.15 + eyeDirection,
      this.y - this.h * 0.2,
      this.w * 0.2,
      this.w * 0.2
    );
    window.pop();
  }
}
