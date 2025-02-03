let bearColor;
let colors;
let colorIndex = 0;

function setup() {
  createCanvas(400, 400);
  colors = [
    [139, 90, 43],   // default brown
    [255, 255, 255], // white
    [101, 67, 33],   // dark brown
    [169, 169, 169]  // gray
  ];
  bearColor = colors[colorIndex];
  setInterval(changeColor, 5000); // change color every 5 seconds
}

function draw() {
  background(220);
  
  // head
  fill(bearColor);
  noStroke();
  ellipse(200, 200, 180, 160);
  
  // ear
  fill(bearColor);
  ellipse(140, 130, 60, 60);
  ellipse(260, 130, 60, 60);
  
  // inside ear
  fill([bearColor[0] + 42, bearColor[1] + 11, bearColor[2] - 14]);
  ellipse(140, 130, 40, 40);
  ellipse(260, 130, 40, 40);
  
  // eyes
  fill(255);
  ellipse(170, 180, 35, 35);
  ellipse(230, 180, 35, 35);
  
  fill(0);
  ellipse(170, 180, 15, 15);
  ellipse(230, 180, 15, 15);
  
  // nose
  fill(0);
  ellipse(200, 210, 20, 15);
  
  // mouth
  stroke(0);
  strokeWeight(3);
  noFill();
  arc(200, 220, 30, 20, 0, PI);
}

function changeColor() {
  colorIndex = (colorIndex + 1) % colors.length;
  bearColor = colors[colorIndex];
}

