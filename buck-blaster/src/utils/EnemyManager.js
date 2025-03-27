class EnemyManager {
    constructor(scene) {
        this.scene = scene;
        this.enemyCounter = 0;
        this.largeEnemyFrequency = 7;
        this.largeEnemyHealthBase = 3;
    }

    createEnemies() {
        // Create enemy group with physics
        this.scene.enemies = this.scene.physics.add.group({
            classType: Enemy,
            runChildUpdate: true
        });
        
        // Create enemy bullet group
        this.scene.enemyBullets = this.scene.physics.add.group({
            classType: Bullet,
            runChildUpdate: true,
            maxSize: 100 // Limit number of enemy bullets
        });
    }
    
    spawnWaveEnemies() {
        // Calculate spawn delays based on wave number
        const baseDelay = Math.max(500, 3000 - (this.scene.currentWave - 1) * 250);
        
        // Add randomness to spawn timing (±30% variation)
        const getRandomDelay = () => {
            const variation = baseDelay * 0.3; // 30% variation
            return Phaser.Math.Between(baseDelay - variation, baseDelay + variation);
        };
        
        // Sometimes spawn enemies in small groups as waves progress
        const groupSpawnChance = Math.min(0.7, this.scene.currentWave * 0.07); // Increases with waves, caps at 70%
        const maxGroupSize = Math.min(4, 1 + Math.floor(this.scene.currentWave / 3)); // Larger groups in later waves
        
        // Initial batch of enemies - smaller in early waves, larger in later waves
        const initialSpawn = Math.min(Math.max(2, Math.floor(this.scene.currentWave / 2)), this.scene.enemiesRemainingInWave);
        console.log(`Wave ${this.scene.currentWave}: Spawning initial batch of ${initialSpawn} enemies`);
        
        // Spawn initial batch immediately
        for (let i = 0; i < initialSpawn; i++) {
            this.spawnEnemy();
            this.scene.enemiesRemainingInWave--;
        }
        
        // Set up scheduled spawning for remaining enemies
        if (this.scene.enemiesRemainingInWave > 0) {
            // Create array of spawn times for all remaining enemies
            const remainingSpawns = [];
            let remainingToSchedule = this.scene.enemiesRemainingInWave;
            
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
                
                this.scene.time.delayedCall(cumulativeDelay, () => {
                    if (this.scene.gameOver) return;
                    
                    // Spawn the group
                    for (let i = 0; i < spawn.count; i++) {
                        this.spawnEnemy();
                        this.scene.enemiesRemainingInWave--;
                    }
                    
                    console.log(`Spawned group of ${spawn.count} enemies, ${this.scene.enemiesRemainingInWave} remaining in wave`);
                });
            }
        }
    }
    
    spawnEnemy() {
        if (this.scene.gameOver) return;
        
        // Determine spawn position (much further outside the screen)
        let x, y;
        const side = Phaser.Math.Between(0, 3);
        
        // Significantly increase spawn distance to ensure enemies are far from player
        const offscreenMargin = 120; // Increased from 40 to 120
        
        switch (side) {
            case 0: // Top
                x = Phaser.Math.Between(0, this.scene.gameWidth);
                y = -offscreenMargin;
                break;
            case 1: // Right
                x = this.scene.gameWidth + offscreenMargin;
                y = Phaser.Math.Between(0, this.scene.gameHeight);
                break;
            case 2: // Bottom
                x = Phaser.Math.Between(0, this.scene.gameWidth);
                y = this.scene.gameHeight + offscreenMargin;
                break;
            case 3: // Left
                x = -offscreenMargin;
                y = Phaser.Math.Between(0, this.scene.gameHeight);
                break;
        }
        
        // Ensure we have a valid texture for the enemy
        const enemyTexture = this.scene.enemyIcon || this.scene.availableLightIcons[0] || 'fallback_texture';
        
        // Increment enemy counter
        this.enemyCounter++;
        
        // Create a new enemy with the valid texture
        const newEnemy = new Enemy(this.scene, x, y, enemyTexture, this.scene.enemyColor);
        
        // Apply wave-based speed multiplier
        newEnemy.speed *= this.scene.enemySpeedMultiplier;
        
        // Every Nth enemy is a large one that takes multiple hits (frequency decreases with wave)
        if (this.enemyCounter % this.largeEnemyFrequency === 0) {
            newEnemy.setScale(0.65); // Reduced size for better gameplay
            
            // Health increases with wave number (base 3 + 1 per 3 waves)
            const additionalHealth = Math.floor(this.scene.currentWave / 3);
            newEnemy.health = this.largeEnemyHealthBase + additionalHealth;
            
            newEnemy.isLarge = true; // Flag as large enemy
            newEnemy.setTint(0xffaa00); // Give it a distinct color
            
            // Add a health indicator - adjust position for smaller size
            newEnemy.healthBar = this.scene.add.graphics();
            newEnemy.updateHealthBar = function() {
                if (this.healthBar) {
                    this.healthBar.clear();
                    this.healthBar.fillStyle(0x00ff00, 0.8);
                    const maxHealth = this.scene.enemyManager.largeEnemyHealthBase + Math.floor(this.scene.currentWave / 3);
                    this.healthBar.fillRect(-10, -15, 20 * (this.health / maxHealth), 4); // Smaller health bar
                    this.healthBar.lineStyle(1, 0xffffff, 0.8);
                    this.healthBar.strokeRect(-10, -15, 20, 4); // Smaller health bar
                }
            };
            newEnemy.updateHealthBar();
            
            // Make the health bar follow the enemy
            const healthBarUpdateEvent = this.scene.time.addEvent({
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
        
        this.scene.enemies.add(newEnemy);
        
        // Add a random delay before this enemy can shoot
        // Between 1.5 and 4 seconds after spawning, reduced by wave multiplier
        newEnemy.canShoot = true;
        
        // Higher chance for shooting as waves progress
        const shootChance = 40 * this.scene.enemyShootChanceMultiplier;
        
        // Random chance for this enemy to be a non-shooter
        if (Math.random() > 0.7) { // 30% chance to be a non-shooter
            newEnemy.canShoot = false;
            
            // Non-shooters move faster
            newEnemy.body.velocity.x *= 1.3;
            newEnemy.body.velocity.y *= 1.3;
        }
        
        return newEnemy;
    }
    
    enemyShoot(enemy, targetX, targetY) {
        // Create a new enemy bullet
        const bullet = this.scene.enemyBullets.get();
        
        if (bullet) {
            // Ensure the bullet has a valid texture before firing
            if (!bullet.texture || !bullet.texture.key) {
                bullet.setTexture(this.scene.bulletIcon || this.scene.availableLightIcons[0] || 'fallback_texture');
            }
            
            // Store creation time for lifetime tracking
            bullet.setData('creationTime', this.scene.time.now);
            
            // Fire with enemy color and faster speed but shorter range
            bullet.fire(enemy.x, enemy.y, targetX, targetY, this.scene.enemyColor, 250); // Slightly faster speed
            
            // Play shoot sound (optional)
            this.scene.shootSound.play();
        }
    }
    
    applyVectorFieldToEnemy(enemy) {
        if (!this.scene.vectorField || !enemy || !enemy.active) return;
        
        // Get enemy position in grid coordinates
        const gridSize = 32; // Size of each grid cell in the vector field
        const gridX = Math.floor(enemy.x / gridSize);
        const gridY = Math.floor(enemy.y / gridSize);
        
        // Get vector field dimensions
        const fieldWidth = 256 / gridSize; // Assume vector field is 256x256 pixels
        const fieldHeight = 256 / gridSize;
        
        // Check if position is within bounds of vector field
        if (gridX >= 0 && gridX < fieldWidth && gridY >= 0 && gridY < fieldHeight) {
            // Get the texture to analyze
            const texture = this.scene.textures.get(`vector_field${this.scene.vectorFieldIndex}`);
            
            if (texture && texture.getPixel) {
                // Get the color at this position
                const pixel = texture.getPixel(
                    gridX * gridSize + gridSize / 2, 
                    gridY * gridSize + gridSize / 2
                );
                
                if (pixel) {
                    // In a real vector field texture, R and G channels encode the X and Y direction
                    // Here, we'll derive a synthetic direction from the color
                    const dirX = (pixel.r / 255) * 2 - 1; // -1 to 1
                    const dirY = (pixel.g / 255) * 2 - 1; // -1 to 1
                    
                    // Apply force based on vector field
                    const forceScale = 2; // Adjust this to control how strong the vector field affects enemies
                    enemy.body.velocity.x += dirX * forceScale;
                    enemy.body.velocity.y += dirY * forceScale;
                    
                    // Apply gentle rotation to match flow direction
                    const angle = Math.atan2(dirY, dirX);
                    const currentRotation = enemy.rotation;
                    const rotDiff = angle - currentRotation;
                    
                    // Normalize the angle difference to be between -PI and PI
                    const normRotDiff = Math.atan2(Math.sin(rotDiff), Math.cos(rotDiff));
                    
                    // Apply a small rotation towards the field direction
                    enemy.rotation += normRotDiff * 0.1;
                }
            }
        }
    }
    
    applyPlayerTargetingBehavior(enemy) {
        if (!enemy || !enemy.active || !this.scene.player || !this.scene.player.active) return;
        
        // Calculate direction to player
        const dx = this.scene.player.x - enemy.x;
        const dy = this.scene.player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Only apply targeting if player is within a certain range
        if (distance < 300) {
            // Calculate player targeting force (stronger closer to the player)
            const targetingStrength = 0.4; // Reduced from 0.8 for less direct movement
            const distanceFactor = Math.max(0.2, Math.min(1.0, 300 / distance));
            
            // Apply a force towards the player
            const forceX = (dx / distance) * targetingStrength * distanceFactor;
            const forceY = (dy / distance) * targetingStrength * distanceFactor;
            
            enemy.body.velocity.x += forceX;
            enemy.body.velocity.y += forceY;
        }
    }
    
    applyFlockingBehavior(enemy) {
        if (!enemy || !enemy.active) return;
        
        const separationRadius = 120; // Increased from 80 for more spacing
        const alignmentRadius = 150;
        const cohesionRadius = 200;
        
        // Weights for different flocking behaviors
        const separationWeight = 0.9; // Increased from 0.5 for more spacing
        const alignmentWeight = 0.2;  // Reduced from 0.3
        const cohesionWeight = 0.2;   // Reduced from 0.3
        
        // Get all active enemies
        const enemies = this.scene.enemies.getChildren();
        
        // Initialize forces
        let separationForceX = 0;
        let separationForceY = 0;
        let separationCount = 0;
        
        let alignmentForceX = 0;
        let alignmentForceY = 0;
        let alignmentCount = 0;
        
        let cohesionCenterX = 0;
        let cohesionCenterY = 0;
        let cohesionCount = 0;
        
        // Calculate forces from each nearby enemy
        for (const otherEnemy of enemies) {
            if (otherEnemy === enemy || !otherEnemy.active) continue;
            
            const dx = otherEnemy.x - enemy.x;
            const dy = otherEnemy.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Separation - avoid getting too close to other enemies
            if (distance < separationRadius && distance > 0) {
                // Force is inversely proportional to distance
                const repulsionFactor = 1 - (distance / separationRadius);
                separationForceX -= (dx / distance) * repulsionFactor;
                separationForceY -= (dy / distance) * repulsionFactor;
                separationCount++;
            }
            
            // Alignment - try to move in the same direction as nearby enemies
            if (distance < alignmentRadius) {
                alignmentForceX += otherEnemy.body.velocity.x;
                alignmentForceY += otherEnemy.body.velocity.y;
                alignmentCount++;
            }
            
            // Cohesion - try to move towards the center of nearby enemies
            if (distance < cohesionRadius) {
                cohesionCenterX += otherEnemy.x;
                cohesionCenterY += otherEnemy.y;
                cohesionCount++;
            }
        }
        
        // Apply separation force
        if (separationCount > 0) {
            enemy.body.velocity.x += separationForceX / separationCount * separationWeight;
            enemy.body.velocity.y += separationForceY / separationCount * separationWeight;
        }
        
        // Apply alignment force
        if (alignmentCount > 0) {
            const avgVelocityX = alignmentForceX / alignmentCount;
            const avgVelocityY = alignmentForceY / alignmentCount;
            
            enemy.body.velocity.x += (avgVelocityX - enemy.body.velocity.x) * alignmentWeight;
            enemy.body.velocity.y += (avgVelocityY - enemy.body.velocity.y) * alignmentWeight;
        }
        
        // Apply cohesion force
        if (cohesionCount > 0) {
            const centerX = cohesionCenterX / cohesionCount;
            const centerY = cohesionCenterY / cohesionCount;
            
            const dx = centerX - enemy.x;
            const dy = centerY - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                enemy.body.velocity.x += (dx / distance) * cohesionWeight;
                enemy.body.velocity.y += (dy / distance) * cohesionWeight;
            }
        }
        
        // Limit enemy speed
        const currentSpeed = enemy.body.velocity.length();
        const maxSpeed = enemy.speed || 150;
        
        if (currentSpeed > maxSpeed) {
            enemy.body.velocity.x = (enemy.body.velocity.x / currentSpeed) * maxSpeed;
            enemy.body.velocity.y = (enemy.body.velocity.y / currentSpeed) * maxSpeed;
        }
    }
}

export default EnemyManager; 