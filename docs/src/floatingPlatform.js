// floatingPlatform.js
import { tileSize } from './config.js';

export class FloatingPlatform {
  /**
   * 构造函数
   * @param {number} x - 平台中心 x 坐标
   * @param {number} y - 平台中心 y 坐标
   * @param {string} type - "6" 表示上下移动，"7" 表示左右移动
   */
  constructor(x, y, type) {
    this.x0 = x;
    this.y0 = y;
    this.x = x;
    this.y = y;
    this.type = type;
    // 设定运动范围（单位：像素）
    this.range = tileSize * 2; // 可根据需要调整
    // 设定运动速度（像素/帧）
    this.speed = 1.5;
    // 运动方向初始化为正方向
    this.direction = 1;
    // 平台尺寸（与 tileSize 相同或自定义）
    this.width = tileSize;
    this.height = tileSize / 2; // 平台可以稍矮
  }
  
  update() {
    if (this.type === "6") {
      // 上下移动平台：在 y0 附近上下来回移动
      this.y += this.speed * this.direction;
      if (this.y > this.y0 + this.range || this.y < this.y0 - this.range) {
        this.direction *= -1;
      }
    } else if (this.type === "7") {
      // 左右移动平台：在 x0 附近左右来回移动
      this.x += this.speed * this.direction;
      if (this.x > this.x0 + this.range || this.x < this.x0 - this.range) {
        this.direction *= -1;
      }
    }
  }
  
  draw(cameraOffsetX) {
    // 绘制平台时，同样用类似静态平台的样式（但可以设置不同颜色）
    let drawX = this.x - cameraOffsetX - this.width / 2;
    let drawY = this.y - this.height / 2;
    push();
    noStroke();
    // 根据类型设定不同颜色，便于区分
    if (this.type === "6") {
      fill(150, 150, 250); // 比较偏蓝
    } else if (this.type === "7") {
      fill(150, 250, 150); // 比较偏绿
    }
    rect(drawX, drawY, this.width, this.height, 4);
    pop();
  }
}
