class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
  }

  create(data) {
    const { WIDTH: W, HEIGHT: H } = CFG;

    // ---- Barra de vida (arriba a la izquierda) ----
    this.add.text(20, 20, 'VIDA', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#9aa7c8',
    });
    this.healthBack = this.add.rectangle(20, 38, 190, 18, 0x1a2340).setOrigin(0, 0);
    this.healthFill = this.add.graphics();
    this.healthNum = this.add.text(25, 40, '100', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
    });

    // ---- Barra de escudo (superpuesta a la barra de vida) ----
    this.shieldFill = this.add.graphics();
    this.shieldFill.setVisible(false);

    // ---- Inventario de power ups (3 huecos abajo a la izquierda) ----
    this.slots = [];
    for (let i = 0; i < CFG.INVENTORY_SIZE; i++) {
      const x = 70 + i * 58;
      const y = H - 70;
      const back = this.add.rectangle(x, y, 50, 50, 0x1a2340).setOrigin(0.5, 0.5);
      back.setInteractive({ useHandCursor: true });
      back.on('pointerdown', () => {
        const game = this.scene.get('GameScene');
        if (game) game.activateSlot(i);
      });
      this.add.text(x, y, String(i + 1), {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#9aa7c8',
      }).setOrigin(0.5, 0.5).setY(y - 20);
      const icon = this.add.text(x, y + 2, '', {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#ffffff',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: 44 },
      }).setOrigin(0.5, 0.5);
      const image = this.add.image(x, y + 2, 'powerup_bigboy_img')
        .setDisplaySize(46, 46)
        .setVisible(false);
      this.slots.push({ back, icon, image });
    }

    // contador de granadas restantes (a la derecha del inventario de power ups)
    this.grenadeText = this.add.text(70 + CFG.INVENTORY_SIZE * 58 + 20, H - 70, '', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ffb347',
      fontStyle: 'bold',
      align: 'left',
    }).setOrigin(0, 0.5);
    this.grenadeText.setVisible(false);

    // contador de balas del cargador (REVOLVER) junto al inventario
    this.ammoText = this.add.text(70 + CFG.INVENTORY_SIZE * 58 + 20, H - 95, '', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffd93b',
      fontStyle: 'bold',
      align: 'left',
    }).setOrigin(0, 0.5);
    this.ammoText.setVisible(false);

    // ---- Contador de puntos (abajo a la derecha) ----
    this.scoreText = this.add.text(W - 20, H - 40, 'PUNTOS: 0', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ffd93b',
      fontStyle: 'bold',
    }).setOrigin(1, 0);

    // ---- Versión del juego (abajo a la izquierda) ----
    this.add.text(10, H - 10, 'v' + CFG.VERSION, {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#6a7aa8',
    }).setOrigin(0, 1);

    // ---- Indicador de fase (arriba centro) ----
    this.waveText = this.add.text(W / 2, 20, 'FASE 1', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#39ff6e',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    // ---- Barra de vida del BOSS (arriba a la derecha) ----
    this.bossBack = this.add.rectangle(W - 20, 20, 190, 18, 0x1a2340).setOrigin(1, 0);
    this.bossBack.setVisible(false);
    this.bossFill = this.add.graphics();
    this.bossFill.setVisible(false);
    this.bossLabel = this.add.text(W - 20, 40, '', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#ff5a5a',
      fontStyle: 'bold',
    }).setOrigin(1, 0);
    this.bossLabel.setVisible(false);
    this.bossBarVisible = false;

    const gameScene = this.scene.get('GameScene');
    if (gameScene) {
      gameScene.events.on('player-hurt', this.setHealth, this);
      gameScene.events.on('enemy-killed', this.onEnemyKilled, this);
      gameScene.events.on('boss-hurt', this.setBossHealth, this);
      gameScene.events.on('boss-spawned', this.showBossBar, this);
      gameScene.events.on('wave-started', this.setWave, this);
      gameScene.events.on('inventory-changed', this.setInventory, this);
      gameScene.events.on('ammo-changed', this.setAmmo, this);
    }
    this.setInventory([]);

    // game over -> muestra resultado final
    if (data && data.gameOver) {
      this.showGameOver(data.score);
    }
  }

  setHealth(health) {
    const pct = Phaser.Math.Clamp(health / CFG.MAX_HEALTH, 0, 1);
    const fillColor = pct > 0.5 ? 0x39ff6e : pct > 0.2 ? 0xffd93b : 0xff5a5a;
    this.healthFill.clear();
    this.healthFill.fillStyle(fillColor, 1);
    this.healthFill.fillRect(21, 39, 188 * pct, 16);
    this.healthNum.setText(Math.round(health));

    // barra de escudo superpuesta a la derecha de la vida
    const game = this.scene.get('GameScene');
    const shield = game && game.player ? game.player.shield : 0;
    this.shieldFill.clear();
    if (shield > 0) {
      const shieldPct = Phaser.Math.Clamp(shield / CFG.RIOT_SHIELD_AMOUNT, 0, 1);
      this.shieldFill.setVisible(true);
      this.shieldFill.fillStyle(0x4dd4ff, 1);
      this.shieldFill.fillRect(21 + 188 * pct, 39, 188 * shieldPct, 16);
    } else {
      this.shieldFill.setVisible(false);
    }
  }

  setInventory(inventory) {
    for (let i = 0; i < this.slots.length; i++) {
      const slot = this.slots[i];
      const type = inventory[i];
      if (type) {
        const meta = CFG.POWER_UPS[type];
        slot.back.setFillStyle(meta.color, 0.25);
        if (meta.img) {
          slot.image.setVisible(true);
          slot.image.setTexture(meta.img);
          slot.icon.setText('');
        } else {
          slot.image.setVisible(false);
          slot.icon.setText(meta.label);
          slot.icon.setColor('#' + meta.color.toString(16).padStart(6, '0'));
        }
      } else {
        slot.back.setFillStyle(0x1a2340, 1);
        slot.image.setVisible(false);
        slot.icon.setText('');
      }
    }
  }

  onEnemyKilled(points) {
    const game = this.scene.get('GameScene');
    if (game) this.scoreText.setText('PUNTOS: ' + game.scoreSystem.score);
  }

  setAmmo(data) {
    if (!data || data.max <= 0) {
      this.ammoText.setVisible(false);
      return;
    }
    if (data.reloading) {
      this.ammoText.setText('RECARGANDO...');
      this.ammoText.setColor('#ff5a5a');
    } else {
      this.ammoText.setText('BALAS: ' + data.current + '/' + data.max);
      this.ammoText.setColor('#ffd93b');
    }
    this.ammoText.setVisible(true);
  }

  setWave(wave) {
    this.waveText.setText('FASE ' + wave);
    this.tweens.add({ targets: this.waveText, scale: { from: 1.6, to: 1 }, duration: 500, ease: 'Back.easeOut' });
  }

  showBossBar() {
    this.bossBarVisible = true;
    this.bossBack.setVisible(true);
    this.bossFill.setVisible(true);
    this.bossLabel.setVisible(true);
    this.setBossHealth(CFG.BOSS_LIFE);
  }

  setBossHealth(life) {
    const max = CFG.BOSS_LIFE;
    if (life <= 0) {
      this.bossBarVisible = false;
      this.bossBack.setVisible(false);
      this.bossFill.setVisible(false);
      this.bossLabel.setVisible(false);
      return;
    }
    const pct = Phaser.Math.Clamp(life / max, 0, 1);
    this.bossFill.clear();
    this.bossFill.fillStyle(0xff5a5a, 1);
    this.bossFill.fillRect(CFG.WIDTH - 208, 21, 188 * pct, 16);
    this.bossLabel.setText('BOSS ' + Math.ceil(life) + '/' + max);
  }

  update() {
    const game = this.scene.get('GameScene');
    if (!game || !game.player) return;
    this.setHealth(game.player.health);
    this.scoreText.setText('PUNTOS: ' + game.scoreSystem.score);

    // contador de granadas restantes en el modo GRANADE
    const grenades = game.grenadeShotsLeft || 0;
    if (grenades > 0) {
      this.grenadeText.setText('GRANADAS: ' + grenades);
      this.grenadeText.setVisible(true);
    } else {
      this.grenadeText.setVisible(false);
    }
  }

  showGameOver(score) {
    this.tweens.killAll();
    const W = CFG.WIDTH, H = CFG.HEIGHT;
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.6);

    const isNewRecord = this.game.records.submit(score);

    const title = this.add.text(W / 2, H / 2 - 70, 'GAME OVER', {
      fontFamily: 'monospace',
      fontSize: '44px',
      color: '#ff5a5a',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);

    const pts = this.add.text(W / 2, H / 2 + 10, 'Puntos finales: ' + score, {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: '#ffd93b',
    }).setOrigin(0.5, 0.5);

    if (isNewRecord) {
      this.add.text(W / 2, H / 2 + 45, '¡NUEVO RÉCORD!', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#39ff6e',
        fontStyle: 'bold',
      }).setOrigin(0.5, 0.5);
    }

    this.add.text(W / 2, H / 2 + 90, 'Mejor récord: ' + this.game.records.highScore, {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#9aa7c8',
    }).setOrigin(0.5, 0.5);

    const hint = this.add.text(W / 2, H / 2 + 70, 'Pulsa ENTER o toca la pantalla para reiniciar', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5, 0.5);
    this.tweens.add({
      targets: hint,
      alpha: 0.2,
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    this.input.keyboard.once('keydown-ENTER', this.restart, this);
    this.input.once('pointerdown', this.restart, this);
  }

  restart() {
    this.scene.stop('UIScene');
    this.scene.stop('GameScene');
    this.scene.start('BootScene');
  }
}