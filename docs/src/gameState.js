/**
 * Game State Management
 * Contains core game state variables and state transition functions
 */
import { particleSystem } from './particles.js';
import { setupLevels } from './levels.js';
import { loadLevel } from './levelManager.js';
import { tileSize } from './config.js';

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
}

/**
 * Set the game difficulty
 */
export function setDifficulty(difficultyLevel) {
  state.difficulty = difficultyLevel;
  
  // Add a colorful burst based on difficulty
  let difficultyColor;
  if (state.difficulty === "easy") {
    difficultyColor = color(100, 255, 100);
  } else if (state.difficulty === "hard") {
    difficultyColor = color(255, 100, 100);
  } else {
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
  if (state.difficulty === "easy") {
    state.lives = 99; // More lives on easy
    state.coinValue = 15; // More points per coin
    state.enemySpeed = 1.0; // Slower enemies
  } else if (state.difficulty === "hard") {
    state.lives = 2; // Fewer lives on hard
    state.coinValue = 5; // Fewer points per coin
    state.enemySpeed = 2.0; // Faster enemies
  } else {
    // Normal difficulty
    state.lives = 3;
    state.coinValue = 10;
    state.enemySpeed = 1.5;
  }
  
  // Update physics parameters for the new difficulty
  import('./config.js').then(config => {
    config.updatePhysicsForDifficulty(state.difficulty);
  });
  
  // Initialize game time
  state.gameStartTime = millis();
  state.currentPlayTime = 0;
  
  // Start the game with the first level
  loadLevel(0);
  
  // Change game state to play
  state.gameState = "play";
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