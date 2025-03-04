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
let gameState = "menu"; // can be "menu", "difficulty", "play", "win", or "over"
let lives = 3; // number of lives
let playerSpawnX = 0; // where the player starts (X)
let playerSpawnY = 0; // where the player starts (Y)
let enemies = []; // store enemies
let bullets = []; // bullets
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
  if (idx < 0 || idx >= levels.length) return;
  if (idx === levels.length - 1 && score < 100) {
    console.log("隐藏关卡解锁失败：得分不足100，当前分数：", score);
    gameState = "win";
    return;
  }
  tileMap = levels[idx].map.slice();
  coins = [];
  enemies = [];
  bullets = []; // Initialize bullets array
  window.bullets = bullets; // Make bullets available globally
  exitGate = null;
  
  let foundPlayer = false;
  
  // 遍历地图的每个字符，处理玩家、金币、出口门和敌人
  for (let row = 0; row < tileMap.length; row++) {
    for (let col = 0; col < tileMap[row].length; col++) {
      let tile = tileMap[row].charAt(col);
      let x = col * tileSize + tileSize / 2;
      let y = row * tileSize + tileSize / 2;
      
      if (tile === "3") {
        // 玩家起始点
        foundPlayer = true;
        playerSpawnX = x;
        playerSpawnY = y;
        player = new Player(x, y);
        // 根据难度调整玩家移动速度
        if (difficulty === "hard") {
          player.autoSpeed *= 1.5; // 50% faster on hard
        } else if (difficulty === "easy") {
          player.autoSpeed *= 0.5; // 50% slower on easy
        }
        window.player = player; // 挂载全局变量
        console.log("找到玩家起始点：", x, y);
        // 替换为默认空格
        tileMap[row] = tileMap[row].substring(0, col) + "." + tileMap[row].substring(col + 1);
      } else if (tile === "2") {
        // 金币
        coins.push(new Coin(x, y));
        console.log("添加金币在：", x, y);
        tileMap[row] = tileMap[row].substring(0, col) + "." + tileMap[row].substring(col + 1);
      } else if (tile === "4") {
        // 出口门
        exitGate = new ExitGate(x, y);
        console.log("添加出口门在：", x, y);
        tileMap[row] = tileMap[row].substring(0, col) + "." + tileMap[row].substring(col + 1);
      } else if (tile === "E") {
        // 敌人
        if (idx === 3 || idx === levels.length - 1) {
          enemies.push(new ShooterEnemy(x, y));
          console.log("添加 ShooterEnemy 在：", x, y);
        } else {
          const enemy = new Enemy(x, y);
          // 根据难度调整敌人的速度和射程
          if (difficulty === "hard") {
            enemy.speed = enemySpeed * 1.5; // 50% faster
            enemy.range = enemy.range * 1.3; // 30% more range
          } else if (difficulty === "easy") {
            enemy.speed = enemySpeed * 0.7; // 30% slower
          }
          enemies.push(enemy);
          console.log("添加普通 Enemy 在：", x, y);
        }
        tileMap[row] = tileMap[row].substring(0, col) + "." + tileMap[row].substring(col + 1);
      }
    }
  }
  
  // 若未找到玩家起始点，则使用默认值
  if (!foundPlayer) {
    playerSpawnX = tileSize * 2;
    playerSpawnY = tileSize * 2;
    console.log("未找到玩家起始点，使用默认值：", playerSpawnX, playerSpawnY);
    player = new Player(playerSpawnX, playerSpawnY);
    window.player = player;
  }
  
  // 若未找到出口门，则使用默认出口位置
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
  cameraOffsetX = player.update(tileMap, cameraOffsetX);
  
  // 更新敌人并检测碰撞
  for (let enemy of enemies) {
    enemy.update();
    if (enemy.checkPlayerCollision(player)) {
      console.log("检测到玩家与敌人碰撞，位置：", enemy.x, enemy.y);
      loseLife();
      return;
    }
  }
  
  // 更新并检测金币
  for (let coin of coins) {
    if (!coin.collected && coin.checkCollision(player)) {
      console.log("玩家收集金币，位置：", coin.x, coin.y);
      score += coinValue;  // 使用难度对应的金币分值
      coin.collected = true;
    }
  }
  
  // 更新子弹
  if (window.bullets && window.bullets.length > 0) {
    for (let i = window.bullets.length - 1; i >= 0; i--) {
      window.bullets[i].update();
      // 如果子弹不再活跃，从数组中移除
      if (!window.bullets[i].active) {
        window.bullets.splice(i, 1);
      }
    }
  }

  // 检测出口
  if (exitGate) {
    console.log("玩家位置：", player.x, player.y, "出口门位置：", exitGate.x, exitGate.y);
    // 给玩家一点时间（例如1秒）避免刚加载就碰到门
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
  
  // Draw bullets
  if (window.bullets && window.bullets.length > 0) {
    for (let bullet of window.bullets) {
      bullet.draw(cameraOffsetX);
    }
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
      // 从主菜单进入难度选择
      gameState = "difficulty";
    } else if (gameState === "play") {
      // 在游戏中按空格尝试翻转重力
      player.attemptGravityFlip();
    } else if (gameState === "over" || gameState === "win") {
      // 游戏结束或胜利时，按空格回到主菜单
      gameState = "menu";
    } else {
      // 其他情况（例如直接从菜单跳过），重新初始化游戏
      initGame();
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
    player.attemptGravityFlip();
  } else if (gameState === "menu" || gameState === "difficulty") {
    // Simulate a mouse click for touch events
    handleMouseClicked();
  } else {
    initGame();
    // Over or win state - return to main menu
    gameState = "menu";
  }
  return false;
}

