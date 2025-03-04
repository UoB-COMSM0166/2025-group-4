/**
 * Game configuration and constants
 */

// Tile and level configuration
export let tileSize = 32; // pixel size of each tile (will be dynamically calculated)
export const baseSize = 32; // base tile size for reference
export const numCols = 20; // visible columns on screen
export const numRows = 15; // visible rows on screen

// Physics configuration
export const gravity = 0.5; // base gravity magnitude
export const maxSpeedX = 8; // horizontal speed limit

// UI configuration
export const hudHeight = 50; // space at top for HUD

// Buffering Settings for Gravity Flip
export const allowBufferedFlipWhileAir = false; // When false (the default) disallows midair flips but buffers input
export const airBufferDuration = 300; // in milliseconds
export const preSurfaceBufferDuration = 150; // in milliseconds

// Function to update the tile size based on window dimensions
export function updateTileSize(windowWidth, windowHeight) {
  const availableHeight = windowHeight - hudHeight;
  const widthBasedSize = windowWidth / numCols;
  const heightBasedSize = availableHeight / numRows;
  
  // Use the smaller of the two to ensure the whole level fits
  tileSize = Math.floor(Math.min(widthBasedSize, heightBasedSize));
  
  // Ensure minimum size
  tileSize = Math.max(tileSize, 16);
  
  return tileSize;
}
