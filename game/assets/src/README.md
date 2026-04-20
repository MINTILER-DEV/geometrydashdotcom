# Geometry Dash Source Mirror

This directory is a reverse-engineered, human-readable split of the custom Geometry Dash code that was originally embedded in `game/assets/index-game.js`.

Files are separated by responsibility:
- `shared/core-constants.js`: shared constants, helpers, boot scene, player state, texture lookup helpers
- `parsing/level-codec.js`: level decoding and raw object parsing
- `data/object-definitions.js`: object metadata table used during level instantiation
- `runtime/level-runtime.js`: level object creation, sectioning, triggers, and camera-facing world state
- `runtime/player-runtime.js`: player physics, collisions, portals, and death/completion animation
- `runtime/color-audio.js`: color tween manager and audio manager
- `runtime/effects.js`: pulse and celebration effects
- `scenes/game-scene.js`: main scene coordination
- `index.js`: Phaser game bootstrap

The live page still executes `game/assets/index-game.js`. This source mirror exists so humans can navigate and continue refactoring toward a true module-based runtime without starting from a one-line bundle.
