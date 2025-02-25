/**
 * Player class
 */
import { tileSize, gravity, maxSpeedX, allowBufferedFlipWhileAir, airBufferDuration, preSurfaceBufferDuration } from '../config.js';
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
    this.autoSpeed = 4.0;
    // Gravity direction: 1 = normal (downward), -1 = flipped (upward)
    this.gravityDirection = 1;
    // For buffering the flip input:
    this.flipBufferTimestamp = 0;
    this.bufferedFlipAvailable = false;
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
          // Ensure we're checking within the bounds of the tilemap
          if (row >= 0 && row < tileMap.length && rightCol >= 0 && rightCol < tileMap[row].length) {
            if (getTile(rightCol, row, tileMap) === 1) {
              // Place the player flush with the tile and reverse direction.
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
          // Ensure we're checking within the bounds of the tilemap
          if (row >= 0 && row < tileMap.length && leftCol >= 0 && leftCol < tileMap[row].length) {
            if (getTile(leftCol, row, tileMap) === 1) {
              // Place the player flush with the tile and reverse direction.
              this.x = (leftCol + 1) * tileSize + halfW;
              this.vx = 0;
              this.autoDirection = 1;
              break;
            }
          }
        }
      }
    } else {
      // Vertical collision.
      let leftCol = Math.floor((this.x - halfW) / tileSize);
      let rightCol = Math.floor((this.x + halfW - 1) / tileSize);

      // Check for vertical collisions based on gravity direction and velocity
      if ((this.vy > 0 && this.gravityDirection > 0) || (this.vy < 0 && this.gravityDirection < 0)) {
        // Moving in the direction of gravity: check the appropriate edge
        let checkRow = Math.floor((this.gravityDirection > 0 ? this.y + halfH : this.y - halfH) / tileSize);
        
        for (let col = leftCol; col <= rightCol; col++) {
          // Ensure we're checking within the bounds of the tilemap
          if (checkRow >= 0 && checkRow < tileMap.length && col >= 0 && col < tileMap[checkRow].length) {
            if (getTile(col, checkRow, tileMap) === 1) {
              // Place the player flush with the tile and stop movement
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
        // Moving against gravity: check the opposite edge
        let checkRow = Math.floor((this.gravityDirection > 0 ? this.y - halfH : this.y + halfH) / tileSize);
        
        for (let col = leftCol; col <= rightCol; col++) {
          // Ensure we're checking within the bounds of the tilemap
          if (checkRow >= 0 && checkRow < tileMap.length && col >= 0 && col < tileMap[checkRow].length) {
            if (getTile(col, checkRow, tileMap) === 1) {
              // Place the player flush with the tile and stop movement
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
    let halfW = this.w * 0.4; // Use a smaller hitbox for hazards.
    let halfH = this.h * 0.4;
    let leftCol = Math.floor((this.x - halfW) / tileSize);
    let rightCol = Math.floor((this.x + halfW) / tileSize);
    let topRow = Math.floor((this.y - halfH) / tileSize);
    let bottomRow = Math.floor((this.y + halfH) / tileSize);

    // Check all tiles in the player's hitbox.
    for (let col = leftCol; col <= rightCol; col++) {
      for (let row = topRow; row <= bottomRow; row++) {
        if (getTile(col, row, tileMap) === 5) {
          // Spike collision!
          loseLife();
          return;
        }
      }
    }
  }

  // Attempt to flip gravity.
  attemptGravityFlip() {
    if (this.onGround) {
      // Player is on a surface, so flip immediately.
      this.performGravityFlip();
    } else {
      // Player is in the air, so buffer the input.
      this.flipBufferTimestamp = window.millis();
      this.bufferedFlipAvailable = true;
    }
  }

  // Actually perform the gravity flip.
  performGravityFlip() {
    this.gravityDirection *= -1;
    this.vy = 0; // Reset vertical velocity.
    // Apply a smaller impulse in the new gravity direction
    // this.vy = this.gravityDirection * -6;
    this.onGround = false;
  }

  draw(cameraOffsetX) {
    window.push();
    // Draw the player as a rectangle.
    window.fill(255, 200, 0);
    window.rectMode(CENTER);
    window.rect(this.x - cameraOffsetX, this.y, this.w, this.h, 4);

    // Draw eyes to indicate which way is up.
    window.fill(0);
    let eyeY = this.y - (this.h * 0.2) * this.gravityDirection;
    window.ellipse(
      this.x - cameraOffsetX - this.w * 0.2,
      eyeY,
      this.w * 0.2,
      this.w * 0.2
    );
    window.ellipse(
      this.x - cameraOffsetX + this.w * 0.2,
      eyeY,
      this.w * 0.2,
      this.w * 0.2
    );
    window.pop();
  }
}
