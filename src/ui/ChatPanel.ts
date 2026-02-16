import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT, CHAT_MESSAGES } from '../data/constants';

interface ChatMessage {
  sender: string;
  text: string;
}

export class ChatPanel {
  scene: Phaser.Scene;
  container: Phaser.GameObjects.Container;
  isOpen: boolean = false;
  messages: ChatMessage[] = [];
  messageTexts: Phaser.GameObjects.Text[] = [];
  bg: Phaser.GameObjects.Rectangle;
  header: Phaser.GameObjects.Text;
  toggleBtn: Phaser.GameObjects.Container;
  scrollY: number = 0;
  panelWidth: number = 280;
  panelHeight: number = GAME_HEIGHT - 40;
  unreadCount: number = 0;
  unreadBadge: Phaser.GameObjects.Container;
  lastMessageCount: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.container = scene.add.container(GAME_WIDTH, 20);
    this.container.setScrollFactor(0);
    this.container.setDepth(150);

    // Panel background
    this.bg = scene.add.rectangle(
      -this.panelWidth / 2, this.panelHeight / 2,
      this.panelWidth, this.panelHeight,
      COLORS.CHAT_BG, 0.95
    );
    this.bg.setStrokeStyle(2, COLORS.CHAT_BORDER);
    this.container.add(this.bg);

    // Header
    this.header = scene.add.text(
      -this.panelWidth + 10, 10,
      'CIRKELN',
      {
        fontSize: '16px',
        color: '#25d366',
        fontFamily: 'monospace',
        fontStyle: 'bold',
      }
    );
    this.container.add(this.header);

    // Subtitle
    const subtitle = scene.add.text(
      -this.panelWidth + 10, 30,
      'WhatsApp-gruppen',
      {
        fontSize: '11px',
        color: '#668866',
        fontFamily: 'monospace',
      }
    );
    this.container.add(subtitle);

    // Separator line
    const sep = scene.add.rectangle(
      -this.panelWidth / 2, 50,
      this.panelWidth - 20, 1,
      COLORS.CHAT_BORDER, 0.5
    );
    this.container.add(sep);

    // Toggle button
    const btnBg = scene.add.rectangle(0, 0, 40, 80, COLORS.CHAT_BG, 0.9);
    btnBg.setStrokeStyle(2, COLORS.CHAT_BORDER);
    const btnIcon = scene.add.text(-6, -8, '💬', { fontSize: '16px' });

    this.toggleBtn = scene.add.container(-this.panelWidth - 25, this.panelHeight / 2, [btnBg, btnIcon]);
    this.container.add(this.toggleBtn);

    // Unread badge
    const badgeBg = scene.add.circle(0, 0, 10, 0xff3344);
    const badgeText = scene.add.text(0, 0, '0', {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    badgeText.setOrigin(0.5, 0.5);
    this.unreadBadge = scene.add.container(-this.panelWidth - 25, this.panelHeight / 2 - 30, [badgeBg, badgeText]);
    this.unreadBadge.setVisible(false);
    this.container.add(this.unreadBadge);

    // Make toggle clickable
    btnBg.setInteractive({ useHandCursor: true });
    btnBg.on('pointerdown', () => this.toggle());

    // Start closed
    this.container.setPosition(GAME_WIDTH + this.panelWidth, 20);

    // Add initial message
    this.addMessage(CHAT_MESSAGES[0].sender, CHAT_MESSAGES[0].text);
    this.lastMessageCount = 1;
  }

  toggle() {
    this.isOpen = !this.isOpen;
    const targetX = this.isOpen ? GAME_WIDTH : GAME_WIDTH + this.panelWidth;

    this.scene.tweens.add({
      targets: this.container,
      x: targetX,
      duration: 300,
      ease: 'Power2',
    });

    if (this.isOpen) {
      this.unreadCount = 0;
      this.unreadBadge.setVisible(false);
    }
  }

  updateMessages(fenomenCount: number) {
    // Add new messages based on fenomen count
    for (const msg of CHAT_MESSAGES) {
      if (msg.threshold <= fenomenCount && msg.threshold >= this.lastMessageCount) {
        if (msg.threshold > 0 || this.messages.length === 0) {
          this.addMessage(msg.sender, msg.text);
        }
      }
    }
    this.lastMessageCount = fenomenCount + 1;
  }

  private addMessage(sender: string, text: string) {
    // Avoid duplicates
    const exists = this.messages.some(m => m.sender === sender && m.text === text);
    if (exists) return;

    this.messages.push({ sender, text });

    const yPos = 60 + (this.messages.length - 1) * 55;
    const isWeird = sender === 'CIRKELN' || sender === 'MASKINEN';

    const senderText = this.scene.add.text(
      -this.panelWidth + 10, yPos,
      sender,
      {
        fontSize: '12px',
        color: isWeird ? '#ff4466' : '#25d366',
        fontFamily: 'monospace',
        fontStyle: 'bold',
      }
    );
    this.container.add(senderText);

    const msgText = this.scene.add.text(
      -this.panelWidth + 10, yPos + 16,
      text,
      {
        fontSize: '13px',
        color: isWeird ? '#ff8899' : '#cceecc',
        fontFamily: 'monospace',
        wordWrap: { width: this.panelWidth - 30 },
      }
    );
    this.container.add(msgText);
    this.messageTexts.push(msgText);

    // Increment unread if panel is closed
    if (!this.isOpen) {
      this.unreadCount++;
      this.unreadBadge.setVisible(true);
      const badgeText = this.unreadBadge.getAt(1) as Phaser.GameObjects.Text;
      badgeText.setText(String(this.unreadCount));
    }

    // Flash notification effect
    if (this.messages.length > 1) {
      const flash = this.scene.add.rectangle(
        -this.panelWidth / 2, yPos + 15,
        this.panelWidth, 40,
        isWeird ? 0xff0044 : 0x25d366, 0.3
      );
      this.container.add(flash);
      this.scene.tweens.add({
        targets: flash,
        alpha: 0,
        duration: 1000,
        onComplete: () => flash.destroy(),
      });
    }
  }
}
