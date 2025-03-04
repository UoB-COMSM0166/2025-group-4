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
    this.w = tileSize;
    this.h = tileSize;
    this.onGround = false;
    // Auto-run direction: -1 (left) or 1 (right)
    this.autoDirection = Math.random() < 0.5 ? -1 : 1;
    this.autoSpeed = 4.0 * (tileSize / baseSize); // Scale speed with tile size
    this.targetSpeed = this.autoSpeed; // Target speed for smooth acceleration
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
    this.wallHitSlowdown = 0.7; // Speed multiplier after hitting wall
    this.lastGroundTimestamp = 0; // When player last touched ground
    
    // Visual feedback
    this.squashFactor = 1.0; // For squash and stretch animation
    this.stretchFactor = 1.0;
    this.recoveryRate = 0.1; // How quickly squash/stretch returns to normal
  }

  update(tileMap, cameraOffsetX) {
    // Store previous position for collision detection
    const prevX = this.x;
    const prevY = this.y;
    
    // Apply gravity
    this.vy += gravity * this.gravityDirection;

    // Smooth acceleration to target speed when on ground
    if (this.onGround) {
      this.lastGroundTimestamp = window.millis();
      
      // Gradually accelerate to target speed
      const speedDiff = (this.autoDirection * this.targetSpeed) - this.vx;
      this.vx += speedDiff * this.acceleration;
      
      // Normalize after wall hit
      const wallHitCooldown = 300; // ms
      if (window.millis() - this.hitWallTimestamp > wallHitCooldown) {
        // If we're past the wall hit cooldown, increase target speed back to normal
        this.targetSpeed = Math.min(this.targetSpeed + 0.1, this.autoSpeed);
      }
    }

    // Clamp horizontal speed
    if (this.vx > maxSpeedX) this.vx = maxSpeedX;
    if (this.vx < -maxSpeedX) this.vx = -maxSpeedX;

    // Move horizontally and resolve collisions
    this.x += this.vx;
    const hadHorizontalCollision = this.checkTileCollisions(true, tileMap, prevX, prevY);
    
    // Move vertically and resolve collisions
    this.y += this.vy;
    // Reset onGround before checking vertical collisions
    const wasOnGround = this.onGround;
    this.onGround = false;
    const hadVerticalCollision = this.checkTileCollisions(false, tileMap, prevX, prevY);
    
    // Add squash/stretch effects based on collisions and velocity
    if (!wasOnGround && this.onGround) {
      // Just landed - squash
      this.squashFactor = 0.7;
      this.stretchFactor = 1.3;
      
      // Make small particles on landing if speed was high enough
      if (Math.abs(this.vy) > 5) {
        // If we had particles system, we'd create landing particles here
      }
    }
    
    // Gradually recover from squash/stretch
    this.squashFactor = this.squashFactor + (1 - this.squashFactor) * this.recoveryRate;
    this.stretchFactor = this.stretchFactor + (1 - this.stretchFactor) * this.recoveryRate;

    // Check for a buffered flip input
    if (this.bufferedFlipAvailable) {
      let bufferDuration = allowBufferedFlipWhileAir
        ? airBufferDuration
        : preSurfaceBufferDuration;
      if (window.millis() - this.flipBufferTimestamp > bufferDuration) {
        // Buffer expired
        this.bufferedFlipAvailable = false;
      } else if (this.onGround) {
        // Player just landed and a buffered flip is available
        this.performGravityFlip();
        this.bufferedFlipAvailable = false;
      }
    }

    // Check if the player has fallen off the map or gone beyond the boundaries
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

    // Check collisions with hazards (spike tiles)
    this.checkHazards(tileMap);

    // Update camera (ensuring it never goes negative)
    let newCameraOffsetX = this.x - window.width * 0.3;
    if (newCameraOffsetX < 0) newCameraOffsetX = 0;
    
    return newCameraOffsetX;
  }

  // Enhanced collision checking with wall bounce effects
  checkTileCollisions(isX, tileMap, prevX, prevY) {
    let halfW = this.w * 0.5;
    let halfH = this.h * 0.5;
    let hadCollision = false;
    
    if (isX) {
      let epsilon = 1;
      let topRow = Math.floor((this.y - halfH) / tileSize);
      let bottomRow = Math.floor((this.y + halfH - epsilon) / tileSize);

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
              // Apply squash effect when landing
              if (Math.abs(this.vy) > 2) {
                this.squashFactor = Math.max(0.7, 1 - Math.abs(this.vy) * 0.02);
                this.stretchFactor = Math.min(1.3, 1 + Math.abs(this.vy) * 0.02);
              }
              this.vy = 0;
              this.onGround = true;
              hadCollision = true;
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
              hadCollision = true;
              break;
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

    for (let col = leftCol; col <= rightCol; col++) {
      for (let row = topRow; row <= bottomRow; row++) {
        if (getTile(col, row, tileMap) === 5) {
          loseLife();
          return;
        }
      }
    }
  }

  // Enhanced gravity flip with more feedback
  attemptGravityFlip() {
    // Allow flip with a short grace period after leaving ground
    const GROUND_GRACE_PERIOD = 150; // ms
    const wasRecentlyOnGround = window.millis() - this.lastGroundTimestamp < GROUND_GRACE_PERIOD;
    
    if (this.onGround || wasRecentlyOnGround) {
      this.performGravityFlip();
    } else {
      this.flipBufferTimestamp = window.millis();
      this.bufferedFlipAvailable = true;
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
    
    window.regravitySound.play();
  }

  draw(cameraOffsetX) {
    // Update dimensions based on current tile size
    this.w = tileSize;
    this.h = tileSize;
    this.autoSpeed = 4.0 * (tileSize / baseSize);

    window.push();

    // Update animation frame counter, and switch current frame
    this.frameCounter++;
    if (this.frameCounter >= this.frameDelay) {
      // Speed up animation based on horizontal velocity
      const speed = Math.abs(this.vx);
      this.currentFrame = (this.currentFrame + 1) % window.playerImages.length;
      this.frameCounter = 0;
      
      // Adjust frameDelay based on movement speed (faster movement = faster animation)
      this.frameDelay = Math.max(5, 10 - Math.abs(this.vx) * 2);
    }
    
    // Determine horizontal direction based on movement
    let facingRight = this.autoDirection > 0;
    if (Math.abs(this.vx) > 0.1) {
      facingRight = this.vx > 0;
    }
    
    // Apply transformations based on gravity direction and horizontal movement
    window.translate(this.x - cameraOffsetX, this.y);
    
    // Apply squash and stretch effects
    let scaleX = (facingRight ? 1 : -1) * this.stretchFactor; 
    let scaleY = this.gravityDirection < 0 ? -this.squashFactor : this.squashFactor;
    
    // Apply vertical flip if gravity is flipped
    window.scale(scaleX, scaleY);
    
    // Add a slight tilt based on velocity for more dynamic movement feel
    // const tiltAngle = this.vx * 0.05;
    // window.rotate(tiltAngle);
    
    // Draw the image at the origin (after translation)
    window.image(
      window.playerImages[this.currentFrame],
      -this.w * 0.5,
      -this.h * 0.5,
      this.w,
      this.h
    );

    window.pop();
  }
}


