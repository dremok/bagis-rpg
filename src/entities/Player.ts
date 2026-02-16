import Phaser from 'phaser';
import {
  PLAYER_SPEED,
  PLAYER_MAX_HP,
  PLAYER_SIZE,
  PLAYER_ATTACK_COOLDOWN,
  PLAYER_INVULN_TIME,
  PLAYER_ATTACK_RANGE,
  PLAYER_ATTACK_DAMAGE,
  COLORS,
  TILE_SIZE,
} from '../data/constants';

export class Player {
  scene: Phaser.Scene;
  sprite: Phaser.GameObjects.Container;
  body: Phaser.GameObjects.Rectangle;
  hp: number = PLAYER_MAX_HP;
  maxHp: number = PLAYER_MAX_HP;
  facing: 'up' | 'down' | 'left' | 'right' = 'down';
  isAttacking: boolean = false;
  lastAttackTime: number = 0;
  isInvulnerable: boolean = false;
  attackHitbox: Phaser.GameObjects.Rectangle | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;

    // Body rectangle
    this.body = scene.add.rectangle(0, 0, PLAYER_SIZE, PLAYER_SIZE, COLORS.PLAYER);
    this.body.setStrokeStyle(2, 0x2266cc);

    // Hair
    const hair = scene.add.rectangle(0, -8, PLAYER_SIZE - 4, 8, COLORS.PLAYER_HAIR);

    // Eyes
    const leftEye = scene.add.rectangle(-4, -2, 3, 3, 0xffffff);
    const rightEye = scene.add.rectangle(4, -2, 3, 3, 0xffffff);

    this.sprite = scene.add.container(x, y, [this.body, hair, leftEye, rightEye]);
    scene.physics.add.existing(this.sprite);

    const physBody = this.sprite.body as Phaser.Physics.Arcade.Body;
    physBody.setSize(PLAYER_SIZE, PLAYER_SIZE);
    physBody.setOffset(-PLAYER_SIZE / 2, -PLAYER_SIZE / 2);
    physBody.setCollideWorldBounds(true);
  }

  getPhysicsBody(): Phaser.Physics.Arcade.Body {
    return this.sprite.body as Phaser.Physics.Arcade.Body;
  }

  update(cursors: Phaser.Types.Input.Keyboard.CursorKeys, wasd: Record<string, Phaser.Input.Keyboard.Key>) {
    const physBody = this.getPhysicsBody();
    let vx = 0;
    let vy = 0;

    if (cursors.left.isDown || wasd['A'].isDown) {
      vx = -PLAYER_SPEED;
      this.facing = 'left';
    } else if (cursors.right.isDown || wasd['D'].isDown) {
      vx = PLAYER_SPEED;
      this.facing = 'right';
    }

    if (cursors.up.isDown || wasd['W'].isDown) {
      vy = -PLAYER_SPEED;
      this.facing = 'up';
    } else if (cursors.down.isDown || wasd['S'].isDown) {
      vy = PLAYER_SPEED;
      this.facing = 'down';
    }

    // Normalize diagonal movement
    if (vx !== 0 && vy !== 0) {
      const factor = 1 / Math.SQRT2;
      vx *= factor;
      vy *= factor;
    }

    physBody.setVelocity(vx, vy);
  }

  attack(): Phaser.Geom.Rectangle | null {
    const now = this.scene.time.now;
    if (now - this.lastAttackTime < PLAYER_ATTACK_COOLDOWN) return null;

    this.lastAttackTime = now;
    this.isAttacking = true;

    // Calculate attack hitbox position based on facing
    let ax = this.sprite.x;
    let ay = this.sprite.y;
    let aw = PLAYER_SIZE;
    let ah = PLAYER_SIZE;

    switch (this.facing) {
      case 'up':
        ay -= PLAYER_ATTACK_RANGE;
        aw = PLAYER_SIZE + 8;
        ah = PLAYER_ATTACK_RANGE;
        break;
      case 'down':
        ay += PLAYER_SIZE / 2;
        aw = PLAYER_SIZE + 8;
        ah = PLAYER_ATTACK_RANGE;
        break;
      case 'left':
        ax -= PLAYER_ATTACK_RANGE;
        aw = PLAYER_ATTACK_RANGE;
        ah = PLAYER_SIZE + 8;
        break;
      case 'right':
        ax += PLAYER_SIZE / 2;
        aw = PLAYER_ATTACK_RANGE;
        ah = PLAYER_SIZE + 8;
        break;
    }

    // Show attack visual
    if (this.attackHitbox) this.attackHitbox.destroy();
    this.attackHitbox = this.scene.add.rectangle(
      ax, ay, aw, ah, 0xffffff, 0.4
    );
    this.attackHitbox.setOrigin(0.5, 0.5);

    // Remove after short delay
    this.scene.time.delayedCall(150, () => {
      if (this.attackHitbox) {
        this.attackHitbox.destroy();
        this.attackHitbox = null;
      }
      this.isAttacking = false;
    });

    return new Phaser.Geom.Rectangle(
      ax - aw / 2, ay - ah / 2, aw, ah
    );
  }

  takeDamage(amount: number): boolean {
    if (this.isInvulnerable) return false;

    this.hp = Math.max(0, this.hp - amount);
    this.isInvulnerable = true;

    // Flash effect
    this.scene.tweens.add({
      targets: this.body,
      alpha: 0.3,
      yoyo: true,
      repeat: 4,
      duration: 100,
    });

    this.scene.time.delayedCall(PLAYER_INVULN_TIME, () => {
      this.isInvulnerable = false;
      this.body.setAlpha(1);
    });

    return this.hp <= 0;
  }

  heal(amount: number) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  get x(): number { return this.sprite.x; }
  get y(): number { return this.sprite.y; }

  setPosition(x: number, y: number) {
    this.sprite.setPosition(x, y);
  }

  static getDamage(): number {
    return PLAYER_ATTACK_DAMAGE;
  }

  isNear(x: number, y: number, range: number): boolean {
    const dx = this.sprite.x - x;
    const dy = this.sprite.y - y;
    return Math.sqrt(dx * dx + dy * dy) < range;
  }
}
