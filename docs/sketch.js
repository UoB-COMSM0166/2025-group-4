// P5.js Drawing App with Enhanced Features

let brushColor;
let brushSize = 10;
let brushType = 'circle'; // Default brush type
let isErasing = false;
let autoDraw = false;
let symmetry = false;

function setup() {
  createCanvas(800, 600);
  brushColor = color(0);
  background(255);
  drawGrid(); // Add grid to the background (Function 11: Grid Background)
}

function draw() {
  if (mouseIsPressed) {
    if (isErasing) {
      erase();
      rect(mouseX - brushSize / 2, mouseY - brushSize / 2, brushSize, brushSize);
      noErase(); // Function 6: Eraser Feature
    } else if (autoDraw) {
      for (let i = 0; i < 5; i++) {
        let offsetX = random(-brushSize, brushSize);
        let offsetY = random(-brushSize, brushSize);
        drawBrush(mouseX + offsetX, mouseY + offsetY); // Function 8: Auto Draw Feature
      }
    } else {
      drawBrush(mouseX, mouseY);
      if (symmetry) {
        drawBrush(width - mouseX, mouseY); // Function 9: Symmetry Drawing
      }
    }
  }
}

function drawBrush(x, y) {
  fill(brushColor);
  noStroke();
  if (brushType === 'circle') {
    ellipse(x, y, brushSize, brushSize); // Function 5: Support for Multiple Brush Types
  } else if (brushType === 'square') {
    rect(x - brushSize / 2, y - brushSize / 2, brushSize, brushSize);
  }
}

function keyPressed() {
  // Change brush color
  if (key === 'r') brushColor = color(255, 1, 1); // Function 1: Change Brush Color
  if (key === 'g') brushColor = color(0, 255, 0); // Function 1: Change Brush Color
  if (key === 'b') brushColor = color(0, 0, 255); // Function 1: Change Brush Color

  // Adjust brush size
  if (key === '+') brushSize += 5; // Function 2: Adjust Brush Size
  if (key === '-') brushSize = max(5, brushSize - 5); // Function 2: Adjust Brush Size

  // Change brush type
  if (key === '1') brushType = 'circle'; // Function 5: Support for Multiple Brush Types
  if (key === '2') brushType = 'square'; // Function 5: Support for Multiple Brush Types

  // Toggle eraser
  if (key === 'e') isErasing = !isErasing; // Function 6: Eraser Feature

  // Toggle auto-draw
  if (key === 'a') autoDraw = !autoDraw; // Function 8: Auto Draw Feature

  // Toggle symmetry
  if (key === 's') symmetry = !symmetry; // Function 9: Symmetry Drawing

  // Clear canvas
  if (key === 'c') background(255); // Function 7: Clear Canvas

  // Save image
  if (key === 'p') save('drawing.jpg'); // Function 4: Save Image
}

function mousePressed() {
  if (mouseButton === RIGHT) {
    isErasing = true; // Function 6: Eraser Feature with Right-Click
  }
}

function mouseReleased() {
  if (mouseButton === RIGHT) {
    isErasing = false; // Function 6: Eraser Feature with Right-Click
  }
}

// Draw grid background
function drawGrid() {
  stroke(200);
  for (let x = 0; x < width; x += 50) {
    line(x, 0, x, height);
  }
  for (let y = 0; y < height; y += 50) {
    line(0, y, width, y);
  } // Function 11: Grid Background
}
