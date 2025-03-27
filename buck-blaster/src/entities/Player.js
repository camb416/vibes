class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, color = 0x00FFFF) {
        // Use a fallback texture if none provided
        const validTexture = texture || (scene.playerIcon || 'light_icon1');
        super(scene, x, y, validTexture);
        
        // Store the player color
        this.playerColor = color;
        
        // Add player to scene and enable physics
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Set player properties
        this.setScale(0.15); // Very small size for hipster aesthetic
        this.setCollideWorldBounds(true);
        this.setBounce(0.1);
        this.setDrag(300);
        this.setMaxVelocity(300);
        
        // PS1-style: solid color, no glow
        this.setTint(this.playerColor); // Use the provided color
        this.setBlendMode(Phaser.BlendModes.NORMAL); // PS1 didn't have fancy blend modes
        
        // Player speed
        this.speed = 200;
        
        // Store reference to the scene for accessing mouse position
        this.gameScene = scene;
        
        // PS1-style: simpler animation - just a subtle alpha change
        scene.tweens.add({
            targets: this,
            alpha: 0.9,
            duration: 300,
            yoyo: true,
            repeat: -1
        });
    }
    
    update() {
        // Always rotate player to face the mouse cursor
        if (this.gameScene && this.gameScene.mousePosition) {
            // Calculate angle between player and mouse cursor
            const dx = this.gameScene.mousePosition.x - this.x;
            const dy = this.gameScene.mousePosition.y - this.y;
            const angle = Math.atan2(dy, dx);
            
            // Set player rotation to face the mouse
            this.rotation = angle;
        }
    }
    
    destroy() {
        super.destroy();
    }
} 