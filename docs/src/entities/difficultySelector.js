/**
 * DifficultySelector Entity
 * Special entity for the menu demo that starts the game with a selected difficulty
 */
import { selectDifficulty } from '../gameState.js';
import { tileSize } from '../config.js';
import { particleSystem } from '../particles.js';

export class DifficultySelector {
  /**
   * Create a new difficulty selector
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {string} difficulty - Difficulty level ("easy", "normal", "hard", "random")
   * @param {p5.Color} color - Color of the selector
   */
  constructor(x, y, difficulty, color) {
    this.x = x;
    this.y = y;
    this.difficulty = difficulty;
    this.color = color;
    this.width = tileSize * 3;
    this.height = tileSize * 1.5;
    this.hover = false;
    this.pulse = 0;
    this.particleTimer = 0;
  }
  
  /**
   * Update the difficulty selector
   * @param {number} dt - Delta time
   */
  update(dt) {
    // Update pulse animation
    this.pulse = (Math.sin(millis() * 0.005) + 1) * 0.5;
    
    // Create hover particles
    this.particleTimer -= dt;
    if (this.hover && this.particleTimer <= 0) {
      this.particleTimer = 0.1; // Create particles every 100ms
      this.createHoverParticles();
    }
  }
  
  /**
   * Draw the difficulty selector
   * @param {number} cameraOffsetX - Camera X offset
   */
  draw(cameraOffsetX = 0) {
    // --- Simplified Drawing for Debugging ---
    push();
    fill(255, 0, 0, 200); // Bright red, semi-transparent
    noStroke();
    rectMode(CENTER); // Ensure rect mode is center
    rect(this.x, this.y, this.width, this.height);
    pop();
    return; // End simplified drawing
    // --- End Simplified Drawing ---

    /* // Original drawing code commented out
    // Draw animated background
    push();
    
    const pulseSize = this.pulse * 5;
    const baseAlpha = 180 + this.pulse * 75;
    
    // Glow effect if hovering
    if (this.hover) {
      noStroke();
      fill(this.color.levels[0], this.color.levels[1], this.color.levels[2], 100);
      rect(this.x - this.width/2 - pulseSize, this.y - this.height/2 - pulseSize, 
           this.width + pulseSize*2, this.height + pulseSize*2, 10);
    }
    
    // Main rectangle
    fill(this.color.levels[0], this.color.levels[1], this.color.levels[2], baseAlpha);
    stroke(255, 255, 255, 200);
    strokeWeight(2);
    rect(this.x - this.width/2, this.y - this.height/2, this.width, this.height, 8);
    
    // Draw text
    fill(0);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(this.height * 0.5);
    textStyle(NORMAL);
    text(this.difficulty.toUpperCase(), this.x, this.y);
    
    pop();
    */
  }
  
  /**
   * Check if player collides with this difficulty selector
   * @param {Player} player - The player entity
   * @returns {boolean} True if collision occurred
   */
  checkCollision(player) {
    if (!player) return false;
    
    // Check if player is within bounds of the selector
    const collision = 
      player.x + player.w/2 > this.x - this.width/2 &&
      player.x - player.w/2 < this.x + this.width/2 &&
      player.y + player.h/2 > this.y - this.height/2 &&
      player.y - player.h/2 < this.y + this.height/2;
    
    // Update hover state
    this.hover = collision;
    
    // If collision detected, trigger difficulty selection
    if (collision) {
      selectDifficulty(this.difficulty);
      this.createSelectionParticles();
      return true;
    }
    
    return false;
  }
  
  /**
   * Create hover effect particles
   */
  createHoverParticles() {
    for (let i = 0; i < 2; i++) {
      const px = this.x + random(-this.width/2, this.width/2);
      const py = this.y + random(-this.height/2, this.height/2);
      
      particleSystem.addParticle(px, py, {
        vx: random(-0.5, 0.5),
        vy: random(-1, -0.5),
        color: this.color,
        life: random(20, 40),
        size: random(2, 5),
        gravity: 0,
        drag: 0.97,
        alpha: 150
      });
    }
  }
  
  /**
   * Create particles when difficulty is selected
   */
  createSelectionParticles() {
    particleSystem.createBurst(
      this.x,
      this.y,
      30,
      {
        color: this.color,
        life: random(30, 60),
        size: random(4, 10),
        speed: random(2, 5),
        gravity: 0,
        drag: 0.95
      }
    );
  }
} 