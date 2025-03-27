class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, color = 0xFF0000) {
        // Use a fallback texture if none provided
        const validTexture = texture || (scene.enemyIcon || 'light_icon1');
        super(scene, x, y, validTexture);
        
        // Store the enemy color
        this.enemyColor = color;
        
        // Add to scene and enable physics
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Set enemy properties
        this.setScale(0.12);
        this.setBounce(1);
        this.setCollideWorldBounds(false); // Don't collide with world bounds
        
        // PS1-style: solid color, no glow
        this.setTint(this.enemyColor);
        this.setBlendMode(Phaser.BlendModes.NORMAL); // PS1 didn't have fancy blend modes
        
        // Set random velocity
        const speed = Phaser.Math.Between(50, 100);
        const angle = Phaser.Math.Between(0, 360);
        this.setVelocity(
            speed * Math.cos(angle * Math.PI / 180),
            speed * Math.sin(angle * Math.PI / 180)
        );
        
        // Set initial rotation based on velocity
        this.rotation = angle * Math.PI / 180;
        
        // PS1-style: simpler animation - just a subtle alpha change
        scene.tweens.add({
            targets: this,
            alpha: 0.9,
            duration: 300,
            yoyo: true,
            repeat: -1
        });
        
        // Track time alive
        this.timeAlive = 0;
        
        // Store reference to player for targeting
        this.player = scene.player;
        
        // Player targeting weight (higher = more aggressive targeting)
        this.playerTargetWeight = Phaser.Math.FloatBetween(0.3, 0.6);
    }
    
    update(time, delta) {
        // Increment time alive
        this.timeAlive += delta || 16;
        
        // Rotate based on movement direction
        if (this.body && this.body.velocity.length() > 10) {
            const angle = Math.atan2(this.body.velocity.y, this.body.velocity.x);
            this.rotation = angle;
        }
        
        // Check if enemy is out of bounds (far outside the screen)
        const bounds = {
            left: -100,
            right: this.scene.cameras.main.width + 100,
            top: -100,
            bottom: this.scene.cameras.main.height + 100
        };
        
        if (
            this.x < bounds.left || 
            this.x > bounds.right || 
            this.y < bounds.top || 
            this.y > bounds.bottom
        ) {
            // If enemy is too far outside, redirect it towards the player
            if (this.player && this.player.active) {
                const angle = Phaser.Math.Angle.Between(
                    this.x, this.y,
                    this.player.x, this.player.y
                );
                
                const speed = Phaser.Math.Between(70, 120);
                if (this.scene && this.scene.physics && this.body) {
                    this.scene.physics.velocityFromRotation(angle, speed, this.body.velocity);
                }
            }
        }
        
        // Always adjust course towards player with a certain probability
        // Higher probability than before to make enemies more aggressive
        if (this.player && this.player.active && Phaser.Math.Between(0, 100) < 5) {
            const angle = Phaser.Math.Angle.Between(
                this.x, this.y,
                this.player.x, this.player.y
            );
            
            const speed = Phaser.Math.Between(70, 120);
            if (this.scene && this.scene.physics && this.body) {
                // Apply a force towards the player
                const playerForceX = Math.cos(angle) * speed * this.playerTargetWeight;
                const playerForceY = Math.sin(angle) * speed * this.playerTargetWeight;
                
                // Add this force to current velocity
                this.body.velocity.x += playerForceX;
                this.body.velocity.y += playerForceY;
                
                // Limit speed
                const maxSpeed = 150;
                const currentSpeed = this.body.velocity.length();
                if (currentSpeed > maxSpeed) {
                    this.body.velocity.normalize().scale(maxSpeed);
                }
            }
        }
    }
    
    destroy() {
        // Clean up health bar if it exists
        if (this.healthBar) {
            this.healthBar.destroy();
            this.healthBar = null;
        }
        
        // Clean up health bar update event if it exists
        if (this.healthBarUpdateEvent) {
            this.healthBarUpdateEvent.remove();
            this.healthBarUpdateEvent = null;
        }
        
        super.destroy();
    }
} 