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
  textSize(20);
  text("Score: " + score, 20, hudHeight / 2);
  text("Lives: " + lives, 150, hudHeight / 2);
  text("Level: " + (levelIndex + 1) + "/" + levels.length, 250, hudHeight / 2);

  // Game over or win screen.
  if (gameState === "over") {
    fill(0, 0, 0, 200);
    rect(0, 0, width, height);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(40);
    text("GAME OVER", width / 2, height / 2 - 40);
    textSize(20);
    text("Final Score: " + score, width / 2, height / 2 + 20);
    text("Press SPACE to restart", width / 2, height / 2 + 60);
  } else if (gameState === "win") {
    fill(0, 0, 0, 200);
    rect(0, 0, width, height);
    fill(255, 220, 0);
    textAlign(CENTER, CENTER);
    textSize(40);
    text("YOU WIN!", width / 2, height / 2 - 40);
    textSize(20);
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
