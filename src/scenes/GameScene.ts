import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Becknare } from '../entities/Becknare';
import { Boss } from '../entities/Boss';
import { Fenomen } from '../entities/Fenomen';
import { HUD } from '../ui/HUD';
import { ChatPanel } from '../ui/ChatPanel';
import { generateMap, TileType } from '../data/map-generator';
import {
  TILE_SIZE,
  WORLD_WIDTH,
  WORLD_HEIGHT,
  GAME_WIDTH,
  GAME_HEIGHT,
  COLORS,
  URBAN_END_COL,
  TOTAL_FENOMEN,
  FENOMEN_NAMES,
  PLAYER_ATTACK_DAMAGE,
  BOSS_HP,
} from '../data/constants';

export class GameScene extends Phaser.Scene {
  player!: Player;
  becknare: Becknare[] = [];
  boss!: Boss;
  fenomen: Fenomen[] = [];
  hud!: HUD;
  chatPanel!: ChatPanel;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  spaceKey!: Phaser.Input.Keyboard.Key;
  eKey!: Phaser.Input.Keyboard.Key;
  tabKey!: Phaser.Input.Keyboard.Key;
  collisionLayer!: Phaser.Physics.Arcade.StaticGroup;
  fenomenCollected: number = 0;
  bossSpawned: boolean = false;
  gameOver: boolean = false;
  gameWon: boolean = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    const mapData = generateMap();

    // Set world bounds
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // Create collision group
    this.collisionLayer = this.physics.add.staticGroup();

    // Render map tiles
    this.renderMap(mapData.tiles);

    // Create collision bodies
    this.createCollisions(mapData.collisions);

    // Create player
    const px = mapData.playerStart.col * TILE_SIZE + TILE_SIZE / 2;
    const py = mapData.playerStart.row * TILE_SIZE + TILE_SIZE / 2;
    this.player = new Player(this, px, py);

    // Set up camera
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08);
    this.cameras.main.setZoom(1);

    // Add collision between player and walls
    this.physics.add.collider(this.player.sprite, this.collisionLayer);

    // Create fenomen
    for (let i = 0; i < mapData.fenomenPositions.length; i++) {
      const pos = mapData.fenomenPositions[i];
      const fx = pos.col * TILE_SIZE + TILE_SIZE / 2;
      const fy = pos.row * TILE_SIZE + TILE_SIZE / 2;
      const name = FENOMEN_NAMES[i] || `Fenomen ${i + 1}`;
      const f = new Fenomen(this, fx, fy, name, i);
      this.fenomen.push(f);
    }

    // Create becknare
    for (const pos of mapData.becknarePositions) {
      const bx = pos.col * TILE_SIZE + TILE_SIZE / 2;
      const by = pos.row * TILE_SIZE + TILE_SIZE / 2;
      const b = new Becknare(this, bx, by);
      this.becknare.push(b);
      this.physics.add.collider(b.sprite, this.collisionLayer);
    }

    // Create boss (initially hidden)
    const bossX = mapData.bossSpawn.col * TILE_SIZE + TILE_SIZE / 2;
    const bossY = mapData.bossSpawn.row * TILE_SIZE + TILE_SIZE / 2;
    this.boss = new Boss(this, bossX, bossY);

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as Record<string, Phaser.Input.Keyboard.Key>;
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.eKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.tabKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);

    // Prevent tab from leaving the game
    this.tabKey.on('down', (event: KeyboardEvent) => {
      event.preventDefault();
    });

    // UI
    this.hud = new HUD(this);
    this.chatPanel = new ChatPanel(this);

    // Welcome message
    this.hud.showMessage('Välkommen till Bagarmossen. Samla fenomenen!', 4000);
  }

  private renderMap(tiles: TileType[][]) {
    const graphics = this.add.graphics();
    graphics.setDepth(-1);

    for (let r = 0; r < tiles.length; r++) {
      for (let c = 0; c < tiles[r].length; c++) {
        const x = c * TILE_SIZE;
        const y = r * TILE_SIZE;
        const tile = tiles[r][c];

        switch (tile) {
          case TileType.GRASS:
            graphics.fillStyle(COLORS.GRASS);
            graphics.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            // Add slight variation
            if ((r + c) % 7 === 0) {
              graphics.fillStyle(0x528a47, 0.4);
              graphics.fillRect(x + 8, y + 12, 4, 4);
            }
            break;

          case TileType.GRASS_DARK:
            graphics.fillStyle(COLORS.GRASS_DARK);
            graphics.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            if ((r * 3 + c) % 5 === 0) {
              graphics.fillStyle(0x2d4a22, 0.5);
              graphics.fillRect(x + 4, y + 8, 3, 3);
            }
            break;

          case TileType.ROAD:
            graphics.fillStyle(COLORS.ROAD);
            graphics.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            // Road markings
            if (c % 4 === 0) {
              graphics.fillStyle(COLORS.ROAD_LIGHT, 0.3);
              graphics.fillRect(x + 12, y + 14, 8, 4);
            }
            break;

          case TileType.BUILDING:
            // Wall
            graphics.fillStyle(COLORS.BUILDING);
            graphics.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            // Wall detail
            graphics.fillStyle(COLORS.BUILDING_WALL);
            graphics.fillRect(x, y, TILE_SIZE, 3);
            // Window
            if ((r + c) % 3 === 0) {
              graphics.fillStyle(0x88aacc, 0.6);
              graphics.fillRect(x + 8, y + 10, 12, 14);
              graphics.fillStyle(COLORS.BUILDING_WALL);
              graphics.fillRect(x + 13, y + 10, 2, 14);
              graphics.fillRect(x + 8, y + 16, 12, 2);
            }
            break;

          case TileType.BUILDING_DOOR:
            graphics.fillStyle(COLORS.BUILDING);
            graphics.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            // Door
            graphics.fillStyle(0x664422);
            graphics.fillRect(x + 8, y + 4, 16, 24);
            graphics.fillStyle(0xddaa44);
            graphics.fillRect(x + 20, y + 16, 3, 3); // Knob
            break;

          case TileType.TREE:
            // Ground beneath
            graphics.fillStyle(c < URBAN_END_COL ? COLORS.GRASS : COLORS.GRASS_DARK);
            graphics.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            // Trunk
            graphics.fillStyle(COLORS.TREE_TRUNK);
            graphics.fillRect(x + 12, y + 18, 8, 14);
            // Canopy
            graphics.fillStyle(COLORS.TREE_TOP);
            graphics.fillRect(x + 2, y + 2, 28, 20);
            graphics.fillStyle(COLORS.TREE_TOP_LIGHT);
            graphics.fillRect(x + 6, y + 4, 12, 8);
            break;

          case TileType.WATER:
            graphics.fillStyle(COLORS.WATER);
            graphics.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            // Wave highlight
            graphics.fillStyle(0x5588cc, 0.3);
            graphics.fillRect(x + 4, y + 8 + (r % 3) * 4, 16, 2);
            break;

          case TileType.FENCE:
            graphics.fillStyle(c < URBAN_END_COL ? COLORS.GRASS : COLORS.GRASS_DARK);
            graphics.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            graphics.fillStyle(COLORS.FENCE);
            graphics.fillRect(x + 2, y + 10, 28, 4);
            graphics.fillRect(x + 6, y + 4, 4, 20);
            graphics.fillRect(x + 22, y + 4, 4, 20);
            break;

          case TileType.PATH:
            graphics.fillStyle(COLORS.PATH, 0.7);
            graphics.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            // Path texture
            graphics.fillStyle(COLORS.GRASS_DARK, 0.3);
            if ((r + c) % 3 === 0) {
              graphics.fillRect(x + 10, y + 14, 6, 4);
            }
            break;
        }
      }
    }

    // Zone divider visual -- tree line between urban and forest
    for (let r = 0; r < tiles.length; r++) {
      if (tiles[r][URBAN_END_COL] !== TileType.ROAD && tiles[r][URBAN_END_COL] !== TileType.PATH) {
        const x = URBAN_END_COL * TILE_SIZE;
        const y = r * TILE_SIZE;
        graphics.fillStyle(COLORS.TREE_TOP, 0.6);
        graphics.fillRect(x - 4, y, 8, TILE_SIZE);
      }
    }
  }

  private createCollisions(collisions: boolean[][]) {
    for (let r = 0; r < collisions.length; r++) {
      for (let c = 0; c < collisions[r].length; c++) {
        if (collisions[r][c]) {
          const x = c * TILE_SIZE + TILE_SIZE / 2;
          const y = r * TILE_SIZE + TILE_SIZE / 2;
          const wall = this.add.rectangle(x, y, TILE_SIZE, TILE_SIZE);
          wall.setVisible(false);
          this.physics.add.existing(wall, true);
          this.collisionLayer.add(wall);
        }
      }
    }
  }

  update() {
    if (this.gameOver || this.gameWon) return;

    // Player movement
    this.player.update(this.cursors, this.wasd);

    // Attack
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      const hitbox = this.player.attack();
      if (hitbox) {
        this.checkAttackHits(hitbox);
      }
    }

    // Interact (collect fenomen)
    this.checkFenomenProximity();
    if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
      this.collectNearbyFenomen();
    }

    // Toggle chat
    if (Phaser.Input.Keyboard.JustDown(this.tabKey)) {
      this.chatPanel.toggle();
    }

    // Update enemies
    for (const b of this.becknare) {
      if (b.isDead) continue;
      const result = b.update(this.player.x, this.player.y);
      if (result.attacked) {
        const dead = this.player.takeDamage(result.damage);
        this.hud.updateHP(this.player.hp);
        if (dead) {
          this.handleGameOver();
          return;
        }
      }
    }

    // Update boss
    if (this.boss.isActive && !this.boss.isDead) {
      const result = this.boss.update(this.player.x, this.player.y);
      if (result.attacked) {
        const dead = this.player.takeDamage(result.damage);
        this.hud.updateHP(this.player.hp);
        if (dead) {
          this.handleGameOver();
          return;
        }
      }
      if (result.special) {
        // Check if player is in shockwave range
        if (this.player.isNear(this.boss.x, this.boss.y, 120)) {
          const dead = this.player.takeDamage(1);
          this.hud.updateHP(this.player.hp);
          if (dead) {
            this.handleGameOver();
            return;
          }
        }
      }
      this.hud.showBossHP(this.boss.hp, this.boss.maxHp);
    }

    // Update zone indicator
    const playerTileCol = Math.floor(this.player.x / TILE_SIZE);
    this.hud.updateZone(playerTileCol < URBAN_END_COL ? 'urban' : 'forest');
  }

  private checkAttackHits(hitbox: Phaser.Geom.Rectangle) {
    // Check becknare
    for (const b of this.becknare) {
      if (b.isDead) continue;
      const bRect = new Phaser.Geom.Rectangle(
        b.x - 12, b.y - 12, 24, 24
      );
      if (Phaser.Geom.Rectangle.Overlaps(hitbox, bRect)) {
        const killed = b.takeDamage(PLAYER_ATTACK_DAMAGE);
        if (killed) {
          // Small chance to drop health
          if (Math.random() < 0.3) {
            this.player.heal(1);
            this.hud.updateHP(this.player.hp);
            this.hud.showMessage('+1 HP', 1000);
          }
        }
      }
    }

    // Check boss
    if (this.boss.isActive && !this.boss.isDead) {
      const bossRect = new Phaser.Geom.Rectangle(
        this.boss.x - 24, this.boss.y - 24, 48, 48
      );
      if (Phaser.Geom.Rectangle.Overlaps(hitbox, bossRect)) {
        const killed = this.boss.takeDamage(PLAYER_ATTACK_DAMAGE);
        if (killed) {
          this.handleVictory();
        }
      }
    }
  }

  private checkFenomenProximity() {
    let nearFenomen = false;
    for (const f of this.fenomen) {
      if (f.collected) continue;
      if (this.player.isNear(f.x, f.y, 50)) {
        nearFenomen = true;
        this.hud.showInteractPrompt(`[E] Samla: ${f.name}`);
        break;
      }
    }
    if (!nearFenomen) {
      this.hud.hideInteractPrompt();
    }
  }

  private collectNearbyFenomen() {
    for (const f of this.fenomen) {
      if (f.collected) continue;
      if (this.player.isNear(f.x, f.y, 50)) {
        f.collect();
        this.fenomenCollected++;
        this.hud.updateFenomen(this.fenomenCollected);
        this.hud.showMessage(`Fenomen upptäckt: "${f.name}"`, 2500);

        // Update chat
        this.chatPanel.updateMessages(this.fenomenCollected);

        // Check if all fenomen collected -> spawn boss
        if (this.fenomenCollected >= TOTAL_FENOMEN && !this.bossSpawned) {
          this.spawnBoss();
        }
        break;
      }
    }
  }

  private spawnBoss() {
    this.bossSpawned = true;
    this.cameras.main.shake(1000, 0.008);
    this.hud.showMessage('MASKINEN VAKNAR... Den vill förgöra mänskligheten!', 5000);

    this.time.delayedCall(2000, () => {
      this.boss.activate();

      // Camera pan to boss then back
      const camX = this.cameras.main.scrollX;
      const camY = this.cameras.main.scrollY;

      this.cameras.main.stopFollow();
      this.cameras.main.pan(this.boss.x, this.boss.y, 1500, 'Power2');

      this.time.delayedCall(3000, () => {
        this.cameras.main.pan(this.player.x, this.player.y, 800, 'Power2');
        this.time.delayedCall(1000, () => {
          this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08);
        });
      });
    });
  }

  private handleGameOver() {
    this.gameOver = true;
    this.player.getPhysicsBody().setVelocity(0, 0);

    this.cameras.main.fade(1500, 0, 0, 0);

    this.time.delayedCall(1500, () => {
      this.scene.start('GameOverScene', { won: false, fenomen: this.fenomenCollected });
    });
  }

  private handleVictory() {
    this.gameWon = true;
    this.player.getPhysicsBody().setVelocity(0, 0);
    this.hud.hideBossHP();

    this.cameras.main.flash(2000, 255, 255, 255);
    this.hud.showMessage('MASKINEN ÄR BESEGRAD! Mänskligheten är räddad.', 5000);

    this.time.delayedCall(4000, () => {
      this.cameras.main.fade(2000, 255, 255, 255);
      this.time.delayedCall(2000, () => {
        this.scene.start('GameOverScene', { won: true, fenomen: this.fenomenCollected });
      });
    });
  }
}
