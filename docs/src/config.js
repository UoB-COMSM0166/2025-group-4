/**
 * Game configuration and constants
 */

// Tile and level configuration
export const tileSize = 32; // pixel size of each tile
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
