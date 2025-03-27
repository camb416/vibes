class UIHelper {
    constructor(scene) {
        this.scene = scene;
    }

    // Create a pixelated PS1-style border
    createPixelatedBorder() {
        // Create border graphics objects
        this.scene.pixelBorderCurrent = this.scene.add.graphics();
        this.scene.pixelBorderNext = this.scene.add.graphics();
        
        // Set depth to ensure border is drawn on top
        this.scene.pixelBorderCurrent.setDepth(90);
        this.scene.pixelBorderNext.setDepth(90);
        
        // Generate initial border pattern
        this.generateBorderPattern(this.scene.pixelBorderCurrent);
        
        // Create a timer to periodically update the border with a fade effect
        this.updateBorderWithFade();
        
        // Set up periodic border updates
        this.scene.borderAnimEvent = this.scene.time.addEvent({
            delay: 8000, // Update every 8 seconds
            callback: this.updateBorderWithFade,
            callbackScope: this,
            loop: true
        });
    }
    
    // Generate a random pixel border pattern
    generateBorderPattern(graphics) {
        graphics.clear();
        
        // Border width and color
        const borderWidth = 6;
        const borderColor = 0xFFFFFF;
        const alpha = 0.4;
        
        // Screen dimensions
        const width = this.scene.gameWidth;
        const height = this.scene.gameHeight;
        
        // Pixel size for the border (PS1 style chunky pixels)
        const pixelSize = 3;
        
        // Calculate number of pixels needed for each edge
        const topPixels = Math.ceil(width / pixelSize);
        const sidePixels = Math.ceil(height / pixelSize);
        
        // Draw with some randomness for a glitchy PS1 effect
        graphics.fillStyle(borderColor, alpha);
        
        // Top border
        for (let i = 0; i < topPixels; i++) {
            // Occasionally skip a pixel for glitchy effect
            if (Math.random() > 0.1) {
                graphics.fillRect(
                    i * pixelSize, 
                    0,
                    pixelSize,
                    borderWidth
                );
            }
        }
        
        // Bottom border
        for (let i = 0; i < topPixels; i++) {
            if (Math.random() > 0.1) {
                graphics.fillRect(
                    i * pixelSize, 
                    height - borderWidth,
                    pixelSize,
                    borderWidth
                );
            }
        }
        
        // Left border
        for (let i = 0; i < sidePixels; i++) {
            if (Math.random() > 0.1) {
                graphics.fillRect(
                    0,
                    i * pixelSize,
                    borderWidth,
                    pixelSize
                );
            }
        }
        
        // Right border
        for (let i = 0; i < sidePixels; i++) {
            if (Math.random() > 0.1) {
                graphics.fillRect(
                    width - borderWidth,
                    i * pixelSize,
                    borderWidth,
                    pixelSize
                );
            }
        }
    }
    
    // Update the border with a fade effect
    updateBorderWithFade() {
        // Generate new pattern for the next border
        this.generateBorderPattern(this.scene.pixelBorderNext);
        
        // Set alpha to 0 initially
        this.scene.pixelBorderNext.alpha = 0;
        
        // Create a tween to fade out the current border and fade in the new one
        this.scene.tweens.add({
            targets: [this.scene.pixelBorderCurrent, this.scene.pixelBorderNext],
            alpha: { from: this.scene.pixelBorderCurrent.alpha, to: 1 - this.scene.pixelBorderCurrent.alpha },
            duration: 1000,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                // Swap the border objects
                const temp = this.scene.pixelBorderCurrent;
                this.scene.pixelBorderCurrent = this.scene.pixelBorderNext;
                this.scene.pixelBorderNext = temp;
            }
        });
    }
    
    // Create game buttons (share, refresh, etc.)
    createGameButtons() {
        // Create container for UI buttons
        const buttonContainer = this.scene.add.container(this.scene.gameWidth - 40, this.scene.gameHeight - 40);
        buttonContainer.setDepth(100);
        
        // Create share button
        const shareButtonBg = this.scene.add.circle(0, 0, 16, 0x000000, 0.6);
        
        const shareIcon = this.scene.add.text(0, 0, '🔗', {
            fontFamily: 'Arial',
            fontSize: '12px'
        });
        shareIcon.setOrigin(0.5, 0.5);
        shareIcon.y += 1; // Adjust position to center
        
        // Create refresh button
        const refreshButtonBg = this.scene.add.circle(-40, 0, 16, 0x000000, 0.6);
        
        const refreshIcon = this.scene.add.text(-40, 0, '🎨', {
            fontFamily: 'Arial',
            fontSize: '12px'
        });
        refreshIcon.setOrigin(0.5, 0.5);
        refreshIcon.y += 1; // Adjust position to center
        
        // Add interactivity to share button
        shareButtonBg.setInteractive({ useHandCursor: true });
        shareButtonBg.on('pointerdown', () => {
            // Only allow sharing when playing (not on title screen)
            if (!this.scene.onTitleScreen && !this.scene.gameOver) {
                this.scene.saveConfigToUrl();
                
                // Create "Copied!" text that fades out
                const copiedText = this.scene.add.text(
                    this.scene.gameWidth / 2, 
                    this.scene.gameHeight / 2, 
                    'URL copied to clipboard!', 
                    {
                        fontFamily: 'Arial, sans-serif',
                        fontSize: '18px',
                        fontStyle: 'bold',
                        fill: '#ffffff',
                        backgroundColor: '#000000',
                        padding: { x: 10, y: 6 }
                    }
                );
                copiedText.setOrigin(0.5, 0.5);
                copiedText.setDepth(200);
                
                // Fade out and destroy
                this.scene.tweens.add({
                    targets: copiedText,
                    alpha: 0,
                    y: this.scene.gameHeight / 2 - 50,
                    duration: 2000,
                    ease: 'Power2',
                    onComplete: () => {
                        copiedText.destroy();
                    }
                });
            }
        });
        
        // Add interactivity to refresh button
        refreshButtonBg.setInteractive({ useHandCursor: true });
        refreshButtonBg.on('pointerdown', () => {
            // Only allow refresh when playing (not on title screen)
            if (!this.scene.onTitleScreen && !this.scene.gameOver) {
                this.scene.refreshVisuals();
            }
        });
        
        // Add elements to container
        buttonContainer.add(shareButtonBg);
        buttonContainer.add(shareIcon);
        buttonContainer.add(refreshButtonBg);
        buttonContainer.add(refreshIcon);
        
        // Add hover effects
        this.addHoverEffect(shareButtonBg);
        this.addHoverEffect(refreshButtonBg);
    }
    
    // Add hover effect to a button
    addHoverEffect(button) {
        button.on('pointerover', () => {
            this.scene.tweens.add({
                targets: button,
                scale: 1.2,
                duration: 100
            });
        });
        
        button.on('pointerout', () => {
            this.scene.tweens.add({
                targets: button,
                scale: 1,
                duration: 100
            });
        });
    }
    
    // Create a star shape
    drawStar(graphics, x, y, points, outerRadius, innerRadius) {
        graphics.beginPath();
        
        for (let i = 0; i < points * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i / (points * 2)) * Math.PI * 2;
            const px = x + radius * Math.cos(angle);
            const py = y + radius * Math.sin(angle);
            
            if (i === 0) {
                graphics.moveTo(px, py);
            } else {
                graphics.lineTo(px, py);
            }
        }
        
        graphics.closePath();
        graphics.fillPath();
    }
}

export default UIHelper; 