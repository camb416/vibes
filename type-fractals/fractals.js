class FractalGenerator {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.width = canvas.width;
        this.height = canvas.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.colorPalettes = {
            mono: ['#000000', '#333333', '#666666', '#999999', '#cccccc'],
            warm: ['#d2691e', '#ff6b35', '#f7931e', '#ff9f43', '#feca57'],
            cool: ['#2e86ab', '#a23b72', '#f18f01', '#c44569', '#40407a'],
            neon: ['#ff0080', '#00ff80', '#8000ff', '#ff4081', '#00e676'],
            earth: ['#8b4513', '#daa520', '#228b22', '#cd853f', '#6b8e23'],
            ocean: ['#006994', '#20b2aa', '#4682b4', '#1e90ff', '#00ced1'],
            sunset: ['#ff69b4', '#ff8c00', '#dc143c', '#ff1493', '#ff6347'],
            forest: ['#355e3b', '#8fbc8f', '#654321', '#556b2f', '#9acd32']
        };
        this.currentPalette = 'mono';
        this.animationId = null;
        this.timeoutIds = [];
        this.isGenerating = false;
    }

    setColorPalette(palette) {
        this.currentPalette = palette;
    }

    getRandomColor() {
        const colors = this.colorPalettes[this.currentPalette];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    // Get text path data for fractal generation
    getTextPath(text, font, size, weight = 700) {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = size * 2;
        tempCanvas.height = size * 2;
        
        // Enable smooth text rendering
        tempCtx.imageSmoothingEnabled = true;
        tempCtx.textRenderingOptimization = 'optimizeQuality';
        
        tempCtx.font = `${weight} ${size}px ${font}`;
        tempCtx.textAlign = 'center';
        tempCtx.textBaseline = 'middle';
        tempCtx.fillStyle = '#000000';
        tempCtx.fillText(text, size, size);
        
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const pixels = [];
        
        // Sample at 1 pixel intervals for crisp results
        for (let y = 0; y < tempCanvas.height; y += 1) {
            for (let x = 0; x < tempCanvas.width; x += 1) {
                const index = (y * tempCanvas.width + x) * 4;
                if (imageData.data[index + 3] > 128) { // Alpha channel
                    pixels.push({
                        x: x - size,
                        y: y - size
                    });
                }
            }
        }
        
        return pixels;
    }

    // Recursive Division Algorithm
    generateRecursive(text, font, iterations, seed, onComplete = null, weight = 700) {
        this.clear();
        this.ctx.globalCompositeOperation = 'source-over';
        
        const baseSize = Math.min(this.width, this.height) * 0.3;
        const textPath = this.getTextPath(text, font, baseSize, weight);
        
        if (textPath.length === 0) {
            if (onComplete) onComplete();
            return;
        }
        
        const rng = this.createSeededRNG(seed);
        
        this.drawRecursiveLevel(textPath, this.centerX, this.centerY, 1, iterations, rng, 0, onComplete);
    }

    drawRecursiveLevel(path, x, y, scale, iterations, rng, depth, onComplete = null) {
        if (iterations <= 0 || scale < 0.01) {
            return;
        }
        
        const alpha = Math.max(0.1, 1 - (depth * 0.15));
        const color = this.getRandomColor();
        
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = color;
        
        // Draw current level
        path.forEach(point => {
            const px = x + point.x * scale;
            const py = y + point.y * scale;
            const size = Math.max(1, 2 * scale);
            this.ctx.fillRect(px, py, size, size);
        });
        
        this.ctx.restore();
        
        // Generate subdivisions
        const subdivisions = 3 + Math.floor(rng() * 3);
        const newScale = scale * (0.4 + rng() * 0.3);
        
        for (let i = 0; i < subdivisions; i++) {
            const angle = (i / subdivisions) * Math.PI * 2 + rng() * Math.PI * 0.5;
            const distance = scale * (50 + rng() * 100);
            const newX = x + Math.cos(angle) * distance;
            const newY = y + Math.sin(angle) * distance;
            
            if (newX > -100 && newX < this.width + 100 && 
                newY > -100 && newY < this.height + 100) {
                
                this.trackedTimeout(() => {
                    this.drawRecursiveLevel(path, newX, newY, newScale, iterations - 1, rng, depth + 1, onComplete);
                }, depth * 50);
            }
        }
        
        // Call completion callback for initial call
        if (onComplete && depth === 0) {
            this.trackedTimeout(onComplete, iterations * 500);
        }
    }

    // Spiral Transform Algorithm
    generateSpiral(text, font, iterations, seed, onComplete = null, weight = 700) {
        this.clear();
        this.ctx.globalCompositeOperation = 'source-over';
        
        const baseSize = Math.min(this.width, this.height) * 0.2;
        const textPath = this.getTextPath(text, font, baseSize, weight);
        
        if (textPath.length === 0) {
            if (onComplete) onComplete();
            return;
        }
        
        const rng = this.createSeededRNG(seed);
        
        this.drawSpiralLevel(textPath, 0, iterations, rng, onComplete);
    }

    drawSpiralLevel(path, currentIteration, maxIterations, rng, onComplete = null) {
        if (currentIteration >= maxIterations) {
            if (onComplete) onComplete();
            return;
        }
        
        const progress = currentIteration / maxIterations;
        const scale = 0.8 - (progress * 0.6);
        const angle = currentIteration * Math.PI * 0.618; // Golden angle
        const radius = progress * Math.min(this.width, this.height) * 0.4;
        
        const x = this.centerX + Math.cos(angle) * radius;
        const y = this.centerY + Math.sin(angle) * radius;
        
        const alpha = Math.max(0.1, 1 - progress);
        const color = this.getRandomColor();
        
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = color;
        this.ctx.translate(x, y);
        this.ctx.rotate(angle);
        
        // Draw rotated text
        path.forEach(point => {
            const px = point.x * scale;
            const py = point.y * scale;
            const size = Math.max(1, 2 * scale);
            this.ctx.fillRect(px, py, size, size);
        });
        
        this.ctx.restore();
        
        // Continue spiral
        this.trackedTimeout(() => {
            this.drawSpiralLevel(path, currentIteration + 1, maxIterations, rng, onComplete);
        }, 50);
    }

    // Tree Branching Algorithm
    generateTree(text, font, iterations, seed, onComplete = null, weight = 700) {
        this.clear();
        this.ctx.globalCompositeOperation = 'source-over';
        
        const baseSize = Math.min(this.width, this.height) * 0.15;
        const textPath = this.getTextPath(text, font, baseSize, weight);
        
        if (textPath.length === 0) {
            if (onComplete) onComplete();
            return;
        }
        
        const rng = this.createSeededRNG(seed);
        
        this.drawTreeBranch(textPath, this.centerX, this.centerY - this.height * 0.3, 
                           -Math.PI / 2, 1, iterations, rng, 0, onComplete);
    }

    drawTreeBranch(path, x, y, angle, scale, iterations, rng, depth, onComplete = null) {
        if (iterations <= 0 || scale < 0.05) {
            return;
        }
        
        const alpha = Math.max(0.1, 1 - (depth * 0.12));
        const color = this.getRandomColor();
        
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = color;
        this.ctx.translate(x, y);
        this.ctx.rotate(angle);
        
        // Draw text at branch point
        path.forEach(point => {
            const px = point.x * scale;
            const py = point.y * scale;
            const size = Math.max(1, 2 * scale);
            this.ctx.fillRect(px, py, size, size);
        });
        
        this.ctx.restore();
        
        // Generate branches
        const branchCount = 2 + Math.floor(rng() * 2);
        const branchLength = scale * (60 + rng() * 40);
        const newScale = scale * (0.6 + rng() * 0.2);
        
        for (let i = 0; i < branchCount; i++) {
            const branchAngle = angle + (rng() - 0.5) * Math.PI * 0.8;
            const newX = x + Math.cos(branchAngle) * branchLength;
            const newY = y + Math.sin(branchAngle) * branchLength;
            
            if (newX > -100 && newX < this.width + 100 && 
                newY > -100 && newY < this.height + 100) {
                
                this.trackedTimeout(() => {
                    this.drawTreeBranch(path, newX, newY, branchAngle, newScale, 
                                       iterations - 1, rng, depth + 1, onComplete);
                }, depth * 80);
            }
        }
        
        // Call completion callback for initial call
        if (onComplete && depth === 0) {
            this.trackedTimeout(onComplete, iterations * 600);
        }
    }

    // Geometric Tiling Algorithm
    generateGeometric(text, font, iterations, seed, onComplete = null, weight = 700) {
        this.clear();
        this.ctx.globalCompositeOperation = 'source-over';
        
        const baseSize = Math.min(this.width, this.height) * 0.1;
        const textPath = this.getTextPath(text, font, baseSize, weight);
        
        if (textPath.length === 0) {
            if (onComplete) onComplete();
            return;
        }
        
        const rng = this.createSeededRNG(seed);
        
        this.drawGeometricTiles(textPath, iterations, rng, onComplete);
    }

    drawGeometricTiles(path, iterations, rng, onComplete = null) {
        const tileSize = Math.min(this.width, this.height) / (iterations + 2);
        const cols = Math.ceil(this.width / tileSize) + 1;
        const rows = Math.ceil(this.height / tileSize) + 1;
        const totalTiles = rows * cols;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const tileIndex = row * cols + col;
                this.trackedTimeout(() => {
                    const x = col * tileSize;
                    const y = row * tileSize;
                    
                    // Create geometric transformation
                    const scale = 0.5 + (rng() * 0.5);
                    const rotation = rng() * Math.PI * 2;
                    const alpha = 0.3 + (rng() * 0.4);
                    
                    this.ctx.save();
                    this.ctx.globalAlpha = alpha;
                    this.ctx.fillStyle = this.getRandomColor();
                    this.ctx.translate(x + tileSize / 2, y + tileSize / 2);
                    this.ctx.rotate(rotation);
                    
                    // Draw transformed text
                    path.forEach(point => {
                        const px = point.x * scale;
                        const py = point.y * scale;
                        const size = Math.max(1, 2 * scale);
                        this.ctx.fillRect(px, py, size, size);
                    });
                    
                    this.ctx.restore();
                    
                    // Call completion callback after last tile
                    if (onComplete && tileIndex === totalTiles - 1) {
                        this.trackedTimeout(onComplete, 100);
                    }
                }, tileIndex * 20);
            }
        }
    }

    // Seeded random number generator
    createSeededRNG(seed) {
        let m = 0x80000000;
        let a = 1103515245;
        let c = 12345;
        let state = seed;
        
        return function() {
            state = (a * state + c) % m;
            return state / (m - 1);
        };
    }

    // Generate random seed
    generateSeed() {
        return Math.floor(Math.random() * 1000000);
    }

    // Stop any ongoing animation
    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    // Stop current generation
    stopGeneration() {
        this.isGenerating = false;
        
        // Clear all timeout IDs
        this.timeoutIds.forEach(id => clearTimeout(id));
        this.timeoutIds = [];
        
        // Stop any animation frames
        this.stopAnimation();
    }

    // Helper method to track timeouts
    trackedTimeout(callback, delay) {
        const id = setTimeout(() => {
            // Remove from tracked IDs when completed
            this.timeoutIds = this.timeoutIds.filter(timeoutId => timeoutId !== id);
            callback();
        }, delay);
        this.timeoutIds.push(id);
        return id;
    }
} 