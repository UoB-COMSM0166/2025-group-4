# Puppy's Magical Adventure

A gravity-defying platformer game built with p5.js. Control a puppy character through challenging levels by flipping gravity to avoid obstacles, collect coins, and reach the exit gate.

## File Structure

### Core Files
- **main.js**: Entry point for the game, sets up p5.js environment and handles loading screen
- **game.js**: Central module that re-exports functionality from specialized modules
- **gameLogic.js**: Core game update logic and physics
- **gameState.js**: State management including level progress, score, and player state
- **config.js**: Game constants and dynamic configuration
- **utils.js**: Utility functions for tile handling, rendering, and common tasks

### Rendering and Visual Effects
- **renderer.js**: All drawing and rendering functions
- **camera.js**: Camera system with parallax scrolling, shake effects, and viewport management
- **particles.js**: Particle system for visual effects (death, coin collection, gravity flip, etc.)
- **effectsManager.js**: Manages game effects like screen shake and hitstop

### Level Management
- **levels.js**: Predefined level data and configuration
- **levelManager.js**: Handles level loading, transitions, and generated levels
- **mapGenerator.js**: Procedural level generation system
- **levelEditor.js**: In-game level editor with save/load functionality

### Input Handling
- **inputHandler.js**: Processes keyboard, mouse, and touch inputs

### Entities

The `entities` directory contains classes for game objects:

- **player.js**: Player character with movement, collision detection, and gravity flipping
- **enemy.js**: Enemy classes including basic enemies and shooting enemies
- **coin.js**: Collectible coins with animation and collision
- **exitGate.js**: Exit gates for level completion
- **floatingPlatform.js**: Moving platforms that follow paths
- **difficultySelector.js**: Interactive difficulty selection objects

## Assets

The game includes various assets organized in the `assets` directory:

### Art
- Character sprites (player, enemies)
- Environment tiles for different level themes
- Background images
- Interactive elements (gates, coins, etc.)

### Music & Sound
- Background music
- Sound effects (coin collection, death, gravity flip, etc.)

## Game Features

- **Gravity Flipping**: Core mechanic allowing the player to flip gravity direction
- **Progressive Difficulty**: Multiple levels with increasing challenge
- **Level Generation**: Procedurally generated levels for endless play
- **Custom Level Editor**: Create and share your own levels
- **Particle Effects**: Rich visual feedback for game events
- **Mobile Support**: Touch controls for mobile devices
- **Difficulty Settings**: Multiple difficulty options affecting gameplay parameters

## How It Works

The game uses ES6 module syntax (`import`/`export`) to organize code into logical units. The main entry point is `main.js`, which sets up the p5.js environment and imports game logic from other modules.

The game uses a state-based architecture where the game state is managed centrally and different modules handle specific aspects of gameplay. The renderer handles drawing the game based on the current state, and the game logic updates the state based on user input and game rules.

The camera system provides smooth following, parallax backgrounds, and screen shake effects to enhance the visual experience.

## Controls

- **Space/Touch**: Flip gravity
- **ESC**: Access level editor (from menu)
- **Mouse**: Select options in menus, place tiles in editor

## Game Modes

- **Standard Play**: Progress through handcrafted levels
- **Random Mode**: Play through procedurally generated levels
- **Level Editor**: Create and test your own levels
