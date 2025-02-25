/****************************************
  p5.js "Way of the Dodo" - Prototype
  (Gravity-flip experiment with input buffering)
****************************************/

let tileSize = 32; // pixel size of each tile
let numCols = 20; // visible columns on screen
let numRows = 15; // visible rows on screen
let levelIndex = 0; // which level the player is on
let levels = []; // we store level data here
let gravity = 0.5; // base gravity magnitude
let maxSpeedX = 8; // horizontal speed limit
let player; // reference to the player
let coins = []; // coin objects
let exitGate; // exit object
let tileMap; // holds the current level data
let cameraOffsetX = 0; // for scrolling horizontally
let hudHeight = 50; // space at top for HUD
let score = 0; // player's score
let backgroundColor; // for background gradient
let gameState = "play"; // can be "play", "win", or "over"
let lives = 99; // number of lives
let playerSpawnX = 0; // where the player starts (X)
let playerSpawnY = 0; // where the player starts (Y)
let enemies = []; // store enemies

/****************************************
  Buffering Settings for Gravity Flip
****************************************/
// When false (the default) disallows midair flips but buffers input
// only for a short period (pre-surface buffering). When true, any flip key
// pressed in the air is buffered for a longer duration.
let allowBufferedFlipWhileAir = false;

// Duration for which a flip input is buffered if midair buffering is enabled.
let airBufferDuration = 300; // in milliseconds

// Duration for which a flip input is buffered if midair buffering is disabled.
// (This is the “pre-surface” window; if the player lands within this time after
// pressing the flip key, the buffered flip will execute.)
let preSurfaceBufferDuration = 150; // in milliseconds

/*********************************************
  Basic tile-based levels
  0 = empty
  1 = solid ground
  2 = coin
  3 = player start
  4 = exit gate
  5 = spike (hazard)
  E = enemy
*********************************************/
function setupLevels() {
  // Original small levels:
  levels.push({
    map: [
      "1111111111111111111",
      "1...............4..1", // exit is '4'
      "1..................1",
      "1........222.......1", // coins are '2'
      "1..................1",
      "1..3...............1", // player start is '3'
      "1..................1",
      "1..........11111...1",
      "1..................1",
      "1..................1",
      "1111111111111111111",
    ],
  });

  levels.push({
    map: [
      "1111111111111111",
      "14............11",
      "1.......2......1",
      "1..............1",
      "1..3...........1",
      "1........2.....1",
      "1..............1",
      "1111111111111111",
    ],
  });

  // New example level with spikes (5) and enemy (E):
  levels.push({
    map: [
      "111111111111111111111",
      "1..........2......4.1",
      "1...5.......E........",
      "1..........222.......",
      "1...................1",
      "1..3.............5..1",
      "1...................1",
      "1.........E.........1",
      "1...................1",
      "111111111111111111111",
    ],
  });
  
  // New example level with shooter enemy (E):
  levels.push({
  map: [
    "111111111111111111111",
    "1..................41",
    "1..5................1",
    "1..........222......1",
    "1...................1",
    "1..3.......E.......51",
    "1...................1",
    "1...................1",
    "1...................1",
    "111111111111111111111",
  ],
}); 
levels.push({
  map: [
    "111111111111111111111",
    "1....2.............41",
    "1.111.1111111.11111.1",
    "1...1....5...1.....E1",
    "111.1.111.1.111.11111",
    "1.3.1...1.1.....1...1",
    "1.1.111.1.11111.1.111",
    "1.1...1.1.....1.1...1",
    "1.111.1.11111.1.11111",
    "1.....1.....1.......1",
    "111111111111111111111",
  ],
});
}

class ShooterEnemy {
  constructor(px, py) {
    this.x = px;
    this.y = py;
    this.w = tileSize * 0.8;
    this.h = tileSize * 0.9;
    this.shootCooldown = 2000; // 每 2 秒射击一次
    this.lastShotTime = millis();
  }

  update() {
    // 检测是否到达射击时间
    if (millis() - this.lastShotTime > this.shootCooldown) {
      this.shoot();
      this.lastShotTime = millis();
    }
  }

  shoot() {
    let bulletSpeed = 5; // 子弹的速度
    let direction = player.x > this.x ? 1 : -1; // 确定子弹方向
    bullets.push(new Bullet(this.x, this.y, bulletSpeed * direction));
  }

  draw() {
    push();
    translate(this.x - cameraOffsetX, this.y);
    fill(150, 0, 0);
    rectMode(CENTER);
    rect(0, 0, this.w, this.h);
    pop();
  }
}


class Bullet {
  constructor(px, py, speed) {
    this.x = px;
    this.y = py;
    this.speed = speed;
    this.r = tileSize * 0.3; // 子弹半径
    this.active = true; // 是否还存在
  }

  update() {
    this.x += this.speed; // 让子弹向前移动

    // 如果子弹超出屏幕范围，则销毁
    if (this.x < 0 || this.x > width + tileSize) {
      this.active = false;
    }

    // 检测子弹是否碰到玩家
    if (dist(this.x, this.y, player.x, player.y) < this.r + player.w * 0.5) {
      this.active = false;
      loseLife(); // 减少生命值
    }
  }

  draw() {
    if (!this.active) return;
    push();
    translate(this.x - cameraOffsetX, this.y);
    fill(255, 0, 0);
    ellipse(0, 0, this.r * 2);
    pop();
  }
}


/*********************************************
  Class: Player
*********************************************/
class Player {
  constructor(px, py) {
    this.x = px;
    this.y = py;
    this.vx = 0;
    this.vy = 0;
    this.w = tileSize * 0.6;
    this.h = tileSize * 0.9;
    this.onGround = false;
    // Auto-run direction: -1 (left) or 1 (right)
    this.autoDirection = random() < 0.5 ? -1 : 1;
    this.autoSpeed = 4.0;
    // Gravity direction: 1 = normal (downward), -1 = flipped (upward)
    this.gravityDirection = 1;
    // For buffering the flip input:
    this.flipBufferTimestamp = 0;
    this.bufferedFlipAvailable = false;
  }

  update() {
    // Apply gravity.
    this.vy += gravity * this.gravityDirection;

    // If on a surface, apply friction and auto-run.
    if (this.onGround) {
      if (abs(this.vx) < 0.05) {
        this.vx = this.autoDirection * this.autoSpeed;
      }
    }

    // Clamp horizontal speed.
    if (this.vx > maxSpeedX) this.vx = maxSpeedX;
    if (this.vx < -maxSpeedX) this.vx = -maxSpeedX;

    // Move horizontally and resolve collisions.
    this.x += this.vx;
    this.checkTileCollisions(true);

    // Move vertically and resolve collisions.
    this.y += this.vy;
    // Reset onGround before checking vertical collisions.
    this.onGround = false;
    this.checkTileCollisions(false);

    // Check for a buffered flip input.
    if (this.bufferedFlipAvailable) {
      let bufferDuration = allowBufferedFlipWhileAir
        ? airBufferDuration
        : preSurfaceBufferDuration;
      if (millis() - this.flipBufferTimestamp > bufferDuration) {
        // Buffer expired.
        this.bufferedFlipAvailable = false;
      } else if (this.onGround) {
        // Player just landed and a buffered flip is available.
        this.performGravityFlip();
        this.bufferedFlipAvailable = false;
      }
    }

    // Check if the player has fallen off the map.
    if (
      (this.gravityDirection === 1 &&
        this.y > tileMap.length * tileSize + 200) ||
      (this.gravityDirection === -1 && this.y < -200)
    ) {
      loseLife();
      return;
    }

    // Check collisions with hazards (spike tiles).
    this.checkHazards();

    // Update camera (ensuring it never goes negative).
    cameraOffsetX = this.x - width * 0.3;
    if (cameraOffsetX < 0) cameraOffsetX = 0;
  }

  // Collision checking (horizontal and vertical remain unchanged).
  checkTileCollisions(isX) {
    let halfW = this.w * 0.5;
    let halfH = this.h * 0.5;
    if (isX) {
      let epsilon = 1;
      let topRow = floor((this.y - halfH) / tileSize);
      let bottomRow = floor((this.y + halfH - epsilon) / tileSize);

      if (this.vx > 0) {
        // Moving right: check the right edge.
        let rightCol = floor((this.x + halfW) / tileSize);
        for (let row = topRow; row <= bottomRow; row++) {
          if (getTile(rightCol, row) === 1) {
            // Place the player flush with the tile and reverse direction.
            this.x = rightCol * tileSize - halfW;
            this.vx = 0;
            this.autoDirection = -1;
            break;
          }
        }
      } else if (this.vx < 0) {
        // Moving left: check the left edge.
        let leftCol = floor((this.x - halfW) / tileSize);
        for (let row = topRow; row <= bottomRow; row++) {
          if (getTile(leftCol, row) === 1) {
            this.x = (leftCol + 1) * tileSize + halfW;
            this.vx = 0;
            this.autoDirection = 1;
            break;
          }
        }
      }
    } else {
      // Vertical collision.
      let leftCol = floor((this.x - halfW) / tileSize);
      let rightCol = floor((this.x + halfW) / tileSize);
      if (this.vy > 0) {
        // Falling: check the bottom edge.
        let bottomRow = floor((this.y + halfH) / tileSize);
        for (let col = leftCol; col <= rightCol; col++) {
          if (getTile(col, bottomRow) === 1) {
            this.y = bottomRow * tileSize - halfH;
            this.vy = 0;
            if (this.gravityDirection === 1) {
              this.onGround = true;
            }
            break;
          }
        }
      } else if (this.vy < 0) {
        // Rising (when gravity is flipped): check the top edge.
        let topRow = floor((this.y - halfH) / tileSize);
        for (let col = leftCol; col <= rightCol; col++) {
          if (getTile(col, topRow) === 1) {
            this.y = (topRow + 1) * tileSize + halfH;
            this.vy = 0;
            if (this.gravityDirection === -1) {
              this.onGround = true;
            }
            break;
          }
        }
      }
    }
  }

  // Check collisions with hazard tiles (5).
  checkHazards() {
    let halfW = this.w * 0.5;
    let halfH = this.h * 0.5;

    // Calculate the tile coordinates the player covers.
    let leftCol = floor((this.x - halfW) / tileSize);
    let rightCol = floor((this.x + halfW) / tileSize);
    let topRow = floor((this.y - halfH) / tileSize);
    let bottomRow = floor((this.y + halfH) / tileSize);

    for (let row = topRow; row <= bottomRow; row++) {
      for (let col = leftCol; col <= rightCol; col++) {
        if (getTile(col, row) === 5) {
          // Player hit a spike.
          loseLife();
          return;
        }
      }
    }
  }

  // Called when the flip key is pressed.
  // If on a surface, the flip executes immediately.
  // Otherwise, the input is buffered.
  flipGravity() {
    if (this.onGround) {
      this.performGravityFlip();
    } else {
      this.bufferedFlipAvailable = true;
      this.flipBufferTimestamp = millis();
    }
  }

  // Immediately flips the gravity.
  performGravityFlip() {
    this.gravityDirection *= -1;
    this.vy = 0;
    this.onGround = false;
  }

  draw() {
    push();
    translate(this.x - cameraOffsetX, this.y);
    fill(255, 200, 50);
    noStroke();
    rectMode(CENTER);
    rect(0, 0, this.w, this.h);
    pop();
  }
}

/*********************************************
  Class: Enemy
*********************************************/
class Enemy {
  constructor(px, py) {
    this.x = px;
    this.y = py;
    this.w = tileSize * 0.6;
    this.h = tileSize * 0.9;
    // Patrol movement boundaries.
    this.minX = px - tileSize * 3;
    this.maxX = px + tileSize * 3;
    this.speed = 2;
    this.direction = 1; // 1 = right, -1 = left
  }

  update() {
    // Move horizontally between minX and maxX.
    this.x += this.speed * this.direction;
    if (this.x < this.minX) {
      this.x = this.minX;
      this.direction = 1;
    } else if (this.x > this.maxX) {
      this.x = this.maxX;
      this.direction = -1;
    }

    // Check collision with the player.
    this.checkPlayerCollision(player);
  }

  checkPlayerCollision(pl) {
    let overlapX = abs(pl.x - this.x) < pl.w * 0.5 + this.w * 0.5;
    let overlapY = abs(pl.y - this.y) < pl.h * 0.5 + this.h * 0.5;
    if (overlapX && overlapY) {
      // Player touched enemy.
      loseLife();
    }
  }

  draw() {
    push();
    translate(this.x - cameraOffsetX, this.y);
    fill(255, 0, 0);
    noStroke();
    rectMode(CENTER);
    rect(0, 0, this.w, this.h);
    pop();
  }
}

/*********************************************
  Class: Coin
*********************************************/
class Coin {
  constructor(px, py) {
    this.x = px;
    this.y = py;
    this.r = tileSize * 0.4;
    this.collected = false;
  }

  checkCollision(pl) {
    if (dist(pl.x, pl.y, this.x, this.y) < this.r + pl.w * 0.3) {
      // Player collects coin.
      this.collected = true;
      score++;
    }
  }

  draw() {
    if (this.collected) return;
    push();
    translate(this.x - cameraOffsetX, this.y);
    fill(255, 215, 0);
    ellipse(0, 0, this.r * 2);
    pop();
  }
}

/*********************************************
  Class: ExitGate
*********************************************/
class ExitGate {
  constructor(px, py) {
    this.x = px;
    this.y = py;
    this.w = tileSize;
    this.h = tileSize * 1.5;
  }

  checkPlayer(pl) {
    // If the player is close enough, trigger the next level.
    let dx = abs(pl.x - this.x);
    let dy = abs(pl.y - this.y);
    if (dx < this.w * 0.5 && dy < this.h * 0.5) {
      // Proceed to the next level.
      levelIndex++;
      if (levelIndex >= levels.length) {
        // All levels completed!
        gameState = "win";
      } else {
        loadLevel(levelIndex);
      }
    }
  }

  draw() {
    push();
    translate(this.x - cameraOffsetX, this.y);
    fill(100, 255, 100);
    rectMode(CENTER);
    rect(0, 0, this.w, this.h);
    pop();
  }
}

/*********************************************
  p5.js setup and draw
*********************************************/
function preload() {
  // Load assets here if needed.
}

function setup() {
  createCanvas(numCols * tileSize, numRows * tileSize + hudHeight);
  setupLevels();
  loadLevel(levelIndex);
  backgroundColor = color(100, 150, 255);
  textAlign(CENTER, CENTER);
}

function draw() {
  setGradient(backgroundColor, color(50, 100, 200));

  if (gameState === "play") {
    player.update();
    for (let e of enemies) {
      e.update();
    }
    for (let c of coins) {
      if (!c.collected) {
        c.checkCollision(player);
      }
    }
    for (let b of bullets) {
      b.update();
    }
    exitGate.checkPlayer(player);

    drawTiles();
    for (let c of coins) c.draw();
    exitGate.draw();
    for (let e of enemies) e.draw();
    for (let b of bullets) b.draw();
    player.draw();

    // 🔹 HUD 信息栏，增加 "Level"
    fill(0, 150);
    noStroke();
    rect(0, 0, width, hudHeight);
    fill(255);
    textSize(20);
    text(
      `Level: ${levelIndex + 1}   Score: ${score}   Lives: ${lives}`,
      width * 0.5,
      hudHeight * 0.5
    );

  } else if (gameState === "win") {
    fill(0, 150);
    rect(0, 0, width, height);
    fill(255);
    textSize(30);
    text("YOU WIN! Press R to restart", width / 2, height / 2);
    
    // 🔹 添加最终得分显示
    textSize(20);
    text(`Final Score: ${score}`, width / 2, height / 2 + 40);

  } else if (gameState === "over") {
    fill(0, 150);
    rect(0, 0, width, height);
    fill(255);
    textSize(30);
    text("GAME OVER! Press R to restart", width / 2, height / 2);

    // 🔹 添加最终得分显示
    textSize(20);
    text(`Final Score: ${score}`, width / 2, height / 2 + 40);
  }
}




// Single-button input.
// Pressing the spacebar now attempts to flip gravity.
function keyPressed() {
  if (key === " " && gameState === "play") {
    player.flipGravity();
  }
  if (key === "r" || key === "R") {
    if (gameState !== "play") {
      // Reset the game.
      levelIndex = 0;
      score = 0;
      lives = 3;
      gameState = "play";
      loadLevel(levelIndex);
    }
  }
}

// Allow touch input to flip gravity.
function touchStarted() {
  if (gameState === "play") {
    player.flipGravity();
  }
}

/*********************************************
  loadLevel and utility functions
*********************************************/
function loadLevel(idx) {
  if (idx < 0 || idx >= levels.length) return;
  
  // 如果通关后 && 得分 >= 10，加载隐藏关卡
  if (idx === levels.length - 1 && score < 10) {
    gameState = "win"; // 如果得分不够，则结束游戏
    return;
  }

  tileMap = levels[idx].map.slice();
  coins = [];
  enemies = [];
  bullets = [];
  exitGate = null;
  let foundPlayer = false;

  for (let row = 0; row < tileMap.length; row++) {
    for (let col = 0; col < tileMap[row].length; col++) {
      let ch = tileMap[row].charAt(col);
      if (ch === "3") {
        foundPlayer = true;
        playerSpawnX = col * tileSize + tileSize / 2;
        playerSpawnY = row * tileSize + tileSize / 2;
      }
    }
  }

  if (!foundPlayer) {
    playerSpawnX = tileSize * 2;
    playerSpawnY = tileSize * 2;
  }
  player = new Player(playerSpawnX, playerSpawnY);

  for (let row = 0; row < tileMap.length; row++) {
    for (let col = 0; col < tileMap[row].length; col++) {
      let ch = tileMap[row].charAt(col);
      if (ch === "2") {
        coins.push(new Coin(col * tileSize + tileSize / 2, row * tileSize + tileSize / 2));
      } else if (ch === "4") {
        exitGate = new ExitGate(col * tileSize + tileSize / 2, row * tileSize + tileSize / 2);
      } else if (ch === "E") {
        // 在隐藏关卡，部分 `E` 变成射击敌人
        if (idx === 3 || idx === levels.length - 1) {
          enemies.push(new ShooterEnemy(col * tileSize + tileSize / 2, row * tileSize + tileSize / 2));
        } else {
          enemies.push(new Enemy(col * tileSize + tileSize / 2, row * tileSize + tileSize / 2));
        }
      }
    }
  }
}


  // 确保 `exitGate` 存在
  if (!exitGate) {
    exitGate = new ExitGate(tileSize * 8, tileSize * 2);
  
}




// Returns the tile code (1 for solid, 5 for hazard) at the given row/col.
function getTile(col, row) {
  if (row < 0 || row >= tileMap.length) return 1; // out-of-bounds is solid.
  let rowStr = tileMap[row];
  if (col < 0 || col >= rowStr.length) return 1; // out-of-bounds is solid.

  let ch = rowStr.charAt(col);
  if (ch === "1") return 1; // ground.
  if (ch === "5") return 5; // spike/hazard.
  return 0; // otherwise empty.
}

// Draw the tile map.
function drawTiles() {
  let startCol = floor(cameraOffsetX / tileSize);
  let endCol = startCol + ceil(width / tileSize) + 1;

  for (let row = 0; row < tileMap.length; row++) {
    let rowStr = tileMap[row];
    for (let col = startCol; col < endCol; col++) {
      if (col < 0 || col >= rowStr.length) continue;
      let ch = rowStr.charAt(col);
      if (ch === "1") {
        // Ground block.
        fill(100, 100, 100);
        noStroke();
        rect(
          col * tileSize - cameraOffsetX,
          row * tileSize,
          tileSize,
          tileSize
        );
      } else if (ch === "5") {
        // Spike.
        fill(150, 50, 50);
        noStroke();
        rect(
          col * tileSize - cameraOffsetX,
          row * tileSize,
          tileSize,
          tileSize
        );
      }
    }
  }
}

// Lose a life and either reset the level or end the game.
function loseLife() {
  lives--;
  if (lives <= 0) {
    gameState = "over";
  } else {
    // Reload the current level and reset the player's position.
    loadLevel(levelIndex);
  }
}

// Draw a vertical background gradient.
function setGradient(c1, c2) {
  for (let y = 0; y < height; y++) {
    let lerpAmt = y / height;
    let c = lerpColor(c1, c2, lerpAmt);
    stroke(c);
    line(0, y, width, y);
  }
}