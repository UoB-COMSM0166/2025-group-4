/**
 * Level Editor Module
 * Inspired by VVVVVV's level editor, allows creating and editing game levels
 */
import { tileSize, numRows, numCols, hudHeight } from './config.js';
import * as gameState from './gameState.js';
import { loadLevel as loadGameLevel } from './levelManager.js';

// Editor state variables
let editorGrid = []; // 2D array representing the current level being edited
let currentTile = '1'; // Current tile/entity type being placed (default: solid ground)
let gridWidth = 25; // Default width of editor grid
let gridHeight = 15; // Default height of editor grid
let editorOffsetX = 0; // Horizontal scrolling offset
let editorOffsetY = 0; // Vertical scrolling offset
let editorMouseX = 0; // Current mouse X position in grid coordinates
let editorMouseY = 0; // Current mouse Y position in grid coordinates
let isDragging = false; // Whether mouse is being dragged
let dragStartX = 0; // Starting X coordinate for drag
let dragStartY = 0; // Starting Y coordinate for drag
let editorScale = 1; // Zoom level for the editor
let selectionArea = null; // For area selection (x1, y1, x2, y2)
let clipboardData = null; // For copy/paste operations
let showHelp = false; // Whether to show help panel
let showGrid = true; // Whether to show grid lines
let newLevelName = 'MyLevel'; // Default name for new levels
let message = ''; // Message to display to the user
let messageTimeout = 0; // Timeout for message display

// Tile definitions - we'll set colors in setup() after p5.js is initialized
let TILES = {};

// Ensure global playtestMode flag exists
window.playtestMode = window.playtestMode || false;

/**
 * Initialize the level editor
 */
export function initLevelEditor() {
  // Initialize TILES with proper colors now that p5.js is available
  initTiles();
  resetEditor();
  showMessage('Level Editor initialized. Press H for help.');
}

/**
 * Initialize the tiles with proper colors after p5.js is available
 */
function initTiles() {
  TILES = {
    '0': { name: 'Empty', color: color(0, 0, 0, 0), char: '.' },
    '1': { name: 'Solid Ground', color: color(80, 80, 80), char: '1' },
    '2': { name: 'Coin', color: color(255, 215, 0), char: '2' },
    '3': { name: 'Player Start', color: color(0, 255, 0), char: '3' },
    '4': { name: 'Exit Gate', color: color(0, 0, 255), char: '4' },
    '5': { name: 'Spike', color: color(255, 0, 0), char: '5' },
    '6': { name: 'Platform (V)', color: color(255, 165, 0), char: '6' },
    '7': { name: 'Platform (H)', color: color(255, 105, 180), char: '7' },
    'E': { name: 'Enemy', color: color(128, 0, 128), char: 'E' },
    '.': { name: 'Empty Space', color: color(0, 0, 0, 0), char: '.' }
  };
}

/**
 * Reset the editor to a blank slate
 */
function resetEditor() {
  editorGrid = [];
  
  // Initialize with empty grid
  for (let row = 0; row < gridHeight; row++) {
    let newRow = '';
    for (let col = 0; col < gridWidth; col++) {
      // Add border around the level
      if (row === 0 || row === gridHeight - 1 || col === 0 || col === gridWidth - 1) {
        newRow += '1'; // Solid ground for borders
      } else {
        newRow += '.'; // Empty space for interior
      }
    }
    editorGrid.push(newRow);
  }
  
  // Reset view position
  editorOffsetX = 0;
  editorOffsetY = 0;
  editorScale = 1;
  
  // Reset selection and clipboard
  selectionArea = null;
  clipboardData = null;
}

/**
 * Resize the editor grid
 */
function resizeGrid(newWidth, newHeight) {
  // Ensure minimum size
  newWidth = Math.max(newWidth, 10);
  newHeight = Math.max(newHeight, 5);
  
  // Create new grid with the new dimensions
  let newGrid = [];
  for (let row = 0; row < newHeight; row++) {
    let newRow = '';
    for (let col = 0; col < newWidth; col++) {
      if (row < editorGrid.length && col < editorGrid[row].length) {
        // Copy existing data
        newRow += editorGrid[row][col];
      } else if (row === 0 || row === newHeight - 1 || col === 0 || col === newWidth - 1) {
        // Add solid border
        newRow += '1';
      } else {
        // Fill with empty space
        newRow += '.';
      }
    }
    newGrid.push(newRow);
  }
  
  editorGrid = newGrid;
  gridWidth = newWidth;
  gridHeight = newHeight;
  showMessage(`Grid resized to ${newWidth}x${newHeight}`);
}

/**
 * Set a tile in the editor grid
 */
function setTile(row, col, tileType) {
  if (row < 0 || row >= editorGrid.length || col < 0 || col >= editorGrid[row].length) {
    return; // Out of bounds
  }
  
  // Update the tile
  let currentRow = editorGrid[row];
  editorGrid[row] = currentRow.substring(0, col) + tileType + currentRow.substring(col + 1);
}

/**
 * Get a tile from the editor grid
 */
function getTile(row, col) {
  if (row < 0 || row >= editorGrid.length || col < 0 || col >= editorGrid[row].length) {
    return null; // Out of bounds
  }
  return editorGrid[row][col];
}

/**
 * Update the editor (called every frame)
 */
export function updateLevelEditor() {
  // Update mouse position in grid coordinates
  const mouseGridX = Math.floor((mouseX - (width/2 - (gridWidth * tileSize * editorScale)/2) + editorOffsetX) / (tileSize * editorScale));
  const mouseGridY = Math.floor((mouseY - hudHeight - (height - hudHeight)/2 + (gridHeight * tileSize * editorScale)/2 + editorOffsetY) / (tileSize * editorScale));
  
  editorMouseX = mouseGridX;
  editorMouseY = mouseGridY;
  
  // Handle dragging for panning
  if (isDragging && mouseButton === RIGHT) {
    editorOffsetX = dragStartX - (mouseX - dragStartX);
    editorOffsetY = dragStartY - (mouseY - dragStartY);
  }
  
  // Update message timeout
  if (messageTimeout > 0) {
    messageTimeout--;
    if (messageTimeout === 0) {
      message = '';
    }
  }
}

/**
 * Draw the level editor
 */
export function drawLevelEditor() {
  // Make sure TILES is initialized
  if (Object.keys(TILES).length === 0) {
    initTiles();
  }
  
  background(40);
  
  // Draw editor grid
  push();
  translate(width/2 - (gridWidth * tileSize * editorScale)/2 - editorOffsetX, 
            hudHeight + (height - hudHeight)/2 - (gridHeight * tileSize * editorScale)/2 - editorOffsetY);
  scale(editorScale);
  
  // Draw grid cells
  for (let row = 0; row < editorGrid.length; row++) {
    for (let col = 0; col < editorGrid[row].length; col++) {
      const tileType = editorGrid[row][col];
      const tileInfo = TILES[tileType] || TILES['.'] || { color: color(0, 0, 0, 0), name: 'Unknown' };
      
      // Draw tile background
      fill(tileInfo.color);
      stroke(100);
      strokeWeight(showGrid ? 1 : 0);
      rect(col * tileSize, row * tileSize, tileSize, tileSize);
      
      // Draw special tile indicators
      if (tileType === '3') { // Player start
        fill(0);
        textAlign(CENTER, CENTER);
        textSize(12);
        text('P', col * tileSize + tileSize/2, row * tileSize + tileSize/2);
      } else if (tileType === '4') { // Exit
        fill(0);
        textAlign(CENTER, CENTER);
        textSize(12);
        text('X', col * tileSize + tileSize/2, row * tileSize + tileSize/2);
      } else if (tileType === 'E') { // Enemy
        fill(0);
        textAlign(CENTER, CENTER);
        textSize(12);
        text('E', col * tileSize + tileSize/2, row * tileSize + tileSize/2);
      } else if (tileType === '2') { // Coin
        fill(0);
        textAlign(CENTER, CENTER);
        textSize(12);
        text('C', col * tileSize + tileSize/2, row * tileSize + tileSize/2);
      }
    }
  }
  
  // Draw selection area if active
  if (selectionArea) {
    noFill();
    stroke(0, 255, 255);
    strokeWeight(2);
    const x1 = Math.min(selectionArea.x1, selectionArea.x2);
    const y1 = Math.min(selectionArea.y1, selectionArea.y2);
    const x2 = Math.max(selectionArea.x1, selectionArea.x2);
    const y2 = Math.max(selectionArea.y1, selectionArea.y2);
    rect(x1 * tileSize, y1 * tileSize, 
         (x2 - x1 + 1) * tileSize, (y2 - y1 + 1) * tileSize);
  }
  
  // Draw cursor highlight
  if (editorMouseX >= 0 && editorMouseX < gridWidth && 
      editorMouseY >= 0 && editorMouseY < gridHeight) {
    noFill();
    stroke(255, 255, 0);
    strokeWeight(2);
    rect(editorMouseX * tileSize, editorMouseY * tileSize, tileSize, tileSize);
  }
  
  pop();
  
  // Draw HUD
  drawEditorHUD();
  
  // Draw help panel if requested
  if (showHelp) {
    drawHelpPanel();
  }
  
  // Draw current message
  if (message !== '') {
    fill(0, 0, 0, 180);
    noStroke();
    rect(width/2 - 200, height - 60, 400, 40, 10);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(16);
    text(message, width/2, height - 40);
  }
}

/**
 * Draw the editor HUD
 */
function drawEditorHUD() {
  // Draw top HUD bar
  fill(0, 0, 0, 180);
  noStroke();
  rect(0, 0, width, hudHeight);
  
  // Draw selected tile info
  fill(255);
  textAlign(LEFT, CENTER);
  textSize(16);
  const tileInfo = TILES[currentTile] || TILES['.'];
  text(`Selected: ${tileInfo.name} (${currentTile})`, 20, hudHeight/2);
  
  // Draw mouse position
  text(`Pos: ${editorMouseX},${editorMouseY}`, 250, hudHeight/2);
  
  // Draw grid size
  text(`Grid: ${gridWidth}x${gridHeight}`, 400, hudHeight/2);
  
  // Draw controls reminder
  textAlign(RIGHT, CENTER);
  text("H: Toggle Help | S: Save | G: Toggle Grid", width - 20, hudHeight/2);
  
  // Draw palette at the bottom
  drawTilePalette();
}

/**
 * Draw the tile palette at the bottom of the screen
 */
function drawTilePalette() {
  const paletteHeight = 50;
  const itemWidth = 40;
  const padding = 10;
  
  // Draw palette background
  fill(0, 0, 0, 180);
  noStroke();
  rect(0, height - paletteHeight, width, paletteHeight);
  
  // Draw palette items
  let x = padding;
  for (const key in TILES) {
    const tile = TILES[key];
    
    // Highlight current selection
    if (key === currentTile) {
      stroke(255, 255, 0);
      strokeWeight(3);
    } else {
      noStroke();
    }
    
    // Draw tile
    fill(tile.color);
    rect(x, height - paletteHeight + padding, itemWidth, itemWidth - 10, 5);
    
    // Draw label
    fill(255);
    textAlign(CENTER, TOP);
    textSize(12);
    text(key, x + itemWidth/2, height - paletteHeight + itemWidth + padding - 5);
    
    x += itemWidth + padding;
  }
}

/**
 * Draw the help panel
 */
function drawHelpPanel() {
  // Draw semi-transparent background
  fill(0, 0, 0, 220);
  rect(width/2 - 300, height/2 - 250, 600, 500, 10);
  
  // Draw title
  fill(255);
  textAlign(CENTER, TOP);
  textSize(24);
  text("LEVEL EDITOR HELP", width/2, height/2 - 230);
  
  // Draw help content
  textAlign(LEFT, TOP);
  textSize(16);
  let y = height/2 - 190;
  const lineHeight = 24;
  
  const helpLines = [
    "Number Keys (0-9): Select tile type",
    "E: Place enemy",
    "Left Click: Place selected tile",
    "Right Click & Drag: Pan view",
    "Mouse Wheel: Zoom in/out",
    "S: Save level",
    "L: Load level",
    "N: New level",
    "C: Copy selection",
    "V: Paste selection",
    "Delete: Clear selection",
    "R: Resize grid",
    "G: Toggle grid lines",
    "F: Fill selection with current tile",
    "ESC: Exit editor mode",
    "H: Toggle this help panel"
  ];
  
  for (const line of helpLines) {
    text(line, width/2 - 280, y);
    y += lineHeight;
  }
  
  // Draw tile legend
  y += 20;
  text("TILE LEGEND:", width/2 - 280, y);
  y += lineHeight;
  
  for (const key in TILES) {
    const tile = TILES[key];
    fill(tile.color);
    stroke(255);
    strokeWeight(1);
    rect(width/2 - 280, y, 20, 20);
    
    fill(255);
    noStroke();
    text(`${key}: ${tile.name}`, width/2 - 250, y + 3);
    y += lineHeight;
  }
  
  // Close button
  fill(80, 80, 80);
  stroke(255);
  rect(width/2 + 260, height/2 - 250, 30, 30);
  fill(255);
  textAlign(CENTER, CENTER);
  text("X", width/2 + 275, height/2 - 235);
}

/**
 * Show a message to the user
 */
function showMessage(msg, duration = 180) {
  message = msg;
  messageTimeout = duration;
}

/**
 * Handle mouse pressed event in the editor
 */
export function handleEditorMousePressed() {
  // Check if clicked on help panel close button
  if (showHelp && 
      mouseX >= width/2 + 260 && mouseX <= width/2 + 290 && 
      mouseY >= height/2 - 250 && mouseY <= height/2 - 220) {
    showHelp = false;
    return;
  }
  
  // Check if clicked on tile palette
  if (mouseY >= height - 50) {
    const itemWidth = 40;
    const padding = 10;
    let x = padding;
    
    for (const key in TILES) {
      if (mouseX >= x && mouseX <= x + itemWidth && 
          mouseY >= height - 50 + padding && mouseY <= height - 10) {
        currentTile = key;
        showMessage(`Selected: ${TILES[key].name}`);
        return;
      }
      x += itemWidth + padding;
    }
  }
  
  // Start dragging
  isDragging = true;
  dragStartX = mouseX + editorOffsetX;
  dragStartY = mouseY + editorOffsetY;
  
  // Place tile if left click
  if (mouseButton === LEFT) {
    if (editorMouseX >= 0 && editorMouseX < gridWidth && 
        editorMouseY >= 0 && editorMouseY < gridHeight) {
      // Start selection if shift key is pressed
      if (keyIsDown(SHIFT)) {
        selectionArea = {
          x1: editorMouseX,
          y1: editorMouseY,
          x2: editorMouseX,
          y2: editorMouseY
        };
      } else {
        // Place tile
        setTile(editorMouseY, editorMouseX, currentTile);
      }
    }
  }
}

/**
 * Handle mouse dragged event in the editor
 */
export function handleEditorMouseDragged() {
  // Update selection if active
  if (selectionArea && mouseButton === LEFT) {
    selectionArea.x2 = editorMouseX;
    selectionArea.y2 = editorMouseY;
  } else if (mouseButton === LEFT && !keyIsDown(SHIFT)) {
    // Continue placing tiles if left dragging
    if (editorMouseX >= 0 && editorMouseX < gridWidth && 
        editorMouseY >= 0 && editorMouseY < gridHeight) {
      setTile(editorMouseY, editorMouseX, currentTile);
    }
  }
}

/**
 * Handle mouse released event in the editor
 */
export function handleEditorMouseReleased() {
  isDragging = false;
}

/**
 * Handle mouse wheel event in the editor
 */
export function handleEditorMouseWheel(event) {
  // Zoom in/out
  const zoomFactor = event.delta > 0 ? 0.9 : 1.1;
  editorScale = constrain(editorScale * zoomFactor, 0.5, 3);
}

/**
 * Handle key pressed event in the editor
 */
export function handleEditorKeyPressed() {
  // Number keys select different tiles
  if (key >= '0' && key <= '9') {
    if (TILES[key]) {
      currentTile = key;
      showMessage(`Selected: ${TILES[key].name}`);
    }
  } else if (key === 'e' || key === 'E') {
    currentTile = 'E';
    showMessage(`Selected: ${TILES['E'].name}`);
  } else if (key === 'h' || key === 'H') {
    showHelp = !showHelp;
  } else if (key === 'g' || key === 'G') {
    showGrid = !showGrid;
    showMessage(`Grid lines: ${showGrid ? 'On' : 'Off'}`);
  } else if (key === 's' || key === 'S') {
    saveLevel();
  } else if (key === 'l' || key === 'L') {
    loadLevel();
  } else if (key === 'n' || key === 'N') {
    if (confirm('Create a new level? This will discard any unsaved changes.')) {
      resetEditor();
    }
  } else if (key === 'c' || key === 'C') {
    copySelection();
  } else if (key === 'v' || key === 'V') {
    pasteSelection();
  } else if (keyCode === DELETE || keyCode === BACKSPACE) {
    clearSelection();
  } else if (key === 'r' || key === 'R') {
    promptResizeGrid();
  } else if (key === 'f' || key === 'F') {
    fillSelection();
  } else if (key === 'p' || key === 'P') {
    // Playtest current map
    if (!window.playtestMode) {
      const levelData = exportLevel();
      if (!levelData) return;
      // Add custom level and load it
      gameState.addCustomLevel(levelData);
      const idx = gameState.state.levels.length - 1;
      // Infinite lives in playtest
      gameState.state.lives = Infinity;
      window.playtestMode = true;
      window.toggleEditorMode();
      loadGameLevel(idx);
      // Enter play mode
      gameState.state.menuDemoActive = false;
      gameState.setGameState("play");
      gameState.updateWindowGameState();
    } else {
      // Exit playtest and remove test level
      gameState.state.levels.pop();
      window.playtestMode = false;
      window.playtestReturning = true;
      window.toggleEditorMode();
    }
  }
}

/**
 * Copy selection to clipboard
 */
function copySelection() {
  if (!selectionArea) {
    showMessage('No selection to copy');
    return;
  }
  
  const x1 = Math.min(selectionArea.x1, selectionArea.x2);
  const y1 = Math.min(selectionArea.y1, selectionArea.y2);
  const x2 = Math.max(selectionArea.x1, selectionArea.x2);
  const y2 = Math.max(selectionArea.y1, selectionArea.y2);
  
  // Copy the selected region
  const copyData = [];
  for (let row = y1; row <= y2; row++) {
    let rowData = '';
    for (let col = x1; col <= x2; col++) {
      rowData += getTile(row, col) || '.';
    }
    copyData.push(rowData);
  }
  
  clipboardData = {
    width: x2 - x1 + 1,
    height: y2 - y1 + 1,
    data: copyData
  };
  
  showMessage(`Copied ${clipboardData.width}x${clipboardData.height} area`);
}

/**
 * Paste clipboard data at cursor position
 */
function pasteSelection() {
  if (!clipboardData) {
    showMessage('Nothing to paste');
    return;
  }
  
  // Paste at cursor position
  for (let row = 0; row < clipboardData.height; row++) {
    for (let col = 0; col < clipboardData.width; col++) {
      const targetRow = editorMouseY + row;
      const targetCol = editorMouseX + col;
      
      if (targetRow >= 0 && targetRow < gridHeight && 
          targetCol >= 0 && targetCol < gridWidth) {
        const tileType = clipboardData.data[row][col];
        setTile(targetRow, targetCol, tileType);
      }
    }
  }
  
  showMessage('Pasted selection');
}

/**
 * Clear the selected area (fill with empty space)
 */
function clearSelection() {
  if (!selectionArea) {
    showMessage('No selection to clear');
    return;
  }
  
  const x1 = Math.min(selectionArea.x1, selectionArea.x2);
  const y1 = Math.min(selectionArea.y1, selectionArea.y2);
  const x2 = Math.max(selectionArea.x1, selectionArea.x2);
  const y2 = Math.max(selectionArea.y1, selectionArea.y2);
  
  // Clear the selected area
  for (let row = y1; row <= y2; row++) {
    for (let col = x1; col <= x2; col++) {
      setTile(row, col, '.');
    }
  }
  
  showMessage('Selection cleared');
}

/**
 * Fill the selected area with the current tile type
 */
function fillSelection() {
  if (!selectionArea) {
    showMessage('No selection to fill');
    return;
  }
  
  const x1 = Math.min(selectionArea.x1, selectionArea.x2);
  const y1 = Math.min(selectionArea.y1, selectionArea.y2);
  const x2 = Math.max(selectionArea.x1, selectionArea.x2);
  const y2 = Math.max(selectionArea.y1, selectionArea.y2);
  
  // Fill the selected area with the current tile
  for (let row = y1; row <= y2; row++) {
    for (let col = x1; col <= x2; col++) {
      setTile(row, col, currentTile);
    }
  }
  
  showMessage(`Filled selection with ${TILES[currentTile].name}`);
}

/**
 * Prompt the user to resize the grid
 */
function promptResizeGrid() {
  const newWidth = parseInt(prompt('Enter new grid width:', gridWidth));
  if (isNaN(newWidth)) return;
  
  const newHeight = parseInt(prompt('Enter new grid height:', gridHeight));
  if (isNaN(newHeight)) return;
  
  resizeGrid(newWidth, newHeight);
}

/**
 * Save the current level to a file or clipboard
 */
function saveLevel() {
  // Format the level data
  let levelData = 'map: [\n';
  
  for (let row = 0; row < editorGrid.length; row++) {
    levelData += '  "' + editorGrid[row] + '",\n';
  }
  
  levelData += ']';
  
  // Create a temporary textarea to copy to clipboard
  const textarea = document.createElement('textarea');
  textarea.value = levelData;
  document.body.appendChild(textarea);
  textarea.select();
  
  try {
    document.execCommand('copy');
    showMessage('Level copied to clipboard');
  } catch (err) {
    showMessage('Failed to copy level to clipboard');
    console.error('Error copying to clipboard:', err);
  }
  
  document.body.removeChild(textarea);
  
  // Ask if user wants to export to a file as well
  if (confirm('Level copied to clipboard. Do you want to save to a file as well?')) {
    saveStringAsFile(levelData, `${newLevelName}.js`);
  }
}

/**
 * Save a string as a downloadable file
 */
function saveStringAsFile(content, filename) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Load a level (prompt for input)
 */
function loadLevel() {
  const mapData = prompt('Paste level data here:');
  if (!mapData) return;
  
  try {
    // Simple parsing of map data (assumes format: ["row1", "row2", ...])
    const lines = mapData.split('\n');
    const mapLines = [];
    
    for (const line of lines) {
      // Look for strings in quotes
      const match = line.match(/"([^"]+)"/);
      if (match) {
        mapLines.push(match[1]);
      }
    }
    
    if (mapLines.length === 0) {
      showMessage('Invalid map data format');
      return;
    }
    
    // Update grid with the loaded data
    editorGrid = mapLines;
    gridWidth = editorGrid[0].length;
    gridHeight = editorGrid.length;
    
    showMessage('Level loaded successfully');
  } catch (e) {
    showMessage('Error loading level: ' + e.message);
    console.error('Error loading level:', e);
  }
}

/**
 * Export the current level for use in the game
 */
export function exportLevel() {
  // Check for required elements
  let playerStartCount = 0;
  let exitCount = 0;
  
  for (let row = 0; row < editorGrid.length; row++) {
    for (let col = 0; col < editorGrid[row].length; col++) {
      const tile = editorGrid[row][col];
      if (tile === '3') playerStartCount++;
      if (tile === '4') exitCount++;
    }
  }
  
  if (playerStartCount === 0) {
    showMessage('Error: Level requires a player start point (3)');
    return null;
  }
  
  if (playerStartCount > 1) {
    showMessage('Error: Level must have exactly one player start point (3)');
    return null;
  }
  
  if (exitCount === 0) {
    showMessage('Error: Level requires an exit gate (4)');
    return null;
  }
  
  if (exitCount > 1) {
    showMessage('Error: Level must have exactly one exit gate (4)');
    return null;
  }
  
  // Format level for export
  return {
    map: [...editorGrid]
  };
}