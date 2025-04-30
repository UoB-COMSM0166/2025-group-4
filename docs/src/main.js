/**
 * Main entry point for the game
 */
import { 
  initGame, updateGame, drawGame, handleKeyPressed, 
  handleMouseClicked, handleTouchStarted, reloadCurrentLevel,
  loadLevel, state
} from './game.js';
import { tileSize, updateTileSize } from './config.js';
import { 
  initLevelEditor, updateLevelEditor, drawLevelEditor, 
  handleEditorMousePressed, handleEditorMouseDragged, 
  handleEditorMouseReleased, handleEditorMouseWheel, 
  handleEditorKeyPressed, exportLevel 
} from './levelEditor.js';

// Assets (images, sounds, etc.)
let deathSound;
let getCoinSound;
let passSound;
let regravitySound;
let bgm;
// Global state
let lastFrameTime = 0; // For fixed timestep
let editorMode = false; // Track whether we're in editor mode

/**
 * p5.js preload function - load assets before setup
 */
function preload() {
  // Load sounds
  deathSound = loadSound('src/assets/music/death.wav');
  getCoinSound = loadSound('src/assets/music/getcoin.mp3');
  passSound = loadSound('src/assets/music/pass.mp3');
  regravitySound = loadSound('src/assets/music/regravity.mp3');
  bgm = loadSound('src/assets/music/background.mp3');
  
  
  // Load images and make them available globally
  window.coinImage = loadImage('src/assets/art/images/coin.png');
  window.enemyImage = loadImage('src/assets/art/images/enemy.png');


  // Player images
  window.playerImages = [];
  window.playerImages.push(loadImage('src/assets/art/images/player/7.png'));
  window.playerImages.push(loadImage('src/assets/art/images/player/8.png'));
  window.playerImages.push(loadImage('src/assets/art/images/player/9.png'));
  
  // Exit gate image
  // window.exitGateImage = loadImage('src/images/9.png');
  
  console.log("All assets loaded in preload()");
}

/**
 * p5.js setup function - initialize the game
 */
function setup() {
  // Dynamically adjust canvas size based on window
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.style('display', 'block'); // Remove any margin/padding

  // Update the tile size based on window dimensions
  let newTileSize = updateTileSize(windowWidth, windowHeight);
  console.log("Updated tile size to:", newTileSize);

  // Ensure sounds are available globally
  window.deathSound = deathSound;
  window.getCoinSound = getCoinSound;
  window.passSound = passSound;
  window.regravitySound = regravitySound;

  window.bgm = bgm;
  bgm.setLoop(true);


  // Initialize the game
  initGame();
}

/**
 * p5.js draw function - main game loop
 */
function draw() {
  // Calculate deltaTime in seconds for fixed timestep
  const gameTime = millis() / 1000;
  const deltaTime = constrain(gameTime - lastFrameTime, 0, 0.1);
  lastFrameTime = gameTime;

  // Update and render based on current mode
  if (editorMode) {
    updateLevelEditor();
    drawLevelEditor();
  } else {
    // Only update if in play state, otherwise just render
    if (state.gameState === "play") {
      updateGame(deltaTime);
    }
    drawGame();
  }
}

/**
 * p5.js keyPressed function - handle keyboard input
 */
function keyPressed() {
  // Handle global key commands first
  if (keyCode === 27) { // ESC key to toggle editor mode
    toggleEditorMode();
    return;
  }
  
  // Then route to the appropriate handler
  if (editorMode) {
    handleEditorKeyPressed();
  } else {
    handleKeyPressed();
  }
}

/**
 * Toggle between game mode and editor mode
 */
function toggleEditorMode() {
  editorMode = !editorMode;
  
  if (editorMode) {
    // Entering editor mode
    initLevelEditor();
  } else {
    // Exiting editor mode - you can optionally do something here
    console.log("Exited editor mode");
  }
}

/**
 * p5.js mousePressed function - handle mouse input
 */
function mousePressed() {

  if (window.bgm && !window.bgmStarted) {
    window.bgm.setLoop(true);
    window.bgm.setVolume(0.5); // 可选：设置音量
    window.bgm.play();
    window.bgmStarted = true;
    console.log("BGM started on first user interaction.");
  }

  
  if (editorMode) {
    handleEditorMousePressed();
  } else {
    // In game mode, attempt to flip gravity on mouse press
    if (state.gameState === "play" && window.player) {
      window.player.attemptGravityFlip();
    } else {
      // Handle other mouse press events in different game states
      handleMouseClicked();
    }
  }
}

/**
 * p5.js mouseDragged function - handle mouse drag
 */
function mouseDragged() {
  if (editorMode) {
    handleEditorMouseDragged();
  }
}

/**
 * p5.js mouseReleased function - handle mouse release
 */
function mouseReleased() {
  if (editorMode) {
    handleEditorMouseReleased();
  }
}

/**
 * p5.js mouseWheel function - handle mouse wheel
 */
function mouseWheel(event) {
  if (editorMode) {
    handleEditorMouseWheel(event);
    return false; // Prevent default behavior
  }
  return true; // Allow default behavior in game mode
}

/**
 * p5.js mouseClicked function - handle mouse clicks
 */
function mouseClicked() {
  if (!editorMode) {
    handleMouseClicked();
  }
}

/**
 * p5.js touchStarted function - handle touch input for mobile
 */
function touchStarted() {
  if (!editorMode) {
    handleTouchStarted();
  }
  return false; // prevent default
}

/**
 * p5.js windowResized function - handle window resize
 */
function windowResized() {
  // Resize the canvas to match the window
  resizeCanvas(windowWidth, windowHeight);
  
  // Remember the old tile size for position conversion
  const oldTileSize = tileSize;
  
  // Update the tile size based on new window dimensions
  const newTileSize = updateTileSize(windowWidth, windowHeight);
  
  console.log(`Window resized: tile size changed from ${oldTileSize} to ${newTileSize}`);
  
  // Reload the level to adjust for the new size
  reloadCurrentLevel(oldTileSize);
}

// Add custom global function for editor to export level to the game
function exportEditorLevel() {
  const levelData = exportLevel();
  if (levelData) {
    // Add the level to the game's levels array
    import('./game.js').then(game => {
      if (game.addCustomLevel(levelData)) {
        console.log("Level successfully added to the game!");
        return true;
      }
    });
  }
  return false;
}

// Assign all p5.js functions to the window object for global mode
window.preload = preload;
window.setup = setup;
window.draw = draw;
window.keyPressed = keyPressed;
window.mousePressed = mousePressed;
window.mouseDragged = mouseDragged;
window.mouseReleased = mouseReleased;
window.mouseWheel = mouseWheel;
window.mouseClicked = mouseClicked;
window.touchStarted = touchStarted;
window.windowResized = windowResized;
window.exportEditorLevel = exportEditorLevel;
