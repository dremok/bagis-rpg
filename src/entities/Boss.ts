import Phaser from 'phaser';
import {
  BOSS_HP,
  BOSS_SIZE,
  BOSS_SPEED,
  BOSS_CHASE_SPEED,
  BOSS_DETECTION_RANGE,
  BOSS_ATTACK_DAMAGE,
  BOSS_ATTACK_COOLDOWN,
  COLORS,
} from '../data/constants';

type BossState = 'idle' | 'chase' | 'attack' | 'special' | 'dead';

export class Boss {
  scene: Phaser.Scene;
  sprite: Phaser.GameObjects.Container;
  body: Phaser.GameObjects.Rectangle;
  hp: number = BOSS_HP;
  maxHp: number = BOSS_HP;
  state: BossState = 'idle';
  lastAttackTime: number = 0;
  lastSpecialTime: number = 0;
  isDead: boolean = false;
  isActive: boolean = false;
  eye: Phaser.GameObjects.Rectangle;
  glowEffect: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;

    // Main body -- ominous purple mass
    this.body = scene.add.rectangle(0, 0, BOSS_SIZE, BOSS_SIZE, COLORS.BOSS);
    this.body.setStrokeStyle(3, 0xaa44cc);

    // Pulsating core
    this.glowEffect = scene.add.rectangle(0, 0, BOSS_SIZE - 8, BOSS_SIZE - 8, 0xaa00dd, 0.5);

    // Central eye
    this.eye = scene.add.rectangle(0, -4, 16, 10, COLORS.BOSS_EYE);
    const pupil = scene.add.rectangle(0, -4, 6, 10, 0x000000);

    // "Circuit" lines
    const line1 = scene.add.rectangle(-12, 12, 24, 2, 0xcc44ff);
    const line2 = scene.add.rectangle(0, 16, 2, 12, 0xcc44ff);
    const line3 = scene.add.rectangle(12, 8, 2, 16, 0xcc44ff);

    this.sprite = scene.add.container(x, y, [
      this.glowEffect, this.body, line1, line2, line3, this.eye, pupil,
    ]);
    this.sprite.setVisible(false);

    scene.physics.add.existing(this.sprite);
    const physBody = this.sprite.body as Phaser.Physics.Arcade.Body;
    physBody.setSize(BOSS_SIZE, BOSS_SIZE);
    physBody.setOffset(-BOSS_SIZE / 2, -BOSS_SIZE / 2);
    physBody.setCollideWorldBounds(true);
    physBody.setEnable(false);
  }

  activate() {
    this.isActive = true;
    this.sprite.setVisible(true);
    const physBody = this.sprite.body as Phaser.Physics.Arcade.Body;
    physBody.setEnable(true);

    // Dramatic entrance
    this.sprite.setScale(0);
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 1,
      scaleY: 1,
      duration: 1000,
      ease: 'Back.easeOut',
    });

    // Start pulsating
    this.scene.tweens.add({
      targets: this.glowEffect,
      alpha: 0.2,
      scaleX: 1.3,
      scaleY: 1.3,
      yoyo: true,
      repeat: -1,
      duration: 800,
    });
  }

  getPhysicsBody(): Phaser.Physics.Arcade.Body {
    return this.sprite.body as Phaser.Physics.Arcade.Body;
  }

  update(playerX: number, playerY: number): { attacked: boolean; damage: number; special: boolean } {
    if (!this.isActive || this.isDead) return { attacked: false, damage: 0, special: false };

    const dx = playerX - this.sprite.x;
    const dy = playerY - this.sprite.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const physBody = this.getPhysicsBody();
    const now = this.scene.time.now;

    // Eye tracks player
    const eyeOffsetX = Math.min(4, Math.max(-4, dx / 20));
    this.eye.setPosition(eyeOffsetX, -4);

    // State transitions
    if (dist < 50) {
      this.state = 'attack';
    } else if (dist < BOSS_DETECTION_RANGE) {
      this.state = 'chase';
    } else {
      this.state = 'idle';
    }

    // Special attack every 5 seconds
    if (now - this.lastSpecialTime > 5000 && dist < BOSS_DETECTION_RANGE) {
      this.lastSpecialTime = now;
      this.doSpecialAttack(playerX, playerY);
      return { attacked: false, damage: 0, special: true };
    }

    switch (this.state) {
      case 'chase': {
        const ndx = dx / dist;
        const ndy = dy / dist;
        physBody.setVelocity(ndx * BOSS_CHASE_SPEED, ndy * BOSS_CHASE_SPEED);
        break;
      }

      case 'attack': {
        physBody.setVelocity(0, 0);
        if (now - this.lastAttackTime >= BOSS_ATTACK_COOLDOWN) {
          this.lastAttackTime = now;

          this.scene.tweens.add({
            targets: this.body,
            fillColor: 0xff0066,
            yoyo: true,
            duration: 150,
          });

          return { attacked: true, damage: BOSS_ATTACK_DAMAGE, special: false };
        }
        break;
      }

      case 'idle': {
        // Slowly drift around
        const angle = now / 2000;
        physBody.setVelocity(
          Math.cos(angle) * BOSS_SPEED * 0.5,
          Math.sin(angle) * BOSS_SPEED * 0.5,
        );
        break;
      }
    }

    return { attacked: false, damage: 0, special: false };
  }

  private doSpecialAttack(playerX: number, playerY: number) {
    // Spawn shockwave visual
    const ring = this.scene.add.circle(this.sprite.x, this.sprite.y, 10, 0xcc44ff, 0.6);
    ring.setStrokeStyle(3, 0xff66ff);

    this.scene.tweens.add({
      targets: ring,
      radius: 120,
      alpha: 0,
      duration: 600,
      onComplete: () => ring.destroy(),
    });

    // Spawn projectiles in 8 directions
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const proj = this.scene.add.rectangle(
        this.sprite.x, this.sprite.y, 8, 8, 0xff44cc
      );

      this.scene.tweens.add({
        targets: proj,
        x: this.sprite.x + Math.cos(angle) * 200,
        y: this.sprite.y + Math.sin(angle) * 200,
        alpha: 0,
        duration: 800,
        onComplete: () => proj.destroy(),
      });
    }
  }

  takeDamage(amount: number): boolean {
    this.hp -= amount;

    // Boss hit flash
    this.scene.tweens.add({
      targets: this.body,
      alpha: 0.4,
      yoyo: true,
      duration: 100,
      repeat: 2,
    });

    // Screen shake
    this.scene.cameras.main.shake(100, 0.005);

    if (this.hp <= 0) {
      this.die();
      return true;
    }
    return false;
  }

  die() {
    this.isDead = true;
    this.isActive = false;
    const physBody = this.getPhysicsBody();
    physBody.setVelocity(0, 0);
    physBody.setEnable(false);

    // Dramatic death
    this.scene.cameras.main.shake(500, 0.01);

    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      angle: 360,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => {
        this.sprite.destroy();
      },
    });
  }

  get x(): number { return this.sprite.x; }
  get y(): number { return this.sprite.y; }
}
