/**
 * Utility functions
 */
import { tileSize } from './config.js';

/**
 * Returns the tile code (1 for solid, 5 for hazard) at the given row/col.
 */
export function getTile(col, row, tileMap) {
  // Bounds checking.
  if (
    row < 0 ||
    row >= tileMap.length ||
    col < 0 ||
    col >= tileMap[0].length
  ) {
    return 0; // Out of bounds.
  }

  // Get the character at this position.
  let tile = tileMap[row][col];
  if (tile === "1") return 1; // Solid tile.
  if (tile === "5") return 5; // Hazard (spike).
  return 0; // Empty or other.
}

/**
 * Draw a vertical background gradient.
 */
//export function setGradient(c1, c2) {
  // Top to bottom gradient.
  // for (let y = 0; y < window.height; y++) {
  //   let inter = window.map(y, 0, window.height, 0, 1);
  //   let c = window.lerpColor(c1, c2, inter);
  //   window.stroke(c);
  //   window.line(0, y, window.width, y);
  // }
//}

/**
 * Draw the tile map.
 */
export function drawTiles(tileMap, cameraOffsetX) {
  for (let row = 0; row < tileMap.length; row++) {
    for (let col = 0; col < tileMap[row].length; col++) {
      let tile = tileMap[row][col];
      let x = col * tileSize - cameraOffsetX;
      let y = row * tileSize;

      // Skip drawing if off-screen.
      if (x < -tileSize || x > window.width) continue;

      if (tile === "1") {
        // Solid ground.
        window.fill(100, 100, 100);
        window.stroke(80, 80, 80);
        window.strokeWeight(Math.max(1, tileSize / 16)); // Scale stroke weight
        window.rect(x, y, tileSize, tileSize);
      } else if (tile === "5") {
        // Spike hazard.
        window.fill(200, 0, 0);
        window.stroke(100, 0, 0);
        window.strokeWeight(Math.max(1, tileSize / 32)); // Scale stroke weight
        // Draw a triangular spike.
        window.triangle(
          x,
          y + tileSize,
          x + tileSize / 2,
          y,
          x + tileSize,
          y + tileSize
        );
      }
    }
  }
}
