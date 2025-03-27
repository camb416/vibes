class VectorFieldGenerator {
    constructor(scene) {
        this.scene = scene;
    }

    generateVectorFieldTextures() {
        // Generate 16 different vector field patterns
        for (let fieldIndex = 1; fieldIndex <= 16; fieldIndex++) {
            const graphics = this.scene.add.graphics();
            const width = 256;
            const height = 256;
            
            // Fill with transparent background
            graphics.fillStyle(0x000000, 0);
            graphics.fillRect(0, 0, width, height);
            
            // Use different pattern types based on index
            const patternType = Math.ceil(fieldIndex / 2) % 8;
            
            switch (patternType) {
                case 0: // Circular
                    this.drawCircularField(graphics, width, height, fieldIndex);
                    break;
                case 1: // Spiral
                    this.drawSpiralField(graphics, width, height, fieldIndex);
                    break;
                case 2: // Noise
                    this.drawNoiseField(graphics, width, height, fieldIndex);
                    break;
                case 3: // Waves
                    this.drawWaveField(graphics, width, height, fieldIndex);
                    break;
                case 4: // Vortex
                    this.drawVortexField(graphics, width, height, fieldIndex);
                    break;
                case 5: // Grid
                    this.drawGridField(graphics, width, height, fieldIndex);
                    break;
                case 6: // Radial
                    this.drawRadialField(graphics, width, height, fieldIndex);
                    break;
                case 7: // Chaos
                    this.drawChaosField(graphics, width, height, fieldIndex);
                    break;
            }
            
            // Generate texture
            graphics.generateTexture(`vector_field${fieldIndex}`, width, height);
            graphics.destroy();
            
            console.log(`Generated vector field ${fieldIndex}`);
        }
    }

    drawCircularField(graphics, width, height, seed) {
        const centerX = width / 2;
        const centerY = height / 2;
        const arrowLength = 10;
        const arrowSpacing = 20;
        const rows = Math.floor(height / arrowSpacing);
        const cols = Math.floor(width / arrowSpacing);
        
        // Use seed to vary the pattern
        const offset = seed * 0.1;
        
        graphics.lineStyle(1, 0xffffff, 0.5);
        
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const posX = x * arrowSpacing + arrowSpacing / 2;
                const posY = y * arrowSpacing + arrowSpacing / 2;
                
                // Calculate vector direction (circular pattern around center)
                const dx = posX - centerX;
                const dy = posY - centerY;
                const angle = Math.atan2(dy, dx) + offset; // Add offset for variation
                
                // Draw arrow representing vector field direction
                const arrowX = posX;
                const arrowY = posY;
                const endX = arrowX + Math.cos(angle) * arrowLength;
                const endY = arrowY + Math.sin(angle) * arrowLength;
                
                graphics.beginPath();
                graphics.moveTo(arrowX, arrowY);
                graphics.lineTo(endX, endY);
                graphics.stroke();
            }
        }
    }

    drawSpiralField(graphics, width, height, seed) {
        const centerX = width / 2;
        const centerY = height / 2;
        const arrowLength = 10;
        const arrowSpacing = 20;
        const rows = Math.floor(height / arrowSpacing);
        const cols = Math.floor(width / arrowSpacing);
        
        // Use seed to vary the pattern
        const spiralTightness = (seed % 4) * 0.01 + 0.02;
        
        graphics.lineStyle(1, 0xffffff, 0.5);
        
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const posX = x * arrowSpacing + arrowSpacing / 2;
                const posY = y * arrowSpacing + arrowSpacing / 2;
                
                // Calculate vector direction (spiral pattern)
                const dx = posX - centerX;
                const dy = posY - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const baseAngle = Math.atan2(dy, dx);
                const angle = baseAngle + distance * spiralTightness;
                
                // Draw arrow representing vector field direction
                const arrowX = posX;
                const arrowY = posY;
                const endX = arrowX + Math.cos(angle) * arrowLength;
                const endY = arrowY + Math.sin(angle) * arrowLength;
                
                graphics.beginPath();
                graphics.moveTo(arrowX, arrowY);
                graphics.lineTo(endX, endY);
                graphics.stroke();
            }
        }
    }

    drawNoiseField(graphics, width, height, seed) {
        const arrowLength = 10;
        const arrowSpacing = 20;
        const rows = Math.floor(height / arrowSpacing);
        const cols = Math.floor(width / arrowSpacing);
        
        // Use seed to vary the pattern
        const noiseScale = seed * 0.01;
        
        graphics.lineStyle(1, 0xffffff, 0.5);
        
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const posX = x * arrowSpacing + arrowSpacing / 2;
                const posY = y * arrowSpacing + arrowSpacing / 2;
                
                // Use pseudo-random noise based on position
                const angle = (Math.sin(posX * 0.1 + noiseScale) + Math.cos(posY * 0.1 + noiseScale)) * Math.PI;
                
                // Draw arrow representing vector field direction
                const arrowX = posX;
                const arrowY = posY;
                const endX = arrowX + Math.cos(angle) * arrowLength;
                const endY = arrowY + Math.sin(angle) * arrowLength;
                
                graphics.beginPath();
                graphics.moveTo(arrowX, arrowY);
                graphics.lineTo(endX, endY);
                graphics.stroke();
            }
        }
    }

    drawWaveField(graphics, width, height, seed) {
        const arrowLength = 10;
        const arrowSpacing = 20;
        const rows = Math.floor(height / arrowSpacing);
        const cols = Math.floor(width / arrowSpacing);
        
        // Use seed to vary the pattern
        const waveFrequency = seed * 0.05;
        
        graphics.lineStyle(1, 0xffffff, 0.5);
        
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const posX = x * arrowSpacing + arrowSpacing / 2;
                const posY = y * arrowSpacing + arrowSpacing / 2;
                
                // Create wave pattern primarily along x-axis
                const angle = Math.sin(posY * 0.1 + waveFrequency) * Math.PI;
                
                // Draw arrow representing vector field direction
                const arrowX = posX;
                const arrowY = posY;
                const endX = arrowX + Math.cos(angle) * arrowLength;
                const endY = arrowY + Math.sin(angle) * arrowLength;
                
                graphics.beginPath();
                graphics.moveTo(arrowX, arrowY);
                graphics.lineTo(endX, endY);
                graphics.stroke();
            }
        }
    }

    drawVortexField(graphics, width, height, seed) {
        const centerX = width / 2;
        const centerY = height / 2;
        const arrowLength = 12;
        const arrowSpacing = 20;
        const rows = Math.floor(height / arrowSpacing);
        const cols = Math.floor(width / arrowSpacing);
        
        // Create vortices
        const vortexCount = (seed % 3) + 2; // 2-4 vortices based on seed
        const vortices = [];
        
        // Distribute vortices in a circle around the center
        for (let i = 0; i < vortexCount; i++) {
            const angle = (i / vortexCount) * Math.PI * 2;
            const distance = width * 0.25; // Place vortices at 1/4 width from center
            
            vortices.push({
                x: centerX + Math.cos(angle) * distance,
                y: centerY + Math.sin(angle) * distance,
                strength: (i % 2 === 0 ? 1 : -1) * 800 // Alternate clockwise and counterclockwise
            });
        }
        
        graphics.lineStyle(1, 0xffffff, 0.5);
        
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const posX = x * arrowSpacing + arrowSpacing / 2;
                const posY = y * arrowSpacing + arrowSpacing / 2;
                
                // Calculate influence from all vortices
                let vx = 0;
                let vy = 0;
                
                for (const vortex of vortices) {
                    const dx = posX - vortex.x;
                    const dy = posY - vortex.y;
                    const distSq = dx * dx + dy * dy;
                    
                    if (distSq > 0) {
                        // For vortex: perpendicular force, inversely proportional to distance
                        const factor = vortex.strength / distSq;
                        vx += -dy * factor;
                        vy += dx * factor;
                    }
                }
                
                // Calculate resulting angle
                const angle = Math.atan2(vy, vx);
                
                // Draw arrow representing vector field direction
                const arrowX = posX;
                const arrowY = posY;
                const endX = arrowX + Math.cos(angle) * arrowLength;
                const endY = arrowY + Math.sin(angle) * arrowLength;
                
                graphics.beginPath();
                graphics.moveTo(arrowX, arrowY);
                graphics.lineTo(endX, endY);
                graphics.stroke();
            }
        }
    }

    drawGridField(graphics, width, height, seed) {
        const arrowLength = 10;
        const arrowSpacing = 20;
        const rows = Math.floor(height / arrowSpacing);
        const cols = Math.floor(width / arrowSpacing);
        
        // Use seed to determine grid pattern
        const patternType = seed % 3; // 0, 1, or 2
        
        graphics.lineStyle(1, 0xffffff, 0.5);
        
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const posX = x * arrowSpacing + arrowSpacing / 2;
                const posY = y * arrowSpacing + arrowSpacing / 2;
                
                // Different angle calculation based on pattern type
                let angle;
                
                switch (patternType) {
                    case 0: // Alternating grid
                        angle = ((x + y) % 2 === 0) ? 0 : Math.PI / 2;
                        break;
                    case 1: // Checkered pattern
                        angle = ((x + y) % 2 === 0) ? Math.PI / 4 : -Math.PI / 4;
                        break;
                    case 2: // Stepped angles
                        angle = (Math.floor(x / 3) + Math.floor(y / 3)) % 4 * (Math.PI / 2);
                        break;
                }
                
                // Draw arrow representing vector field direction
                const arrowX = posX;
                const arrowY = posY;
                const endX = arrowX + Math.cos(angle) * arrowLength;
                const endY = arrowY + Math.sin(angle) * arrowLength;
                
                graphics.beginPath();
                graphics.moveTo(arrowX, arrowY);
                graphics.lineTo(endX, endY);
                graphics.stroke();
            }
        }
    }

    drawRadialField(graphics, width, height, seed) {
        const arrowLength = 10;
        const arrowSpacing = 20;
        const rows = Math.floor(height / arrowSpacing);
        const cols = Math.floor(width / arrowSpacing);
        
        // Create several radial points
        const pointCount = (seed % 3) + 2; // 2-4 points based on seed
        const points = [];
        
        // Set up center point
        points.push({
            x: width / 2,
            y: height / 2,
            isAttractor: false // Center is a repeller
        });
        
        // Add more points around the periphery
        for (let i = 0; i < pointCount; i++) {
            const angle = (i / pointCount) * Math.PI * 2;
            const distance = width * 0.4; // Place points at 40% width from center
            
            points.push({
                x: width/2 + Math.cos(angle) * distance,
                y: height/2 + Math.sin(angle) * distance,
                isAttractor: i % 2 === 0 // Alternate attractors and repellers
            });
        }
        
        graphics.lineStyle(1, 0xffffff, 0.5);
        
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const posX = x * arrowSpacing + arrowSpacing / 2;
                const posY = y * arrowSpacing + arrowSpacing / 2;
                
                // Calculate influence from all points
                let vx = 0;
                let vy = 0;
                
                for (const point of points) {
                    const dx = posX - point.x;
                    const dy = posY - point.y;
                    const distSq = dx * dx + dy * dy;
                    
                    if (distSq > 0) {
                        // Calculate direction to/from the point
                        const dist = Math.sqrt(distSq);
                        const factor = 1000 / distSq * (point.isAttractor ? -1 : 1);
                        
                        vx += dx / dist * factor;
                        vy += dy / dist * factor;
                    }
                }
                
                // Calculate resulting angle
                const angle = Math.atan2(vy, vx);
                
                // Draw arrow representing vector field direction
                const arrowX = posX;
                const arrowY = posY;
                const endX = arrowX + Math.cos(angle) * arrowLength;
                const endY = arrowY + Math.sin(angle) * arrowLength;
                
                graphics.beginPath();
                graphics.moveTo(arrowX, arrowY);
                graphics.lineTo(endX, endY);
                graphics.stroke();
            }
        }
    }

    drawChaosField(graphics, width, height, seed) {
        const arrowLength = 10;
        const arrowSpacing = 20;
        const rows = Math.floor(height / arrowSpacing);
        const cols = Math.floor(width / arrowSpacing);
        
        // Use seed to create pseudo-random but deterministic chaos
        const chaosScale = seed * 0.01;
        
        graphics.lineStyle(1, 0xffffff, 0.5);
        
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const posX = x * arrowSpacing + arrowSpacing / 2;
                const posY = y * arrowSpacing + arrowSpacing / 2;
                
                // Create chaotic angle using multiple sine/cosine waves with different frequencies
                const angle = 
                    Math.sin(posX * 0.05 + chaosScale) * Math.cos(posY * 0.05) + 
                    Math.cos(posX * 0.07) * Math.sin(posY * 0.07 + chaosScale) +
                    Math.sin(posX * posY * 0.0001 + chaosScale);
                
                // Draw arrow representing vector field direction
                const arrowX = posX;
                const arrowY = posY;
                const endX = arrowX + Math.cos(angle) * arrowLength;
                const endY = arrowY + Math.sin(angle) * arrowLength;
                
                graphics.beginPath();
                graphics.moveTo(arrowX, arrowY);
                graphics.lineTo(endX, endY);
                graphics.stroke();
            }
        }
    }
}

export default VectorFieldGenerator; 