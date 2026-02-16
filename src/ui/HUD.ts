import Phaser from 'phaser';
import { COLORS, PLAYER_MAX_HP, GAME_WIDTH, GAME_HEIGHT, TOTAL_FENOMEN } from '../data/constants';

export class HUD {
  scene: Phaser.Scene;
  container: Phaser.GameObjects.Container;
  hearts: Phaser.GameObjects.Rectangle[] = [];
  fenomenText: Phaser.GameObjects.Text;
  zoneText: Phaser.GameObjects.Text;
  bossHpBar: Phaser.GameObjects.Rectangle | null = null;
  bossHpBg: Phaser.GameObjects.Rectangle | null = null;
  bossLabel: Phaser.GameObjects.Text | null = null;
  interactPrompt: Phaser.GameObjects.Text;
  messagePopup: Phaser.GameObjects.Container | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(100);

    // Health hearts
    for (let i = 0; i < PLAYER_MAX_HP; i++) {
      const heart = scene.add.rectangle(
        20 + i * 28, 20, 20, 18, COLORS.HP_FULL
      );
      heart.setStrokeStyle(2, 0xffffff);
      this.hearts.push(heart);
      this.container.add(heart);
    }

    // Fenomen counter
    this.fenomenText = scene.add.text(20, 48, 'Fenomen: 0 / ' + TOTAL_FENOMEN, {
      fontSize: '16px',
      color: '#ffdd44',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 3,
    });
    this.container.add(this.fenomenText);

    // Zone indicator
    this.zoneText = scene.add.text(GAME_WIDTH - 20, 20, 'BAGARMOSSEN', {
      fontSize: '14px',
      color: '#aaccaa',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 3,
    });
    this.zoneText.setOrigin(1, 0);
    this.container.add(this.zoneText);

    // Interact prompt (hidden by default)
    this.interactPrompt = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 60, '', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 3,
      backgroundColor: '#000000aa',
      padding: { x: 8, y: 4 },
    });
    this.interactPrompt.setOrigin(0.5, 0.5);
    this.interactPrompt.setVisible(false);
    this.container.add(this.interactPrompt);

    // Controls help
    const controls = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 20, 'WASD: Gå | MELLANSLAG: Attack | E: Samla', {
      fontSize: '12px',
      color: '#888888',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 2,
    });
    controls.setOrigin(0.5, 0.5);
    this.container.add(controls);
  }

  updateHP(hp: number) {
    for (let i = 0; i < this.hearts.length; i++) {
      this.hearts[i].setFillStyle(i < hp ? COLORS.HP_FULL : COLORS.HP_EMPTY);
    }
  }

  updateFenomen(count: number) {
    this.fenomenText.setText(`Fenomen: ${count} / ${TOTAL_FENOMEN}`);
  }

  updateZone(zone: 'urban' | 'forest') {
    if (zone === 'urban') {
      this.zoneText.setText('BAGARMOSSEN');
      this.zoneText.setColor('#aaccaa');
    } else {
      this.zoneText.setText('NACKARESERVATET');
      this.zoneText.setColor('#66aa66');
    }
  }

  showInteractPrompt(text: string) {
    this.interactPrompt.setText(text);
    this.interactPrompt.setVisible(true);
  }

  hideInteractPrompt() {
    this.interactPrompt.setVisible(false);
  }

  showBossHP(hp: number, maxHp: number) {
    if (!this.bossHpBg) {
      this.bossLabel = this.scene.add.text(GAME_WIDTH / 2, 70, 'MASKINEN', {
        fontSize: '18px',
        color: '#cc44ff',
        fontFamily: 'monospace',
        stroke: '#000000',
        strokeThickness: 3,
      });
      this.bossLabel.setOrigin(0.5, 0.5);
      this.container.add(this.bossLabel);

      this.bossHpBg = this.scene.add.rectangle(GAME_WIDTH / 2, 90, 300, 16, 0x330033);
      this.bossHpBg.setStrokeStyle(2, 0xcc44ff);
      this.container.add(this.bossHpBg);

      this.bossHpBar = this.scene.add.rectangle(
        GAME_WIDTH / 2 - 148, 90, 296, 12, 0xaa00cc
      );
      this.bossHpBar.setOrigin(0, 0.5);
      this.container.add(this.bossHpBar);
    }

    if (this.bossHpBar) {
      const pct = Math.max(0, hp / maxHp);
      this.bossHpBar.setDisplaySize(296 * pct, 12);
    }
  }

  hideBossHP() {
    if (this.bossHpBg) {
      this.bossHpBg.destroy();
      this.bossHpBg = null;
    }
    if (this.bossHpBar) {
      this.bossHpBar.destroy();
      this.bossHpBar = null;
    }
    if (this.bossLabel) {
      this.bossLabel.destroy();
      this.bossLabel = null;
    }
  }

  showMessage(text: string, duration: number = 3000) {
    if (this.messagePopup) {
      this.messagePopup.destroy();
    }

    const bg = this.scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 500, 60, 0x000000, 0.8);
    bg.setStrokeStyle(2, 0xffdd44);

    const msg = this.scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, text, {
      fontSize: '18px',
      color: '#ffdd44',
      fontFamily: 'monospace',
      align: 'center',
      wordWrap: { width: 480 },
    });
    msg.setOrigin(0.5, 0.5);

    this.messagePopup = this.scene.add.container(0, 0, [bg, msg]);
    this.messagePopup.setScrollFactor(0);
    this.messagePopup.setDepth(200);

    this.scene.time.delayedCall(duration, () => {
      if (this.messagePopup) {
        this.scene.tweens.add({
          targets: this.messagePopup,
          alpha: 0,
          duration: 500,
          onComplete: () => {
            this.messagePopup?.destroy();
            this.messagePopup = null;
          },
        });
      }
    });
  }
}
