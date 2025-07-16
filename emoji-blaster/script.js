// Emoji Blaster - P5.js Implementation
let particles = [];
let autoMode = false;
let autoTimer = 0;
let selectedEmoji = 'random';
let canvas;

// Emoji sets for different themes
const emojiSets = {
    random: ['🎉', '🎊', '✨', '🌟', '⭐', '💫', '🎈', '🎁', '🎀', '🎭', '🎪', '🎨', '🎯', '🎲', '🎵', '🎶', '🎸', '🎤', '🎧', '📱', '💻', '🖥️', '⌨️', '🖱️', '🖨️', '📷', '📹', '🎥', '📽️', '🎬', '📺', '📻', '🎙️', '🎚️', '🎛️'],
    '🎉': ['🎉', '🎊', '🎈', '🎁', '🎀', '🎭', '🎪', '🎨', '🎯', '🎲'],
    '❤️': ['❤️', '💕', '💖', '💗', '💘', '💝', '💞', '💟', '💌', '💍'],
    '⭐': ['⭐', '🌟', '✨', '💫', '🌠', '🌌', '🌙', '☀️', '🌞', '🌝'],
    '🌈': ['🌈', '🌸', '🌺', '🌻', '🌷', '🌹', '🌼', '🌿', '🍀', '🌱'],
    '🎨': ['🎨', '🖌️', '🖍️', '✏️', '🖊️', '🖋️', '✒️', '🖇️', '📌', '📍'],
    '🚀': ['🚀', '🛸', '🌌', '🪐', '🌍', '🌎', '🌏', '🌕', '🌖', '🌗'],
    '🌸': ['🌸', '🌺', '🌻', '🌷', '🌹', '🌼', '🌿', '🍀', '🌱', '🌾']
};

// Particle class for emoji - optimized for performance
class EmojiParticle {
    constructor(x, y, emoji) {
        this.x = x;
        this.y = y;
        this.emoji = emoji;
        this.vx = random(-8, 8);
        this.vy = random(-12, -6);
        this.gravity = 0.3;
        this.bounce = 0.7;
        this.friction = 0.95;
        this.size = random(20, 40);
        this.rotation = 0;
        this.rotationSpeed = random(-0.2, 0.2);
        this.life = 1.0;
        this.fadeSpeed = random(0.003, 0.01);
        this.splashed = false;
    }

    update() {
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Apply gravity
        this.vy += this.gravity;
        
        // Apply friction
        this.vx *= this.friction;
        
        // Update rotation
        this.rotation += this.rotationSpeed;
        
        // Bounce off walls
        if (this.x < this.size/2) {
            this.x = this.size/2;
            this.vx *= -this.bounce;
        }
        if (this.x > width - this.size/2) {
            this.x = width - this.size/2;
            this.vx *= -this.bounce;
        }
        
        // Bounce off floor
        if (this.y > height - this.size/2) {
            this.y = height - this.size/2;
            this.vy *= -this.bounce;
            this.vx *= 0.8; // Additional friction on ground
            
            // Create splash effect (reduced for performance)
            if (!this.splashed && abs(this.vy) > 3 && particles.length < 60) {
                this.createSplash();
                this.splashed = true;
            }
        }
        
        // "Splat" on back wall (top) - reduced splash to prevent spam
        if (this.y < this.size/2) {
            this.y = this.size/2;
            this.vy *= -this.bounce * 0.5;
            // Only create splash if we don't have too many particles
            if (particles.length < 60) {
                this.createSplash();
            }
        }
        
        // Fade out over time
        this.life -= this.fadeSpeed;
        
        // Slow down when life is low
        if (this.life < 0.3) {
            this.vx *= 0.98;
            this.vy *= 0.98;
        }
    }
    
    createSplash() {
        // Create fewer splash particles for better performance
        for (let i = 0; i < 3; i++) {
            let splashParticle = new EmojiParticle(
                this.x + random(-15, 15),
                this.y + random(-15, 15),
                this.emoji
            );
            splashParticle.vx = random(-2, 2);
            splashParticle.vy = random(-2, 2);
            splashParticle.size = this.size * 0.6;
            splashParticle.fadeSpeed = 0.02;
            particles.push(splashParticle);
        }
    }
    
    display() {
        push();
        translate(this.x, this.y);
        rotate(this.rotation);
        
        // Simple emoji rendering for better performance
        tint(255, this.life * 255);
        textAlign(CENTER, CENTER);
        textSize(this.size);
        text(this.emoji, 0, 0);
        
        pop();
    }
    
    isDead() {
        return this.life <= 0;
    }
}

// P5.js setup function
function setup() {
    // Create larger canvas and attach to container
    canvas = createCanvas(1400, 800);
    canvas.parent('canvas-container');
    
    // Set up UI event listeners
    setupUI();
    
    // Background
    background(0);
}

// P5.js draw function
function draw() {
    // Create animated gradient background
    drawBackground();
    
    // Auto mode - optimized timing
    if (autoMode) {
        autoTimer++;
        if (autoTimer > 90) { // Every 90 frames (1.5 seconds at 60fps) for better performance
            createExplosion(random(width), random(height));
            autoTimer = 0;
        }
    }
    
    // Update and display particles
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].display();
        
        if (particles[i].isDead()) {
            particles.splice(i, 1);
        }
    }
    
    // Display particle count
    displayStats();
}

function drawBackground() {
    // Simple black background for maximum performance
    background(0);
}

function displayStats() {
    // Display particle count and FPS with monospace font
    fill(255);
    textAlign(LEFT, TOP);
    textSize(12);
    text(`PARTICLES: ${particles.length}`, 10, 10);
    text(`FPS: ${Math.round(frameRate())}`, 10, 25);
    
    if (autoMode) {
        fill(255);
        text('AUTO MODE: ON', 10, 40);
    }
}

function createExplosion(x, y) {
    // Create explosion of emoji particles - optimized particle count
    let numParticles = random(12, 20); // Reduced for better performance
    let currentEmojiSet = selectedEmoji === 'random' ? 
        emojiSets.random : emojiSets[selectedEmoji];
    
    // Don't create particles if we already have too many
    if (particles.length > 80) {
        return;
    }
    
    for (let i = 0; i < numParticles; i++) {
        let emoji = currentEmojiSet[Math.floor(Math.random() * currentEmojiSet.length)];
        let particle = new EmojiParticle(x, y, emoji);
        
        // Add some variation to the explosion
        let angle = random(0, TWO_PI);
        let force = random(3, 10);
        particle.vx = cos(angle) * force;
        particle.vy = sin(angle) * force - random(2, 6); // Slight upward bias
        
        particles.push(particle);
    }
}

function setupUI() {
    // Auto mode button
    document.getElementById('autoBtn').addEventListener('click', function() {
        autoMode = !autoMode;
        this.classList.toggle('active');
        this.textContent = autoMode ? 'AUTO MODE: ON' : 'AUTO MODE';
    });
    
    // Clear button
    document.getElementById('clearBtn').addEventListener('click', function() {
        particles = [];
        background(20, 25, 40);
    });
    
    // Export button
    document.getElementById('exportBtn').addEventListener('click', function() {
        saveCanvas('emoji-blaster', 'png');
    });
    
    // Emoji selection
    document.getElementById('emojiSelect').addEventListener('change', function() {
        selectedEmoji = this.value;
    });
}

// Mouse/touch interaction
function mousePressed() {
    if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
        createExplosion(mouseX, mouseY);
    }
}

// Touch support
function touchStarted() {
    if (touches.length > 0) {
        for (let touch of touches) {
            if (touch.x >= 0 && touch.x <= width && touch.y >= 0 && touch.y <= height) {
                createExplosion(touch.x, touch.y);
            }
        }
    }
    // Prevent default touch behavior
    return false;
}

// Keyboard shortcuts
function keyPressed() {
    if (key === ' ') {
        createExplosion(width/2, height/2);
        return false;
    }
    if (key === 'c' || key === 'C') {
        particles = [];
        background(20, 25, 40);
        return false;
    }
    if (key === 'a' || key === 'A') {
        document.getElementById('autoBtn').click();
        return false;
    }
    if (key === 'e' || key === 'E') {
        document.getElementById('exportBtn').click();
        return false;
    }
}

// Window resize handler
function windowResized() {
    // Keep canvas responsive with larger default size
    let container = document.getElementById('canvas-container');
    let containerWidth = container.offsetWidth;
    let newWidth = Math.min(containerWidth, 1400);
    let newHeight = Math.round(newWidth * 0.57); // Maintain aspect ratio
    
    resizeCanvas(newWidth, newHeight);
} 