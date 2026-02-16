import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../data/constants';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    // Background
    this.cameras.main.setBackgroundColor('#0a1a0a');

    // Decorative trees
    const graphics = this.add.graphics();
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * GAME_WIDTH;
      const y = 200 + Math.random() * 400;
      graphics.fillStyle(COLORS.TREE_TRUNK);
      graphics.fillRect(x + 4, y + 8, 4, 10);
      graphics.fillStyle(COLORS.TREE_TOP, 0.3 + Math.random() * 0.3);
      graphics.fillRect(x, y, 12, 12);
    }

    // Title
    const title = this.add.text(GAME_WIDTH / 2, 120, 'BAGIS RPG', {
      fontSize: '64px',
      color: '#ffdd44',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6,
    });
    title.setOrigin(0.5, 0.5);

    // Subtitle
    const subtitle = this.add.text(GAME_WIDTH / 2, 180, 'En Zelda-hyllning i Bagarmossen', {
      fontSize: '18px',
      color: '#88aa88',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 3,
    });
    subtitle.setOrigin(0.5, 0.5);

    // Flavor text
    const flavor = this.add.text(GAME_WIDTH / 2, 240, [
      'Bekämpa becknare i Gucci-kepsar.',
      'Samla intressanta fenomen i skogen.',
      'Mata WhatsApp-gruppen tills den vaknar.',
    ], {
      fontSize: '14px',
      color: '#668866',
      fontFamily: 'monospace',
      align: 'center',
      lineSpacing: 8,
      stroke: '#000000',
      strokeThickness: 2,
    });
    flavor.setOrigin(0.5, 0.5);

    // Controls info
    const controls = this.add.text(GAME_WIDTH / 2, 360, [
      'KONTROLLER:',
      '',
      'WASD / Piltangenter — Gå',
      'MELLANSLAG — Attack',
      'E — Samla fenomen',
      'TAB — Öppna chatten',
    ], {
      fontSize: '14px',
      color: '#aaccaa',
      fontFamily: 'monospace',
      align: 'center',
      lineSpacing: 4,
      stroke: '#000000',
      strokeThickness: 2,
    });
    controls.setOrigin(0.5, 0.5);

    // Start prompt
    const startText = this.add.text(GAME_WIDTH / 2, 500, 'Tryck MELLANSLAG för att börja', {
      fontSize: '22px',
      color: '#ffdd44',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 4,
    });
    startText.setOrigin(0.5, 0.5);

    // Blink effect
    this.tweens.add({
      targets: startText,
      alpha: 0.3,
      yoyo: true,
      repeat: -1,
      duration: 600,
    });

    // Title float
    this.tweens.add({
      targets: title,
      y: 115,
      yoyo: true,
      repeat: -1,
      duration: 2000,
      ease: 'Sine.easeInOut',
    });

    // Start game on space
    this.input.keyboard!.once('keydown-SPACE', () => {
      this.cameras.main.fade(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        this.scene.start('GameScene');
      });
    });

    // Credit
    const credit = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 20, 'Skapad av Filosoficirkeln', {
      fontSize: '11px',
      color: '#446644',
      fontFamily: 'monospace',
    });
    credit.setOrigin(0.5, 0.5);
  }
}
