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
let gameState = "menu"; // can be "menu", "difficulty", "play", "win", or "over"
let lives = 3; // number of lives
let playerSpawnX = 0; // where the player starts (X)
let playerSpawnY = 0; // where the player starts (Y)
let enemies = []; // store enemies
let backgroundImage; // different level background
let difficulty = "normal"; // can be "easy" or "hard"
let enemySpeed = 1.5; // base enemy speed - will be modified by difficulty
let coinValue = 10; // base coin value - will be modified by difficulty


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
        // Apply difficulty settings to player
        if (difficulty === "hard") {
          player.autoSpeed = player.autoSpeed * 1.5; // 50% faster movement on hard
        } else if (difficulty === "easy") {
          player.autoSpeed = player.autoSpeed * 0.5; // 50% slower movement on easy
        }
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
        const enemy = new Enemy(x, y);
        
        // Apply difficulty settings to enemy
        if (difficulty === "hard") {
          enemy.speed = enemySpeed * 1.5; // 50% faster enemies on hard
          enemy.range = enemy.range * 1.3; // 30% more range on hard
        } else if (difficulty === "easy") {
          enemy.speed = enemySpeed * 0.7; // 30% slower enemies on easy
        }
        
        enemies.push(enemy);
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
  
  // Start in menu mode instead of play
  gameState = "menu";
  
  // Set default difficulty
  difficulty = "normal";
  
  // Reset score
  score = 0;
  
  // These will be set when the game actually starts after difficulty selection
  // lives = 3;
  // loadLevel(0);
}

/**
 * Set the game difficulty
 */
export function setDifficulty(difficultyLevel) {
  difficulty = difficultyLevel;
  
  // Update game parameters based on difficulty
  if (difficulty === "easy") {
    lives = 99; // More lives on easy
    coinValue = 15; // More points per coin
    enemySpeed = 1.0; // Slower enemies
  } else if (difficulty === "hard") {
    lives = 2; // Fewer lives on hard
    coinValue = 5; // Fewer points per coin
    enemySpeed = 2.0; // Faster enemies
  } else {
    // Normal difficulty
    lives = 3;
    coinValue = 10;
    enemySpeed = 1.5;
  }
  
  // Update physics parameters for the new difficulty
  import('./config.js').then(config => {
    config.updatePhysicsForDifficulty(difficulty);
  });
  
  // Start the game with the first level
  loadLevel(0);
  
  // Change game state to play
  gameState = "play";
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
  const currentDifficulty = difficulty;
  
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
  
  // Save coins' state in relative (tile) coordinates.
  const coinStates = coins.map(coin => ({
    tileX: coin.x / oldTileSize,
    tileY: coin.y / oldTileSize,
    collected: coin.collected
  }));
  
  // Save enemies' state in relative (tile) coordinates.
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
  difficulty = currentDifficulty;
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
    
    // Apply difficulty settings to enemy
    if (difficulty === "hard") {
      enemy.speed = enemySpeed * 1.5;
      enemy.range = enemy.range * 1.3;
    } else if (difficulty === "easy") {
      enemy.speed = enemySpeed * 0.7;
    }
    
    enemies.push(enemy);
  }
  
  // Recreate exit gate.
  exitGate = new ExitGate(exitTileX * tileSize, exitTileY * tileSize);
}

/**
 * Update game state
 */
export function updateGame() {
  // If not in play state, nothing to update
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
      score += coinValue;
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
  // Draw based on game state
  if (gameState === "menu") {
    drawMainMenu();
  } else if (gameState === "difficulty") {
    drawDifficultyMenu();
  } else if (gameState === "play" || gameState === "over" || gameState === "win") {
    drawGameScreen();
  }
}

/**
 * Draw the main menu
 */
function drawMainMenu() {
  // Clear the screen with a gradient background
  background(20, 20, 40);
  
  // Draw title
  fill(255, 220, 0);
  textAlign(CENTER, CENTER);
  textSize(Math.max(40, width / 15));
  text("Rusty Rover’s Run", width / 2, height * 0.3);
  
  // Draw play button
  fill(100, 200, 255);
  rect(width / 2 - 150, height * 0.55 - 40, 300, 80, 10);
  fill(0);
  textSize(Math.max(24, width / 30));
  text("PLAY", width / 2, height * 0.55);
}

/**
 * Draw the difficulty selection menu
 */
function drawDifficultyMenu() {
  // Clear the screen with a gradient background
  background(20, 20, 60);
  
  // Draw title
  fill(255, 220, 0);
  textAlign(CENTER, CENTER);
  textSize(Math.max(40, width / 15));
  text("SELECT DIFFICULTY", width / 2, height * 0.2);
  
  // Draw difficulty buttons
  // Easy button
  fill(100, 255, 100);
  rect(width / 2 - 150, height * 0.4 - 40, 300, 80, 10);
  fill(0);
  textSize(Math.max(24, width / 30));
  text("EASY", width / 2, height * 0.4);
  
  // Normal button
  fill(100, 200, 255);
  rect(width / 2 - 150, height * 0.55 - 40, 300, 80, 10);
  fill(0);
  textSize(Math.max(24, width / 30));
  text("NORMAL", width / 2, height * 0.55);
  
  // Hard button
  fill(255, 100, 100);
  rect(width / 2 - 150, height * 0.7 - 40, 300, 80, 10);
  fill(0);
  textSize(Math.max(24, width / 30));
  text("HARD", width / 2, height * 0.7);
  
  // Draw difficulty descriptions
  textSize(Math.max(16, width / 50));
  fill(255);
  if (mouseY > height * 0.4 - 40 && mouseY < height * 0.4 + 40 && 
      mouseX > width / 2 - 150 && mouseX < width / 2 + 150) {
    text("More lives, higher scores, slower enemies", width / 2, height * 0.85);
  } else if (mouseY > height * 0.55 - 40 && mouseY < height * 0.55 + 40 && 
             mouseX > width / 2 - 150 && mouseX < width / 2 + 150) {
    text("Standard game experience", width / 2, height * 0.85);
  } else if (mouseY > height * 0.7 - 40 && mouseY < height * 0.7 + 40 && 
             mouseX > width / 2 - 150 && mouseX < width / 2 + 150) {
    text("Fewer lives, lower scores, faster enemies", width / 2, height * 0.85);
  }
}

/**
 * Draw the game screen (actual gameplay)
 */
function drawGameScreen() {
  // Draw background image or fallback
  if (backgroundImage) {
    image(backgroundImage, 0, 0, width, height);
  } else {
    background(220);
  }

  // Apply camera transform for game elements
  push();

  // Draw tiles
  drawTiles(tileMap, cameraOffsetX);

  // Draw coins
  for (let coin of coins) {
    coin.draw(cameraOffsetX);
  }

  // Draw exit gate
  exitGate.draw(cameraOffsetX);

  // Draw enemies
  for (let enemy of enemies) {
    enemy.draw(cameraOffsetX);
  }

  // Draw player
  player.draw(cameraOffsetX);

  pop();

  // Draw HUD
  fill(0, 0, 0, 100);
  noStroke();
  rect(0, 0, width, hudHeight);
  fill(255);
  textAlign(LEFT, CENTER);
  textSize(Math.max(16, hudHeight * 0.4)); // Scale text with HUD height
  text("Score: " + score, 20, hudHeight / 2);
  text("Lives: " + lives, 150, hudHeight / 2);
  text("Level: " + (levelIndex + 1) + "/" + levels.length, 250, hudHeight / 2);
  
  // Draw difficulty indicator
  let difficultyColor;
  if (difficulty === "easy") difficultyColor = color(100, 255, 100);
  else if (difficulty === "hard") difficultyColor = color(255, 100, 100);
  else difficultyColor = color(100, 200, 255);
  
  fill(difficultyColor);
  textAlign(RIGHT, CENTER);
  text(difficulty.toUpperCase(), width - 20, hudHeight / 2);

  // Game over or win screen
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
    if (gameState === "menu") {
      // Move from main menu to difficulty selection
      gameState = "difficulty";
    } else if (gameState === "play") {
      // Attempt to flip gravity
      player.attemptGravityFlip();
    } else if (gameState === "over" || gameState === "win") {
      // Return to main menu
      gameState = "menu";
    }
  }
}

/**
 * Handle mouse clicks
 */
export function handleMouseClicked() {
  // Add a timestamp check to prevent accidental double-clicks across state changes
  if (!window.lastStateChangeTime) {
    window.lastStateChangeTime = 0;
  }
  
  // Prevent clicks for 300ms after state changes
  if (Date.now() - window.lastStateChangeTime < 300) {
    return;
  }
  
  if (gameState === "menu") {
    // Check if play button clicked
    if (mouseY > height * 0.55 - 40 && mouseY < height * 0.55 + 40 && 
        mouseX > width / 2 - 150 && mouseX < width / 2 + 150) {
      gameState = "difficulty";
      window.lastStateChangeTime = Date.now();
    }
  } else if (gameState === "difficulty") {
    // Check which difficulty button was clicked
    if (mouseY > height * 0.4 - 40 && mouseY < height * 0.4 + 40 && 
        mouseX > width / 2 - 150 && mouseX < width / 2 + 150) {
      // Easy
      setDifficulty("easy");
      window.lastStateChangeTime = Date.now();
    } else if (mouseY > height * 0.55 - 40 && mouseY < height * 0.55 + 40 && 
               mouseX > width / 2 - 150 && mouseX < width / 2 + 150) {
      // Normal
      setDifficulty("normal");
      window.lastStateChangeTime = Date.now();
    } else if (mouseY > height * 0.7 - 40 && mouseY < height * 0.7 + 40 && 
               mouseX > width / 2 - 150 && mouseX < width / 2 + 150) {
      // Hard
      setDifficulty("hard");
      window.lastStateChangeTime = Date.now();
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
  } else if (gameState === "menu" || gameState === "difficulty") {
    // Simulate a mouse click for touch events
    handleMouseClicked();
  } else {
    // Over or win state - return to main menu
    gameState = "menu";
  }
  return false; // Prevent default behavior.
}
