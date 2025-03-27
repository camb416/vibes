class TitleScreenManager {
    constructor(scene) {
        this.scene = scene;
        this.titleContainer = null;
        this.subtitleText = null;
        this.startText = null;
        this.controlsContainer = null;
        this.titleClickArea = null;
        this.titleDecorations = [];
        this.titleNoiseValues = [0, 0, 0]; // For animation
        this.titleAnimEvent = null;
        this.noiseOffset = 0; // Initialize noiseOffset
    }

    createTitleScreen() {
        // Flag to track if we're on the title screen
        this.scene.onTitleScreen = true;
        
        // Create semi-transparent overlay for title screen
        this.titleOverlay = this.scene.add.rectangle(
            this.scene.gameWidth / 2,
            this.scene.gameHeight / 2,
            this.scene.gameWidth,
            this.scene.gameHeight,
            0x000000,
            0.7
        );
        this.titleOverlay.setDepth(99);
        
        // Create a container for the title
        this.titleContainer = this.scene.add.container(
            this.scene.gameWidth / 2,
            this.scene.gameHeight / 3
        );
        this.titleContainer.setDepth(100);
        
        // Add title text with PS1-style chunky pixel font
        const titleText = this.scene.add.text(0, 0, 'BUCK SHOOTER', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '48px',
            fontStyle: 'bold',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 8,
            fill: '#ffffff'
        });
        titleText.setOrigin(0.5);
        
        // Add BUCK logo
        const logo = this.scene.add.image(0, -80, 'buck_logo');
        logo.setScale(0.6);
        
        this.titleContainer.add(logo);
        this.titleContainer.add(titleText);
        
        // Add subtitle text
        this.subtitleText = this.scene.add.text(
            this.scene.gameWidth / 2,
            this.scene.gameHeight / 2,
            'A PS1-style arcade shooter',
            {
                fontFamily: 'Arial, sans-serif',
                fontSize: '18px',
                fontStyle: 'bold',
                align: 'center',
                fill: '#aaaaaa'
            }
        );
        this.subtitleText.setOrigin(0.5);
        this.subtitleText.setDepth(100);
        
        // Add "Press to Start" text
        this.startText = this.scene.add.text(
            this.scene.gameWidth / 2,
            this.scene.gameHeight * 0.6,
            'CLICK TO START',
            {
                fontFamily: 'Arial, sans-serif',
                fontSize: '24px',
                fontStyle: 'bold',
                align: 'center',
                fill: '#ffffff'
            }
        );
        this.startText.setOrigin(0.5);
        this.startText.setDepth(100);
        
        // Add flashing animation to start text
        this.scene.tweens.add({
            targets: this.startText,
            alpha: 0.3,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
        
        // Create PS1-style decorations
        this.createTitleDecorations();
        
        // Create control instructions
        this.createControlInstructions();
        
        // Add a clickable area over the entire screen
        this.titleClickArea = this.scene.add.rectangle(
            this.scene.gameWidth / 2,
            this.scene.gameHeight / 2,
            this.scene.gameWidth,
            this.scene.gameHeight,
            0xffffff,
            0
        );
        this.titleClickArea.setDepth(101);
        this.titleClickArea.setInteractive();
        this.titleClickArea.on('pointerdown', () => {
            this.scene.startGameFromTitle();
        });
        
        // Generate random values for animation
        this.titleNoiseValues = [
            Math.random() * 10,
            Math.random() * 10,
            Math.random() * 10
        ];
        
        // Set up title animation
        this.titleAnimEvent = this.scene.time.addEvent({
            delay: 16, // 60 FPS
            callback: this.updateTitleAnimations,
            callbackScope: this,
            loop: true
        });
    }
    
    createTitleDecorations() {
        // Array to store all decorative elements
        this.titleDecorations = [];
        
        // Create some PS1-style decorative elements
        
        // 1. Create pixelated stars in the background
        for (let i = 0; i < 20; i++) {
            const star = this.scene.add.rectangle(
                Phaser.Math.Between(50, this.scene.gameWidth - 50),
                Phaser.Math.Between(50, this.scene.gameHeight - 50),
                Phaser.Math.Between(2, 4),
                Phaser.Math.Between(2, 4),
                0xffffff
            );
            star.setDepth(100);
            star.setAlpha(Phaser.Math.FloatBetween(0.3, 0.7));
            
            // Add twinkling animation
            this.scene.tweens.add({
                targets: star,
                alpha: { from: star.alpha, to: 0.1 },
                duration: Phaser.Math.Between(1000, 3000),
                yoyo: true,
                repeat: -1
            });
            
            this.titleDecorations.push(star);
        }
        
        // 2. Add some geometric shapes
        const geometryColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
        
        for (let i = 0; i < 8; i++) {
            const shape = this.scene.add.graphics();
            shape.fillStyle(geometryColors[i % geometryColors.length], 0.3);
            
            // Choose random shape type
            const shapeType = Phaser.Math.Between(0, 2);
            const x = Phaser.Math.Between(0, this.scene.gameWidth);
            const y = Phaser.Math.Between(0, this.scene.gameHeight);
            const size = Phaser.Math.Between(20, 60);
            
            switch (shapeType) {
                case 0: // Rectangle
                    shape.fillRect(x, y, size, size);
                    break;
                case 1: // Circle
                    shape.fillCircle(x, y, size / 2);
                    break;
                case 2: // Triangle
                    this.drawStar(shape, x, y, 3, size / 2, size / 4);
                    break;
            }
            
            shape.setDepth(98); // Behind text but above overlay
            
            // Add floating animation
            this.scene.tweens.add({
                targets: shape,
                x: Phaser.Math.Between(-size, size),
                y: Phaser.Math.Between(-size, size),
                duration: Phaser.Math.Between(3000, 6000),
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1
            });
            
            this.titleDecorations.push(shape);
        }
    }
    
    createControlInstructions() {
        // Create a container for control instructions
        this.controlsContainer = this.scene.add.container(
            this.scene.gameWidth / 2,
            this.scene.gameHeight * 0.8
        );
        this.controlsContainer.setDepth(100);
        
        // Create the control icons
        const controlsText = this.scene.add.text(
            0,
            0,
            'CONTROLS:',
            {
                fontFamily: 'Arial, sans-serif',
                fontSize: '16px',
                fontStyle: 'bold',
                align: 'center',
                fill: '#ffffff'
            }
        );
        controlsText.setOrigin(0.5, 0);
        
        // Add wasd keys
        const wasdText = this.scene.add.text(
            -100,
            30,
            'W A S D',
            {
                fontFamily: 'Arial, sans-serif',
                fontSize: '16px',
                fontStyle: 'bold',
                fill: '#ffffff'
            }
        );
        wasdText.setOrigin(0.5);
        
        // Add move text
        const moveText = this.scene.add.text(
            -100,
            60,
            'MOVE',
            {
                fontFamily: 'Arial, sans-serif',
                fontSize: '12px',
                fill: '#aaaaaa'
            }
        );
        moveText.setOrigin(0.5);
        
        // Add mouse icon
        const mouseIcon = this.scene.add.text(
            100,
            30,
            '🖱️',
            {
                fontSize: '20px'
            }
        );
        mouseIcon.setOrigin(0.5);
        
        // Add shoot text
        const shootText = this.scene.add.text(
            100,
            60,
            'SHOOT',
            {
                fontFamily: 'Arial, sans-serif',
                fontSize: '12px',
                fill: '#aaaaaa'
            }
        );
        shootText.setOrigin(0.5);
        
        // Add all elements to container
        this.controlsContainer.add(controlsText);
        this.controlsContainer.add(wasdText);
        this.controlsContainer.add(moveText);
        this.controlsContainer.add(mouseIcon);
        this.controlsContainer.add(shootText);
    }
    
    updateTitleAnimations() {
        // Increment noise offset for smooth animation
        this.noiseOffset += 0.02;
        
        if (this.titleContainer) {
            // Generate smooth noise values for animating the title
            const noiseVal1 = Math.sin(this.titleNoiseValues[0] + this.noiseOffset) * 0.5 + 0.5;
            const noiseVal2 = Math.sin(this.titleNoiseValues[1] + this.noiseOffset * 0.7) * 0.5 + 0.5;
            
            // Apply dynamic scale to the entire container (between 0.9 and 1.1)
            const scaleX = 0.9 + noiseVal1 * 0.2;
            const scaleY = 0.9 + noiseVal2 * 0.2;
            this.titleContainer.setScale(scaleX, scaleY);
            
            // Apply subtle rotation to the entire container (-3 to 3 degrees)
            const rotation = Math.sin(this.titleNoiseValues[2] + this.noiseOffset * 0.5) * 3;
            this.titleContainer.setAngle(rotation);
        }
    }
    
    // Draw a star shape (or polygon with variable points)
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
    
    // Clean up resources
    shutdown() {
        if (this.titleAnimEvent) {
            this.titleAnimEvent.remove();
            this.titleAnimEvent = null;
        }
        
        // Clean up all title elements
        if (this.titleOverlay) this.titleOverlay.destroy();
        if (this.titleContainer) this.titleContainer.destroy();
        if (this.subtitleText) this.subtitleText.destroy();
        if (this.startText) this.startText.destroy();
        if (this.controlsContainer) this.controlsContainer.destroy();
        if (this.titleClickArea) this.titleClickArea.destroy();
        
        this.titleDecorations.forEach(deco => {
            if (deco) deco.destroy();
        });
        this.titleDecorations = [];
    }
}

export default TitleScreenManager; 