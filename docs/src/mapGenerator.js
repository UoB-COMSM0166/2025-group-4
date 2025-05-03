/**
 * Procedural Map Generator
 */

// Asset paths for randomly selecting level assets
export const assetSets = [
  {
    wall: "src/assets/art/level_1_ice/tiles.png",
    background: "src/assets/art/level_1_ice/background.png",
    spike: "src/assets/art/level_1_ice/thorn.png",
    platformUpDown: "src/assets/art/level_1_ice/platforms6.png"
  },
  {
    wall: "src/assets/art/level_2/tiles.png",
    background: "src/assets/art/level_2/background.png",
    spike: "src/assets/art/level_2/thorn.png",
    platformleftright: "src/assets/art/level_6-9/platforms7.png"
  },
  {
    wall: "src/assets/art/level_3/tiles.png",
    background: "src/assets/art/level_3/background.png",
    spike: "src/assets/art/level_3/thorn.png"
  },
  {
    wall: "src/assets/art/level_4/tiles.png",
    background: "src/assets/art/level_4/background.png",
    spike: "src/assets/art/level_4/thorn.png"
  },
  {
    wall: "src/assets/art/level_5/tiles.png",
    background: "src/assets/art/level_5/background.png",
    spike: "src/assets/art/level_5/thorn.png"
  },
  {
    wall: "src/assets/art/level_6-9/tiles.png",
    background: "src/assets/art/level_6-9/background.png",
    spike: "src/assets/art/level_6-9/thorn.png"
  },
  {
    wall: "src/assets/art/level_10/tiles.png",
    background: "src/assets/art/level_10/background.png",
    spike: "src/assets/art/level_10/thorn.png"
  }
];

/**
 * Simple seeded random number generator
 */
class SeededRandom {
  constructor(seed = Date.now()) {
    this.seed = seed;
  }

  // Generate a random number between 0 and 1
  random() {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  // Generate a random integer between min and max (inclusive)
  randomInt(min, max) {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }

  // Generate a random boolean with given probability
  randomBool(probability = 0.5) {
    return this.random() < probability;
  }
}

// Global random generator instance
let rng = new SeededRandom();

/**
 * Set the random seed for map generation
 * @param {number} seed - The seed to use for random generation
 */
export function setMapSeed(seed) {
  // Convert string to number if needed
  if (typeof seed === 'string') {
    // Simple string hash function
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    seed = Math.abs(hash);
  }
  
  // Create new RNG with the seed
  rng = new SeededRandom(seed);
  console.log(`Map generator seed set to: ${seed}`);
}

/**
 * Generate a procedurally created level
 * @param {number} width - Width of the level in tiles
 * @param {number} height - Height of the level in tiles
 * @param {number} difficulty - Difficulty level (0-10)
 * @returns {Object} - Level object with map and assets
 */
export function generateMap(width = 30, height = 15, difficulty = 1) {
  // Create a blank map
  let map = [];
  
  // Initialize with empty spaces
  for (let y = 0; y < height; y++) {
    let row = "";
    for (let x = 0; x < width; x++) {
      row += ".";
    }
    map.push(row);
  }
  
  // Add border walls
  map = addBorders(map);

  // Add player start point (near the left side)
  const startX = Math.floor(width * 0.2);
  const startY = Math.floor(height * 0.8);
  
  // Make sure the player starting position and surrounding area are clear
  clearArea(map, startX, startY, 2);
  
  // Add ground platform directly under player start
  const platformWidth = 4;
  for (let x = startX - 2; x <= startX + 2; x++) {
    if (x > 0 && x < width - 1 && startY + 1 < height - 1) {
      map = placeElement(map, x, startY + 1, "1");
    }
  }
  
  // Place the player start marker
  map = placeElement(map, startX, startY, "3");

  // Add exit gate (near the right side)
  const exitX = Math.floor(width * 0.8);
  const exitY = Math.floor(height * 0.2);
  clearArea(map, exitX, exitY, 2);
  
  // Add platform under exit gate
  for (let x = exitX - 2; x <= exitX + 2; x++) {
    if (x > 0 && x < width - 1 && exitY + 1 < height - 1) {
      map = placeElement(map, x, exitY + 1, "1");
    }
  }
  
  // Place the exit gate marker
  map = placeElement(map, exitX, exitY, "4");

  // Create platforms and ensure path exists
  map = createPlatforms(map, startX, startY, exitX, exitY, difficulty);

  // Add some coins
  map = addCoins(map, Math.max(3, Math.floor(width * height * 0.03)));

  // Add enemies based on difficulty
  const enemyCount = Math.floor(difficulty * 0.7);
  map = addEnemies(map, enemyCount);

  // Add hazards (spikes)
  const hazardCount = Math.floor(difficulty * 0.5);
  map = addHazards(map, hazardCount);
  
  // Ensure the exit is reachable; if not, regenerate this map
  if (!isMapReachable(map, startX, startY, exitX, exitY)) {
    console.warn("Generated map unreachable, regenerating...");
    return generateMap(width, height, difficulty);
  }
  
  // Verify player start is still in the map
  let playerFound = false;
  for (let y = 0; y < map.length; y++) {
    if (map[y].includes("3")) {
      playerFound = true;
      break;
    }
  }
  
  // If player start is missing, place it again
  if (!playerFound) {
    console.log("Player start marker was lost during generation, adding it back");
    map = placeElement(map, startX, startY, "3");
  }

  // Randomly select assets from available sets
  const assetIndex = rng.randomInt(0, assetSets.length - 1);
  
  return {
    map: map,
    assets: assetSets[assetIndex]
  };
}

/**
 * Add borders around the map
 */
function addBorders(map) {
  const width = map[0].length;
  const height = map.length;
  
  // Add top and bottom walls
  let topRow = "";
  let bottomRow = "";
  for (let x = 0; x < width; x++) {
    topRow += "1";
    bottomRow += "1";
  }
  map[0] = topRow;
  map[height - 1] = bottomRow;
  
  // Add walls on left and right sides
  for (let y = 1; y < height - 1; y++) {
    map[y] = "1" + map[y].substring(1, width - 1) + "1";
  }
  
  return map;
}

/**
 * Place an element on the map
 */
function placeElement(map, x, y, element) {
  // Ensure we're within bounds
  if (y < 0 || y >= map.length || x < 0 || x >= map[0].length) {
    return map;
  }
  
  const row = map[y];
  map[y] = row.substring(0, x) + element + row.substring(x + 1);
  return map;
}

/**
 * Create platforms and ensure a valid path from start to exit
 */
function createPlatforms(map, startX, startY, exitX, exitY, difficulty) {
  // Clear the area around the start and exit with a larger radius
  clearArea(map, startX, startY, 3);
  clearArea(map, exitX, exitY, 3);
  
  // Generate a valid path from start to exit
  const path = generatePath(map, startX, startY, exitX, exitY);
  
  // Clear the path to ensure there are no obstacles blocking it
  clearPath(map, path);
  
  // Add platforms along and around the path
  for (const point of path) {
    // Create platforms under path points with some probability
    if (rng.random() < 0.7) {
      // Add a platform below this point
      const platformWidth = 2 + Math.floor(rng.random() * 4);
      const platformX = Math.max(1, point.x - Math.floor(platformWidth / 2));
      
      for (let x = platformX; x < platformX + platformWidth && x < map[0].length - 1; x++) {
        if (x > 0 && point.y + 1 < map.length - 1) {
          map = placeElement(map, x, point.y + 1, "1");
        }
      }
    }
  }
  
  // Add some random additional platforms
  const numExtraPlatforms = 5 + Math.floor(difficulty * 2);
  for (let i = 0; i < numExtraPlatforms; i++) {
    const platformWidth = 2 + Math.floor(rng.random() * 5);
    const platformX = 1 + Math.floor(rng.random() * (map[0].length - platformWidth - 2));
    const platformY = 1 + Math.floor(rng.random() * (map.length - 3));
    
    // Check if the platform would block the critical path
    let blocksCriticalPath = false;
    for (const point of path) {
      if (point.y === platformY && point.x >= platformX && point.x < platformX + platformWidth) {
        blocksCriticalPath = true;
        break;
      }
    }
    
    // Only place the platform if it doesn't block the critical path
    if (!blocksCriticalPath) {
      for (let x = platformX; x < platformX + platformWidth; x++) {
        map = placeElement(map, x, platformY, "1");
      }
    }
  }
  
  // Final check to ensure start and exit areas are clear
  clearArea(map, startX, startY, 2);
  clearArea(map, exitX, exitY, 2);
  
  // Make sure there's a platform under the player
  for (let x = startX - 1; x <= startX + 1; x++) {
    if (x > 0 && x < map[0].length - 1) {
      map = placeElement(map, x, startY + 1, "1");
    }
  }
  
  // Make sure there's a platform under the exit
  for (let x = exitX - 1; x <= exitX + 1; x++) {
    if (x > 0 && x < map[0].length - 1) {
      map = placeElement(map, x, exitY + 1, "1");
    }
  }
  
  return map;
}

/**
 * Generate a path from start to exit
 * Improved to create a more robust path
 */
function generatePath(map, startX, startY, exitX, exitY) {
  const path = [];
  
  // Use more steps for a more detailed path
  const steps = Math.max(Math.abs(exitX - startX), Math.abs(exitY - startY)) * 3;
  
  // Create waypoints for a more interesting path
  const numWaypoints = 2 + Math.floor(rng.random() * 3); // 2-4 waypoints
  const waypoints = [];
  
  // Add start and end points
  waypoints.push({x: startX, y: startY});
  
  // Add intermediate waypoints
  for (let i = 0; i < numWaypoints; i++) {
    // Create waypoints that move generally toward the exit
    const progress = (i + 1) / (numWaypoints + 1);
    const baseX = startX + (exitX - startX) * progress;
    const baseY = startY + (exitY - startY) * progress;
    
    // Add some randomness to waypoint positions
    const randomX = baseX + (rng.random() * 8 - 4);
    const randomY = baseY + (rng.random() * 6 - 3);
    
    // Ensure waypoint is within map bounds
    const waypointX = Math.max(2, Math.min(map[0].length - 3, Math.floor(randomX)));
    const waypointY = Math.max(2, Math.min(map.length - 3, Math.floor(randomY)));
    
    waypoints.push({x: waypointX, y: waypointY});
  }
  
  // Add exit point
  waypoints.push({x: exitX, y: exitY});
  
  // Generate path segments between each pair of waypoints
  for (let i = 0; i < waypoints.length - 1; i++) {
    const start = waypoints[i];
    const end = waypoints[i + 1];
    
    // Calculate number of steps based on distance
    const segmentSteps = Math.max(Math.abs(end.x - start.x), Math.abs(end.y - start.y)) * 2;
    
    for (let j = 0; j <= segmentSteps; j++) {
      const t = j / segmentSteps;
      const x = Math.floor(start.x + (end.x - start.x) * t);
      const y = Math.floor(start.y + (end.y - start.y) * t);
      
      // Add slight randomness to the path
      const offsetX = Math.floor(rng.random() * 2) * (rng.random() < 0.5 ? -1 : 1);
      const offsetY = Math.floor(rng.random() * 2) * (rng.random() < 0.5 ? -1 : 1);
      
      const pathX = Math.max(1, Math.min(map[0].length - 2, x + offsetX));
      const pathY = Math.max(1, Math.min(map.length - 2, y + offsetY));
      
      // Add the point to the path
      path.push({ x: pathX, y: pathY });
      
      // Add extra points to ensure wide passages
      if (j > 0 && j < segmentSteps) {
        const prevPoint = path[path.length - 2];
        
        // If we've moved diagonally, add intermediate points
        if (prevPoint.x !== pathX && prevPoint.y !== pathY) {
          path.push({ x: prevPoint.x, y: pathY }); // Horizontal movement
          path.push({ x: pathX, y: prevPoint.y }); // Vertical movement
        }
      }
    }
  }
  
  return path;
}

/**
 * Clear an area around a point (make sure there are no walls)
 * Enhanced to ensure a more open area
 */
function clearArea(map, centerX, centerY, radius) {
  // Clear in a circle pattern for a more natural clearing
  for (let y = centerY - radius; y <= centerY + radius; y++) {
    for (let x = centerX - radius; x <= centerX + radius; x++) {
      // Calculate distance from center
      const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
      
      // Only clear if within radius
      if (distance <= radius && y > 0 && y < map.length - 1 && x > 0 && x < map[0].length - 1) {
        const element = getElement(map, x, y);
        // Clear walls and hazards
        if (element === "1" || element === "5" || element === "^" || 
            element === "v" || element === "<" || element === ">") {
          map = placeElement(map, x, y, ".");
        }
      }
    }
  }
  return map;
}

/**
 * Get element at position
 */
function getElement(map, x, y) {
  if (y < 0 || y >= map.length || x < 0 || x >= map[0].length) {
    return null;
  }
  return map[y].charAt(x);
}

/**
 * Add coins to the map
 */
function addCoins(map, count) {
  const width = map[0].length;
  const height = map.length;
  
  for (let i = 0; i < count; i++) {
    let x, y;
    let attempts = 0;
    
    // Find an empty spot for the coin
    do {
      x = 1 + Math.floor(rng.random() * (width - 2));
      y = 1 + Math.floor(rng.random() * (height - 2));
      attempts++;
    } while (getElement(map, x, y) !== "." && attempts < 100);
    
    if (attempts < 100) {
      map = placeElement(map, x, y, "2");
    }
  }
  
  return map;
}

/**
 * Add enemies to the map
 */
function addEnemies(map, count) {
  const width = map[0].length;
  const height = map.length;
  
  for (let i = 0; i < count; i++) {
    let x, y;
    let attempts = 0;
    
    // Find a spot for the enemy with solid ground below
    do {
      x = 1 + Math.floor(rng.random() * (width - 2));
      y = 1 + Math.floor(rng.random() * (height - 3));
      attempts++;
    } while ((getElement(map, x, y) !== "." || getElement(map, x, y + 1) !== "1") && attempts < 100);
    
    if (attempts < 100) {
      // 25% chance of shooter enemy
      const enemyType = rng.random() < 0.25 ? "E" : "e";
      map = placeElement(map, x, y, enemyType);
    }
  }
  
  return map;
}

/**
 * Add hazards (spikes) to the map
 */
function addHazards(map, count) {
  const width = map[0].length;
  const height = map.length;
  
  for (let i = 0; i < count; i++) {
    let x, y;
    let attempts = 0;
    
    // Find a spot for the hazard
    do {
      x = 1 + Math.floor(rng.random() * (width - 2));
      y = 1 + Math.floor(rng.random() * (height - 2));
      attempts++;
    } while (getElement(map, x, y) !== "." && attempts < 100);
    
    if (attempts < 100) {
      // Choose direction based on surroundings
      let hazardType = "5"; // Default up-facing spike
      
      // If there's a wall below, use up-facing spike (default)
      // If there's a wall above, use down-facing spike
      if (getElement(map, x, y - 1) === "1") {
        hazardType = "v"; // Down-facing spike
      }
      // If there's a wall to the right, use left-facing spike
      else if (getElement(map, x + 1, y) === "1") {
        hazardType = "<"; // Left-facing spike
      }
      // If there's a wall to the left, use right-facing spike
      else if (getElement(map, x - 1, y) === "1") {
        hazardType = ">"; // Right-facing spike
      }
      
      map = placeElement(map, x, y, hazardType);
    }
  }
  
  return map;
}

/**
 * Clear the path on the map (removing walls)
 * Enhanced to ensure wide passages
 */
function clearPath(map, path) {
  // Create a set to track cleared positions
  const cleared = new Set();
  
  for (const point of path) {
    // Use a radius to create a wider path
    const clearRadius = 2;
    
    for (let y = point.y - clearRadius; y <= point.y + clearRadius; y++) {
      for (let x = point.x - clearRadius; x <= point.x + clearRadius; x++) {
        // Calculate distance from point
        const distance = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
        
        // Only clear if within radius and not already cleared
        if (distance <= clearRadius && y > 0 && y < map.length - 1 && x > 0 && x < map[0].length - 1) {
          const posKey = `${x},${y}`;
          
          // Skip if already cleared
          if (cleared.has(posKey)) continue;
          
          // Clear walls and hazards
          const element = getElement(map, x, y);
          if (element === "1" || element === "5" || element === "^" || 
              element === "v" || element === "<" || element === ">") {
            map = placeElement(map, x, y, ".");
            cleared.add(posKey);
          }
        }
      }
    }
  }
  return map;
}

/**
 * Clear areas around the start and exit
 */
function clearEntranceAndExit(map, startX, startY, exitX, exitY) {
  // Clear a larger area around the start and exit points
  map = clearArea(map, startX, startY, 3);
  map = clearArea(map, exitX, exitY, 3);
  return map;
}

/**
 * Generate a series of procedural levels
 * @param {number} count - Number of levels to generate
 * @returns {Array} - Array of level objects
 */
export function generateLevels(count = 10, seed = undefined) {
  // Set the seed if provided
  if (seed !== undefined) {
    setMapSeed(seed);
  }
  
  const levels = [];
  
  for (let i = 0; i < count; i++) {
    // Increase difficulty gradually
    const difficulty = 1 + (i * 0.5);
    
    // Gradually increase level size
    const width = Math.min(40, 25 + Math.floor(i / 2) * 5);
    const height = Math.min(20, 12 + Math.floor(i / 3) * 2);
    
    levels.push(generateMap(width, height, difficulty));
  }
  
  return levels;
}

// Helper function to check reachability between start and exit
function isMapReachable(map, startX, startY, exitX, exitY) {
  const rows = map.length;
  const cols = map[0].length;
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const queue = [[startY, startX]];
  visited[startY][startX] = true;
  const directions = [[1,0],[-1,0],[0,1],[0,-1]];
  while (queue.length) {
    const [r, c] = queue.shift();
    if (r === exitY && c === exitX) return true;
    for (const [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc]) {
        const tile = map[nr].charAt(nc);
        if (!['1','5','^','v','<','>'].includes(tile)) {
          visited[nr][nc] = true;
          queue.push([nr, nc]);
        }
      }
    }
  }
  return false;
} 