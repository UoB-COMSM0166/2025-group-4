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
  if (tile === "1"|| tile === "S") return 1; // Solid tile.
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
        if (window.currentWallImage) {
          // 使用当前关卡的墙壁图像，不绘制附加效果
          window.image(window.currentWallImage, x, y, tileSize, tileSize);
        } else {
          // 绘制默认固体地面，并添加边缘高亮和纹理
          window.fill(80, 80, 90);
          window.stroke(60, 60, 70);
          window.strokeWeight(Math.max(1, tileSize / 20));
          window.rect(x, y, tileSize, tileSize, 2); // 略带圆角
          window.noStroke();
      
          // 检查相邻的墙壁以添加高光和阴影细节
          const hasTopTile = row > 0 && tileMap[row - 1][col] === "1";
          const hasLeftTile = col > 0 && tileMap[row][col - 1] === "1";
          const hasRightTile = col < tileMap[row].length - 1 && tileMap[row][col + 1] === "1";
          const hasBottomTile = row < tileMap.length - 1 && tileMap[row + 1][col] === "1";
      
          // 顶部高光
          if (!hasTopTile) {
            window.fill(100, 100, 110, 150);
            window.rect(x, y, tileSize, tileSize / 6, 2, 2, 0, 0);
          }
          // 底部阴影
          if (!hasBottomTile) {
            window.fill(40, 40, 50, 150);
            window.rect(x, y + tileSize - tileSize / 6, tileSize, tileSize / 6, 0, 0, 2, 2);
          }
          // 左侧高光
          if (!hasLeftTile) {
            window.fill(90, 90, 100, 100);
            window.rect(x, y, tileSize / 6, tileSize, 2, 0, 0, 2);
          }
          // 右侧阴影
          if (!hasRightTile) {
            window.fill(60, 60, 70, 100);
            window.rect(x + tileSize - tileSize / 6, y, tileSize / 6, tileSize, 0, 2, 2, 0);
          }
          // 加入一些装饰性的小点与线条
          window.fill(70, 70, 80, 100);
          const dotSize = Math.max(1, tileSize / 12);
          const seed = (row * 7 + col * 13) % 5;
          for (let i = 0; i < 3; i++) {
            const offsetX = (seed + i * 2) * tileSize / 8;
            const offsetY = ((seed + i) % 3 + 1) * tileSize / 6;
            window.ellipse(x + offsetX, y + offsetY, dotSize, dotSize);
          }
          // 绘制简约网格效果
          window.stroke(60, 60, 70, 40);
          window.strokeWeight(1);
          window.line(x, y + tileSize / 2, x + tileSize, y + tileSize / 2);
          window.line(x + tileSize / 2, y, x + tileSize / 2, y + tileSize);
        }
      } else if (tile === "5") {
        if (window.currentSpikeImage) {
          push();
          // 如果当前尖刺位于地图顶部（row 等于 0），则对其垂直翻转
          if (row === 0) {
            // 翻转时，将坐标原点移到该 tile 的底边
            translate(x, y + tileSize);
            scale(1, -1);
            // 此时绘制的图像坐标以 (0,0) 为起点
            image(window.currentSpikeImage, 0, 0, tileSize, tileSize);
          } else {
            // 否则正常绘制
            image(window.currentSpikeImage, x, y, tileSize, tileSize);
          }
          pop();
        } else {
          // 默认绘制：下面同样添加翻转判断
          push();
          if (row === 0) {
            translate(x, y + tileSize);
            scale(1, -1);
          }
          fill(200, 30, 30);
          stroke(100, 10, 10);
          strokeWeight(Math.max(1, tileSize / 32));
          beginShape();
          vertex(0, tileSize);
          vertex(tileSize / 2, 0);
          vertex(tileSize, tileSize);
          endShape(CLOSE);
          noStroke();
          fill(230, 60, 60);
          triangle(tileSize * 0.25, tileSize * 0.5,
                   tileSize * 0.5, tileSize * 0.2,
                   tileSize * 0.75, tileSize * 0.5);
          fill(255, 100, 100, 30);
          ellipse(tileSize / 2, tileSize / 2, tileSize * 1.2, tileSize * 0.8);
          pop();
        }
      }
        else if (tile === "I") {
        // 用淡蓝色表示冰冻陷阱，你也可以用图片替换
        fill(150, 220, 255);
        noStroke();
        rect(x, y, tileSize, tileSize);
      }else if (tile === "S") {
        // 使用淡蓝色绘制特殊滑行墙壁
        fill(180, 220, 255);
        noStroke();
        rect(x, y, tileSize, tileSize);
      }      
    }
  }
}
