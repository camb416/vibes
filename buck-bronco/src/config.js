export const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: [],
  render: {
    pixelArt: true,
    antialias: false
  }
}; 