/**
 * Input Handler Module
 * Handles all user input for the game
 */
import * as gameState from './gameState.js';
import { initGame } from './gameState.js';
import { tileSize } from './config.js';
import { particleSystem } from './particles.js';
import { camera } from './camera.js';

/**
 * Handle key press events
 */
export function handleKeyPressed() {
  if (gameState.state.gameState === "menu" && gameState.state.menuDemoActive) {
    // Handle menu demo input
    if (keyCode === 32) { // Space key
      flipGravityInMenuDemo();
    }
    return;
  }
  
  if (gameState.state.gameState === "play") {
    // If game is in play state, handle player controls
    if (keyCode === 32) { // Space key
      if (gameState.state.player) {
        gameState.state.player.attemptGravityFlip();
      }
    }
  } else if (gameState.state.gameState === "over" || gameState.state.gameState === "win") {
    // If game is over or won, restart on space
    if (keyCode === 32) {
      initGame();
    }
  } else if (gameState.state.gameState === "difficulty") {
    // Handle difficulty selection
    if (keyCode === 49) { // 1 key for Easy
      gameState.setDifficulty("easy");
    } else if (keyCode === 50) { // 2 key for Normal
      gameState.setDifficulty("normal");
    } else if (keyCode === 51) { // 3 key for Hard
      gameState.setDifficulty("hard");
    }
  } else if (gameState.state.gameState === "lives") {
    // Handle lives selection in generated mode
    handleLivesMenuKeyPressed();
  } else if (gameState.state.gameState === "stats") {
    // Press any key to continue from stats screen
    gameState.setStatsDisplayActive(false);
    gameState.setGameState("play");
  }
}

/**
 * Handle mouse click events
 */
export function handleMouseClicked() {
  if (gameState.state.gameState === "menu") {
    // Check if this is a click within the demo area
    if (gameState.state.menuDemoActive) {
      // Demo is already active, handle menu demo clicks (e.g. flip gravity)
      flipGravityInMenuDemo();
      return;
    }
    
    // Regular menu buttons are no longer needed as we're using the demo
    // instead for difficulty selection
  } else if (gameState.state.gameState === "difficulty") {
    handleDifficultyMenuClick();
  } else if (gameState.state.gameState === "lives") {
    handleLivesMenuClick();
  } else if (gameState.state.gameState === "stats") {
    handleStatsScreenClick();
  } else if (gameState.state.gameState === "over" || gameState.state.gameState === "win") {
    initGame();
  }
}

/**
 * Handle touch events for mobile
 */
export function handleTouchStarted() {
  if (gameState.state.gameState === "menu" && gameState.state.menuDemoActive) {
    // Handle menu demo touch
    flipGravityInMenuDemo();
    return;
  }
  
  if (gameState.state.gameState === "play") {
    // If game is in play state, attempt to flip gravity
    if (gameState.state.player) {
      gameState.state.player.attemptGravityFlip();
    }
  } else {
    // For all other states, treat touches the same as clicks
    handleMouseClicked();
  }
}

/**
 * Flip gravity in the menu demo
 */
function flipGravityInMenuDemo() {
  if (!gameState.state.player) return;
  
  console.log("Attempting to flip gravity in menu demo");
  
  // Force gravity flip in menu demo regardless of whether player is on a surface
  gameState.state.player.gravityDirection *= -1;
  console.log("Gravity flipped to:", gameState.state.player.gravityDirection);
  
  // Play regravity sound if available
  if (window.regravitySound) {
    window.regravitySound.play();
  }
  
  // Create gravity flip particles
  particleSystem.createGravityFlip(
    gameState.state.player.x,
    gameState.state.player.y,
    gameState.state.player.w,
    gameState.state.player.gravityDirection
  );
  
  // Apply a small upward impulse in the direction of the new gravity
  gameState.state.player.vy = gameState.state.player.gravityDirection * -4;
  
  // Small camera shake
  camera.addTrauma(0.3);
}

// Helper functions for the different menu screens
function handleDifficultyMenuClick() {
  const buttonWidth = 300;
  const buttonHeight = 80;
  
  // Easy button
  if (mouseX > width / 2 - buttonWidth/2 && mouseX < width / 2 + buttonWidth/2 &&
      mouseY > height * 0.4 - buttonHeight/2 && mouseY < height * 0.4 + buttonHeight/2) {
    gameState.setDifficulty("easy");
  }
  
  // Normal button
  if (mouseX > width / 2 - buttonWidth/2 && mouseX < width / 2 + buttonWidth/2 &&
      mouseY > height * 0.55 - buttonHeight/2 && mouseY < height * 0.55 + buttonHeight/2) {
    gameState.setDifficulty("normal");
  }
  
  // Hard button
  if (mouseX > width / 2 - buttonWidth/2 && mouseX < width / 2 + buttonWidth/2 &&
      mouseY > height * 0.7 - buttonHeight/2 && mouseY < height * 0.7 + buttonHeight/2) {
    gameState.setDifficulty("hard");
  }
}

function handleLivesMenuClick() {
  // Check lives option buttons
  const options = [3, 5, 10, 99];
  const buttonY = [height * 0.30, height * 0.38, height * 0.46, height * 0.54];
  
  for (let i = 0; i < options.length; i++) {
    if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100 &&
        mouseY > buttonY[i] - 30 && mouseY < buttonY[i] + 30) {
      gameState.setSelectedLives(options[i]);
    }
  }
  
  // Check seed input box
  if (mouseX > width / 2 - 150 && mouseX < width / 2 + 150 &&
      mouseY > height * 0.7 - 25 && mouseY < height * 0.7 + 25) {
    gameState.setSeedInput(true);
  } else {
    gameState.setSeedInput(false);
  }
  
  // Check start button
  if (mouseX > width / 2 - 120 && mouseX < width / 2 + 120 &&
      mouseY > height * 0.82 - 35 && mouseY < height * 0.82 + 35) {
    // Handle starting the game with the selected options
    // gameState.state.lives = gameState.state.selectedLives; // Lives are set by startGeneratedMode or updateGameParametersForDifficulty
    // gameState.setGeneratedMode(true); // This is handled by startGeneratedMode
    // gameState.setGameState("play"); // This is handled by startGeneratedMode
    
    // Initialize game time - this is also handled by startGeneratedMode now
    // gameState.state.gameStartTime = millis();
    // gameState.state.currentPlayTime = 0;
    
    // Start the game with the first level or generated level
    import('./levelManager.js').then(levelManager => {
      // When starting from the lives menu, it's always for generated mode,
      // and not from the demo selector.
      levelManager.startGeneratedMode(false); 
    });
  }
}

function handleLivesMenuKeyPressed() {
  if (gameState.state.seedInput) {
    // Handle keyboard input for seed value
    if (keyCode === 8) { // Backspace
      gameState.setSeedValue(gameState.state.seedValue.slice(0, -1));
    } else if (keyCode === 13) { // Enter
      gameState.setSeedInput(false);
    } else if ((keyCode >= 48 && keyCode <= 57) || // Numbers
               (keyCode >= 65 && keyCode <= 90) || // Letters
               (keyCode >= 97 && keyCode <= 122)) { // Letters
      // Add the character if within reasonable length
      if (gameState.state.seedValue.length < 20) {
        gameState.setSeedValue(gameState.state.seedValue + key);
      }
    }
  } else {
    // If not editing seed, allow selection with number keys
    if (keyCode === 49) { // 1 for 3 lives
      gameState.setSelectedLives(3);
    } else if (keyCode === 50) { // 2 for 5 lives
      gameState.setSelectedLives(5);
    } else if (keyCode === 51) { // 3 for 10 lives
      gameState.setSelectedLives(10);
    } else if (keyCode === 52) { // 4 for infinite lives
      gameState.setSelectedLives(99);
    } else if (keyCode === 13) { // Enter to start
      // Same as clicking start button
      // gameState.state.lives = gameState.state.selectedLives; // Handled by startGeneratedMode
      // gameState.setGeneratedMode(true); // Handled by startGeneratedMode
      // gameState.setGameState("play"); // Handled by startGeneratedMode
      
      import('./levelManager.js').then(levelManager => {
        // When starting from the lives menu (via Enter), it's for generated mode,
        // and not from the demo selector.
        levelManager.startGeneratedMode(false);
      });
    }
  }
}

function handleStatsScreenClick() {
  const panelWidth = Math.min(600, width * 0.8);
  const panelHeight = Math.min(400, height * 0.7);
  const panelX = width / 2 - panelWidth / 2;
  const panelY = height / 2 - panelHeight / 2;
  
  // Continue button
  if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100 &&
      mouseY > panelY + panelHeight - 80 && mouseY < panelY + panelHeight - 30) {
    gameState.setStatsDisplayActive(false);
    // gameState.setGameState("play"); // loadGeneratedLevel will set this if appropriate
    
    // Generate the next level if in generated mode
    import('./levelManager.js').then(levelManager => {
      if (gameState.state.generatedMode) {
        levelManager.loadGeneratedLevel(gameState.state.levelIndex + 1);
      } else {
        // If somehow got here not in generated mode, just resume play (should not happen)
        gameState.setGameState("play"); 
      }
    });
  }
  
  // Quit button
  if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100 &&
      mouseY > panelY + panelHeight - 20 && mouseY < panelY + panelHeight + 30) {
    // Go back to the main menu
    initGame();
  }
} 