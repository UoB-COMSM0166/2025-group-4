/**
 * Player class
 */
import { tileSize, baseSize, gravity, maxSpeedX, allowBufferedFlipWhileAir, airBufferDuration, preSurfaceBufferDuration } from '../config.js';
import { getTile } from '../utils.js';
import { loseLife } from '../game.js';

// Get reference to global game state
let invincibilityActive = false;

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
    this.wallHitSlowdown = 0.6; // Speed multiplier after hitting wall
    this.lastGroundTimestamp = 0; // When player last touched ground
    
    // Visual feedback
    this.squashFactor = 1.0; // For squash and stretch animation
    this.stretchFactor = 1.0;
    this.recoveryRate = 0.1; // How quickly squash/stretch returns to normal
    
    // Hit flash effect
    this.hitFlashActive = false;
    this.hitFlashIntensity = 0;
  }

  update(tileMap, cameraOffsetX) {
    // Get current invincibility state from window
    invincibilityActive = window.invincibilityActive;
    
    // Update hit flash effect
    if (this.hitFlashActive) {
      this.hitFlashIntensity -= 0.1;
      if (this.hitFlashIntensity <= 0) {
        this.hitFlashIntensity = 0;
        this.hitFlashActive = false;
      }
    }
    
    // Store previous position for collision detection
    const prevX = this.x;
    const prevY = this.y;
    
    // Apply gravity
    this.vy += gravity * this.gravityDirection;

    // Limit maximum vertical speed to prevent falling through tiles
    const maxVerticalSpeed = 12 * (tileSize / baseSize); // Scale with tile size
    if (this.vy > maxVerticalSpeed) this.vy = maxVerticalSpeed;
    if (this.vy < -maxVerticalSpeed) this.vy = -maxVerticalSpeed;

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

    // For high vertical speeds, do multiple collision checks to prevent tunneling
    const steps = Math.max(1, Math.ceil(Math.abs(this.vy) / 5));
    
    // Move horizontally and resolve collisions
    this.x += this.vx;
    const hadHorizontalCollision = this.checkTileCollisions(true, tileMap, prevX, prevY);
    
    // Store onGround state before vertical movement
    const wasOnGround = this.onGround;
    
    // Move vertically in steps for high speeds
    if (steps > 1) {
      const stepVy = this.vy / steps;
      for (let i = 0; i < steps; i++) {
        this.y += stepVy;
        // Reset onGround before checking vertical collisions
        if (i === 0) {
          this.onGround = false;
        }
        const hadVerticalCollision = this.checkTileCollisions(false, tileMap, prevX, prevY);
        if (hadVerticalCollision) break;
      }
    } else {
      // Normal vertical movement for low speeds
      this.y += this.vy;
      // Reset onGround before checking vertical collisions
      this.onGround = false;
      const hadVerticalCollision = this.checkTileCollisions(false, tileMap, prevX, prevY);
    }
    
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
        this.triggerHitEffect();
        loseLife();
        return;
      }
    } else {
      // Flipped gravity - check if gone beyond the top
      if (this.y < -200) {
        this.triggerHitEffect();
        loseLife();
        return;
      }
    }

    // Check collisions with hazards (spike tiles)
    this.checkHazards(tileMap);

    // Improved camera positioning with better centering:
    
    // Calculate map dimensions
    const mapWidth = tileMap[0].length * tileSize;
    
    // Check if the entire map can fit within the viewport
    if (mapWidth <= window.width) {
      // If the map is smaller than the viewport, center it horizontally
      let newCameraOffsetX = (mapWidth - window.width) / 2;
      // Ensure we don't go negative (which would happen if map is smaller than viewport)
      newCameraOffsetX = Math.max(0, newCameraOffsetX);
      return newCameraOffsetX;
    } else {
    // Map is larger than viewport, follow player with improved positioning
    // Smoothly adjust camera position based on player's direction to avoid abrupt changes
    const targetRatio = this.autoDirection > 0 ? 0.4 : 0.6;
    // Ensure cameraPositionRatio is initialized
    if (this.cameraPositionRatio === undefined) {
        this.cameraPositionRatio = targetRatio;
    }
    // Smoothly update the camera ratio (adjust the smoothing factor as needed)
    this.cameraPositionRatio += (targetRatio - this.cameraPositionRatio) * 0.02;
    let newCameraOffsetX = this.x - window.width * this.cameraPositionRatio;
      
      // Ensure camera doesn't go negative
      newCameraOffsetX = Math.max(0, newCameraOffsetX);
      
      // Ensure camera doesn't go beyond the right edge of the level
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
    this.w = tileSize * 0.9;
    this.h = tileSize * 0.9;
    this.autoSpeed = 4.0 * (tileSize / baseSize);

    window.push();
    window.translate(this.x - cameraOffsetX, this.y);
    
    // Apply squash and stretch for more dynamic feel
    window.scale(this.stretchFactor, this.squashFactor);
    
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
        const pulseAmount = 0.5 + Math.sin(window.frameCount * 0.2) * 0.3;
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
      window.rect(-this.w/2, -this.h/2, this.w, this.h);
    }
    
    window.pop();
  }
}


