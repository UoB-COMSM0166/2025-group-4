/**
 * Main game logic
 */
import { tileSize, numCols, numRows, hudHeight } from './config.js';
import { setupLevels } from './levels.js';
import { Player } from './entities/player.js';
import { Enemy, ShooterEnemy, Bullet } from './entities/enemy.js';
import { Coin } from './entities/coin.js';
import { ExitGate } from './entities/exitGate.js';
import { getTile, drawTiles } from './utils.js';

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
let bullets = []; // bullets
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
  if (idx < 0 || idx >= levels.length) return;
  if (idx === levels.length - 1 && score < 100) {
    console.log("隐藏关卡解锁失败：得分不足100，当前分数：", score);
    gameState = "win";
    return;
  }
  tileMap = levels[idx].map.slice();
  coins = [];
  enemies = [];
  bullets = [];
  window.bullets = bullets;
  exitGate = null;
  
  let foundPlayer = false;
  for (let row = 0; row < tileMap.length; row++) {
    for (let col = 0; col < tileMap[row].length; col++) {
      let ch = tileMap[row].charAt(col);
      if (ch === "3") {
        foundPlayer = true;
        playerSpawnX = col * tileSize + tileSize / 2;
        playerSpawnY = row * tileSize + tileSize / 2;
        console.log("找到玩家起始点：", playerSpawnX, playerSpawnY);
      }
    }
  }
  if (!foundPlayer) {
    playerSpawnX = tileSize * 2;
    playerSpawnY = tileSize * 2;
    console.log("未找到玩家起始点，使用默认值：", playerSpawnX, playerSpawnY);
  }
  player = new Player(playerSpawnX, playerSpawnY);
  window.player = player; // 挂载全局变量
  
  bullets = [];
  window.bullets = bullets;
  
  for (let row = 0; row < tileMap.length; row++) {
    for (let col = 0; col < tileMap[row].length; col++) {
      let ch = tileMap[row].charAt(col);
      let xPos = col * tileSize + tileSize / 2;
      let yPos = row * tileSize + tileSize / 2;
      
      if (ch === "2") {
        coins.push(new Coin(xPos, yPos));
        console.log("添加金币在：", xPos, yPos);
      } else if (ch === "4") {
        exitGate = new ExitGate(xPos, yPos);
        console.log("添加出口门在：", xPos, yPos);
      } else if (ch === "E") {
        if (idx === 3 || idx === levels.length - 1) {
          enemies.push(new ShooterEnemy(xPos, yPos));
          console.log("添加 ShooterEnemy 在：", xPos, yPos);
        } else {
          enemies.push(new Enemy(xPos, yPos));
          console.log("添加普通 Enemy 在：", xPos, yPos);
        }
      }
    }
  }
  
  if (!exitGate) {
    exitGate = new ExitGate(tileSize * 8, tileSize * 2);
    console.log("未找到出口门，使用默认出口：", tileSize * 8, tileSize * 2);
  }
  
  levelIndex = idx;
  console.log("加载关卡：", levelIndex);
  window.levelLoadTime = millis();
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
  cameraOffsetX = player.update(tileMap, cameraOffsetX);
  
  for (let enemy of enemies) {
    enemy.update();
    if (enemy.checkPlayerCollision(player)) {
      console.log("检测到玩家与敌人碰撞，位置：", enemy.x, enemy.y);
      loseLife();
      return;
    }
  }
  
  for (let coin of coins) {
    if (!coin.collected && coin.checkCollision(player)) {
      console.log("玩家收集金币，位置：", coin.x, coin.y);
      score += 10;
    }
  }
  
  for (let b of window.bullets) {
    b.update();
  }
  window.bullets = window.bullets.filter(b => b.active);


  if (exitGate) {
    console.log("玩家位置：", player.x, player.y, "出口门位置：", exitGate.x, exitGate.y);
    if (millis() - window.levelLoadTime > 1000 && exitGate.checkPlayer(player)) {
      console.log("检测到出口碰撞，尝试切换关卡");
      window.passSound.play();
      if (levelIndex < levels.length - 1) {
        loadLevel(levelIndex + 1);
      } else {
        gameState = "win";
      }
    }
  }
}

/**
 * Draw the game
 */
export function drawGame() {
  if (backgroundImage) {
    image(backgroundImage, 0, 0, width, height);
  } else {
    background(220);
  }
  
  push();
  drawTiles(tileMap, cameraOffsetX);
  for (let coin of coins) {
    coin.draw(cameraOffsetX);
  }
  exitGate.draw(cameraOffsetX);
  for (let enemy of enemies) {
    enemy.draw(cameraOffsetX);
  }
  // 新增：绘制子弹
  for (let b of bullets) {
    b.draw(cameraOffsetX);
  }
  player.draw(cameraOffsetX);
  pop();
  
  fill(0, 0, 0, 100);
  noStroke();
  rect(0, 0, width, hudHeight);
  fill(255);
  textAlign(LEFT, CENTER);
  textSize(20);
  text("Score: " + score, 20, hudHeight / 2);
  text("Lives: " + lives, 150, hudHeight / 2);
  text("Level: " + (levelIndex + 1) + "/" + levels.length, 250, hudHeight / 2);
  
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
  if (keyCode === 32) {
    if (gameState === "play") {
      player.attemptGravityFlip();
    } else {
      initGame();
    }
  }
}

/**
 * Handle touch start
 */
export function handleTouchStarted() {
  if (gameState === "play") {
    player.attemptGravityFlip();
  } else {
    initGame();
  }
  return false;
}

