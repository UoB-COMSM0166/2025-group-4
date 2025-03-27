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

      // 如果是动态平台的标记，不在这里绘制，由 floatingPlatform 处理
      if (tile === "6" || tile === "7") {
        continue;
      }

      if (tile === "1") {
        // Solid ground with enhanced visuals
        // Base platform color
        window.fill(80, 80, 90);
        window.stroke(60, 60, 70);
        window.strokeWeight(Math.max(1, tileSize / 20));
        window.rect(x, y, tileSize, tileSize, 2); // Slightly rounded corners
        
        // Add texture details to platforms
        window.noStroke();
        
        // Check adjacent tiles to determine edge styling
        const hasTopTile = row > 0 && tileMap[row-1][col] === "1";
        const hasLeftTile = col > 0 && tileMap[row][col-1] === "1";
        const hasRightTile = col < tileMap[row].length-1 && tileMap[row][col+1] === "1";
        const hasBottomTile = row < tileMap.length-1 && tileMap[row+1][col] === "1";
        
        // Top highlight if no tile above
        if (!hasTopTile) {
          window.fill(100, 100, 110, 150);
          window.rect(x, y, tileSize, tileSize/6, 2, 2, 0, 0);
        }
        
        // Bottom shadow if no tile below
        if (!hasBottomTile) {
          window.fill(40, 40, 50, 150);
          window.rect(x, y + tileSize - tileSize/6, tileSize, tileSize/6, 0, 0, 2, 2);
        }
        
        // Left edge highlight if no tile to left
        if (!hasLeftTile) {
          window.fill(90, 90, 100, 100);
          window.rect(x, y, tileSize/6, tileSize, 2, 0, 0, 2);
        }
        
        // Right edge shadow if no tile to right
        if (!hasRightTile) {
          window.fill(60, 60, 70, 100);
          window.rect(x + tileSize - tileSize/6, y, tileSize/6, tileSize, 0, 2, 2, 0);
        }
        
        // Add some texture dots/lines for visual interest
        window.fill(70, 70, 80, 100);
        const dotSize = Math.max(1, tileSize / 12);
        
        // Create a semi-random pattern based on position
        const seed = (row * 7 + col * 13) % 5; // Deterministic "random" value
        
        for (let i = 0; i < 3; i++) {
          const offsetX = (seed + i * 2) * tileSize / 8;
          const offsetY = ((seed + i) % 3 + 1) * tileSize / 6;
          window.ellipse(x + offsetX, y + offsetY, dotSize, dotSize);
        }
        
        // Add a subtle grid pattern
        window.stroke(60, 60, 70, 40);
        window.strokeWeight(1);
        window.line(x, y + tileSize/2, x + tileSize, y + tileSize/2);
        window.line(x + tileSize/2, y, x + tileSize/2, y + tileSize);
        
      } else if (tile === "5") {
        // Enhanced spike hazard
        window.fill(200, 30, 30);
        window.stroke(100, 10, 10);
        window.strokeWeight(Math.max(1, tileSize / 32));
        
        // Draw a more detailed triangular spike
        window.beginShape();
        window.vertex(x, y + tileSize);
        window.vertex(x + tileSize / 2, y);
        window.vertex(x + tileSize, y + tileSize);
        window.endShape(window.CLOSE);
        
        // Add inner detail to spike
        window.noStroke();
        window.fill(230, 60, 60);
        window.triangle(
          x + tileSize * 0.25, y + tileSize * 0.5,
          x + tileSize * 0.5, y + tileSize * 0.2,
          x + tileSize * 0.75, y + tileSize * 0.5
        );
        
        // Add a subtle glow effect
        window.fill(255, 100, 100, 30);
        window.ellipse(
          x + tileSize / 2,
          y + tileSize / 2,
          tileSize * 1.2,
          tileSize * 0.8
        );
      }
      else if (tile === "I") {
        // 用淡蓝色表示冰冻陷阱，你也可以用图片替换
        fill(150, 220, 255);
        noStroke();
        rect(x, y, tileSize, tileSize);
      }
    }
  }
}
