/**
 * Game configuration and constants
 */

// Tile and level configuration
export let tileSize = 12; // pixel size of each tile (will be dynamically calculated)
export const numCols = 40; // visible columns on screen
export const numRows = 16; // visible rows on screen (changed from 30 to 16)

// Physics configuration - base values that can be modified by difficulty
export let gravity = 4; // base gravity magnitude
export let maxSpeedX = 8; // horizontal speed limit

// UI configuration
export const hudHeight = 50; // space at top for HUD

// Buffering Settings for Gravity Flip
export const allowBufferedFlipWhileAir = false; // When false (the default) disallows midair flips but buffers input
export const airBufferDuration = 300; // in milliseconds
export const preSurfaceBufferDuration = 150; // in milliseconds

/**
 * Function to update physics parameters based on difficulty
 * @param {string} difficulty - "easy" or "hard"
 */
export function updatePhysicsForDifficulty(difficulty) {
  if (difficulty === "easy") {
    gravity = 3; // Lower gravity makes the game easier to control
    maxSpeedX = 6; // Slower max speed makes the game more forgiving
  } else if (difficulty === "hard") {
    gravity = 1; // Higher gravity makes timing more difficult
    maxSpeedX = 9; // Faster max speed makes the game more challenging
  } else {
    // Fallback to easy settings
    gravity = 3;
    maxSpeedX = 6;
  }
}

// Function to update the tile size based on window dimensions
export function updateTileSize(windowWidth, windowHeight) {
  // Calculate available height (excluding HUD)
  const availableHeight = windowHeight - hudHeight;
  
  // Set tile size to always display 16 tiles vertically
  tileSize = Math.floor(availableHeight / numRows);
  
  // Ensure minimum size
  tileSize = Math.max(tileSize, 12);
  
  return tileSize;
}
