/**
 * Main entry point for the game
 * p5.js "Way of the Dodo" - Prototype
 * (Gravity-flip experiment with input buffering)
 */
import { initGame, updateGame, drawGame, handleKeyPressed, handleTouchStarted } from './game.js';


// p5.js setup function
function setup() {
  createCanvas(640, 480);
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

// p5.js touchStarted function
function touchStarted() {
  handleTouchStarted();
  return false; // Prevent default behavior.
}

// Expose p5.js functions globally
window.setup = setup;
window.draw = draw;
window.keyPressed = keyPressed;
window.touchStarted = touchStarted;
