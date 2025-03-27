class BackgroundManager {
    constructor(scene) {
        this.scene = scene;
        this.backgroundTiles = [];
        this.bgNoiseValues = [];
        this.noiseOffset = 0;
        this.bgAnimEvent = null;
        
        // Constants for background
        this.tileSize = 32; // Smaller tile size
        this.baseScale = 0.06; // Smaller base scale
        this.patternSize = 8; // More variety in pattern
    }
    
    createBackground() {
        const { gameWidth, gameHeight } = this.scene;
        
        // Calculate grid dimensions with extra for scrolling
        const numCols = Math.ceil(gameWidth / this.tileSize) + 6;
        const numRows = Math.ceil(gameHeight / this.tileSize) + 6;
        const startX = -this.tileSize * 3;
        const startY = -this.tileSize * 3;
        
        // Create an array to store background tiles
        this.backgroundTiles = [];
        
        // Create a noise field for size variation
        this.bgNoiseValues = [];
        
        // Initialize 3D noise field for animation
        for (let x = 0; x < numCols; x++) {
            this.bgNoiseValues[x] = [];
            for (let y = 0; y < numRows; y++) {
                // Store initial random values for each tile (x, y, z)
                this.bgNoiseValues[x][y] = [
                    Math.random() * 10,
                    Math.random() * 10,
                    Math.random() * 10
                ];
            }
        }
        
        // Generate initial noise values for determining tile size and position
        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numCols; col++) {
                // Get position in grid
                const x = startX + col * this.tileSize;
                const y = startY + row * this.tileSize;
                
                // Skip some cells based on noise to prevent overcrowding
                const skipNoise = Math.sin(col * 0.5) * Math.cos(row * 0.5);
                if (skipNoise > 0.2) continue;
                
                // Get pattern coordinates (repeating)
                const patternX = col % this.patternSize;
                const patternY = row % this.patternSize;
                
                // Select icon based on pattern position
                const iconIndex = (patternX + patternY * this.patternSize) % this.scene.availableBgIcons.length;
                const iconKey = this.scene.availableBgIcons[iconIndex];
                
                // Create tile sprite with the selected icon
                const tile = this.scene.add.image(x, y, iconKey);
                
                // Apply varied scale based on noise value
                const noiseValue = (Math.sin(col * 0.3) + Math.cos(row * 0.3)) * 0.5 + 0.5;
                const scale = this.baseScale * (0.8 + noiseValue * 0.4); // Scale varies from 0.8x to 1.2x
                tile.setScale(scale);
                
                // Add low depth to ensure it's behind most game elements
                tile.setDepth(-10);
                
                // Store original positions and scales for animation
                tile.originX = x;
                tile.originY = y;
                tile.originScale = scale;
                
                // Add to the tiles array
                this.backgroundTiles.push(tile);
            }
        }
        
        // Set up background animation using 3D noise
        this.bgAnimEvent = this.scene.time.addEvent({
            delay: 100, // Update every 100ms for subtle animation
            callback: this.updateBackgroundAnimation,
            callbackScope: this,
            loop: true
        });
    }
    
    updateBackgroundAnimation() {
        // Increment noise offset for smooth animation
        this.noiseOffset += 0.01;
        
        // Apply subtle animations to each background tile
        this.backgroundTiles.forEach((tile, index) => {
            // Get tile grid position (approximate)
            const col = Math.floor((tile.x - (-this.tileSize * 3)) / this.tileSize);
            const row = Math.floor((tile.y - (-this.tileSize * 3)) / this.tileSize);
            
            // Ensure we have noise values for this position
            if (col >= 0 && col < this.bgNoiseValues.length && 
                row >= 0 && row < this.bgNoiseValues[col].length) {
                
                // Generate smooth noise values for this tile
                const noiseX = this.bgNoiseValues[col][row][0] + this.noiseOffset;
                const noiseY = this.bgNoiseValues[col][row][1] + this.noiseOffset * 0.7;
                const noiseZ = this.bgNoiseValues[col][row][2] + this.noiseOffset * 0.3;
                
                // Create smooth oscillation using sin function (-1 to 1)
                const offsetX = Math.sin(noiseX) * 2;
                const offsetY = Math.cos(noiseY) * 2;
                const scaleOffset = (Math.sin(noiseZ) * 0.1 + 1); // 0.9 to 1.1
                
                // Apply offsets to position and scale
                tile.x = tile.originX + offsetX;
                tile.y = tile.originY + offsetY;
                tile.setScale(tile.originScale * scaleOffset);
                
                // Subtle alpha changes as well
                const alphaOffset = Math.sin(noiseX * 0.5) * 0.1 + 0.9; // 0.8 to 1.0
                tile.setAlpha(alphaOffset);
            }
        });
    }
    
    warpBackground(x, y, intensity = 1) {
        // Apply a warp effect to background tiles based on distance from explosion
        this.backgroundTiles.forEach(tile => {
            // Calculate distance from explosion to this tile
            const dx = tile.x - x;
            const dy = tile.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Only affect tiles within a certain radius
            const radius = 200 * intensity;
            if (distance < radius) {
                // Calculate warp amount based on distance (closer = stronger effect)
                const warpFactor = Math.pow(1 - distance / radius, 2) * 30 * intensity;
                
                // Calculate direction away from explosion
                const angle = Math.atan2(dy, dx);
                const warpX = Math.cos(angle) * warpFactor;
                const warpY = Math.sin(angle) * warpFactor;
                
                // Apply warping as a tween for smooth recovery
                this.scene.tweens.add({
                    targets: tile,
                    x: tile.originX + warpX,
                    y: tile.originY + warpY,
                    scaleX: tile.originScale * (1 + warpFactor / 60),
                    scaleY: tile.originScale * (1 + warpFactor / 60),
                    ease: 'Elastic.Out',
                    duration: 500 + Math.random() * 500,
                    yoyo: true,
                    repeat: 0,
                    // Reset position after the effect
                    onComplete: () => {
                        this.scene.tweens.add({
                            targets: tile,
                            x: tile.originX,
                            y: tile.originY,
                            scaleX: tile.originScale,
                            scaleY: tile.originScale,
                            duration: 1000,
                            ease: 'Power2.out'
                        });
                    }
                });
            }
        });
    }
    
    shutdown() {
        // Clean up animation event
        if (this.bgAnimEvent) {
            this.bgAnimEvent.remove();
            this.bgAnimEvent = null;
        }
        
        // Clean up all background tiles
        this.backgroundTiles.forEach(tile => {
            if (tile) tile.destroy();
        });
        this.backgroundTiles = [];
    }
}

export default BackgroundManager; 