/**
 * Level Manager Module
 * Handles level loading, reloading, and level progression logic
 */
import { tileSize } from './config.js';
import { Player } from './entities/player.js';
import { Enemy, ShooterEnemy } from './entities/enemy.js';
import { Coin } from './entities/coin.js';
import { ExitGate } from './entities/exitGate.js';
import { FloatingPlatform } from './entities/floatingPlatform.js';
import { particleSystem } from './particles.js';
import { generateLevels, generateMap, setMapSeed } from './mapGenerator.js';
import * as gameState from './gameState.js';
import { camera } from './camera.js';
import { setupLevels } from './levels.js';
import { createDifficultySelectors } from './gameState.js';
import { updatePhysicsForDifficulty } from './config.js';

/**
 * Load a level by index
 */
export function loadLevel(idx) {
  // Reset exit trigger when loading a new level
  gameState.state.exitTriggered = false;

  if (idx < 0 || idx >= gameState.state.levels.length) return;
  const currentLevel = gameState.state.levels[idx];

  // Only built-in last level is hidden; skip if custom level has no assets
  if (currentLevel.assets && idx === gameState.state.levels.length - 1 && gameState.state.score < 100) {
    console.log("Hidden level unlock failed: score less than 100, current score:", gameState.state.score);
    gameState.state.gameState = "win";
    return;
  }

  // Use preloaded wall image from cache
  if (currentLevel.assets && currentLevel.assets.wall) {
    window.currentWallImage = window.getAsset(currentLevel.assets.wall);
  } else {
    window.currentWallImage = null;
  }

  // Use preloaded exit gate image from cache
if (currentLevel.assets && currentLevel.assets.gate) {
  window.exitGateImage = window.getAsset(currentLevel.assets.gate);
} else {
  window.exitGateImage = null;
}

  // Use preloaded background image from cache
  if (currentLevel.assets && currentLevel.assets.background) {
    gameState.state.backgroundImage = window.getAsset(currentLevel.assets.background);
  } else {
    gameState.state.backgroundImage = null;
  }

  // Use preloaded spike assets from cache
  if (currentLevel.assets && currentLevel.assets.spike) {
    window.currentSpikeImage = window.getAsset(currentLevel.assets.spike);
  } else {
    window.currentSpikeImage = null;
  }
  
  // Use preloaded slippery wall assets from cache
  if (currentLevel.assets && currentLevel.assets.slipperyPlayer) {
    window.slipperyPlayerImage = window.getAsset(currentLevel.assets.slipperyPlayer);
  } else {
    window.slipperyPlayerImage = null;
  }

  // Use preloaded ice player assets from cache
  if (currentLevel.assets && currentLevel.assets.inIcePlayer) {
    window.inIcePlayerImage = window.getAsset(currentLevel.assets.inIcePlayer);
  } else {
    window.inIcePlayerImage = null;
  }

  // Use preloaded up-down moving platform image from cache
  if (currentLevel.assets && currentLevel.assets.platformUpDown) {
    window.platformUpDownImage = window.getAsset(currentLevel.assets.platformUpDown);
  } else {
    window.platformUpDownImage = null;
  }

  // Use preloaded left-right moving platform image from cache
  if (currentLevel.assets && currentLevel.assets.platformleftright) {
    window.platformleftrightImage = window.getAsset(currentLevel.assets.platformleftright);
  } else {
    window.platformleftrightImage = null;
  }

  // Clear particles when loading a new level
  particleSystem.clear();

  // Clear old floating platforms
  gameState.state.floatingPlatforms = [];

  gameState.state.tileMap = gameState.state.levels[idx].map.slice();
  gameState.state.coins = [];
  gameState.state.enemies = [];
  gameState.state.bullets = []; 
  window.bullets = gameState.state.bullets;
  gameState.state.exitGate = null;
  
  let foundPlayer = false;
  
  // Calculate map dimensions for camera setup
  const mapWidth = Math.max(...gameState.state.tileMap.map(row => row.length)) * tileSize;
  const mapHeight = gameState.state.tileMap.length * tileSize;
  
  // Initialize camera with map dimensions
  camera.init(mapWidth, mapHeight);
  
  // Process each character in the map for player, coins, exit gates and enemies
  for (let row = 0; row < gameState.state.tileMap.length; row++) {
    for (let col = 0; col < gameState.state.tileMap[row].length; col++) {
      let tile = gameState.state.tileMap[row].charAt(col);
      let x = col * tileSize + tileSize / 2;
      let y = row * tileSize + tileSize / 2;
      
      if (tile === "3") {
        // Player spawn point
        foundPlayer = true;
        gameState.state.playerSpawnX = x;
        gameState.state.playerSpawnY = y;
        gameState.state.player = new Player(x, y);
        
        // Adjust player speed based on difficulty
        if (gameState.state.difficulty === "hard") {
          gameState.state.player.autoSpeed *= 1.5; // 50% faster on hard
        } else if (gameState.state.difficulty === "easy") {
          gameState.state.player.autoSpeed *= 0.5; // 50% slower on easy
        }
        
        window.player = gameState.state.player;
        console.log("Found player spawn point:", x, y);
        
        // Initialize camera to follow player
        camera.follow(gameState.state.player, gameState.state.player.autoDirection, 0);
        camera.update(1/60); // Initial update to center camera
        
        // Replace with empty space
        gameState.state.tileMap[row] = gameState.state.tileMap[row].substring(0, col) + "." + gameState.state.tileMap[row].substring(col + 1);
        
        // Create spawn particle effect
        particleSystem.createBurst(x, y, 20, {
          color: color(150, 200, 255),
          life: random(30, 60),
          size: random(4, 10),
          speed: random(1, 3),
          gravity: 0.03
        });
      } else if (tile === "2") {
        // Coin
        gameState.state.coins.push(new Coin(x, y));
        console.log("Added coin at:", x, y);
        gameState.state.tileMap[row] = gameState.state.tileMap[row].substring(0, col) + "." + gameState.state.tileMap[row].substring(col + 1);
      } else if (tile === "4") {
        // Exit gate
        gameState.state.exitGate = new ExitGate(x, y);
        console.log("Added exit gate at:", x, y);
        gameState.state.tileMap[row] = gameState.state.tileMap[row].substring(0, col) + "." + gameState.state.tileMap[row].substring(col + 1);
        
        // Create a subtle portal effect around the exit gate
        particleSystem.createBurst(x, y, 15, {
          color: color(0, 255, 150, 150),
          life: random(60, 120),
          size: random(3, 8),
          speed: random(0.5, 1.5),
          gravity: 0,
          drag: 0.99
        });
      } else if (tile === "e") {
        // Add normal enemy
        const enemy = new Enemy(x, y);
        // Adjust enemy attributes based on difficulty
        if (gameState.state.difficulty === "hard") {
          enemy.speed = gameState.state.enemySpeed * 1.5;
          enemy.range = enemy.range * 1.3;
        } else if (gameState.state.difficulty === "easy") {
          enemy.speed = gameState.state.enemySpeed * 0.7;
        }
        gameState.state.enemies.push(enemy);
        console.log("Added normal Enemy at:", x, y);
        gameState.state.tileMap[row] = gameState.state.tileMap[row].substring(0, col) + "." + gameState.state.tileMap[row].substring(col + 1);
      } else if (tile === "E") {
        // Add shooter enemy
        gameState.state.enemies.push(new ShooterEnemy(x, y));
        console.log("Added ShooterEnemy at:", x, y);
        gameState.state.tileMap[row] = gameState.state.tileMap[row].substring(0, col) + "." + gameState.state.tileMap[row].substring(col + 1);
      } else if (tile === "6" || tile === "7") {
        // Dynamic floating platform
        // 6: up-down moving platform, 7: left-right moving platform
        gameState.state.floatingPlatforms.push(new FloatingPlatform(x, y, tile));
        gameState.state.tileMap[row] = gameState.state.tileMap[row].substring(0, col) + "." + gameState.state.tileMap[row].substring(col + 1);
      }
    }
  }
  
  // If player start point not found, use default values
  if (!foundPlayer) {
    gameState.state.playerSpawnX = tileSize * 2;
    gameState.state.playerSpawnY = tileSize * 2;
    console.log("No player start point found, using default:", gameState.state.playerSpawnX, gameState.state.playerSpawnY);
    gameState.state.player = new Player(gameState.state.playerSpawnX, gameState.state.playerSpawnY);
    window.player = gameState.state.player;
    
    // Initialize camera to follow player
    camera.follow(gameState.state.player, gameState.state.player.autoDirection, 0);
    camera.update(1/60); // Initial update to center camera
  }
  
  // If exit gate not found, use default exit position
  if (!gameState.state.exitGate) {
    gameState.state.exitGate = new ExitGate(tileSize * 8, tileSize * 2);
    console.log("No exit gate found, using default:", tileSize * 8, tileSize * 2);
  }
  
  // Update level index
  if (!gameState.state.generatedMode) {
    gameState.state.levelIndex = idx;
  }
  
  console.log("Loaded level:", idx);
  window.levelLoadTime = millis();
  window.floatingPlatforms = gameState.state.floatingPlatforms;

  if (idx === 0) {
    gameState.state.tutorialText =  "Click mouse or press spacebar to reverse gravity!\nEach coin = 15 points (optional, not required to win)";
    gameState.state.tutorialActive = true;
  } else if (idx === 1) {
    gameState.state.tutorialText = "Watch out for spikes ahead!\n Touching them will immediately cost you a life.";
    gameState.state.tutorialActive = true;
  } else if (idx === 2) {
    gameState.state.tutorialText = "Enemies patrol left and right, touching them will hurt you too!\n Try to avoid them.";
    gameState.state.tutorialActive = true;
  } else if (idx === 3) {
    gameState.state.tutorialText = "Warning!\n This type of enemy shoots bullets,\n dodge them or quickly leave their range!";
    gameState.state.tutorialActive = true;
  } else {
    gameState.state.tutorialText = "";
    gameState.state.tutorialActive = false;
  }
  
}

/**
 * Reload the current level while preserving game state
 * Used when the window is resized
 */
export function reloadCurrentLevel(oldTileSize) {
  if (gameState.state.levels.length === 0) {
    gameState.state.levels = setupLevels();
  }
  
  // Store current state
  const currentLevel = gameState.state.levelIndex;
  const currentScore = gameState.state.score;
  const currentLives = gameState.state.lives;
  const currentGameState = gameState.state.gameState;
  const currentDifficulty = gameState.state.difficulty;
  const currentMenuDemoActive = gameState.state.menuDemoActive;
  
  // Convert player's position using the old tile size
  let playerTileX = 0;
  let playerTileY = 0;
  let playerVelocity = { vx: 0, vy: 0 };
  let playerGravityDirection = 1;
  let playerDirection = 1;
  
  if (gameState.state.player) {
    playerTileX = gameState.state.player.x / oldTileSize;
    playerTileY = gameState.state.player.y / oldTileSize;
    playerVelocity = { vx: gameState.state.player.vx, vy: gameState.state.player.vy };
    playerGravityDirection = gameState.state.player.gravityDirection;
    playerDirection = gameState.state.player.autoDirection;
  }
  
  // Save coins' state in relative (tile) coordinates
  const coinStates = gameState.state.coins.map(coin => ({
    tileX: coin.x / oldTileSize,
    tileY: coin.y / oldTileSize,
    collected: coin.collected
  }));
  
  // Save enemies' state in relative (tile) coordinates
  const enemyStates = gameState.state.enemies.map(enemy => ({
    tileX: enemy.x / oldTileSize,
    tileY: enemy.y / oldTileSize,
    direction: enemy.direction,
    tileMinX: enemy.minX / oldTileSize,
    tileMaxX: enemy.maxX / oldTileSize
  }));

  // Save camera zoom/state
  const currentZoom = camera.zoom;
  const cameraDirections = {
    horizontal: camera.playerDirection,
    vertical: camera.playerVerticalDirection
  };

  // Load the current level (this will reset everything)
  loadLevel(currentLevel);
  
  // Restore game state
  gameState.state.score = currentScore;
  gameState.state.lives = currentLives;
  gameState.state.gameState = currentGameState;
  gameState.state.difficulty = currentDifficulty;
  gameState.state.menuDemoActive = currentMenuDemoActive;
  
  // Restore player state with updated tile size
  if (gameState.state.player) {
    gameState.state.player.x = playerTileX * tileSize;
    gameState.state.player.y = playerTileY * tileSize;
    gameState.state.player.vx = playerVelocity.vx * (tileSize / oldTileSize);
    gameState.state.player.vy = playerVelocity.vy * (tileSize / oldTileSize);
    gameState.state.player.gravityDirection = playerGravityDirection;
    gameState.state.player.autoDirection = playerDirection;
    
    // Update camera with restored player position
    camera.follow(gameState.state.player, playerDirection, playerGravityDirection);
    camera.setZoom(currentZoom); // Restore zoom level
    camera.update(1/60);
  }
  
  // Restore coins
  gameState.state.coins.forEach((coin, idx) => {
    if (idx < coinStates.length) {
      coin.x = coinStates[idx].tileX * tileSize;
      coin.y = coinStates[idx].tileY * tileSize;
      coin.collected = coinStates[idx].collected;
    }
  });
  
  // Restore enemies
  gameState.state.enemies.forEach((enemy, idx) => {
    if (idx < enemyStates.length) {
      enemy.x = enemyStates[idx].tileX * tileSize;
      enemy.y = enemyStates[idx].tileY * tileSize;
      enemy.direction = enemyStates[idx].direction;
      enemy.minX = enemyStates[idx].tileMinX * tileSize;
      enemy.maxX = enemyStates[idx].tileMaxX * tileSize;
    }
  });
  
  // If we were in menu demo mode, recreate the selectors with the new tile size
  if (gameState.state.menuDemoActive) {
    createDifficultySelectors(); // Recreate selectors using the new tileSize
    // Ensure the map is set back to the demo map
    gameState.state.tileMap = gameState.state.menuDemoMap;
  }
  
  console.log("Reloaded current level with new tile size:", tileSize);
}

/**
 * Start the generated mode with procedurally created levels
 * @param {boolean} isFromDemoSelector - True if called from the menu demo's RANDOM selector
 */
export function startGeneratedMode(isFromDemoSelector = false) {
  gameState.state.generatedMode = true;
  // Seed RNG: demo selector uses current time; legacy seed input otherwise
  if (isFromDemoSelector) {
    const newSeed = Date.now();
    setMapSeed(newSeed);
    // Use RNG seeded by time for levels
    gameState.state.generatedLevels = generateLevels(20);
  } else {
    // Legacy seed-based generation
    setMapSeed(gameState.state.seedValue);
    gameState.state.generatedLevels = generateLevels(20, gameState.state.seedValue);
  }
  gameState.state.generatedLevelCount = 0;
  gameState.state.totalCoinsCollected = 0;
  gameState.state.score = 0;

  if (isFromDemoSelector) {
    // When called from the demo selector, lives are 10 (already set by updateGameParametersForDifficulty)
    // gameState.state.difficulty is already "random"
    // Physics are set to "easy" by updateGameParametersForDifficulty
  } else {
    // When called from the main menu lives/seed selection flow
    gameState.state.lives = gameState.state.selectedLives;
    // Set difficulty to "random" for HUD and consistency if not already set
    if (gameState.state.difficulty !== "random") {
        gameState.state.difficulty = "random"; // Or perhaps "easy" if random is just a mode
    }
  }
  
  // Always apply easy physics for generated mode, regardless of how it was initiated.
  // updateGameParametersForDifficulty in gameState.js also does this if difficulty is "random".
  // Calling it here ensures it if startGeneratedMode is called from somewhere else in the future.
  updatePhysicsForDifficulty("easy");
  
  // Initialize game time
  gameState.state.gameStartTime = millis();
  gameState.state.currentPlayTime = 0;
  
  // Initialize floating platforms array
  gameState.state.floatingPlatforms = [];
  window.floatingPlatforms = gameState.state.floatingPlatforms;
  
  // Load the first generated level
  loadGeneratedLevel(0);
  
  // Change game state to play
  gameState.state.gameState = "play";
}

/**
 * Load a generated level by index
 */
export function loadGeneratedLevel(idx) {
  // Reset exit trigger when loading a new generated level
  gameState.state.exitTriggered = false;
  if (idx < 0) return;
  // Generate new level on demand for infinite mode
  if (idx >= gameState.state.generatedLevels.length) {
    const difficulty = 1 + idx * 0.5;
    const width = Math.min(40, 25 + Math.floor(idx / 2) * 5);
    const height = Math.min(20, 12 + Math.floor(idx / 3) * 2);
    const newLevel = generateMap(width, height, difficulty);
    gameState.state.generatedLevels.push(newLevel);
  }
  
  const currentLevel = gameState.state.generatedLevels[idx];
  gameState.state.levelIndex = idx;
  
  // Use preloaded wall image from cache
  if (currentLevel.assets && currentLevel.assets.wall) {
    window.currentWallImage = window.getAsset(currentLevel.assets.wall);
  } else {
    window.currentWallImage = window.defaultWallImage;
  }

  // Use preloaded background image from cache
  if (currentLevel.assets && currentLevel.assets.background) {
    gameState.state.backgroundImage = window.getAsset(currentLevel.assets.background);
  } else {
    gameState.state.backgroundImage = window.defaultBackgroundImage;
  }

  // Use preloaded spike image from cache
  if (currentLevel.assets && currentLevel.assets.spike) {
    window.currentSpikeImage = window.getAsset(currentLevel.assets.spike);
  } else {
    window.currentSpikeImage = window.defaultSpikeImage;
  }
  
  // Use preloaded slippery player assets from cache
  if (currentLevel.assets && currentLevel.assets.slipperyPlayer) {
    window.slipperyPlayerImage = window.getAsset(currentLevel.assets.slipperyPlayer);
  } else {
    window.slipperyPlayerImage = window.defaultSlipperyPlayerImage;
  }
  
  // Use preloaded ice player assets from cache
  if (currentLevel.assets && currentLevel.assets.inIcePlayer) {
    window.inIcePlayerImage = window.getAsset(currentLevel.assets.inIcePlayer);
  } else {
    window.inIcePlayerImage = window.defaultInIcePlayerImage;
  }
  
  // Use preloaded up-down platform from cache
  if (currentLevel.assets && currentLevel.assets.platformUpDown) {
    window.platformUpDownImage = window.getAsset(currentLevel.assets.platformUpDown);
  } else {
    window.platformUpDownImage = null;
  }
  
  // Use preloaded left-right platform from cache
  if (currentLevel.assets && currentLevel.assets.platformleftright) {
    window.platformleftrightImage = window.getAsset(currentLevel.assets.platformleftright);
  } else {
    window.platformleftrightImage = null;
  }
  
  // Clear particles
  particleSystem.clear();
  
  // Clear floating platforms
  gameState.state.floatingPlatforms = [];
  window.floatingPlatforms = gameState.state.floatingPlatforms;
  
  // Set tile map and initialize entities
  gameState.state.tileMap = currentLevel.map.slice();
  gameState.state.coins = [];
  gameState.state.enemies = [];
  gameState.state.bullets = [];
  window.bullets = gameState.state.bullets;
  gameState.state.exitGate = null;
  
  // Calculate map dimensions for camera setup
  const mapWidth = Math.max(...gameState.state.tileMap.map(row => row.length)) * tileSize;
  const mapHeight = gameState.state.tileMap.length * tileSize;
  
  // Initialize camera with map dimensions
  camera.init(mapWidth, mapHeight);
  
  let foundPlayer = false;
  let foundExit = false;
  
  // Process the map
  for (let row = 0; row < gameState.state.tileMap.length; row++) {
    for (let col = 0; col < gameState.state.tileMap[row].length; col++) {
      let tile = gameState.state.tileMap[row].charAt(col);
      let x = col * tileSize + tileSize / 2;
      let y = row * tileSize + tileSize / 2;
      
      if (tile === "3") {
        // Player start position
        foundPlayer = true;
        gameState.state.playerSpawnX = x;
        gameState.state.playerSpawnY = y;
        gameState.state.player = new Player(x, y);
        gameState.state.player.autoSpeed *= 0.5; // Slower speed for generated mode (easy)
        window.player = gameState.state.player;
        
        // Replace with empty space
        gameState.state.tileMap[row] = gameState.state.tileMap[row].substring(0, col) + "." + gameState.state.tileMap[row].substring(col + 1);
        
        // Create spawn effect
        particleSystem.createBurst(x, y, 20, {
          color: color(150, 200, 255),
          life: random(30, 60),
          size: random(4, 10),
          speed: random(1, 3),
          gravity: 0.03
        });
      } else if (tile === "2") {
        // Coin
        gameState.state.coins.push(new Coin(x, y));
        gameState.state.tileMap[row] = gameState.state.tileMap[row].substring(0, col) + "." + gameState.state.tileMap[row].substring(col + 1);
      } else if (tile === "4") {
        // Exit gate
        gameState.state.exitGate = new ExitGate(x, y);
        foundExit = true;
        gameState.state.tileMap[row] = gameState.state.tileMap[row].substring(0, col) + "." + gameState.state.tileMap[row].substring(col + 1);
      } else if (tile === "e") {
        // Normal enemy
        const enemy = new Enemy(x, y);
        enemy.speed = gameState.state.enemySpeed * 0.7; // Slower for generated mode (easy)
        gameState.state.enemies.push(enemy);
        gameState.state.tileMap[row] = gameState.state.tileMap[row].substring(0, col) + "." + gameState.state.tileMap[row].substring(col + 1);
      } else if (tile === "E") {
        // Shooter enemy
        const enemy = new ShooterEnemy(x, y);
        enemy.speed = gameState.state.enemySpeed * 0.7; // Slower for generated mode (easy)
        gameState.state.enemies.push(enemy);
        gameState.state.tileMap[row] = gameState.state.tileMap[row].substring(0, col) + "." + gameState.state.tileMap[row].substring(col + 1);
      } else if (tile === "6") {
        // Up-down floating platform
        gameState.state.floatingPlatforms.push(new FloatingPlatform(x, y, tileSize * 2, tileSize / 2, 0, 1));
        // Replace with empty space
        gameState.state.tileMap[row] = gameState.state.tileMap[row].substring(0, col) + "." + gameState.state.tileMap[row].substring(col + 1);
      } else if (tile === "7") {
        // Left-right floating platform
        gameState.state.floatingPlatforms.push(new FloatingPlatform(x, y, tileSize * 2, tileSize / 2, 1, 0));
        // Replace with empty space
        gameState.state.tileMap[row] = gameState.state.tileMap[row].substring(0, col) + "." + gameState.state.tileMap[row].substring(col + 1);
      }
    }
  }
  
  // Update the global floatingPlatforms reference
  window.floatingPlatforms = gameState.state.floatingPlatforms;
  
  // Center the camera
  gameState.state.cameraOffsetX = 0;
  
  // Ensure player was found - if not, create player at a safe position
  if (!foundPlayer) {
    console.error("No player start position found in generated level");
    
    // Find a safe position near the left side of the map
    let safeRow = -1;
    for (let row = 2; row < gameState.state.tileMap.length - 3; row++) {
      if (gameState.state.tileMap[row].charAt(2) === "." && gameState.state.tileMap[row + 1].charAt(2) === "1") {
        safeRow = row;
        break;
      }
    }
    
    // If no ideal position found, place at arbitrary position and add platform
    if (safeRow === -1) {
      safeRow = Math.floor(gameState.state.tileMap.length / 2);
      // Add a platform at this position
      for (let col = 2; col < 6; col++) {
        const rowString = gameState.state.tileMap[safeRow + 1];
        gameState.state.tileMap[safeRow + 1] = rowString.substring(0, col) + "1" + rowString.substring(col + 1);
      }
    }
    
    // Create player at the safe position
    gameState.state.playerSpawnX = 2 * tileSize + tileSize / 2;
    gameState.state.playerSpawnY = safeRow * tileSize + tileSize / 2;
    gameState.state.player = new Player(gameState.state.playerSpawnX, gameState.state.playerSpawnY);
    gameState.state.player.autoSpeed *= 0.5; // Slower speed for generated mode (easy)
    window.player = gameState.state.player;
    
    // Create spawn effect
    particleSystem.createBurst(gameState.state.playerSpawnX, gameState.state.playerSpawnY, 20, {
      color: color(150, 200, 255),
      life: random(30, 60),
      size: random(4, 10),
      speed: random(1, 3),
      gravity: 0.03
    });
  }
  
  // Ensure exit gate was found - if not, create one
  if (!foundExit) {
    console.error("No exit gate found in generated level");
    
    // Find a safe position near the right side of the map
    const col = gameState.state.tileMap[0].length - 3;
    let safeRow = -1;
    for (let row = 2; row < gameState.state.tileMap.length - 3; row++) {
      if (gameState.state.tileMap[row].charAt(col) === "." && gameState.state.tileMap[row + 1].charAt(col) === "1") {
        safeRow = row;
        break;
      }
    }
    
    // If no ideal position found, place at arbitrary position and add platform
    if (safeRow === -1) {
      safeRow = Math.floor(gameState.state.tileMap.length / 2);
      // Add a platform at this position
      for (let c = col - 2; c <= col + 2; c++) {
        if (c >= 0 && c < gameState.state.tileMap[0].length) {
          const rowString = gameState.state.tileMap[safeRow + 1];
          gameState.state.tileMap[safeRow + 1] = rowString.substring(0, c) + "1" + rowString.substring(c + 1);
        }
      }
    }
    
    // Create exit gate at the safe position
    const exitX = col * tileSize + tileSize / 2;
    const exitY = safeRow * tileSize + tileSize / 2;
    gameState.state.exitGate = new ExitGate(exitX, exitY);
  }
}

/**
 * Handle level completion for generated mode
 */
export function completeGeneratedLevel() {
  // Increment level count
  gameState.state.generatedLevelCount++;
  
  // Count coins collected
  for (const coin of gameState.state.coins) {
    if (coin.collected) {
      gameState.state.totalCoinsCollected++;
    }
  }
  
  // Check if this is a milestone (every 5 levels)
  if (gameState.state.generatedLevelCount % 5 === 0) {
    // Show stats screen
    gameState.state.statsDisplayActive = true;
    gameState.state.gameState = "stats";
  } else {
    // Add a slight delay before loading the next level
    setTimeout(() => {
      // Load the next level
      loadGeneratedLevel(gameState.state.levelIndex + 1);
    }, 500);
  }
} 