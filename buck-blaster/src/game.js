// Create a new Phaser game instance
const config = {
    type: Phaser.AUTO,
    width: 640,
    height: 480,
    parent: 'game-container',
    backgroundColor: '#2D3047',
    pixelArt: true,
    roundPixels: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [MainScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 640,
        height: 480,
        max: {
            width: 1280,
            height: 960
        }
    }
};

// Create the game instance
const game = new Phaser.Game(config);

// No need for manual resize handling as Phaser.Scale.FIT will handle it automatically 