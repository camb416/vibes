class ScoreManager {
    constructor(scene) {
        this.scene = scene;
        this.score = 0;
        this.highScore = this.loadHighScore();
        this.scoreText = null;
        this.highScoreText = null;
        this.waveText = null;
        this.enemiesText = null;
        this.enemyBonusPoints = 10;
        this.largeEnemyBonusPoints = 50;
        this.finalScore = 0;
        this.finalWave = 0;
    }
    
    initialize() {
        // Reset score to 0
        this.score = 0;
        
        // Update the stored high score
        this.highScore = this.loadHighScore();
        
        // Create score text
        this.createScoreDisplay();
    }
    
    createScoreDisplay() {
        // Create score text
        this.scoreText = this.scene.add.text(
            20, 
            20, 
            `SCORE: ${this.score}`, 
            {
                fontFamily: 'Arial, sans-serif',
                fontSize: '20px',
                fontStyle: 'bold',
                color: '#ffffff'
            }
        );
        this.scoreText.setDepth(100);
        
        // Create high score text
        this.highScoreText = this.scene.add.text(
            20, 
            50, 
            `HIGH: ${this.highScore}`, 
            {
                fontFamily: 'Arial, sans-serif',
                fontSize: '16px',
                fontStyle: 'bold',
                color: '#aaaaaa'
            }
        );
        this.highScoreText.setDepth(100);
        
        // Create wave text
        this.waveText = this.scene.add.text(
            this.scene.gameWidth - 20, 
            20, 
            `WAVE: ${this.scene.currentWave}`, 
            {
                fontFamily: 'Arial, sans-serif',
                fontSize: '20px',
                fontStyle: 'bold',
                color: '#ffffff',
                align: 'right'
            }
        );
        this.waveText.setOrigin(1, 0);
        this.waveText.setDepth(100);
        
        // Create enemies remaining text
        this.enemiesText = this.scene.add.text(
            this.scene.gameWidth - 20, 
            50, 
            `ENEMIES: ${this.scene.enemiesRemainingInWave}`, 
            {
                fontFamily: 'Arial, sans-serif',
                fontSize: '16px',
                fontStyle: 'bold',
                color: '#aaaaaa',
                align: 'right'
            }
        );
        this.enemiesText.setOrigin(1, 0);
        this.enemiesText.setDepth(100);
    }
    
    addScore(points) {
        this.score += points;
        this.updateScoreDisplay();
        
        // Check for high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
            this.updateHighScoreDisplay();
        }
    }
    
    enemyKilled(isLarge = false) {
        // Add points based on enemy type
        const points = isLarge ? this.largeEnemyBonusPoints : this.enemyBonusPoints;
        this.addScore(points);
        
        // Update enemies remaining display
        this.updateEnemiesDisplay();
    }
    
    updateWaveDisplay() {
        if (this.waveText) {
            this.waveText.setText(`WAVE: ${this.scene.currentWave}`);
        }
        
        this.updateEnemiesDisplay();
    }
    
    updateEnemiesDisplay() {
        if (this.enemiesText) {
            this.enemiesText.setText(`ENEMIES: ${this.scene.enemiesRemainingInWave}`);
        }
    }
    
    updateScoreDisplay() {
        if (this.scoreText) {
            this.scoreText.setText(`SCORE: ${this.score}`);
        }
    }
    
    updateHighScoreDisplay() {
        if (this.highScoreText) {
            this.highScoreText.setText(`HIGH: ${this.highScore}`);
        }
    }
    
    saveHighScore() {
        try {
            localStorage.setItem('buckShooterHighScore', this.highScore.toString());
        } catch (e) {
            console.warn('Could not save high score to localStorage', e);
        }
    }
    
    loadHighScore() {
        try {
            const storedScore = localStorage.getItem('buckShooterHighScore');
            return storedScore ? parseInt(storedScore, 10) : 0;
        } catch (e) {
            console.warn('Could not load high score from localStorage', e);
            return 0;
        }
    }
    
    recordFinalStats() {
        // Store the final score and wave
        this.finalScore = this.score;
        this.finalWave = this.scene.currentWave;
        
        // Make sure high score is saved
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }
    }
    
    createGameOverStats(x, y) {
        // Create a container for game over stats
        const container = this.scene.add.container(x, y);
        container.setDepth(101);
        
        // Create final score text
        const finalScoreText = this.scene.add.text(
            0, 
            0, 
            `FINAL SCORE: ${this.finalScore}`, 
            {
                fontFamily: 'Arial, sans-serif',
                fontSize: '28px',
                fontStyle: 'bold',
                color: '#ffffff',
                align: 'center'
            }
        );
        finalScoreText.setOrigin(0.5);
        
        // Create final wave text
        const finalWaveText = this.scene.add.text(
            0, 
            40, 
            `WAVE REACHED: ${this.finalWave}`, 
            {
                fontFamily: 'Arial, sans-serif',
                fontSize: '22px',
                fontStyle: 'bold',
                color: '#ffffff',
                align: 'center'
            }
        );
        finalWaveText.setOrigin(0.5);
        
        // Create high score text
        const highScoreText = this.scene.add.text(
            0, 
            80, 
            `HIGH SCORE: ${this.highScore}`, 
            {
                fontFamily: 'Arial, sans-serif',
                fontSize: '20px',
                fontStyle: 'bold',
                color: '#ffff00',
                align: 'center'
            }
        );
        highScoreText.setOrigin(0.5);
        
        // Add all elements to container
        container.add(finalScoreText);
        container.add(finalWaveText);
        container.add(highScoreText);
        
        // If new high score, add a special callout
        if (this.finalScore >= this.highScore && this.finalScore > 0) {
            const newHighScoreText = this.scene.add.text(
                0, 
                120, 
                'NEW HIGH SCORE!', 
                {
                    fontFamily: 'Arial, sans-serif',
                    fontSize: '24px',
                    fontStyle: 'bold',
                    color: '#ffff00',
                    align: 'center'
                }
            );
            newHighScoreText.setOrigin(0.5);
            
            // Add flashing animation
            this.scene.tweens.add({
                targets: newHighScoreText,
                alpha: 0.3,
                duration: 500,
                yoyo: true,
                repeat: -1
            });
            
            container.add(newHighScoreText);
        }
        
        return container;
    }
    
    shutdown() {
        // Save high score one last time
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }
        
        // Clean up text objects
        if (this.scoreText) this.scoreText.destroy();
        if (this.highScoreText) this.highScoreText.destroy();
        if (this.waveText) this.waveText.destroy();
        if (this.enemiesText) this.enemiesText.destroy();
    }
}

export default ScoreManager; 