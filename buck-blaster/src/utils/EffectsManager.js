class EffectsManager {
    constructor(scene) {
        this.scene = scene;
        this.shakeDuration = 0;
        this.shakeIntensity = 0;
        this.shakeOffset = { x: 0, y: 0 };
    }

    // Screen shake effect
    shakeScreen(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
    }
    
    // Update screen shake effect (called in scene's update method)
    updateScreenShake() {
        if (this.shakeDuration > 0) {
            this.shakeDuration--;
            if (this.shakeDuration === 0) {
                // Reset camera position when shake is done
                this.scene.cameras.main.setPosition(0, 0);
                this.shakeOffset = { x: 0, y: 0 };
            } else {
                // Calculate new random shake offset
                this.shakeOffset = {
                    x: Phaser.Math.Between(-this.shakeIntensity, this.shakeIntensity),
                    y: Phaser.Math.Between(-this.shakeIntensity, this.shakeIntensity)
                };
                // Apply shake offset to camera
                this.scene.cameras.main.setPosition(this.shakeOffset.x, this.shakeOffset.y);
            }
        }
    }
    
    // Create a small explosion effect
    createSmallExplosion(x, y, color) {
        try {
            // Create particles
            const particles = this.scene.add.particles(x, y, 'fallback_texture', {
                speed: { min: 50, max: 150 },
                angle: { min: 0, max: 360 },
                scale: { start: 0.2, end: 0 },
                lifespan: 300,
                blendMode: Phaser.BlendModes.SCREEN,
                tint: color,
                quantity: 8
            });
            
            // Stop emitting after a short time and destroy
            this.scene.time.delayedCall(100, () => {
                particles.destroy();
            });
            
        } catch (e) {
            console.error('Error in createSmallExplosion:', e);
        }
    }
    
    // Create a standard explosion effect
    createExplosion(x, y, color) {
        try {
            // Create a white flash
            const flash = this.scene.add.circle(x, y, 40, 0xFFFFFF);
            flash.setAlpha(0.7);
            flash.setBlendMode(Phaser.BlendModes.SCREEN);
            
            // Animate the flash
            this.scene.tweens.add({
                targets: flash,
                alpha: 0,
                scale: 2,
                duration: 200,
                onComplete: () => {
                    flash.destroy();
                }
            });
            
            // Create particles for the explosion
            const particles = this.scene.add.particles(x, y, 'explosion_texture', {
                speed: { min: 50, max: 200 },
                angle: { min: 0, max: 360 },
                scale: { start: 0.5, end: 0 },
                lifespan: 500,
                blendMode: Phaser.BlendModes.SCREEN,
                tint: color,
                quantity: 15
            });
            
            // Stop emitting after a short time and destroy
            this.scene.time.delayedCall(200, () => {
                particles.destroy();
            });
            
        } catch (e) {
            console.error('Error in createExplosion:', e);
        }
    }
    
    // Create a dramatic death effect
    createDramaticDeath(entity) {
        try {
            const x = entity.x;
            const y = entity.y;
            const color = entity.isLarge || entity === this.scene.player ? 0xffffff : this.scene.enemyColor;
            const scale = entity.isLarge ? 1.5 : (entity === this.scene.player ? 1.2 : 1.0);
            const particleCount = entity.isLarge ? 20 : (entity === this.scene.player ? 15 : 8);
            
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
            const explosionContainer = this.scene.add.container(x, y);
            
            // Add a central explosion sprite
            const explosion = this.scene.add.image(0, 0, 'explosion_texture');
            explosion.setTint(color);
            explosion.setScale(0.8 * scale);
            explosionContainer.add(explosion);
            
            // Create entity fragments (pieces of the entity breaking apart)
            const fragments = [];
            
            // Use the entity's texture for fragments
            const texture = entity.texture.key;
            
            for (let i = 0; i < particleCount; i++) {
                // Create a fragment using the entity's texture
                const fragment = this.scene.add.image(0, 0, texture);
                fragment.setTint(color);
                
                // Set random scale for variety
                fragment.setScale(Phaser.Math.FloatBetween(0.1, 0.3) * scale);
                
                // Set initial positions close to center
                fragment.x = Phaser.Math.FloatBetween(-10, 10);
                fragment.y = Phaser.Math.FloatBetween(-10, 10);
                
                // Add to container
                explosionContainer.add(fragment);
                fragments.push(fragment);
            }
            
            // Add a central flash
            const flash = this.scene.add.circle(0, 0, 30 * scale, 0xFFFFFF);
            flash.setAlpha(0.7);
            explosionContainer.add(flash);
            
            // Animate the fragments flying outward
            for (const fragment of fragments) {
                // Calculate random direction and distance
                const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
                const distance = Phaser.Math.FloatBetween(50, 150) * scale;
                
                // Set target position
                const targetX = Math.cos(angle) * distance;
                const targetY = Math.sin(angle) * distance;
                
                // Add tweens
                this.scene.tweens.add({
                    targets: fragment,
                    x: targetX,
                    y: targetY,
                    alpha: 0,
                    angle: Phaser.Math.FloatBetween(-720, 720),
                    duration: Phaser.Math.FloatBetween(500, 1000),
                    ease: 'Power2',
                    onComplete: () => {
                        fragment.destroy();
                    }
                });
            }
            
            // Animate the central explosion
            this.scene.tweens.add({
                targets: explosion,
                alpha: 0,
                scale: 2 * scale,
                duration: 300,
                ease: 'Power1',
                onComplete: () => {
                    explosion.destroy();
                }
            });
            
            // Animate the flash
            this.scene.tweens.add({
                targets: flash,
                alpha: 0,
                scale: 3,
                duration: 200,
                ease: 'Power1',
                onComplete: () => {
                    flash.destroy();
                }
            });
            
            // Destroy the container after animations are done
            this.scene.time.delayedCall(1000, () => {
                explosionContainer.destroy();
            });
            
            // Destroy the entity
            if (entity !== this.scene.player) {
                entity.destroy();
            }
            
            // Shake screen if it's a large entity
            if (entity.isLarge) {
                this.shakeScreen(5, 20);
            } else if (entity === this.scene.player) {
                this.shakeScreen(10, 30);
            }
            
        } catch (e) {
            console.error('Error in createDramaticDeath:', e);
            
            // Fallback: still destroy the entity
            if (entity && entity !== this.scene.player) {
                entity.destroy();
            }
        }
    }
    
    // Check for chain reactions among enemies
    checkChainReaction(x, y) {
        if (!this.scene.enemies) return;
        
        // Get all enemies
        const enemies = this.scene.enemies.getChildren();
        const explosionRadius = this.scene.explosionRadius;
        
        // Check if any enemies are within explosion radius
        for (const enemy of enemies) {
            if (!enemy || !enemy.active) continue;
            
            // Calculate distance from explosion to enemy
            const dx = enemy.x - x;
            const dy = enemy.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // If enemy is within explosion radius, destroy it too
            if (distance < explosionRadius) {
                // Create an explosion at the enemy's position
                this.createExplosion(enemy.x, enemy.y, this.scene.enemyColor);
                
                // Award points for chain reaction kill
                if (enemy.isLarge) {
                    this.scene.updateScore(75); // Bonus for chain reacting a large enemy
                    this.createDramaticDeath(enemy); // Special effect for large enemies
                } else {
                    this.scene.updateScore(15); // Slightly more points than direct kill
                    enemy.destroy();
                }
                
                // Track enemies remaining in wave
                if (this.scene.waveInProgress && this.scene.enemiesRemainingInWave > 0) {
                    this.scene.enemiesRemainingInWave--;
                }
                
                // Recursive chain reaction - but limit depth to prevent infinite loops
                this.scene.time.delayedCall(100, () => {
                    this.checkChainReaction(enemy.x, enemy.y);
                });
            }
        }
    }
}

export default EffectsManager; 