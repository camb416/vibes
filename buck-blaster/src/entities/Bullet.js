class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        // Use the scene's bulletIcon if available, otherwise use a default
        const texture = scene.bulletIcon || 'light_icon1';
        super(scene, x, y, texture);
        
        this.speed = 500;
        this.lifespan = 1000;
        this.isEnemyBullet = false;
    }
    
    fire(x, y, targetX, targetY, color = 0x00FFFF, customSpeed = null) {
        this.bulletColor = color;
        
        // Use custom speed if provided, otherwise use default
        if (customSpeed !== null) {
            this.speed = customSpeed;
        }
        
        if (this.body) {
            this.body.reset(x, y);
        }
        this.setActive(true);
        this.setVisible(true);
        
        // Set bullet properties
        this.setScale(0.08);
        this.setTint(this.bulletColor);
        
        // Calculate angle to target
        const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
        
        // Set velocity based on angle and speed
        if (this.scene && this.scene.physics && this.body) {
            this.scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);
        }
        
        // Set bullet rotation to match direction
        this.rotation = angle;
        
        // Set bullet lifespan
        this.lifeTimer = this.scene.time.delayedCall(this.lifespan, () => {
            if (this.active) {
                this.destroy();
            }
        });
    }
    
    update() {
        // Remove particle update
        // if (this.particles && this.active) {
        //     this.particles.setPosition(this.x, this.y);
        // }
    }
    
    destroy() {
        // Remove particle cleanup
        // if (this.particles) {
        //     this.particles.destroy();
        //     this.particles = null;
        // }
        if (this.lifeTimer) {
            this.lifeTimer.remove();
            this.lifeTimer = null;
        }
        
        super.destroy();
    }
} 