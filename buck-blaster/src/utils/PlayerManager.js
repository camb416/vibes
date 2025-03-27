class PlayerManager {
    constructor(scene) {
        this.scene = scene;
        this.player = null;
        this.bullets = null;
        this.bulletSpeed = 400;
        this.playerSpeed = 200;
        this.lastShotTime = 0;
        this.shootingDelay = 200; // ms between shots
        this.trailParticles = null;
        this.shootSound = null;
        
        // Ammo system
        this.maxAmmo = 10;
        this.currentAmmo = 10;
        this.ammoRegenRate = 500; // ms per bullet regen
        this.lastRegenTime = 0;
        this.ammoDisplay = null;
        this.ammoIcons = [];
        this.ammoLabel = null;
    }
    
    initialize() {
        // Create player and bullets
        this.createPlayerAndBullets();
        
        // Create ammo display
        this.createAmmoDisplay();
    }
    
    createPlayerAndBullets() {
        // Create player bullets group
        this.bullets = this.scene.physics.add.group({
            classType: Phaser.Physics.Arcade.Image,
            defaultKey: this.scene.bulletIcon,
            maxSize: 30
        });
        
        // Store reference to bullets in the scene for collision detection
        this.scene.bullets = this.bullets;
        
        // Create player sprite
        this.player = this.scene.physics.add.sprite(
            this.scene.gameWidth / 2,
            this.scene.gameHeight / 2,
            this.scene.playerIcon
        );
        this.player.setScale(0.08);
        this.player.setDepth(1);
        
        // Store reference to player in the scene for collision detection
        this.scene.player = this.player;
        
        // Add player trail effect
        this.createPlayerTrail();
    }
    
    createAmmoDisplay() {
        // Create container for ammo display
        // Position it higher on the screen for better visibility
        this.ammoDisplay = this.scene.add.container(20, this.scene.gameHeight - 50);
        this.ammoDisplay.setDepth(100);
        
        // Create ammo icons
        this.updateAmmoDisplay();
    }
    
    updateAmmoDisplay() {
        // Clear existing icons
        this.ammoIcons.forEach(icon => icon.destroy());
        this.ammoIcons = [];
        
        // Create new icons based on current ammo
        for (let i = 0; i < this.maxAmmo; i++) {
            const icon = this.scene.add.image(
                i * 20, // Increased horizontal spacing for better visibility
                0,
                this.scene.bulletIcon
            );
            
            // Make icons larger
            icon.setScale(0.06);
            
            // Set color based on whether we have this ammo or not
            if (i < this.currentAmmo) {
                // Available ammo
                icon.setTint(0xffffff);
                icon.setAlpha(1);
            } else {
                // Depleted ammo
                icon.setTint(0x666666);
                icon.setAlpha(0.5);
            }
            
            this.ammoDisplay.add(icon);
            this.ammoIcons.push(icon);
        }
        
        // Add a text label above the icons
        if (!this.ammoLabel) {
            this.ammoLabel = this.scene.add.text(
                0, 
                -20, 
                "AMMO", 
                {
                    fontFamily: 'Arial, sans-serif',
                    fontSize: '16px',
                    fontStyle: 'bold',
                    color: '#ffffff'
                }
            );
            this.ammoDisplay.add(this.ammoLabel);
        }
    }
    
    createPlayerTrail() {
        // Create trail particles behind player
        this.trailParticles = this.scene.add.particles(0, 0, 'particle', {
            follow: this.player,
            scale: { start: 0.04, end: 0.01 },
            alpha: { start: 0.3, end: 0 },
            speed: 20,
            lifespan: 300,
            quantity: 1,
            frequency: 30,
            tint: this.scene.colorPalette[0]
        });
        this.trailParticles.setDepth(0);
    }
    
    update(time, delta) {
        if (!this.player.active) return;
        
        // Get movement direction from keyboard manager
        const moveDirection = this.scene.keyboardManager.getMoveDirection();
        
        // Apply movement
        this.player.setVelocity(
            moveDirection.x * this.playerSpeed,
            moveDirection.y * this.playerSpeed
        );
        
        // Check for shooting
        this.handleShooting(time);
        
        // Regenerate ammo
        this.regenerateAmmo(time);
        
        // Keep player within game bounds
        this.checkBounds();
    }
    
    regenerateAmmo(time) {
        // Only regenerate if we're not at max ammo
        if (this.currentAmmo < this.maxAmmo && time > this.lastRegenTime + this.ammoRegenRate) {
            this.currentAmmo += 1;
            this.lastRegenTime = time;
            
            // Update the display
            this.updateAmmoDisplay();
        }
    }
    
    handleShooting(time) {
        // Get mouse state and position
        const pointer = this.scene.input.activePointer;
        
        // Check if mouse button is down, we have ammo, and cooldown is over
        if (pointer.isDown && 
            this.currentAmmo > 0 && 
            time > this.lastShotTime + this.shootingDelay) {
            
            // Shoot and consume ammo
            this.shoot(pointer.worldX, pointer.worldY);
            this.currentAmmo -= 1;
            this.lastShotTime = time;
            
            // Update the ammo display
            this.updateAmmoDisplay();
        }
    }
    
    shoot(targetX, targetY) {
        // Get bullet from pool
        const bullet = this.bullets.get();
        if (!bullet) return;
        
        // Position bullet at player
        bullet.setPosition(this.player.x, this.player.y);
        bullet.setScale(0.06);
        bullet.setActive(true);
        bullet.setVisible(true);
        
        // Calculate direction to target
        const angle = Phaser.Math.Angle.Between(
            this.player.x, this.player.y,
            targetX, targetY
        );
        
        // Set velocity towards target
        this.scene.physics.velocityFromRotation(
            angle,
            this.bulletSpeed,
            bullet.body.velocity
        );
        
        // Set bullet rotation to match direction
        bullet.setRotation(angle + Math.PI / 2);
        
        // Play shoot sound
        this.scene.audioManager.playSound('playerShoot');
        
        // Add small muzzle flash
        this.createMuzzleFlash();
    }
    
    createMuzzleFlash() {
        // Create flash particles at player position
        const flash = this.scene.add.particles(this.player.x, this.player.y, 'particle', {
            scale: { start: 0.1, end: 0 },
            alpha: { start: 1, end: 0 },
            speed: 50,
            lifespan: 100,
            quantity: 1,
            emitting: false
        });
        
        // Set flash color
        flash.setTint(0xffff00);
        
        // Emit once and destroy
        flash.explode(3, this.player.x, this.player.y);
        
        this.scene.time.delayedCall(100, () => {
            flash.destroy();
        });
    }
    
    checkBounds() {
        // Keep player within game bounds with a small margin
        const margin = 20;
        const halfWidth = this.player.displayWidth / 2;
        const halfHeight = this.player.displayHeight / 2;
        
        // Apply constraints
        this.player.x = Phaser.Math.Clamp(
            this.player.x,
            margin + halfWidth,
            this.scene.gameWidth - margin - halfWidth
        );
        
        this.player.y = Phaser.Math.Clamp(
            this.player.y,
            margin + halfHeight,
            this.scene.gameHeight - margin - halfHeight
        );
    }
    
    destroyBullets() {
        // Clear all active bullets
        this.bullets.clear(true, true);
    }
    
    resetPosition() {
        // Reset player to center of screen
        this.player.setPosition(
            this.scene.gameWidth / 2,
            this.scene.gameHeight / 2
        );
        
        // Clear any velocity
        this.player.setVelocity(0, 0);
        
        // Reset ammo
        this.currentAmmo = this.maxAmmo;
        this.updateAmmoDisplay();
    }
    
    shutdown() {
        // Clean up all resources
        this.destroyBullets();
        
        if (this.trailParticles) {
            this.trailParticles.destroy();
            this.trailParticles = null;
        }
        
        if (this.player) {
            this.player.destroy();
            this.player = null;
        }
        
        // Clean up ammo display
        this.ammoIcons.forEach(icon => {
            if (icon) icon.destroy();
        });
        this.ammoIcons = [];
        
        if (this.ammoLabel) {
            this.ammoLabel.destroy();
            this.ammoLabel = null;
        }
        
        if (this.ammoDisplay) {
            this.ammoDisplay.destroy();
            this.ammoDisplay = null;
        }
    }
}

export default PlayerManager; 