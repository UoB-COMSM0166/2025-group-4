let bearColor = [139, 90, 43]; // 默认棕色

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  
  // 头部
  fill(bearColor);
  noStroke();
  ellipse(200, 200, 180, 160);
  
  // 耳朵
  fill(bearColor);
  ellipse(140, 130, 60, 60);
  ellipse(260, 130, 60, 60);
  
  // 耳朵内侧
  fill([bearColor[0] + 42, bearColor[1] + 11, bearColor[2] - 14]);
  ellipse(140, 130, 40, 40);
  ellipse(260, 130, 40, 40);
  
  // 眼睛
  fill(255);
  ellipse(170, 180, 35, 35);
  ellipse(230, 180, 35, 35);
  
  fill(0);
  ellipse(170, 180, 15, 15);
  ellipse(230, 180, 15, 15);
  
  // 鼻子
  fill(0);
  ellipse(200, 210, 20, 15);
  
  // 嘴巴
  stroke(0);
  strokeWeight(3);
  noFill();
  arc(200, 220, 30, 20, 0, PI);
}

function keyPressed() {
  if (key === 'W') {
    bearColor = [255, 255, 255]; // 白色
  } else if (key === 'B') {
    bearColor = [101, 67, 33]; // 深棕色
  } else if (key === 'G') {
    bearColor = [169, 169, 169]; // 灰色
  }
}


