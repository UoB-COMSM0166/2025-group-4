/**
 * Main entry point for the game
 * p5.js "Way of the Dodo" - Prototype
 * (Gravity-flip experiment with input buffering)
 */
import { initGame, updateGame, drawGame, handleKeyPressed, handleTouchStarted, handleMouseClicked, reloadCurrentLevel } from './game.js';
import { numCols, numRows, tileSize, updateTileSize } from './config.js';


// p5.js setup function
function setup() {
  createCanvas(windowWidth, windowHeight);
  // Calculate appropriate tile size before initializing the game
  updateTileSize(windowWidth, windowHeight);
  initGame();
}

// p5.js draw function
function draw() {
  // 直接调用 game.js 中的更新与绘制函数
  updateGame();
  drawGame();
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
