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
import { FloatingPlatform } from './floatingPlatform.js';
import { initLevelEditor, updateLevelEditor, drawLevelEditor, handleEditorMousePressed, handleEditorMouseDragged, handleEditorMouseReleased, handleEditorMouseWheel, handleEditorKeyPressed, exportLevel } from './levelEditor.js';
import { particleSystem } from './particles.js';
import { generateLevels } from './mapGenerator.js';


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
export let gameState = "menu"; // can be "menu", "difficulty", "play", "win", "over", or "editor"
let lives = 3; // number of lives
// Flag to ensure exit logic triggers only once per level
let exitTriggered = false;

// Fixed timestep physics variables
let physicsClock = 0; // Tracks physics simulation time
const DEFAULT_DELTA_TIME = 1/60; // Default delta time if not provided

// Hitstop and invincibility variables
let hitstopActive = false; // whether hitstop is active
let hitstopDuration = 15; // frames of hitstop when hit
let hitstopFramesLeft = 0; // how many frames of hitstop are left
let invincibilityActive = false; // whether player is invincible
let invincibilityDuration = 90; // frames of invincibility after getting hit
let invincibilityFramesLeft = 0; // how many frames of invincibility are left
let hitScreenShakeAmount = 8; // amount of screen shake when hit
let screenShakeX = 0; // current screen shake X offset
let screenShakeY = 0; // current screen shake Y offset
// Enhanced screen shake variables
let screenShakeDecay = 0.85; // how quickly screen shake decays
let screenShakeTrauma = 0; // current trauma level (0-1)
let screenShakeNoiseOffsetX = 0; // noise offset for X shake
let screenShakeNoiseOffsetY = 100; // noise offset for Y shake
let screenShakeNoiseOffsetAngle = 200; // noise offset for rotation shake
let screenShakeRotation = 0; // current rotation shake amount

// Player state variables
let playerSpawnX = 0; // where the player starts (X)
let playerSpawnY = 0; // where the player starts (Y)
let enemies = []; // store enemies
let bullets = []; // bullets
let backgroundImage; // different level background
let difficulty = "normal"; // can be "easy" or "hard"
let enemySpeed = 1.5; // base enemy speed - will be modified by difficulty
let coinValue = 10; // base coin value - will be modified by difficulty
let gameStartTime = 0; // 游戏开始时间
let currentPlayTime = 0; // 当前游戏时间（秒）
let floatingPlatforms = [];//动态悬浮平台对象
let generatedMode = false; // whether we're in generated mode
let generatedLevels = []; // store generated levels
let generatedLevelCount = 0; // how many levels completed in generated mode
let totalCoinsCollected = 0; // total coins collected in generated mode
let selectedLives = 5; // default number of lives for generated mode
let statsDisplayActive = false; // whether the stats display is active
let seedValue = ""; // Empty string means random seed
let seedInput = false; // Flag to indicate if we're editing the seed


// Export game state to window for access in other modules
function updateWindowGameState() {
  window.invincibilityActive = invincibilityActive;
  window.hitstopActive = hitstopActive;
  window.frameCount = window.frameCount || 0; // Ensure frameCount exists
  window.physicsClock = physicsClock; // Expose physics clock to window
}

/**
 * Lose a life and either reset the level or end the game.
 */
export function loseLife() {
  // If player is invincible, don't take damage
  if (invincibilityActive) {
    return;
  }
  
  lives--;
  // window.deathSound.play();
  
  // Create death particle effect at player position
  particleSystem.createDeath(player.x, player.y);
  
  if (lives <= 0) {
    // Game over
    gameState = "over";
  } else {
    // Trigger hitstop effect
    hitstopActive = true;
    hitstopFramesLeft = hitstopDuration;
    
    // Apply enhanced screen shake - set trauma to max
    screenShakeTrauma = 1.0;
    
    // Start invincibility period
    invincibilityActive = true;
    invincibilityFramesLeft = invincibilityDuration;
    
    // We don't reset player position immediately during hitstop
    // It will be reset when hitstop ends
  }
  //检测子弹碰撞是否损失生命
  window.loseLife = loseLife;
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

  // Reset exit trigger when loading a new level
  exitTriggered = false;

  const currentLevel = levels[idx];

  //加载墙壁图像
  if (currentLevel.assets && currentLevel.assets.wall) {
    window.currentWallImage = loadImage(currentLevel.assets.wall);
  } else {
    window.currentWallImage = null;
  }

  // 加载背景图
  if (currentLevel.assets && currentLevel.assets.background) {
    backgroundImage = loadImage(currentLevel.assets.background);
  } else {
    backgroundImage = null;
  }

  // 加载尖刺资源
  if (currentLevel.assets && currentLevel.assets.spike) {
    window.currentSpikeImage = loadImage(currentLevel.assets.spike);
  } else {
    window.currentSpikeImage = null;
  }
  // 加载打滑墙壁资源
  if (currentLevel.assets && currentLevel.assets.slipperyPlayer) {
    window.slipperyPlayerImage = loadImage(currentLevel.assets.slipperyPlayer);
  } else {
    window.slipperyPlayerImage = null;
  }

  // 加载 inIcePlayer
if (currentLevel.assets && currentLevel.assets.inIcePlayer) {
  window.inIcePlayerImage = loadImage(currentLevel.assets.inIcePlayer);
} else {
  window.inIcePlayerImage = null;
}

// 加载上下移动平台图片
if (currentLevel.assets && currentLevel.assets.platformUpDown) {
  window.platformUpDownImage = loadImage(currentLevel.assets.platformUpDown);
} else {
  window.platformUpDownImage = null;
}


// 加载左右移动平台图片
if (currentLevel.assets && currentLevel.assets.platformleftright) {
  window.platformleftrightImage = loadImage(currentLevel.assets.platformleftright);
} else {
  window.platformleftrightImage = null;
}



  // Clear particles when loading a new level
  particleSystem.clear();

  // 清空旧的动态悬浮平台
  floatingPlatforms = [];

  
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
        
        // Create a spawn particle effect
        particleSystem.createBurst(x, y, 20, {
          color: color(150, 200, 255),
          life: random(30, 60),
          size: random(4, 10),
          speed: random(1, 3),
          gravity: 0.03
        });
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
        // 添加普通敌人
        const enemy = new Enemy(x, y);
        // 根据难度调整普通敌人的属性
        if (difficulty === "hard") {
          enemy.speed = enemySpeed * 1.5;
          enemy.range = enemy.range * 1.3;
        } else if (difficulty === "easy") {
          enemy.speed = enemySpeed * 0.7;
        }
        enemies.push(enemy);
        console.log("添加普通 Enemy 在：", x, y);
        tileMap[row] = tileMap[row].substring(0, col) + "." + tileMap[row].substring(col + 1);
      } else if (tile === "E") {
        // 添加可攻击的敌人（例如 ShooterEnemy）
        enemies.push(new ShooterEnemy(x, y));
        console.log("添加 ShooterEnemy 在：", x, y);
        tileMap[row] = tileMap[row].substring(0, col) + "." + tileMap[row].substring(col + 1);
      }
       else if (tile === "6" || tile === "7") {
        // 动态悬浮平台
        // 6：上下移动的平台，7：左右移动的平台
        // 创建平台对象后将该位置替换为空白，避免后续静态绘制
        floatingPlatforms.push(new FloatingPlatform(x, y, tile));
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
  window.floatingPlatforms = floatingPlatforms;
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
  
  // Add a colorful burst based on difficulty
  let difficultyColor;
  if (difficulty === "easy") {
    difficultyColor = color(100, 255, 100);
  } else if (difficulty === "hard") {
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
  
  // 初始化游戏时间
  gameStartTime = millis();
  currentPlayTime = 0;
  
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
 * @param {number} deltaTime - Time since last update
 */
export function updateGame(deltaTime = DEFAULT_DELTA_TIME) {
  // Skip update if in stats display
  if (statsDisplayActive) {
    return;
  }
  
  // Update game time if game is active
  if (gameState === "play") {
    currentPlayTime = (millis() - gameStartTime) / 1000;
  }
  
  // If not in play state, nothing to update
  if (gameState !== "play") return;
  
  // Skip update if required objects aren't initialized
  if (!player || !tileMap) {
    console.warn("Player or tile map not initialized, skipping update");
    return;
  }

  // Ensure floating platforms is initialized
  if (!floatingPlatforms) {
    floatingPlatforms = [];
  }
  window.floatingPlatforms = floatingPlatforms;

  // Update global invincibility state
  if (invincibilityFramesLeft > 0) {
    invincibilityFramesLeft--;
    if (invincibilityFramesLeft <= 0) {
      invincibilityActive = false;
    }
  }
  window.invincibilityActive = invincibilityActive;

  // Update physics clock
  physicsClock += deltaTime;
  
  // Convert deltaTime to seconds if needed
  const dt = deltaTime;
  
  // 更新游戏时间
  currentPlayTime = (millis() - gameStartTime) / 1000; // 转换为秒

  // --- Handle Delays ---
  // Prioritize damage hitstop
  if (hitstopActive) {
    hitstopFramesLeft -= 1;
    updateScreenShake(dt); // Update screen shake during hitstop
    
    if (hitstopFramesLeft <= 0) {
      endHitstop();
    }
    
    // Update window game state
    updateWindowGameState();
    
    // Update particles during hitstop
    particleSystem.update(dt);
    return; // Stop game logic update
  } 
  // No need to check for gravity flip delay here since it's handled by the player
  else {
    // Only update screen shake when NOT in hitstop (it's handled above)
    // Continue to update screen shake even after hitstop ends for smooth transition
    updateScreenShake(dt);
  }
  // --- End Handle Delays ---
  
  const playerCol = Math.floor(player.x / tileSize);
  const playerRow = Math.floor(player.y / tileSize);
    // 假设玩家触碰到了冰冻陷阱
    if (
      playerRow >= 0 && playerRow < tileMap.length &&
      playerCol >= 0 && playerCol < tileMap[playerRow].length &&
      tileMap[playerRow].charAt(playerCol) === "I" &&
      !player.isFrozen
    ) {
      // 将该冰冻陷阱替换为空格，使陷阱消失
      tileMap[playerRow] = tileMap[playerRow].substring(0, playerCol) + "." + tileMap[playerRow].substring(playerCol + 1);
      // 设置冻结效果（例如冻结60帧，约1秒）
      player.freezeTimer = 60;
      player.isFrozen = true;
      
      // Create frozen effect particles
      particleSystem.createFrozenEffect(player.x, player.y, player.w, player.h);
      
      console.log("玩家触碰到冰冻陷阱,被冻结1秒,陷阱消失");
    }
  
  
  // Update window game state (ensure it's updated even if no delays are active)
  updateWindowGameState();
  
  // Update player with deltaTime
  cameraOffsetX = player.update(tileMap, cameraOffsetX, dt);
  
  // 更新敌人并检测碰撞
  for (let enemy of enemies) {
    enemy.update(dt);
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
      
      // Create coin collection particle effect
      particleSystem.createCoin(coin.x, coin.y);
    }
  }
  
  // 更新子弹
  if (window.bullets && window.bullets.length > 0) {
    for (let i = window.bullets.length - 1; i >= 0; i--) {
      window.bullets[i].update(dt);
      // 如果子弹不再活跃，从数组中移除
      if (!window.bullets[i].active) {
        window.bullets.splice(i, 1);
      }
    }
  }

  // 更新动态悬浮平台
  for (let platform of floatingPlatforms) {
    platform.update(dt);
  }
  
  // Update particle system
  particleSystem.update(dt);

  // When the player reaches the exit, update level logic
  if (gameState === "play" && player && exitGate && exitGate.checkPlayer(player) && !exitTriggered) {
    exitTriggered = true;
    // Add special particles when reaching the exit
    particleSystem.createExitGate(exitGate.x, exitGate.y);
    
    // Play exit sound
    window.passSound.play();
    
    // In generated mode, use the generated level completion logic
    if (generatedMode) {
      // Award bonus points for completing a generated level
      score += 20;
      
      // Complete the level
      completeGeneratedLevel();
    } else {
      // Regular mode - load the next level or win if at the end
      levelIndex++;
      if (levelIndex >= levels.length) {
        gameState = "win";
      } else {
        loadLevel(levelIndex);
      }
    }
  }
}

// New function to update screen shake using a trauma-based system
function updateScreenShake(deltaTime) {
  // Reduce trauma over time - adjusted for deltaTime
  screenShakeTrauma *= Math.pow(screenShakeDecay, deltaTime * 60); // Scale with frameRate
  
  // If trauma is very small, reset it to zero
  if (screenShakeTrauma < 0.01) {
    screenShakeTrauma = 0;
    screenShakeX = 0;
    screenShakeY = 0;
    screenShakeRotation = 0;
    return;
  }
  
  // Use noise to create more natural-looking shake
  // Increment noise offsets for continuous variation - adjusted for deltaTime
  const noiseStep = 0.1 * deltaTime * 60; // Scale with frameRate
  screenShakeNoiseOffsetX += noiseStep;
  screenShakeNoiseOffsetY += noiseStep;
  screenShakeNoiseOffsetAngle += noiseStep;
  
  // Calculate shake amount based on trauma (squared for more dramatic effect)
  const traumaSquared = screenShakeTrauma * screenShakeTrauma;
  
  // Use noise or random for shake direction
  if (window.noise) {
    // If p5.js noise function is available
    screenShakeX = hitScreenShakeAmount * traumaSquared * (window.noise(screenShakeNoiseOffsetX) * 2 - 1);
    screenShakeY = hitScreenShakeAmount * traumaSquared * (window.noise(screenShakeNoiseOffsetY) * 2 - 1);
    screenShakeRotation = 0.05 * traumaSquared * (window.noise(screenShakeNoiseOffsetAngle) * 2 - 1);
  } else {
    // Fallback to random if noise isn't available
    screenShakeX = hitScreenShakeAmount * traumaSquared * (Math.random() * 2 - 1);
    screenShakeY = hitScreenShakeAmount * traumaSquared * (Math.random() * 2 - 1);
    screenShakeRotation = 0.05 * traumaSquared * (Math.random() * 2 - 1);
  }
}

/**
 * Draw the game
 * @param {number} interpolation - Interpolation factor between physics frames (0-1)
 */
export function drawGame(interpolation = 0) {
  push(); // Save the current transformation state
  
  // Apply screen shake if active
  if (screenShakeTrauma > 0) {
    translate(width/2 + screenShakeX, height/2 + screenShakeY);
    rotate(screenShakeRotation);
    translate(-width/2, -height/2);
  }
  
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
  } else if (gameState === "lives") {
    drawLivesMenu();
  } else if (gameState === "stats") {
    drawStatsScreen();
  } else if (gameState === "play" || gameState === "over" || gameState === "win") {
    drawGameScreen(interpolation);
  }
  
  pop(); // Restore the transformation state
}

/**
 * Draw the main menu
 */
function drawMainMenu() {
  // Create a gradient background effect
  let c1 = color(20, 20, 40);
  let c2 = color(40, 40, 80);
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(c1, c2, inter);
    stroke(c);
    line(0, y, width, y);
  }
  
  // Add animated stars in the background
  drawStars();
  
  // Create ambient particles in the menu
  if (random() < 0.1) {
    const x = random(width);
    const y = random(height);
    particleSystem.addParticle(x, y, {
      vx: random(-0.5, 0.5),
      vy: random(-0.3, -0.1), // Slowly float upward
      color: color(200, 220, 255, 150),
      life: random(120, 240),
      size: random(2, 5),
      gravity: 0,
      drag: 0.99,
      shape: random() > 0.7 ? 'square' : 'circle'
    });
  }
  
  // Update and draw particles
  particleSystem.update(1/60);
  particleSystem.draw(0);
  
  // Draw a game logo or icon
  fill(255, 220, 0);
  textAlign(CENTER, CENTER);
  textSize(Math.max(40, width / 15));
  textStyle(BOLD);
  text("Rusty Rover's Run", width / 2, height * 0.3);
  textStyle(NORMAL);
  
  // Add a subtitle
  fill(200, 200, 255);
  textSize(Math.max(16, width / 40));
  text("A Gravity-Defying Adventure", width / 2, height * 0.38);
  
  // Draw play button with a pulsing effect
  let pulseSize = sin(frameCount * 0.05) * 10;
  fill(100, 200, 255, 220);
  rect(width / 2 - 150 - pulseSize/2, height * 0.5 - 40 - pulseSize/2, 
       300 + pulseSize, 80 + pulseSize, 15);
       
  // Add button hover effect particles
  if (mouseX > width / 2 - 150 && mouseX < width / 2 + 150 &&
      mouseY > height * 0.5 - 40 && mouseY < height * 0.5 + 40) {
    if (random() < 0.3) {
      const x = width / 2 + random(-150, 150);
      const y = height * 0.5 + random(-40, 40);
      particleSystem.addParticle(x, y, {
        vx: random(-0.5, 0.5),
        vy: random(-1, -0.5),
        color: color(255, 255, 255, 150),
        life: random(20, 40),
        size: random(1, 3),
        gravity: 0,
        drag: 0.98
      });
    }
  }
       
  fill(0);
  textSize(Math.max(24, width / 30));
  text("PLAY", width / 2, height * 0.5);
  
  // Draw GENERATE button
  fill(255, 150, 100, 220);
  rect(width / 2 - 150 - pulseSize/2, height * 0.65 - 40 - pulseSize/2, 
       300 + pulseSize, 80 + pulseSize, 15);
       
  // Add button hover effect for GENERATE
  if (mouseX > width / 2 - 150 && mouseX < width / 2 + 150 &&
      mouseY > height * 0.65 - 40 && mouseY < height * 0.65 + 40) {
    if (random() < 0.3) {
      const x = width / 2 + random(-150, 150);
      const y = height * 0.65 + random(-40, 40);
      particleSystem.addParticle(x, y, {
        vx: random(-0.5, 0.5),
        vy: random(-1, -0.5),
        color: color(255, 200, 150, 150),
        life: random(20, 40),
        size: random(1, 3),
        gravity: 0,
        drag: 0.98
      });
    }
  }
       
  fill(0);
  textSize(Math.max(24, width / 30));
  text("RANDOM", width / 2, height * 0.65);
  
  // Add game description at the bottom
  fill(255);
  textSize(Math.max(14, width / 60));
  text("Collect coins, avoid enemies, and flip gravity to reach the exit!", width / 2, height * 0.8);
  text("Press SPACE or touch to flip gravity during gameplay", width / 2, height * 0.85);
}

/**
 * Draw the difficulty selection menu
 */
function drawDifficultyMenu() {
  // Clear the screen with a gradient background
  let c1 = color(20, 20, 60);
  let c2 = color(40, 40, 100);
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(c1, c2, inter);
    stroke(c);
    line(0, y, width, y);
  }
  
  // Add some animated elements
  drawStars();
  
  // Create ambient particles in the menu
  if (random() < 0.1) {
    const x = random(width);
    const y = random(height);
    particleSystem.addParticle(x, y, {
      vx: random(-0.5, 0.5),
      vy: random(-0.3, -0.1), // Slowly float upward
      color: color(200, 220, 255, 150),
      life: random(120, 240),
      size: random(2, 5),
      gravity: 0,
      drag: 0.99,
      shape: random() > 0.7 ? 'square' : 'circle'
    });
  }
  
  // Update and draw particles
  particleSystem.update(1/60);
  particleSystem.draw(0);
  
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
  
  // Draw instructions panel
  fill(0, 0, 0, 150);
  rect(width / 2 - 400, height * 0.85 - 45, 800, 110, 10);
  
  // Draw difficulty descriptions
  textSize(Math.max(16, width / 50));
  fill(255);
  if (mouseY > height * 0.4 - 40 && mouseY < height * 0.4 + 40 && 
      mouseX > width / 2 - 150 && mouseX < width / 2 + 150) {
    text("More lives, higher scores, slower enemies", width / 2, height * 0.85 - 25);
  } else if (mouseY > height * 0.55 - 40 && mouseY < height * 0.55 + 40 && 
             mouseX > width / 2 - 150 && mouseX < width / 2 + 150) {
    text("Standard game experience", width / 2, height * 0.85 - 25);
  } else if (mouseY > height * 0.7 - 40 && mouseY < height * 0.7 + 40 && 
             mouseX > width / 2 - 150 && mouseX < width / 2 + 150) {
    text("Fewer lives, lower scores, faster enemies", width / 2, height * 0.85 - 25);
  }
  
  // Always show basic instructions
  textSize(Math.max(14, width / 60));
  text("Controls: SPACE to flip gravity, avoid enemies, collect coins", width / 2, height * 0.85 + 5);
  text("Reach the exit gate to complete each level", width / 2, height * 0.85 + 25);
}

/**
 * Draw animated stars for menu backgrounds
 */
function drawStars() {
  // Create a twinkling star effect
  fill(255, 255, 255);
  noStroke();
  for (let i = 0; i < 50; i++) {
    // Use frameCount to create animation
    let x = (width * (i * 0.02 + 0.5)) % width;
    let y = (height * (i * 0.03 + 0.7)) % height;
    let size = 2 + sin((frameCount + i * 10) * 0.05) * 2;
    let alpha = 100 + sin((frameCount + i * 20) * 0.05) * 155;
    fill(255, 255, 255, alpha);
    ellipse(x, y, size, size);
  }
}

/**
 * Draw the game screen (actual gameplay)
 * @param {number} interpolation - Interpolation factor between physics frames (0-1)
 */
function drawGameScreen(interpolation = 0) {
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

  // Draw enemies with interpolation
  for (let enemy of enemies) {
    enemy.draw(cameraOffsetX, interpolation);
  }
  
  // Draw bullets with interpolation
  if (window.bullets && window.bullets.length > 0) {
    for (let bullet of window.bullets) {
      bullet.draw(cameraOffsetX, interpolation);
    }
  }


  // 在绘制玩家之前添加动态平台绘制
  for (let platform of floatingPlatforms) {
    platform.draw(cameraOffsetX, interpolation);
  }
  
  // Draw player with invincibility effect and interpolation
  if (invincibilityActive && !hitstopActive) {
    // Flash the player during invincibility (show only every other 4 frames)
    if (window.frameCount % 8 < 4) {
      player.draw(cameraOffsetX, interpolation);
    }
  } else {
    player.draw(cameraOffsetX, interpolation);
  }
  
  // Draw particles with camera offset
  particleSystem.draw(cameraOffsetX);
  
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
  
  // 添加时间显示
  let minutes = Math.floor(currentPlayTime / 60);
  let seconds = Math.floor(currentPlayTime % 60);
  // 格式化时间，确保秒数始终为两位数
  let timeDisplay = minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  text("Time: " + timeDisplay, 400, hudHeight / 2);
  
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
  // Handle seed input for generated levels
  if (gameState === "lives" && seedInput) {
    // Handle backspace
    if (keyCode === BACKSPACE) {
      seedValue = seedValue.slice(0, -1);
      return;
    }
    
    // Handle enter to confirm input
    if (keyCode === ENTER || keyCode === RETURN) {
      seedInput = false;
      return;
    }
    
    // Handle escape to cancel input
    if (keyCode === ESCAPE) {
      seedInput = false;
      return;
    }
    
    // Add characters (only allow alphanumeric and some special chars)
    if ((key >= '0' && key <= '9') || 
        (key >= 'a' && key <= 'z') || 
        (key >= 'A' && key <= 'Z') ||
        key === '-' || key === '_' || key === '.') {
      // Limit length to prevent overflow
      if (seedValue.length < 20) {
        seedValue += key;
      }
    }
    return;
  }

  // Handle other key presses
  if (keyCode === 32) { // Space bar
    if (gameState === "menu") {
      // From main menu to difficulty selection
      gameState = "difficulty";
    } else if (gameState === "play") {
      // In game, attempt to flip gravity
      player.attemptGravityFlip();
    } else if (gameState === "over" || gameState === "win") {
      // Game over or win, return to main menu
      gameState = "menu";
    } else if (gameState === "stats") {
      // Continue from stats screen
      statsDisplayActive = false;
      gameState = "play";
    } else {
      // Other cases, reinitialize game
      initGame();
    }
  } else if (keyCode === ESCAPE) {
    // Escape can be used to return to the main menu from anywhere
    if (gameState !== "menu") {
      initGame();
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
    if (mouseY > height * 0.5 - 40 && mouseY < height * 0.5 + 40 && 
        mouseX > width / 2 - 150 && mouseX < width / 2 + 150) {
      gameState = "difficulty";
      generatedMode = false;
      window.lastStateChangeTime = Date.now();
    }
    // Check if generate button clicked
    else if (mouseY > height * 0.65 - 40 && mouseY < height * 0.65 + 40 && 
             mouseX > width / 2 - 150 && mouseX < width / 2 + 150) {
      gameState = "lives";
      generatedMode = true;
      selectedLives = 5; // Default to 5 lives for the generated mode
      seedValue = ""; // Reset seed value
      seedInput = false; // Reset seed input mode
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
  } else if (gameState === "lives") {
    const options = [3, 5, 10, 99];
    const buttonY = [height * 0.30, height * 0.38, height * 0.46, height * 0.54];
    
    // Check if seed input box was clicked
    if (mouseY > height * 0.7 - 25 && mouseY < height * 0.7 + 25 && 
        mouseX > width / 2 - 150 && mouseX < width / 2 + 150) {
      seedInput = true;
    } else {
      // If clicked outside the seed input, stop editing
      if (seedInput) {
        seedInput = false;
      }
      
      // Check if any lives option was clicked
      for (let i = 0; i < options.length; i++) {
        if (mouseY > buttonY[i] - 30 && mouseY < buttonY[i] + 30 && 
            mouseX > width / 2 - 100 && mouseX < width / 2 + 100) {
          selectedLives = options[i];
          break;
        }
      }
      
      // Check if start button was clicked
      if (mouseY > height * 0.82 - 35 && mouseY < height * 0.82 + 35 && 
          mouseX > width / 2 - 120 && mouseX < width / 2 + 120) {
        seedInput = false; // Exit seed input mode
        startGeneratedMode();
        window.lastStateChangeTime = Date.now();
      }
    }
  } else if (gameState === "stats") {
    const panelWidth = Math.min(600, width * 0.8);
    const panelHeight = Math.min(400, height * 0.7);
    const panelX = width / 2 - panelWidth / 2;
    const panelY = height / 2 - panelHeight / 2;
    
    // Check if continue button was clicked
    if (mouseY > panelY + panelHeight - 80 && mouseY < panelY + panelHeight - 30 && 
        mouseX > width / 2 - 100 && mouseX < width / 2 + 100) {
      statsDisplayActive = false;
      gameState = "play";
      window.lastStateChangeTime = Date.now();
    }
    // Check if quit button was clicked
    else if (mouseY > panelY + panelHeight - 20 && mouseY < panelY + panelHeight + 30 && 
             mouseX > width / 2 - 100 && mouseX < width / 2 + 100) {
      // Return to main menu
      initGame();
      gameState = "menu";
      window.lastStateChangeTime = Date.now();
    }
  }
}

/**
 * Start the generated mode
 */
function startGeneratedMode() {
  // Generate levels with seed if provided
  generatedLevels = generateLevels(20, seedValue); // Generate 20 levels with optional seed
  generatedLevelCount = 0;
  totalCoinsCollected = 0;
  score = 0;
  
  // Set lives based on selection
  lives = selectedLives;
  
  // Set difficulty to easy
  difficulty = "easy";
  import('./config.js').then(config => {
    config.updatePhysicsForDifficulty("easy");
  });
  
  // Initialize game time
  gameStartTime = millis();
  currentPlayTime = 0;
  
  // Initialize floating platforms array
  floatingPlatforms = [];
  window.floatingPlatforms = floatingPlatforms;
  
  // Load the first generated level
  loadGeneratedLevel(0);
  
  // Change game state to play
  gameState = "play";
}

/**
 * Load a generated level by index
 */
function loadGeneratedLevel(idx) {
  // Reset exit trigger when loading a new generated level
  exitTriggered = false;
  if (idx < 0 || idx >= generatedLevels.length) {
    // All levels completed - win the game
    gameState = "win";
    return;
  }
  
  const currentLevel = generatedLevels[idx];
  levelIndex = idx;
  
  // Load wall image
  if (currentLevel.assets && currentLevel.assets.wall) {
    window.currentWallImage = loadImage(currentLevel.assets.wall);
  } else {
    window.currentWallImage = null;
  }

  // Load background image
  if (currentLevel.assets && currentLevel.assets.background) {
    backgroundImage = loadImage(currentLevel.assets.background);
  } else {
    backgroundImage = null;
  }

  // Load spike image
  if (currentLevel.assets && currentLevel.assets.spike) {
    window.currentSpikeImage = loadImage(currentLevel.assets.spike);
  } else {
    window.currentSpikeImage = null;
  }
  
  // Load other assets as needed
  if (currentLevel.assets && currentLevel.assets.slipperyPlayer) {
    window.slipperyPlayerImage = loadImage(currentLevel.assets.slipperyPlayer);
  } else {
    window.slipperyPlayerImage = null;
  }
  
  if (currentLevel.assets && currentLevel.assets.inIcePlayer) {
    window.inIcePlayerImage = loadImage(currentLevel.assets.inIcePlayer);
  } else {
    window.inIcePlayerImage = null;
  }
  
  if (currentLevel.assets && currentLevel.assets.platformUpDown) {
    window.platformUpDownImage = loadImage(currentLevel.assets.platformUpDown);
  } else {
    window.platformUpDownImage = null;
  }
  
  if (currentLevel.assets && currentLevel.assets.platformleftright) {
    window.platformleftrightImage = loadImage(currentLevel.assets.platformleftright);
  } else {
    window.platformleftrightImage = null;
  }
  
  // Clear particles
  particleSystem.clear();
  
  // Clear floating platforms
  floatingPlatforms = [];
  window.floatingPlatforms = floatingPlatforms;
  
  // Set tile map and initialize entities
  tileMap = currentLevel.map.slice();
  coins = [];
  enemies = [];
  bullets = [];
  window.bullets = bullets;
  exitGate = null;
  
  let foundPlayer = false;
  let foundExit = false;
  
  // Process the map
  for (let row = 0; row < tileMap.length; row++) {
    for (let col = 0; col < tileMap[row].length; col++) {
      let tile = tileMap[row].charAt(col);
      let x = col * tileSize + tileSize / 2;
      let y = row * tileSize + tileSize / 2;
      
      if (tile === "3") {
        // Player start position
        foundPlayer = true;
        playerSpawnX = x;
        playerSpawnY = y;
        player = new Player(x, y);
        player.autoSpeed *= 0.5; // Slower speed for generated mode (easy)
        window.player = player;
        
        // Replace with empty space
        tileMap[row] = tileMap[row].substring(0, col) + "." + tileMap[row].substring(col + 1);
        
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
        coins.push(new Coin(x, y));
      } else if (tile === "4") {
        // Exit gate
        exitGate = new ExitGate(x, y);
        foundExit = true;
      } else if (tile === "e") {
        // Normal enemy
        const enemy = new Enemy(x, y);
        enemy.speed = enemySpeed * 0.7; // Slower for generated mode (easy)
        enemies.push(enemy);
      } else if (tile === "E") {
        // Shooter enemy
        const enemy = new ShooterEnemy(x, y);
        enemy.speed = enemySpeed * 0.7; // Slower for generated mode (easy)
        enemies.push(enemy);
      } else if (tile === "6") {
        // Up-down floating platform
        floatingPlatforms.push(new FloatingPlatform(x, y, tileSize * 2, tileSize / 2, 0, 1));
        // Replace with empty space
        tileMap[row] = tileMap[row].substring(0, col) + "." + tileMap[row].substring(col + 1);
      } else if (tile === "7") {
        // Left-right floating platform
        floatingPlatforms.push(new FloatingPlatform(x, y, tileSize * 2, tileSize / 2, 1, 0));
        // Replace with empty space
        tileMap[row] = tileMap[row].substring(0, col) + "." + tileMap[row].substring(col + 1);
      }
    }
  }
  
  // Update the global floatingPlatforms reference
  window.floatingPlatforms = floatingPlatforms;
  
  // Center the camera
  cameraOffsetX = 0;
  
  // Ensure player was found - if not, create player at a safe position
  if (!foundPlayer) {
    console.error("No player start position found in generated level");
    
    // Find a safe position near the left side of the map
    let safeRow = -1;
    for (let row = 2; row < tileMap.length - 3; row++) {
      if (tileMap[row].charAt(2) === "." && tileMap[row + 1].charAt(2) === "1") {
        safeRow = row;
        break;
      }
    }
    
    // If no ideal position found, place at arbitrary position and add platform
    if (safeRow === -1) {
      safeRow = Math.floor(tileMap.length / 2);
      // Add a platform at this position
      for (let col = 2; col < 6; col++) {
        const rowString = tileMap[safeRow + 1];
        tileMap[safeRow + 1] = rowString.substring(0, col) + "1" + rowString.substring(col + 1);
      }
    }
    
    // Create player at the safe position
    playerSpawnX = 2 * tileSize + tileSize / 2;
    playerSpawnY = safeRow * tileSize + tileSize / 2;
    player = new Player(playerSpawnX, playerSpawnY);
    player.autoSpeed *= 0.5; // Slower speed for generated mode (easy)
    window.player = player;
    
    // Create spawn effect
    particleSystem.createBurst(playerSpawnX, playerSpawnY, 20, {
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
    const col = tileMap[0].length - 3;
    let safeRow = -1;
    for (let row = 2; row < tileMap.length - 3; row++) {
      if (tileMap[row].charAt(col) === "." && tileMap[row + 1].charAt(col) === "1") {
        safeRow = row;
        break;
      }
    }
    
    // If no ideal position found, place at arbitrary position and add platform
    if (safeRow === -1) {
      safeRow = Math.floor(tileMap.length / 2);
      // Add a platform at this position
      for (let c = col - 2; c <= col + 2; c++) {
        if (c >= 0 && c < tileMap[0].length) {
          const rowString = tileMap[safeRow + 1];
          tileMap[safeRow + 1] = rowString.substring(0, c) + "1" + rowString.substring(c + 1);
        }
      }
    }
    
    // Create exit gate at the safe position
    const exitX = col * tileSize + tileSize / 2;
    const exitY = safeRow * tileSize + tileSize / 2;
    exitGate = new ExitGate(exitX, exitY);
  }
}

/**
 * Handle level completion for generated mode
 */
function completeGeneratedLevel() {
  // Increment level count
  generatedLevelCount++;
  
 // Count coins collected
  for (const coin of coins) {
    if (coin.collected) {
      totalCoinsCollected++;
    }
  }
  
  // Check if this is a milestone (every 5 levels)
  if (generatedLevelCount % 5 === 0) {
    // Show stats screen
    statsDisplayActive = true;
    gameState = "stats";
  } else {
    // Add a slight delay before loading the next level
    setTimeout(() => {
      // Load the next level
      loadGeneratedLevel(levelIndex + 1);
    }, 500);
  }
}

/**
 * Draw the lives selection screen
 */
function drawLivesMenu() {
  // Clear the screen with a gradient background
  let c1 = color(30, 20, 50);
  let c2 = color(60, 30, 70);
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(c1, c2, inter);
    stroke(c);
    line(0, y, width, y);
  }
  
  // Add some animated elements
  drawStars();
  
  // Create ambient particles
  if (random() < 0.1) {
    particleSystem.addParticle(random(width), random(height), {
      vx: random(-0.5, 0.5),
      vy: random(-0.3, -0.1),
      color: color(255, 180, 150, 150),
      life: random(120, 240),
      size: random(2, 5),
      gravity: 0,
      drag: 0.99
    });
  }
  
  // Update and draw particles
  particleSystem.update(1/60);
  particleSystem.draw(0);
  
  // Draw title
  fill(255, 180, 80);
  textAlign(CENTER, CENTER);
  textSize(Math.max(40, width / 15));
  text("SELECT LIVES", width / 2, height * 0.15);
  
  // Draw lives options
  const options = [3, 5, 10, 99];
  const buttonY = [height * 0.30, height * 0.38, height * 0.46, height * 0.54];
  
  for (let i = 0; i < options.length; i++) {
    // Highlight selected option
    if (options[i] === selectedLives) {
      fill(255, 200, 100);
      stroke(255, 150, 50);
      strokeWeight(3);
    } else {
      fill(200, 100, 80);
      noStroke();
    }
    
    rect(width / 2 - 100, buttonY[i] - 30, 200, 60, 10);
    
    fill(0);
    noStroke();
    textSize(Math.max(24, width / 30));
    text(options[i] === 99 ? "INFINITE" : options[i], width / 2, buttonY[i]);
  }
  
  // Draw seed input section
  noStroke();
  fill(255);
  textSize(Math.max(18, width / 45));
  textAlign(CENTER, CENTER);
  text("LEVEL SEED", width / 2, height * 0.65);
  
  // Draw seed input box
  if (seedInput) {
    // Active state
    fill(255);
    stroke(255, 200, 100);
    strokeWeight(3);
  } else {
    // Inactive state
    fill(150, 150, 180);
    noStroke();
  }
  
  rect(width / 2 - 150, height * 0.7 - 25, 300, 50, 10);
  
  // Draw seed value or placeholder
  fill(seedInput ? 0 : 200);
  textSize(Math.max(16, width / 50));
  textAlign(CENTER, CENTER);
  text(seedValue || "Random (click to enter seed)", width / 2, height * 0.7);
  
  // Add a blinking cursor if seed input is active
  if (seedInput && frameCount % 60 < 30) {
    // Use window.textWidth or directly call p5's textWidth function
    const textWidthValue = textWidth(seedValue);
    stroke(0);
    strokeWeight(2);
    line(width / 2 + textWidthValue / 2 + 5, height * 0.7 - 15, 
         width / 2 + textWidthValue / 2 + 5, height * 0.7 + 15);
  }
  
  // Draw start button
  fill(100, 255, 150);
  noStroke();
  rect(width / 2 - 120, height * 0.82 - 35, 240, 70, 10);
  
  fill(0);
  textSize(Math.max(24, width / 30));
  text("START", width / 2, height * 0.82);
  
  // Instructions
  fill(255);
  textSize(Math.max(14, width / 60));
  text("Choose the number of lives and enter an optional seed", width / 2, height * 0.9);
  text("Using the same seed will generate the same level sequence", width / 2, height * 0.93);
}

/**
 * Draw the stats display screen
 */
function drawStatsScreen() {
  // Darkened background
  fill(0, 0, 0, 200);
  rect(0, 0, width, height);
  
  // Stats panel
  const panelWidth = Math.min(600, width * 0.8);
  const panelHeight = Math.min(400, height * 0.7);
  const panelX = width / 2 - panelWidth / 2;
  const panelY = height / 2 - panelHeight / 2;
  
  fill(40, 40, 60);
  stroke(255, 180, 100);
  strokeWeight(3);
  rect(panelX, panelY, panelWidth, panelHeight, 15);
  
  // Title
  noStroke();
  fill(255, 220, 100);
  textAlign(CENTER);
  textSize(Math.max(30, width / 20));
  text("LEVEL MILESTONE", width / 2, panelY + 50);
  
  // Stats
  fill(255);
  textAlign(LEFT);
  textSize(Math.max(20, width / 40));
  text("Levels Completed:", panelX + 50, panelY + 120);
  text("Current Score:", panelX + 50, panelY + 160);
  text("Total Coins Collected:", panelX + 50, panelY + 200);
  text("Lives Remaining:", panelX + 50, panelY + 240);
  
  // Values
  textAlign(RIGHT);
  fill(100, 255, 150);
  text(generatedLevelCount, panelX + panelWidth - 50, panelY + 120);
  text(score, panelX + panelWidth - 50, panelY + 160);
  text(totalCoinsCollected, panelX + panelWidth - 50, panelY + 200);
  text(lives, panelX + panelWidth - 50, panelY + 240);
  
  // Continue button
  fill(100, 200, 255);
  noStroke();
  rect(width / 2 - 100, panelY + panelHeight - 80, 200, 50, 10);
  
  fill(0);
  textAlign(CENTER);
  textSize(Math.max(20, width / 40));
  text("CONTINUE", width / 2, panelY + panelHeight - 55);
  
  // Quit button
  fill(255, 100, 100);
  rect(width / 2 - 100, panelY + panelHeight - 20, 200, 50, 10);
  
  fill(0);
  textSize(Math.max(20, width / 40));
  text("QUIT", width / 2, panelY + panelHeight + 5);
}

/**
 * Handle touch start
 */
export function handleTouchStarted() {
  if (gameState === "play") {
    player.attemptGravityFlip();
  } else if (gameState === "menu" || gameState === "difficulty" || gameState === "lives" || gameState === "stats") {
    // Simulate a mouse click for touch events
    handleMouseClicked();
  } else {
    initGame();
    // Over or win state - return to main menu
    gameState = "menu";
  }
  return false;
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
  levels.push(levelData);
  
  console.log(`Custom level added! Total levels: ${levels.length}`);
  return true;
}

// Add a new function to trigger the gravity flip delay
export function triggerGravityFlipDelay() {
  // Don't trigger if already in damage hitstop
  if (hitstopActive) return;
  
  // Instead of using a global delay, set the player's freeze timer directly
  // This way only the player pauses while the rest of the world continues
  if (window.player) {
    const gravityFlipFreezeFrames = 10; // Short duration in frames
    window.player.freezeTimer = gravityFlipFreezeFrames;
    window.player.isFrozen = true;
  }
}

// Function to handle the end of hitstop
function endHitstop() {
  hitstopActive = false;
  
  // Only reset player position if outside map boundaries
  const mapWidth = tileMap[0].length * tileSize;
  const mapHeight = tileMap.length * tileSize;
  
  const isOutsideMap = 
    player.x < 0 || 
    player.x > mapWidth || 
    player.y < -200 || // Allow some space above for flipped gravity
    player.y > mapHeight + 200; // Allow some space below
  
  if (isOutsideMap) {
    // Reset player position
    player.x = playerSpawnX;
    player.y = playerSpawnY;
    player.vx = 0;
    player.vy = 0;
    player.gravityDirection = 1; // Reset gravity to normal.
  } else {
    // Just reduce velocity to give player a chance to recover
    player.vx *= 0.5;
    player.vy *= 0.5;
  }
}



