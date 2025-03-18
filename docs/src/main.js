/**
 * Main entry point for the game
 * p5.js "Way of the Dodo" - Prototype
 * (Gravity-flip experiment with input buffering)
 */
import { initGame, updateGame, drawGame, handleKeyPressed, handleTouchStarted, handleMouseClicked, reloadCurrentLevel } from './game.js';
import { numCols, numRows, tileSize, updateTileSize } from './config.js';

// Fixed timestep physics variables
let previousTime = 0;
let accumulator = 0;
const FIXED_DELTA_TIME = 1/60; // 60 updates per second (in seconds)
const MAX_FRAME_TIME = 0.25; // Maximum time to prevent spiral of death

// p5.js setup function
function setup() {
  createCanvas(windowWidth, windowHeight);
  // Calculate appropriate tile size before initializing the game
  updateTileSize(windowWidth, windowHeight);
  initGame();
  
  // Initialize time for fixed timestep
  previousTime = millis() / 1000; // Convert to seconds
}

// p5.js draw function
function draw() {
  // Calculate deltaTime for fixed timestep
  const currentTime = millis() / 1000; // Convert to seconds
  let deltaTime = currentTime - previousTime;
  previousTime = currentTime;
  
  // Prevent spiral of death by clamping deltaTime
  if (deltaTime > MAX_FRAME_TIME) {
    deltaTime = MAX_FRAME_TIME;
  }
  
  // Add to accumulator
  accumulator += deltaTime;
  
  // Update game physics at fixed intervals while accumulator has enough time
  while (accumulator >= FIXED_DELTA_TIME) {
    updateGame(FIXED_DELTA_TIME);
    accumulator -= FIXED_DELTA_TIME;
  }
  
  // Always draw at the frame rate
  drawGame(accumulator / FIXED_DELTA_TIME); // Pass interpolation factor
}

// p5.js keyPressed function
function keyPressed() {
  handleKeyPressed();
  return false; // Prevent default behavior.
}

// p5.js mouseClicked function
function mouseClicked() {
  handleMouseClicked();
  return false; // Prevent default behavior.
}

// p5.js touchStarted function
function touchStarted() {
  handleTouchStarted();
  return false; // Prevent default behavior.
}

let resizeTimeout;
function windowResized() {
  clearTimeout(resizeTimeout);
  // Wait 250ms after the last resize event before reloading.
  resizeTimeout = setTimeout(() => {
    resizeCanvas(windowWidth, windowHeight);
    const oldTileSize = tileSize;
    updateTileSize(windowWidth, windowHeight);
    reloadCurrentLevel(oldTileSize);
  }, 250);
}

// Expose p5.js functions globally
window.setup = setup;
window.draw = draw;
window.keyPressed = keyPressed;
window.mouseClicked = mouseClicked;
window.touchStarted = touchStarted;
window.windowResized = windowResized;
