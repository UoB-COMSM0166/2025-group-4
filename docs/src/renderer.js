/**
 * Renderer Module
 * Handles all drawing and rendering functions for the game
 */
import { tileSize, numCols, numRows, hudHeight } from './config.js';
import { drawTiles } from './utils.js';
import { particleSystem } from './particles.js';
import * as gameState from './gameState.js';
import { camera } from './camera.js';

/**
 * Draw the game
 * @param {number} interpolation - Interpolation factor between physics frames (0-1)
 */
export function drawGame(interpolation = 0) {
  // Draw background or clear screen
  if (gameState.state.backgroundImage) {
    image(gameState.state.backgroundImage, 0, 0, width, height);
  } else {
    background(220);
  }
  
  // Draw based on game state
  if (gameState.state.gameState === "menu") {
    // Draw the main menu first
    drawMainMenu();
    
    // If menu demo is active, draw the playable demo area
    if (gameState.state.menuDemoActive) {
      drawMenuDemo(interpolation);
    }
  } else if (gameState.state.gameState === "difficulty") {
    drawDifficultyMenu();
  } else if (gameState.state.gameState === "lives") {
    drawLivesMenu();
  } else if (gameState.state.gameState === "stats") {
    drawStatsScreen();
  } else if (gameState.state.gameState === "play" || gameState.state.gameState === "over" || gameState.state.gameState === "win") {
    drawGameScreen(interpolation);
  }
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
  
  // Draw a game logo or icon
  fill(255, 220, 0);
  textAlign(CENTER, CENTER);
  textSize(Math.max(40, width / 15));
  textStyle(NORMAL);
  text("Puppy's Magical Adventure", width / 2, height * 0.15);
  
  // Add a subtitle
  fill(200, 200, 255);
  textSize(Math.max(16, width / 40));
  text("A Gravity-Defying Adventure", width / 2, height * 0.22);
  
  // Game instructions at the bottom
  fill(255);
  textSize(Math.max(14, width / 60));
  text("Flip gravity with SPACE or touch to control the player!", width / 2, height * 0.9);
  text("Land on a difficulty option to start the game", width / 2, height * 0.95);
  
  // Draw the demo level if it's active - this will be rendered by the gameLogic module
  if (gameState.state.menuDemoActive) {
    // The actual rendering of the demo level is handled by the same draw logic
    // that renders the regular game, just with different camera settings
  }
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
 * Draw the menu demo
 * @param {number} interpolation - Interpolation factor between physics frames
 */
function drawMenuDemo(interpolation) {
  // Calculate demo area dimensions
  const demoAreaTop = height * 0.3;
  const demoAreaHeight = height * 0.55;

  // Draw border for demo area
  push();
  noFill();
  stroke(255, 220, 0, 100);
  strokeWeight(2);
  rect(0, demoAreaTop, width, demoAreaHeight);
  pop();

  // Draw semi-transparent background panel
  push();
  fill(0, 0, 0, 30);
  noStroke();
  rect(0, demoAreaTop, width, demoAreaHeight);
  pop();

  // Simplified rendering of demo map and entities
  push();
  // Move to demo area origin
  translate(0, demoAreaTop);
  
  // Center map within demo area
  const mapW = gameState.state.menuDemoMap[0].length * tileSize;
  const mapH = gameState.state.menuDemoMap.length * tileSize;
  const offsetX = (width - mapW) / 2;
  const offsetY = (demoAreaHeight - mapH) / 2;
  translate(offsetX, offsetY);

  // Temporarily disable wall images for demo to use fallback styling
  // const prevWallImage = window.currentWallImage;
  // window.currentWallImage = null;
  
  // Draw tiles
  drawTiles(gameState.state.menuDemoMap, 0);
  
  // Restore wall image
  // window.currentWallImage = prevWallImage;

  // Draw difficulty selectors
  if (gameState.state.difficultySelectors) {
    for (const sel of gameState.state.difficultySelectors) sel.draw(0);
  }

  // Draw demo player
  if (gameState.state.player) gameState.state.player.draw(0, interpolation);
  pop();

  // Add instructions above the demo area
  push();
  fill(255, 220, 0);
  textAlign(CENTER);
  textSize(Math.max(18, width / 40));
  textStyle(ITALIC);
  text("↓ Jump onto a difficulty below to start! ↓", width / 2, demoAreaTop - 15);
  pop();
}

/**
 * Draw the game screen (actual gameplay)
 * @param {number} interpolation - Interpolation factor between physics frames (0-1)
 */
function drawGameScreen(interpolation = 0) {
  // Draw background image or fallback
  if (gameState.state.backgroundImage) {
    image(gameState.state.backgroundImage, 0, 0, width, height);
  } else {
    background(220);
  }

  // Apply camera transform
  camera.apply();

  // Draw tiles
  drawTiles(gameState.state.tileMap, 0);

  // Draw coins
  for (let coin of gameState.state.coins) {
    coin.draw(0);
  }

  // Draw exit gate
  gameState.state.exitGate.draw(0);

  // Draw enemies with interpolation
  for (let enemy of gameState.state.enemies) {
    enemy.draw(0, interpolation);
  }
  
  // Draw bullets with interpolation
  if (gameState.state.bullets && gameState.state.bullets.length > 0) {
    for (let bullet of gameState.state.bullets) {
      bullet.draw(0, interpolation);
    }
  }

  // Draw floating platforms before player
  for (let platform of gameState.state.floatingPlatforms) {
    platform.draw(0, interpolation);
  }
  
  // Draw difficulty selectors if in menu demo mode
  if (gameState.state.menuDemoActive && gameState.state.difficultySelectors) {
    for (const selector of gameState.state.difficultySelectors) {
      if (selector.draw) {
        selector.draw(0);
      }
    }
  }
  
  // Draw player with invincibility effect and interpolation
  gameState.state.player.draw(0, interpolation);
  
  // Draw particles
  particleSystem.draw(0);
  
  // End camera transform
  camera.end();


  if (gameState.state.tutorialActive && gameState.state.tutorialText) {
  fill(0, 0, 0, 180);
  rect(width / 2 - 250, height / 2 - 60, 500, 120, 10);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(18);
  text(gameState.state.tutorialText, width / 2, height / 2);
  }

  
  // Draw HUD (fixed on screen, outside camera transform)
  fill(0, 0, 0, 100);
  noStroke();
  rect(0, 0, width, hudHeight);
  fill(255);
  textAlign(LEFT, CENTER);
  textSize(Math.max(16, hudHeight * 0.4)); // Scale text with HUD height
  text("Score: " + gameState.state.score, 20, hudHeight / 2);
  text("Lives: " + gameState.state.lives, 150, hudHeight / 2);
  text("Level: " + (gameState.state.levelIndex + 1) + "/" + gameState.state.levels.length, 250, hudHeight / 2);
  
  // Add time display
  let minutes = Math.floor(gameState.state.currentPlayTime / 60);
  let seconds = Math.floor(gameState.state.currentPlayTime % 60);
  // Format time, ensure seconds is always two digits
  let timeDisplay = minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  text("Time: " + timeDisplay, 400, hudHeight / 2);
  
  // Draw difficulty indicator
  let difficultyColor;
  if (gameState.state.difficulty === "easy") difficultyColor = color(100, 255, 100);
  else if (gameState.state.difficulty === "hard") difficultyColor = color(255, 100, 100);
  else if (gameState.state.difficulty === "random") difficultyColor = color(255, 180, 80); // Orange for random
  else difficultyColor = color(100, 200, 255); // Normal
  
  fill(difficultyColor);
  textAlign(RIGHT, CENTER);
  text(gameState.state.difficulty.toUpperCase(), width - 20, hudHeight / 2);

  // Game over or win screen
  if (gameState.state.gameState === "over") {
    fill(0, 0, 0, 200);
    rect(0, 0, width, height);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(Math.max(30, width / 20)); // Scale with viewport
    text("GAME OVER", width / 2, height / 2 - 40);
    textSize(Math.max(18, width / 35)); // Scale with viewport
    text("Final Score: " + gameState.state.score, width / 2, height / 2 + 20);
    text("Press SPACE to restart", width / 2, height / 2 + 60);
  } else if (gameState.state.gameState === "win") {
    fill(0, 0, 0, 200);
    rect(0, 0, width, height);
    fill(255, 220, 0);
    textAlign(CENTER, CENTER);
    textSize(Math.max(30, width / 20)); // Scale with viewport
    text("YOU WIN!", width / 2, height / 2 - 40);
    textSize(Math.max(18, width / 35)); // Scale with viewport
    text("Final Score: " + gameState.state.score, width / 2, height / 2 + 20);
    text("Press SPACE to play again", width / 2, height / 2 + 60);
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
    if (options[i] === gameState.state.selectedLives) {
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
  if (gameState.state.seedInput) {
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
  fill(gameState.state.seedInput ? 0 : 200);
  textSize(Math.max(16, width / 50));
  textAlign(CENTER, CENTER);
  text(gameState.state.seedValue || "Random (click to enter seed)", width / 2, height * 0.7);
  
  // Add a blinking cursor if seed input is active
  if (gameState.state.seedInput && frameCount % 60 < 30) {
    // Use window.textWidth or directly call p5's textWidth function
    const textWidthValue = textWidth(gameState.state.seedValue);
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
  text(gameState.state.generatedLevelCount, panelX + panelWidth - 50, panelY + 120);
  text(gameState.state.score, panelX + panelWidth - 50, panelY + 160);
  text(gameState.state.totalCoinsCollected, panelX + panelWidth - 50, panelY + 200);
  text(gameState.state.lives, panelX + panelWidth - 50, panelY + 240);
  
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