export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    // Background
    this.add.rectangle(0, 0, 800, 600, 0x2c3e50).setOrigin(0, 0);

    // Title
    this.add.text(400, 100, '🤠 BUCK BRONCO 🐎', {
      fontSize: '48px',
      fontWeight: 'bold',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // Game description
    this.add.text(400, 180, 'React quickly to stay on the bronco!', {
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // Controls
    const controlsText = [
      '📝 HOW TO PLAY:',
      '',
      '⚡ When the bronco acts, choose your response!',
      '🔤 Type the FIRST LETTER or the FULL WORD of your choice',
      '⚖️ Each choice has different success rates and rewards',
      '',
      '🎯 GRIP - More stable but fewer points',
      '🎯 SHIFT/STEER - Riskier but higher points',
      '',
      '⏱️ REACT QUICKLY OR YOU\'LL FALL!'
    ];

    this.add.text(400, 300, controlsText, {
      fontSize: '22px',
      fill: '#ffffff',
      align: 'center',
      lineSpacing: 10
    }).setOrigin(0.5, 0);

    // Animated example of the QuickTime event
    this.animateQTEExample();

    // Start button
    const startButton = this.add.text(400, 520, '[ PRESS SPACE TO START ]', {
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    startButton.setInteractive();
    startButton.on('pointerover', () => {
      startButton.setStyle({ fill: '#ffdd00' });
    });
    startButton.on('pointerout', () => {
      startButton.setStyle({ fill: '#ffffff' });
    });

    // Space key to start game
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('GameScene');
    });
  }
  
  animateQTEExample() {
    // Container for the example
    const container = this.add.container(600, 200);
    
    // Create example words
    const word1 = this.add.text(-100, 0, 'GRIP', {
      fontSize: '24px',
      fill: '#3498db',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    const word2 = this.add.text(0, 0, 'DUCK', {
      fontSize: '24px',
      fill: '#e67e22',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    const word3 = this.add.text(100, 0, 'LEAN', {
      fontSize: '24px',
      fill: '#9b59b6',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    // Add timer
    const timer = this.add.text(0, 40, '3', {
      fontSize: '32px',
      fill: '#e74c3c',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    // Add example to container
    container.add([word1, word2, word3, timer]);
    
    // Animate the words pulsing
    this.tweens.add({
      targets: [word1, word2, word3],
      scale: 1.2,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
    
    // Animate the timer counting down
    this.tweens.add({
      targets: timer,
      scale: { from: 1, to: 1.5 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
      onYoyo: () => {
        const currentVal = parseInt(timer.text);
        timer.setText(currentVal > 1 ? (currentVal - 1).toString() : '3');
      }
    });
  }
  
  animateTitleBronco() {
    const bronco = this.add.text(200, 220, '🐎', { fontSize: '64px' });
    bronco.setOrigin(0.5);
    
    // Add cowboy
    const cowboy = this.add.text(200, 195, '🤠', { fontSize: '48px' });
    cowboy.setOrigin(0.5);
    
    // Animate them
    this.tweens.add({
      targets: [bronco, cowboy],
      y: '-=20',
      yoyo: true,
      duration: 500,
      repeat: -1
    });
  }
} 