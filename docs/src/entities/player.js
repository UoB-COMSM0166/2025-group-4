/**
 * Player class
 */
import { tileSize, baseSize, gravity, maxSpeedX, allowBufferedFlipWhileAir, airBufferDuration, preSurfaceBufferDuration } from '../config.js';
import { getTile } from '../utils.js';
import { loseLife } from '../game.js';

export class Player {
  constructor(px, py) {
    this.x = px;
    this.y = py;
    this.vx = 0;
    this.vy = 0;
    this.w = tileSize * 0.6;
    this.h = tileSize * 0.9;
    this.onGround = false;
    // Auto-run direction: -1 (left) or 1 (right)
    this.autoDirection = Math.random() < 0.5 ? -1 : 1;
    this.autoSpeed = 4.0 * (tileSize / baseSize); // Scale speed with tile size
    // Gravity direction: 1 = normal (downward), -1 = flipped (upward)
    this.gravityDirection = 1;
    // For buffering the flip input:
    this.flipBufferTimestamp = 0;
    this.bufferedFlipAvailable = false;
    
    // ===== 新增动画属性 =====
    this.currentFrame = 0;
    this.frameDelay = 10;   // 每隔10帧切换一次图片（根据需要调整）
    this.frameCounter = 0;
    // =========================
  }

  update(tileMap, cameraOffsetX) {
    // Apply gravity.
    this.vy += gravity * this.gravityDirection;

    // If on a surface, apply friction and auto-run.
    if (this.onGround) {
      if (Math.abs(this.vx) < 0.05) {
        this.vx = this.autoDirection * this.autoSpeed;
      }
    }

    // Clamp horizontal speed.
    if (this.vx > maxSpeedX) this.vx = maxSpeedX;
    if (this.vx < -maxSpeedX) this.vx = -maxSpeedX;

    // Move horizontally and resolve collisions.
    this.x += this.vx;
    this.checkTileCollisions(true, tileMap);

    // Move vertically and resolve collisions.
    this.y += this.vy;
    // Reset onGround before checking vertical collisions.
    this.onGround = false;
    this.checkTileCollisions(false, tileMap);

    // Check for a buffered flip input.
    if (this.bufferedFlipAvailable) {
      let bufferDuration = allowBufferedFlipWhileAir
        ? airBufferDuration
        : preSurfaceBufferDuration;
      if (window.millis() - this.flipBufferTimestamp > bufferDuration) {
        // Buffer expired.
        this.bufferedFlipAvailable = false;
      } else if (this.onGround) {
        // Player just landed and a buffered flip is available.
        this.performGravityFlip();
        this.bufferedFlipAvailable = false;
      }
    }

    // Check if the player has fallen off the map or gone beyond the boundaries.
    const mapHeight = tileMap.length * tileSize;
    
    if (this.gravityDirection === 1) {
      // Normal gravity - check if fallen off the bottom
      if (this.y > mapHeight + 200) {
        loseLife();
        return;
      }
    } else {
      // Flipped gravity - check if gone beyond the top
      if (this.y < -200) {
        loseLife();
        return;
      }
    }

    // Check collisions with hazards (spike tiles).
    this.checkHazards(tileMap);

    // Update camera (ensuring it never goes negative).
    let newCameraOffsetX = this.x - window.width * 0.3;
    if (newCameraOffsetX < 0) newCameraOffsetX = 0;
    
    return newCameraOffsetX;
  }

  // Collision checking (horizontal and vertical remain unchanged).
  checkTileCollisions(isX, tileMap) {
    let halfW = this.w * 0.5;
    let halfH = this.h * 0.5;
    if (isX) {
      let epsilon = 1;
      let topRow = Math.floor((this.y - halfH) / tileSize);
      let bottomRow = Math.floor((this.y + halfH - epsilon) / tileSize);

      if (this.vx > 0) {
        // Moving right: check the right edge.
        let rightCol = Math.floor((this.x + halfW) / tileSize);
        for (let row = topRow; row <= bottomRow; row++) {
          if (row >= 0 && row < tileMap.length && rightCol >= 0 && rightCol < tileMap[row].length) {
            if (getTile(rightCol, row, tileMap) === 1) {
              this.x = rightCol * tileSize - halfW;
              this.vx = 0;
              this.autoDirection = -1;
              break;
            }
          }
        }
      } else if (this.vx < 0) {
        // Moving left: check the left edge.
        let leftCol = Math.floor((this.x - halfW) / tileSize);
        for (let row = topRow; row <= bottomRow; row++) {
          if (row >= 0 && row < tileMap.length && leftCol >= 0 && leftCol < tileMap[row].length) {
            if (getTile(leftCol, row, tileMap) === 1) {
              this.x = (leftCol + 1) * tileSize + halfW;
              this.vx = 0;
              this.autoDirection = 1;
              break;
            }
          }
        }
      }
    } else {
      let leftCol = Math.floor((this.x - halfW) / tileSize);
      let rightCol = Math.floor((this.x + halfW - 1) / tileSize);

      if ((this.vy > 0 && this.gravityDirection > 0) || (this.vy < 0 && this.gravityDirection < 0)) {
        let checkRow = Math.floor((this.gravityDirection > 0 ? this.y + halfH : this.y - halfH) / tileSize);
        for (let col = leftCol; col <= rightCol; col++) {
          if (checkRow >= 0 && checkRow < tileMap.length && col >= 0 && col < tileMap[checkRow].length) {
            if (getTile(col, checkRow, tileMap) === 1) {
              if (this.gravityDirection > 0) {
                this.y = checkRow * tileSize - halfH;
              } else {
                this.y = (checkRow + 1) * tileSize + halfH;
              }
              this.vy = 0;
              this.onGround = true;
              break;
            }
          }
        }
      } else if ((this.vy < 0 && this.gravityDirection > 0) || (this.vy > 0 && this.gravityDirection < 0)) {
        let checkRow = Math.floor((this.gravityDirection > 0 ? this.y - halfH : this.y + halfH) / tileSize);
        for (let col = leftCol; col <= rightCol; col++) {
          if (checkRow >= 0 && checkRow < tileMap.length && col >= 0 && col < tileMap[checkRow].length) {
            if (getTile(col, checkRow, tileMap) === 1) {
              if (this.gravityDirection > 0) {
                this.y = (checkRow + 1) * tileSize + halfH;
              } else {
                this.y = checkRow * tileSize - halfH;
              }
              this.vy = 0;
              break;
            }
          }
        }
      }
    }
  }

  // Check for collisions with hazards (spikes).
  checkHazards(tileMap) {
    let halfW = this.w * 0.4;
    let halfH = this.h * 0.4;
    let leftCol = Math.floor((this.x - halfW) / tileSize);
    let rightCol = Math.floor((this.x + halfW) / tileSize);
    let topRow = Math.floor((this.y - halfH) / tileSize);
    let bottomRow = Math.floor((this.y + halfH) / tileSize);

    for (let col = leftCol; col <= rightCol; col++) {
      for (let row = topRow; row <= bottomRow; row++) {
        if (getTile(col, row, tileMap) === 5) {
          loseLife();
          return;
        }
      }
    }
  }

  // Attempt to flip gravity.
  attemptGravityFlip() {
    if (this.onGround) {
      this.performGravityFlip();
    } else {
      this.flipBufferTimestamp = window.millis();
      this.bufferedFlipAvailable = true;
    }
  }

  // Actually perform the gravity flip.
  performGravityFlip() {
    this.gravityDirection *= -1;
    this.vy = 0;
    this.onGround = false;
    window.regravitySound.play();
  }

  // ===== 修改后的 draw 方法：使用动画图片 =====
  draw(cameraOffsetX) {
    // Update dimensions based on current tile size
    this.w = tileSize * 0.6;
    this.h = tileSize * 0.9;
    this.autoSpeed = 4.0 * (tileSize / baseSize);

    window.push();

    // 更新动画帧计数器，并切换当前帧
    this.frameCounter++;
    if (this.frameCounter >= this.frameDelay) {
      this.currentFrame = (this.currentFrame + 1) % playerImages.length;
      this.frameCounter = 0;
    }
    
    // 绘制当前帧图片，确保图片居中显示
    window.image(
      playerImages[this.currentFrame],
      this.x - cameraOffsetX - this.w * 0.5,
      this.y - this.h * 0.5,
      this.w,
      this.h
    );

    window.pop();
  }
}


