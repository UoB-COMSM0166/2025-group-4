/**
 * Main entry point for the game
 */
import { 
  initGame, updateGame, drawGame, handleKeyPressed, 
  handleMouseClicked, handleTouchStarted, reloadCurrentLevel,
  loadLevel, state, addCustomLevel
} from './game.js';
import { tileSize, updateTileSize } from './config.js';
import { 
  initLevelEditor, updateLevelEditor, drawLevelEditor, 
  handleEditorMousePressed, handleEditorMouseDragged, 
  handleEditorMouseReleased, handleEditorMouseWheel, 
  handleEditorKeyPressed, exportLevel 
} from './levelEditor.js';
import { particleSystem } from './particles.js';
import { setupLevels } from './levels.js';
import { assetSets } from './mapGenerator.js';

// Assets (images, sounds, etc.)
let deathSound;
let getCoinSound;
let passSound;
let regravitySound;
let bgm;
let freezeSound;
let skidSound;
// Global state
let lastFrameTime = 0; // For fixed timestep
let editorMode = false; // Track whether we're in editor mode

// Make sure DOM is ready before initializing loading screen
document.addEventListener('DOMContentLoaded', () => {
  // Set initial loading text
  const loadingText = document.getElementById('loading-text');
  if (loadingText) {
    loadingText.textContent = 'Preparing to load assets...';
  }
});

// Get all level-specific assets to preload
function collectLevelAssets() {
  // Get all levels from setupLevels() function
  const levels = setupLevels();
  const assetPaths = new Set();
  
  // Collect assets from static levels
  levels.forEach(level => {
    if (level.assets) {
      Object.values(level.assets).forEach(path => {
        if (typeof path === 'string' && path.includes('.')) {
          assetPaths.add(path);
        }
      });
    }
  });
  
  // Collect assets from mapGenerator assetSets
  assetSets.forEach(set => {
    Object.values(set).forEach(path => {
      if (typeof path === 'string' && path.includes('.')) {
        assetPaths.add(path);
      }
    });
  });
  
  return Array.from(assetPaths);
}

// Get all level-specific asset paths
const levelAssetPaths = collectLevelAssets();

// Resource categories for loading
const categories = {
  sounds: { total: 6, loaded: 0, name: "Sound Assets" },
  playerImages: { total: 3, loaded: 0, name: "Player Graphics" },
  enemyImages: { total: 4, loaded: 0, name: "Enemy Graphics" },
  bulletImages: { total: 1, loaded: 0, name: "Weapon Graphics" },
  miscImages: { total: 2, loaded: 0, name: "Misc Graphics" },
  levelAssets: { total: levelAssetPaths.length, loaded: 0, name: "Level Assets" }
};

// Asset cache - store all loaded assets by path
window.assetCache = {};

// Calculate total assets across all categories
let totalAssets = Object.values(categories).reduce((sum, category) => sum + category.total, 0);
let loadedAssets = 0;
let loadingStartTime = 0;
let loadingMinTime = 1800; // Minimum time to show loading screen (ms)
let loadingComplete = false;

/**
 * Update loading progress bar by category
 */
function updateLoadingProgress(category, filename) {
  categories[category].loaded++;
  loadedAssets++;
  
  // Calculate total completion percentage
  const totalPercentage = Math.min(Math.floor((loadedAssets / totalAssets) * 100), 99); // Cap at 99% until fully complete
  
  // Update progress bar
  const progressBar = document.getElementById('progress-bar');
  if (progressBar) {
    progressBar.style.width = `${totalPercentage}%`;
  }
  
  // Update loading text with category info
  const loadingText = document.getElementById('loading-text');
  if (loadingText) {
    const categoryName = categories[category].name;
    const categoryProgress = Math.floor((categories[category].loaded / categories[category].total) * 100);
    loadingText.textContent = `Loading ${categoryName}: ${categoryProgress}%`;
  }
  
  console.log(`Loaded asset: ${filename} in category ${category} - Total progress: ${totalPercentage}%`);
}

/**
 * Complete loading and transition to game
 */
function completeLoading() {
  if (loadingComplete) return;
  loadingComplete = true;
  
  // Force progress to 100%
  const progressBar = document.getElementById('progress-bar');
  if (progressBar) {
    progressBar.style.width = "100%";
  }
  
  // Update text
  const loadingText = document.getElementById('loading-text');
  if (loadingText) {
    loadingText.textContent = "Loading complete! Starting game...";
  }
  
  const loadingTime = Date.now() - loadingStartTime;
  
  // Ensure loading screen shows for at least minimum time for better UX
  if (loadingTime < loadingMinTime) {
    const remainingTime = loadingMinTime - loadingTime;
    setTimeout(() => {
      document.body.classList.add('loaded');
      // Remove loading screen from DOM after transition
      setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen && loadingScreen.parentNode) {
          loadingScreen.parentNode.removeChild(loadingScreen);
        }
      }, 800); // Wait for opacity transition to complete
    }, remainingTime);
  } else {
    document.body.classList.add('loaded');
    // Remove loading screen from DOM after transition
    setTimeout(() => {
      const loadingScreen = document.getElementById('loading-screen');
      if (loadingScreen && loadingScreen.parentNode) {
        loadingScreen.parentNode.removeChild(loadingScreen);
      }
    }, 800); // Wait for opacity transition to complete
  }
}

/**
 * Centralized function to load an image and cache it
 */
function loadAndCacheImage(path, category, filename) {
  const img = loadImage(path, 
    () => {
      updateLoadingProgress(category, filename);
      // Store in cache
      window.assetCache[path] = img;
    },
    (err) => {
      console.error(`Failed to load image: ${path}`, err);
      updateLoadingProgress(category, filename);
    }
  );
  return img;
}

/**
 * p5.js preload function - load assets before setup
 */
function preload() {
  loadingStartTime = Date.now();
  
  // Initialize asset cache
  window.assetCache = {};
  
  // Load sounds
  freezeSound = loadSound('src/assets/music/freeze.mp3', 
    () => updateLoadingProgress('sounds', 'freeze.mp3')); 
  deathSound = loadSound('src/assets/music/death.wav',
    () => updateLoadingProgress('sounds', 'death.wav'));
  getCoinSound = loadSound('src/assets/music/getcoin.mp3',
    () => updateLoadingProgress('sounds', 'getcoin.mp3'));
  passSound = loadSound('src/assets/music/pass.mp3',
    () => updateLoadingProgress('sounds', 'pass.mp3'));
  regravitySound = loadSound('src/assets/music/regravity.mp3',
    () => updateLoadingProgress('sounds', 'regravity.mp3'));
  bgm = loadSound('src/assets/music/background.mp3',
    () => updateLoadingProgress('sounds', 'background.mp3'));
  skidSound = loadSound('src/assets/music/skid.mp3', 
    () => updateLoadingProgress('sounds', 'skid.mp3'));
  
  // Load images and make them available globally
  window.coinImage = loadAndCacheImage('src/assets/art/images/coin.png', 'miscImages', 'coin.png');
  window.enemyImage = loadAndCacheImage('src/assets/art/images/enemy.png', 'enemyImages', 'enemy.png');

  window.enemyFrames = [
    loadImage("src/assets/art/images/enemies/flyenemy-1/greenflyenemy1.png"),
    loadImage("src/assets/art/images/enemies/flyenemy-1/greenflyenemy2.png"),
    loadImage("src/assets/art/images/enemies/flyenemy-1/greenflyenemy3.png"),
    loadImage("src/assets/art/images/enemies/flyenemy-1/greenflyenemy4.png"),
  ];

  
  window.exitGateImage = loadImage("src/assets/art/images/gates/gate-8.png");

  // Player images
  window.playerImages = [];
  window.playerImages.push(loadAndCacheImage('src/assets/art/images/player/7.png', 'playerImages', 'player/7.png'));
  window.playerImages.push(loadAndCacheImage('src/assets/art/images/player/8.png', 'playerImages', 'player/8.png'));
  window.playerImages.push(loadAndCacheImage('src/assets/art/images/player/9.png', 'playerImages', 'player/9.png'));

  // Shooter enemy images (animated frames)
  window.shooterEnemyFrames = [
    loadAndCacheImage('src/assets/art/images/flyenemy1.png', 'enemyImages', 'flyenemy1.png'),
    loadAndCacheImage('src/assets/art/images/flyenemy2.png', 'enemyImages', 'flyenemy2.png'),
    loadAndCacheImage('src/assets/art/images/flyenemy3.png', 'enemyImages', 'flyenemy3.png'),
    loadAndCacheImage('src/assets/art/images/flyenemy4.png', 'enemyImages', 'flyenemy4.png')
  ];

  // Shooter enemy bullet
  window.shooterBulletImage = loadAndCacheImage('src/assets/art/images/arrow.png', 'bulletImages', 'arrow.png');
  
  // Load all level-specific assets
  console.log(`Loading ${levelAssetPaths.length} level-specific assets`);
  levelAssetPaths.forEach((path, index) => {
    // Skip if already loaded
    if (window.assetCache[path]) return;
    
    // Load the image and store in cache
    loadAndCacheImage(path, 'levelAssets', path.split('/').pop());
  });

  console.log("All assets loaded in preload()");
}

/**
 * p5.js setup function - initialize the game
 */
function setup() {
  // Complete loading and transition to game
  completeLoading();
  
  // Dynamically adjust canvas size based on window
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.style('display', 'block'); // Remove any margin/padding

  // Set the font for p5.js text
  textFont('Chewy');

  // Update the tile size based on window dimensions
  let newTileSize = updateTileSize(windowWidth, windowHeight);
  console.log("Updated tile size to:", newTileSize);

  createCanvas(windowWidth, windowHeight);
  getAudioContext().resume(); // 确保音频系统激活
  if (window.bgm && window.bgm.isLoaded() && !window.bgm.isPlaying()) {
    window.bgm.setVolume(1.0);
    window.bgm.setLoop(true);
    window.bgm.play(); // 若浏览器支持自动播放则直接开始
  }

  // Ensure sounds are available globally
  window.deathSound = deathSound;
  window.getCoinSound = getCoinSound;
  window.passSound = passSound;
  window.regravitySound = regravitySound;
  window.freezeSound = freezeSound;
  window.skidSound = skidSound;


  window.bgm = bgm;
  bgm.setLoop(true);


  // Initialize the game
  initGame();
  // Ensure images are properly loaded
  console.log("Preloaded player images:", window.playerImages ? window.playerImages.length : "none");
  
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
    // Only update if in play state or menu demo mode, otherwise just render
    if (state.gameState === "play" || (state.gameState === "menu" && state.menuDemoActive)) {
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

  if (window.bgm && !window.bgm.isPlaying()) {
    getAudioContext().resume();
    window.bgm.setVolume(1.0);
    window.bgm.setLoop(true);
    window.bgm.play();
    console.log("BGM started on mouse interaction.");
  }
  
  if (editorMode) {
    handleEditorMousePressed();
  } else {
    // Check if we're in the menu demo state first
    if (state.gameState === "menu" && state.menuDemoActive) {
      console.log("Mouse pressed in menu demo");
      
      // Direct gravity flip without going through multiple handlers
      if (state.player) {
        // Only flip gravity, don't trigger other handlers
        state.player.gravityDirection *= -1;
        console.log("Directly flipped gravity to:", state.player.gravityDirection);
        
        // Apply a small upward impulse in the direction of the new gravity
        state.player.vy = state.player.gravityDirection * -4;
        
        // Play sound if available
        if (window.regravitySound) {
          window.regravitySound.play();
        }
        
        // Create gravity flip particles
        particleSystem.createGravityFlip(
          state.player.x,
          state.player.y,
          state.player.w,
          state.player.gravityDirection
        );
      }
      return;
    }
    
    // FIRST_EDIT: Prevent duplicate gravity flips by returning early from mousePressed
    return;
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
    // Do not trigger general mouse click handling if in menu demo mode
    if (state.gameState === "menu" && state.menuDemoActive) {
      return; // Already handled by mousePressed
    }
    handleMouseClicked();
  }
}

/**
 * p5.js touchStarted function - handle touch input for mobile
 */
function touchStarted() {
  if (!editorMode) {
    console.log("Touch started, game state:", state.gameState);
    
    // Special handling for menu demo
    if (state.gameState === "menu" && state.menuDemoActive) {
      console.log("Touch started in menu demo");
      handleTouchStarted();
    } else {
      handleTouchStarted();
    }
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
    if (addCustomLevel(levelData)) {
      console.log("Level successfully added to the game!");
      return true;
    }
  }
  return false;
}

// Helper function to get cached image
window.getAsset = function(path) {
  if (window.assetCache[path]) {
    return window.assetCache[path];
  }
  console.warn(`Asset not found in cache: ${path}`);
  
  // Determine appropriate default based on filename
  const filename = path.toLowerCase();
  if (filename.includes('wall') || filename.includes('tiles')) {
    return window.defaultWallImage;
  } else if (filename.includes('background')) {
    return window.defaultBackgroundImage;
  } else if (filename.includes('spike') || filename.includes('thorn')) {
    return window.defaultSpikeImage;
  } else if (filename.includes('slippery')) {
    return window.defaultSlipperyPlayerImage;
  } else if (filename.includes('ice')) {
    return window.defaultInIcePlayerImage;
  } else if (filename.includes('platform') && (filename.includes('6') || filename.includes('up'))) {
    return null;
  } else if (filename.includes('platform') && (filename.includes('7') || filename.includes('left'))) {
    return null;
  }
  
  // Default fallback
  return window.defaultWallImage;
};

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
