/**
 * Game Logic Module
 * Core game update logic
 */
import * as gameState from './gameState.js';
import { tileSize } from './config.js';
import { particleSystem } from './particles.js';
import { completeGeneratedLevel } from './levelManager.js';
import { updateEffects } from './effectsManager.js';
import { camera } from './camera.js';

/**
 * Update game state
 * @param {number} deltaTime - Time since last update
 */
export function updateGame(deltaTime = gameState.state.DEFAULT_DELTA_TIME) {
  // Skip update if in stats display
  if (gameState.state.statsDisplayActive) {
    return;
  }
  
  // Update game time if game is active
  if (gameState.state.gameState === "play") {
    gameState.state.currentPlayTime = (millis() - gameState.state.gameStartTime) / 1000;
  }
  
  // If not in play state, nothing to update
  if (gameState.state.gameState !== "play") return;
  
  // Skip update if required objects aren't initialized
  if (!gameState.state.player || !gameState.state.tileMap) {
    console.warn("Player or tile map not initialized, skipping update");
    return;
  }

  // Ensure floating platforms is initialized
  if (!gameState.state.floatingPlatforms) {
    gameState.state.floatingPlatforms = [];
  }
  window.floatingPlatforms = gameState.state.floatingPlatforms;

  // Update global state 
  gameState.updateWindowGameState();

  // Update physics clock
  gameState.state.physicsClock += deltaTime;
  
  // Handle effects (hitstop, invincibility, screen shake)
  if (updateEffects(deltaTime)) {
    // If hitstop is active, only update particles and return
    particleSystem.update(deltaTime);
    return;
  }
  
  // Check for ice trap collision
  const playerCol = Math.floor(gameState.state.player.x / tileSize);
  const playerRow = Math.floor(gameState.state.player.y / tileSize);
  
  // Check if player has touched an ice trap
  if (
    playerRow >= 0 && playerRow < gameState.state.tileMap.length &&
    playerCol >= 0 && playerCol < gameState.state.tileMap[playerRow].length &&
    gameState.state.tileMap[playerRow].charAt(playerCol) === "I" &&
    !gameState.state.player.isFrozen
  ) {
    // Replace the ice trap with empty space so trap disappears
    gameState.state.tileMap[playerRow] = gameState.state.tileMap[playerRow].substring(0, playerCol) + "." + gameState.state.tileMap[playerRow].substring(playerCol + 1);
    // Set freeze effect (e.g., freeze for 60 frames, about 1 second)
    gameState.state.player.freezeTimer = 60;
    gameState.state.player.isFrozen = true;
    
    // Create frozen effect particles
    particleSystem.createFrozenEffect(gameState.state.player.x, gameState.state.player.y, gameState.state.player.w, gameState.state.player.h);
    
    console.log("Player touched ice trap, frozen for 1 second, trap disappears");
  }
  
  // Update player
  gameState.state.player.update(gameState.state.tileMap, 0, deltaTime);
  
  // Update camera to follow player
  camera.follow(
    gameState.state.player, 
    gameState.state.player.autoDirection, 
    gameState.state.player.gravityDirection
  );
  camera.update(deltaTime);
  
  // Update enemies and check collisions
  for (let enemy of gameState.state.enemies) {
    enemy.update(deltaTime);
    if (enemy.checkPlayerCollision(gameState.state.player)) {
      console.log("Player collision with enemy detected at:", enemy.x, enemy.y);
      gameState.loseLife();
      camera.addTrauma(0.6); // Add camera trauma on hit
      return;
    }
  }
  
  // Update and check coins
  for (let coin of gameState.state.coins) {
    if (!coin.collected && coin.checkCollision(gameState.state.player)) {
      console.log("Player collected coin at:", coin.x, coin.y);
      gameState.state.score += gameState.state.coinValue;  // Use difficulty appropriate coin value
      coin.collected = true;
      
      // Create coin collection particle effect
      particleSystem.createCoin(coin.x, coin.y);
      
      // Small camera boost on collecting coins
      camera.addTrauma(0.1);
    }
  }
  
  // Update bullets
  if (gameState.state.bullets && gameState.state.bullets.length > 0) {
    for (let i = gameState.state.bullets.length - 1; i >= 0; i--) {
      gameState.state.bullets[i].update(deltaTime);
      // If bullet is no longer active, remove from array
      if (!gameState.state.bullets[i].active) {
        gameState.state.bullets.splice(i, 1);
      }
    }
  }

  // Update floating platforms
  for (let platform of gameState.state.floatingPlatforms) {
    platform.update(deltaTime);
  }
  
  // Update particle system
  particleSystem.update(deltaTime);

  // When player reaches the exit, update level logic
  if (gameState.state.gameState === "play" && gameState.state.player && gameState.state.exitGate && 
      gameState.state.exitGate.checkPlayer(gameState.state.player) && !gameState.state.exitTriggered) {
    gameState.setExitTriggered(true);
    // Add special particles when reaching the exit
    particleSystem.createExitGate(gameState.state.exitGate.x, gameState.state.exitGate.y);
    
    // Play exit sound
    window.passSound.play();
    
    // Dramatic camera zoom effect on level completion
    camera.setZoom(1.2);
    camera.addTrauma(0.3);
    
    // In generated mode, use the generated level completion logic
    if (gameState.state.generatedMode) {
      // Award bonus points for completing a generated level
      gameState.state.score += 20;
      
      // Complete the level
      completeGeneratedLevel();
    } else {
      // Regular mode - load the next level or win if at the end
      gameState.state.levelIndex++;
      if (gameState.state.levelIndex >= gameState.state.levels.length) {
        gameState.setGameState("win");
      } else {
        import('./levelManager.js').then(levelManager => {
          levelManager.loadLevel(gameState.state.levelIndex);
        });
      }
    }
  }
} 