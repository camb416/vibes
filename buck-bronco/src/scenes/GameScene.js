import { Player } from '../Player';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    
    // Bind methods to ensure correct 'this' context
    this.playSoundEffect = this.playSoundEffect.bind(this);
    this.triggerEvent = this.triggerEvent.bind(this);
    this.updateEventTimer = this.updateEventTimer.bind(this);
    this.handleMissedEvent = this.handleMissedEvent.bind(this);
  }

  create() {
    // Background
    this.add.rectangle(0, 0, 800, 600, 0x3c6382).setOrigin(0, 0);
    
    // Create rodeo arena
    this.createArena();

    // Create bronco using emoji
    this.bronco = this.add.text(400, 400, '🐎', { fontSize: '64px' });
    this.physics.add.existing(this.bronco);
    this.bronco.body.setCollideWorldBounds(true);
    this.bronco.body.setBounce(0.2);
    
    // Bronco state
    this.broncoState = 'calm'; // can be: calm, bucking, spinning, charging
    
    // Add dust effects for when bronco bucks
    this.dustEffects = [];

    // Create player using emoji
    this.player = new Player(this, 400, 300);
    this.physics.add.collider(this.player.text, this.ground);
    this.physics.add.collider(this.player.text, this.bronco);

    // Setup input - keyboard only
    this.input.keyboard.on('keydown', this.handleKeyPress, this);

    // Game state
    this.score = 0;
    this.eventActive = false;
    this.eventTimer = null;
    this.stableTime = 0; // Time spent in stable state
    
    // Word choices for different events
    this.wordChoices = {
      bucking: ['GRIP', 'DUCK', 'LEAN'],
      spinning: ['SWAY', 'BRACE', 'SHIFT'],
      charging: ['PULL', 'STEER', 'JUMP']
    };
    
    // Choice outcomes
    this.choiceOutcomes = {
      bucking: {
        GRIP: { success: 0.8, points: 15, stabilityGain: 2 },
        DUCK: { success: 0.6, points: 10, stabilityGain: 1 },
        LEAN: { success: 0.4, points: 20, stabilityGain: 0 }
      },
      spinning: {
        SWAY: { success: 0.6, points: 20, stabilityGain: 0 },
        BRACE: { success: 0.8, points: 10, stabilityGain: 2 },
        SHIFT: { success: 0.5, points: 25, stabilityGain: 1 }
      },
      charging: {
        PULL: { success: 0.7, points: 15, stabilityGain: 1 },
        STEER: { success: 0.5, points: 25, stabilityGain: 0 },
        JUMP: { success: 0.6, points: 20, stabilityGain: 1 }
      }
    };
    
    // Verify all word choices have corresponding outcomes
    Object.keys(this.wordChoices).forEach(state => {
      this.wordChoices[state].forEach(word => {
        if (!this.choiceOutcomes[state] || !this.choiceOutcomes[state][word]) {
          console.error(`Missing outcome for ${word} in ${state} state`);
          // Add a default outcome
          if (!this.choiceOutcomes[state]) this.choiceOutcomes[state] = {};
          this.choiceOutcomes[state][word] = { success: 0.6, points: 10, stabilityGain: 1 };
        }
      });
    });
    
    // Create UI elements
    this.createUI();
    
    // Game over flag
    this.gameOver = false;
    
    // Difficulty level
    this.difficultyLevel = 1;
    
    // Stability meter (how well player is staying on)
    this.stability = 100;
    
    // Add sound effects
    this.createSoundEffects();

    // Start in calm state
    this.scheduleNextEvent();
  }
  
  createSoundEffects() {
    // Use emoji-based "sounds"
    this.correctSound = this.add.text(0, 0, '🔊', { fontSize: '24px' });
    this.correctSound.setVisible(false);
    
    this.wrongSound = this.add.text(0, 0, '❌', { fontSize: '24px' });
    this.wrongSound.setVisible(false);
    
    this.bucksSound = this.add.text(0, 0, '💥', { fontSize: '24px' });
    this.bucksSound.setVisible(false);
  }
  
  createArena() {
    // Create ground
    this.ground = this.add.tileSprite(400, 580, 800, 40, 'ground');
    this.physics.add.existing(this.ground, true);
    
    // Design a rodeo fence with emojis
    const fenceLeft = this.add.text(100, 520, '🧱🧱🧱', { fontSize: '48px' });
    const fenceRight = this.add.text(600, 520, '🧱🧱🧱', { fontSize: '48px' });
    const fenceTop = this.add.text(400, 150, '🤠👒🤠👒🤠', { fontSize: '24px' }).setOrigin(0.5);
  }
  
  createUI() {
    // Style for UI text
    const textStyle = { fontSize: '28px', fill: '#ffffff', stroke: '#000000', strokeThickness: 4 };
    
    // Center container for QTE words
    this.wordContainer = this.add.container(400, 100);
    
    // Choice words (initially hidden)
    this.choiceTexts = [];
    
    // Score panel
    this.scoreText = this.add.text(16, 16, 'Score: 0', textStyle);
    
    // Event timer text
    this.eventTimerText = this.add.text(400, 200, '', { fontSize: '48px', fill: '#ff0000', stroke: '#000000', strokeThickness: 6 });
    this.eventTimerText.setOrigin(0.5);
    this.eventTimerText.setVisible(false);
    
    // Stability meter
    this.stabilityText = this.add.text(16, 50, 'Stability: 100%', textStyle);
    this.stabilityBar = this.add.rectangle(120, 90, 200, 20, 0x3fc380);
    this.stabilityBar.setOrigin(0, 0.5);
    this.stabilityBarBg = this.add.rectangle(120, 90, 200, 20, 0x34495e);
    this.stabilityBarBg.setOrigin(0, 0.5);
    this.stabilityBarBg.setAlpha(0.5);
    
    // Bronco state indicator
    this.stateText = this.add.text(650, 16, 'CALM', { fontSize: '24px', fill: '#ffffff', stroke: '#000000', strokeThickness: 4 });
    
    // Event tip text
    this.tipText = this.add.text(400, 250, '', { fontSize: '20px', fill: '#ffffff', stroke: '#000000', strokeThickness: 3 });
    this.tipText.setOrigin(0.5);
    this.tipText.setVisible(false);
  }

  update() {
    if (this.gameOver) return;
    
    this.player.update();
    this.updateBronco();
    
    // Update stability over time
    if (!this.eventActive) {
      this.stableTime++;
      if (this.stableTime % 60 === 0) { // Every ~1 second
        this.stability = Math.min(100, this.stability + 1);
        this.updateStabilityUI();
      }
    }
    
    // Check if player has fallen off the bronco
    if (this.player.text.y > 550 || this.stability <= 0) {
      this.playSoundEffect(this.wrongSound, 400, 300);
      this.endGame();
    }
    
    // Update dust effects
    for (let i = this.dustEffects.length - 1; i >= 0; i--) {
      const dust = this.dustEffects[i];
      dust.alpha -= 0.02;
      dust.scale += 0.02;
      if (dust.alpha <= 0) {
        dust.destroy();
        this.dustEffects.splice(i, 1);
      }
    }
  }

  updateBronco() {
    // Handle bronco behavior based on current state
    switch (this.broncoState) {
      case 'bucking':
        this.bronco.body.setVelocityY(-250 - this.difficultyLevel * 20);
        this.createDustEffect(this.bronco.x, this.bronco.y + 30);
        break;
        
      case 'spinning':
        // Circular motion
        this.bronco.angle += 5;
        const radius = 30;
        this.bronco.x = 400 + Math.cos(this.bronco.angle * Math.PI/180) * radius;
        this.bronco.y = 400 + Math.sin(this.bronco.angle * Math.PI/180) * radius;
        this.createDustEffect(this.bronco.x, this.bronco.y + 30);
        break;
        
      case 'charging':
        // Random direction charges
        if (Math.random() < 0.1) {
          const direction = Math.random() > 0.5 ? 1 : -1;
          this.bronco.body.setVelocityX(direction * (200 + this.difficultyLevel * 15));
        }
        break;
        
      default: // 'calm'
        // Occasional small movements
        if (Math.random() < 0.02) {
          this.bronco.body.setVelocityY(-100);
        }
    }
  }
  
  createDustEffect(x, y) {
    // Create simple dust particles using circles
    for (let i = 0; i < 5; i++) {
      const size = Phaser.Math.Between(5, 15);
      const dust = this.add.circle(
        x + Phaser.Math.Between(-20, 20),
        y + Phaser.Math.Between(-10, 10),
        size,
        0xd3d3d3
      );
      dust.alpha = 0.7;
      this.dustEffects.push(dust);
    }
  }

  scheduleNextEvent() {
    // Clear any previous event
    if (this.eventTimer) {
      this.eventTimer.remove();
    }
    
    // Reset to calm state temporarily
    this.broncoState = 'calm';
    this.stateText.setText('CALM');
    this.stateText.setFill('#3fc380');
    
    // Clear any previous word choices
    this.clearWordChoices();
    
    // Schedule next event based on difficulty
    const nextEventDelay = Phaser.Math.Between(
      3000 - this.difficultyLevel * 500, 
      6000 - this.difficultyLevel * 500
    );
    
    this.eventTimer = this.time.delayedCall(nextEventDelay, this.triggerEvent, [], this);
  }
  
  triggerEvent() {
    // Don't trigger if game is over
    if (this.gameOver) return;
    
    // Set event active
    this.eventActive = true;
    
    // Choose random event type
    const eventTypes = ['bucking', 'spinning', 'charging'];
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    // Set bronco state
    this.broncoState = eventType;
    this.stateText.setText(eventType.toUpperCase());
    this.stateText.setFill('#e74c3c');
    
    // Display appropriate tip
    const tips = {
      bucking: 'Bronco is bucking! Choose how to react!',
      spinning: 'Bronco is spinning! Choose your technique!',
      charging: 'Bronco is charging! Control it!'
    };
    this.tipText.setText(tips[eventType]);
    this.tipText.setVisible(true);
    
    // Play sound effect
    this.playSoundEffect(this.bucksSound, this.bronco.x, this.bronco.y);
    
    // Display word choices for this event
    this.displayWordChoices(eventType);
    
    // Set timer for event response
    this.eventTimeLeft = 5;
    this.eventTimerText.setText(this.eventTimeLeft.toString());
    this.eventTimerText.setVisible(true);
    
    // Start countdown
    this.eventCountdown = this.time.addEvent({
      delay: 1000,
      callback: this.updateEventTimer,
      callbackScope: this,
      loop: true
    });
    
    // Reduce stability during event
    this.stability -= 5 + this.difficultyLevel;
    this.updateStabilityUI();
  }
  
  updateEventTimer() {
    this.eventTimeLeft--;
    this.eventTimerText.setText(this.eventTimeLeft.toString());
    
    // Make timer more urgent as time runs out
    const scale = 1 + (5 - this.eventTimeLeft) * 0.2;
    this.eventTimerText.setScale(scale);
    
    if (this.eventTimeLeft <= 0) {
      // Player didn't respond in time
      this.handleMissedEvent();
    }
  }
  
  handleMissedEvent() {
    // End the event
    this.endEvent();
    
    // Penalty for missing the event
    this.stability -= 20;
    this.updateStabilityUI();
    
    // Visual feedback
    this.playSoundEffect(this.wrongSound, this.player.text.x, this.player.text.y);
    this.cameras.main.shake(300, 0.03);
  }
  
  displayWordChoices(eventType) {
    // Clear any existing choices
    this.clearWordChoices();
    
    // Get words for this event type
    const words = this.wordChoices[eventType];
    
    // Create text objects for each word
    const colors = ['#3498db', '#e67e22', '#9b59b6'];
    for (let i = 0; i < words.length; i++) {
      const xPos = (i - 1) * 150; // -150, 0, 150
      
      const text = this.add.text(xPos, 0, words[i], {
        fontSize: '32px',
        fontWeight: 'bold',
        fill: colors[i],
        stroke: '#000000',
        strokeThickness: 6
      });
      text.setOrigin(0.5);
      
      // Style to indicate it's clickable
      text.setInteractive();
      text.on('pointerover', () => {
        text.setScale(1.2);
      });
      text.on('pointerout', () => {
        text.setScale(1);
      });
      
      // Store the text object
      this.choiceTexts.push(text);
      
      // Add to container
      this.wordContainer.add(text);
    }
    
    // Make container visible and add entry animation
    this.wordContainer.setAlpha(0);
    this.tweens.add({
      targets: this.wordContainer,
      alpha: 1,
      y: 100,
      duration: 300,
      ease: 'Back.easeOut'
    });
  }
  
  clearWordChoices() {
    // Remove all word choices
    this.wordContainer.removeAll(true);
    this.choiceTexts = [];
    this.wordContainer.setY(50);
  }
  
  updateStabilityUI() {
    // Update stability text and bar
    this.stability = Phaser.Math.Clamp(this.stability, 0, 100);
    this.stabilityText.setText(`Stability: ${Math.floor(this.stability)}%`);
    this.stabilityBar.width = this.stability * 2;
    
    // Update color based on stability
    if (this.stability > 60) {
      this.stabilityBar.fillColor = 0x3fc380; // Green
    } else if (this.stability > 30) {
      this.stabilityBar.fillColor = 0xf39c12; // Orange
    } else {
      this.stabilityBar.fillColor = 0xe74c3c; // Red
    }
  }

  handleKeyPress(event) {
    if (this.gameOver || !this.eventActive) return;
    
    const key = event.key.toUpperCase();
    
    // Make sure broncoState is valid
    if (!this.broncoState || !this.wordChoices[this.broncoState]) {
      console.warn('Invalid bronco state:', this.broncoState);
      return;
    }
    
    // Check if the pressed key is the first letter of any choice word
    const words = this.wordChoices[this.broncoState];
    for (let i = 0; i < words.length; i++) {
      const firstLetter = words[i].charAt(0);
      if (key === firstLetter) {
        this.handleWordChoice(words[i]);
        return;
      }
    }
    
    // Check if the full word was typed
    for (let i = 0; i < words.length; i++) {
      if (this.player.isTypingWord(words[i], key)) {
        // If the word is complete
        if (this.player.isWordComplete()) {
          this.handleWordChoice(words[i]);
        }
        return;
      }
    }
  }
  
  handleWordChoice(word) {
    // End the event
    this.endEvent();
    
    // Get outcome for this choice
    if (!this.choiceOutcomes[this.broncoState] || !this.choiceOutcomes[this.broncoState][word]) {
      console.warn(`Missing outcome data for ${word} during ${this.broncoState} state`);
      // Provide default outcome
      this.score += 10;
      this.scoreText.setText('Score: ' + this.score);
      this.playSoundEffect(this.correctSound, this.player.text.x, this.player.text.y);
      return;
    }
    
    const outcome = this.choiceOutcomes[this.broncoState][word];
    
    // Determine success based on probability
    const success = Math.random() < outcome.success;
    
    if (success) {
      // Success response
      this.score += outcome.points;
      this.scoreText.setText('Score: ' + this.score);
      this.stability += outcome.stabilityGain * 10;
      this.updateStabilityUI();
      
      // Visual feedback
      this.playSoundEffect(this.correctSound, this.player.text.x, this.player.text.y);
      this.addCompletionEffect(word);
      
      // Show feedback about the choice
      this.showChoiceFeedback(word, true);
    } else {
      // Failure response
      this.stability -= 15;
      this.updateStabilityUI();
      
      // Visual feedback for failure
      this.playSoundEffect(this.wrongSound, this.player.text.x, this.player.text.y);
      this.cameras.main.shake(300, 0.03);
      
      // Show feedback about the choice
      this.showChoiceFeedback(word, false);
    }
  }
  
  showChoiceFeedback(word, success) {
    // Determine feedback text based on word and outcome
    let feedbackText = '';
    const state = this.broncoState;
    
    if (success) {
      if (state === 'bucking') {
        if (word === 'GRIP') feedbackText = 'Perfect grip! Very stable!';
        if (word === 'DUCK') feedbackText = 'You ducked the buck!';
        if (word === 'LEAN') feedbackText = 'Risky lean but high points!';
      } else if (state === 'spinning') {
        if (word === 'SWAY') feedbackText = 'Swayed with the spin for points!';
        if (word === 'BRACE') feedbackText = 'Well braced! Very stable!';
        if (word === 'SHIFT') feedbackText = 'Good weight shift!';
      } else if (state === 'charging') {
        if (word === 'PULL') feedbackText = 'Good rein control!';
        if (word === 'STEER') feedbackText = 'Perfect steering for high points!';
        if (word === 'JUMP') feedbackText = 'Impressive jump technique!';
      }
    } else {
      feedbackText = `${word} failed! Lost stability!`;
    }
    
    // Display feedback
    const textColor = success ? '#2ecc71' : '#e74c3c';
    this.tipText.setText(feedbackText);
    this.tipText.setFill(textColor);
    
    // Schedule feedback to disappear
    this.time.delayedCall(2000, () => {
      this.tipText.setVisible(false);
    });
  }
  
  endEvent() {
    // Clean up event
    this.eventActive = false;
    this.stableTime = 0;
    
    // Hide timer
    this.eventTimerText.setVisible(false);
    if (this.eventCountdown) {
      this.eventCountdown.remove();
    }
    
    // Clear choices with animation
    this.tweens.add({
      targets: this.wordContainer,
      alpha: 0,
      y: 50,
      duration: 300,
      onComplete: () => {
        this.clearWordChoices();
      }
    });
    
    // Reset player typing
    this.player.resetTyping();
    
    // Schedule next event
    this.scheduleNextEvent();
  }
  
  addCompletionEffect(word) {
    // Add a visual effect when a choice is successful
    const effect = this.add.text(this.player.text.x, this.player.text.y - 20, '✅ ' + word, { 
      fontSize: '32px',
      stroke: '#000000',
      strokeThickness: 4
    });
    effect.setOrigin(0.5);
    
    // Animate it
    this.tweens.add({
      targets: effect,
      y: effect.y - 80,
      alpha: 0,
      scale: 1.5,
      duration: 1000,
      onComplete: () => {
        effect.destroy();
      }
    });
  }
  
  playSoundEffect(soundEmoji, x, y) {
    // Create a visual "sound" effect using an emoji
    const effect = this.add.text(x, y, soundEmoji.text, { fontSize: '48px' });
    effect.setOrigin(0.5);
    
    // Animate it
    this.tweens.add({
      targets: effect,
      y: y - 50,
      alpha: 0,
      duration: 800,
      onComplete: () => {
        effect.destroy();
      }
    });
  }
  
  endGame() {
    this.gameOver = true;
    
    // Clean up any active events
    if (this.eventTimer) {
      this.eventTimer.remove();
    }
    if (this.eventCountdown) {
      this.eventCountdown.remove();
    }
    
    // Add a final effect
    this.cameras.main.shake(500, 0.05);
    
    // Transition to game over scene after a short delay
    this.time.delayedCall(1000, () => {
      this.scene.start('GameOverScene', { score: this.score });
    });
  }
} 