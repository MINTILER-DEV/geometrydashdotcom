// Reverse-engineered source mirror extracted from the runtime bundle.
// Main bootstrap that creates the Phaser game from the split source files.
const PhaserRuntime = window.Phaser;

const gameConfig = {
  type: PhaserRuntime.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  resolution: 1,
  fps: { smoothStep: true },
  backgroundColor: "#000000",
  parent: document.body,
  input: { windowEvents: false },
  render: { powerPreference: "high-performance" },
  scale: {
    mode: PhaserRuntime.Scale.FIT,
    autoCenter: PhaserRuntime.Scale.CENTER_BOTH,
  },
  scene: [BootScene, GameScene],
};

new PhaserRuntime.Game(gameConfig);
