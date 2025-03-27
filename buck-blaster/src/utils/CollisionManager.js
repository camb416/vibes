class CollisionManager {
    constructor(scene) {
        this.scene = scene;
        this.colliders = [];
        this.overlaps = [];
    }
    
    initialize() {
        // Set up all collisions and overlaps
        this.setupCollisions();
    }
    
    setupCollisions() {
        // Clear any existing colliders
        this.clearColliders();
        
        // Player bullet hits enemy
        this.colliders.push(
            this.scene.physics.add.collider(
                this.scene.bullets,
                this.scene.enemies,
                this.bulletHitEnemy,
                null,
                this
            )
        );
        
        // Player hits enemy
        this.colliders.push(
            this.scene.physics.add.collider(
                this.scene.player,
                this.scene.enemies,
                this.playerHitEnemy,
                null,
                this
            )
        );
        
        // Enemy bullet hits player
        this.colliders.push(
            this.scene.physics.add.collider(
                this.scene.player,
                this.scene.enemyBullets,
                this.enemyBulletHitPlayer,
                null,
                this
            )
        );
        
        // Player bullet hits enemy bullet (cancel each other)
        this.colliders.push(
            this.scene.physics.add.collider(
                this.scene.bullets,
                this.scene.enemyBullets,
                this.bulletHitEnemyBullet,
                null,
                this
            )
        );
        
        // Enemy bullets can't hit other enemies
        this.colliders.push(
            this.scene.physics.add.collider(
                this.scene.enemies,
                this.scene.enemyBullets,
                null,
                () => false, // Always return false to ignore collision
                this
            )
        );
    }
    
    bulletHitEnemy(bullet, enemy) {
        // Handle bullet hitting enemy
        if (!bullet.active || !enemy.active) return;
        
        // Check if it's a large enemy
        const isLarge = enemy.isLarge;
        
        if (isLarge) {
            // Large enemies take multiple hits
            enemy.health -= 1;
            
            // Update health bar
            if (enemy.healthBar) {
                const healthPercent = enemy.health / enemy.maxHealth;
                enemy.healthBar.clear();
                
                // Draw health background
                enemy.healthBar.fillStyle(0xff0000, 0.8);
                enemy.healthBar.fillRect(-15, -25, 30, 5);
                
                // Draw health remaining
                enemy.healthBar.fillStyle(0x00ff00, 0.8);
                enemy.healthBar.fillRect(-15, -25, 30 * healthPercent, 5);
            }
            
            // Small particle effect for hit
            this.createBulletImpact(bullet.x, bullet.y, this.scene.colorPalette[1]);
            
            // If health depleted, destroy enemy
            if (enemy.health <= 0) {
                // Get enemy position before destroying
                const enemyX = enemy.x;
                const enemyY = enemy.y;
                
                // Create dramatic death effect for large enemy
                this.scene.effectsManager.createDramaticDeath(enemy);
                
                // Add score for large enemy
                this.scene.scoreManager.enemyKilled(true);
                
                // Update enemies remaining count
                this.scene.enemiesRemainingInWave--;
                
                // Check for wave completion
                this.checkWaveCompletion();
            }
        } else {
            // Regular enemies die in one hit
            const enemyX = enemy.x;
            const enemyY = enemy.y;
            
            // Create small explosion
            this.scene.effectsManager.createSmallExplosion(enemyX, enemyY, this.scene.colorPalette[1]);
            
            // Destroy enemy
            enemy.destroy();
            
            // Add score for regular enemy
            this.scene.scoreManager.enemyKilled(false);
            
            // Update enemies remaining count
            this.scene.enemiesRemainingInWave--;
            
            // Check for wave completion
            this.checkWaveCompletion();
        }
        
        // Bullet is always destroyed
        bullet.destroy();
        
        // Warp background from bullet impact position
        this.scene.backgroundManager.warpBackground(bullet.x, bullet.y, 0.5);
        
        // Check for chain reaction
        this.scene.effectsManager.checkChainReaction(bullet.x, bullet.y);
    }
    
    playerHitEnemy(player, enemy) {
        // Handle player collision with enemy
        if (!player.active || !enemy.active) return;
        
        // Get positions
        const playerX = player.x;
        const playerY = player.y;
        const enemyX = enemy.x;
        const enemyY = enemy.y;
        
        // Player dies
        this.scene.effectsManager.createDramaticDeath(player);
        
        // Enemy also explodes
        if (enemy.isLarge) {
            this.scene.effectsManager.createDramaticDeath(enemy);
        } else {
            this.scene.effectsManager.createSmallExplosion(enemyX, enemyY, this.scene.colorPalette[2]);
        }
        
        // Create dramatic warp effect
        this.scene.backgroundManager.warpBackground(playerX, playerY, 1.5);
        
        // Record final stats
        this.scene.scoreManager.recordFinalStats();
        
        // Show game over screen
        this.scene.gameStateManager.setupGameOver(this.scene.scoreManager);
    }
    
    enemyBulletHitPlayer(player, bullet) {
        // Handle enemy bullet hitting player
        if (!player.active || !bullet.active) return;
        
        // Get positions
        const playerX = player.x;
        const playerY = player.y;
        const bulletX = bullet.x;
        const bulletY = bullet.y;
        
        // Player dies with dramatic effect
        this.scene.effectsManager.createDramaticDeath(player);
        
        // Create dramatic warp effect
        this.scene.backgroundManager.warpBackground(playerX, playerY, 1.5);
        
        // Bullet is destroyed
        bullet.destroy();
        
        // Record final stats
        this.scene.scoreManager.recordFinalStats();
        
        // Show game over screen
        this.scene.gameStateManager.setupGameOver(this.scene.scoreManager);
    }
    
    bulletHitEnemyBullet(playerBullet, enemyBullet) {
        // Handle player bullet colliding with enemy bullet
        if (!playerBullet.active || !enemyBullet.active) return;
        
        // Get bullet positions
        const x = (playerBullet.x + enemyBullet.x) / 2;
        const y = (playerBullet.y + enemyBullet.y) / 2;
        
        // Create a small explosion
        this.scene.effectsManager.createSmallExplosion(x, y, this.scene.colorPalette[3]);
        
        // Warp background slightly
        this.scene.backgroundManager.warpBackground(x, y, 0.3);
        
        // Play sound
        this.scene.audioManager.playSound('bulletClash');
        
        // Destroy both bullets
        playerBullet.destroy();
        enemyBullet.destroy();
    }
    
    createBulletImpact(x, y, color) {
        // Create a small particle effect for bullet impacts
        const particles = this.scene.add.particles(x, y, 'particle', {
            speed: { min: 50, max: 150 },
            scale: { start: 0.05, end: 0.01 },
            quantity: 5,
            lifespan: 300,
            emitting: false
        });
        
        // Set particle color
        particles.setTint(color);
        
        // Emit once then destroy
        particles.explode(5, x, y);
        
        // Destroy particles after animation
        this.scene.time.delayedCall(300, () => {
            particles.destroy();
        });
    }
    
    checkWaveCompletion() {
        // Check if wave is complete
        if (this.scene.waveInProgress && this.scene.enemiesRemainingInWave <= 0) {
            // Wave complete, start next wave after delay
            this.scene.waveInProgress = false;
            
            // Update wave text
            this.scene.scoreManager.updateEnemiesDisplay();
            
            // Start new wave after delay
            this.scene.time.delayedCall(
                this.scene.timeBetweenWaves,
                this.scene.startNewWave,
                [],
                this.scene
            );
        }
    }
    
    clearColliders() {
        // Remove all active colliders to prevent duplicates
        this.colliders.forEach(collider => {
            if (collider) collider.destroy();
        });
        this.colliders = [];
        
        this.overlaps.forEach(overlap => {
            if (overlap) overlap.destroy();
        });
        this.overlaps = [];
    }
    
    shutdown() {
        // Clear all colliders
        this.clearColliders();
    }
}

export default CollisionManager; 