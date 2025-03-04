/**
 * Main game logic
 */
import { tileSize, numCols, numRows, hudHeight } from './config.js';
import { setupLevels } from './levels.js';
import { Player } from './entities/player.js';
import { Enemy } from './entities/enemy.js';
import { Coin } from './entities/coin.js';
import { ExitGate } from './entities/exitGate.js';
import { getTile,drawTiles } from './utils.js';

// Game state variables
let levelIndex = 0; // which level the player is on
let levels = []; // we store level data here
let player; // reference to the player
let coins = []; // coin objects
let exitGate; // exit object
let tileMap; // holds the current level data
let cameraOffsetX = 0; // for scrolling horizontally
let score = 0; // player's score
let backgroundColor; // for background gradient
let gameState = "play"; // can be "play", "win", or "over"
let lives = 3; // number of lives
let playerSpawnX = 0; // where the player starts (X)
let playerSpawnY = 0; // where the player starts (Y)
let enemies = []; // store enemies
let backgroundImage; // different level background


/**
 * Lose a life and either reset the level or end the game.
 */
export function loseLife() {
  lives--;
  window.deathSound.play();
  if (lives <= 0) {
    gameState = "over";
  } else {
    // Reset player position.
    player.x = playerSpawnX;
    player.y = playerSpawnY;
    player.vx = 0;
    player.vy = 0;
    player.gravityDirection = 1; // Reset gravity to normal.
  }
}

/**
 * Load a level by index
 */
export function loadLevel(idx) {
  if (idx < 0 || idx >= levels.length) {
    console.error("Invalid level index:", idx);
    return;
  }

  levelIndex = idx;
  tileMap = levels[levelIndex].map;
  cameraOffsetX = 0;
  coins = [];
  enemies = [];

 // different level background
 backgroundImage = window.backgroundImages[levelIndex];

  // Find player start, coins, exit, and enemies.
  for (let row = 0; row < tileMap.length; row++) {
    for (let col = 0; col < tileMap[row].length; col++) {
      let tile = tileMap[row][col];
      let x = col * tileSize + tileSize / 2;
      let y = row * tileSize + tileSize / 2;

      if (tile === "3") {
        // Player start.
        playerSpawnX = x;
        playerSpawnY = y;
        player = new Player(x, y);
        // Replace with empty space.
        tileMap[row] = tileMap[row].substring(0, col) + "." + tileMap[row].substring(col + 1);
      } else if (tile === "2") {
        // Coin.
        coins.push(new Coin(x, y));
        // Replace with empty space.
        tileMap[row] = tileMap[row].substring(0, col) + "." + tileMap[row].substring(col + 1);
      } else if (tile === "4") {
        // Exit gate.
        exitGate = new ExitGate(x, y);
        // Replace with empty space.
        tileMap[row] = tileMap[row].substring(0, col) + "." + tileMap[row].substring(col + 1);
      } else if (tile === "E") {
        // Enemy.
        enemies.push(new Enemy(x, y));
        // Replace with empty space.
        tileMap[row] = tileMap[row].substring(0, col) + "." + tileMap[row].substring(col + 1);
      }
    }
  }
}

/**
 * Initialize the game
 */
export function initGame() {
  levels = setupLevels();
  loadLevel(0);
  gameState = "play";
  score = 0;
  lives = 3;
}

/**
 * Reload the current level while preserving game state
 * Used when the window is resized
 */
export function reloadCurrentLevel(oldTileSize) {
  if (levels.length === 0) {
    levels = setupLevels();
  }
  
  // Store current state.
  const currentLevel = levelIndex;
  const currentScore = score;
  const currentLives = lives;
  const currentGameState = gameState;
  
  // Convert player's position using the old tile size.
  let playerTileX = 0;
  let playerTileY = 0;
  let playerVelocity = { vx: 0, vy: 0 };
  let playerGravityDirection = 1;
  let playerDirection = 1;
  
  if (player) {
    playerTileX = player.x / oldTileSize;
    playerTileY = player.y / oldTileSize;
    playerVelocity = { vx: player.vx, vy: player.vy };
    playerGravityDirection = player.gravityDirection;
    playerDirection = player.autoDirection;
  }
  
  // Store camera offset relative to the old tile size.
  const cameraTileOffset = cameraOffsetX / oldTileSize;
  
  // Save coins’ state in relative (tile) coordinates.
  const coinStates = coins.map(coin => ({
    tileX: coin.x / oldTileSize,
    tileY: coin.y / oldTileSize,
    collected: coin.collected
  }));
  
  // Save enemies’ state in relative (tile) coordinates.
  const enemyStates = enemies.map(enemy => ({
    tileX: enemy.x / oldTileSize,
    tileY: enemy.y / oldTileSize,
    direction: enemy.direction,
    tileMinX: enemy.minX / oldTileSize,
    tileMaxX: enemy.maxX / oldTileSize
  }));
  
  // Save exit gate state in relative coordinates.
  let exitTileX = 0;
  let exitTileY = 0;
  
  if (exitGate) {
    exitTileX = exitGate.x / oldTileSize;
    exitTileY = exitGate.y / oldTileSize;
  }
  
  // Reload the level (which resets entities using the new tile size).
  loadLevel(currentLevel);
  
  // Restore game state.
  score = currentScore;
  lives = currentLives;
  gameState = currentGameState;
  
  // Restore the player's position using the new tile size.
  if (player) {
    player.x = playerTileX * tileSize;
    player.y = playerTileY * tileSize;
    player.vx = playerVelocity.vx;
    player.vy = playerVelocity.vy;
    player.gravityDirection = playerGravityDirection;
    player.autoDirection = playerDirection;
    playerSpawnX = player.x;
    playerSpawnY = player.y;
  }
  
  // Restore camera position.
  cameraOffsetX = cameraTileOffset * tileSize;
  
  // Recreate coins at the new scale.
  coins = [];
  for (const state of coinStates) {
    const coin = new Coin(state.tileX * tileSize, state.tileY * tileSize);
    coin.collected = state.collected;
    coins.push(coin);
  }
  
  // Recreate enemies at the new scale.
  enemies = [];
  for (const state of enemyStates) {
    const enemy = new Enemy(state.tileX * tileSize, state.tileY * tileSize);
    enemy.direction = state.direction;
    enemy.minX = state.tileMinX * tileSize;
    enemy.maxX = state.tileMaxX * tileSize;
    enemies.push(enemy);
  }
  
  // Recreate exit gate.
  exitGate = new ExitGate(exitTileX * tileSize, exitTileY * tileSize);
}

/**
 * Update game state
 */
export function updateGame() {
  if (gameState !== "play") return;

  // Update player.
  cameraOffsetX = player.update(tileMap, cameraOffsetX);

  // Update enemies.
  for (let enemy of enemies) {
    enemy.update();
    if (enemy.checkPlayerCollision(player)) {
      loseLife();
      return;
    }
  }

  // Check coins.
  for (let coin of coins) {
    if (coin.checkCollision(player)) {
      score += 10;
    }
  }

  // Check exit.
  if (exitGate.checkPlayer(player)) {
    
    window.passSound.play();

    if (levelIndex < levels.length - 1) {
      // Next level.
      loadLevel(levelIndex + 1);
    } else {
      // Won the game!
      gameState = "win";
    }
  }
}

/**
 * Draw the game
 */
export function drawGame() {
// Clear the screen.
//background(220);

// Draw background gradient.
//setGradient(backgroundColor, color(20, 20, 40));


 if (backgroundImage) {
  image(backgroundImage, 0, 0, width, height);
} else {
  background(220);
}

  // Apply camera transform.
  push();

  // Draw tiles.
  drawTiles(tileMap, cameraOffsetX);

  // Draw coins.
  for (let coin of coins) {
    coin.draw(cameraOffsetX);
  }

  // Draw exit gate.
  exitGate.draw(cameraOffsetX);

  // Draw enemies.
  for (let enemy of enemies) {
    enemy.draw(cameraOffsetX);
  }

  // Draw player.
  player.draw(cameraOffsetX);

  pop();

  // Draw HUD.
  fill(0, 0, 0, 100);
  noStroke();
  rect(0, 0, width, hudHeight);
  fill(255);
  textAlign(LEFT, CENTER);
  textSize(Math.max(16, hudHeight * 0.4)); // Scale text with HUD height
  text("Score: " + score, 20, hudHeight / 2);
  text("Lives: " + lives, 150, hudHeight / 2);
  text("Level: " + (levelIndex + 1) + "/" + levels.length, 250, hudHeight / 2);

  // Game over or win screen.
  if (gameState === "over") {
    fill(0, 0, 0, 200);
    rect(0, 0, width, height);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(Math.max(30, width / 20)); // Scale with viewport
    text("GAME OVER", width / 2, height / 2 - 40);
    textSize(Math.max(18, width / 35)); // Scale with viewport
    text("Final Score: " + score, width / 2, height / 2 + 20);
    text("Press SPACE to restart", width / 2, height / 2 + 60);
  } else if (gameState === "win") {
    fill(0, 0, 0, 200);
    rect(0, 0, width, height);
    fill(255, 220, 0);
    textAlign(CENTER, CENTER);
    textSize(Math.max(30, width / 20)); // Scale with viewport
    text("YOU WIN!", width / 2, height / 2 - 40);
    textSize(Math.max(18, width / 35)); // Scale with viewport
    text("Final Score: " + score, width / 2, height / 2 + 20);
    text("Press SPACE to play again", width / 2, height / 2 + 60);
  }
}

/**
 * Handle key press
 */
export function handleKeyPressed() {
  if (keyCode === 32) { // Space bar
    if (gameState === "play") {
      // Attempt to flip gravity.
      player.attemptGravityFlip();
    } else {
      // Restart game.
      initGame();
    }
  }
}

/**
 * Handle touch start
 */
export function handleTouchStarted() {
  if (gameState === "play") {
    // Attempt to flip gravity.
    player.attemptGravityFlip();
  } else {
    // Restart game.
    initGame();
  }
  return false; // Prevent default behavior.
}
