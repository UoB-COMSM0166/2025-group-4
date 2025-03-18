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
    this.w = tileSize * 0.9;
    this.h = tileSize * 0.9;
    // Patrol movement boundaries.
    this.range = 3; // Default patrol range in tiles
    this.minX = px - tileSize * this.range;
    this.maxX = px + tileSize * this.range;
    this.speed = 2 * (tileSize / baseSize); // Scale speed with tile size
    this.direction = 1; // 1 = right, -1 = left
    
    // For interpolation
    this.previousX = px;
    this.previousY = py;
  }

  update(deltaTime = 1/60) {
    // Store previous position for interpolation
    this.previousX = this.x;
    this.previousY = this.y;
    
    // Scale movement with deltaTime (60 fps is our baseline)
    const scaledSpeed = this.speed * deltaTime * 60;
    
    // 简单的巡逻运动
    this.x += scaledSpeed * this.direction;
    
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
    // Check for player invincibility first
    if (window.invincibilityActive) {
      return false;
    }
    
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

  draw(cameraOffsetX, interpolation = 0) {
    // Calculate interpolated position
    const renderX = this.previousX + (this.x - this.previousX) * interpolation;
    
    push();
    imageMode(CENTER);
    // 使用全局 enemyImage 绘制敌人
    image(window.enemyImage, renderX - cameraOffsetX, this.y, this.w, this.h);
    pop();
  }
}

// 射击敌人类
export class ShooterEnemy {
  constructor(px, py) {
    this.x = px;
    this.y = py;
    this.w = tileSize * 0.9;
    this.h = tileSize * 0.9;
    this.shootCooldown = 2000; // 每2秒射击一次
    this.lastShotTime = 0; // 初始化为0，确保首次更新时会射击
    
    // For interpolation
    this.previousX = px;
    this.previousY = py;
  }

  update(deltaTime = 1/60) {
    // Store previous position for interpolation
    this.previousX = this.x;
    this.previousY = this.y;
    
    // 到达射击时间则发射子弹
    if (millis() - this.lastShotTime > this.shootCooldown) {
      this.shoot();
      this.lastShotTime = millis();
    }
  }

  shoot() {
    let bulletSpeed = 5;
    // 确保全局变量 player 和 bullets 已定义
    if (window.player) {
      // 计算射击方向（朝向玩家）
      let direction = (window.player.x > this.x) ? 1 : -1;
      
      // 确保全局 bullets 数组存在
      if (!window.bullets) {
        window.bullets = [];
      }
      
      // 添加新子弹到数组
      window.bullets.push(new Bullet(this.x, this.y, bulletSpeed * direction));
      console.log("敌人发射子弹，方向：", direction);
    }
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
  draw(cameraOffsetX, interpolation = 0) {
    // Calculate interpolated position
    const renderX = this.previousX + (this.x - this.previousX) * interpolation;
    
    push();
    translate(renderX - cameraOffsetX, this.y);
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
    this.w = tileSize * 0.4; // 子弹宽度（用于绘制）
    this.h = tileSize * 0.4; // 子弹高度（用于绘制）
    
    // For interpolation
    this.previousX = px;
    this.previousY = py;
  }

  update(deltaTime = 1/60) {
    // Store previous position for interpolation
    this.previousX = this.x;
    this.previousY = this.y;
    
    // Scale movement with deltaTime (60 fps is our baseline)
    const scaledSpeed = this.speed * deltaTime * 60;
    
    this.x += scaledSpeed;
    
    // 如果子弹离开屏幕，将其标记为非活动
    if (this.x < 0 || this.x > width + tileSize) {
      this.active = false;
      return;
    }
    
    // 检测与玩家的碰撞
    if (window.player && this.active) {
      // Skip collision if player is invincible
      if (window.invincibilityActive) {
        return;
      }
      
      if (dist(this.x, this.y, window.player.x, window.player.y) < this.r + window.player.w * 0.5) {
        this.active = false;
        // Trigger hit effect on player if possible
        if (window.player.triggerHitEffect) {
          window.player.triggerHitEffect();
        }
        loseLife();
      }
    }
  }

  draw(cameraOffsetX, interpolation = 0) {
    if (!this.active) return;
    
    // Calculate interpolated position
    const renderX = this.previousX + (this.x - this.previousX) * interpolation;
    
    push();
    fill(255, 0, 0);
    noStroke();
    ellipseMode(CENTER);
    ellipse(renderX - cameraOffsetX, this.y, this.r * 2);
    pop();
  }
}

