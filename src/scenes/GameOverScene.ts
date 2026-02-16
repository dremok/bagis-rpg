import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, TOTAL_FENOMEN } from '../data/constants';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(data: { won: boolean; fenomen: number }) {
    const won = data.won;
    const fenomen = data.fenomen;

    if (won) {
      this.cameras.main.setBackgroundColor('#0a0a2a');

      const title = this.add.text(GAME_WIDTH / 2, 120, 'SEGER!', {
        fontSize: '64px',
        color: '#ffdd44',
        fontFamily: 'monospace',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 6,
      });
      title.setOrigin(0.5, 0.5);

      this.tweens.add({
        targets: title,
        scaleX: 1.1,
        scaleY: 1.1,
        yoyo: true,
        repeat: -1,
        duration: 1000,
      });

      const msg = this.add.text(GAME_WIDTH / 2, 220, [
        'Maskinen är förstörd.',
        'Mänskligheten andas ut.',
        'Cirkeln tystnar... för nu.',
        '',
        `Fenomen samlade: ${fenomen} / ${TOTAL_FENOMEN}`,
      ], {
        fontSize: '18px',
        color: '#aaccff',
        fontFamily: 'monospace',
        align: 'center',
        lineSpacing: 8,
        stroke: '#000000',
        strokeThickness: 3,
      });
      msg.setOrigin(0.5, 0.5);

      // Victory particles
      for (let i = 0; i < 30; i++) {
        const star = this.add.rectangle(
          Math.random() * GAME_WIDTH,
          Math.random() * GAME_HEIGHT,
          4, 4,
          0xffdd44,
          0.7
        );
        this.tweens.add({
          targets: star,
          y: star.y - 200,
          alpha: 0,
          duration: 2000 + Math.random() * 2000,
          repeat: -1,
          delay: Math.random() * 2000,
        });
      }
    } else {
      this.cameras.main.setBackgroundColor('#1a0a0a');

      const title = this.add.text(GAME_WIDTH / 2, 120, 'GAME OVER', {
        fontSize: '56px',
        color: '#ff3344',
        fontFamily: 'monospace',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 6,
      });
      title.setOrigin(0.5, 0.5);

      const msg = this.add.text(GAME_WIDTH / 2, 220, [
        'Bagarmossen förlorade sin hjälte.',
        'Becknarna regerar gatorna.',
        '',
        `Fenomen samlade: ${fenomen} / ${TOTAL_FENOMEN}`,
      ], {
        fontSize: '18px',
        color: '#cc8888',
        fontFamily: 'monospace',
        align: 'center',
        lineSpacing: 8,
        stroke: '#000000',
        strokeThickness: 3,
      });
      msg.setOrigin(0.5, 0.5);
    }

    // Restart prompt
    const restart = this.add.text(GAME_WIDTH / 2, 420, 'Tryck MELLANSLAG för att spela igen', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 3,
    });
    restart.setOrigin(0.5, 0.5);

    this.tweens.add({
      targets: restart,
      alpha: 0.3,
      yoyo: true,
      repeat: -1,
      duration: 600,
    });

    const menu = this.add.text(GAME_WIDTH / 2, 470, 'Tryck ESC för titelskärmen', {
      fontSize: '14px',
      color: '#888888',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 2,
    });
    menu.setOrigin(0.5, 0.5);

    this.input.keyboard!.once('keydown-SPACE', () => {
      this.scene.start('GameScene');
    });

    this.input.keyboard!.once('keydown-ESC', () => {
      this.scene.start('TitleScene');
    });
  }
}
