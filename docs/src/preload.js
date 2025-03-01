// src/preload.js
export function preload() {
  window.playerImages = [];
  window.playerImages.push(loadImage('images/7.png'));
  window.playerImages.push(loadImage('images/8.png'));
  window.playerImages.push(loadImage('images/9.png'));
  // 其它资源加载……
}
window.preload = preload;
