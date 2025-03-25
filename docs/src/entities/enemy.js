/**
 * Enemy class
 */
import { tileSize } from '../config.js';

export class Enemy {
  constructor(px, py) {
    this.x = px;
    this.y = py;
    this.w = tileSize * 0.8;
    this.h = tileSize * 0.8;
    this.speed = 1.5;
    this.direction = 1; // 1 for right, -1 for left
    
    // Set patrol boundaries
    this.minX = this.x - tileSize * 3;
    this.maxX = this.x + tileSize * 3;
    
    // Patrol range (in tiles)
    this.range = 3;
  }

  update(deltaTime) {
    // Move left and right
    this.x += this.speed * this.direction * deltaTime * 60;
    
    // If reached boundary, change direction
    if (this.x <= this.minX) {
      this.x = this.minX;
      this.direction = 1;
    } else if (this.x >= this.maxX) {
      this.x = this.maxX;
      this.direction = -1;
    }
  }

  checkPlayerCollision(player) {
    // Simple rectangle collision
    return !(
      player.x - player.w / 2 > this.x + this.w / 2 ||
      player.x + player.w / 2 < this.x - this.w / 2 ||
      player.y - player.h / 2 > this.y + this.h / 2 ||
      player.y + player.h / 2 < this.y - this.h / 2
    );
  }

  draw(cameraOffsetX, interpolation = 0) {
    window.push();
    
    // Apply direction
    if (this.direction === -1) {
      window.translate(this.x - cameraOffsetX, this.y);
      window.scale(-1, 1);
      window.translate(-(this.x - cameraOffsetX), -this.y);
    }
    
    window.imageMode(window.CENTER);
    
    // Use enemy image if available, otherwise fallback to rectangle
    if (window.enemyImage) {
      window.image(window.enemyImage, this.x - cameraOffsetX, this.y, this.w, this.h);
    } else {
      // Fallback to drawing a rectangle if image is not loaded
      window.rectMode(window.CENTER);
      window.fill(255, 0, 0);
      window.rect(this.x - cameraOffsetX, this.y, this.w, this.h);
    }
    
    window.pop();
  }
}

/**
 * Shooter Enemy class (extends from Enemy)
 */
export class ShooterEnemy extends Enemy {
  constructor(px, py) {
    super(px, py);
    this.shootCooldown = 0;
    this.shootCooldownMax = 120; // frames between shots
    this.bulletSpeed = 3;
  }

  update(deltaTime) {
    super.update(deltaTime);
    
    // Handle shooting cooldown
    if (this.shootCooldown > 0) {
      this.shootCooldown -= deltaTime * 60; // Convert to frames
    }
    
    // Check if player is in range and shoot
    if (window.player && this.canSeePlayer() && this.shootCooldown <= 0) {
      this.shoot();
      this.shootCooldown = this.shootCooldownMax;
    }
  }
  
  canSeePlayer() {
    // Simple check if player is in the same horizontal direction as enemy facing
    if (!window.player) return false;
    
    let playerDirection = Math.sign(window.player.x - this.x);
    return playerDirection === this.direction;
  }
  
  shoot() {
    // Create bullet and add to global bullets array
    if (!window.bullets) window.bullets = [];
    
    window.bullets.push(new Bullet(
      this.x, 
      this.y,
      this.bulletSpeed * this.direction,
      0
    ));
  }
  
  draw(cameraOffsetX, interpolation = 0) {
    window.push();
    
    // Apply direction
    if (this.direction === -1) {
      window.translate(this.x - cameraOffsetX, this.y);
      window.scale(-1, 1);
      window.translate(-(this.x - cameraOffsetX), -this.y);
    }
    
    // Draw enemy with a special color to indicate it's a shooter
    window.imageMode(window.CENTER);
    
    if (window.enemyImage) {
      // Use tint to show it's a shooter enemy
      window.tint(255, 100, 100);
      window.image(window.enemyImage, this.x - cameraOffsetX, this.y, this.w, this.h);
      window.noTint();
    } else {
      // Fallback rectangle
      window.rectMode(window.CENTER);
      window.fill(255, 50, 50);
      window.rect(this.x - cameraOffsetX, this.y, this.w, this.h);
      
      // Gun indicator
      window.fill(0);
      window.rect(this.x - cameraOffsetX + this.w * 0.3 * this.direction, this.y, this.w * 0.4, this.h * 0.2);
    }
    
    window.pop();
  }
}

/**
 * Bullet class for shooter enemies
 */
export class Bullet {
  constructor(px, py, vx, vy) {
    this.x = px;
    this.y = py;
    this.vx = vx;
    this.vy = vy;
    this.r = tileSize * 0.2; // Bullet radius
    this.active = true;
    this.ttl = 180; // Time to live in frames (3 seconds)
  }
  
  update(deltaTime) {
    // Move bullet
    this.x += this.vx * deltaTime * 60;
    this.y += this.vy * deltaTime * 60;
    
    // Reduce TTL
    this.ttl -= deltaTime * 60;
    if (this.ttl <= 0) {
      this.active = false;
      return;
    }
    
    // Check collision with walls
    if (this.checkWallCollision()) {
      this.active = false;
      return;
    }
    
    // Check collision with player
    if (window.player && this.checkPlayerCollision(window.player)) {
      this.active = false;
      // Trigger player hit
      if (typeof window.loseLife === 'function') {
        window.loseLife();
      }
      return;
    }
  }
  
  checkWallCollision() {
    if (!window.tileMap) return false;
    
    // Convert bullet position to tile coordinates
    const tileX = Math.floor(this.x / tileSize);
    const tileY = Math.floor(this.y / tileSize);
    
    // Check if tile is solid
    if (tileX >= 0 && tileX < window.tileMap[0].length && 
        tileY >= 0 && tileY < window.tileMap.length) {
      // Get tile
      const tile = window.tileMap[tileY].charAt(tileX);
      // Check if tile is solid
      return tile === '1' || tile === '5';
    }
    
    return false;
  }
  
  checkPlayerCollision(player) {
    // Calculate distance between bullet and player
    const dx = this.x - player.x;
    const dy = this.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Check if distance is less than sum of radii
    return distance < (this.r + player.w * 0.3);
  }
  
  draw(cameraOffsetX, interpolation = 0) {
    window.push();
    window.fill(255, 0, 0);
    window.noStroke();
    window.ellipse(this.x - cameraOffsetX, this.y, this.r * 2);
    window.pop();
  }
}

