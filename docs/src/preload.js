// src/preload.js
export function preload() {
  window.playerImages = [];
  window.playerImages.push(loadImage('src/images/7.png'));
  window.playerImages.push(loadImage('src/images/8.png'));
  window.playerImages.push(loadImage('src/images/9.png'));
  // 其它资源加载……
  window.coinImage = loadImage('src/images/coin.png');
  window.enemyImage = loadImage('src/images/enemy.png');
  window.backgroundImages = [];
  window.backgroundImages.push(loadImage('src/images/background1.jfif'));
  window.backgroundImages.push(loadImage('src/images/background2.jfif'));
  window.backgroundImages.push(loadImage('src/images/background3.jfif'));
  
}
window.preload = preload;
