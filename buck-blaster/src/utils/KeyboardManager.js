class KeyboardManager {
    constructor(scene) {
        this.scene = scene;
        this.keyW = null;
        this.keyA = null;
        this.keyS = null;
        this.keyD = null;
        this.keyESC = null;
        this.keyP = null;
        this.keyR = null;
        this.keySpace = null;
        this.moveDirection = { x: 0, y: 0 };
    }
    
    initialize() {
        // Initialize keyboard
        this.initKeyboard();
    }
    
    initKeyboard() {
        // Create key controls for player movement and game control
        this.keyW = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyA = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyS = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyD = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        
        // Add extra control keys
        this.keyESC = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.keyP = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        this.keyR = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.keySpace = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // Set up key event handlers
        this.keyESC.on('down', () => {
            if (this.scene.gameStateManager) {
                this.scene.gameStateManager.togglePause();
            }
        });
        
        this.keyP.on('down', () => {
            if (this.scene.gameStateManager) {
                this.scene.gameStateManager.togglePause();
            }
        });
        
        this.keyR.on('down', () => {
            // Reset game if on game over screen or paused
            if (this.scene.gameStateManager && 
                (this.scene.gameStateManager.gameOver || 
                 this.scene.gameStateManager.paused)) {
                this.scene.resetGame();
            }
        });
        
        this.keySpace.on('down', () => {
            // Start game from title screen
            if (this.scene.onTitleScreen) {
                this.scene.startGameFromTitle();
            }
        });
    }
    
    update() {
        // Reset movement direction
        this.moveDirection.x = 0;
        this.moveDirection.y = 0;
        
        // Handle WASD movement
        if (this.keyW.isDown) {
            this.moveDirection.y = -1;
        }
        if (this.keyA.isDown) {
            this.moveDirection.x = -1;
        }
        if (this.keyS.isDown) {
            this.moveDirection.y = 1;
        }
        if (this.keyD.isDown) {
            this.moveDirection.x = 1;
        }
        
        // Normalize for diagonal movement to prevent faster diagonal speed
        if (this.moveDirection.x !== 0 && this.moveDirection.y !== 0) {
            const length = Math.sqrt(
                this.moveDirection.x * this.moveDirection.x + 
                this.moveDirection.y * this.moveDirection.y
            );
            this.moveDirection.x /= length;
            this.moveDirection.y /= length;
        }
    }
    
    getMoveDirection() {
        return this.moveDirection;
    }
    
    shutdown() {
        // Remove key event listeners to prevent memory leaks
        if (this.keyESC) this.keyESC.removeAllListeners();
        if (this.keyP) this.keyP.removeAllListeners();
        if (this.keyR) this.keyR.removeAllListeners();
        if (this.keySpace) this.keySpace.removeAllListeners();
        
        // Remove all keys
        this.scene.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.scene.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.scene.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.scene.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.scene.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.scene.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.P);
        this.scene.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.scene.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // Clear references
        this.keyW = null;
        this.keyA = null;
        this.keyS = null;
        this.keyD = null;
        this.keyESC = null;
        this.keyP = null;
        this.keyR = null;
        this.keySpace = null;
    }
}

export default KeyboardManager; 