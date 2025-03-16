/**
 * Game configuration and constants
 */

// Tile and level configuration
export let tileSize = 24; // pixel size of each tile (will be dynamically calculated)
export const baseSize = 24; // base tile size for reference
export const numCols = 20; // visible columns on screen
export const numRows = 15; // visible rows on screen

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
 * @param {string} difficulty - "easy", "normal", or "hard"
 */
export function updatePhysicsForDifficulty(difficulty) {
  if (difficulty === "easy") {
    gravity = 3; // Lower gravity makes the game easier to control
    maxSpeedX = 6; // Slower max speed makes the game more forgiving
  } else if (difficulty === "hard") {
    gravity = 4; // Higher gravity makes timing more difficult
    maxSpeedX = 18; // Faster max speed makes the game more challenging
  } else {
    // Normal difficulty - default values
    gravity = 5;
    maxSpeedX = 12;
  }
}

// Function to update the tile size based on window dimensions
export function updateTileSize(windowWidth, windowHeight) {
  const availableHeight = windowHeight - hudHeight;
  const widthBasedSize = windowWidth / numCols;
  const heightBasedSize = availableHeight / numRows;
  
  // Use the smaller of the two to ensure the whole level fits
  tileSize = Math.floor(Math.min(widthBasedSize, heightBasedSize));
  
  // Ensure minimum size
  tileSize = Math.max(tileSize, 12); // Reduced minimum size from 16 to 12
  
  return tileSize;
}
