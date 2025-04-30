/**
 * Main game module
 * This file now serves as the entry point that imports and exports functionality from the refactored modules
 */

// Re-export functionality from the new modules
export { updateGame } from './gameLogic.js';
export { drawGame } from './renderer.js';
export { handleKeyPressed, handleMouseClicked, handleTouchStarted } from './inputHandler.js';
export { 
  initGame, 
  loseLife, 
  setDifficulty, 
  addCustomLevel, 
  triggerGravityFlipDelay,
  selectDifficulty,
  state
} from './gameState.js';
export { 
  loadLevel, 
  reloadCurrentLevel 
} from './levelManager.js';



