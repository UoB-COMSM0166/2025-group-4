/**
 * Camera Module
 * Handles all camera-related functionality for the game
 */
import { tileSize } from './config.js';

// Camera configuration
const CAMERA_CONFIG = {
  // How quickly the camera catches up to its target
  horizontalEasing: 0.08,
  verticalEasing: 0.05,
  // How far ahead to look in the direction of movement
  lookAheadAmount: 0.3,
  lookAheadEasing: 0.1,
  // Camera bounds margins (% of screen)
  boundaryMargin: 0.1,
  // Camera zoom settings
  defaultZoom: 1.0,
  minZoom: 0.8,
  maxZoom: 1.5,
  zoomEasing: 0.05,
  // Screen shake settings
  shakeDecay: 0.9,
  shakeRotationFactor: 0.01,
};

// Create a camera object with state
export const camera = {
  // Position
  x: 0,
  y: 0,
  // Target position
  targetX: 0,
  targetY: 0,
  // Look-ahead offset
  lookAheadX: 0,
  targetLookAheadX: 0,
  lookAheadY: 0,
  targetLookAheadY: 0,
  // Zoom
  zoom: CAMERA_CONFIG.defaultZoom,
  targetZoom: CAMERA_CONFIG.defaultZoom,
  // Screen shake
  shakeTrauma: 0,
  shakeX: 0,
  shakeY: 0,
  shakeRotation: 0,
  // Reference to map dimensions
  mapWidth: 0,
  mapHeight: 0,
  // Track player direction for look-ahead
  playerDirection: 1,
  playerVerticalDirection: 0,
  // Offset from center (calculated at runtime)
  offsetX: 0,
  offsetY: 0,

  /**
   * Initialize the camera
   * @param {number} mapWidth - Width of the map in pixels
   * @param {number} mapHeight - Height of the map in pixels
   */
  init(mapWidth, mapHeight) {
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.lookAheadX = 0;
    this.targetLookAheadX = 0;
    this.lookAheadY = 0;
    this.targetLookAheadY = 0;
    this.zoom = CAMERA_CONFIG.defaultZoom;
    this.targetZoom = CAMERA_CONFIG.defaultZoom;
    this.shakeTrauma = 0;
    this.offsetX = window.width / 2;
    this.offsetY = window.height / 2;
  },

  /**
   * Update the camera's target position to follow an entity
   * @param {Object} entity - Entity to follow (must have x, y properties)
   * @param {number} horizontalDirection - Direction of movement (-1 = left, 1 = right)
   * @param {number} verticalDirection - Direction of movement (-1 = up, 1 = down)
   */
  follow(entity, horizontalDirection = 1, verticalDirection = 0) {
    if (!entity) return;
    
    // Update player direction for look-ahead
    this.playerDirection = horizontalDirection;
    this.playerVerticalDirection = verticalDirection;
    
    // Update target look-ahead based on movement direction and speed
    this.targetLookAheadX = horizontalDirection * CAMERA_CONFIG.lookAheadAmount * window.width * 0.3;
    this.targetLookAheadY = verticalDirection * CAMERA_CONFIG.lookAheadAmount * window.height * 0.2;
    
    // Set the target position to follow the entity
    this.targetX = entity.x;
    this.targetY = entity.y;
  },

  /**
   * Update camera position with smooth movement
   * @param {number} deltaTime - Time since last update (seconds)
   */
  update(deltaTime = 1/60) {
    // Normalize deltaTime to 60 FPS
    const normalizedDT = deltaTime * 60;
    
    // Update look-ahead with easing
    this.lookAheadX += (this.targetLookAheadX - this.lookAheadX) * 
                      CAMERA_CONFIG.lookAheadEasing * normalizedDT;
    this.lookAheadY += (this.targetLookAheadY - this.lookAheadY) * 
                      CAMERA_CONFIG.lookAheadEasing * normalizedDT;
    
    // Move camera toward target position with easing
    this.x += ((this.targetX + this.lookAheadX) - this.x) * 
              CAMERA_CONFIG.horizontalEasing * normalizedDT;
    this.y += ((this.targetY + this.lookAheadY) - this.y) * 
              CAMERA_CONFIG.verticalEasing * normalizedDT;
    
    // Apply zoom easing
    this.zoom += (this.targetZoom - this.zoom) * 
                CAMERA_CONFIG.zoomEasing * normalizedDT;
    
    // Constrain camera to map boundaries
    this.applyBoundaryConstraints();
    
    // Update screen shake
    this.updateScreenShake(deltaTime);
  },
  
  /**
   * Apply camera transformation to p5 context
   */
  apply() {
    window.push();
    
    // Apply screen shake if active
    if (this.shakeTrauma > 0) {
      window.translate(window.width/2 + this.shakeX, window.height/2 + this.shakeY);
      window.rotate(this.shakeRotation);
      window.translate(-window.width/2, -window.height/2);
    }
    
    // Apply camera transformation
    window.translate(window.width/2, window.height/2);
    window.scale(this.zoom);
    window.translate(-this.x, -this.y);
  },
  
  /**
   * Reset p5 transformation
   */
  end() {
    window.pop();
  },
  
  /**
   * Get current camera offset X for legacy compatibility
   * @returns {number} Camera offset X
   */
  getOffsetX() {
    return this.x - window.width / (2 * this.zoom);
  },
  
  /**
   * Get current camera offset Y for legacy compatibility
   * @returns {number} Camera offset Y
   */
  getOffsetY() {
    return this.y - window.height / (2 * this.zoom);
  },
  
  /**
   * Constrain camera to map boundaries
   */
  applyBoundaryConstraints() {
    // Calculate visible area based on zoom
    const visibleWidth = window.width / this.zoom;
    const visibleHeight = window.height / this.zoom;
    
    // Check if map is smaller than viewport
    const isMapSmallerThanViewportWidth = this.mapWidth < visibleWidth;
    const isMapSmallerThanViewportHeight = this.mapHeight < visibleHeight;
    
    if (isMapSmallerThanViewportWidth) {
      // Center horizontally if map fits entirely within viewport width
      this.x = this.mapWidth / 2;
    } else {
      // Apply normal horizontal constraints if map is larger than viewport
      const leftBound = visibleWidth * 0.5;
      const rightBound = this.mapWidth - visibleWidth * 0.5;
      this.x = Math.max(leftBound, Math.min(this.x, rightBound));
    }
    
    if (isMapSmallerThanViewportHeight) {
      // Center vertically if map fits entirely within viewport height
      this.y = this.mapHeight / 2;
    } else {
      // Apply normal vertical constraints if map is larger than viewport
      const topBound = visibleHeight * 0.5;
      const bottomBound = this.mapHeight - visibleHeight * 0.5;
      this.y = Math.max(topBound, Math.min(this.y, bottomBound));
    }
  },
  
  /**
   * Set zoom level with limits
   * @param {number} zoomLevel - Target zoom level
   */
  setZoom(zoomLevel) {
    this.targetZoom = Math.max(CAMERA_CONFIG.minZoom, 
                       Math.min(zoomLevel, CAMERA_CONFIG.maxZoom));
  },
  
  /**
   * Add trauma to the camera (for screen shake)
   * @param {number} amount - Amount of trauma to add (0-1)
   */
  addTrauma(amount) {
    this.shakeTrauma = Math.min(1.0, this.shakeTrauma + amount);
  },
  
  /**
   * Update screen shake effects
   * @param {number} deltaTime - Time since last update
   */
  updateScreenShake(deltaTime) {
    if (this.shakeTrauma > 0) {
      const intensity = this.shakeTrauma * this.shakeTrauma;
      
      // Use noise for organic, repeatable shake
      this.shakeX = intensity * 20 * (window.noise(Date.now() * 0.01) * 2 - 1);
      this.shakeY = intensity * 20 * (window.noise(Date.now() * 0.01 + 100) * 2 - 1);
      this.shakeRotation = intensity * CAMERA_CONFIG.shakeRotationFactor * 
                         (window.noise(Date.now() * 0.01 + 200) * 2 - 1);
      
      // Decay trauma over time
      this.shakeTrauma *= Math.pow(CAMERA_CONFIG.shakeDecay, deltaTime * 60);
      
      // Reset when trauma is very small
      if (this.shakeTrauma < 0.01) {
        this.shakeTrauma = 0;
        this.shakeX = 0;
        this.shakeY = 0;
        this.shakeRotation = 0;
      }
    }
  },
  
  /**
   * Convert world coordinates to screen coordinates
   * @param {number} worldX - X coordinate in world space
   * @param {number} worldY - Y coordinate in world space
   * @returns {Object} Screen coordinates {x, y}
   */
  worldToScreen(worldX, worldY) {
    const screenX = (worldX - this.x) * this.zoom + window.width / 2;
    const screenY = (worldY - this.y) * this.zoom + window.height / 2;
    return { x: screenX, y: screenY };
  },
  
  /**
   * Convert screen coordinates to world coordinates
   * @param {number} screenX - X coordinate in screen space
   * @param {number} screenY - Y coordinate in screen space
   * @returns {Object} World coordinates {x, y}
   */
  screenToWorld(screenX, screenY) {
    const worldX = (screenX - window.width / 2) / this.zoom + this.x;
    const worldY = (screenY - window.height / 2) / this.zoom + this.y;
    return { x: worldX, y: worldY };
  }
}; 