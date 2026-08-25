class ShopScene extends Phaser.Scene {
  constructor() {
    super('ShopScene');
    this.selectedWeapon = null;
  }

  create(data) {
    const { WIDTH: W, HEIGHT: H } = CFG;
    this.pendingScore = data && data.score != null ? data.score : null;

    // fondo oscuro que cubre toda la pantalla
    this.overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x05070f, 0.94);

    this.buildMenu();
    this.buildShop();
    this.showMenu();
  }

  get gameScene() {
    return this.scene.get('GameScene');
  }

  makeButton(container, x, y, w, h, label, color, callback) {
    const rect = this.add.rectangle(x, y, w, h, color).setInteractive({ useHandCursor: true });
    rect.setOrigin(0.5);
    rect.on('pointerdown', callback);
    rect.on('pointerover', () => rect.setFillStyle(color, 0.7));
    rect.on('pointerout', () => rect.setFillStyle(color, 1));
    const txt = this.add.text(x, y, label, {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    if (container) container.add([rect, txt]);
    return rect;
  }

  // ---- Menú de victoria del BOSS: SHOP / CONTINUE / SURRENDER ----
  buildMenu() {
    const { WIDTH: W } = CFG;
    this.menu = this.add.container(0, 0);

    const title = this.add.text(W / 2, 130, 'BOSS DERROTADO', {
      fontFamily: 'monospace',
      fontSize: '38px',
      color: '#ffd93b',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);

    const sub = this.add.text(W / 2, 175, 'Elige una opción', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#c8d2ea',
    }).setOrigin(0.5, 0.5);

    this.menu.add([title, sub]);
    this.makeButton(this.menu, W / 2, 275, 300, 54, 'SHOP — IR A LA TIENDA', 0x2a5a8a, () => this.showShop());
    this.makeButton(this.menu, W / 2, 350, 300, 54, 'CONTINUE — CONTINUAR', 0x2a8a4a, () => this.continueGame());
    this.makeButton(this.menu, W / 2, 425, 300, 54, 'SURRENDER — IRSE AL MENÚ', 0x8a2a2a, () => this.surrender());
  }

  showMenu() {
    this.menu.setVisible(true);
    this.shop.setVisible(false);
  }

  // ---- Tienda a pantalla completa ----
  buildShop() {
    const { WIDTH: W, HEIGHT: H } = CFG;
    this.shop = this.add.container(0, 0);

    const title = this.add.text(30, 30, 'TIENDA', {
      fontFamily: 'monospace',
      fontSize: '30px',
      color: '#ffd93b',
      fontStyle: 'bold',
    });

    this.pointsText = this.add.text(W - 30, 30, '', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#39ff6e',
      fontStyle: 'bold',
    }).setOrigin(1, 0);

    this.equipText = this.add.text(30, 75, '', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold',
    });

    this.shop.add([title, this.pointsText, this.equipText]);

    // columna izquierda con las armas a la venta
    const buyable = Object.keys(CFG.WEAPONS).filter((k) => CFG.WEAPONS[k].cost > 0);
    this.weaponBtns = {};
    buyable.forEach((key, i) => {
      const w = CFG.WEAPONS[key];
      const x = 120;
      const y = 150 + i * 80;
      const btn = this.makeButton(this.shop, x, y, 200, 62, w.label + '\n' + w.cost + ' PTS', 0x2a3a5a, () => this.selectWeapon(key));
      this.weaponBtns[key] = btn;
    });

    // panel derecho: descripción + comprar
    this.descTitle = this.add.text(W / 2 + 130, 160, '', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    this.descText = this.add.text(W / 2 + 130, 205, '', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#c8d2ea',
      align: 'center',
    }).setOrigin(0.5, 0);

    this.shop.add([this.descTitle, this.descText]);

    this.buyBtn = this.makeButton(this.shop, W / 2 + 130, 300, 220, 50, 'COMPRAR', 0x8a6a1a, () => this.onBuy());

    // zona de avisos (confirmación de compra / sustitución / errores)
    this.warningText = this.add.text(W / 2 + 130, 380, '', {
      fontFamily: 'monospace',
      fontSize: '15px',
      color: '#ffd93b',
      align: 'center',
      wordWrap: { width: 360 },
    }).setOrigin(0.5, 0);
    this.shop.add(this.warningText);

    this.confirmBtn = this.makeButton(this.shop, W / 2 + 30, 460, 150, 42, 'CONFIRMAR', 0x2a8a4a, () => this.onConfirm());
    this.cancelBtn = this.makeButton(this.shop, W / 2 + 230, 460, 150, 42, 'CANCELAR', 0x6a6a6a, () => this.cancelBuy());
    this.confirmBtn.setVisible(false);
    this.cancelBtn.setVisible(false);

    // botón salir (abajo a la derecha)
    this.exitBtn = this.makeButton(this.shop, W - 90, H - 40, 150, 44, 'SALIR', 0x5a3a7a, () => this.showMenu());
  }

  showShop() {
    this.shop.setVisible(true);
    this.menu.setVisible(false);
    this.updatePoints();
    this.updateEquip();
    this.warningText.setText('');
    this.confirmBtn.setVisible(false);
    this.cancelBtn.setVisible(false);
    this.descTitle.setText('');
    this.descText.setText('');
    this.selectedWeapon = null;
  }

  updatePoints() {
    const game = this.gameScene;
    const score = game ? game.scoreSystem.score : 0;
    this.pointsText.setText('PUNTOS: ' + score);
  }

  updateEquip() {
    const game = this.gameScene;
    const key = game ? game.player.weapon : CFG.DEFAULT_WEAPON;
    this.equipText.setText('ARMA EQUIPADA: ' + CFG.WEAPONS[key].label);
  }

  selectWeapon(key) {
    this.selectedWeapon = key;
    const w = CFG.WEAPONS[key];
    this.descTitle.setText(w.label);
    this.descText.setText(
      'SHOOT: ' + w.damage + ' daño\n' +
      'TIME PER SHOOT: ' + (w.cooldown / 1000).toFixed(1) + ' seconds\n' +
      'COST: ' + w.cost + ' points'
    );
    this.warningText.setText('');
    this.confirmBtn.setVisible(false);
    this.cancelBtn.setVisible(false);
  }

  onBuy() {
    if (!this.selectedWeapon) return;
    const w = CFG.WEAPONS[this.selectedWeapon];
    const game = this.gameScene;
    const current = game ? game.player.weapon : CFG.DEFAULT_WEAPON;
    const replacing = current !== CFG.DEFAULT_WEAPON && current !== this.selectedWeapon;

    let msg = '¿Comprar ' + w.label + ' por ' + w.cost + ' puntos?';
    if (replacing) {
      msg += '\nSe sustituirá tu ' + CFG.WEAPONS[current].label + ' por la nueva.';
    }
    this.warningText.setText(msg);
    this.confirmBtn.setVisible(true);
    this.cancelBtn.setVisible(true);
  }

  onConfirm() {
    const game = this.gameScene;
    const w = CFG.WEAPONS[this.selectedWeapon];
    this.confirmBtn.setVisible(false);
    this.cancelBtn.setVisible(false);

    if (!game) return;
    if (game.scoreSystem.spend(w.cost)) {
      game.player.weapon = this.selectedWeapon;
      this.updatePoints();
      this.updateEquip();
      this.warningText.setText(w.label + ' equipado.');
    } else {
      this.warningText.setText('Puntos insuficientes.');
    }
  }

  cancelBuy() {
    this.confirmBtn.setVisible(false);
    this.cancelBtn.setVisible(false);
    this.warningText.setText('');
  }

  continueGame() {
    this.scene.stop('ShopScene');
    const game = this.scene.get('GameScene');
    if (game) {
      game.scene.resume();
      game.startWaveTransition();
    }
  }

  surrender() {
    const game = this.scene.get('GameScene');
    if (game) this.game.records.submit(game.scoreSystem.score);
    this.scene.stop('ShopScene');
    this.scene.stop('GameScene');
    this.scene.stop('UIScene');
    this.scene.start('BootScene');
  }
}
