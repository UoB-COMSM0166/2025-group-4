/****************************************
  p5.js "Way of the Dodo" - Prototype
****************************************/

let tileSize = 32; // pixel size of each tile
let numCols = 20; // visible columns on screen
let numRows = 15; // visible rows on screen
let levelIndex = 0; // which level the player is on
let levels = []; // we store level data here
let gravity = 0.5; // downward acceleration
let jumpForce = 10; // how strong a jump is
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
let lives = 3; // number of lives
let playerSpawnX = 0; // where the player starts (X)
let playerSpawnY = 0; // where the player starts (Y)
let enemies = []; // store enemies

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
      "1..................1",
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
    // Store the auto-run direction: -1 (left) or 1 (right)
    this.autoDirection = random() < 0.5 ? -1 : 1;
    this.autoSpeed = 4.0; // Speed for auto-run
  }

  update() {
    // Apply gravity.
    this.vy += gravity;

    // If on ground, apply friction and if nearly stopped, auto-run.
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
    this.onGround = false;
    this.checkTileCollisions(false);

    // Check if fallen off the map (loss of life).
    if (this.y > tileMap.length * tileSize + 200) {
      loseLife();
      return;
    }

    // Check collisions with spike tiles (5).
    this.checkHazards();

    // Update camera (ensuring it never goes negative).
    cameraOffsetX = this.x - width * 0.3;
    if (cameraOffsetX < 0) cameraOffsetX = 0;
  }

  // Collision checking:
  // When checking horizontal movement, if a collision is detected,
  // we reverse autoDirection so that the player will try to move the other way.
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
      // Vertical collision
      let leftCol = floor((this.x - halfW) / tileSize);
      let rightCol = floor((this.x + halfW) / tileSize);
      if (this.vy > 0) {
        // Falling: check the bottom edge.
        let bottomRow = floor((this.y + halfH) / tileSize);
        for (let col = leftCol; col <= rightCol; col++) {
          if (getTile(col, bottomRow) === 1) {
            this.y = bottomRow * tileSize - halfH;
            this.vy = 0;
            this.onGround = true;
            break;
          }
        }
      } else if (this.vy < 0) {
        // Moving up: check the top edge.
        let topRow = floor((this.y - halfH) / tileSize);
        for (let col = leftCol; col <= rightCol; col++) {
          if (getTile(col, topRow) === 1) {
            this.y = (topRow + 1) * tileSize + halfH;
            this.vy = 0;
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
          // Player hit a spike
          loseLife();
          return;
        }
      }
    }
  }

  jump() {
    // You can optionally require onGround check, but here it's always allowed:
    // if (this.onGround) { ... }
    this.vy = -jumpForce;
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
    // Patrol movement:
    // We'll assume each enemy just moves left & right between two boundaries.
    // You can hardcode or randomize. For demonstration:
    this.minX = px - tileSize * 3;
    this.maxX = px + tileSize * 3;
    this.speed = 2;
    this.direction = 1; // 1 = move right, -1 = move left
  }

  update() {
    // Move horizontally between minX and maxX
    this.x += this.speed * this.direction;
    if (this.x < this.minX) {
      this.x = this.minX;
      this.direction = 1;
    } else if (this.x > this.maxX) {
      this.x = this.maxX;
      this.direction = -1;
    }

    // Check collision with player
    this.checkPlayerCollision(player);
  }

  checkPlayerCollision(pl) {
    let overlapX = abs(pl.x - this.x) < pl.w * 0.5 + this.w * 0.5;
    let overlapY = abs(pl.y - this.y) < pl.h * 0.5 + this.h * 0.5;
    if (overlapX && overlapY) {
      // Player touched enemy
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
      // player collects coin
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
    // if player is close enough, trigger next level
    let dx = abs(pl.x - this.x);
    let dy = abs(pl.y - this.y);
    if (dx < this.w * 0.5 && dy < this.h * 0.5) {
      // next level
      levelIndex++;
      if (levelIndex >= levels.length) {
        // you finished all levels!
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
  // If you have assets, load them here
}

function setup() {
  createCanvas(numCols * tileSize, numRows * tileSize + hudHeight);
  setupLevels();
  loadLevel(levelIndex);
  backgroundColor = color(100, 150, 255);
  textAlign(CENTER, CENTER);
}

function draw() {
  // background gradient
  setGradient(backgroundColor, color(50, 100, 200));

  if (gameState === "play") {
    // Update player and enemies
    player.update();
    for (let e of enemies) {
      e.update();
    }

    // Check coins
    for (let c of coins) {
      if (!c.collected) {
        c.checkCollision(player);
      }
    }

    // Check exit
    exitGate.checkPlayer(player);

    // Draw everything
    drawTiles();
    for (let c of coins) c.draw();
    exitGate.draw();
    for (let e of enemies) e.draw();
    player.draw();

    // Draw HUD
    fill(0, 150);
    noStroke();
    rect(0, 0, width, hudHeight);
    fill(255);
    textSize(20);
    text(`Score: ${score}   Lives: ${lives}`, width * 0.5, hudHeight * 0.5);
  } else if (gameState === "win") {
    fill(0, 150);
    rect(0, 0, width, height);
    fill(255);
    textSize(30);
    text("YOU WIN!  Press R to restart", width / 2, height / 2);
  } else if (gameState === "over") {
    fill(0, 150);
    rect(0, 0, width, height);
    fill(255);
    textSize(30);
    text("GAME OVER!  Press R to restart", width / 2, height / 2);
  }
}

// Single-button input
function keyPressed() {
  if (key === " " && gameState === "play") {
    player.jump();
  }
  if (key === "r" || key === "R") {
    if (gameState !== "play") {
      // Reset everything
      levelIndex = 0;
      score = 0;
      lives = 3;
      gameState = "play";
      loadLevel(levelIndex);
    }
  }
}

// So that mobile/touch can also jump
function touchStarted() {
  if (gameState === "play") {
    player.jump();
  }
}

/*********************************************
  loadLevel and utility functions
*********************************************/
function loadLevel(idx) {
  if (idx < 0 || idx >= levels.length) return;
  tileMap = levels[idx].map.slice();
  coins = [];
  enemies = [];
  exitGate = null;
  let foundPlayer = false;

  // Read tile map rows
  for (let row = 0; row < tileMap.length; row++) {
    for (let col = 0; col < tileMap[row].length; col++) {
      let ch = tileMap[row].charAt(col);
      if (ch === "3") {
        // Player start
        foundPlayer = true;
        playerSpawnX = col * tileSize + tileSize / 2;
        playerSpawnY = row * tileSize + tileSize / 2;
      }
    }
  }

  // If no player start found, place them at 2,2 fallback
  if (!foundPlayer) {
    playerSpawnX = tileSize * 2;
    playerSpawnY = tileSize * 2;
  }

  // Create player at the spawn
  player = new Player(playerSpawnX, playerSpawnY);

  // Now parse again for coins, exit, enemies, etc.
  for (let row = 0; row < tileMap.length; row++) {
    for (let col = 0; col < tileMap[row].length; col++) {
      let ch = tileMap[row].charAt(col);
      if (ch === "2") {
        coins.push(
          new Coin(col * tileSize + tileSize / 2, row * tileSize + tileSize / 2)
        );
      } else if (ch === "4") {
        exitGate = new ExitGate(
          col * tileSize + tileSize / 2,
          row * tileSize + tileSize / 2
        );
      } else if (ch === "E" || ch === "e") {
        enemies.push(
          new Enemy(
            col * tileSize + tileSize / 2,
            row * tileSize + tileSize / 2
          )
        );
      }
    }
  }

  // Fallback if no exit found
  if (!exitGate) {
    exitGate = new ExitGate(tileSize * 8, tileSize * 2);
  }
}

// Returns tile code (0,1,5 for hazard) from row/col
function getTile(col, row) {
  if (row < 0 || row >= tileMap.length) return 1; // solid out-of-bounds
  let rowStr = tileMap[row];
  if (col < 0 || col >= rowStr.length) return 1; // solid boundary

  let ch = rowStr.charAt(col);
  // interpret
  if (ch === "1") return 1; // ground
  if (ch === "5") return 5; // spike/hazard
  return 0; // otherwise empty
}

// Draw the tile map
function drawTiles() {
  let startCol = floor(cameraOffsetX / tileSize);
  let endCol = startCol + ceil(width / tileSize) + 1;

  for (let row = 0; row < tileMap.length; row++) {
    let rowStr = tileMap[row];
    for (let col = startCol; col < endCol; col++) {
      if (col < 0 || col >= rowStr.length) continue;
      let ch = rowStr.charAt(col);
      if (ch === "1") {
        // Ground block
        fill(100, 100, 100);
        noStroke();
        rect(
          col * tileSize - cameraOffsetX,
          row * tileSize,
          tileSize,
          tileSize
        );
      } else if (ch === "5") {
        // Spike
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

// Lose a life, reset or end game
function loseLife() {
  lives--;
  if (lives <= 0) {
    gameState = "over";
  } else {
    // Reload current level, reset player to spawn
    loadLevel(levelIndex);
  }
}

// Background gradient
function setGradient(c1, c2) {
  for (let y = 0; y < height; y++) {
    let lerpAmt = y / height;
    let c = lerpColor(c1, c2, lerpAmt);
    stroke(c);
    line(0, y, width, y);
  }
}
