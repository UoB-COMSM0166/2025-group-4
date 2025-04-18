/**
 * Effects Manager Module
 * Manages special effects like screen shake, hitstop, etc.
 */
import * as gameState from './gameState.js';
import { tileSize } from './config.js';

/**
 * Update screen shake using a trauma-based system
 * @param {number} deltaTime - Time since last update
 */
export function updateScreenShake(deltaTime) {
  // Reduce trauma over time - adjusted for deltaTime
  gameState.setScreenShakeTrauma(gameState.state.screenShakeTrauma * Math.pow(gameState.state.screenShakeDecay, deltaTime * 60)); // Scale with frameRate
  
  // If trauma is very small, reset it to zero
  if (gameState.state.screenShakeTrauma < 0.01) {
    gameState.setScreenShakeTrauma(0);
    gameState.setScreenShakeX(0);
    gameState.setScreenShakeY(0);
    gameState.setScreenShakeRotation(0);
    return;
  }
  
  // Use noise to create more natural-looking shake
  // Increment noise offsets for continuous variation - adjusted for deltaTime
  const noiseStep = 0.1 * deltaTime * 60; // Scale with frameRate
  gameState.setScreenShakeNoiseOffsetX(gameState.state.screenShakeNoiseOffsetX + noiseStep);
  gameState.setScreenShakeNoiseOffsetY(gameState.state.screenShakeNoiseOffsetY + noiseStep);
  gameState.setScreenShakeNoiseOffsetAngle(gameState.state.screenShakeNoiseOffsetAngle + noiseStep);
  
  // Calculate shake amount based on trauma (squared for more dramatic effect)
  const traumaSquared = gameState.state.screenShakeTrauma * gameState.state.screenShakeTrauma;
  
  // Use noise or random for shake direction
  if (window.noise) {
    // If p5.js noise function is available
    gameState.setScreenShakeX(gameState.state.hitScreenShakeAmount * traumaSquared * (window.noise(gameState.state.screenShakeNoiseOffsetX) * 2 - 1));
    gameState.setScreenShakeY(gameState.state.hitScreenShakeAmount * traumaSquared * (window.noise(gameState.state.screenShakeNoiseOffsetY) * 2 - 1));
    gameState.setScreenShakeRotation(0.05 * traumaSquared * (window.noise(gameState.state.screenShakeNoiseOffsetAngle) * 2 - 1));
  } else {
    // Fallback to random if noise isn't available
    gameState.setScreenShakeX(gameState.state.hitScreenShakeAmount * traumaSquared * (Math.random() * 2 - 1));
    gameState.setScreenShakeY(gameState.state.hitScreenShakeAmount * traumaSquared * (Math.random() * 2 - 1));
    gameState.setScreenShakeRotation(0.05 * traumaSquared * (Math.random() * 2 - 1));
  }
}

/**
 * Handle hitstop and invincibility timers
 * @param {number} deltaTime - Time since last update
 */
export function updateEffects(deltaTime) {
  // Update invincibility state
  if (gameState.state.invincibilityFramesLeft > 0) {
    gameState.setInvincibilityFramesLeft(gameState.state.invincibilityFramesLeft - 1);
    if (gameState.state.invincibilityFramesLeft <= 0) {
      gameState.setInvincibilityActive(false);
    }
  }

  // Handle hitstop
  if (gameState.state.hitstopActive) {
    gameState.setHitstopFramesLeft(gameState.state.hitstopFramesLeft - 1);
    updateScreenShake(deltaTime); // Update screen shake during hitstop
    
    if (gameState.state.hitstopFramesLeft <= 0) {
      gameState.endHitstop();
    }
    
    return true; // Indicate hitstop is active
  } 
  
  // Continue to update screen shake even after hitstop ends for smooth transition
  updateScreenShake(deltaTime);
  
  return false; // Indicate no hitstop
} 