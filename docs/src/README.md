# Way of the Dodo - Code Structure

This directory contains the modular code structure for the "Way of the Dodo" p5.js game. The code has been organized using ES6 modules for better maintainability and organization.

## File Structure

- **main.js**: Entry point for the game, sets up p5.js functions and imports game logic
- **game.js**: Main game logic including level loading, game state management, and rendering
- **config.js**: Game configuration and constants
- **levels.js**: Level data and setup
- **utils.js**: Utility functions for tile handling, rendering, etc.

### Entities

The `entities` directory contains classes for game objects:

- **player.js**: Player class with movement, collision, and gravity flip mechanics
- **enemy.js**: Enemy class with patrol behavior and collision detection
- **coin.js**: Coin class with collection mechanics
- **exitGate.js**: Exit gate class for level completion

## How It Works

The game uses ES6 module syntax (`import`/`export`) to organize code into logical units. The main entry point is `main.js`, which sets up the p5.js environment and imports the game logic from other modules.

The p5.js lifecycle functions (`setup()`, `draw()`, etc.) are defined in `main.js` and exposed to the global scope for p5.js to use.
