/**
 * Input Handler Module
 * Handles keyboard, mouse and touch input for the game
 */
import * as gameState from './gameState.js';
import { startGeneratedMode, loadGeneratedLevel } from './levelManager.js';

/**
 * Handle key press
 */
export function handleKeyPressed() {
  // Handle seed input for generated levels
  if (gameState.state.gameState === "lives" && gameState.state.seedInput) {
    // Handle backspace
    if (keyCode === BACKSPACE) {
      gameState.state.seedValue = gameState.state.seedValue.slice(0, -1);
      return;
    }
    
    // Handle enter to confirm input
    if (keyCode === ENTER || keyCode === RETURN) {
      gameState.state.seedInput = false;
      return;
    }
    
    // Handle escape to cancel input
    if (keyCode === ESCAPE) {
      gameState.state.seedInput = false;
      return;
    }
    
    // Add characters (only allow alphanumeric and some special chars)
    if ((key >= '0' && key <= '9') || 
        (key >= 'a' && key <= 'z') || 
        (key >= 'A' && key <= 'Z') ||
        key === '-' || key === '_' || key === '.') {
      // Limit length to prevent overflow
      if (gameState.state.seedValue.length < 20) {
        gameState.state.seedValue += key;
      }
    }
    return;
  }

  // Handle other key presses
  if (keyCode === 32) { // Space bar
    if (gameState.state.gameState === "menu") {
      // From main menu to difficulty selection
      gameState.state.gameState = "difficulty";
    } else if (gameState.state.gameState === "play") {
      // In game, attempt to flip gravity
      gameState.state.player.attemptGravityFlip();
    } else if (gameState.state.gameState === "over" || gameState.state.gameState === "win") {
      // Game over or win, return to main menu
      gameState.state.gameState = "menu";
    } else if (gameState.state.gameState === "stats") {
      // Continue from stats screen - similar to clicking CONTINUE
      gameState.state.statsDisplayActive = false;
      
      // Make sure exit trigger is reset
      gameState.setExitTriggered(false);
      
      // Load the next level
      import('./levelManager.js').then(levelManager => {
        levelManager.loadGeneratedLevel(gameState.state.levelIndex + 1);
        gameState.state.gameState = "play";
      });
    } else {
      // Other cases, reinitialize game
      gameState.initGame();
    }
  } else if (keyCode === ESCAPE) {
    // Escape can be used to return to the main menu from anywhere
    if (gameState.state.gameState !== "menu") {
      gameState.initGame();
      gameState.state.gameState = "menu";
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
  
  if (gameState.state.gameState === "menu") {
    // Check if play button clicked
    if (mouseY > height * 0.5 - 40 && mouseY < height * 0.5 + 40 && 
        mouseX > width / 2 - 150 && mouseX < width / 2 + 150) {
      gameState.state.gameState = "difficulty";
      gameState.state.generatedMode = false;
      window.lastStateChangeTime = Date.now();
    }
    // Check if generate button clicked
    else if (mouseY > height * 0.65 - 40 && mouseY < height * 0.65 + 40 && 
             mouseX > width / 2 - 150 && mouseX < width / 2 + 150) {
      gameState.state.gameState = "lives";
      gameState.state.generatedMode = true;
      gameState.state.selectedLives = 5; // Default to 5 lives for the generated mode
      gameState.state.seedValue = ""; // Reset seed value
      gameState.state.seedInput = false; // Reset seed input mode
      window.lastStateChangeTime = Date.now();
    }
  } else if (gameState.state.gameState === "difficulty") {
    // Check which difficulty button was clicked
    if (mouseY > height * 0.4 - 40 && mouseY < height * 0.4 + 40 && 
        mouseX > width / 2 - 150 && mouseX < width / 2 + 150) {
      // Easy
      gameState.setDifficulty("easy");
      window.lastStateChangeTime = Date.now();
    } else if (mouseY > height * 0.55 - 40 && mouseY < height * 0.55 + 40 && 
               mouseX > width / 2 - 150 && mouseX < width / 2 + 150) {
      // Normal
      gameState.setDifficulty("normal");
      window.lastStateChangeTime = Date.now();
    } else if (mouseY > height * 0.7 - 40 && mouseY < height * 0.7 + 40 && 
               mouseX > width / 2 - 150 && mouseX < width / 2 + 150) {
      // Hard
      gameState.setDifficulty("hard");
      window.lastStateChangeTime = Date.now();
    }
  } else if (gameState.state.gameState === "lives") {
    const options = [3, 5, 10, 99];
    const buttonY = [height * 0.30, height * 0.38, height * 0.46, height * 0.54];
    
    // Check if seed input box was clicked
    if (mouseY > height * 0.7 - 25 && mouseY < height * 0.7 + 25 && 
        mouseX > width / 2 - 150 && mouseX < width / 2 + 150) {
      gameState.state.seedInput = true;
    } else {
      // If clicked outside the seed input, stop editing
      if (gameState.state.seedInput) {
        gameState.state.seedInput = false;
      }
      
      // Check if any lives option was clicked
      for (let i = 0; i < options.length; i++) {
        if (mouseY > buttonY[i] - 30 && mouseY < buttonY[i] + 30 && 
            mouseX > width / 2 - 100 && mouseX < width / 2 + 100) {
          gameState.state.selectedLives = options[i];
          break;
        }
      }
      
      // Check if start button was clicked
      if (mouseY > height * 0.82 - 35 && mouseY < height * 0.82 + 35 && 
          mouseX > width / 2 - 120 && mouseX < width / 2 + 120) {
        gameState.state.seedInput = false; // Exit seed input mode
        startGeneratedMode();
        window.lastStateChangeTime = Date.now();
      }
    }
  } else if (gameState.state.gameState === "stats") {
    const panelWidth = Math.min(600, width * 0.8);
    const panelHeight = Math.min(400, height * 0.7);
    const panelX = width / 2 - panelWidth / 2;
    const panelY = height / 2 - panelHeight / 2;
    
    // Check if continue button was clicked
    if (mouseY > panelY + panelHeight - 80 && mouseY < panelY + panelHeight - 30 && 
        mouseX > width / 2 - 100 && mouseX < width / 2 + 100) {
      // Clear the stats display
      gameState.state.statsDisplayActive = false;
      
      // Make sure exit trigger is reset
      gameState.setExitTriggered(false);
      
      // Load the next level
      import('./levelManager.js').then(levelManager => {
        levelManager.loadGeneratedLevel(gameState.state.levelIndex + 1);
        gameState.state.gameState = "play";
        window.lastStateChangeTime = Date.now();
      });
    }
    // Check if quit button was clicked
    else if (mouseY > panelY + panelHeight - 20 && mouseY < panelY + panelHeight + 30 && 
             mouseX > width / 2 - 100 && mouseX < width / 2 + 100) {
      // Return to main menu and reset all relevant state
      gameState.state.statsDisplayActive = false;
      gameState.setExitTriggered(false);
      gameState.state.generatedMode = false;
      gameState.initGame();
      gameState.state.gameState = "menu";
      window.lastStateChangeTime = Date.now();
    }
  }
}

/**
 * Handle touch start
 */
export function handleTouchStarted() {
  if (gameState.state.gameState === "play") {
    gameState.state.player.attemptGravityFlip();
  } else if (gameState.state.gameState === "menu" || gameState.state.gameState === "difficulty" || 
             gameState.state.gameState === "lives" || gameState.state.gameState === "stats") {
    // Simulate a mouse click for touch events
    handleMouseClicked();
  } else {
    gameState.initGame();
    // Over or win state - return to main menu
    gameState.state.gameState = "menu";
  }
  return false;
} 