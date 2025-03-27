class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
        
        // Color palette for the game
        this.colorPalette = null;
        
        // Array to store available light icons
        this.availableLightIcons = [];
        
        // Game icon keys
        this.playerIcon = null;
        this.bulletIcon = null;
        this.enemyIcon = null;
        this.backgroundIcon = null;
        
        // Colors for game elements
        this.playerColor = null;
        this.bulletColor = null;
        this.enemyColor = null;
        
        // Shooting control
        this.isMouseDown = false;
        this.lastShotTime = 0;
        this.shootingDelay = 150; // milliseconds between shots
        this.mousePosition = { x: 0, y: 0 };
        
        // Vector field control
        this.vectorFieldIndex = 0;
        this.vectorField = null;
        this.totalVectorFields = 16;
        
        // Enemy shooting control
        this.enemyShootingDelay = 2000; // milliseconds between enemy shots
        this.explosionRadius = 150; // Radius for chain reaction explosions
        
        // Ammo system
        this.maxAmmo = 10;
        this.currentAmmo = 10;
        this.ammoRefillDelay = 500; // 2 seconds to refill 1 ammo
        this.lastAmmoRefillTime = 0;
        this.ammoText = null;
        
        // Fixed game resolution (PS1-style)
        this.gameWidth = 640;
        this.gameHeight = 480;
        
        // Wave system
        this.currentWave = 0;
        this.enemiesPerWave = 8; // Starting number of enemies per wave
        this.waveInProgress = false;
        this.enemiesRemainingInWave = 0;
        this.timeBetweenWaves = 5000; // 5 seconds between waves
        
        // Wave difficulty scaling
        this.enemySpeedMultiplier = 1.0;
        this.enemyShootChanceMultiplier = 1.0;
        this.largeEnemyFrequency = 7; // Every 7th enemy is large initially
        this.largeEnemyHealthBase = 3; // Base health for large enemies
        
        // Enemy counter for large enemies (every 7th enemy)
        this.enemyCounter = 0;
        
        // Screen shake properties
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.shakeOffset = { x: 0, y: 0 };
        
        // Store final wave and score for game over screen
        this.finalWave = 0;
        this.finalScore = 0;
        
        // Top score tracking
        this.topScore = this.getTopScoreFromCookie() || 0;
    }

    preload() {
        // Load color palette
        this.load.json('colors', 'src/colors.json');
        
        // Load the Buck logo
        this.load.image('buck_logo', 'assets/images/buck-logo-white-trimmed.png');
        
        // Load light icons with correct filenames (sprite instead of unnamed)
        // Only load the ones that actually exist (no gaps in numbering)
        const availableLightNumbers = [1, 2, 3, 6, 7, 8, 10, 11, 13, 16, 17, 19, 20, 21, 25, 26, 28, 30, 31, 33, 36, 37, 39, 40, 44, 45, 46, 47, 49, 50, 51, 52, 53, 59, 60];
        
        for (const num of availableLightNumbers) {
            this.load.image(`light_icon${num}`, `assets/images/light/sprite-${num}.png`);
        }
        
        // Load game icon grid
        this.load.image('icon_grid', 'assets/icon_grid.png');
        
        // We'll generate vector fields programmatically instead of loading them
        // No need to load vector field images anymore
    }
    
    createSoundEffects() {
        // Create sound effects programmatically
        const shootConfig = {
            key: 'shoot',
            generator: (audioContext) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(110, audioContext.currentTime + 0.1);
                
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                
                oscillator.connect(gainNode);
                return { oscillator, gainNode, duration: 0.1 };
            }
        };
        
        const hitConfig = {
            key: 'hit',
            generator: (audioContext) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.05);
                
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
                
                oscillator.connect(gainNode);
                return { oscillator, gainNode, duration: 0.05 };
            }
        };
        
        const explosionConfig = {
            key: 'explosion',
            generator: (audioContext) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(100, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(20, audioContext.currentTime + 0.3);
                
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                
                oscillator.connect(gainNode);
                return { oscillator, gainNode, duration: 0.3 };
            }
        };
        
        const clickConfig = {
            key: 'click',
            generator: (audioContext) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(80, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(40, audioContext.currentTime + 0.05);
                
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
                
                oscillator.connect(gainNode);
                return { oscillator, gainNode, duration: 0.05 };
            }
        };
        
        const reloadConfig = {
            key: 'reload',
            generator: (audioContext) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
                
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                
                oscillator.connect(gainNode);
                return { oscillator, gainNode, duration: 0.1 };
            }
        };
        
        // Add all sound effects
        const soundConfigs = [shootConfig, hitConfig, explosionConfig, clickConfig, reloadConfig];
        
        for (const config of soundConfigs) {
            this.sound.add(config.key);
        }
        
        // Store references for use in the game
        this.shootSound = this.sound.get('shoot');
        this.hitSound = this.sound.get('hit');
        this.explosionSound = this.sound.get('explosion');
    }

    createExplosionTexture() {
        // Create a simple explosion texture with a pixelated look
        const graphics = this.add.graphics();
        
        // Draw a pixelated explosion shape (PS1-style)
        graphics.fillStyle(0xFFFFFF);
        
        // Center circle
        graphics.fillCircle(16, 16, 12);
        
        // Pixelated rays (blocky for PS1 look)
        graphics.fillRect(16, 0, 8, 8);    // Top
        graphics.fillRect(28, 4, 8, 8);    // Top-right
        graphics.fillRect(32, 16, 8, 8);   // Right
        graphics.fillRect(28, 28, 8, 8);   // Bottom-right
        graphics.fillRect(16, 32, 8, 8);   // Bottom
        graphics.fillRect(4, 28, 8, 8);    // Bottom-left
        graphics.fillRect(0, 16, 8, 8);    // Left
        graphics.fillRect(4, 4, 8, 8);     // Top-left
        
        graphics.generateTexture('explosion_texture', 40, 40);
        graphics.destroy();
        
        console.log('Created explosion texture');
    }

    create() {
        // Create a fallback texture for particles
        this.createFallbackTexture();
        
        // Create explosion texture
        this.createExplosionTexture();
        
        // Create control icons for instructions
        this.createControlIcons();
        
        // Generate vector field textures programmatically
        this.generateVectorFieldTextures();
        
        // Check for configuration in URL parameters
        const hasUrlConfig = this.loadConfigFromUrl();
        
        if (!hasUrlConfig) {
            // If no URL config, set up with random values
            
            // Set up color palette
            this.setupColorPalette();
            
            // Find available light icons
            this.findAvailableLightIcons();
            
            // Randomize game icons
            this.randomizeGameIcons();
            
            // Select a random vector field
            this.selectRandomVectorField();
            
            // Save configuration to URL
            this.saveConfigToUrl();
        }
        
        // Create background
        this.createBackground();
        
        // Create player
        this.createPlayer();
        
        // Create bullet group
        this.createBullets();
        
        // Create enemy group
        this.createEnemies();
        
        // Set up collisions
        this.setupCollisions();
        
        // Set up input
        this.setupInput();
        
        // Set up sound
        this.setupSound();
        
        // Reset enemy counter
        this.enemyCounter = 0;
        
        // Display wave counter
        this.waveText = this.add.text(this.gameWidth - 16, 16, 'WAVE: 0', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '18px',
            fontStyle: 'bold',
            fill: '#ffffff',
            padding: { x: 8, y: 4 }
        });
        this.waveText.setOrigin(1, 0); // Right-aligned
        this.waveText.setAlpha(0.9);
        
        // Add wave text animation
        this.tweens.add({
            targets: this.waveText,
            scale: { from: 1, to: 1.05 },
            duration: 300,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Display score with a more minimal, modern style
        this.score = 0;
        this.scoreText = this.add.text(this.gameWidth / 2, 10, 'SCORE: 0', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '18px',
            fontStyle: 'bold',
            fill: '#ffffff',
            padding: { x: 8, y: 4 }
        }).setDepth(100);
        this.scoreText.setAlpha(0.9);
        this.scoreText.setOrigin(0.5, 0); // Center-aligned at top
        
        // Add score text animation
        this.tweens.add({
            targets: this.scoreText,
            scale: { from: 1, to: 1.05 },
            duration: 300,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Create UI buttons
        this.createGameButtons();
        
        // Create pixelated border
        this.createPixelatedBorder();
        
        // Add game over text (hidden initially)
        this.gameOverText = this.add.text(
            this.gameWidth / 2,
            this.gameHeight / 2,
            'GAME OVER\nClick to restart',
            {
                fontFamily: 'Arial, sans-serif',
                fontSize: '32px',
                fontStyle: 'bold',
                fill: '#ffffff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 4
            }
        );
        this.gameOverText.setOrigin(0.5);
        this.gameOverText.setVisible(false);
        
        // Add restart functionality
        this.input.on('pointerdown', () => {
            if (this.gameOver) {
                this.scene.restart();
            }
        });
        
        // Game is not over initially
        this.gameOver = false;
        
        // Hide game elements initially
        this.player.setVisible(false);
        this.scoreText.setVisible(false);
        this.waveText.setVisible(false);
        
        // Show title screen
        this.showTitleScreen();
        
        // Add top score
        this.topScoreText = this.add.text(16, 10, `TOP: ${this.topScore}`, {
            fontFamily: 'Arial, sans-serif',
            fontSize: '18px',
            fontStyle: 'bold',
            fill: '#ffffff',
            padding: { x: 8, y: 4 }
        }).setDepth(100);
        this.topScoreText.setOrigin(0, 0); // Left-aligned
        this.topScoreText.setAlpha(0.9);
        
        // Configure the game scale
        this.configureGameScale();
    }
    
    configureGameScale() {
        // Set the game to maintain aspect ratio and center in the parent container
        this.scale.setGameSize(this.gameWidth, this.gameHeight);
        
        // Set maximum width constraint
        const maxWidth = 1280;
        
        // Function to update the scale based on window size
        const updateScale = () => {
            // Get the game container element
            const gameContainer = document.getElementById('game-container');
            if (!gameContainer) return;
            
            // Calculate the appropriate scale while respecting max width
            const containerWidth = Math.min(window.innerWidth, maxWidth);
            const containerHeight = window.innerHeight;
            
            // Set the container style
            gameContainer.style.maxWidth = `${maxWidth}px`;
            gameContainer.style.margin = '0 auto';
            
            // Update the scale manager
            this.scale.setParentSize(containerWidth, containerHeight);
        };
        
        // Initial update
        updateScale();
        
        // Add resize listener
        window.addEventListener('resize', updateScale);
    }
    
    showTitleScreen() {
        console.log("=== CREATING TITLE SCREEN ===");
        
        // Flag to track if we're on the title screen
        this.onTitleScreen = true;
        
        // Create a semi-transparent overlay
        this.titleOverlay = this.add.rectangle(
            this.gameWidth / 2,
            this.gameHeight / 2,
            this.gameWidth,
            this.gameHeight,
            0x000000,
            0.7
        );
        this.titleOverlay.setDepth(100);
        console.log("Title overlay created");
        
        // Create a container for the title (logo + text)
        this.titleContainer = this.add.container(
            this.gameWidth / 2,
            this.gameHeight / 3
        );
        this.titleContainer.setDepth(101);
        
        // Add "BLASTER" text
        this.blasterText = this.add.text(
            0, // Will be positioned relative to the logo
            0,
            'BLASTER',
            {
                fontFamily: 'Arial, sans-serif',
                fontSize: '48px',
                fontStyle: 'bold',
                fill: '#ffffff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 6
            }
        );
        this.blasterText.setOrigin(0, 0.5);
        
        // Create logo image with height matching the text
        this.titleLogo = this.add.image(
            0,
            0,
            'buck_logo'
        );
        this.titleLogo.setOrigin(1, 0.5);
        
        // Calculate the appropriate scale to match text height
        const textHeight = this.blasterText.height;
        const logoScale = textHeight / this.titleLogo.height;
        this.titleLogo.setScale(logoScale);
        
        // Position the logo to the left of the text with a small gap
        const gap = 10;
        this.titleLogo.x = -gap;
        this.blasterText.x = gap;
        
        // Add both elements to the container
        this.titleContainer.add([this.titleLogo, this.blasterText]);
        
        // Add subtitle
        this.subtitleText = this.add.text(
            this.gameWidth / 2,
            this.gameHeight / 3 + 60,
            'AI Edition',
            {
                fontFamily: 'Arial, sans-serif',
                fontSize: '24px',
                fontStyle: 'bold',
                fill: '#cccccc',
                align: 'center'
            }
        );
        this.subtitleText.setOrigin(0.5);
        this.subtitleText.setDepth(101);
        
        // Add start game text
        this.startText = this.add.text(
            this.gameWidth / 2,
            this.gameHeight * 2/3,
            'CLICK ANYWHERE TO START',
            {
                fontFamily: 'Arial, sans-serif',
                fontSize: '32px',
                fontStyle: 'bold',
                fill: '#ffffff',
                align: 'center'
            }
        );
        this.startText.setOrigin(0.5);
        this.startText.setDepth(101);
        
        // Create control instructions
        this.createControlInstructions();
        
        // Create decorative elements
        this.createTitleDecorations();
        
        // Initialize noise values for dynamic rotation
        this.noiseOffset = 0;
        this.titleNoiseValues = [0, 0.5, 1, 1.5, 2]; // Different starting points for varied animation
        
        // Add advanced dynamic animations to title elements
        // Main title animation with dynamic scaling and rotation
        this.titleAnimEvent = this.time.addEvent({
            delay: 16, // Update every frame
            callback: this.updateTitleAnimations,
            callbackScope: this,
            loop: true
        });
        
        // Add animation to subtitle with offset timing
        this.tweens.add({
            targets: this.subtitleText,
            y: { from: this.gameHeight / 3 + 60, to: this.gameHeight / 3 + 65 },
            scale: { from: 0.95, to: 1.05 },
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: 300 // Offset timing for visual interest
        });
        
        // Pulsing animation for start text
        this.tweens.add({
            targets: this.startText,
            alpha: { from: 1, to: 0.3 },
            scale: { from: 0.95, to: 1.1 },
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Make the entire screen clickable
        this.titleClickArea = this.add.rectangle(
            this.gameWidth / 2,
            this.gameHeight / 2,
            this.gameWidth,
            this.gameHeight,
            0xffffff,
            0
        );
        this.titleClickArea.setInteractive();
        this.titleClickArea.on('pointerdown', this.startGameFromTitle, this);
        this.titleClickArea.setDepth(99); // Below other title elements but still interactive
        
        console.log("Title screen ready - click anywhere to start");
        
        // Make sure top score is displayed on title screen
        if (this.topScoreText) {
            this.topScoreText.setVisible(true);
        }
    }
    
    createControlIcons() {
        // Create mouse icon texture
        const mouseGraphics = this.add.graphics();
        mouseGraphics.fillStyle(0xFFFFFF);
        mouseGraphics.fillRoundedRect(0, 0, 24, 40, 12);
        mouseGraphics.fillStyle(0x333333);
        mouseGraphics.fillRect(10, 5, 4, 10);
        mouseGraphics.generateTexture('mouse_icon', 24, 40);
        mouseGraphics.destroy();
        
        // Create keyboard key texture
        const keyGraphics = this.add.graphics();
        keyGraphics.fillStyle(0xFFFFFF);
        keyGraphics.fillRoundedRect(0, 0, 30, 30, 5);
        keyGraphics.generateTexture('key_icon', 30, 30);
        keyGraphics.destroy();
    }
    
    createControlInstructions() {
        // Create a container for control instructions
        this.controlsContainer = this.add.container(
            this.gameWidth / 2,
            this.gameHeight - 80
        );
        this.controlsContainer.setDepth(101);
        
        // Background for controls
        const controlsBg = this.add.rectangle(
            0, 0, 400, 60, 0x000000, 0.5
        );
        controlsBg.setStrokeStyle(1, 0xffffff, 0.3);
        
        // Mouse controls
        const mouseIcon = this.add.image(-150, 0, 'mouse_icon');
        mouseIcon.setScale(0.8);
        
        const mouseText = this.add.text(
            -130, 0, 
            'Aim\nLEFT CLICK: Shoot', // Removed "MOVE:" from here
            {
                fontFamily: 'Arial, sans-serif',
                fontSize: '14px',
                fill: '#ffffff'
            }
        );
        mouseText.setOrigin(0, 0.5);
        
        // Keyboard controls
        const keyW = this.add.image(60, -12, 'key_icon').setScale(0.7);
        const keyA = this.add.image(30, 12, 'key_icon').setScale(0.7);
        const keyS = this.add.image(60, 12, 'key_icon').setScale(0.7);
        const keyD = this.add.image(90, 12, 'key_icon').setScale(0.7);
        
        // Key labels
        const keyWText = this.add.text(60, -12, 'W', { fontFamily: 'Arial', fontSize: '14px', fill: '#000000' }).setOrigin(0.5);
        const keyAText = this.add.text(30, 12, 'A', { fontFamily: 'Arial', fontSize: '14px', fill: '#000000' }).setOrigin(0.5);
        const keySText = this.add.text(60, 12, 'S', { fontFamily: 'Arial', fontSize: '14px', fill: '#000000' }).setOrigin(0.5);
        const keyDText = this.add.text(90, 12, 'D', { fontFamily: 'Arial', fontSize: '14px', fill: '#000000' }).setOrigin(0.5);
        
        const keyboardText = this.add.text(
            120, 0, 
            'MOVE', 
            {
                fontFamily: 'Arial, sans-serif',
                fontSize: '14px',
                fill: '#ffffff'
            }
        );
        keyboardText.setOrigin(0, 0.5);
        
        // Add all elements to the container
        this.controlsContainer.add([
            controlsBg, 
            mouseIcon, mouseText,
            keyW, keyA, keyS, keyD,
            keyWText, keyAText, keySText, keyDText,
            keyboardText
        ]);
        
        // Add subtle animation to the controls container
        this.tweens.add({
            targets: this.controlsContainer,
            y: this.gameHeight - 75,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    updateTitleAnimations() {
        if (!this.onTitleScreen) return;
        
        // Increment noise offset for dynamic movement
        this.noiseOffset += 0.01;
        
        // Apply dynamic scaling and rotation to the title container
        if (this.titleContainer) {
            // Update noise values with different frequencies for each property
            for (let i = 0; i < 5; i++) {
                this.titleNoiseValues[i] = (this.titleNoiseValues[i] + 0.02 + i * 0.005) % 100;
            }
            
            // Generate smooth noise values
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
    
    startGameFromTitle() {
        console.log("startGameFromTitle called");
        
        // Only proceed if we're on the title screen
        if (!this.onTitleScreen) {
            console.log("Not on title screen, ignoring click");
            return;
        }
        
        console.log("Starting game from title screen");
        
        // Set flag to prevent multiple calls
        this.onTitleScreen = false;
        
        // Remove click handler
        if (this.titleClickArea) {
            this.titleClickArea.removeInteractive();
            console.log("Removed title click area interactivity");
        }
        
        // Create a flash effect
        const flash = this.add.rectangle(
            this.gameWidth / 2,
            this.gameHeight / 2,
            this.gameWidth,
            this.gameHeight,
            0xffffff
        );
        flash.setDepth(102);
        flash.alpha = 0;
        
        // Flash animation
        this.tweens.add({
            targets: flash,
            alpha: { from: 0, to: 0.8 },
            duration: 100,
            yoyo: true,
            onComplete: () => {
                flash.destroy();
                console.log("Flash effect complete");
                
                // Remove title screen elements with a fade out
                this.tweens.add({
                    targets: [this.titleOverlay, this.titleContainer, this.subtitleText, this.startText, this.controlsContainer, this.titleClickArea, ...this.titleDecorations],
                    alpha: 0,
                    duration: 300,
                    onComplete: () => {
                        // Clean up all title elements
                        this.titleOverlay.destroy();
                        this.titleContainer.destroy();
                        this.subtitleText.destroy();
                        this.startText.destroy();
                        this.controlsContainer.destroy();
                        this.titleClickArea.destroy();
                        this.titleDecorations.forEach(deco => deco.destroy());
                        
                        // Stop title animation event
                        if (this.titleAnimEvent) {
                            this.titleAnimEvent.remove();
                        }
                        
                        // Show game elements
                        this.player.setVisible(true);
                        this.scoreText.setVisible(true);
                        this.waveText.setVisible(true);
                        this.ammoContainer.setVisible(true);
                        
                        // Start the first wave
                        this.startNextWave();
                        
                        console.log("Game started");
                    }
                });
            }
        });
        
        // Reset wave system
        this.resetWaveSystem();
        
        // Reset ammo to full
        this.currentAmmo = this.maxAmmo;
        this.updateAmmoDisplay();
        
        // Reset score but keep top score
        this.score = 0;
        this.scoreText.setText('SCORE: 0');
        this.topScoreText.setText(`TOP: ${this.topScore}`);
    }
    
    createTitleDecorations() {
        // Array to store all decorative elements
        this.titleDecorations = [];
        
        // Create some PS1-style decorative elements
        
        // 1. Create pixelated stars in the background
        for (let i = 0; i < 20; i++) {
            const star = this.add.rectangle(
                Phaser.Math.Between(50, this.gameWidth - 50),
                Phaser.Math.Between(50, this.gameHeight - 50),
                Phaser.Math.Between(2, 4),
                Phaser.Math.Between(2, 4),
                0xffffff
            );
            star.setDepth(100);
            star.setAlpha(Phaser.Math.FloatBetween(0.3, 0.7));
            
            // Add twinkling animation
            this.tweens.add({
                targets: star,
                alpha: { from: star.alpha, to: 0.1 },
                duration: Phaser.Math.Between(500, 2000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            this.titleDecorations.push(star);
        }
        
        // 2. Add some decorative icons from our game assets
        const iconPositions = [
            { x: this.gameWidth * 0.2, y: this.gameHeight * 0.2 },
            { x: this.gameWidth * 0.8, y: this.gameHeight * 0.2 },
            { x: this.gameWidth * 0.2, y: this.gameHeight * 0.8 },
            { x: this.gameWidth * 0.8, y: this.gameHeight * 0.8 }
        ];
        
        iconPositions.forEach((pos, index) => {
            // Use different game icons for decoration
            const iconKey = this.availableLightIcons[index % this.availableLightIcons.length];
            const icon = this.add.image(pos.x, pos.y, iconKey);
            
            // Style the icon
            icon.setScale(0.2);
            icon.setDepth(101);
            icon.setAlpha(0.6);
            
            // Add a color tint
            const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];
            icon.setTint(colors[index % colors.length]);
            
            // Add rotation animation
            this.tweens.add({
                targets: icon,
                angle: 360,
                duration: 6000 + index * 1000,
                repeat: -1,
                ease: 'Linear'
            });
            
            // Add scale animation
            this.tweens.add({
                targets: icon,
                scale: { from: 0.2, to: 0.25 },
                duration: 2000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            this.titleDecorations.push(icon);
        });
        
        // 3. Add a decorative line under the title
        const lineWidth = 300;
        const line = this.add.rectangle(
            this.gameWidth / 2,
            this.gameHeight / 3 + 40,
            lineWidth,
            2,
            0xffffff
        );
        line.setDepth(101);
        line.setAlpha(0.7);
        
        // Animate the line
        this.tweens.add({
            targets: line,
            width: { from: lineWidth * 0.8, to: lineWidth * 1.2 },
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        this.titleDecorations.push(line);
    }
    
    findAvailableLightIcons() {
        // Check which light icons are available and add them to the array
        this.availableLightIcons = [];
        
        // Check for the specific light icons we loaded
        const availableLightNumbers = [1, 2, 3, 6, 7, 8, 10, 11, 13, 16, 17, 19, 20, 21, 25, 26, 28, 30, 31, 33, 36, 37, 39, 40, 44, 45, 46, 47, 49, 50, 51, 52, 53, 59, 60];
        
        for (const num of availableLightNumbers) {
            const key = `light_icon${num}`;
            if (this.textures.exists(key)) {
                this.availableLightIcons.push(key);
            }
        }
        
        // Ensure we have at least one valid texture
        if (this.availableLightIcons.length === 0) {
            console.warn('No valid light icons found, using fallback');
            // Create a default texture if none are available
            this.createFallbackTexture();
            this.availableLightIcons.push('fallback_texture');
        }
        
        console.log(`Found ${this.availableLightIcons.length} available light icons`);
    }
    
    createFallbackTexture() {
        // Create a simple fallback texture if no valid textures are found
        const graphics = this.add.graphics();
        graphics.fillStyle(0xFFFFFF);
        graphics.fillCircle(16, 16, 16);
        graphics.generateTexture('fallback_texture', 32, 32);
        graphics.destroy();
        
        console.log('Created fallback texture');
        
        // Also generate vector field textures
        this.generateVectorFieldTextures();
    }
    
    generateVectorFieldTextures() {
        // Generate 16 different vector field patterns
        for (let fieldIndex = 1; fieldIndex <= 16; fieldIndex++) {
            const graphics = this.add.graphics();
            const width = 256;
            const height = 256;
            
            // Fill with transparent background
            graphics.fillStyle(0x000000, 0);
            graphics.fillRect(0, 0, width, height);
            
            // Generate vector field based on pattern type
            switch ((fieldIndex - 1) % 8) {
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
    
    // Helper functions to draw different vector field patterns
    
    drawCircularField(graphics, width, height, seed) {
        const centerX = width / 2;
        const centerY = height / 2;
        const cellSize = 16;
        
        graphics.lineStyle(1, 0x00FF00, 0.5);
        
        for (let y = 0; y < height; y += cellSize) {
            for (let x = 0; x < width; x += cellSize) {
                const dx = x - centerX;
                const dy = y - centerY;
                const angle = Math.atan2(dy, dx) + (seed % 2 ? Math.PI/2 : 0);
                
                graphics.beginPath();
                graphics.moveTo(x, y);
                graphics.lineTo(
                    x + Math.cos(angle) * cellSize * 0.6,
                    y + Math.sin(angle) * cellSize * 0.6
                );
                graphics.strokePath();
            }
        }
    }
    
    drawSpiralField(graphics, width, height, seed) {
        const centerX = width / 2;
        const centerY = height / 2;
        const cellSize = 16;
        
        graphics.lineStyle(1, 0x00FFFF, 0.5);
        
        for (let y = 0; y < height; y += cellSize) {
            for (let x = 0; x < width; x += cellSize) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx*dx + dy*dy);
                const angle = Math.atan2(dy, dx) + distance / (50 + (seed % 5) * 10);
                
                graphics.beginPath();
                graphics.moveTo(x, y);
                graphics.lineTo(
                    x + Math.cos(angle) * cellSize * 0.6,
                    y + Math.sin(angle) * cellSize * 0.6
                );
                graphics.strokePath();
            }
        }
    }
    
    drawNoiseField(graphics, width, height, seed) {
        const cellSize = 16;
        
        graphics.lineStyle(1, 0xFF00FF, 0.5);
        
        for (let y = 0; y < height; y += cellSize) {
            for (let x = 0; x < width; x += cellSize) {
                // Simple pseudo-random angle based on position and seed
                const angle = (Math.sin(x * 0.1 + seed) + Math.cos(y * 0.1 + seed)) * Math.PI;
                
                graphics.beginPath();
                graphics.moveTo(x, y);
                graphics.lineTo(
                    x + Math.cos(angle) * cellSize * 0.6,
                    y + Math.sin(angle) * cellSize * 0.6
                );
                graphics.strokePath();
            }
        }
    }
    
    drawWaveField(graphics, width, height, seed) {
        const cellSize = 16;
        
        graphics.lineStyle(1, 0xFFFF00, 0.5);
        
        for (let y = 0; y < height; y += cellSize) {
            for (let x = 0; x < width; x += cellSize) {
                const angle = Math.sin(y * 0.05 + seed) * Math.PI * 0.5;
                
                graphics.beginPath();
                graphics.moveTo(x, y);
                graphics.lineTo(
                    x + Math.cos(angle) * cellSize * 0.6,
                    y + Math.sin(angle) * cellSize * 0.6
                );
                graphics.strokePath();
            }
        }
    }
    
    drawVortexField(graphics, width, height, seed) {
        const centerX = width / 2;
        const centerY = height / 2;
        const cellSize = 16;
        
        graphics.lineStyle(1, 0xFF0000, 0.5);
        
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
                
                graphics.beginPath();
                graphics.moveTo(x, y);
                graphics.lineTo(
                    x + Math.cos(angle) * cellSize * 0.6,
                    y + Math.sin(angle) * cellSize * 0.6
                );
                graphics.strokePath();
            }
        }
    }
    
    drawGridField(graphics, width, height, seed) {
        const cellSize = 16;
        
        graphics.lineStyle(1, 0x00FF00, 0.5);
        
        for (let y = 0; y < height; y += cellSize) {
            for (let x = 0; x < width; x += cellSize) {
                // Alternate horizontal and vertical lines
                const isHorizontal = (Math.floor(x / (cellSize * 4)) + Math.floor(y / (cellSize * 4)) + seed) % 2 === 0;
                const angle = isHorizontal ? 0 : Math.PI/2;
                
                graphics.beginPath();
                graphics.moveTo(x, y);
                graphics.lineTo(
                    x + Math.cos(angle) * cellSize * 0.6,
                    y + Math.sin(angle) * cellSize * 0.6
                );
                graphics.strokePath();
            }
        }
    }
    
    drawRadialField(graphics, width, height, seed) {
        const cellSize = 16;
        const numCenters = 3 + (seed % 3);
        const centers = [];
        
        // Create random centers with deterministic randomness based on seed
        for (let i = 0; i < numCenters; i++) {
            centers.push({
                x: ((seed * 17 + i * 23) % 100) / 100 * width,
                y: ((seed * 31 + i * 41) % 100) / 100 * height,
                strength: ((seed * 7 + i * 13) % 50) / 100 + 0.5
            });
        }
        
        graphics.lineStyle(1, 0x0080FF, 0.5);
        
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
                
                graphics.beginPath();
                graphics.moveTo(x, y);
                graphics.lineTo(
                    x + Math.cos(angle) * cellSize * 0.6,
                    y + Math.sin(angle) * cellSize * 0.6
                );
                graphics.strokePath();
            }
        }
    }
    
    drawChaosField(graphics, width, height, seed) {
        const cellSize = 16;
        
        graphics.lineStyle(1, 0xFF8000, 0.5);
        
        for (let y = 0; y < height; y += cellSize) {
            for (let x = 0; x < width; x += cellSize) {
                // Chaotic pattern based on sine and cosine
                const angle = Math.sin(x * 0.01 * seed) * Math.cos(y * 0.01 * seed) * Math.PI * 2;
                
                graphics.beginPath();
                graphics.moveTo(x, y);
                graphics.lineTo(
                    x + Math.cos(angle) * cellSize * 0.6,
                    y + Math.sin(angle) * cellSize * 0.6
                );
                graphics.strokePath();
            }
        }
    }
    
    randomizeGameIcons() {
        // Shuffle the available icons
        this.shuffleArray(this.availableLightIcons);
        
        // Assign icons for player, bullets, enemies, and background
        if (this.availableLightIcons.length >= 4) {
            this.playerIcon = this.availableLightIcons[0];
            this.bulletIcon = this.availableLightIcons[1];
            this.enemyIcon = this.availableLightIcons[2];
            this.backgroundIcon = this.availableLightIcons[3];
        } else {
            // Fallback if we don't have enough icons
            console.warn('Not enough light icons available, using defaults');
            this.playerIcon = 'light_icon1';
            this.bulletIcon = 'light_icon2';
            this.enemyIcon = 'light_icon3';
            this.backgroundIcon = 'light_icon4';
        }
        
        console.log(`Using icons - Player: ${this.playerIcon}, Bullet: ${this.bulletIcon}, Enemy: ${this.enemyIcon}, Background: ${this.backgroundIcon}`);
    }
    
    // Fisher-Yates shuffle algorithm
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    selectRandomVectorField() {
        // Choose a random vector field index (1-16)
        this.vectorFieldIndex = Math.floor(Math.random() * this.totalVectorFields) + 1;
        console.log(`Using vector field ${this.vectorFieldIndex}`);
        
        // Use the programmatically generated vector field
        this.vectorField = `vector_field${this.vectorFieldIndex}`;
    }
    
    setupColorPalette() {
        // Get color palette from JSON
        const colorsArray = this.cache.json.get('colors');
        
        // Convert the array to an object with color names as keys
        this.colorPalette = {};
        colorsArray.forEach(color => {
            this.colorPalette[color.name] = color.hex;
        });
        
        // Select a random background color from the palette
        const colorKeys = Object.keys(this.colorPalette);
        const bgColorKey = Phaser.Utils.Array.GetRandom(colorKeys);
        this.backgroundColor = Phaser.Display.Color.HexStringToColor(this.colorPalette[bgColorKey]).color;
        
        // Set the background color
        this.cameras.main.setBackgroundColor(this.backgroundColor);
        
        // Calculate contrasting colors for player, bullets, and enemies
        // We want the player to stand out the most, then enemies, then bullets
        
        // For player, use a color that contrasts strongly with the background
        const playerColorOptions = colorKeys.filter(key => {
            const color = Phaser.Display.Color.HexStringToColor(this.colorPalette[key]);
            const bgColor = Phaser.Display.Color.IntegerToColor(this.backgroundColor);
            
            // Calculate contrast (simple version - just check if colors are different enough)
            const rDiff = Math.abs(color.r - bgColor.r);
            const gDiff = Math.abs(color.g - bgColor.g);
            const bDiff = Math.abs(color.b - bgColor.b);
            
            return (rDiff + gDiff + bDiff) > 300; // High contrast threshold
        });
        
        // Select a random high-contrast color for the player
        const playerColorKey = Phaser.Utils.Array.GetRandom(playerColorOptions.length > 0 ? playerColorOptions : colorKeys);
        this.playerColor = Phaser.Display.Color.HexStringToColor(this.colorPalette[playerColorKey]).color;
        
        // For enemies, use a color that contrasts with both background and player
        const enemyColorOptions = colorKeys.filter(key => {
            const color = Phaser.Display.Color.HexStringToColor(this.colorPalette[key]);
            const bgColor = Phaser.Display.Color.IntegerToColor(this.backgroundColor);
            const playerColor = Phaser.Display.Color.IntegerToColor(this.playerColor);
            
            // Calculate contrast with background
            const rDiffBg = Math.abs(color.r - bgColor.r);
            const gDiffBg = Math.abs(color.g - bgColor.g);
            const bDiffBg = Math.abs(color.b - bgColor.b);
            
            // Calculate contrast with player
            const rDiffPlayer = Math.abs(color.r - playerColor.r);
            const gDiffPlayer = Math.abs(color.g - playerColor.g);
            const bDiffPlayer = Math.abs(color.b - playerColor.b);
            
            return (rDiffBg + gDiffBg + bDiffBg) > 200 && // Medium contrast with background
                   (rDiffPlayer + gDiffPlayer + bDiffPlayer) > 200; // Medium contrast with player
        });
        
        // Select a random medium-contrast color for enemies
        const enemyColorKey = Phaser.Utils.Array.GetRandom(enemyColorOptions.length > 0 ? enemyColorOptions : colorKeys);
        this.enemyColor = Phaser.Display.Color.HexStringToColor(this.colorPalette[enemyColorKey]).color;
        
        // For bullets, use a color that's visible but not too distracting
        const bulletColorOptions = colorKeys.filter(key => {
            const color = Phaser.Display.Color.HexStringToColor(this.colorPalette[key]);
            const bgColor = Phaser.Display.Color.IntegerToColor(this.backgroundColor);
            
            // Calculate contrast with background
            const rDiffBg = Math.abs(color.r - bgColor.r);
            const gDiffBg = Math.abs(color.g - bgColor.g);
            const bDiffBg = Math.abs(color.b - bgColor.b);
            
            return (rDiffBg + gDiffBg + bDiffBg) > 150; // Lower contrast threshold
        });
        
        // Select a random lower-contrast color for bullets
        const bulletColorKey = Phaser.Utils.Array.GetRandom(bulletColorOptions.length > 0 ? bulletColorOptions : colorKeys);
        this.bulletColor = Phaser.Display.Color.HexStringToColor(this.colorPalette[bulletColorKey]).color;
        
        console.log(`Colors - BG: ${this.backgroundColor.toString(16)}, Player: ${this.playerColor.toString(16)}, Enemy: ${this.enemyColor.toString(16)}, Bullet: ${this.bulletColor.toString(16)}`);
    }
    
    createBackground() {
        this.backgroundTiles = [];
        this.bgNoiseOffset = 0;
        
        // Store current wave's color values for interpolation
        this.currentBgTint = this.colorPalette.background;
        this.targetBgTint = this.colorPalette.background;
        
        // Create a simple static background with limited sprites
        const MAX_SPRITES = 250;
        const tileSize = 32;
        const baseScale = 0.06;
        
        // Calculate optimal sprite distribution
        const totalArea = this.gameWidth * this.gameHeight;
        const spriteArea = (tileSize * baseScale) * (tileSize * baseScale);
        const coverage = 0.25; // 25% coverage
        const targetSprites = Math.min(MAX_SPRITES, Math.floor((totalArea * coverage) / spriteArea));
        
        // Calculate grid for even distribution
        const aspectRatio = this.gameWidth / this.gameHeight;
        const gridCols = Math.ceil(Math.sqrt(targetSprites * aspectRatio));
        const gridRows = Math.ceil(targetSprites / gridCols);
        
        const spacingX = this.gameWidth / gridCols;
        const spacingY = this.gameHeight / gridRows;
        
        let spriteCount = 0;
        
        // Get background color components for contrast checking
        const bgColor = Phaser.Display.Color.IntegerToColor(this.currentBgTint);
        
        // Get a few colors from the palette for variation, ensuring good contrast
        const colorKeys = Object.keys(this.colorPalette);
        const bgColors = [];
        for (let i = 0; i < 5; i++) {
            let randomKey;
            let contrastOK = false;
            let attempts = 0;
            
            // Try to find colors with good contrast
            while (!contrastOK && attempts < 10) {
                randomKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
                const testColor = Phaser.Display.Color.IntegerToColor(this.colorPalette[randomKey]);
                
                // Calculate contrast (simple difference in RGB values)
                const contrast = Math.abs(testColor.r - bgColor.r) + 
                                Math.abs(testColor.g - bgColor.g) + 
                                Math.abs(testColor.b - bgColor.b);
                
                // Ensure minimum contrast
                if (contrast > 150) {
                    contrastOK = true;
                }
                attempts++;
            }
            
            bgColors.push(this.colorPalette[randomKey]);
        }
        
        // Create background sprites
        for (let y = 0; y < gridRows && spriteCount < MAX_SPRITES; y++) {
            for (let x = 0; x < gridCols && spriteCount < MAX_SPRITES; x++) {
                // Skip some cells randomly for varied density
                if (Math.random() < 0.2) continue;
                
                // Add some randomness to position within the grid cell
                const posX = (x + 0.5) * spacingX + (Math.random() - 0.5) * spacingX * 0.7;
                const posY = (y + 0.5) * spacingY + (Math.random() - 0.5) * spacingY * 0.7;
                
                const icon = this.availableLightIcons[Math.floor(Math.random() * this.availableLightIcons.length)];
                const tile = this.add.sprite(posX, posY, icon);
                
                // Random rotation and slight scale variation
                tile.angle = Math.random() * 360;
                const scaleVar = 0.8 + Math.random() * 0.4; // 0.8 to 1.2 scale variation
                const finalScale = baseScale * scaleVar;
                
                // Store original properties
                tile.originalScale = finalScale;
                tile.originalAngle = tile.angle;
                tile.originalAlpha = 0.1 + Math.random() * 0.05;
                tile.noiseX = x * 0.1;
                tile.noiseY = y * 0.1;
                tile.rotationSpeed = (Math.random() * 0.4) - 0.2; // -0.2 to 0.2
                
                // Apply properties
                tile.setScale(finalScale);
                tile.setAlpha(tile.originalAlpha);
                
                // Apply color variation - always use accent colors for better contrast
                const accentColor = bgColors[Math.floor(Math.random() * bgColors.length)];
                tile.setTint(accentColor);
                tile.useMainColor = false;
                tile.accentColor = accentColor;
                
                tile.setDepth(-1);
                
                this.backgroundTiles.push(tile);
                spriteCount++;
            }
        }
        
        // Update color transitions and rotation
        this.bgAnimEvent = this.time.addEvent({
            delay: 100,
            callback: this.updateBackgroundAnimation,
            callbackScope: this,
            loop: true
        });
    }
    
    updateBackgroundAnimation() {
        // Increment noise offset for smooth rotation
        this.bgNoiseOffset = (this.bgNoiseOffset || 0) + 0.01;
        
        // Color interpolation for wave transitions
        if (this.currentBgTint !== this.targetBgTint) {
            const current = Phaser.Display.Color.IntegerToColor(this.currentBgTint);
            const target = Phaser.Display.Color.IntegerToColor(this.targetBgTint);
            
            // Smooth interpolation
            current.r = Math.round(current.r + (target.r - current.r) * 0.05);
            current.g = Math.round(current.g + (target.g - current.g) * 0.05);
            current.b = Math.round(current.b + (target.b - current.b) * 0.05);
            
            this.currentBgTint = Phaser.Display.Color.GetColor(
                current.r,
                current.g,
                current.b
            );
        }
        
        // Update rotation based on noise field
        for (const tile of this.backgroundTiles) {
            // Generate smooth noise value for this tile
            const nx = tile.noiseX;
            const ny = tile.noiseY;
            const nz = this.bgNoiseOffset;
            
            // Simple noise calculation
            const noiseValue = Math.sin(nx * 3.7 + ny * 2.3 + nz * 1.5) * 0.5 + 0.5;
            
            // Apply smooth rotation based on noise
            const rotationAmount = (noiseValue - 0.5) * 0.3 * tile.rotationSpeed;
            tile.angle += rotationAmount;
            
            // Check for any tiles that need to be reset to original properties
            if (tile.scale !== tile.originalScale || tile.alpha !== tile.originalAlpha) {
                // Gradually return to original properties
                tile.scale = Phaser.Math.Linear(tile.scale, tile.originalScale, 0.1);
                tile.alpha = Phaser.Math.Linear(tile.alpha, tile.originalAlpha, 0.1);
                
                // If we're very close to original values, snap to them
                if (Math.abs(tile.scale - tile.originalScale) < 0.01) {
                    tile.setScale(tile.originalScale);
                }
                if (Math.abs(tile.alpha - tile.originalAlpha) < 0.01) {
                    tile.setAlpha(tile.originalAlpha);
                }
            }
        }
    }
    
    shutdown() {
        // Clean up background animation events
        if (this.bgAnimEvent) {
            this.bgAnimEvent.remove();
            this.bgAnimEvent = null;
        }
        
        if (this.titleAnimEvent) {
            this.titleAnimEvent.remove();
            this.titleAnimEvent = null;
        }
        
        // Clean up the border animation event
        if (this.borderAnimEvent) {
            this.borderAnimEvent.remove();
            this.borderAnimEvent = null;
        }
        
        // Clean up any pending enemy spawn events
        if (this.enemySpawnEvent) {
            this.enemySpawnEvent.remove();
            this.enemySpawnEvent = null;
        }
        
        // Clear all pending delayed calls (includes scheduled enemy spawns)
        this.time.removeAllEvents();
        
        // Clean up border graphics
        if (this.pixelBorderCurrent) {
            this.pixelBorderCurrent.clear();
            this.pixelBorderCurrent.destroy();
            this.pixelBorderCurrent = null;
        }
        
        if (this.pixelBorder) {
            this.pixelBorder.clear();
            this.pixelBorder.destroy();
            this.pixelBorder = null;
        }
        
        if (this.pixelBorderNext) {
            this.pixelBorderNext.clear();
            this.pixelBorderNext.destroy();
            this.pixelBorderNext = null;
        }
        
        // Call the parent shutdown method
        super.shutdown();
    }
    
    createPlayer() {
        this.player = new Player(this, this.gameWidth / 2, this.gameHeight / 2, this.playerIcon);
        this.player.speed = 150;
        
        // Initially hide the player for title screen
        this.player.setVisible(false);
        
        // Create ammo UI
        this.createAmmoUI();
    }
    
    createAmmoUI() {
        // Create a container for the ammo display at the bottom center
        this.ammoContainer = this.add.container(this.gameWidth / 2, this.gameHeight - 16);
        
        // Create ammo text
        this.ammoText = this.add.text(0, 0, `AMMO: ${this.currentAmmo}/${this.maxAmmo}`, {
            fontFamily: 'Arial, sans-serif',
            fontSize: '18px',
            fontStyle: 'bold',
            fill: '#ffffff',
            padding: { x: 8, y: 4 }
        });
        
        // Center the text horizontally
        this.ammoText.setOrigin(0.5, 1);
        this.ammoText.setAlpha(0.9);
        
        // Add text to container
        this.ammoContainer.add(this.ammoText);
        
        // Set depth to ensure it's visible
        this.ammoContainer.setDepth(100);
        
        // Initially hide it for title screen
        this.ammoContainer.setVisible(false);
        
        // Add ammo text animation
        this.tweens.add({
            targets: this.ammoText,
            scale: { from: 1, to: 1.05 },
            duration: 300,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    createBullets() {
        // Create bullet group with custom factory function to ensure proper texture initialization
        this.bullets = this.physics.add.group({
            classType: Bullet,
            runChildUpdate: true,
            createCallback: (bullet) => {
                // Make sure the bullet is properly initialized with a valid texture
                bullet.setTexture(this.bulletIcon || this.availableLightIcons[0] || 'fallback_texture');
                bullet.setVisible(true);
                bullet.setAlpha(1);
                // PS1-style normal rendering
                bullet.setBlendMode(Phaser.BlendModes.NORMAL);
            }
        });
        
        // Create enemy bullet group with smaller bullets
        this.enemyBullets = this.physics.add.group({
            classType: Bullet,
            runChildUpdate: true,
            createCallback: (bullet) => {
                // Make sure the bullet is properly initialized with a valid texture
                bullet.setTexture(this.bulletIcon || this.availableLightIcons[0] || 'fallback_texture');
                bullet.setVisible(true);
                bullet.setAlpha(1);
                // Mark as enemy bullet
                bullet.isEnemyBullet = true;
                // Make enemy bullets much smaller for PS1-style look
                bullet.setScale(0.02);
                // PS1-style normal rendering
                bullet.setBlendMode(Phaser.BlendModes.NORMAL);
                // Set a shorter lifetime for shorter range
                bullet.setData('lifetime', 800); // Shorter lifetime for reduced range
            }
        });
    }
    
    createEnemies() {
        // Create enemy group with custom factory function to ensure proper texture initialization
        this.enemies = this.physics.add.group({
            classType: Enemy,
            runChildUpdate: true,
            createCallback: (enemy) => {
                // Make sure the enemy is properly initialized with a valid texture
                enemy.setTexture(this.enemyIcon || this.availableLightIcons[0] || 'fallback_texture');
                enemy.setVisible(true);
                enemy.setAlpha(1);
                // Remove blending mode for better performance
                enemy.setBlendMode(Phaser.BlendModes.NORMAL);
            }
        });
    }
    
    setupCollisions() {
        // Set up collisions between bullets and enemies
        this.physics.add.collider(
            this.bullets,
            this.enemies,
            this.bulletHitEnemy,
            null,
            this
        );
        
        // Set up collisions between player and enemies
        this.physics.add.collider(
            this.player,
            this.enemies,
            this.playerHitEnemy,
            null,
            this
        );
        
        // Set up collisions between enemy bullets and player
        this.physics.add.collider(
            this.enemyBullets,
            this.player,
            this.enemyBulletHitPlayer,
            null,
            this
        );
        
        // Set up collisions between player bullets and enemy bullets (make enemy bullets destructible)
        this.physics.add.collider(
            this.bullets,
            this.enemyBullets,
            this.bulletHitEnemyBullet,
            null,
            this
        );
    }
    
    setupInput() {
        // Set up cursor keys
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Set up WASD keys
        this.wasd = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };
        
        // Set up mouse/touch input for shooting
        this.input.on('pointerdown', (pointer) => {
            if (!this.gameOver) {
                this.isMouseDown = true;
                this.mousePosition.x = pointer.x;
                this.mousePosition.y = pointer.y;
                this.shoot(pointer.x, pointer.y);
            }
        });
        
        this.input.on('pointermove', (pointer) => {
            this.mousePosition.x = pointer.x;
            this.mousePosition.y = pointer.y;
        });
        
        this.input.on('pointerup', () => {
            this.isMouseDown = false;
        });
    }
    
    setupSound() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log("Audio context created successfully");
            
            // Create oscillators for different sound effects
            this.setupOscillators();
            
            // Start background music
            this.startBackgroundMusic();
            
        } catch (e) {
            console.error("Failed to create audio context:", e);
            // Create dummy sound objects as fallback
            this.shootSound = { play: () => {} };
            this.hitSound = { play: () => {} };
            this.explosionSound = { play: () => {} };
        }
    }
    
    setupOscillators() {
        // Create gain node for master volume
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 0.3; // Set master volume to 30%
        this.masterGain.connect(this.audioContext.destination);
        
        // Create shoot sound (square wave for player actions)
        this.shootSound = {
            play: () => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.type = 'square'; // Square wave for player actions
                oscillator.frequency.value = 440; // A4 note
                
                gainNode.gain.value = 0.1;
                
                oscillator.connect(gainNode);
                gainNode.connect(this.masterGain);
                
                oscillator.start();
                
                // Frequency sweep down
                oscillator.frequency.exponentialRampToValueAtTime(
                    880, // End at A5
                    this.audioContext.currentTime + 0.1
                );
                
                // Quick fade out
                gainNode.gain.exponentialRampToValueAtTime(
                    0.01,
                    this.audioContext.currentTime + 0.1
                );
                
                // Stop after 100ms
                setTimeout(() => {
                    oscillator.stop();
                    oscillator.disconnect();
                    gainNode.disconnect();
                }, 100);
            }
        };
        
        // Create hit sound (sine wave for enemies)
        this.hitSound = {
            play: () => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.type = 'sine'; // Sine wave for enemies
                oscillator.frequency.value = 220; // A3 note
                
                gainNode.gain.value = 0.1;
                
                oscillator.connect(gainNode);
                gainNode.connect(this.masterGain);
                
                oscillator.start();
                
                // Frequency sweep down
                oscillator.frequency.exponentialRampToValueAtTime(
                    110, // End at A2
                    this.audioContext.currentTime + 0.2
                );
                
                // Quick fade out
                gainNode.gain.exponentialRampToValueAtTime(
                    0.01,
                    this.audioContext.currentTime + 0.2
                );
                
                // Stop after 200ms
                setTimeout(() => {
                    oscillator.stop();
                    oscillator.disconnect();
                    gainNode.disconnect();
                }, 200);
            }
        };
        
        // Create explosion sound (noise for explosions)
        this.explosionSound = {
            play: () => {
                // Create noise with audio buffer
                const bufferSize = 4096;
                const noiseBuffer = this.audioContext.createBuffer(
                    1, bufferSize, this.audioContext.sampleRate
                );
                const output = noiseBuffer.getChannelData(0);
                
                // Fill buffer with noise
                for (let i = 0; i < bufferSize; i++) {
                    output[i] = Math.random() * 2 - 1;
                }
                
                // Create noise source
                const noise = this.audioContext.createBufferSource();
                noise.buffer = noiseBuffer;
                
                // Create bandpass filter for explosion effect
                const filter = this.audioContext.createBiquadFilter();
                filter.type = 'bandpass';
                filter.frequency.value = 100;
                
                // Create gain node for volume control
                const gainNode = this.audioContext.createGain();
                gainNode.gain.value = 0.15;
                
                // Connect nodes
                noise.connect(filter);
                filter.connect(gainNode);
                gainNode.connect(this.masterGain);
                
                // Start noise
                noise.start();
                
                // Quick fade out
                gainNode.gain.exponentialRampToValueAtTime(
                    0.01,
                    this.audioContext.currentTime + 0.3
                );
                
                // Stop after 300ms
                setTimeout(() => {
                    noise.stop();
                    noise.disconnect();
                    filter.disconnect();
                    gainNode.disconnect();
                }, 300);
                
                // Add background warp effect when explosion happens
                this.warpBackground();
            }
        };
        
        // Create sad game over music
        this.gameOverMusic = {
            play: () => {
                // Only play if not already playing
                if (this.gameOverMusicPlaying) return;
                this.gameOverMusicPlaying = true;
                
                // Sad chord progression in minor key
                const chords = [
                    [220, 261.63, 329.63], // A minor
                    [196, 246.94, 293.66], // G minor
                    [174.61, 220, 277.18], // F minor
                    [164.81, 196, 246.94]  // E minor
                ];
                
                // Play each chord with delay
                chords.forEach((chord, index) => {
                    setTimeout(() => {
                        // Create oscillators for each note in the chord
                        chord.forEach(frequency => {
                            const oscillator = this.audioContext.createOscillator();
                            const gainNode = this.audioContext.createGain();
                            
                            // Use sine wave for sad feeling
                            oscillator.type = 'sine';
                            oscillator.frequency.value = frequency;
                            
                            // Set volume
                            gainNode.gain.value = 0.05;
                            
                            // Connect nodes
                            oscillator.connect(gainNode);
                            gainNode.connect(this.masterGain);
                            
                            // Start oscillator
                            oscillator.start();
                            
                            // Slow attack
                            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                            gainNode.gain.linearRampToValueAtTime(
                                0.05,
                                this.audioContext.currentTime + 0.2
                            );
                            
                            // Slow release
                            setTimeout(() => {
                                gainNode.gain.linearRampToValueAtTime(
                                    0.001,
                                    this.audioContext.currentTime + 1.0
                                );
                                
                                // Stop after fade out
                                setTimeout(() => {
                                    oscillator.stop();
                                    oscillator.disconnect();
                                    gainNode.disconnect();
                                }, 1000);
                            }, 1500);
                        });
                    }, index * 2000); // 2 seconds per chord
                });
            }
        };
    }
    
    startBackgroundMusic() {
        // Create array to store active oscillators
        this.activeOscillators = [];
        
        // MIDI-style background music parameters
        const baseNotes = [110, 146.83, 164.81, 196]; // A2, D3, E3, G3
        const rhythmPattern = [1, 0, 2, 0, 3, 2, 0, 1]; // Pattern of notes to play
        let currentStep = 0;
        
        // Create background music interval
        this.backgroundMusicEvent = this.time.addEvent({
            delay: 250, // 240 BPM (quarter note)
            callback: () => {
                if (this.gameOver) return;
                
                // Get current note from pattern
                const noteIndex = rhythmPattern[currentStep % rhythmPattern.length];
                
                // Only play on certain steps (creates rhythm)
                if (noteIndex !== undefined) {
                    // Create oscillator for this note
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    // Alternate between sine and triangle waves
                    oscillator.type = currentStep % 2 === 0 ? 'sine' : 'triangle';
                    
                    // Set frequency based on pattern
                    oscillator.frequency.value = baseNotes[noteIndex];
                    
                    // Set volume
                    gainNode.gain.value = 0.05;
                    
                    // Connect nodes
                    oscillator.connect(gainNode);
                    gainNode.connect(this.masterGain);
                    
                    // Start oscillator
                    oscillator.start();
                    
                    // Fade out
                    gainNode.gain.exponentialRampToValueAtTime(
                        0.01,
                        this.audioContext.currentTime + 0.2
                    );
                    
                    // Store reference to active oscillator
                    this.activeOscillators.push({
                        oscillator,
                        gainNode,
                        endTime: this.time.now + 200
                    });
                }
                
                // Move to next step in pattern
                currentStep = (currentStep + 1) % rhythmPattern.length;
                
                // Clean up finished oscillators
                this.activeOscillators = this.activeOscillators.filter(osc => {
                    if (this.time.now >= osc.endTime) {
                        osc.oscillator.stop();
                        osc.oscillator.disconnect();
                        osc.gainNode.disconnect();
                        return false;
                    }
                    return true;
                });
            },
            callbackScope: this,
            loop: true
        });
    }
    
    update(time) {
        if (this.gameOver) return;
        
        // Handle screen shake
        if (this.shakeDuration > 0) {
            this.shakeDuration--;
            if (this.shakeDuration === 0) {
                // Reset camera position when shake is done
                this.cameras.main.setPosition(0, 0);
                this.shakeOffset = { x: 0, y: 0 };
            } else {
                // Calculate new random shake offset
                this.shakeOffset = {
                    x: Phaser.Math.Between(-this.shakeIntensity, this.shakeIntensity),
                    y: Phaser.Math.Between(-this.shakeIntensity, this.shakeIntensity)
                };
                // Apply shake offset to camera
                this.cameras.main.setPosition(this.shakeOffset.x, this.shakeOffset.y);
            }
        }
        
        // Handle ammo refill
        if (this.currentAmmo < this.maxAmmo && time > this.lastAmmoRefillTime + this.ammoRefillDelay) {
            this.currentAmmo++;
            this.lastAmmoRefillTime = time;
            this.updateAmmoDisplay();
            
            // Play reload sound with oscillator
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.value = 300;
            
            gainNode.gain.value = 0.1;
            
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            oscillator.start();
            
            // Frequency sweep up
            oscillator.frequency.exponentialRampToValueAtTime(
                600,
                this.audioContext.currentTime + 0.1
            );
            
            // Quick fade out
            gainNode.gain.exponentialRampToValueAtTime(
                0.01,
                this.audioContext.currentTime + 0.1
            );
            
            // Stop after 100ms
            setTimeout(() => {
                oscillator.stop();
                oscillator.disconnect();
                gainNode.disconnect();
            }, 100);
        }
        
        // Update player movement based on cursor keys or WASD with inertia
        if (this.player && this.player.active) {
            if (this.cursors && this.wasd) {
                // Define acceleration and deceleration rates
                const acceleration = 20; // How quickly player accelerates
                const deceleration = 0.85; // Friction factor (0-1, lower = more friction)
                const maxSpeed = this.player.speed; // Maximum speed
                
                // Get current velocity
                let velocityX = this.player.body.velocity.x;
                let velocityY = this.player.body.velocity.y;
                
                // Apply acceleration based on input
                if ((this.cursors.left && this.cursors.left.isDown) || (this.wasd.left && this.wasd.left.isDown)) {
                    velocityX -= acceleration;
                } else if ((this.cursors.right && this.cursors.right.isDown) || (this.wasd.right && this.wasd.right.isDown)) {
                    velocityX += acceleration;
                } else {
                    // Apply deceleration when no horizontal input
                    velocityX *= deceleration;
                }
                
                if ((this.cursors.up && this.cursors.up.isDown) || (this.wasd.up && this.wasd.up.isDown)) {
                    velocityY -= acceleration;
                } else if ((this.cursors.down && this.cursors.down.isDown) || (this.wasd.down && this.wasd.down.isDown)) {
                    velocityY += acceleration;
                } else {
                    // Apply deceleration when no vertical input
                    velocityY *= deceleration;
                }
                
                // Apply a small threshold to stop completely when speed is very low
                if (Math.abs(velocityX) < 0.5) velocityX = 0;
                if (Math.abs(velocityY) < 0.5) velocityY = 0;
                
                // Limit maximum speed
                const currentSpeed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
                if (currentSpeed > maxSpeed) {
                    const ratio = maxSpeed / currentSpeed;
                    velocityX *= ratio;
                    velocityY *= ratio;
                }
                
                // Apply the calculated velocity
                this.player.setVelocity(velocityX, velocityY);
            }
            
            // Continuous shooting when mouse is held down
            if (this.isMouseDown && time > this.lastShotTime + this.shootingDelay) {
                this.shoot(this.mousePosition.x, this.mousePosition.y);
                this.lastShotTime = time;
            }
            
            // Update player particles
            this.player.update();
        }
        
        // Update enemies - use a safe way to iterate through children
        if (this.enemies) {
            const enemies = this.enemies.getChildren();
            for (let i = 0; i < enemies.length; i++) {
                const enemy = enemies[i];
                if (enemy && enemy.active) {
                    enemy.update(time);
                    
                    // Apply vector field influence if available
                    if (this.vectorField) {
                        this.applyVectorFieldToEnemy(enemy);
                    }
                    
                    // Add random movement variations for less predictable motion
                    if (time % 60 === 0 && Math.random() < 0.3) { // Occasionally add random impulse
                        const randomAngle = Math.random() * Math.PI * 2;
                        const randomStrength = Math.random() * 50 + 20;
                        enemy.body.velocity.x += Math.cos(randomAngle) * randomStrength;
                        enemy.body.velocity.y += Math.sin(randomAngle) * randomStrength;
                    }
                    
                    // Enemy shooting logic - only if canShoot is true
                    if (this.player && this.player.active && enemy.canShoot) {
                        // Check if it's time for this enemy to shoot
                        if (!enemy.lastShotTime || time > enemy.lastShotTime + 1000) {
                            // Random chance to shoot (40%)
                            if (Phaser.Math.Between(0, 100) < 40) {
                                this.enemyShoot(enemy, this.player.x, this.player.y);
                                enemy.lastShotTime = time;
                            }
                        }
                    }
                }
            }
            
            // Check if wave is complete
            if (this.waveInProgress && enemies.length === 0 && this.enemiesRemainingInWave === 0) {
                this.waveInProgress = false;
                this.time.delayedCall(this.timeBetweenWaves, () => {
                    if (!this.gameOver) {
                        this.startNextWave();
                    }
                });
            }
        }
        
        // Update enemy bullets to limit their range
        if (this.enemyBullets) {
            const bullets = this.enemyBullets.getChildren();
            for (let i = 0; i < bullets.length; i++) {
                const bullet = bullets[i];
                if (bullet && bullet.active) {
                    // Check if the bullet has exceeded its lifetime
                    const creationTime = bullet.getData('creationTime') || 0;
                    const lifetime = bullet.getData('lifetime') || 2000;
                    
                    if (time - creationTime > lifetime) {
                        // Destroy the bullet if it has exceeded its lifetime
                        bullet.destroy();
                    }
                }
            }
        }
        
        // Enemy shooting logic
        this.enemies.getChildren().forEach(enemy => {
            if (enemy.canShoot && !this.gameOver) {
                // Chance to shoot increases with wave number
                const shootChance = 0.004 * this.enemyShootChanceMultiplier;
                
                if (Phaser.Math.FloatBetween(0, 1) < shootChance) {
                    this.enemyShoot(enemy, this.player.x, this.player.y);
                    
                    // Add a cooldown after shooting
                    enemy.canShoot = false;
                    this.time.delayedCall(this.enemyShootingDelay, () => {
                        if (enemy && enemy.active) {
                            enemy.canShoot = true;
                        }
                    });
                }
            }
        });
    }
    
    shoot(targetX, targetY) {
        // Check if player has ammo
        if (this.currentAmmo <= 0) {
            // No ammo - play empty click sound
            // Create a simple click sound using oscillator
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.value = 80;
            
            gainNode.gain.value = 0.1;
            
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            oscillator.start();
            
            // Quick fade out
            gainNode.gain.exponentialRampToValueAtTime(
                0.01,
                this.audioContext.currentTime + 0.05
            );
            
            // Frequency drop
            oscillator.frequency.exponentialRampToValueAtTime(
                40,
                this.audioContext.currentTime + 0.05
            );
            
            // Stop after 50ms
            setTimeout(() => {
                oscillator.stop();
                oscillator.disconnect();
                gainNode.disconnect();
            }, 50);
            
            return;
        }
        
        // Create a new bullet
        const bullet = this.bullets.get();
        
        if (bullet) {
            // Ensure the bullet has a valid texture before firing
            if (!bullet.texture || !bullet.texture.key) {
                bullet.setTexture(this.bulletIcon || this.availableLightIcons[0] || 'fallback_texture');
            }
            
            bullet.fire(this.player.x, this.player.y, targetX, targetY, this.bulletColor);
            this.shootSound.play();
            
            // Decrease ammo
            this.currentAmmo--;
            
            // Update ammo display
            this.updateAmmoDisplay();
        }
    }
    
    updateAmmoDisplay() {
        if (this.ammoText) {
            this.ammoText.setText(`AMMO: ${this.currentAmmo}/${this.maxAmmo}`);
            
            // Visual feedback when low on ammo
            if (this.currentAmmo <= 1) {
                this.ammoText.setColor('#ff0000'); // Red when low
            } else {
                this.ammoText.setColor('#ffffff'); // White otherwise
            }
        }
    }
    
    enemyShoot(enemy, targetX, targetY) {
        // Create a new enemy bullet
        const bullet = this.enemyBullets.get();
        
        if (bullet) {
            // Ensure the bullet has a valid texture before firing
            if (!bullet.texture || !bullet.texture.key) {
                bullet.setTexture(this.bulletIcon || this.availableLightIcons[0] || 'fallback_texture');
            }
            
            // Store creation time for lifetime tracking
            bullet.setData('creationTime', this.time.now);
            
            // Fire with enemy color and faster speed but shorter range
            bullet.fire(enemy.x, enemy.y, targetX, targetY, this.enemyColor, 250); // Slightly faster speed
            
            // Play shoot sound (optional)
            this.shootSound.play();
        }
    }
    
    bulletHitEnemy(bullet, enemy) {
        // Play hit sound
        if (this.hitSound) {
            this.hitSound.play();
        }
        
        // Check if it's a large enemy
        if (enemy.isLarge && enemy.health > 1) {
            // Reduce health instead of destroying
            enemy.health--;
            enemy.updateHealthBar();
            
            // Flash effect to indicate hit
            this.tweens.add({
                targets: enemy,
                alpha: 0.3,
                duration: 100,
                yoyo: true,
                repeat: 1
            });
            
            // Create explosion at impact point but don't destroy enemy
            this.createSmallExplosion(bullet.x, bullet.y, this.bulletColor);
            
            // Always destroy the bullet
            bullet.destroy();
            
            return;
        }
        
        // Create an explosion at the enemy's position
        this.createExplosion(enemy.x, enemy.y, this.enemyColor);
        
        // Warp background when enemy is destroyed
        this.warpBackground(enemy.x, enemy.y, enemy.isLarge ? 2 : 1);
        
        // Destroy the enemy
        if (enemy.isLarge) {
            this.createDramaticDeath(enemy);
            // Shake screen for large enemies
            this.shakeScreen(5, 20);
            // Play more exciting sound for large enemies
            this.playExcitingExplosion();
            // Award 50 points for large enemies
            this.updateScore(50);
        } else {
            enemy.destroy();
            // Add points to score (normal enemies 10 points)
            this.updateScore(10);
        }
        
        // Track enemies remaining in wave
        if (this.waveInProgress && this.enemiesRemainingInWave > 0) {
            this.enemiesRemainingInWave--;
        }
        
        // Check for chain reactions
        this.checkChainReaction(enemy.x, enemy.y);
        
        // Add score pop animation
        if (this.scoreText) {
            this.tweens.add({
                targets: this.scoreText,
                scale: { from: 1.1, to: 1 },
                duration: 200,
                ease: 'Back.easeOut'
            });
        }
        
        // Destroy the bullet
        bullet.destroy();
    }
    
    playerHitEnemy(player, enemy) {
        // Only process if not already game over
        if (this.gameOver) return;
        
        // Play explosion sound
        if (this.explosionSound) {
            this.explosionSound.play();
        }
        
        // Create explosion effects before destroying objects
        if (enemy && enemy.active && enemy.x !== undefined && enemy.y !== undefined) {
            this.createDramaticDeath(enemy);
        }
        
        if (player && player.active && player.x !== undefined && player.y !== undefined) {
            // Create dramatic player death
            this.createDramaticDeath(player);
            
            // Major background warp when player is destroyed
            this.warpBackground(player.x, player.y, 3);
            
            // Shake screen violently for player death
            this.shakeScreen(10, 40);
            
            // Play exciting explosion for player death
            this.playExcitingExplosion();
        }
        
        // Check if enemy still exists before destroying it
        if (enemy && enemy.active && enemy.destroy) {
            // Clean up health bar if it exists
            if (enemy.healthBar) {
                enemy.healthBar.destroy();
            }
            enemy.destroy();
        }
        
        // Check if player still exists
        if (player && player.active) {
            // Stop player movement
            if (player.body) {
                player.setVelocity(0, 0);
            }
            
            // Disable player
            player.setActive(false);
            player.setVisible(false);
        }
        
        // Store final wave and score
        this.finalWave = this.currentWave;
        this.finalScore = this.score;
        
        // Game over
        this.gameOver = true;
        
        if (this.gameOverText) {
            // Update game over text to include wave information
            this.gameOverText.setText(`GAME OVER\nWave ${this.finalWave} - Score ${this.finalScore}\nClick to restart`);
            this.gameOverText.setVisible(true);
            
            // Add dramatic game over animations
        this.tweens.add({
                targets: this.gameOverText,
                scale: { from: 0.5, to: 1.2 },
                duration: 500,
                ease: 'Back.easeOut',
            onComplete: () => {
                    this.tweens.add({
                        targets: this.gameOverText,
                        scale: { from: 1.2, to: 1 },
                        duration: 300,
                        ease: 'Bounce.easeOut'
                    });
                }
            });
            
            // Add pulsing effect after initial animation
            this.time.delayedCall(800, () => {
                this.tweens.add({
                    targets: this.gameOverText,
                    scale: { from: 1, to: 1.05 },
                    duration: 800,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            });
        }
        
        // Stop spawning enemies
        this.time.removeAllEvents();
        
        // Stop background music
        if (this.backgroundMusicEvent) {
            this.backgroundMusicEvent.remove();
        }
        
        // Stop all active oscillators
        if (this.activeOscillators) {
            this.activeOscillators.forEach(osc => {
                osc.oscillator.stop();
                osc.oscillator.disconnect();
                osc.gainNode.disconnect();
            });
            this.activeOscillators = [];
        }
        
        // Play sad game over music
        if (this.gameOverMusic) {
            this.gameOverMusic.play();
        }
        
        // Check if current score is a new top score before game over
        if (this.score > this.topScore) {
            this.topScore = this.score;
            this.saveTopScoreToCookie(this.topScore);
        }
    }
    
    enemyBulletHitPlayer(player, bullet) {
        // Only process if not already game over
        if (this.gameOver) return;
        
        // Play explosion sound
        if (this.explosionSound) {
            this.explosionSound.play();
        }
        
        // Create explosion effect at player position
        if (player && player.active && player.x !== undefined && player.y !== undefined) {
            // Create dramatic player death
            this.createDramaticDeath(player);
            
            // Major background warp when player is destroyed
            this.warpBackground(player.x, player.y, 3);
            
            // Shake screen violently for player death
            this.shakeScreen(10, 40);
            
            // Play exciting explosion for player death
            this.playExcitingExplosion();
        }
        
        // Destroy the bullet
        if (bullet && bullet.active && bullet.destroy) {
            bullet.destroy();
        }
        
        // Check if player still exists
        if (player && player.active) {
            // Stop player movement
            if (player.body) {
                player.setVelocity(0, 0);
            }
            
            // Disable player
            player.setActive(false);
            player.setVisible(false);
        }
        
        // Store final wave and score
        this.finalWave = this.currentWave;
        this.finalScore = this.score;
        
        // Game over
        this.gameOver = true;
        
        if (this.gameOverText) {
            // Update game over text to include wave information
            this.gameOverText.setText(`GAME OVER\nWave ${this.finalWave} - Score ${this.finalScore}\nClick to restart`);
            this.gameOverText.setVisible(true);
            
            // Add dramatic game over animations
        this.tweens.add({
                targets: this.gameOverText,
                scale: { from: 0.5, to: 1.2 },
                duration: 500,
                ease: 'Back.easeOut',
            onComplete: () => {
                    this.tweens.add({
                        targets: this.gameOverText,
                        scale: { from: 1.2, to: 1 },
                        duration: 300,
                        ease: 'Bounce.easeOut'
                    });
                }
            });
            
            // Add pulsing effect after initial animation
            this.time.delayedCall(800, () => {
                this.tweens.add({
                    targets: this.gameOverText,
                    scale: { from: 1, to: 1.05 },
                    duration: 800,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            });
        }
        
        // Stop spawning enemies
        this.time.removeAllEvents();
        
        // Stop background music
        if (this.backgroundMusicEvent) {
            this.backgroundMusicEvent.remove();
        }
        
        // Stop all active oscillators
        if (this.activeOscillators) {
            this.activeOscillators.forEach(osc => {
                osc.oscillator.stop();
                osc.oscillator.disconnect();
                osc.gainNode.disconnect();
            });
            this.activeOscillators = [];
        }
        
        // Play sad game over music
        if (this.gameOverMusic) {
            this.gameOverMusic.play();
        }
        
        // Check if current score is a new top score before game over
        if (this.score > this.topScore) {
            this.topScore = this.score;
            this.saveTopScoreToCookie(this.topScore);
        }
    }
    
    bulletHitEnemyBullet(playerBullet, enemyBullet) {
        // Create a small explosion effect
        if (enemyBullet && enemyBullet.active && enemyBullet.x !== undefined && enemyBullet.y !== undefined) {
            // Create a smaller explosion for bullet collision
            this.createSmallExplosion(enemyBullet.x, enemyBullet.y, this.enemyColor);
            
            // Small background warp when bullets collide - pass explosion coordinates
            this.warpBackground(enemyBullet.x, enemyBullet.y, 0.5);
        }
        
        // Destroy both bullets
        if (playerBullet && playerBullet.active && playerBullet.destroy) {
            playerBullet.destroy();
        }
        
        if (enemyBullet && enemyBullet.active && enemyBullet.destroy) {
            enemyBullet.destroy();
        }
        
        // Add a small score bonus for destroying enemy bullets
        this.updateScore(1);
    }
    
    createSmallExplosion(x, y, color) {
        try {
            // Create a smaller PS1-style explosion for bullet collisions
            
            // Create a container for our explosion elements
            const explosionContainer = this.add.container(x, y);
            
            // Add a central explosion sprite
            const explosion = this.add.image(0, 0, 'explosion_texture');
            explosion.setTint(color);
            explosion.setScale(0.3); // Smaller than regular explosions
            explosionContainer.add(explosion);
            
            // Add a few smaller particles
            const particleCount = 3; // Fewer particles
            const particles = [];
            
            for (let i = 0; i < particleCount; i++) {
                // Use the same explosion texture but smaller
                const particle = this.add.image(0, 0, 'explosion_texture');
                particle.setTint(color);
                
                // Set random scale for variety
                particle.setScale(Phaser.Math.FloatBetween(0.1, 0.2));
                
                // Set initial positions randomly around center
                particle.x = Phaser.Math.Between(-8, 8);
                particle.y = Phaser.Math.Between(-8, 8);
                
                // Add to container and array
                explosionContainer.add(particle);
                particles.push(particle);
                
                // Create individual tweens for each particle
        this.tweens.add({
                    targets: particle,
                    x: particle.x + Phaser.Math.Between(-20, 20),
                    y: particle.y + Phaser.Math.Between(-20, 20),
                    scale: { from: particle.scale, to: 0 },
                    alpha: { from: 0.8, to: 0 },
                    duration: Phaser.Math.Between(100, 200), // Faster for small explosions
                    ease: 'Power2'
                });
            }
            
            // Animate the main explosion
            this.tweens.add({
                targets: explosion,
                scale: { from: 0.3, to: 0.6 },
                alpha: { from: 1, to: 0 },
                duration: 200,
                ease: 'Power2'
            });
            
            // Destroy the container after animation completes
            this.time.delayedCall(200, () => {
                explosionContainer.destroy();
            });
            
        } catch (e) {
            console.error('Error in createSmallExplosion:', e);
        }
    }
    
    createExplosion(x, y, color) {
        try {
            // Create a PS1-style sprite-based explosion
            
            // Create a container for our explosion elements
            const explosionContainer = this.add.container(x, y);
            
            // Add a central explosion sprite
            const explosion = this.add.image(0, 0, 'explosion_texture');
            explosion.setTint(color);
            explosion.setScale(0.8);
            explosionContainer.add(explosion);
            
            // Add smaller explosion sprites around the main one
            const particleCount = 6; // Reduced for PS1-style simplicity
            const particles = [];
            
            for (let i = 0; i < particleCount; i++) {
                // Use the same explosion texture but smaller
                const particle = this.add.image(0, 0, 'explosion_texture');
                particle.setTint(color);
                
                // Set random scale for variety
                particle.setScale(Phaser.Math.FloatBetween(0.2, 0.4));
                
                // Set initial positions randomly around center
                particle.x = Phaser.Math.Between(-15, 15);
                particle.y = Phaser.Math.Between(-15, 15);
                
                // Add to container and array
                explosionContainer.add(particle);
                particles.push(particle);
                
                // Create individual tweens for each particle
                this.tweens.add({
                    targets: particle,
                    x: particle.x + Phaser.Math.Between(-50, 50),
                    y: particle.y + Phaser.Math.Between(-50, 50),
                    scale: { from: particle.scale, to: 0 },
                    alpha: { from: 0.8, to: 0 },
                    duration: Phaser.Math.Between(200, 350), // Faster for PS1-style
                    ease: 'Power2'
                });
            }
            
            // Animate the main explosion
            this.tweens.add({
                targets: explosion,
                scale: { from: 0.8, to: 1.5 },
                alpha: { from: 1, to: 0 },
                duration: 300,
                ease: 'Power2'
            });
            
            // Destroy the container after animation completes
            this.time.delayedCall(350, () => {
                explosionContainer.destroy();
            });
            
        } catch (e) {
            console.error('Error in createExplosion:', e);
        }
    }
    
    startNextWave() {
        // Increment wave counter
        this.currentWave++;
        
        // Update wave text
        if (this.waveText) {
            this.waveText.setText(`WAVE: ${this.currentWave}`);
            
            // Add wave number animation
            this.tweens.add({
                targets: this.waveText,
                scale: { from: 1.5, to: 1 },
                duration: 500,
                ease: 'Back.easeOut'
            });
        }
        
        // Increase difficulty with each wave
        this.enemySpeedMultiplier = 1.0 + (this.currentWave * 0.05); // 5% faster per wave
        this.enemyShootChanceMultiplier = 1.0 + (this.currentWave * 0.1); // 10% more shooting per wave
        
        // Increase large enemy frequency (lower number means more frequent)
        // Minimum frequency is 3 (every 3rd enemy is large)
        this.largeEnemyFrequency = Math.max(3, 7 - Math.floor(this.currentWave / 3));
        
        // Increase enemies per wave (cap at 20)
        this.enemiesPerWave = Math.min(20, 8 + Math.floor(this.currentWave / 2));
        
        console.log(`Starting Wave ${this.currentWave} - Speed: ${this.enemySpeedMultiplier.toFixed(2)}x, Shooting: ${this.enemyShootChanceMultiplier.toFixed(2)}x, Large Enemy Frequency: every ${this.largeEnemyFrequency}th enemy`);
        
        // Start spawning enemies for this wave
        this.waveInProgress = true;
        this.enemiesRemainingInWave = this.enemiesPerWave;
        this.spawnWaveEnemies();
        
        // Generate new target background color with more variation
        const hueShift = (this.currentWave * 30) % 360; // More noticeable hue shift
        
        // Create new color with shifted hue
        const newColor = Phaser.Display.Color.HSVToRGB(
            hueShift / 360,
            0.25, // Low saturation for subtle colors
            0.35  // Darker value to stay in background
        );
        
        this.targetBgTint = Phaser.Display.Color.GetColor(
            newColor.r,
            newColor.g,
            newColor.b
        );
    }
    
    spawnWaveEnemies() {
        // Calculate spawn delays based on wave number
        // Initial enemies spawn 3 seconds apart in wave 1, decreasing to 0.5 seconds by wave 10+
        const baseDelay = Math.max(500, 3000 - (this.currentWave - 1) * 250);
        
        // Add randomness to spawn timing (±30% variation)
        const getRandomDelay = () => {
            const variation = baseDelay * 0.3; // 30% variation
            return Phaser.Math.Between(baseDelay - variation, baseDelay + variation);
        };
        
        // Sometimes spawn enemies in small groups as waves progress
        const groupSpawnChance = Math.min(0.7, this.currentWave * 0.07); // Increases with waves, caps at 70%
        const maxGroupSize = Math.min(4, 1 + Math.floor(this.currentWave / 3)); // Larger groups in later waves
        
        // Initial batch of enemies - smaller in early waves, larger in later waves
        const initialSpawn = Math.min(Math.max(2, Math.floor(this.currentWave / 2)), this.enemiesRemainingInWave);
        console.log(`Wave ${this.currentWave}: Spawning initial batch of ${initialSpawn} enemies`);
        
        // Spawn initial batch immediately
        for (let i = 0; i < initialSpawn; i++) {
            this.spawnEnemy();
            this.enemiesRemainingInWave--;
        }
        
        // Set up scheduled spawning for remaining enemies
        if (this.enemiesRemainingInWave > 0) {
            // Create array of spawn times for all remaining enemies
            const remainingSpawns = [];
            let remainingToSchedule = this.enemiesRemainingInWave;
            
            while (remainingToSchedule > 0) {
                // Decide if this is a group spawn
                const isGroupSpawn = Math.random() < groupSpawnChance;
                const groupSize = isGroupSpawn ? Math.min(Phaser.Math.Between(2, maxGroupSize), remainingToSchedule) : 1;
                
                // Add spawn entry
                remainingSpawns.push({
                    count: groupSize,
                    delay: getRandomDelay()
                });
                
                remainingToSchedule -= groupSize;
            }
            
            // Sort spawns by delay (just to keep track of them in order)
            remainingSpawns.sort((a, b) => a.delay - b.delay);
            
            // Schedule each spawn
            let cumulativeDelay = 0;
            for (const spawn of remainingSpawns) {
                cumulativeDelay += spawn.delay;
                
                this.time.delayedCall(cumulativeDelay, () => {
                    if (this.gameOver) return;
                    
                    // Spawn the group
                    for (let i = 0; i < spawn.count; i++) {
                        this.spawnEnemy();
                        this.enemiesRemainingInWave--;
                    }
                    
                    console.log(`Spawned group of ${spawn.count} enemies, ${this.enemiesRemainingInWave} remaining in wave`);
                });
            }
        }
    }
    
    spawnEnemy() {
        if (this.gameOver) return;
        
        // Determine spawn position (much further outside the screen)
        let x, y;
        const side = Phaser.Math.Between(0, 3);
        
        // Significantly increase spawn distance to ensure enemies are far from player
        const offscreenMargin = 120; // Increased from 40 to 120
        
        switch (side) {
            case 0: // Top
                x = Phaser.Math.Between(0, this.gameWidth);
                y = -offscreenMargin;
                break;
            case 1: // Right
                x = this.gameWidth + offscreenMargin;
                y = Phaser.Math.Between(0, this.gameHeight);
                break;
            case 2: // Bottom
                x = Phaser.Math.Between(0, this.gameWidth);
                y = this.gameHeight + offscreenMargin;
                break;
            case 3: // Left
                x = -offscreenMargin;
                y = Phaser.Math.Between(0, this.gameHeight);
                break;
        }
        
        // Ensure we have a valid texture for the enemy
        const enemyTexture = this.enemyIcon || this.availableLightIcons[0] || 'fallback_texture';
        
        // Increment enemy counter
        this.enemyCounter++;
        
        // Create a new enemy with the valid texture
        const newEnemy = new Enemy(this, x, y, enemyTexture, this.enemyColor);
        
        // Apply wave-based speed multiplier
        newEnemy.speed *= this.enemySpeedMultiplier;
        
        // Every Nth enemy is a large one that takes multiple hits (frequency decreases with wave)
        if (this.enemyCounter % this.largeEnemyFrequency === 0) {
            newEnemy.setScale(0.65); // Reduced to half the previous size (1.3 / 2 = 0.65)
            
            // Health increases with wave number (base 3 + 1 per 3 waves)
            const additionalHealth = Math.floor(this.currentWave / 3);
            newEnemy.health = this.largeEnemyHealthBase + additionalHealth;
            
            newEnemy.isLarge = true; // Flag as large enemy
            newEnemy.setTint(0xffaa00); // Give it a distinct color
            
            // Add a health indicator - adjust position for smaller size
            newEnemy.healthBar = this.add.graphics();
            newEnemy.updateHealthBar = function() {
                if (this.healthBar) {
                    this.healthBar.clear();
                    this.healthBar.fillStyle(0x00ff00, 0.8);
                    const maxHealth = this.scene.largeEnemyHealthBase + Math.floor(this.scene.currentWave / 3);
                    this.healthBar.fillRect(-10, -15, 20 * (this.health / maxHealth), 4); // Smaller health bar
                    this.healthBar.lineStyle(1, 0xffffff, 0.8);
                    this.healthBar.strokeRect(-10, -15, 20, 4); // Smaller health bar
                }
            };
            newEnemy.updateHealthBar();
            
            // Make the health bar follow the enemy
            const healthBarUpdateEvent = this.time.addEvent({
                delay: 16,
                callback: () => {
                    if (newEnemy && newEnemy.active && newEnemy.healthBar) {
                        newEnemy.healthBar.x = newEnemy.x;
                        newEnemy.healthBar.y = newEnemy.y;
                        newEnemy.updateHealthBar();
                    } else {
                        // Enemy or health bar no longer exists, clean up the event
                        healthBarUpdateEvent.remove();
                        
                        // Clean up orphaned health bar if it exists but enemy doesn't
                        if ((!newEnemy || !newEnemy.active) && newEnemy.healthBar) {
                            newEnemy.healthBar.destroy();
                            newEnemy.healthBar = null;
                        }
                    }
                },
                loop: true
            });
            
            // Store reference to the event in the enemy for cleanup
            newEnemy.healthBarUpdateEvent = healthBarUpdateEvent;
        }
        
        this.enemies.add(newEnemy);
        
        // Add a random delay before this enemy can shoot
        // Between 1.5 and 4 seconds after spawning, reduced by wave multiplier
        const minDelay = 1500 / this.enemyShootChanceMultiplier;
        const maxDelay = 4000 / this.enemyShootChanceMultiplier;
        newEnemy.shootingDelay = Phaser.Math.Between(minDelay, maxDelay);
        newEnemy.canShoot = false;
        
        // Enable shooting after the delay
        this.time.delayedCall(newEnemy.shootingDelay, () => {
            if (newEnemy && newEnemy.active) {
                newEnemy.canShoot = true;
            }
        });
    }
    
    applyVectorFieldToEnemy(enemy) {
        if (!enemy || !enemy.active || !enemy.body) return;
        
        // Get the enemy's position relative to the vector field
        const fieldWidth = 256; // Vector field is 256x256
        const fieldHeight = 256;
        
        // Map enemy position to vector field coordinates (0-255)
        const fieldX = Math.floor((enemy.x / this.gameWidth) * fieldWidth) % fieldWidth;
        const fieldY = Math.floor((enemy.y / this.gameHeight) * fieldHeight) % fieldHeight;
        
        // Calculate vector field influence based on the pattern type
        let angle;
        
        // Different patterns based on the vector field index
        switch ((this.vectorFieldIndex - 1) % 8) {
            case 0: // Circular
                {
                    const centerX = fieldWidth / 2;
                    const centerY = fieldHeight / 2;
                    const dx = fieldX - centerX;
                    const dy = fieldY - centerY;
                    angle = Math.atan2(dy, dx) + (this.vectorFieldIndex % 2 ? Math.PI/2 : 0);
                }
                break;
                
            case 1: // Spiral
                {
                    const centerX = fieldWidth / 2;
                    const centerY = fieldHeight / 2;
                    const dx = fieldX - centerX;
                    const dy = fieldY - centerY;
                    const distance = Math.sqrt(dx*dx + dy*dy);
                    angle = Math.atan2(dy, dx) + distance / (50 + (this.vectorFieldIndex % 5) * 10);
                }
                break;
                
            case 2: // Noise
                angle = (Math.sin(fieldX * 0.1 + this.vectorFieldIndex) + Math.cos(fieldY * 0.1 + this.vectorFieldIndex)) * Math.PI;
                break;
                
            case 3: // Waves
                angle = Math.sin(fieldY * 0.05 + this.vectorFieldIndex) * Math.PI * 0.5;
                break;
                
            case 4: // Vortex
                {
                    const centerX = fieldWidth / 2;
                    const centerY = fieldHeight / 2;
                    const dx = fieldX - centerX;
                    const dy = fieldY - centerY;
                    const distance = Math.sqrt(dx*dx + dy*dy);
                    
                    if (distance < 1) {
                        angle = 0;
                    } else {
                        angle = Math.atan2(dy, dx) + Math.PI/2 + (this.vectorFieldIndex % 2 ? -1 : 1) * (1 - Math.min(1, distance / 100));
                    }
                }
                break;
                
            case 5: // Grid
                {
                    const cellSize = 16;
                    const isHorizontal = (Math.floor(fieldX / (cellSize * 4)) + Math.floor(fieldY / (cellSize * 4)) + this.vectorFieldIndex) % 2 === 0;
                    angle = isHorizontal ? 0 : Math.PI/2;
                }
                break;
                
            case 6: // Radial
                {
                    const numCenters = 3 + (this.vectorFieldIndex % 3);
                    const centers = [];
                    
                    // Create deterministic centers based on vector field index
                    for (let i = 0; i < numCenters; i++) {
                        centers.push({
                            x: ((this.vectorFieldIndex * 17 + i * 23) % 100) / 100 * fieldWidth,
                            y: ((this.vectorFieldIndex * 31 + i * 41) % 100) / 100 * fieldHeight,
                            strength: ((this.vectorFieldIndex * 7 + i * 13) % 50) / 100 + 0.5
                        });
                    }
                    
                    let angleX = 0;
                    let angleY = 0;
                    
                    // Calculate influence from each center
                    for (const center of centers) {
                        const dx = fieldX - center.x;
                        const dy = fieldY - center.y;
                        const distance = Math.sqrt(dx*dx + dy*dy);
                        if (distance < 1) continue;
                        
                        const influence = center.strength / distance;
                        angleX += (dx / distance) * influence;
                        angleY += (dy / distance) * influence;
                    }
                    
                    angle = Math.atan2(angleY, angleX);
                }
                break;
                
            case 7: // Chaos
                angle = Math.sin(fieldX * 0.01 * this.vectorFieldIndex) * Math.cos(fieldY * 0.01 * this.vectorFieldIndex) * Math.PI * 2;
                break;
                
            default:
                // Default to a simple circular pattern
                angle = Math.atan2(fieldY - fieldHeight/2, fieldX - fieldWidth/2);
        }
        
        // Apply a force in the direction of the vector field
        // Greatly reduced strength to make player targeting more dominant
        const forceStrength = 0.1; // Reduced from 0.4
        const vx = Math.cos(angle) * forceStrength;
        const vy = Math.sin(angle) * forceStrength;
        
        // Add this force to the enemy's velocity
        if (enemy.body && enemy.body.velocity) {
            enemy.body.velocity.x += vx * 30;
            enemy.body.velocity.y += vy * 30;
            
            // Add player targeting behavior (much stronger now)
            this.applyPlayerTargetingBehavior(enemy);
            
            // Add flocking behavior with stronger separation to prevent overlap
            this.applyFlockingBehavior(enemy);
            
            // Limit the enemy's speed to prevent excessive acceleration
            const maxSpeed = 150;
            const currentSpeed = enemy.body.velocity.length();
            if (currentSpeed > maxSpeed) {
                enemy.body.velocity.normalize().scale(maxSpeed);
            }
        }
    }
    
    // New method to make enemies target the player more aggressively
    applyPlayerTargetingBehavior(enemy) {
        if (!enemy || !enemy.active || !enemy.body || !this.player || !this.player.active) return;
        
        // Calculate direction to player
        const dx = this.player.x - enemy.x;
        const dy = this.player.y - enemy.y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        if (distance > 0) {
            // Normalize direction
            const nx = dx / distance;
            const ny = dy / distance;
            
            // Apply moderate force toward player (less dominant than before)
            const targetingStrength = 0.4; // Reduced from 0.8 to make movement less direct
            
            // Add some randomness to targeting for less predictable movement
            const randomFactor = 0.3; // How much randomness to add
            const randomAngle = (Math.random() - 0.5) * Math.PI * randomFactor;
            const cosRandom = Math.cos(randomAngle);
            const sinRandom = Math.sin(randomAngle);
            
            // Apply rotated vector for less predictable movement
            const targetX = nx * cosRandom - ny * sinRandom;
            const targetY = nx * sinRandom + ny * cosRandom;
            
            enemy.body.velocity.x += targetX * targetingStrength * 60;
            enemy.body.velocity.y += targetY * targetingStrength * 60;
        }
    }
    
    applyFlockingBehavior(enemy) {
        if (!enemy || !enemy.active || !enemy.body) return;
        
        // Get all enemies
        if (!this.enemies) return;
        
        const enemies = this.enemies.getChildren();
        if (!enemies || !enemies.length) return;
        
        // Parameters for flocking behavior
        const alignmentRadius = 100;
        const cohesionRadius = 150;
        const separationRadius = 120; // Increased from 80 to create even more space between enemies
        
        // Weights for different behaviors - increased alignment and cohesion, maintained high separation
        const alignmentWeight = 0.2;  // Increased from 0.1
        const cohesionWeight = 0.2;   // Increased from 0.1
        const separationWeight = 0.9; // Increased from 0.8 to strongly prevent overlap
        
        let alignmentX = 0;
        let alignmentY = 0;
        let alignmentCount = 0;
        
        let cohesionX = 0;
        let cohesionY = 0;
        let cohesionCount = 0;
        
        let separationX = 0;
        let separationY = 0;
        
        // Calculate flocking forces
        for (let i = 0; i < enemies.length; i++) {
            const other = enemies[i];
            if (!other || !other.active || other === enemy) continue;
            
            const dx = other.x - enemy.x;
            const dy = other.y - enemy.y;
            const distance = Math.sqrt(dx*dx + dy*dy);
            
            // Alignment - align with nearby enemies
            if (distance < alignmentRadius && other.body && other.body.velocity) {
                alignmentX += other.body.velocity.x;
                alignmentY += other.body.velocity.y;
                alignmentCount++;
            }
            
            // Cohesion - move toward center of nearby enemies
            if (distance < cohesionRadius) {
                cohesionX += other.x;
                cohesionY += other.y;
                cohesionCount++;
            }
            
            // Separation - avoid crowding nearby enemies
            if (distance < separationRadius && distance > 0) {
                // Use even stronger repulsion with cubic falloff for closer enemies
                const repulsionForce = 1 / (distance * distance * distance);
                separationX -= (dx / distance) * repulsionForce;
                separationY -= (dy / distance) * repulsionForce;
            }
        }
        
        // Apply alignment force
        if (alignmentCount > 0 && enemy.body && enemy.body.velocity) {
            alignmentX /= alignmentCount;
            alignmentY /= alignmentCount;
            
            // Normalize
            const alignmentLength = Math.sqrt(alignmentX*alignmentX + alignmentY*alignmentY);
            if (alignmentLength > 0) {
                alignmentX /= alignmentLength;
                alignmentY /= alignmentLength;
                
                enemy.body.velocity.x += alignmentX * alignmentWeight;
                enemy.body.velocity.y += alignmentY * alignmentWeight;
            }
        }
        
        // Apply cohesion force
        if (cohesionCount > 0 && enemy.body && enemy.body.velocity) {
            cohesionX /= cohesionCount;
            cohesionY /= cohesionCount;
            
            const cohesionDx = cohesionX - enemy.x;
            const cohesionDy = cohesionY - enemy.y;
            
            // Normalize
            const cohesionLength = Math.sqrt(cohesionDx*cohesionDx + cohesionDy*cohesionDy);
            if (cohesionLength > 0) {
                enemy.body.velocity.x += (cohesionDx / cohesionLength) * cohesionWeight;
                enemy.body.velocity.y += (cohesionDy / cohesionLength) * cohesionWeight;
            }
        }
        
        // Apply separation force
        if (enemy.body && enemy.body.velocity) {
            const separationLength = Math.sqrt(separationX*separationX + separationY*separationY);
            if (separationLength > 0) {
                enemy.body.velocity.x += separationX * separationWeight;
                enemy.body.velocity.y += separationY * separationWeight;
            }
        }
    }
    
    // Helper method to draw a star shape
    drawStar(graphics, x, y, points, outerRadius, innerRadius) {
        // Calculate the angle between each point
        const angleStep = Math.PI * 2 / (points * 2);
        
        // Start drawing the star
        graphics.beginPath();
        
        // Draw each point of the star
        for (let i = 0; i < points * 2; i++) {
            // Calculate the radius for this point (alternating between outer and inner)
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            
            // Calculate the angle for this point
            const angle = i * angleStep - Math.PI / 2; // Start at the top
            
            // Calculate the coordinates
            const pointX = x + Math.cos(angle) * radius;
            const pointY = y + Math.sin(angle) * radius;
            
            // For the first point, move to it; for subsequent points, draw lines
            if (i === 0) {
                graphics.moveTo(pointX, pointY);
            } else {
                graphics.lineTo(pointX, pointY);
            }
        }
        
        // Close the path and fill it
        graphics.closePath();
        graphics.fillPath();
    }
    
    checkChainReaction(x, y) {
        // Find all enemies within explosion radius
        if (this.enemies) {
            const enemies = this.enemies.getChildren();
            const nearbyEnemies = [];
            
            // First, collect all enemies within the explosion radius
            for (let i = 0; i < enemies.length; i++) {
                const enemy = enemies[i];
                if (enemy && enemy.active) {
                    const distance = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
                    if (distance <= this.explosionRadius) {
                        nearbyEnemies.push(enemy);
                    }
                }
            }
            
            // Then destroy them with a slight delay for visual effect
            nearbyEnemies.forEach((enemy, index) => {
                this.time.delayedCall(index * 50, () => {
                    if (enemy && enemy.active) {
                        // Create explosion at enemy position
                        this.createExplosion(enemy.x, enemy.y, this.enemyColor);
                        
                        // Increment score
                        this.updateScore(5); // Less points for chain reaction kills
                        if (this.scoreText) {
                            this.scoreText.setText('SCORE: ' + this.score);
                        }
                        
                        // Destroy the enemy
                        enemy.destroy();
                    }
                });
            });
        }
    }
    
    resetWaveSystem() {
        this.currentWave = 0;
        this.enemiesPerWave = 8;
        this.waveInProgress = false;
        this.enemiesRemainingInWave = 0;
        
        // Reset difficulty scaling
        this.enemySpeedMultiplier = 1.0;
        this.enemyShootChanceMultiplier = 1.0;
        this.largeEnemyFrequency = 7;
        
        // Reset enemy counter
        this.enemyCounter = 0;
        
        // Update wave text
        if (this.waveText) {
            this.waveText.setText(`WAVE: ${this.currentWave}`);
        }
    }
    
    // Add screen shake effect
    shakeScreen(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
    }
    
    // Add a new method to create background warping effect
    warpBackground(x, y, intensity = 1) {
        if (!this.backgroundTiles || this.backgroundTiles.length === 0) return;
        
        // Calculate distance from explosion to each tile and apply warping effect
        this.backgroundTiles.forEach(tile => {
            // Calculate distance from explosion to this tile
            const distance = Phaser.Math.Distance.Between(x, y, tile.x, tile.y);
            
            // Maximum distance for effect (half the screen diagonal)
            const maxDistance = Math.sqrt(this.gameWidth * this.gameWidth + this.gameHeight * this.gameHeight) / 2;
            
            // Only affect tiles within range
            if (distance <= maxDistance) {
                // Calculate effect strength based on distance (closer = stronger)
                const distanceFactor = 1 - (distance / maxDistance);
                const effectStrength = distanceFactor * intensity;
                
                // Calculate delay based on distance for ripple effect
                const delay = distance * 0.5; // Tiles further away are affected later
                
                // Apply delayed warping with strength based on distance
                this.time.delayedCall(delay, () => {
                    // Apply random warping
            this.tweens.add({
                        targets: tile,
                        scaleX: tile.originalScale * (1 + effectStrength * Phaser.Math.FloatBetween(0.2, 0.5)),
                        scaleY: tile.originalScale * (1 + effectStrength * Phaser.Math.FloatBetween(0.2, 0.5)),
                        angle: tile.originalAngle + effectStrength * Phaser.Math.FloatBetween(-30, 30) * intensity,
                        alpha: tile.originalAlpha + effectStrength * Phaser.Math.FloatBetween(0.1, 0.3),
                        duration: 300 * intensity,
                yoyo: true,
                        ease: 'Sine.easeInOut',
                        onComplete: () => {
                            // Ensure tile returns to original state
                            tile.setScale(tile.originalScale);
                            tile.setAngle(tile.originalAngle);
                            tile.setAlpha(tile.originalAlpha);
                        }
            });
        });
            }
        });
    }
    
    createDramaticDeath(entity) {
        try {
            const x = entity.x;
            const y = entity.y;
            const color = entity.isLarge || entity === this.player ? 0xffffff : this.enemyColor;
            const scale = entity.isLarge ? 1.5 : (entity === this.player ? 1.2 : 1.0);
            const particleCount = entity.isLarge ? 20 : (entity === this.player ? 15 : 8);
            
            // Remove health bar if it exists
            if (entity.healthBar) {
                entity.healthBar.destroy();
                entity.healthBar = null;
            }
            
            // Remove health bar update event if it exists
            if (entity.healthBarUpdateEvent) {
                entity.healthBarUpdateEvent.remove();
                entity.healthBarUpdateEvent = null;
            }
            
            // Create a container for our explosion elements
            const explosionContainer = this.add.container(x, y);
            
            // Add a central explosion sprite
            const explosion = this.add.image(0, 0, 'explosion_texture');
            explosion.setTint(color);
            explosion.setScale(0.8 * scale);
            explosionContainer.add(explosion);
            
            // Create entity fragments (pieces of the entity breaking apart)
            const fragments = [];
            
            // Use the entity's texture for fragments
            const texture = entity.texture.key;
            
            for (let i = 0; i < particleCount; i++) {
                // Create a fragment using the entity's texture
                const fragment = this.add.image(0, 0, texture);
                fragment.setTint(color);
                
                // Set random scale for variety
                fragment.setScale(Phaser.Math.FloatBetween(0.1, 0.3) * scale);
                
                // Set initial positions close to center
                fragment.x = Phaser.Math.Between(-5, 5);
                fragment.y = Phaser.Math.Between(-5, 5);
                
                // Add to container and array
                explosionContainer.add(fragment);
                fragments.push(fragment);
                
                // Create individual tweens for each fragment flying outward
                const angle = Math.random() * Math.PI * 2;
                const distance = Phaser.Math.Between(30, 100) * scale;
                const speed = Phaser.Math.Between(300, 600);
                
                this.tweens.add({
                    targets: fragment,
                    x: fragment.x + Math.cos(angle) * distance,
                    y: fragment.y + Math.sin(angle) * distance,
                    scale: { from: fragment.scale, to: 0 },
                    angle: Phaser.Math.Between(-360, 360),
                    alpha: { from: 0.8, to: 0 },
                    duration: speed,
                    ease: 'Power2'
                });
            }
            
            // Add smaller explosion sprites around the main one
            const particleCount2 = entity.isLarge ? 12 : (entity === this.player ? 8 : 6);
            const particles = [];
            
            for (let i = 0; i < particleCount2; i++) {
                // Use the explosion texture for particles
                const particle = this.add.image(0, 0, 'explosion_texture');
                particle.setTint(color);
                
                // Set random scale for variety
                particle.setScale(Phaser.Math.FloatBetween(0.2, 0.4) * scale);
                
                // Set initial positions randomly around center
                particle.x = Phaser.Math.Between(-15, 15);
                particle.y = Phaser.Math.Between(-15, 15);
                
                // Add to container and array
                explosionContainer.add(particle);
                particles.push(particle);
                
                // Create individual tweens for each particle
        this.tweens.add({
                    targets: particle,
                    x: particle.x + Phaser.Math.Between(-70, 70) * scale,
                    y: particle.y + Phaser.Math.Between(-70, 70) * scale,
                    scale: { from: particle.scale, to: 0 },
                    alpha: { from: 0.8, to: 0 },
                    duration: Phaser.Math.Between(200, 350) * scale,
                    ease: 'Power2'
                });
            }
            
            // Animate the main explosion
            this.tweens.add({
                targets: explosion,
                scale: { from: 0.8 * scale, to: 1.5 * scale },
                alpha: { from: 1, to: 0 },
                duration: 300 * scale,
                ease: 'Power2'
            });
            
            // Destroy the container after animation completes
            this.time.delayedCall(350 * scale, () => {
                explosionContainer.destroy();
            });
            
        } catch (e) {
            console.error('Error in createDramaticDeath:', e);
        }
    }
    
    playExcitingExplosion() {
        if (!this.audioContext) return;
        
        try {
            // Create multiple oscillators for a richer sound
            const oscillators = [];
            const gainNodes = [];
            
            // Base explosion sound (noise)
            const bufferSize = 4096;
            const noiseBuffer = this.audioContext.createBuffer(
                1, bufferSize, this.audioContext.sampleRate
            );
            const output = noiseBuffer.getChannelData(0);
            
            // Fill buffer with noise
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            
            // Create noise source
            const noise = this.audioContext.createBufferSource();
            noise.buffer = noiseBuffer;
            
            // Create bandpass filter for explosion effect
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 150;
            filter.Q.value = 0.5;
            
            // Create gain node for volume control
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = 0.25;
            
            // Connect nodes
            noise.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            // Start noise
            noise.start();
            
            // Quick fade out
            gainNode.gain.exponentialRampToValueAtTime(
                0.01,
                this.audioContext.currentTime + 0.6
            );
            
            // Add a low frequency rumble
            const rumble = this.audioContext.createOscillator();
            const rumbleGain = this.audioContext.createGain();
            
            rumble.type = 'sine';
            rumble.frequency.value = 40;
            rumbleGain.gain.value = 0.2;
            
            rumble.connect(rumbleGain);
            rumbleGain.connect(this.masterGain);
            
            rumble.start();
            
            // Frequency sweep for rumble
            rumble.frequency.exponentialRampToValueAtTime(
                20,
                this.audioContext.currentTime + 0.8
            );
            
            // Fade out rumble
            rumbleGain.gain.exponentialRampToValueAtTime(
                0.01,
                this.audioContext.currentTime + 0.8
            );
            
            // Add a high-pitched component
            const highPitch = this.audioContext.createOscillator();
            const highPitchGain = this.audioContext.createGain();
            
            highPitch.type = 'sawtooth';
            highPitch.frequency.value = 880;
            highPitchGain.gain.value = 0.1;
            
            highPitch.connect(highPitchGain);
            highPitchGain.connect(this.masterGain);
            
            highPitch.start();
            
            // Frequency sweep for high pitch
            highPitch.frequency.exponentialRampToValueAtTime(
                220,
                this.audioContext.currentTime + 0.3
            );
            
            // Fade out high pitch
            highPitchGain.gain.exponentialRampToValueAtTime(
                0.01,
                this.audioContext.currentTime + 0.3
            );
            
            // Stop all sounds after they've faded out
            setTimeout(() => {
                noise.stop();
                rumble.stop();
                highPitch.stop();
                
                noise.disconnect();
                filter.disconnect();
                gainNode.disconnect();
                rumble.disconnect();
                rumbleGain.disconnect();
                highPitch.disconnect();
                highPitchGain.disconnect();
            }, 800);
            
        } catch (e) {
            console.error('Error in playExcitingExplosion:', e);
        }
    }
    
    // Add this method to get the top score from cookie
    getTopScoreFromCookie() {
        const cookieName = "buckShooterTopScore=";
        const decodedCookie = decodeURIComponent(document.cookie);
        const cookieArray = decodedCookie.split(';');
        
        for (let i = 0; i < cookieArray.length; i++) {
            let cookie = cookieArray[i].trim();
            if (cookie.indexOf(cookieName) === 0) {
                return parseInt(cookie.substring(cookieName.length, cookie.length)) || 0;
            }
        }
        return 0;
    }
    
    // Add this method to save the top score to cookie
    saveTopScoreToCookie(score) {
        // Set cookie to expire in 1 year
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        
        document.cookie = `buckShooterTopScore=${score};expires=${expiryDate.toUTCString()};path=/`;
    }
    
    // Update the updateScore method to check for new top score
    updateScore(points) {
        this.score += points;
        this.scoreText.setText(`SCORE: ${this.score}`);
        
        // Check if current score is higher than top score
        if (this.score > this.topScore) {
            this.topScore = this.score;
            this.topScoreText.setText(`TOP: ${this.topScore}`);
            this.saveTopScoreToCookie(this.topScore);
            
            // Flash the top score text to indicate a new record
            this.tweens.add({
                targets: this.topScoreText,
                alpha: 0.2,
                duration: 200,
                yoyo: true,
                repeat: 3
            });
        }
    }
    
    // Encode the current game configuration to a URL-friendly hash
    saveConfigToUrl() {
        try {
            // Create a configuration object with all visual settings
            const config = {
                // Icon selections
                pi: this.availableLightIcons.indexOf(this.playerIcon),
                bi: this.availableLightIcons.indexOf(this.bulletIcon),
                ei: this.availableLightIcons.indexOf(this.enemyIcon),
                bgi: this.availableLightIcons.indexOf(this.backgroundIcon),
                
                // Color selections (convert to hex strings without #)
                bg: this.backgroundColor.toString(16).padStart(6, '0'),
                pc: this.playerColor.toString(16).padStart(6, '0'),
                ec: this.enemyColor.toString(16).padStart(6, '0'),
                bc: this.bulletColor.toString(16).padStart(6, '0'),
                
                // Vector field selection
                vf: this.vectorFieldIndex
            };
            
            // Convert to JSON and encode to base64
            const jsonConfig = JSON.stringify(config);
            const base64Config = btoa(jsonConfig);
            
            // Update URL with the configuration parameter
            const url = new URL(window.location.href);
            url.searchParams.set('config', base64Config);
            window.history.replaceState({}, '', url);
            
            console.log('Game configuration saved to URL');
            
            return true;
        } catch (error) {
            console.error('Error saving configuration to URL:', error);
            return false;
        }
    }
    
    // Load game configuration from URL parameters
    loadConfigFromUrl() {
        try {
            // Get the URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            const configParam = urlParams.get('config');
            
            // If no config parameter, return false
            if (!configParam) {
                return false;
            }
            
            // Decode the base64 config
            const jsonConfig = atob(configParam);
            const config = JSON.parse(jsonConfig);
            
            // Set up color palette first (needed for other settings)
            this.setupColorPalette();
            
            // Find available light icons
            this.findAvailableLightIcons();
            
            // Apply the configuration
            
            // Set colors (convert hex strings to integers)
            this.backgroundColor = parseInt(config.bg, 16);
            this.playerColor = parseInt(config.pc, 16);
            this.enemyColor = parseInt(config.ec, 16);
            this.bulletColor = parseInt(config.bc, 16);
            
            // Set the background color
            this.cameras.main.setBackgroundColor(this.backgroundColor);
            
            // Set icons (ensure valid indices)
            if (config.pi >= 0 && config.pi < this.availableLightIcons.length) {
                this.playerIcon = this.availableLightIcons[config.pi];
            } else {
                this.playerIcon = this.availableLightIcons[0];
            }
            
            if (config.bi >= 0 && config.bi < this.availableLightIcons.length) {
                this.bulletIcon = this.availableLightIcons[config.bi];
            } else {
                this.bulletIcon = this.availableLightIcons[1 % this.availableLightIcons.length];
            }
            
            if (config.ei >= 0 && config.ei < this.availableLightIcons.length) {
                this.enemyIcon = this.availableLightIcons[config.ei];
            } else {
                this.enemyIcon = this.availableLightIcons[2 % this.availableLightIcons.length];
            }
            
            if (config.bgi >= 0 && config.bgi < this.availableLightIcons.length) {
                this.backgroundIcon = this.availableLightIcons[config.bgi];
            } else {
                this.backgroundIcon = this.availableLightIcons[3 % this.availableLightIcons.length];
            }
            
            // Set vector field (ensure valid index)
            if (config.vf >= 1 && config.vf <= this.totalVectorFields) {
                this.vectorFieldIndex = config.vf;
            } else {
                this.vectorFieldIndex = 1;
            }
            
            // Use the programmatically generated vector field
            this.vectorField = `vector_field${this.vectorFieldIndex}`;
            
            console.log('Game configuration loaded from URL');
            console.log(`Colors - BG: ${this.backgroundColor.toString(16)}, Player: ${this.playerColor.toString(16)}, Enemy: ${this.enemyColor.toString(16)}, Bullet: ${this.bulletColor.toString(16)}`);
            console.log(`Using icons - Player: ${this.playerIcon}, Bullet: ${this.bulletIcon}, Enemy: ${this.enemyIcon}, Background: ${this.backgroundIcon}`);
            console.log(`Using vector field ${this.vectorFieldIndex}`);
            
            return true;
        } catch (error) {
            console.error('Error loading configuration from URL:', error);
            return false;
        }
    }
    
    // Create game UI buttons
    createGameButtons() {
        // Create a container for buttons
        this.buttonContainer = this.add.container(0, 0);
        this.buttonContainer.setDepth(1000);
        
        // Create share button - smaller size
        const shareButton = this.add.circle(this.gameWidth - 20, this.gameHeight - 20, 15, 0x333333, 0.8);
        const shareIcon = this.add.text(shareButton.x, shareButton.y, '🔗', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '12px', // Reduced from 14px
            fontStyle: 'bold'
        });
        shareIcon.setOrigin(0.5);
        // Adjust Y position slightly to center the icon better
        shareIcon.y += 1;
        
        // Make share button interactive
        shareButton.setInteractive({ useHandCursor: true });
        
        // Add hover effect
        shareButton.on('pointerover', () => {
            shareButton.setFillStyle(0x555555);
        });
        
        shareButton.on('pointerout', () => {
            shareButton.setFillStyle(0x333333);
        });
        
        // Add click handler to copy URL
        shareButton.on('pointerdown', () => {
            // Copy the URL to clipboard
            navigator.clipboard.writeText(window.location.href)
                .then(() => {
                    // Show a confirmation message
                    const confirmText = this.add.text(
                        this.gameWidth / 2,
                        this.gameHeight / 2,
                        'URL Copied!',
                        {
                            fontFamily: 'Arial, sans-serif',
                            fontSize: '24px',
                            fontStyle: 'bold',
                            fill: '#ffffff',
                            backgroundColor: '#333333',
                            padding: { x: 16, y: 8 }
                        }
                    );
                    
                    confirmText.setOrigin(0.5);
                    confirmText.setDepth(1001);
                    
                    // Fade out after a short delay
                    this.tweens.add({
                        targets: confirmText,
            alpha: 0,
                        y: confirmText.y - 50,
                        duration: 1500,
                        ease: 'Power2',
            onComplete: () => {
                            confirmText.destroy();
                        }
                    });
                })
                .catch(err => {
                    console.error('Could not copy URL: ', err);
                });
        });
        
        // Create refresh visuals button - smaller size
        const refreshButton = this.add.circle(this.gameWidth - 55, this.gameHeight - 20, 15, 0x333333, 0.8);
        const refreshIcon = this.add.text(refreshButton.x, refreshButton.y, '🎨', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '12px', // Reduced from 14px
            fontStyle: 'bold'
        });
        refreshIcon.setOrigin(0.5);
        // Adjust Y position slightly to center the icon better
        refreshIcon.y += 1;
        
        // Make refresh button interactive
        refreshButton.setInteractive({ useHandCursor: true });
        
        // Add hover effect
        refreshButton.on('pointerover', () => {
            refreshButton.setFillStyle(0x555555);
        });
        
        refreshButton.on('pointerout', () => {
            refreshButton.setFillStyle(0x333333);
        });
        
        // Add click handler to refresh visuals
        refreshButton.on('pointerdown', () => {
            this.refreshVisuals();
        });
        
        // Add buttons to container
        this.buttonContainer.add([shareButton, shareIcon, refreshButton, refreshIcon]);
    }
    
    // Refresh visual elements without restarting the game
    refreshVisuals() {
        // Store current game state
        const currentScore = this.score;
        const currentWave = this.currentWave;
        const gameIsOver = this.gameOver;
        const onTitleScreen = this.onTitleScreen;
        
        // Randomize new visual elements
        this.setupColorPalette();
        this.randomizeGameIcons();
        this.selectRandomVectorField();
        
        // Update URL with new configuration
        this.saveConfigToUrl();
        
        // Update background
        this.refreshBackground();
        
        // Update player appearance
        if (this.player && this.player.active) {
            this.player.setTexture(this.playerIcon);
            this.player.setTint(this.playerColor);
        }
        
        // Update existing bullets
        this.bullets.getChildren().forEach(bullet => {
            bullet.setTexture(this.bulletIcon);
            bullet.setTint(this.bulletColor);
        });
        
        // Update existing enemy bullets
        this.enemyBullets.getChildren().forEach(bullet => {
            bullet.setTexture(this.bulletIcon);
        });
        
        // Update existing enemies
        this.enemies.getChildren().forEach(enemy => {
            enemy.setTexture(this.enemyIcon);
            if (!enemy.isLarge) {
                enemy.setTint(this.enemyColor);
            }
        });
        
        // Show a confirmation message
        const confirmText = this.add.text(
            this.gameWidth / 2,
            this.gameHeight / 2,
            'New Look Applied!',
            {
                fontFamily: 'Arial, sans-serif',
                fontSize: '24px',
                fontStyle: 'bold',
                fill: '#ffffff',
                backgroundColor: '#333333',
                padding: { x: 16, y: 8 }
            }
        );
        
        confirmText.setOrigin(0.5);
        confirmText.setDepth(1001);
        
        // Fade out after a short delay
            this.tweens.add({
            targets: confirmText,
                alpha: 0,
            y: confirmText.y - 50,
            duration: 1500,
            ease: 'Power2',
                onComplete: () => {
                confirmText.destroy();
            }
        });
    }
    
    // Refresh the background with new colors and sprites
    refreshBackground() {
        // Clear existing background tiles
        if (this.backgroundTiles) {
            this.backgroundTiles.forEach(tile => {
                tile.destroy();
            });
        }
        
        // Reset background tiles array
        this.backgroundTiles = [];
        
        // Create new background
        this.createBackground();
    }
    
    // Create a pixelated border effect directly in the Phaser canvas
    createPixelatedBorder() {
        // Create two graphics objects for the border - one for current state, one for next state
        this.pixelBorderCurrent = this.add.graphics();
        this.pixelBorderNext = this.add.graphics();
        
        // Set depth to ensure they're on top
        this.pixelBorderCurrent.setDepth(1000);
        this.pixelBorderNext.setDepth(1000);
        
        // Make the next border initially invisible
        this.pixelBorderNext.alpha = 0;
        
        // Set up pixel size based on game dimensions
        const pixelSize = Math.max(4, Math.floor(this.gameWidth / 100));
        
        // Function to generate a new border pattern
        const generateBorderPattern = (graphics) => {
            graphics.clear();
            
            // Use the background color for the pixels
            graphics.fillStyle(0x000000, 1);
            
            // Top and bottom edges
            for (let x = 0; x < this.gameWidth; x += pixelSize) {
                // Random pattern - some pixels are drawn, some aren't
                if (Math.random() < 0.7) {
                    // Top edge
                    const topHeight = Math.floor(Math.random() * 2) + 1;
                    graphics.fillRect(x, 0, pixelSize, pixelSize * topHeight);
                }
                
                if (Math.random() < 0.7) {
                    // Bottom edge
                    const bottomHeight = Math.floor(Math.random() * 2) + 1;
                    graphics.fillRect(x, this.gameHeight - pixelSize * bottomHeight, pixelSize, pixelSize * bottomHeight);
                }
            }
            
            // Left and right edges
            for (let y = 0; y < this.gameHeight; y += pixelSize) {
                // Random pattern
                if (Math.random() < 0.7) {
                    // Left edge
                    const leftWidth = Math.floor(Math.random() * 2) + 1;
                    graphics.fillRect(0, y, pixelSize * leftWidth, pixelSize);
                }
                
                if (Math.random() < 0.7) {
                    // Right edge
                    const rightWidth = Math.floor(Math.random() * 2) + 1;
                    graphics.fillRect(this.gameWidth - pixelSize * rightWidth, y, pixelSize * rightWidth, pixelSize);
                }
            }
        };
        
        // Draw initial border
        generateBorderPattern(this.pixelBorderCurrent);
        
        // Function to update the border with a fade transition
        const updateBorderWithFade = () => {
            // Generate new pattern in the next graphics object
            generateBorderPattern(this.pixelBorderNext);
            
            // Reset alpha values
            this.pixelBorderNext.alpha = 0;
            this.pixelBorderCurrent.alpha = 1;
            
            // Create fade tween
            this.tweens.add({
                targets: [this.pixelBorderCurrent, this.pixelBorderNext],
                alpha: { from: [1, 0], to: [0, 1] },
                duration: 500, // 0.5s fade
                ease: 'Sine.easeInOut',
                onComplete: () => {
                    // Swap the graphics objects
                    const temp = this.pixelBorderCurrent;
                    this.pixelBorderCurrent = this.pixelBorderNext;
                    this.pixelBorderNext = temp;
                }
            });
        };
        
        // Animate the border by updating it periodically with fade transitions
        this.borderAnimEvent = this.time.addEvent({
            delay: 3000, // Update every 3 seconds
            callback: updateBorderWithFade,
            callbackScope: this,
            loop: true
        });
    }
} 