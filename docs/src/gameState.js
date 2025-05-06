/**
 * Game State Management
 * Contains core game state variables and state transition functions
 */
import { particleSystem } from './particles.js';
import { setupLevels } from './levels.js';
import { loadLevel, startGeneratedMode } from './levelManager.js';
import { tileSize, updatePhysicsForDifficulty } from './config.js';
import { camera } from './camera.js';
import { Player } from './entities/player.js';

// Create a single mutable state object
export const state = {
  // Game state variables
  levelIndex: 0, // which level the player is on
  levels: [], // we store level data here
  player: null, // reference to the player
  coins: [], // coin objects
  enemies: [], // store enemies
  exitGate: null, // exit object
  tileMap: null, // holds the current level data
  cameraOffsetX: 0, // for scrolling horizontally
  score: 0, // player's score
  backgroundColor: null, // for background gradient
  gameState: "menu", // can be "menu", "difficulty", "play", "win", "over", or "editor"
  lives: 3, // number of lives
  exitTriggered: false, // Flag to ensure exit logic triggers only once per level

  // Menu demo mode
  menuDemoActive: false, // whether the menu demo is active
  difficultySelectors: [], // difficulty selector entities in the demo
  menuDemoMap: null, // the map data for the menu demo
  
  // Fixed timestep physics variables
  physicsClock: 0, // Tracks physics simulation time
  DEFAULT_DELTA_TIME: 1/60, // Default delta time if not provided

  // Hitstop and invincibility variables
  hitstopActive: false, // whether hitstop is active
  hitstopDuration: 15, // frames of hitstop when hit
  hitstopFramesLeft: 0, // how many frames of hitstop are left
  invincibilityActive: false, // whether player is invincible
  invincibilityDuration: 90, // frames of invincibility after getting hit
  invincibilityFramesLeft: 0, // how many frames of invincibility are left
  hitScreenShakeAmount: 8, // amount of screen shake when hit
  screenShakeX: 0, // current screen shake X offset
  screenShakeY: 0, // current screen shake Y offset
  
  // Enhanced screen shake variables
  screenShakeDecay: 0.85, // how quickly screen shake decays
  screenShakeTrauma: 0, // current trauma level (0-1)
  screenShakeNoiseOffsetX: 0, // noise offset for X shake
  screenShakeNoiseOffsetY: 100, // noise offset for Y shake
  screenShakeNoiseOffsetAngle: 200, // noise offset for rotation shake
  screenShakeRotation: 0, // current rotation shake amount

  // Player state variables
  playerSpawnX: 0, // where the player starts (X)
  playerSpawnY: 0, // where the player starts (Y)
  bullets: [], // bullets
  backgroundImage: null, // different level background
  difficulty: "normal", // can be "easy" or "hard"
  enemySpeed: 1.5, // base enemy speed - will be modified by difficulty
  coinValue: 10, // base coin value - will be modified by difficulty
  gameStartTime: 0, // game start time
  currentPlayTime: 0, // current game time (seconds)
  floatingPlatforms: [], // dynamic floating platform objects
  generatedMode: false, // whether we're in generated mode
  generatedLevels: [], // store generated levels
  generatedLevelCount: 0, // how many levels completed in generated mode
  totalCoinsCollected: 0, // total coins collected in generated mode
  selectedLives: 5, // default number of lives for generated mode
  statsDisplayActive: false, // whether the stats display is active
  seedValue: "", // Empty string means random seed
  seedInput: false // Flag to indicate if we're editing the seed
};

/**
 * Export game state to window for access in other modules
 */
export function updateWindowGameState() {
  window.invincibilityActive = state.invincibilityActive;
  window.hitstopActive = state.hitstopActive;
  window.frameCount = window.frameCount || 0; // Ensure frameCount exists
  window.physicsClock = state.physicsClock; // Expose physics clock to window
  window.floatingPlatforms = state.floatingPlatforms;
  window.bullets = state.bullets;
  window.player = state.player;
  window.exitTriggered = state.exitTriggered; // Expose exit trigger state
  window.menuDemoActive = state.menuDemoActive; // Expose menu demo state
  window.difficultySelectors = state.difficultySelectors; // Expose difficulty selectors
}

/**
 * Initialize the game
 */
export function initGame() {
  state.levels = setupLevels();
  
  // Start in menu mode instead of play
  state.gameState = "menu";
  
  // Set default difficulty
  state.difficulty = "normal";
  
  // Reset score
  state.score = 0;
  
  // Initialize menu demo
  initMenuDemo();
}

/**
 * Initialize the menu demo level
 */
export function initMenuDemo() {
  state.menuDemoActive = true;
  // Reset stats and ensure clean menu demo state
  state.statsDisplayActive = false;
  // Reset physics clock for demo animations
  state.physicsClock = 0;
  // Reset gameplay effects state
  state.hitstopActive = false;
  state.hitstopFramesLeft = 0;
  state.invincibilityActive = false;
  state.invincibilityFramesLeft = 0;
  state.screenShakeTrauma = 0;
  state.screenShakeX = 0;
  state.screenShakeY = 0;
  state.screenShakeRotation = 0;
  state.screenShakeNoiseOffsetX = 0;
  state.screenShakeNoiseOffsetY = 0;
  state.screenShakeNoiseOffsetAngle = 0;
  state.exitTriggered = false;

  // Create a smaller demo level map that fits better on screen
  state.menuDemoMap = [
    "1111111111111111111111111111",
    "1..........................1",
    "1..........................1",
    "1..........................1",
    "1.............3............1",
    "1..........................1",
    "1..........................1",
    "1...e.....n.....h.....r....1",
    "1111111111111111111111111111"
  ];

  // Create a new player for menu demo, resetting previous player state
  state.player = new Player(14 * tileSize, 4 * tileSize);
  state.player.gravityDirection = -1;
  state.player.vx = 0;
  state.player.vy = 0;

  window.player = state.player;
  console.log("Menu demo player initialized at:", state.player.x, state.player.y);

  // Create difficulty selector entities
  createDifficultySelectors();

  // Set up camera for the demo level
  const menuDemoWidth = state.menuDemoMap[0].length * tileSize;
  const menuDemoHeight = state.menuDemoMap.length * tileSize;

  camera.init(menuDemoWidth, menuDemoHeight);
  camera.setZoom(1.0);

  // Center camera on the demo level
  camera.x = menuDemoWidth / 2;
  camera.y = menuDemoHeight / 2;
  camera.targetX = camera.x;
  camera.targetY = camera.y;

  // Always use first level assets for menu demo ground tiles
  if (state.levels && state.levels.length > 0 && state.levels[0].assets) {
    const assets = state.levels[0].assets;
    window.currentWallImage = window.getAsset(assets.wall);
    window.currentSpikeImage = window.getAsset(assets.spike);
  }

  // Set the current tile map to the menu demo map
  state.tileMap = state.menuDemoMap;
  // Propagate state to window after demo initialization
  updateWindowGameState();
}

/**
 * Create difficulty selector entities for the menu demo
 */
export function createDifficultySelectors() {
  state.difficultySelectors = [];
  
  try {
    // Direct implementation for simplicity
    const selectorWidth = tileSize * 2.5;
    const selectorHeight = tileSize * 1.5;
    
    console.log("Creating difficulty selectors at y position:", 7 * tileSize);
    
    // Create easy selector
    state.difficultySelectors.push({
      x: 5 * tileSize, 
      y: 7 * tileSize,
      width: selectorWidth,
      height: selectorHeight,
      difficulty: "easy",
      color: color(100, 255, 100),
      hover: false,
      draw: function(cameraOffsetX) {
        // Draw selector
        push();
        
        fill(100, 255, 100, 200);
        stroke(255);
        strokeWeight(2);
        rect(this.x - this.width/2, this.y - this.height/2, this.width, this.height, 8);
        
        fill(0);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(tileSize * 0.7);
        text("EASY", this.x, this.y);
        
        pop();
      },
      checkCollision: function(player) {
        if (!player) return false;
        
        // Check collision
        const collision = 
          player.x + player.w/2 > this.x - this.width/2 &&
          player.x - player.w/2 < this.x + this.width/2 &&
          player.y + player.h/2 > this.y - this.height/2 &&
          player.y - player.h/2 < this.y + this.height/2;
        
        if (collision) {
          console.log("Collision with EASY detected");
          selectDifficulty("easy");
          return true;
        }
        return false;
      }
    });
    
    // Normal selector
    state.difficultySelectors.push({
      x: 12 * tileSize, 
      y: 7 * tileSize,
      width: selectorWidth,
      height: selectorHeight,
      difficulty: "normal",
      color: color(100, 200, 255),
      hover: false,
      draw: function(cameraOffsetX) {
        push();
        fill(100, 200, 255, 200);
        stroke(255);
        strokeWeight(2);
        rect(this.x - this.width/2, this.y - this.height/2, this.width, this.height, 8);
        
        fill(0);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(tileSize * 0.7);
        text("NORMAL", this.x, this.y);
        pop();
      },
      checkCollision: function(player) {
        if (!player) return false;
        const collision = 
          player.x + player.w/2 > this.x - this.width/2 &&
          player.x - player.w/2 < this.x + this.width/2 &&
          player.y + player.h/2 > this.y - this.height/2 &&
          player.y - player.h/2 < this.y + this.height/2;
        
        if (collision) {
          console.log("Collision with NORMAL detected");
          selectDifficulty("normal");
          return true;
        }
        return false;
      }
    });
    
    // Hard selector
    state.difficultySelectors.push({
      x: 19 * tileSize, 
      y: 7 * tileSize,
      width: selectorWidth,
      height: selectorHeight,
      difficulty: "hard",
      color: color(255, 100, 100),
      hover: false,
      draw: function(cameraOffsetX) {
        push();
        fill(255, 100, 100, 200);
        stroke(255);
        strokeWeight(2);
        rect(this.x - this.width/2, this.y - this.height/2, this.width, this.height, 8);
        
        fill(0);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(tileSize * 0.7);
        text("HARD", this.x, this.y);
        pop();
      },
      checkCollision: function(player) {
        if (!player) return false;
        const collision = 
          player.x + player.w/2 > this.x - this.width/2 &&
          player.x - player.w/2 < this.x + this.width/2 &&
          player.y + player.h/2 > this.y - this.height/2 &&
          player.y - player.h/2 < this.y + this.height/2;
        
        if (collision) {
          console.log("Collision with HARD detected");
          selectDifficulty("hard");
          return true;
        }
        return false;
      }
    });
    
    // Random selector
    state.difficultySelectors.push({
      x: 24 * tileSize, 
      y: 7 * tileSize,
      width: selectorWidth,
      height: selectorHeight,
      difficulty: "random",
      color: color(255, 180, 80),
      hover: false,
      draw: function(cameraOffsetX) {
        push();
        fill(255, 180, 80, 200);
        stroke(255);
        strokeWeight(2);
        rect(this.x - this.width/2, this.y - this.height/2, this.width, this.height, 8);
        
        fill(0);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(tileSize * 0.7);
        text("RANDOM", this.x, this.y);
        pop();
      },
      checkCollision: function(player) {
        if (!player) return false;
        const collision = 
          player.x + player.w/2 > this.x - this.width/2 &&
          player.x - player.w/2 < this.x + this.width/2 &&
          player.y + player.h/2 > this.y - this.height/2 &&
          player.y - player.h/2 < this.y + this.height/2;
        
        if (collision) {
          console.log("Collision with RANDOM detected");
          selectDifficulty("random");
          return true;
        }
        return false;
      }
    });
    
    console.log(`Created ${state.difficultySelectors.length} difficulty selectors`);
  } catch (error) {
    console.error("Error creating difficulty selectors:", error);
  }
}

/**
 * Select difficulty from the menu demo
 * @param {string} difficulty - Difficulty level to set
 */
export function selectDifficulty(difficulty) {
  // Close the menu demo
  state.menuDemoActive = false;
  
  // Set difficulty string state
  state.difficulty = difficulty;
  
  if (difficulty === "random") {
    state.generatedMode = true;
    // Parameters like lives, enemySpeed, and physics are set in updateGameParametersForDifficulty
    // and startGeneratedMode will handle level generation.
  } else {
    state.generatedMode = false;
  }
  
  // Set game parameters based on difficulty
  updateGameParametersForDifficulty(difficulty);
  
  // Initialize game time
  state.gameStartTime = millis();
  state.currentPlayTime = 0;
  
  if (difficulty === "random") {
    // Start generated mode, passing true to indicate it's from the demo selector
    startGeneratedMode(true); 
  } else {
    // Start the game with the first level for non-random difficulties
    loadLevel(0);
    // Change game state to play
    state.gameState = "play";
  }
}

/**
 * Update game parameters based on selected difficulty
 * @param {string} difficulty - Selected difficulty level
 */
function updateGameParametersForDifficulty(difficulty) {
  // Add a colorful burst based on difficulty
  let difficultyColor;
  let physicsDifficulty = difficulty; // Determines which physics settings to apply

  if (difficulty === "easy") {
    difficultyColor = color(100, 255, 100);
  } else if (difficulty === "hard") {
    difficultyColor = color(255, 100, 100);
  } else if (difficulty === "random") {
    difficultyColor = color(255, 180, 80); // Orange for random
    physicsDifficulty = "easy"; // Random mode uses easy physics
  } else { // Normal difficulty
    difficultyColor = color(100, 200, 255);
  }
  
  // Create burst across the entire screen
  for (let i = 0; i < 10; i++) {
    particleSystem.createBurst(
      random(width),
      random(height),
      15,
      {
        color: difficultyColor,
        life: random(30, 60),
        size: random(4, 10),
        speed: random(1, 3),
        gravity: 0,
        drag: 0.95
      }
    );
  }
  
  // Update game parameters based on difficulty
  if (difficulty === "easy") {
    state.lives = 5; // More lives on easy
    state.coinValue = 15; // More points per coin
    state.enemySpeed = 1.0; // Slower enemies
  } else if (difficulty === "hard") {
    state.lives = 2; // Fewer lives on hard
    state.coinValue = 5; // Fewer points per coin
    state.enemySpeed = 2.0; // Faster enemies
  } else if (difficulty === "random") {
    state.lives = 10; // Random mode has 10 lives
    state.coinValue = 10; // Standard coin value
    state.enemySpeed = 1.0; // Easy enemy speed
  } else {
    // Normal difficulty
    state.lives = 3;
    state.coinValue = 10;
    state.enemySpeed = 1.5;
  }
  
  // Update physics parameters for the new difficulty
  updatePhysicsForDifficulty(physicsDifficulty);
}

/**
 * Set the game difficulty
 */
export function setDifficulty(difficultyLevel) {
  selectDifficulty(difficultyLevel);
}

/**
 * Lose a life and either reset the level or end the game.
 */
export function loseLife() {
  // If player is invincible, don't take damage
  if (state.invincibilityActive) {
    return;
  }
  
  state.lives--;
  window.deathSound.play();
  
  // Create death particle effect at player position
  particleSystem.createDeath(state.player.x, state.player.y);
  
  if (state.lives <= 0) {
    // Game over
    state.gameState = "over";
  } else {
    // Trigger hitstop effect
    state.hitstopActive = true;
    state.hitstopFramesLeft = state.hitstopDuration;
    
    // Apply enhanced screen shake - set trauma to max
    state.screenShakeTrauma = 1.0;
    
    // Also use the camera's trauma system directly if available
    camera.addTrauma(1.0); // Maximum trauma
    
    // Start invincibility period
    state.invincibilityActive = true;
    state.invincibilityFramesLeft = state.invincibilityDuration;
  }
  //Detection of bullet collisions for life loss
  window.loseLife = loseLife;
}

// Function to handle the end of hitstop
export function endHitstop() {
  state.hitstopActive = false;
  
  // Only reset player position if outside map boundaries
  const mapWidth = state.tileMap[0].length * tileSize;
  const mapHeight = state.tileMap.length * tileSize;
  
  const isOutsideMap = 
    state.player.x < 0 || 
    state.player.x > mapWidth || 
    state.player.y < -200 || // Allow some space above for flipped gravity
    state.player.y > mapHeight + 200; // Allow some space below
  
  if (isOutsideMap) {
    // Reset player position
    state.player.x = state.playerSpawnX;
    state.player.y = state.playerSpawnY;
    state.player.vx = 0;
    state.player.vy = 0;
    state.player.gravityDirection = 1; // Reset gravity to normal.
  } else {
    // Just reduce velocity to give player a chance to recover
    state.player.vx *= 0.5;
    state.player.vy *= 0.5;
  }
}

/**
 * Add a custom level created in the editor to the game
 * @param {Object} levelData - The level data from the editor
 * @return {boolean} - True if level was added successfully
 */
export function addCustomLevel(levelData) {
  if (!levelData || !levelData.map || levelData.map.length === 0) {
    console.error("Invalid level data");
    return false;
  }
  
  // Add the level to the levels array
  state.levels.push(levelData);
  
  console.log(`Custom level added! Total levels: ${state.levels.length}`);
  return true;
}

// Trigger gravity flip delay
export function triggerGravityFlipDelay() {
  // Don't trigger if already in damage hitstop
  if (state.hitstopActive) return;
  
  // Instead of using a global delay, set the player's freeze timer directly
  // This way only the player pauses while the rest of the world continues
  if (window.player) {
    const gravityFlipFreezeFrames = 10; // Short duration in frames
    window.player.freezeTimer = gravityFlipFreezeFrames;
    window.player.isFrozen = true;
  }
}

/**
 * Setter functions for modifying game state
 */
export function setGameState(newGameState) {
  state.gameState = newGameState;
}

export function setSeedInput(value) {
  state.seedInput = value;
}

export function setSeedValue(value) {
  state.seedValue = value;
}

export function setSelectedLives(value) {
  state.selectedLives = value;
}

export function setGeneratedMode(value) {
  state.generatedMode = value;
}

export function setStatsDisplayActive(value) {
  state.statsDisplayActive = value;
}

export function setExitTriggered(value) {
  state.exitTriggered = value;
}

/**
 * Screen shake and effect setters
 */
export function setScreenShakeTrauma(value) {
  state.screenShakeTrauma = value;
}

export function setScreenShakeX(value) {
  state.screenShakeX = value;
}

export function setScreenShakeY(value) {
  state.screenShakeY = value;
}

export function setScreenShakeRotation(value) {
  state.screenShakeRotation = value;
}

export function setScreenShakeNoiseOffsetX(value) {
  state.screenShakeNoiseOffsetX = value;
}

export function setScreenShakeNoiseOffsetY(value) {
  state.screenShakeNoiseOffsetY = value;
}

export function setScreenShakeNoiseOffsetAngle(value) {
  state.screenShakeNoiseOffsetAngle = value;
}

export function setHitstopActive(value) {
  state.hitstopActive = value;
}

export function setHitstopFramesLeft(value) {
  state.hitstopFramesLeft = value;
}

export function setInvincibilityActive(value) {
  state.invincibilityActive = value;
}

export function setInvincibilityFramesLeft(value) {
  state.invincibilityFramesLeft = value;
} 