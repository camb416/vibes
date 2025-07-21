const fs = require('fs');
const { createCanvas } = require('canvas');

// Create player sprite
const playerCanvas = createCanvas(32, 32);
const playerCtx = playerCanvas.getContext('2d');
playerCtx.fillStyle = '#4a90e2';
playerCtx.fillRect(8, 8, 16, 24);
playerCtx.fillRect(4, 4, 24, 8);
playerCtx.fillRect(12, 32, 8, 8);
playerCtx.fillRect(20, 32, 8, 8);

// Create bronco sprite
const broncoCanvas = createCanvas(64, 64);
const broncoCtx = broncoCanvas.getContext('2d');
broncoCtx.fillStyle = '#8b4513';
broncoCtx.fillRect(16, 24, 32, 16);
broncoCtx.fillRect(8, 16, 16, 8);
broncoCtx.fillRect(40, 16, 16, 8);
broncoCtx.fillRect(12, 40, 8, 16);
broncoCtx.fillRect(28, 40, 8, 16);

// Create ground tile
const groundCanvas = createCanvas(32, 32);
const groundCtx = groundCanvas.getContext('2d');
groundCtx.fillStyle = '#8b4513';
groundCtx.fillRect(0, 0, 32, 32);
groundCtx.fillStyle = '#654321';
for(let i = 0; i < 32; i += 8) {
    for(let j = 0; j < 32; j += 8) {
        if((i + j) % 16 === 0) {
            groundCtx.fillRect(i, j, 8, 8);
        }
    }
}

// Save the images
const playerBuffer = playerCanvas.toBuffer('image/png');
const broncoBuffer = broncoCanvas.toBuffer('image/png');
const groundBuffer = groundCanvas.toBuffer('image/png');

fs.writeFileSync('player.png', playerBuffer);
fs.writeFileSync('bronco.png', broncoBuffer);
fs.writeFileSync('ground.png', groundBuffer); 