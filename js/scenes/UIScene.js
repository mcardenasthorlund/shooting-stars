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

    // ---- Botón de cambio de arma (abajo, a la derecha del inventario) ----
    this.weaponSwitchBtn = this.add.container(340, H - 30);
    const wsRect = this.add.rectangle(0, 0, 150, 34, 0x1a2340, 1).setStrokeStyle(1, 0x4dd4ff, 1);
    const wsText = this.add.text(0, 0, 'CAMBIAR ARMA', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#c8d2ea',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);
    this.weaponSwitchBtn.add([wsRect, wsText]);
    this.weaponSwitchBtn.setSize(150, 34);
    this.weaponSwitchBtn.setInteractive({ useHandCursor: true });
    this.weaponSwitchBtn.on('pointerover', () => {
      wsRect.setFillStyle(0x2a3a5a, 1);
      wsText.setColor('#ffffff');
    });
    this.weaponSwitchBtn.on('pointerout', () => {
      wsRect.setFillStyle(0x1a2340, 1);
      wsText.setColor('#c8d2ea');
    });
    this.weaponSwitchBtn.on('pointerdown', (pointer, localX, localY, event) => {
      event.stopPropagation();
      if (this.game.sfx) this.game.sfx.click();
      this.openWeaponSwitch();
    });
    this.weaponSwitchBtn.setVisible(false);

    // ---- Contador de puntos (abajo a la derecha) ----
    this.scoreText = this.add.text(W - 20, H - 40, 'PUNTOS: 0', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ffd93b',
      fontStyle: 'bold',
    }).setOrigin(1, 0);

    // ---- Modo ADMIN oculto: 5 toques rápidos sobre la zona de puntos lo activan ----
    this.adminTaps = 0;
    this.adminTapWindow = 0;
    this.adminZone = this.add.rectangle(W - 90, H - 45, 180, 80, 0xffffff, 0)
      .setInteractive();
    this.adminZone.on('pointerdown', (pointer, localX, localY, event) => {
      event.stopPropagation();
      const now = this.time.now;
      if (now - this.adminTapWindow > 1500) this.adminTaps = 0;
      this.adminTapWindow = now;
      this.adminTaps++;
      if (this.adminTaps >= 5) {
        this.adminTaps = 0;
        this.openAdmin();
      }
    });

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

    // ---- Nivel de dificultad (justo debajo de la fase) ----
    // selectedDifficulty se guarda como multiplicador numérico
    const selMult = this.game.selectedDifficulty || 1;
    let diffLabel = 'MEDIO';
    for (const key in CFG.DIFFICULTIES) {
      if (Math.abs(CFG.DIFFICULTIES[key].mult - selMult) < 0.001) {
        diffLabel = CFG.DIFFICULTIES[key].label;
        break;
      }
    }
    this.diffText = this.add.text(W / 2, 42, 'DIFICULTAD: ' + diffLabel, {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#ffd93b',
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

    // ---- Barra de vida del BOSS FINAL (arriba a la derecha) ----
    this.finalBossBack = this.add.rectangle(W - 20, 20, 190, 18, 0x1a2340).setOrigin(1, 0);
    this.finalBossBack.setVisible(false);
    this.finalBossFill = this.add.graphics();
    this.finalBossFill.setVisible(false);
    this.finalBossLabel = this.add.text(W - 20, 40, '', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#ffd93b',
      fontStyle: 'bold',
    }).setOrigin(1, 0);
    this.finalBossLabel.setVisible(false);
    this.finalBossBarVisible = false;

    const gameScene = this.scene.get('GameScene');
    if (gameScene) {
      gameScene.events.on('player-hurt', this.setHealth, this);
      gameScene.events.on('enemy-killed', this.onEnemyKilled, this);
      gameScene.events.on('boss-hurt', this.setBossHealth, this);
      gameScene.events.on('boss-spawned', this.showBossBar, this);
      gameScene.events.on('wave-started', this.setWave, this);
      gameScene.events.on('inventory-changed', this.setInventory, this);
      gameScene.events.on('ammo-changed', this.setAmmo, this);
      gameScene.events.on('final-boss-spawned', this.showFinalBossBar, this);
      gameScene.events.on('final-boss-hurt', this.setFinalBossHealth, this);
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
    // usa la vida real del BOSS (crece con cada oleada según la dificultad)
    const boss = this.scene.get('GameScene').spawner.boss;
    const max = (boss && boss.maxLife) || CFG.BOSS_LIFE;
    this.setBossHealth(max, max);
  }

  showFinalBossBar() {
    this.finalBossBarVisible = true;
    this.finalBossBack.setVisible(true);
    this.finalBossFill.setVisible(true);
    this.finalBossLabel.setVisible(true);
    this.setFinalBossHealth(CFG.FINAL_BOSS_LIFE);
  }

  setFinalBossHealth(life) {
    const max = CFG.FINAL_BOSS_LIFE;
    if (life <= 0) {
      this.finalBossBarVisible = false;
      this.finalBossBack.setVisible(false);
      this.finalBossFill.setVisible(false);
      this.finalBossLabel.setVisible(false);
      return;
    }
    const pct = Phaser.Math.Clamp(life / max, 0, 1);
    this.finalBossFill.clear();
    this.finalBossFill.fillStyle(0xffd93b, 1);
    this.finalBossFill.fillRect(CFG.WIDTH - 208, 21, 188 * pct, 16);
    this.finalBossLabel.setText('BOSS FINAL ' + Math.ceil(life) + '/' + max);
  }

  setBossHealth(life, max = CFG.BOSS_LIFE) {
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

    // muestra el botón de cambio de arma solo si hay más de una arma comprada.
    // Durante el boss final, si NO es EXTREMO, las armas están confiscadas (solo
    // BLASTER), así que el botón se oculta; en EXTREMO se conserva.
    const owned = this.game.ownedWeapons || [CFG.DEFAULT_WEAPON];
    const weaponsConfiscated = !!game.finalBossActive && !game.isExtremeRun;
    if (owned.length > 1 && !weaponsConfiscated) {
      this.weaponSwitchBtn.setVisible(!this.weaponWin);
    } else {
      this.weaponSwitchBtn.setVisible(false);
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

    const hint = this.add.text(W / 2, H / 2 + 40, 'Pulsa ENTER para reiniciar', {
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

    // botón VOLVER: hay que hacer click en él (no se quita la pantalla con un click cualquiera)
    const backBtn = this.add.rectangle(W / 2, H / 2 + 100, 200, 46, 0x1a2340).setStrokeStyle(2, 0x4dd4ff, 1).setInteractive({ useHandCursor: true });
    const backText = this.add.text(W / 2, H / 2 + 100, 'VOLVER', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#4dd4ff',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);
    backBtn.on('pointerover', () => {
      backBtn.setFillStyle(0x2a3a5a, 1);
      backText.setColor('#ffffff');
    });
    backBtn.on('pointerout', () => {
      backBtn.setFillStyle(0x1a2340, 1);
      backText.setColor('#4dd4ff');
    });
    backBtn.on('pointerdown', () => this.restart());

    this.input.keyboard.once('keydown-ENTER', this.restart, this);
  }

  restart() {
    this.scene.stop('UIScene');
    this.scene.stop('GameScene');
    this.scene.start('BootScene');
  }

  // abre la ventana de cambio de arma: pausa la partida y muestra las armas
  // compradas en cajas para poder equipar una
  openWeaponSwitch() {
    if (this.weaponWin) return;
    const game = this.scene.get('GameScene');
    if (!game) return;
    const W = CFG.WIDTH, H = CFG.HEIGHT;

    // pausa el juego y bloquea el disparo mientras la ventana está abierta
    game.setUILocked(true);
    game.scene.pause();

    this.weaponWin = this.add.container(0, 0);
    this.weaponWin.setDepth(50);

    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x05070f, 0.8).setInteractive();
    const winW = 700, winH = 300;
    const winBg = this.add.rectangle(W / 2, H / 2, winW, winH, 0x0d1424, 1).setStrokeStyle(2, 0x4dd4ff, 1);
    const title = this.add.text(W / 2, H / 2 - winH / 2 + 28, 'CAMBIAR ARMA', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);

    const owned = this.game.ownedWeapons || [CFG.DEFAULT_WEAPON];
    const sorted = owned.slice().sort((a, b) => CFG.WEAPONS[a].cost - CFG.WEAPONS[b].cost);
    const current = this.game.equippedWeapon || CFG.DEFAULT_WEAPON;

    const boxW = 110, boxH = 130, gap = 24;
    const totalW = sorted.length * boxW + (sorted.length - 1) * gap;
    const startX = W / 2 - totalW / 2 + boxW / 2;
    const y = H / 2 + 10;

    this.weaponWin.add([overlay, winBg, title]);

    sorted.forEach((key, i) => {
      const w = CFG.WEAPONS[key];
      const x = startX + i * (boxW + gap);
      const box = this.add.container(x, y);
      const rect = this.add.rectangle(0, 0, boxW, boxH, 0x1a2340, 1)
        .setStrokeStyle(2, key === current ? 0x39ff6e : 0x4a6a9a, 1)
        .setInteractive({ useHandCursor: true });

      let icon = null;
      if (w.img && this.textures.exists(w.img)) {
        const src = this.textures.get(w.img).getSourceImage();
        const maxW = boxW - 16, maxH = boxH - 55;
        const scale = Math.min(maxW / src.width, maxH / src.height);
        icon = this.add.image(0, -18, w.img).setScale(scale);
      }

      const label = this.add.text(0, 42, w.label, {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#ffd93b',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: boxW - 8 },
      }).setOrigin(0.5, 0.5);

      let equipTag = null;
      if (key === current) {
        equipTag = this.add.text(0, 58, 'EQUIPADA', {
          fontFamily: 'monospace',
          fontSize: '10px',
          color: '#39ff6e',
          fontStyle: 'bold',
        }).setOrigin(0.5, 0.5);
      }

      box.add([rect, icon, label, equipTag].filter(Boolean));
      box.setSize(boxW, boxH);
      rect.on('pointerover', () => rect.setFillStyle(0x2a3a5a, 1));
      rect.on('pointerout', () => rect.setFillStyle(0x1a2340, 1));
      rect.on('pointerdown', (pointer, lx, ly, event) => {
        event.stopPropagation();
        if (this.game.sfx) this.game.sfx.click();
        this.doWeaponSwitch(key);
      });
      this.weaponWin.add(box);
    });

    const closeBtn = this.add.container(W / 2, H / 2 + winH / 2 - 25);
    const closeRect = this.add.rectangle(0, 0, 140, 36, 0x1a2338, 1).setStrokeStyle(1, 0xff5a5a, 1);
    const closeText = this.add.text(0, 0, 'CERRAR', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#c8d2ea',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);
    closeBtn.add([closeRect, closeText]);
    closeBtn.setSize(140, 36);
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.on('pointerover', () => {
      closeRect.setFillStyle(0x2a3a5a, 1);
      closeText.setColor('#ffffff');
    });
    closeBtn.on('pointerout', () => {
      closeRect.setFillStyle(0x1a2338, 1);
      closeText.setColor('#c8d2ea');
    });
    closeBtn.on('pointerdown', (pointer, localX, localY, event) => {
      event.stopPropagation();
      if (this.game.sfx) this.game.sfx.click();
      this.closeWeaponSwitch();
    });
    this.weaponWin.add(closeBtn);
  }

  // equipa el arma seleccionada y cierra la ventana
  doWeaponSwitch(key) {
    const game = this.scene.get('GameScene');
    if (game) game.equipWeapon(key);
    this.closeWeaponSwitch();
  }

  // cierra la ventana, reanuda la partida y desbloquea el disparo
  closeWeaponSwitch() {
    if (!this.weaponWin) return;
    this.weaponWin.destroy();
    this.weaponWin = null;
    const game = this.scene.get('GameScene');
    if (game) {
      game.setUILocked(false);
      if (game.scene.isPaused()) game.scene.resume();
    }
  }

  // abre el Modo ADMIN: pausa la partida y muestra un botón por cada comando especial
  openAdmin() {
    if (this.adminWin) return;
    const game = this.scene.get('GameScene');
    if (!game) return;
    const W = CFG.WIDTH, H = CFG.HEIGHT;

    // pausa el juego y bloquea el disparo mientras la ventana está abierta
    game.setUILocked(true);
    game.scene.pause();

    this.adminWin = this.add.container(0, 0);
    this.adminWin.setDepth(60);

    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x05070f, 0.85).setInteractive();
    const winW = 500, winH = 380;
    const winBg = this.add.rectangle(W / 2, H / 2, winW, winH, 0x0d1424, 1).setStrokeStyle(2, 0xffd93b, 1);
    const title = this.add.text(W / 2, H / 2 - winH / 2 + 28, 'MODO ADMIN', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#ffd93b',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);
    this.adminWin.add([overlay, winBg, title]);

    // comandos especiales ya implementados en el juego
    const commands = [
      { label: 'INVOCAR BOSS', action: () => game.spawner.spawnBoss() },
      { label: 'GAME OVER', action: () => game.endGame() },
      { label: 'ENEMIGO VARIANTE', action: () => game.spawner.spawnVariantEnemy() },
      { label: 'OBTENER POWER UP', action: () => game.powerUpSystem.spawnRandom() },
      { label: 'VICTORIA BOSS', action: () => game.triggerVictory() },
      { label: '+10000 PUNTOS', action: () => {
        game.scoreSystem.add(10000);
        game.events.emit('enemy-killed', 10000);
      } },
      { label: 'INICIAR BOSS FINAL', action: () => game.startFinalBoss() },
      { label: 'ELIMINAR BOSS FINAL', action: () => game.forceFinalVictory() },
    ];

    const btnW = 220, btnH = 40, gap = 14;
    const startY = H / 2 - 100;
    commands.forEach((cmd, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = W / 2 - btnW / 2 - gap / 2 + col * (btnW + gap);
      const y = startY + row * (btnH + gap);
      const btn = this.add.container(x, y);
      const rect = this.add.rectangle(0, 0, btnW, btnH, 0x1a2340, 1)
        .setStrokeStyle(1, 0x4dd4ff, 1)
        .setInteractive({ useHandCursor: true });
      const text = this.add.text(0, 0, cmd.label, {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#c8d2ea',
        fontStyle: 'bold',
      }).setOrigin(0.5, 0.5);
      btn.add([rect, text]);
      btn.setSize(btnW, btnH);
      rect.on('pointerover', () => rect.setFillStyle(0x2a3a5a, 1));
      rect.on('pointerout', () => rect.setFillStyle(0x1a2340, 1));
      rect.on('pointerdown', (pointer, lx, ly, event) => {
        event.stopPropagation();
        if (this.game.sfx) this.game.sfx.click();
        cmd.action();
        this.closeAdmin();
      });
      this.adminWin.add(btn);
    });

    const closeBtn = this.add.container(W / 2, H / 2 + winH / 2 - 28);
    const closeRect = this.add.rectangle(0, 0, 140, 34, 0x1a2338, 1)
      .setStrokeStyle(1, 0xff5a5a, 1)
      .setInteractive({ useHandCursor: true });
    const closeText = this.add.text(0, 0, 'CERRAR', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#c8d2ea',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);
    closeBtn.add([closeRect, closeText]);
    closeBtn.setSize(140, 34);
    closeRect.on('pointerover', () => closeRect.setFillStyle(0x2a3a5a, 1));
    closeRect.on('pointerout', () => closeRect.setFillStyle(0x1a2338, 1));
    closeRect.on('pointerdown', (pointer, lx, ly, event) => {
      event.stopPropagation();
      if (this.game.sfx) this.game.sfx.click();
      this.closeAdmin();
    });
    this.adminWin.add(closeBtn);
  }

  // cierra el Modo ADMIN, reanuda la partida y desbloquea el disparo
  closeAdmin() {
    if (!this.adminWin) return;
    this.adminWin.destroy();
    this.adminWin = null;
    const game = this.scene.get('GameScene');
    if (game) {
      game.setUILocked(false);
      if (game.scene.isPaused()) game.scene.resume();
    }
  }
}