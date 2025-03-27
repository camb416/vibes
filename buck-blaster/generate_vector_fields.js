// Script to generate vector field images
const fs = require('fs');
const { createCanvas } = require('canvas');

// Create directory if it doesn't exist
const dir = 'images/vector_fields';
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

// Generate 16 different vector field patterns
for (let fieldIndex = 1; fieldIndex <= 16; fieldIndex++) {
    // Create a canvas
    const width = 256;
    const height = 256;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Fill with black background
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);
    
    // Generate vector field based on pattern type
    switch ((fieldIndex - 1) % 8) {
        case 0: // Circular
            drawCircularField(ctx, width, height, fieldIndex);
            break;
        case 1: // Spiral
            drawSpiralField(ctx, width, height, fieldIndex);
            break;
        case 2: // Noise
            drawNoiseField(ctx, width, height, fieldIndex);
            break;
        case 3: // Waves
            drawWaveField(ctx, width, height, fieldIndex);
            break;
        case 4: // Vortex
            drawVortexField(ctx, width, height, fieldIndex);
            break;
        case 5: // Grid
            drawGridField(ctx, width, height, fieldIndex);
            break;
        case 6: // Radial
            drawRadialField(ctx, width, height, fieldIndex);
            break;
        case 7: // Chaos
            drawChaosField(ctx, width, height, fieldIndex);
            break;
    }
    
    // Save the image
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`${dir}/field${fieldIndex}.png`, buffer);
    console.log(`Generated vector field ${fieldIndex}`);
}

// Helper functions to draw different vector field patterns

function drawCircularField(ctx, width, height, seed) {
    const centerX = width / 2;
    const centerY = height / 2;
    const cellSize = 16;
    
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
    ctx.lineWidth = 1;
    
    for (let y = 0; y < height; y += cellSize) {
        for (let x = 0; x < width; x += cellSize) {
            const dx = x - centerX;
            const dy = y - centerY;
            const angle = Math.atan2(dy, dx) + (seed % 2 ? Math.PI/2 : 0);
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(
                x + Math.cos(angle) * cellSize * 0.6,
                y + Math.sin(angle) * cellSize * 0.6
            );
            ctx.stroke();
        }
    }
}

function drawSpiralField(ctx, width, height, seed) {
    const centerX = width / 2;
    const centerY = height / 2;
    const cellSize = 16;
    
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    
    for (let y = 0; y < height; y += cellSize) {
        for (let x = 0; x < width; x += cellSize) {
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx*dx + dy*dy);
            const angle = Math.atan2(dy, dx) + distance / (50 + (seed % 5) * 10);
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(
                x + Math.cos(angle) * cellSize * 0.6,
                y + Math.sin(angle) * cellSize * 0.6
            );
            ctx.stroke();
        }
    }
}

function drawNoiseField(ctx, width, height, seed) {
    const cellSize = 16;
    
    ctx.strokeStyle = 'rgba(255, 0, 255, 0.5)';
    ctx.lineWidth = 1;
    
    for (let y = 0; y < height; y += cellSize) {
        for (let x = 0; x < width; x += cellSize) {
            // Simple pseudo-random angle based on position and seed
            const angle = (Math.sin(x * 0.1 + seed) + Math.cos(y * 0.1 + seed)) * Math.PI;
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(
                x + Math.cos(angle) * cellSize * 0.6,
                y + Math.sin(angle) * cellSize * 0.6
            );
            ctx.stroke();
        }
    }
}

function drawWaveField(ctx, width, height, seed) {
    const cellSize = 16;
    
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
    ctx.lineWidth = 1;
    
    for (let y = 0; y < height; y += cellSize) {
        for (let x = 0; x < width; x += cellSize) {
            const angle = Math.sin(y * 0.05 + seed) * Math.PI * 0.5;
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(
                x + Math.cos(angle) * cellSize * 0.6,
                y + Math.sin(angle) * cellSize * 0.6
            );
            ctx.stroke();
        }
    }
}

function drawVortexField(ctx, width, height, seed) {
    const centerX = width / 2;
    const centerY = height / 2;
    const cellSize = 16;
    
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.lineWidth = 1;
    
    for (let y = 0; y < height; y += cellSize) {
        for (let x = 0; x < width; x += cellSize) {
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx*dx + dy*dy);
            
            // Create vortex effect
            let angle;
            if (distance < 1) {
                angle = 0;
            } else {
                angle = Math.atan2(dy, dx) + Math.PI/2 + (seed % 2 ? -1 : 1) * (1 - Math.min(1, distance / 100));
            }
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(
                x + Math.cos(angle) * cellSize * 0.6,
                y + Math.sin(angle) * cellSize * 0.6
            );
            ctx.stroke();
        }
    }
}

function drawGridField(ctx, width, height, seed) {
    const cellSize = 16;
    
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
    ctx.lineWidth = 1;
    
    for (let y = 0; y < height; y += cellSize) {
        for (let x = 0; x < width; x += cellSize) {
            // Alternate horizontal and vertical lines
            const isHorizontal = (Math.floor(x / (cellSize * 4)) + Math.floor(y / (cellSize * 4)) + seed) % 2 === 0;
            const angle = isHorizontal ? 0 : Math.PI/2;
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(
                x + Math.cos(angle) * cellSize * 0.6,
                y + Math.sin(angle) * cellSize * 0.6
            );
            ctx.stroke();
        }
    }
}

function drawRadialField(ctx, width, height, seed) {
    const cellSize = 16;
    const numCenters = 3 + (seed % 3);
    const centers = [];
    
    // Create random centers
    for (let i = 0; i < numCenters; i++) {
        centers.push({
            x: Math.random() * width,
            y: Math.random() * height,
            strength: Math.random() * 0.5 + 0.5
        });
    }
    
    ctx.strokeStyle = 'rgba(0, 128, 255, 0.5)';
    ctx.lineWidth = 1;
    
    for (let y = 0; y < height; y += cellSize) {
        for (let x = 0; x < width; x += cellSize) {
            let angleX = 0;
            let angleY = 0;
            
            // Calculate influence from each center
            for (const center of centers) {
                const dx = x - center.x;
                const dy = y - center.y;
                const distance = Math.sqrt(dx*dx + dy*dy);
                if (distance < 1) continue;
                
                const influence = center.strength / distance;
                angleX += (dx / distance) * influence;
                angleY += (dy / distance) * influence;
            }
            
            const angle = Math.atan2(angleY, angleX);
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(
                x + Math.cos(angle) * cellSize * 0.6,
                y + Math.sin(angle) * cellSize * 0.6
            );
            ctx.stroke();
        }
    }
}

function drawChaosField(ctx, width, height, seed) {
    const cellSize = 16;
    
    ctx.strokeStyle = 'rgba(255, 128, 0, 0.5)';
    ctx.lineWidth = 1;
    
    for (let y = 0; y < height; y += cellSize) {
        for (let x = 0; x < width; x += cellSize) {
            // Chaotic pattern based on sine and cosine
            const angle = Math.sin(x * 0.01 * seed) * Math.cos(y * 0.01 * seed) * Math.PI * 2;
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(
                x + Math.cos(angle) * cellSize * 0.6,
                y + Math.sin(angle) * cellSize * 0.6
            );
            ctx.stroke();
        }
    }
}

console.log('Vector field generation complete!'); 