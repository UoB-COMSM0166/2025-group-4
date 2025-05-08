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
    // MODIFIED SECTION FOR "play" state input handling
    if (keyCode === 32) { // Space key
        // No need to separately track tutorialWasActiveAndDeactivated for return logic with space key
        if (gameState.state.tutorialActive) {
            gameState.state.tutorialActive = false;
            gameState.state.tutorialText = "";
        }
        // Perform flip for Space key
        if (gameState.state.player) {
            gameState.state.player.attemptGravityFlip();
        }
        return; // Space key action (deactivate tutorial if needed + flip) is complete.
    } else {
        // For keys OTHER than Space, if tutorial is active
        if (gameState.state.tutorialActive) {
            gameState.state.tutorialActive = false;
            gameState.state.tutorialText = "";
            return; // Deactivate tutorial and consume the non-space key.
        }
        // If not Space key and tutorial not active, let other key handlers (if any) proceed.
        // (Currently no other specific key handlers in this 'play' block to fall through to)
    }
    // END OF MODIFIED SECTION
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
    if (keyCode === 32) {
      if (gameState.state.generatedMode && gameState.state.lives > 0) {
        // Continue to next generated level
        gameState.setStatsDisplayActive(false);
        gameState.setGameState("play");
        import('./levelManager.js').then(levelManager => {
          levelManager.loadGeneratedLevel(gameState.state.levelIndex + 1);
        });
      } else {
        // Treat as QUIT for zero-lives milestone or non-generated
        initGame();
      }
    }
    return;
  }
}

/**
 * Handle mouse click events
 */
export function handleMouseClicked() {
  // REVISED LOGIC FOR handleMouseClicked
  let isPlayState = (gameState.state.gameState === "play");

  if (gameState.state.tutorialActive) {
    gameState.state.tutorialActive = false;
    gameState.state.tutorialText = "";

    if (isPlayState) { // Tutorial was active, and it's a click in "play" state
      // if (gameState.state.player) { // Flip is now handled by mousePressed
      //   gameState.state.player.attemptGravityFlip();
      // }
      // Deactivated tutorial. Flip is handled by mousePressed.
      // Also, prevent clicking "through" to other UI elements if tutorial was up.
      return;
    } else {
      // Tutorial was active, but not in "play" state (e.g., "menu", "difficulty").
      // Just deactivated tutorial. Prevent click-through.
      return;
    }
  }

  // Tutorial was NOT active.
  if (isPlayState) {
    // New behavior: mouse click in "play" state (no tutorial) - flip is now handled by mousePressed.
    // if (gameState.state.player) { // Flip is now handled by mousePressed
    //   gameState.state.player.attemptGravityFlip();
    // }
    return; // Click in "play" state is handled by mousePressed.
  } else if (gameState.state.gameState === "menu") {
    // Check if this is a click within the demo area
    if (gameState.state.menuDemoActive) {
      // Demo is already active. mousePressed in main.js handles the flip and returns.
      // So, this specific call here would be redundant.
      // flipGravityInMenuDemo(); 
      return; // Ensure return if menuDemoActive was true (though mousePressed should prevent this path)
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
  // END OF REVISED LOGIC
}

/**
 * Handle touch events for mobile
 */
export function handleTouchStarted() {
  // REVISED LOGIC FOR handleTouchStarted
  // Menu demo is special, handle it first.
  if (gameState.state.gameState === "menu" && gameState.state.menuDemoActive) {
    flipGravityInMenuDemo();
    // Assuming tutorialActive isn't relevant if menuDemoActive is true for a touch.
    return;
  }

  let isPlayState = (gameState.state.gameState === "play");

  if (gameState.state.tutorialActive) {
    gameState.state.tutorialActive = false;
    gameState.state.tutorialText = "";

    if (isPlayState) { // Tutorial was active, and it's a touch in "play" state
      if (gameState.state.player) {
        gameState.state.player.attemptGravityFlip();
      }
      // Deactivated tutorial AND flipped. Done for this touch.
      return;
    } else {
      // Tutorial was active, but not in "play" state.
      // Just deactivated tutorial. Prevent touch-through by returning.
      return;
    }
  }

  // Tutorial was NOT active.
  if (isPlayState) {
    // Tutorial not active, touch in "play" state. Original behavior: flip.
    if (gameState.state.player) {
      gameState.state.player.attemptGravityFlip();
    }
    return; // Touch in "play" state is consumed by flip.
  } else {
    // Tutorial was NOT active, and NOT in "play" state, and NOT menu demo.
    // Original behavior: Call handleMouseClicked. This is still correct as
    // handleMouseClicked now contains the unified logic.
    handleMouseClicked();
  }
  // END OF REVISED LOGIC
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
    gameState.state.player.gravityDirection,
    { scene: 'menuDemo' }
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
    // If in random (generated) mode
    if (gameState.state.generatedMode) {
      if (gameState.state.lives > 0) {
        // Continue to next generated level
        import('./levelManager.js').then(levelManager => {
          gameState.setGameState('play');
          levelManager.loadGeneratedLevel(gameState.state.levelIndex + 1);
        });
      } else {
        // Random mode ended (no lives), return to main menu
        initGame();
      }
    } else {
      // Non-generated stats, just resume play
      gameState.setGameState('play');
    }
  }
  
  // Quit button
  if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100 &&
      mouseY > panelY + panelHeight - 20 && mouseY < panelY + panelHeight + 30) {
    // Go back to the main menu
    initGame();
  }
}
