/**
 * enemy.js
 * 定义普通敌人、射击敌人和子弹类
 */
import { tileSize, baseSize } from '../config.js';
import { loseLife } from '../game.js';

// 普通敌人类
export class Enemy {
  constructor(px, py) {
    this.x = px;
    this.y = py;
    this.w = tileSize * 0.6;
    this.h = tileSize * 0.9;
    // 巡逻边界
    this.minX = px - tileSize * 3;
    this.maxX = px + tileSize * 3;
    this.speed = 2;
    this.direction = 1; // 1: 向右, -1: 向左
    // Patrol movement boundaries.
    this.range = 3; // Default patrol range in tiles
    this.minX = px - tileSize * this.range;
    this.maxX = px + tileSize * this.range;
    this.speed = 2 * (tileSize / baseSize); // Scale speed with tile size
    this.direction = 1; // 1 = right, -1 = left
  }

  update() {
    // 简单的巡逻运动
    this.x += this.speed * this.direction;
    if (this.x > this.maxX) {
      this.x = this.maxX;
      this.direction = -1;
    } else if (this.x < this.minX) {
      this.x = this.minX;
      this.direction = 1;
    }
  }

  // Updates the patrol range (used when difficulty changes)
  updateRange() {
    const centerX = (this.minX + this.maxX) / 2;
    this.minX = centerX - tileSize * this.range;
    this.maxX = centerX + tileSize * this.range;
  }

  checkPlayerCollision(pl) {
    // 简单的 AABB 碰撞检测
    let halfW = this.w * 0.5;
    let halfH = this.h * 0.5;
    let plHalfW = pl.w * 0.5;
    let plHalfH = pl.h * 0.5;
    return (
      Math.abs(this.x - pl.x) < halfW + plHalfW &&
      Math.abs(this.y - pl.y) < halfH + plHalfH
    );
  }

  draw(cameraOffsetX) {
    push();
    imageMode(CENTER);
    // 使用全局 enemyImage 绘制敌人
    image(window.enemyImage, this.x - cameraOffsetX, this.y, this.w, this.h);
    pop();
  }
}

// 射击敌人类
export class ShooterEnemy {
  constructor(px, py) {
    this.x = px;
    this.y = py;
    this.w = tileSize * 0.8;
    this.h = tileSize * 0.9;
    this.shootCooldown = 2000; // 每2秒射击一次
    this.lastShotTime = millis();
  }

  update() {
    // 到达射击时间则发射子弹
    if (millis() - this.lastShotTime > this.shootCooldown) {
      this.shoot();
      this.lastShotTime = millis();
    }
  }

  shoot() {
    let bulletSpeed = 5;
    // 使用全局变量 window.player
    let direction = (window.player.x > this.x) ? 1 : -1;
    // 使用全局变量 window.bullets
    window.bullets.push(new Bullet(this.x, this.y, bulletSpeed * direction));
  }
  
  // 为 ShooterEnemy 添加碰撞检测方法
  checkPlayerCollision(pl) {
    let halfW = this.w * 0.5;
    let halfH = this.h * 0.5;
    let plHalfW = pl.w * 0.5;
    let plHalfH = pl.h * 0.5;
    return (
      Math.abs(this.x - pl.x) < halfW + plHalfW &&
      Math.abs(this.y - pl.y) < halfH + plHalfH
    );
  }

  // 接受 cameraOffsetX 作为参数
  draw(cameraOffsetX) {
    push();
    translate(this.x - cameraOffsetX, this.y);
    fill(150, 0, 0);
    rectMode(CENTER);
    rect(0, 0, this.w, this.h);
    pop();
  }
}

// 子弹类
export class Bullet {
  constructor(px, py, speed) {
    this.x = px;
    this.y = py;
    this.speed = speed;
    this.r = tileSize * 0.3; // 子弹半径
    this.active = true;
  }

  update() {
    this.x += this.speed;
    if (this.x < 0 || this.x > width + tileSize) {
      this.active = false;
    }
    // 使用全局 window.player
    if (dist(this.x, this.y, window.player.x, window.player.y) < this.r + window.player.w * 0.5) {
      this.active = false;
      loseLife();
    }
  }

  draw(cameraOffsetX) {
    if (!this.active) return;
    push();
    translate(this.x - cameraOffsetX, this.y);
    fill(255, 0, 0);
    ellipse(0, 0, this.r * 2);
    pop();
    // Update dimensions based on current tile size
    this.w = tileSize * 0.6;
    this.h = tileSize * 0.9;
    this.speed = 2 * (tileSize / baseSize);
    window.push();
    window.imageMode(window.CENTER);
    // 用 enemyImage 绘制敌人
    window.image(window.enemyImage, this.x - cameraOffsetX, this.y, this.w, this.h);
    window.pop();
  }
}

