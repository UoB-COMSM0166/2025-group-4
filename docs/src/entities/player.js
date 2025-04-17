/**
 * Player class
 */
import { tileSize, baseSize, gravity, allowBufferedFlipWhileAir, airBufferDuration, preSurfaceBufferDuration } from '../config.js';
import * as config from '../config.js'; // Import the whole config module
import { getTile } from '../utils.js';
import { loseLife, triggerGravityFlipDelay } from '../game.js';
import { particleSystem } from '../particles.js';

// Get reference to global game state
let invincibilityActive = false;
// Define the ground grace period constant here for reuse
const GROUND_GRACE_PERIOD = 150; // ms

export class Player {
  constructor(px, py) {
    this.x = px;
    this.y = py;
    this.vx = 0;
    this.vy = 0;
    this.w = tileSize * 0.9;
    this.h = tileSize * 0.9;
    this.onGround = false;
    // Auto-run direction: -1 (left) or 1 (right)
    this.autoDirection = Math.random() < 0.5 ? -1 : 1;
    this.cameraPositionRatio = this.autoDirection > 0 ? 0.4 : 0.6;
    this.autoSpeed = 4.0 * (tileSize / baseSize); // Scale speed with tile size
    // Initialize targetSpeed based on current config speed
    this.targetSpeed = this.autoSpeed * (config.maxSpeedX / 8); // Adjust initial speed based on config
    // Gravity direction: 1 = normal (downward), -1 = flipped (upward)
    this.gravityDirection = 1;
    // For buffering the flip input:
    this.flipBufferTimestamp = 0;
    this.bufferedFlipAvailable = false;
    console.log("Player autoDirection:", this.autoDirection);
    
    // Animation properties
    this.currentFrame = 0;
    this.frameDelay = 10;   // Switch image every 10 frames (adjust as needed)
    this.frameCounter = 0;
    
    // Enhanced movement properties
    this.hitWallTimestamp = 0;
    this.acceleration = 0.2; // How quickly we reach target speed
    this.wallBounceForce = 0.5; // Force applied when bouncing off walls
    this.wallHitSlowdown = 0.6; // Speed multiplier after hitting wall
    this.lastGroundTimestamp = 0; // When player last touched ground
    
    // Visual feedback
    this.squashFactor = 1.0; // For squash and stretch animation
    this.stretchFactor = 1.0;
    this.recoveryRate = 0.1; // How quickly squash/stretch returns to normal
    
    // Hit flash effect
    this.hitFlashActive = false;
    this.hitFlashIntensity = 0;
    
    // For interpolation in render
    this.previousX = px;
    this.previousY = py;
    this.freezeTimer = 0;  // 冻结剩余帧数（例如60帧大约1秒）
    this.isFrozen = false; // 当前是否被冻结
    this.isSlipping = false;
    
    // Add state for flip readiness indicator
    this.isFlipReady = false;
    
    // For landing effects
    this.landingVelocity = 0;
  }

  update(tileMap, cameraOffsetX, deltaTime = 1/60) {

    if (this.freezeTimer > 0) {
      this.freezeTimer--;
      if (this.freezeTimer === 0) {
        this.isFrozen = false;
      }
      // 冻结期间不更新位置，直接返回当前 cameraOffsetX
      return cameraOffsetX;
    }
  
    // 存储上一次的位置，用于插值
    this.previousX = this.x;
    this.previousY = this.y;
    
    // 更新全局无敌状态
    invincibilityActive = window.invincibilityActive;
    
    // 更新命中闪光效果
    if (this.hitFlashActive) {
      this.hitFlashIntensity -= 0.1;
      if (this.hitFlashIntensity <= 0) {
        this.hitFlashIntensity = 0;
        this.hitFlashActive = false;
      }
    }
    
    // 存储当前位置用于碰撞检测
    const prevX = this.x;
    const prevY = this.y;
    
    // 根据 deltaTime 计算重力的影响
    const timeScaledGravity = gravity * deltaTime * 60; // 期望 60 fps
    this.vy += timeScaledGravity * this.gravityDirection;
  
    // 限制最大垂直速度
    const maxVerticalSpeed = 12 * (tileSize / baseSize);
    if (this.vy > maxVerticalSpeed) this.vy = maxVerticalSpeed;
    if (this.vy < -maxVerticalSpeed) this.vy = -maxVerticalSpeed;
    
    // 当在地面上时，平滑加速到目标速度
    if (this.onGround) {
      this.lastGroundTimestamp = window.millis();
      const speedDiff = (this.autoDirection * this.targetSpeed) - this.vx;
      this.vx += speedDiff * this.acceleration * deltaTime * 60;
      
      // 如果超过一定冷却期后，目标速度恢复到基础速度
      const wallHitCooldown = 300; // ms
      if (window.millis() - this.hitWallTimestamp > wallHitCooldown) {
        this.targetSpeed = Math.min(this.targetSpeed + 0.1 * deltaTime * 60, this.autoSpeed);
      }
    }
  
    // 限制水平速度 - Use config.maxSpeedX
    const currentMaxSpeedX = config.maxSpeedX * (tileSize / baseSize); // Scale max speed with tile size
    if (this.vx > currentMaxSpeedX) this.vx = currentMaxSpeedX;
    if (this.vx < -currentMaxSpeedX) this.vx = -currentMaxSpeedX;
    
    // 计算移动量
    const scaledVx = this.vx * deltaTime * 60;
    const scaledVy = this.vy * deltaTime * 60;
    
    // 为防止高速下穿透，分步进行垂直碰撞检测
    const steps = Math.max(1, Math.ceil(Math.abs(scaledVy) / 5));
    
    // --- Diagonal Gap Assistance ---
    // Check if grounded, moving vertically, and about to hit a wall horizontally
    if (this.onGround && Math.abs(this.vy) > 0.1 && scaledVx !== 0) {
      const checkX = this.x + (this.w * 0.5 * Math.sign(scaledVx)) + (1 * Math.sign(scaledVx)); // Check slightly ahead horizontally
      const checkCol = Math.floor(checkX / tileSize);
      const checkRow = Math.floor(this.y / tileSize); // Current row

      if (getTile(checkCol, checkRow, tileMap) === 1) {
        // About to hit a wall horizontally while grounded and moving vertically
        // Drastically reduce vertical velocity to ease diagonal movement
        this.vy *= 0.05; // Adjust this factor as needed
      }
    }
    // --- End Diagonal Gap Assistance ---

    // 水平移动并检测碰撞
    this.x += scaledVx;
    const hadHorizontalCollision = this.checkTileCollisions(true, tileMap, prevX, prevY);
    
    // 存储之前的 onGround 状态
    const wasOnGround = this.onGround;
    
    // 垂直移动：分步检测碰撞
    if (steps > 1) {
      const stepVy = scaledVy / steps;
      for (let i = 0; i < steps; i++) {
        this.y += stepVy;
        if (i === 0) {
          this.onGround = false;
        }
        const hadVerticalCollision = this.checkTileCollisions(false, tileMap, prevX, prevY);
        if (hadVerticalCollision) break;
      }
    } else {
      this.y += scaledVy;
      this.onGround = false;
      const hadVerticalCollision = this.checkTileCollisions(false, tileMap, prevX, prevY);
    }
    
    // 着地后应用挤压/拉伸效果
    if (!wasOnGround && this.onGround) {
      this.squashFactor = 0.7;
      this.stretchFactor = 1.3;
      // 使用存储的着陆速度创建粒子效果
      if (this.landingVelocity > 2) { // 只有足够的落地速度才创建效果
        const impactScale = Math.min(this.landingVelocity / 10, 1); // 根据速度调整效果强度
        particleSystem.createLandingEffect(
          this.x, 
          this.y + (this.gravityDirection * this.h * 0.4), // 在玩家脚部位置生成
          this.w * impactScale, 
          this.gravityDirection
        );
      }
      // 重置着陆速度
      this.landingVelocity = 0;
    }
    
    // 渐进恢复挤压/拉伸效果
    const timeScaledRecoveryRate = this.recoveryRate * deltaTime * 60;
    this.squashFactor = this.squashFactor + (1 - this.squashFactor) * timeScaledRecoveryRate;
    this.stretchFactor = this.stretchFactor + (1 - this.stretchFactor) * timeScaledRecoveryRate;
  
    // Check flip readiness state (before movement updates)
    const wasRecentlyOnGround = window.millis() - this.lastGroundTimestamp < GROUND_GRACE_PERIOD;
    this.isFlipReady = (this.onGround || wasRecentlyOnGround) && !this.isFrozen && !this.isSlipping;
  
    // 检查缓冲重力翻转输入
    if (this.bufferedFlipAvailable) {
      let bufferDuration = allowBufferedFlipWhileAir ? airBufferDuration : preSurfaceBufferDuration;
      // Check if buffer expired OR if the flip condition is now met
      if (window.millis() - this.flipBufferTimestamp > bufferDuration) {
        this.bufferedFlipAvailable = false;
      } else if (this.isFlipReady) { // Use isFlipReady state here
        this.performGravityFlip();
        this.bufferedFlipAvailable = false;
      }
    }
  
    // 检查是否超出地图边界
    if (window.strictVerticalBoundaries) {
      if (this.y < 0 || this.y > tileMap.length * tileSize) {
        this.triggerHitEffect();
        loseLife();
        return;
      }
    } else {
      const mapHeight = tileMap.length * tileSize;
      if (this.gravityDirection === 1) {
        if (this.y > mapHeight + 200) {
          this.triggerHitEffect();
          loseLife();
          return;
        }
      } else {
        if (this.y < -200) {
          this.triggerHitEffect();
          loseLife();
          return;
        }
      }
    }
  
    // 检测危险（如尖刺）
    this.checkHazards(tileMap);
    
    // 检测动态悬浮平台碰撞
    this.checkFloatingPlatformCollisions(window.floatingPlatforms);
  
    // ----- 滑行检测代码：根据玩家脚部所在 tile 判断是否为 "S" -----
    if (this.onGround) {
      // 根据重力方向确定玩家脚部所在的行
      const footRow = this.gravityDirection > 0 
        ? Math.floor((this.y + this.h * 0.5) / tileSize)
        : Math.floor((this.y - this.h * 0.5) / tileSize);
      const col = Math.floor(this.x / tileSize);
      if (
        footRow >= 0 && footRow < tileMap.length &&
        col >= 0 && col < tileMap[footRow].length &&
        tileMap[footRow].charAt(col) === "S"
      ) {
        this.isSlipping = true;
        // 自动加速效果：增加额外水平速度（可根据需要调整数值）
        this.vx += 100.0 * deltaTime * 60 * this.autoDirection;
      } else {
        this.isSlipping = false;
      }
    } else {
      this.isSlipping = false;
    }
    // ----- 滑行检测结束 -----
  
    // 计算相机偏移
    const mapWidth = tileMap[0].length * tileSize;
    if (mapWidth <= window.width) {
      let newCameraOffsetX = (mapWidth - window.width) / 2;
      newCameraOffsetX = Math.max(0, newCameraOffsetX);
      return newCameraOffsetX;
    } else {
      const targetRatio = this.autoDirection > 0 ? 0.4 : 0.6;
      if (this.cameraPositionRatio === undefined) {
        this.cameraPositionRatio = targetRatio;
      }
      const smoothFactor = 0.02 * deltaTime * 60;
      this.cameraPositionRatio += (targetRatio - this.cameraPositionRatio) * smoothFactor;
      let newCameraOffsetX = this.x - window.width * this.cameraPositionRatio;
      newCameraOffsetX = Math.max(0, newCameraOffsetX);
      const maxCameraX = mapWidth - window.width;
      newCameraOffsetX = Math.min(newCameraOffsetX, maxCameraX);
      return newCameraOffsetX;
    }
  }

  

  // Trigger hit visual effect
  triggerHitEffect() {
    this.hitFlashActive = true;
    this.hitFlashIntensity = 1.0;
    
    // Add extra squash for impact feel
    this.squashFactor = 0.5;
    this.stretchFactor = 1.5;
  }

  // Enhanced collision checking with wall bounce effects
  checkTileCollisions(isX, tileMap, prevX, prevY) {
    let halfW = this.w * 0.5;
    let halfH = this.h * 0.5;
    let hadCollision = false;
    
    if (isX) {
      let epsilon = 1;
      // Use a slightly smaller height for horizontal collision checks to prevent getting stuck
      let topRow = Math.floor((this.y - halfH + 2) / tileSize);
      let bottomRow = Math.floor((this.y + halfH - 2 - epsilon) / tileSize);

      if (this.vx > 0) {
        // Moving right: check the right edge
        let rightCol = Math.floor((this.x + halfW) / tileSize);
        for (let row = topRow; row <= bottomRow; row++) {
          if (row >= 0 && row < tileMap.length && rightCol >= 0 && rightCol < tileMap[row].length) {
            if (getTile(rightCol, row, tileMap) === 1) {
              this.x = rightCol * tileSize - halfW;
              this.handleWallCollision();
              this.autoDirection = -1;
              hadCollision = true;
              break;
            }
          }
        }
      } else if (this.vx < 0) {
        // Moving left: check the left edge
        let leftCol = Math.floor((this.x - halfW) / tileSize);
        for (let row = topRow; row <= bottomRow; row++) {
          if (row >= 0 && row < tileMap.length && leftCol >= 0 && leftCol < tileMap[row].length) {
            if (getTile(leftCol, row, tileMap) === 1) {
              this.x = (leftCol + 1) * tileSize + halfW;
              this.handleWallCollision();
              this.autoDirection = 1;
              hadCollision = true;
              break;
            }
          }
        }
      }
    } else {
      // Use a slightly smaller width for vertical collision checks to prevent getting stuck
      let leftCol = Math.floor((this.x - halfW + 2) / tileSize);
      let rightCol = Math.floor((this.x + halfW - 2) / tileSize);

      if ((this.vy > 0 && this.gravityDirection > 0) || (this.vy < 0 && this.gravityDirection < 0)) {
        // Moving down with normal gravity or up with flipped gravity
        let checkRow = Math.floor((this.gravityDirection > 0 ? this.y + halfH : this.y - halfH) / tileSize);
        
        // Check for collision with floor/ceiling
        let foundSolidTile = false;
        for (let col = leftCol; col <= rightCol; col++) {
          if (checkRow >= 0 && checkRow < tileMap.length && col >= 0 && col < tileMap[checkRow].length) {
            if (getTile(col, checkRow, tileMap) === 1) {
              foundSolidTile = true;
              break;
            }
          }
        }
        
        // If we found a solid tile, adjust position and set onGround
        if (foundSolidTile) {
          if (this.gravityDirection > 0) {
            this.y = checkRow * tileSize - halfH;
          } else {
            this.y = (checkRow + 1) * tileSize + halfH;
          }
          
          // Apply squash effect when landing
          if (Math.abs(this.vy) > 2) {
            this.squashFactor = Math.max(0.7, 1 - Math.abs(this.vy) * 0.02);
            this.stretchFactor = Math.min(1.3, 1 + Math.abs(this.vy) * 0.02);
          }
          
          // Store landing velocity before resetting it
          if (!this.onGround) {
            this.landingVelocity = Math.abs(this.vy);
          }
          
          this.vy = 0;
          this.onGround = true;
          hadCollision = true;
        }
      } else if ((this.vy < 0 && this.gravityDirection > 0) || (this.vy > 0 && this.gravityDirection < 0)) {
        // Moving up with normal gravity or down with flipped gravity
        let checkRow = Math.floor((this.gravityDirection > 0 ? this.y - halfH : this.y + halfH) / tileSize);
        
        // Check for collision with ceiling/floor
        let foundSolidTile = false;
        let collidedCol = -1;
        
        for (let col = leftCol; col <= rightCol; col++) {
          if (checkRow >= 0 && checkRow < tileMap.length && col >= 0 && col < tileMap[checkRow].length) {
            if (getTile(col, checkRow, tileMap) === 1) {
              foundSolidTile = true;
              collidedCol = col;
              break;
            }
          }
        }
        
        // If we found a solid tile, adjust position
        if (foundSolidTile) {
          if (this.gravityDirection > 0) {
            this.y = (checkRow + 1) * tileSize + halfH;
          } else {
            this.y = checkRow * tileSize - halfH;
          }
          
          this.vy = 0;
          hadCollision = true;
          
          // If we're hitting a ceiling and moving horizontally, check if we need to adjust horizontal position
          // to prevent getting stuck in corners
          if (Math.abs(this.vx) > 0) {
            // Check if there's a wall next to us that might cause us to get stuck
            const nextCol = this.vx > 0 ? collidedCol + 1 : collidedCol - 1;
            const nextRow = checkRow + (this.gravityDirection > 0 ? 1 : -1);
            
            if (nextRow >= 0 && nextRow < tileMap.length && nextCol >= 0 && nextCol < tileMap[nextRow].length) {
              if (getTile(nextCol, nextRow, tileMap) === 1) {
                // There's a potential corner - adjust horizontal position slightly
                this.x += this.vx > 0 ? -1 : 1;
              }
            }
          }
        }
      }
    }
    
    return hadCollision;
  }
  
  // New method to handle wall collisions
  handleWallCollision() {
    // Add a bounce effect
    this.vx = -this.vx * this.wallBounceForce;
    
    // Temporarily slow down after hitting a wall
    this.targetSpeed = this.autoSpeed * this.wallHitSlowdown;
    this.hitWallTimestamp = window.millis();
    
    // Create wall hit particles at the appropriate position and direction
    // Position particles at the edge of the player in the direction of the wall
    const particleX = this.x + (this.w * 0.5 * this.autoDirection);
    particleSystem.createWallHit(particleX, this.y, this.autoDirection);
    
    // If we had a sound system, play wall hit sound here
    // window.wallHitSound.play();
  }

  // Check for collisions with hazards (spikes)
  checkHazards(tileMap) {
    let halfW = this.w * 0.4;
    let halfH = this.h * 0.4;
    let leftCol = Math.floor((this.x - halfW) / tileSize);
    let rightCol = Math.floor((this.x + halfW) / tileSize);
    let topRow = Math.floor((this.y - halfH) / tileSize);
    let bottomRow = Math.floor((this.y + halfH) / tileSize);
    
    // Check each tile in the player's bounding box
    for (let row = topRow; row <= bottomRow; row++) {
      for (let col = leftCol; col <= rightCol; col++) {
        if (row >= 0 && row < tileMap.length && col >= 0 && col < tileMap[row].length) {
          // Spikes are represented by the tile '5' in our map
          if (getTile(col, row, tileMap) === 5) {
            // Only take damage if not invincible
            if (!invincibilityActive) {
              this.triggerHitEffect();
              loseLife();
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  // Enhanced gravity flip with more feedback
  attemptGravityFlip() {

    if (this.isFrozen || this.isSlipping) return;

    // Use the pre-calculated isFlipReady state
    if (this.isFlipReady) {
      this.performGravityFlip();
    } else {
      // Only buffer if not already ready and not already buffered
      if (!this.bufferedFlipAvailable) {
          this.flipBufferTimestamp = window.millis();
          this.bufferedFlipAvailable = true;
      }
    }
  }

  // Actually perform the gravity flip with enhanced feedback
  performGravityFlip() {
    this.gravityDirection *= -1;
    // Give a small vertical boost when flipping gravity
    this.vy = -2 * this.gravityDirection; 
    this.onGround = false;
    
    // Stretch effect when flipping
    this.stretchFactor = 1.3;
    this.squashFactor = 0.8;
    
    // Create particle effect for gravity flip
    particleSystem.createGravityFlip(this.x, this.y, this.w, this.gravityDirection);
    
    // Trigger the short global delay
    triggerGravityFlipDelay();
    
    window.regravitySound.play();
  }

  /**
   * Draw the player with interpolation support
   * @param {number} cameraOffsetX - Camera offset for rendering
   * @param {number} interpolation - Interpolation factor between 0 and 1
   */
  draw(cameraOffsetX, interpolation = 0) {
    // Update dimensions based on current tile size
    this.w = tileSize * 0.9;
    this.h = tileSize * 0.9;
    this.autoSpeed = 4.0 * (tileSize / baseSize);
    // Update base auto speed based on current maxSpeedX from config
    const currentMaxSpeedXDraw = config.maxSpeedX * (tileSize / baseSize);
    // Ensure targetSpeed respects the current difficulty setting
    if (window.millis() - this.hitWallTimestamp > 300) { // Cooldown period after wall hit
      this.targetSpeed = Math.min(this.targetSpeed, currentMaxSpeedXDraw);
    }

    // Calculate interpolated position
    const renderX = this.previousX + (this.x - this.previousX) * interpolation;
    const renderY = this.previousY + (this.y - this.previousY) * interpolation;

    window.push();
    window.translate(renderX - cameraOffsetX, renderY);

    // 如果正在打滑 && 有打滑贴图
    if (this.isSlipping && window.slipperyPlayerImage) {
    window.imageMode(window.CENTER);
    window.image(window.slipperyPlayerImage, 0, 0, this.w, this.h);
    } else if (this.isFrozen && window.inIcePlayerImage) {
        // 绘制 dog_in_ice.png
        imageMode(CENTER);
        image(window.inIcePlayerImage, 0, 0, this.w, this.h);
      } else {
        // Apply squash and stretch for more dynamic feel
        window.scale(this.stretchFactor, this.squashFactor);

        // --- Draw Flip Readiness Indicator ---
        window.push();
        // Apply flips first so outline matches player orientation
        const horizontalFlip = this.autoDirection < 0 ? -1 : 1;
        const verticalFlip = this.gravityDirection < 0 ? -1 : 1;
        window.scale(horizontalFlip, verticalFlip);

        window.noFill();
        window.strokeWeight(2); // Make outline visible

        if (this.isFlipReady) {
          // Pulsing green outline when ready
          const pulse = (1 + Math.sin(window.physicsClock * 8)) / 2; // 0 to 1
          const alpha = 100 + pulse * 100; // Pulse alpha between 100 and 200
          window.stroke(100, 255, 100, alpha);
          // Draw ellipse slightly larger than the player
          window.ellipse(0, 0, this.w * 1.1, this.h * 1.1);
        } else if (this.bufferedFlipAvailable) {
          // Static yellow outline when buffered
          window.stroke(255, 255, 0, 200); // Yellow, slightly transparent
          window.ellipse(0, 0, this.w * 1.1, this.h * 1.1);
        }
        window.pop(); // Restore scale before drawing shadow/player
        // --- End Flip Indicator ---

        // Draw character shadow - position depends on gravity direction
        window.fill(0, 0, 0, 60);
        window.noStroke();
        // Shadow above when gravity is flipped, below when normal
        const shadowOffsetY = tileSize * 0.45 * this.gravityDirection;
        if (this.onGround) {
          window.ellipse(0, shadowOffsetY, this.w * 0.6, this.h * 0.2);
        }
        
        // Draw hit flash effect if active
        if (this.hitFlashActive) {
          window.fill(255, 255, 255, this.hitFlashIntensity * 200);
          window.noStroke();
          window.rect(-this.w/2, -this.h/2, this.w, this.h);
        }

        // Update animation frame counter, and switch current frame
        this.frameCounter++;
        if (this.frameCounter >= this.frameDelay) {
          // Speed up animation based on horizontal velocity
          const speed = Math.abs(this.vx);
          this.currentFrame = (this.currentFrame + 1) % window.playerImages.length;
          this.frameCounter = 0;
        }
        
        // Draw the player sprite
        if (window.playerImages && window.playerImages.length > 0) {
          // If facing left, flip the image horizontally
          // If gravity is flipped, flip the image vertically
          window.push();
          
          // Apply horizontal flip if moving left
          const horizontalFlip = this.autoDirection < 0 ? -1 : 1;
          
          // Apply vertical flip if gravity is flipped
          const verticalFlip = this.gravityDirection < 0 ? -1 : 1;
          
          // Apply both flips
          window.scale(horizontalFlip, verticalFlip);
          
          // Use tinted version if invincible but not during hit flash
          if (invincibilityActive && !this.hitFlashActive) {
            // Apply a pulsing effect during invincibility
            const pulseAmount = 0.5 + Math.sin(window.physicsClock * 10) * 0.3;
            window.tint(255, 255, 255, 150 + pulseAmount * 105); // Semi-transparent when invincible
          }
          
          window.imageMode(window.CENTER);
          window.image(window.playerImages[this.currentFrame], 0, 0, this.w, this.h);
          window.pop();
        } else {
          // Simple rectangle representation if no image is available
          window.fill(255, 0, 0);
          window.stroke(0);
          window.strokeWeight(2);
          // Apply necessary transforms for rect mode CENTER
          window.push();
          const horizontalFlipRect = this.autoDirection < 0 ? -1 : 1;
          const verticalFlipRect = this.gravityDirection < 0 ? -1 : 1;
          window.scale(horizontalFlipRect, verticalFlipRect);
          window.rect(0, 0, this.w, this.h); // Assuming rect mode is CENTER
          window.pop();
        }
      } // End of the 'else' block for frozen/slipping check
    window.pop(); // Pop the main translate transform
  }


  checkFloatingPlatformCollisions(platforms) {
    const tolerance = 4;
    const halfPlayerW = this.w * 0.5;
    const halfPlayerH = this.h * 0.5;
    
    for (let platform of platforms) {
      const halfPlatformW = platform.width * 0.5;
      const halfPlatformH = platform.height * 0.5;
      
      if (this.gravityDirection > 0) {
        // 正常重力：检测玩家底部是否接触到平台顶部
        if (this.y + halfPlayerH >= platform.y - halfPlatformH - tolerance &&
            this.y + halfPlayerH <= platform.y - halfPlatformH + tolerance &&
            Math.abs(this.x - platform.x) < halfPlayerW + halfPlatformW) {
          // 存储着陆速度（如果之前不在地面上）
          if (!this.onGround) {
            this.landingVelocity = Math.abs(this.vy);
          }
          this.y = platform.y - halfPlatformH - halfPlayerH;
          this.vy = 0;
          this.onGround = true;
        }
      } else {
        // 重力翻转：检测玩家顶部是否接触到平台底部
        if (this.y - halfPlayerH <= platform.y + halfPlatformH + tolerance &&
            this.y - halfPlayerH >= platform.y + halfPlatformH - tolerance &&
            Math.abs(this.x - platform.x) < halfPlayerW + halfPlatformW) {
          // 存储着陆速度（如果之前不在地面上）
          if (!this.onGround) {
            this.landingVelocity = Math.abs(this.vy);
          }
          this.y = platform.y + halfPlatformH + halfPlayerH;
          this.vy = 0;
          this.onGround = true;
        }
      }
    }
  }


  
}


