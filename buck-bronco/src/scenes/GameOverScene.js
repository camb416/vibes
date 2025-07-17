export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.score = data.score || 0;
  }

  create() {
    // Background
    this.add.rectangle(0, 0, 800, 600, 0x2c3e50).setOrigin(0, 0);

    // Game over text
    this.add.text(400, 150, 'GAME OVER', {
      fontSize: '64px',
      fontWeight: 'bold',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // Sad emoji
    this.add.text(400, 250, '😢', {
      fontSize: '64px'
    }).setOrigin(0.5);

    // Score
    this.add.text(400, 330, `SCORE: ${this.score}`, {
      fontSize: '32px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // Play again button
    const playAgainButton = this.add.text(400, 420, '[ PLAY AGAIN ]', {
      fontSize: '28px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // Return to title button
    const titleButton = this.add.text(400, 480, '[ RETURN TO TITLE ]', {
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // Make buttons interactive
    playAgainButton.setInteractive();
    titleButton.setInteractive();

    // Button hover effects
    playAgainButton.on('pointerover', () => {
      playAgainButton.setStyle({ fill: '#ffdd00' });
    });
    playAgainButton.on('pointerout', () => {
      playAgainButton.setStyle({ fill: '#ffffff' });
    });

    titleButton.on('pointerover', () => {
      titleButton.setStyle({ fill: '#ffdd00' });
    });
    titleButton.on('pointerout', () => {
      titleButton.setStyle({ fill: '#ffffff' });
    });

    // Button click handlers
    playAgainButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    titleButton.on('pointerdown', () => {
      this.scene.start('TitleScene');
    });

    // Keyboard shortcuts
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('GameScene');
    });

    this.input.keyboard.once('keydown-ESC', () => {
      this.scene.start('TitleScene');
    });
  }
} 