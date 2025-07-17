export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y);
    this.scene = scene;
    
    // Create player text with emoji
    this.text = scene.add.text(x, y, '🤠', { fontSize: '64px' });
    this.scene.physics.add.existing(this.text);
    this.text.body.setCollideWorldBounds(true);
    this.text.body.setBounce(0.2);
    this.text.body.setDrag(300, 0);
    
    // No need for these on the sprite since we're using text
    this.visible = false;
    this.active = false;
    
    this.currentWord = '';
    this.typedWord = '';
    this.typingTarget = '';
    this.isTyping = false;
    this.correctLetters = 0;
    this.wrongLetters = 0;
  }

  update() {
    // Player now moves based on QuickTime events and success/failures
  }

  startTyping(word) {
    this.typingTarget = word;
    this.typedWord = '';
    this.isTyping = true;
    this.correctLetters = 0;
    this.wrongLetters = 0;
  }
  
  isTypingWord(word, key) {
    // If we're not currently typing this word, start typing it
    if (this.typingTarget !== word) {
      this.startTyping(word);
    }
    
    // Check if the key matches the next letter in the word
    if (this.typedWord.length < this.typingTarget.length) {
      const nextLetter = this.typingTarget[this.typedWord.length];
      if (key === nextLetter) {
        this.typedWord += key;
        
        // Show typing feedback
        this.showTypingFeedback();
        
        return true;
      }
    }
    
    return false;
  }
  
  isWordComplete() {
    return this.typedWord.length === this.typingTarget.length;
  }
  
  showTypingFeedback() {
    // Visual indication of typing progress (optional)
    const typingEffect = this.scene.add.text(
      this.text.x + Phaser.Math.Between(-20, 20),
      this.text.y - 30,
      this.typedWord[this.typedWord.length - 1],
      { fontSize: '24px', fill: '#ffffff' }
    );
    
    this.scene.tweens.add({
      targets: typingEffect,
      y: typingEffect.y - 30,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        typingEffect.destroy();
      }
    });
  }
  
  resetTyping() {
    this.typingTarget = '';
    this.typedWord = '';
    this.isTyping = false;
  }

  typeCharacter(char) {
    // Legacy method - not used in QuickTime event system
    // But kept for compatibility
    if (!this.isTyping) return false;
    
    if (this.currentWord[this.typingSpeed] === char) {
      this.typingSpeed++;
      this.correctLetters++;
      
      // Move player to stay on bronco better
      this.text.body.setVelocityY(-120);
      
      if (this.typingSpeed >= this.currentWord.length) {
        this.isTyping = false;
        return true;
      }
      return false;
    } else {
      // Wrong letter typed
      const randomDirection = Math.random() > 0.5 ? 1 : -1;
      this.text.body.setVelocityX(randomDirection * 100);
      return false;
    }
  }
} 