// src/preload.js
export function preload() {
  window.playerImages = [];
  //player
  window.playerImages.push(loadImage('src/images/7.png'));
  window.playerImages.push(loadImage('src/images/8.png'));
  window.playerImages.push(loadImage('src/images/9.png'));


  // tools
  window.coinImage = loadImage('src/images/coin.png');
  window.enemyImage = loadImage('src/images/enemy.png');

  //background
  window.backgroundImages = [];
  window.backgroundImages.push(loadImage('src/images/background1.jfif'));
  window.backgroundImages.push(loadImage('src/images/background2.jfif'));
  window.backgroundImages.push(loadImage('src/images/background3.jfif'));


  //music
  window.getCoinSound = loadSound('src/music/getcoin.mp3');
  window.deathSound = loadSound('src/music/death.wav');
  window.passSound = loadSound('src/music/pass.mp3');
  window.regravitySound = loadSound('src/music/regravity.mp3');
  
}
  window.preload = preload;
