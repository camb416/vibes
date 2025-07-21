import Phaser from 'phaser';
import { config } from './config';
import { GameScene } from './scenes/GameScene';
import { TitleScene } from './scenes/TitleScene';
import { GameOverScene } from './scenes/GameOverScene';

// Create game instance
const game = new Phaser.Game(config);

// Add scenes
game.scene.add('TitleScene', TitleScene);
game.scene.add('GameScene', GameScene);
game.scene.add('GameOverScene', GameOverScene);

// Start with title screen
game.scene.start('TitleScene'); 