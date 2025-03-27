class GameStateManager {
    constructor(scene) {
        this.scene = scene;
        this.paused = false;
        this.gameOver = false;
        this.gameOverOverlay = null;
        this.gameOverContainer = null;
        this.gameButtons = [];
        this.lastGameState = 'title'; // 'title', 'playing', 'paused', 'gameOver'
        this.pauseMenuVisible = false;
        this.pauseButton = null;
        this.pauseMenu = null;
        
        // Bind methods for use as callbacks
        this.togglePause = this.togglePause.bind(this);
    }
    
    initialize() {
        // Set initial game state
        this.paused = false;
        this.gameOver = false;
        this.lastGameState = 'playing';
        
        // Create pause button
        this.createPauseButton();
    }
    
    createPauseButton() {
        // Create a pause button at the top center
        this.pauseButton = this.scene.add.circle(this.scene.gameWidth / 2, 30, 15, 0xffffff, 0.3);
        this.pauseButton.setStrokeStyle(2, 0xffffff);
        this.pauseButton.setDepth(99);
        this.pauseButton.setInteractive({ useHandCursor: true });
        
        // Add a pause icon (two vertical lines)
        const pauseIcon = this.scene.add.text(
            this.scene.gameWidth / 2, 
            30, 
            '⏸️', 
            {
                fontSize: '16px',
                color: '#ffffff'
            }
        );
        pauseIcon.setOrigin(0.5);
        pauseIcon.setDepth(99);
        
        // Add click handler
        this.pauseButton.on('pointerdown', this.togglePause);
    }
    
    togglePause() {
        this.paused = !this.paused;
        
        if (this.paused) {
            this.lastGameState = 'paused';
            
            // Create pause menu if not existing
            if (!this.pauseMenu) {
                this.createPauseMenu();
            }
            
            // Show pause menu
            this.pauseMenuVisible = true;
            this.pauseMenu.setVisible(true);
            
            // Pause game physics
            this.scene.physics.pause();
            
            // Pause all game timers
            this.scene.time.pauseAll();
        } else {
            this.lastGameState = 'playing';
            
            // Hide pause menu
            this.pauseMenuVisible = false;
            if (this.pauseMenu) {
                this.pauseMenu.setVisible(false);
            }
            
            // Resume game physics
            this.scene.physics.resume();
            
            // Resume all game timers
            this.scene.time.resumeAll();
        }
    }
    
    createPauseMenu() {
        // Create pause menu container
        this.pauseMenu = this.scene.add.container(
            this.scene.gameWidth / 2,
            this.scene.gameHeight / 2
        );
        this.pauseMenu.setDepth(100);
        
        // Add semi-transparent background
        const overlay = this.scene.add.rectangle(
            0,
            0,
            this.scene.gameWidth,
            this.scene.gameHeight,
            0x000000,
            0.7
        );
        
        // Add "PAUSED" text
        const pausedText = this.scene.add.text(
            0,
            -80,
            'PAUSED',
            {
                fontFamily: 'Arial, sans-serif',
                fontSize: '48px',
                fontStyle: 'bold',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 6,
                align: 'center'
            }
        );
        pausedText.setOrigin(0.5);
        
        // Add "Resume" button
        const resumeButton = this.createMenuButton(0, 0, 'RESUME', this.togglePause);
        
        // Add "Restart" button
        const restartButton = this.createMenuButton(0, 80, 'RESTART', () => {
            // Hide pause menu
            this.pauseMenuVisible = false;
            this.pauseMenu.setVisible(false);
            
            // Reset game
            this.scene.resetGame();
        });
        
        // Add to container
        this.pauseMenu.add(overlay);
        this.pauseMenu.add(pausedText);
        this.pauseMenu.add(resumeButton);
        this.pauseMenu.add(restartButton);
        
        // Initially hide menu
        this.pauseMenu.setVisible(false);
    }
    
    createMenuButton(x, y, text, callback) {
        // Create a container for the button
        const buttonContainer = this.scene.add.container(x, y);
        
        // Add button background
        const buttonBg = this.scene.add.rectangle(
            0,
            0,
            200,
            50,
            0x333333,
            0.8
        );
        buttonBg.setStrokeStyle(2, 0xffffff);
        
        // Add button text
        const buttonText = this.scene.add.text(
            0,
            0,
            text,
            {
                fontFamily: 'Arial, sans-serif',
                fontSize: '24px',
                fontStyle: 'bold',
                color: '#ffffff',
                align: 'center'
            }
        );
        buttonText.setOrigin(0.5);
        
        // Add to container
        buttonContainer.add(buttonBg);
        buttonContainer.add(buttonText);
        
        // Make interactive
        buttonBg.setInteractive({ useHandCursor: true });
        buttonBg.on('pointerdown', callback);
        
        // Add hover effect
        buttonBg.on('pointerover', () => {
            buttonBg.setFillStyle(0x555555, 0.8);
        });
        buttonBg.on('pointerout', () => {
            buttonBg.setFillStyle(0x333333, 0.8);
        });
        
        return buttonContainer;
    }
    
    createGameButtons() {
        // Clear any existing buttons
        this.gameButtons.forEach(button => button.destroy());
        this.gameButtons = [];
        
        const margin = 20;
        const buttonSize = 40;
        
        // Create refresh button
        const refreshButton = this.scene.add.circle(
            this.scene.gameWidth - margin - buttonSize / 2,
            this.scene.gameHeight - margin - buttonSize / 2,
            buttonSize / 2,
            0xffffff,
            0.3
        );
        refreshButton.setStrokeStyle(2, 0xffffff);
        refreshButton.setDepth(101);
        refreshButton.setInteractive({ useHandCursor: true });
        
        // Add refresh icon
        const refreshIcon = this.scene.add.text(
            this.scene.gameWidth - margin - buttonSize / 2,
            this.scene.gameHeight - margin - buttonSize / 2,
            '↻',
            {
                fontSize: '12px',
                fontStyle: 'bold',
                color: '#ffffff'
            }
        );
        refreshIcon.setOrigin(0.5);
        refreshIcon.setDepth(101);
        refreshIcon.y -= 2; // Adjust for better centering
        
        // Add click handler for refresh
        refreshButton.on('pointerdown', () => {
            this.scene.resetGame();
        });
        
        // Create share button
        const shareButton = this.scene.add.circle(
            this.scene.gameWidth - margin - buttonSize / 2,
            this.scene.gameHeight - margin * 2 - buttonSize * 1.5,
            buttonSize / 2,
            0xffffff,
            0.3
        );
        shareButton.setStrokeStyle(2, 0xffffff);
        shareButton.setDepth(101);
        shareButton.setInteractive({ useHandCursor: true });
        
        // Add share icon
        const shareIcon = this.scene.add.text(
            this.scene.gameWidth - margin - buttonSize / 2,
            this.scene.gameHeight - margin * 2 - buttonSize * 1.5,
            '↗',
            {
                fontSize: '12px',
                fontStyle: 'bold',
                color: '#ffffff'
            }
        );
        shareIcon.setOrigin(0.5);
        shareIcon.setDepth(101);
        shareIcon.y -= 2; // Adjust for better centering
        
        // Add click handler for share
        shareButton.on('pointerdown', () => {
            this.shareScore();
        });
        
        // Store buttons for cleanup
        this.gameButtons.push(refreshButton, refreshIcon, shareButton, shareIcon);
    }
    
    setupGameOver(scoreManager) {
        // Set game over flag
        this.gameOver = true;
        this.lastGameState = 'gameOver';
        
        // Pause game physics and timers
        this.scene.physics.pause();
        this.scene.time.pauseAll();
        
        // Create semi-transparent overlay
        this.gameOverOverlay = this.scene.add.rectangle(
            this.scene.gameWidth / 2,
            this.scene.gameHeight / 2,
            this.scene.gameWidth,
            this.scene.gameHeight,
            0x000000,
            0.7
        );
        this.gameOverOverlay.setDepth(100);
        
        // Create game over container
        this.gameOverContainer = this.scene.add.container(
            this.scene.gameWidth / 2,
            this.scene.gameHeight / 2 - 80
        );
        this.gameOverContainer.setDepth(101);
        
        // Create game over text
        const gameOverText = this.scene.add.text(
            0,
            -100,
            'GAME OVER',
            {
                fontFamily: 'Arial, sans-serif',
                fontSize: '48px',
                fontStyle: 'bold',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 6,
                align: 'center'
            }
        );
        gameOverText.setOrigin(0.5);
        
        // Create score stats
        const scoreStats = scoreManager.createGameOverStats(0, 0);
        
        // Create play again button
        const playAgainButton = this.createMenuButton(0, 160, 'PLAY AGAIN', () => {
            this.scene.resetGame();
        });
        
        // Add elements to container
        this.gameOverContainer.add(gameOverText);
        this.gameOverContainer.add(scoreStats);
        this.gameOverContainer.add(playAgainButton);
        
        // Create game buttons (share & restart)
        this.createGameButtons();
    }
    
    shareScore() {
        try {
            // Get score and wave info
            const score = this.scene.scoreManager.finalScore;
            const wave = this.scene.scoreManager.finalWave;
            
            // Create share text
            const shareText = `I scored ${score} points and reached wave ${wave} in Buck Shooter! Can you beat that? Play at [GAME_URL]`;
            
            // Check if Web Share API is available
            if (navigator.share) {
                navigator.share({
                    title: 'Buck Shooter - My Score',
                    text: shareText
                })
                .catch(error => {
                    console.warn('Error sharing:', error);
                    this.copyToClipboard(shareText);
                });
            } else {
                // Fallback to clipboard
                this.copyToClipboard(shareText);
            }
        } catch (e) {
            console.warn('Share failed:', e);
        }
    }
    
    copyToClipboard(text) {
        try {
            // Create temporary textarea element
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            
            // Copy text
            document.execCommand('copy');
            
            // Remove textarea
            document.body.removeChild(textArea);
            
            // Show feedback to user
            this.scene.handleTextCopied();
        } catch (e) {
            console.warn('Could not copy to clipboard:', e);
        }
    }
    
    shutdown() {
        // Clean up game buttons
        this.gameButtons.forEach(button => {
            if (button) button.destroy();
        });
        this.gameButtons = [];
        
        // Clean up pause menu
        if (this.pauseMenu) this.pauseMenu.destroy();
        this.pauseMenu = null;
        
        // Clean up pause button
        if (this.pauseButton) this.pauseButton.destroy();
        this.pauseButton = null;
        
        // Clean up game over elements
        if (this.gameOverOverlay) this.gameOverOverlay.destroy();
        if (this.gameOverContainer) this.gameOverContainer.destroy();
        this.gameOverOverlay = null;
        this.gameOverContainer = null;
        
        // Reset state
        this.paused = false;
        this.gameOver = false;
        this.pauseMenuVisible = false;
    }
    
    isGameActive() {
        return !this.paused && !this.gameOver && this.lastGameState === 'playing';
    }
}

export default GameStateManager; 