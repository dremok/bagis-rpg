import Phaser from 'phaser';
import { FENOMEN_SIZE, COLORS } from '../data/constants';

export class Fenomen {
  scene: Phaser.Scene;
  sprite: Phaser.GameObjects.Container;
  collected: boolean = false;
  name: string;
  index: number;

  constructor(scene: Phaser.Scene, x: number, y: number, name: string, index: number) {
    this.scene = scene;
    this.name = name;
    this.index = index;

    // Glowing orb
    const glow = scene.add.circle(0, 0, FENOMEN_SIZE, COLORS.FENOMEN_GLOW, 0.3);
    const core = scene.add.circle(0, 0, FENOMEN_SIZE / 2, COLORS.FENOMEN);
    const inner = scene.add.circle(0, 0, FENOMEN_SIZE / 4, 0xffffff, 0.8);

    // Sparkle particles (simple rectangles)
    const sparkle1 = scene.add.rectangle(-6, -8, 3, 3, 0xffffff, 0.7);
    const sparkle2 = scene.add.rectangle(7, -5, 2, 2, 0xffffff, 0.5);
    const sparkle3 = scene.add.rectangle(-4, 7, 2, 2, 0xffffff, 0.6);

    this.sprite = scene.add.container(x, y, [
      glow, core, inner, sparkle1, sparkle2, sparkle3,
    ]);

    scene.physics.add.existing(this.sprite);
    const physBody = this.sprite.body as Phaser.Physics.Arcade.Body;
    physBody.setSize(FENOMEN_SIZE * 2, FENOMEN_SIZE * 2);
    physBody.setOffset(-FENOMEN_SIZE, -FENOMEN_SIZE);
    physBody.setImmovable(true);

    // Float animation
    scene.tweens.add({
      targets: this.sprite,
      y: y - 6,
      yoyo: true,
      repeat: -1,
      duration: 1200,
      ease: 'Sine.easeInOut',
    });

    // Glow pulse
    scene.tweens.add({
      targets: glow,
      alpha: 0.1,
      scaleX: 1.5,
      scaleY: 1.5,
      yoyo: true,
      repeat: -1,
      duration: 800,
    });

    // Sparkle animation
    [sparkle1, sparkle2, sparkle3].forEach((s, i) => {
      scene.tweens.add({
        targets: s,
        alpha: 0,
        yoyo: true,
        repeat: -1,
        duration: 400 + i * 200,
        delay: i * 150,
      });
    });
  }

  collect() {
    if (this.collected) return;
    this.collected = true;

    const physBody = this.sprite.body as Phaser.Physics.Arcade.Body;
    physBody.setEnable(false);

    // Collect effect
    this.scene.tweens.add({
      targets: this.sprite,
      y: this.sprite.y - 40,
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        this.sprite.destroy();
      },
    });
  }

  get x(): number { return this.sprite.x; }
  get y(): number { return this.sprite.y; }
}
