import Phaser from 'phaser';
import {
  BECKNARE_SPEED,
  BECKNARE_CHASE_SPEED,
  BECKNARE_DETECTION_RANGE,
  BECKNARE_ATTACK_RANGE,
  BECKNARE_ATTACK_DAMAGE,
  BECKNARE_ATTACK_COOLDOWN,
  BECKNARE_HP,
  BECKNARE_SIZE,
  COLORS,
  TILE_SIZE,
} from '../data/constants';

type BecknareState = 'patrol' | 'chase' | 'attack' | 'dead';

export class Becknare {
  scene: Phaser.Scene;
  sprite: Phaser.GameObjects.Container;
  body: Phaser.GameObjects.Rectangle;
  hp: number = BECKNARE_HP;
  state: BecknareState = 'patrol';
  patrolOrigin: { x: number; y: number };
  patrolTarget: { x: number; y: number };
  lastAttackTime: number = 0;
  isDead: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.patrolOrigin = { x, y };
    this.patrolTarget = this.getNewPatrolTarget();

    // Body
    this.body = scene.add.rectangle(0, 0, BECKNARE_SIZE, BECKNARE_SIZE, COLORS.BECKNARE);
    this.body.setStrokeStyle(2, 0x881111);

    // Gucci cap (gold)
    const cap = scene.add.rectangle(0, -10, BECKNARE_SIZE + 4, 6, COLORS.BECKNARE_CAP);
    const capBrim = scene.add.rectangle(4, -7, 10, 3, COLORS.BECKNARE_CAP);

    // Angry eyes
    const leftEye = scene.add.rectangle(-4, -2, 4, 3, 0xffffff);
    const rightEye = scene.add.rectangle(4, -2, 4, 3, 0xffffff);
    const leftPupil = scene.add.rectangle(-4, -2, 2, 3, 0x000000);
    const rightPupil = scene.add.rectangle(4, -2, 2, 3, 0x000000);

    this.sprite = scene.add.container(x, y, [
      this.body, cap, capBrim, leftEye, rightEye, leftPupil, rightPupil,
    ]);
    scene.physics.add.existing(this.sprite);

    const physBody = this.sprite.body as Phaser.Physics.Arcade.Body;
    physBody.setSize(BECKNARE_SIZE, BECKNARE_SIZE);
    physBody.setOffset(-BECKNARE_SIZE / 2, -BECKNARE_SIZE / 2);
    physBody.setCollideWorldBounds(true);
  }

  getPhysicsBody(): Phaser.Physics.Arcade.Body {
    return this.sprite.body as Phaser.Physics.Arcade.Body;
  }

  private getNewPatrolTarget(): { x: number; y: number } {
    const angle = Math.random() * Math.PI * 2;
    const dist = 50 + Math.random() * 80;
    return {
      x: this.patrolOrigin.x + Math.cos(angle) * dist,
      y: this.patrolOrigin.y + Math.sin(angle) * dist,
    };
  }

  update(playerX: number, playerY: number): { attacked: boolean; damage: number } {
    if (this.isDead) return { attacked: false, damage: 0 };

    const dx = playerX - this.sprite.x;
    const dy = playerY - this.sprite.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const physBody = this.getPhysicsBody();

    // State transitions
    if (dist < BECKNARE_ATTACK_RANGE) {
      this.state = 'attack';
    } else if (dist < BECKNARE_DETECTION_RANGE) {
      this.state = 'chase';
    } else {
      this.state = 'patrol';
    }

    switch (this.state) {
      case 'patrol': {
        const ptDx = this.patrolTarget.x - this.sprite.x;
        const ptDy = this.patrolTarget.y - this.sprite.y;
        const ptDist = Math.sqrt(ptDx * ptDx + ptDy * ptDy);

        if (ptDist < 10) {
          this.patrolTarget = this.getNewPatrolTarget();
        } else {
          physBody.setVelocity(
            (ptDx / ptDist) * BECKNARE_SPEED,
            (ptDy / ptDist) * BECKNARE_SPEED,
          );
        }
        break;
      }

      case 'chase': {
        const ndx = dx / dist;
        const ndy = dy / dist;
        physBody.setVelocity(
          ndx * BECKNARE_CHASE_SPEED,
          ndy * BECKNARE_CHASE_SPEED,
        );
        break;
      }

      case 'attack': {
        physBody.setVelocity(0, 0);
        const now = this.scene.time.now;
        if (now - this.lastAttackTime >= BECKNARE_ATTACK_COOLDOWN) {
          this.lastAttackTime = now;

          // Attack flash
          this.scene.tweens.add({
            targets: this.body,
            fillColor: 0xff6666,
            yoyo: true,
            duration: 100,
          });

          return { attacked: true, damage: BECKNARE_ATTACK_DAMAGE };
        }
        break;
      }
    }

    return { attacked: false, damage: 0 };
  }

  takeDamage(amount: number): boolean {
    this.hp -= amount;

    // Hit flash
    this.scene.tweens.add({
      targets: this.body,
      alpha: 0.3,
      yoyo: true,
      duration: 80,
      repeat: 1,
    });

    if (this.hp <= 0) {
      this.die();
      return true;
    }
    return false;
  }

  die() {
    this.isDead = true;
    const physBody = this.getPhysicsBody();
    physBody.setVelocity(0, 0);
    physBody.setEnable(false);

    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      scaleX: 0,
      scaleY: 0,
      duration: 300,
      onComplete: () => {
        this.sprite.destroy();
      },
    });
  }

  get x(): number { return this.sprite.x; }
  get y(): number { return this.sprite.y; }
}
