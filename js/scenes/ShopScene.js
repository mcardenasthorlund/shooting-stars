class ShopScene extends Phaser.Scene {
  constructor() {
    super('ShopScene');
    this.selectedWeapon = null;
    this.ownedWeapons = [];
    this.weaponTicks = {};
  }

  // ---- armas compradas por el jugador (se reinician al iniciar una partida) ----
  loadOwned() {
    if (!this.game.ownedWeapons) this.game.ownedWeapons = [];
    this.ownedWeapons = this.game.ownedWeapons;
    // el arma principal BLASTER está siempre disponible
    if (this.ownedWeapons.indexOf(CFG.DEFAULT_WEAPON) === -1) {
      this.ownedWeapons.push(CFG.DEFAULT_WEAPON);
    }
  }

  isOwned(key) {
    return this.ownedWeapons.indexOf(key) !== -1;
  }

  addOwned(key) {
    if (!this.isOwned(key)) this.ownedWeapons.push(key);
  }

  create(data) {
    this.loadOwned();
    const { WIDTH: W, HEIGHT: H } = CFG;
    this.pendingScore = data && data.score != null ? data.score : null;

    // fondo oscuro que cubre toda la pantalla
    this.overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x05070f, 0.94);

    this.buildMenu();
    this.buildShop();
    this.buildRoulette();
    this.showMenu();
  }

  get gameScene() {
    return this.scene.get('GameScene');
  }

  makeButton(container, x, y, w, h, label, color, callback) {
    const btn = this.add.container(x, y);
    const rect = this.add.rectangle(0, 0, w, h, color).setInteractive({ useHandCursor: true });
    rect.on('pointerdown', (pointer, localX, localY, event) => {
      if (this.game.sfx) this.game.sfx.click();
      callback();
    });
    rect.on('pointerover', () => rect.setFillStyle(color, 0.7));
    rect.on('pointerout', () => rect.setFillStyle(color, 1));
    const txt = this.add.text(0, 0, label, {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    btn.add([rect, txt]);
    if (container) container.add(btn);
    return btn;
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
    this.stopShopMusic();
  }

  // suena la música de la tienda al entrar y pausa la música de la partida
  startShopMusic() {
    if (this.game.music && this.game.music.isPlaying) this.game.music.pause();
    if (this.game.bossMusic && this.game.bossMusic.isPlaying) this.game.bossMusic.pause();
    if (this.game.finalBossMusic && this.game.finalBossMusic.isPlaying) this.game.finalBossMusic.pause();
    if (!this.game.tiendaMusic) {
      this.game.tiendaMusic = this.sound.add('tienda_music', { loop: true, volume: 0.5 });
    }
    if (!this.game.tiendaMusic.isPlaying) this.game.tiendaMusic.play();
  }

  // detiene la música de la tienda al salir y reanuda la música de la partida
  stopShopMusic() {
    if (this.game.tiendaMusic && this.game.tiendaMusic.isPlaying) this.game.tiendaMusic.stop();
    const game = this.gameScene;
    if (game && game.game.music && !game.game.music.isPlaying) {
      game.game.music.resume();
      game.game.music.setVolume(0.5);
    }
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

    // botón APUESTA (ruleta) a la izquierda del contador de puntos
    this.betBtn = this.makeButton(this.shop, W - 360, 30, 150, 40, '🎰 APUESTA', 0x8a1a4a, () => this.showRoulette());
    this.betBtn.setDepth(3);

    // columna izquierda con las armas (ordenadas por coste; BLASTER gratis, primera)
    const buyable = Object.keys(CFG.WEAPONS)
      .sort((a, b) => CFG.WEAPONS[a].cost - CFG.WEAPONS[b].cost);
    this.weaponBtns = {};
    buyable.forEach((key, i) => {
      const w = CFG.WEAPONS[key];
      const x = 120;
      const y = 150 + i * 80;
      const btn = this.makeButton(this.shop, x, y, 200, 62, w.label + '\n' + w.cost + ' PTS', 0x2a3a5a, () => this.selectWeapon(key));
      this.weaponBtns[key] = btn;
      // sprite del arma a la izquierda del nombre
      if (w.img) {
        const icon = this.add.image(x - 68, y, w.img).setDisplaySize(46, 46);
        this.shop.add(icon);
      }
      // tick verde a la derecha del nombre indicando que está comprada
      const tick = this.add.text(56, -12, '✔', {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#39ff6e',
        fontStyle: 'bold',
      }).setOrigin(0.5);
      btn.add(tick);
      tick.setVisible(false);
      this.weaponTicks[key] = tick;
    });
    this.updateTicks();

    // imagen de la tienda en el lateral derecho (siempre inicia con tienda.png)
    this.shopImg = this.add.image(W - 160, H / 2, 'shop_img');
    this.shop.add(this.shopImg);
    this.setShopTexture('shop_img');
    this.scheduleShopSwap();

    // caja de descripción que se activa al pulsar un arma (a la derecha de los botones)
    const cx = 360, cy = 300;
    this.descBox = this.add.container(cx, cy);
    const bg = this.add.rectangle(0, 0, 230, 360, 0x1a2a4a, 0.92).setStrokeStyle(2, 0x4a6a9a).setOrigin(0.5);
    this.descBox.add(bg);

    this.descTitle = this.add.text(0, -170, '', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    this.descText = this.add.text(0, -135, '', {
      fontFamily: 'monospace',
      fontSize: '15px',
      color: '#c8d2ea',
      align: 'center',
    }).setOrigin(0.5, 0);
    this.descBox.add([this.descTitle, this.descText]);

    // sprite del arma seleccionada debajo de la descripción
    this.descImg = this.add.image(0, 5, 'weapon_revolver_img');
    this.descBox.add(this.descImg);
    this.descImg.setVisible(false);

    // COMPRAR (si no está comprada) y EQUIPAR (si ya la tienes)
    this.buyBtn = this.makeButton(this.descBox, 0, 110, 170, 46, 'COMPRAR', 0x8a6a1a, () => this.onBuy());
    this.equipBtn = this.makeButton(this.descBox, 0, 110, 170, 46, 'EQUIPAR', 0x2a8a4a, () => this.onEquip());
    this.equipBtn.setVisible(false);

    // zona de avisos (confirmación de compra / sustitución / errores)
    this.warningText = this.add.text(0, 145, '', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ffd93b',
      align: 'center',
      wordWrap: { width: 210 },
    }).setOrigin(0.5, 0);
    this.descBox.add(this.warningText);

    // CONFIRMAR / CANCELAR aparecen en el mismo sitio que COMPRAR al pulsarlo
    this.confirmBtn = this.makeButton(this.descBox, -55, 110, 120, 46, 'CONFIRMAR', 0x2a8a4a, () => this.onConfirm());
    this.cancelBtn = this.makeButton(this.descBox, 55, 110, 120, 46, 'CANCELAR', 0x6a6a6a, () => this.cancelBuy());
    this.confirmBtn.setVisible(false);
    this.cancelBtn.setVisible(false);

    this.descBox.setVisible(false);
    this.shop.add(this.descBox);

    // botón salir (abajo a la derecha)
    this.exitBtn = this.makeButton(this.shop, W - 90, H - 40, 150, 44, 'SALIR', 0x5a3a7a, () => this.showMenu());
  }

  // ---- Ruleta de apuestas ----
  buildRoulette() {
    const { WIDTH: W, HEIGHT: H } = CFG;
    this.roulette = this.add.container(0, 0);
    this.selectedColor = null;

    // fondo oscuro propio de la ruleta
    this.rouletteOverlay = this.add.rectangle(W / 2, H / 2, W, H, 0x05070f, 0.96);
    this.roulette.add(this.rouletteOverlay);

    const title = this.add.text(W / 2, 45, 'APUESTA', {
      fontFamily: 'monospace',
      fontSize: '32px',
      color: '#ffd93b',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);
    this.roulette.add(title);

    // rueda de la ruleta (más pequeña para dejar sitio al campo de puntos)
    this.rouletteWheel = new RouletteWheel(this, W / 2, 215);
    this.roulette.add(this.rouletteWheel.wheel);
    this.roulette.add(this.rouletteWheel.pointer);

    // etiqueta + campo numérico de la apuesta
    this.betLabel = this.add.text(W / 2, 338, 'INSERTAR PUNTOS (máx: ' + this.rouletteMax() + ')', {
      fontFamily: 'monospace',
      fontSize: '15px',
      color: '#c8d2ea',
    }).setOrigin(0.5, 0.5);
    this.roulette.add(this.betLabel);

    // campo numérico HTML superpuesto sobre el canvas en la posición de la apuesta
    // (se reutiliza si ya existe: el DOM no se destruye al reiniciar la escena)
    this.betInput = document.getElementById('roulette-bet-input');
    if (!this.betInput) {
      this.betInput = document.createElement('input');
      this.betInput.type = 'number';
      this.betInput.min = '0';
      this.betInput.step = '1';
      this.betInput.inputMode = 'numeric';
      this.betInput.id = 'roulette-bet-input';
      document.getElementById('game').appendChild(this.betInput);
    }
    this.betInput.style.display = 'none';
    this.positionBetInput();

    // selección del color
    this.colorBtns = {};
    const redBtn = this.makeButton(this.roulette, W / 2 - 80, 440, 140, 46, 'ROJO', CFG.ROULETTE_RED, () => this.selectColor('red'));
    const blackBtn = this.makeButton(this.roulette, W / 2 + 80, 440, 140, 46, 'NEGRO', CFG.ROULETTE_BLACK, () => this.selectColor('black'));
    this.colorBtns.red = redBtn;
    this.colorBtns.black = blackBtn;
    this.colorBtns.redTick = this.makeColorTick(redBtn, 'red');
    this.colorBtns.blackTick = this.makeColorTick(blackBtn, 'black');

    // CONFIRMAR / CANCELAR
    this.rouletteConfirm = this.makeButton(this.roulette, W / 2 - 100, 505, 160, 46, 'CONFIRMAR', 0x2a8a4a, () => this.confirmBet());
    this.rouletteCancel = this.makeButton(this.roulette, W / 2 + 100, 505, 160, 46, 'CANCELAR', 0x8a2a2a, () => this.closeRoulette());

    // ventana modal informativa (avisos y resultado)
    this.buildRouletteModal();

    this.roulette.setVisible(false);
  }

  // ventana modal reutilizable de la ruleta (avisos / resultado)
  buildRouletteModal() {
    const { WIDTH: W, HEIGHT: H } = CFG;
    this.rouletteModal = this.add.container(0, 0);

    // overlay oscuro que bloquea la interacción con la ruleta de debajo
    this.rouletteModalOverlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.72)
      .setInteractive();
    this.rouletteModal.add(this.rouletteModalOverlay);

    // panel central
    const panel = this.add.rectangle(W / 2, H / 2, 480, 260, 0x1a2a4a, 0.98)
      .setStrokeStyle(3, 0x4a6a9a).setOrigin(0.5);
    this.rouletteModal.add(panel);

    this.rouletteModalTitle = this.add.text(W / 2, H / 2 - 90, '', {
      fontFamily: 'monospace',
      fontSize: '26px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);
    this.rouletteModal.add(this.rouletteModalTitle);

    this.rouletteModalMsg = this.add.text(W / 2, H / 2 - 10, '', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 400 },
    }).setOrigin(0.5, 0.5);
    this.rouletteModal.add(this.rouletteModalMsg);

    // botón (rect + texto) del modal
    const btnRect = this.add.rectangle(0, 0, 190, 46, 0x2a8a4a).setInteractive({ useHandCursor: true });
    const btnTxt = this.add.text(0, 0, 'OK', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.rouletteModalBtn = this.add.container(W / 2, H / 2 + 80, [btnRect, btnTxt]);
    this.rouletteModalBtnRect = btnRect;
    this.rouletteModalBtnTxt = btnTxt;
    this.rouletteModal.add(this.rouletteModalBtn);

    this.rouletteModal.setDepth(20);
    this.rouletteModal.setVisible(false);
    this.roulette.add(this.rouletteModal);
  }

  showRouletteModal(title, msg, color, btnLabel, onClose) {
    this.hideBetInput();
    this.rouletteModalTitle.setText(title).setColor(color);
    this.rouletteModalMsg.setText(msg);
    this.rouletteModalBtnTxt.setText(btnLabel);
    this.rouletteModalBtnRect.removeAllListeners('pointerdown');
    this.rouletteModalBtnRect.on('pointerdown', (pointer, lx, ly, event) => {
      if (this.game.sfx) this.game.sfx.click();
      onClose();
    });
    this.rouletteModal.setVisible(true);
  }

  closeRouletteModal() {
    this.rouletteModal.setVisible(false);
  }

  // posiciona el campo numérico sobre el canvas siguiendo el Scale.FIT
  positionBetInput() {
    const sm = this.game.scale;
    if (!sm || !sm.parentSize || !sm.displaySize) return;
    const s = sm.displaySize.width / CFG.WIDTH;
    const ox = Math.floor((sm.parentSize.width - sm.displaySize.width) / 2);
    const oy = Math.floor((sm.parentSize.height - sm.displaySize.height) / 2);
    const cx = ox + (CFG.WIDTH / 2) * s;
    const cy = oy + 385 * s;
    this.betInput.style.width = (220 * s) + 'px';
    this.betInput.style.height = (40 * s) + 'px';
    this.betInput.style.left = (cx - 110 * s) + 'px';
    this.betInput.style.top = (cy - 20 * s) + 'px';
  }

  showBetInput() {
    this.betInput.style.display = 'block';
    this.positionBetInput();
  }

  hideBetInput() {
    this.betInput.style.display = 'none';
  }

  // lee el valor numérico del campo (0 si está vacío o no válido)
  getBetFromInput() {
    const raw = parseInt(this.betInput.value, 10);
    return isNaN(raw) ? 0 : raw;
  }

  // marca (tick/borde) sobre el botón del color seleccionado
  makeColorTick(btn, color) {
    const border = this.add.rectangle(0, 0, 148, 52, 0x000000, 0).setStrokeStyle(3, 0xffffff).setOrigin(0.5);
    border.setVisible(false);
    btn.add(border);
    return border;
  }

  // puntos actuales del jugador (máximo apostable)
  rouletteMax() {
    const game = this.gameScene;
    return game ? game.scoreSystem.score : 0;
  }

  selectColor(color) {
    if (this.rouletteWheel.spinning) return;
    this.selectedColor = color;
    this.colorBtns.redTick.setVisible(color === 'red');
    this.colorBtns.blackTick.setVisible(color === 'black');
  }

  confirmBet() {
    if (this.rouletteWheel.spinning) return;
    const max = this.rouletteMax();
    const bet = this.getBetFromInput();
    if (!this.selectedColor) {
      this.showRouletteModal(
        'APUESTA',
        'Elige ROJO o NEGRO para apostar.',
        '#ffd93b',
        'OK',
        () => { this.closeRouletteModal(); this.showBetInput(); }
      );
      return;
    }
    if (bet < CFG.ROULETTE_MIN_BET || bet > max) {
      this.showRouletteModal(
        'APUESTA NO VÁLIDA',
        'Introduce una cantidad entre ' + CFG.ROULETTE_MIN_BET + ' y ' + max + ' puntos.',
        '#ff3b3b',
        'OK',
        () => { this.closeRouletteModal(); this.showBetInput(); }
      );
      return;
    }

    this.setRouletteInput(false);
    this.hideBetInput();

    const chosen = this.selectedColor;

    this.rouletteWheel.spin((resultColor) => {
      const game = this.gameScene;
      let title, msg, win;

      if (resultColor === 'green') {
        // casilla verde: premio especial x10, gana siempre (independiente del color elegido)
        win = true;
        const prize = bet * CFG.ROULETTE_GREEN_MULT;
        if (game) game.scoreSystem.gain(prize);
        title = '¡CASILLA VERDE!';
        msg = '¡Cayó en la casilla VERDE! Ganas x' + CFG.ROULETTE_GREEN_MULT + ': +' + prize + ' puntos.';
      } else if (resultColor === chosen) {
        win = true;
        if (game) game.scoreSystem.gain(bet);
        title = '¡HAS GANADO!';
        msg = '¡Cayó en ' + resultColor.toUpperCase() + '! Ganas +' + bet + ' puntos.';
      } else {
        win = false;
        if (game) game.scoreSystem.spend(bet);
        title = 'HAS PERDIDO';
        msg = 'Cayó en ' + resultColor.toUpperCase() + '. Pierdes ' + bet + ' puntos.';
      }

      this.updatePoints();
      // ventana informativa con el resultado y botón para volver a la tienda
      this.showRouletteModal(
        title,
        msg,
        win ? '#39ff6e' : '#ff3b3b',
        'VOLVER A LA TIENDA',
        () => this.closeRoulette()
      );
    });
  }

  // habilita/deshabilita los botones de la ruleta durante el giro
  setRouletteInput(enabled) {
    this.setButtonEnabled(this.rouletteConfirm, enabled, 0x2a8a4a);
    this.setButtonEnabled(this.rouletteCancel, enabled, 0x8a2a2a);
  }

  showRoulette() {
    this.cancelShopSwap();
    this.shop.setVisible(false);
    this.menu.setVisible(false);
    this.selectedColor = null;
    this.colorBtns.redTick.setVisible(false);
    this.colorBtns.blackTick.setVisible(false);
    this.closeRouletteModal();
    this.betLabel.setText('INSERTAR PUNTOS (máx: ' + this.rouletteMax() + ')');
    this.betInput.value = '';
    this.rouletteConfirm.setVisible(true);
    this.rouletteCancel.setVisible(true);
    this.showBetInput();
    this.setRouletteInput(true);
    this.roulette.setVisible(true);
  }

  closeRoulette() {
    this.hideBetInput();
    this.closeRouletteModal();
    this.roulette.setVisible(false);
    this.scheduleShopSwap();
    this.showShop();
  }

  // ajusta el sprite del arma de la ventana de información al ancho disponible
  // (sin tocar bordes ni la descripción), conservando la proporción
  setDescImg(key) {
    const tex = this.textures.get(key);
    if (!tex || !tex.getSourceImage || !tex.getSourceImage().width) return;
    const nw = tex.getSourceImage().width;
    const nh = tex.getSourceImage().height;
    const targetW = 210;
    const maxH = 140;
    let w = targetW;
    let h = nh * (w / nw);
    if (h > maxH) { h = maxH; w = nw * (h / nh); }
    this.descImg.setTexture(key).setDisplaySize(w, h);
  }

  // aplica una textura a la imagen de la tienda conservando su proporción (máx 340px)
  setShopTexture(key) {
    const tex = this.textures.get(key);
    if (!tex || !tex.getSourceImage || !tex.getSourceImage().width) return;
    const nw = tex.getSourceImage().width;
    const nh = tex.getSourceImage().height;
    const scale = Math.min(340 / nw, 340 / nh);
    this.shopImg.setTexture(key).setScale(scale);
  }

  // cada 5-10s cambia la imagen de la tienda a tienda3/tienda4 y a los 0.5s
  // (2s si es tienda4) vuelve a tienda.png; se repite constantemente
  scheduleShopSwap() {
    this.cancelShopSwap();
    this.swapTimer = this.time.delayedCall(Phaser.Math.Between(5000, 10000), () => {
      const options = ['shop_img3', 'shop_img4'];
      const pick = options[Math.floor(Math.random() * options.length)];
      this.setShopTexture(pick);
      const backDelay = pick === 'shop_img4' ? 2000 : 500;
      this.swapTimer = this.time.delayedCall(backDelay, () => {
        this.setShopTexture('shop_img');
        this.scheduleShopSwap();
      });
    });
  }

  cancelShopSwap() {
    if (this.swapTimer) {
      this.swapTimer.remove(false);
      this.swapTimer = null;
    }
  }

  // tras confirmar una compra muestra tienda5 durante 2s y luego reanuda el ciclo
  showShopAfterPurchase() {
    this.cancelShopSwap();
    this.setShopTexture('shop_img5');
    this.swapTimer = this.time.delayedCall(2000, () => {
      this.setShopTexture('shop_img');
      this.scheduleShopSwap();
    });
  }

  // muestra el botón de acción correcto en la caja según si el arma está comprada
  showActionButton() {
    this.confirmBtn.setVisible(false);
    this.cancelBtn.setVisible(false);
    const owned = this.isOwned(this.selectedWeapon);
    const game = this.gameScene;
    if (owned) {
      this.buyBtn.setVisible(false);
      this.equipBtn.setVisible(true);
      const current = game ? game.player.weapon : CFG.DEFAULT_WEAPON;
      const active = this.selectedWeapon === current;
      // el arma activa no se puede re-equipar: botón gris y deshabilitado
      this.setButtonEnabled(this.equipBtn, !active, active ? 0x6a6a6a : 0x2a8a4a);
    } else {
      this.equipBtn.setVisible(false);
      // solo se puede comprar si hay puntos suficientes
      const w = CFG.WEAPONS[this.selectedWeapon];
      const canBuy = game && game.scoreSystem.score >= w.cost;
      this.buyBtn.setVisible(canBuy);
    }
  }

  // cambia el color de fondo de un botón (su rect es el primer hijo del contenedor)
  setButtonColor(btn, color) {
    const rect = btn.getAt(0);
    if (rect && rect.setFillStyle) rect.setFillStyle(color, 1);
  }

  // habilita/deshabilita un botón: deshabilitado no responde a hover ni a clic
  setButtonEnabled(btn, enabled, color) {
    const rect = btn.getAt(0);
    if (!rect) return;
    if (enabled) {
      rect.setInteractive({ useHandCursor: true });
    } else {
      rect.disableInteractive();
    }
    this.setButtonColor(btn, color);
  }

  showShop() {
    this.shop.setVisible(true);
    this.menu.setVisible(false);
    this.startShopMusic();
    this.updatePoints();
    this.updateEquip();
    this.updateTicks();
    this.warningText.setText('');
    this.buyBtn.setVisible(false);
    this.equipBtn.setVisible(false);
    this.confirmBtn.setVisible(false);
    this.cancelBtn.setVisible(false);
    this.descTitle.setText('');
    this.descText.setText('');
    this.selectedWeapon = null;
    this.descBox.setVisible(false);
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
      'TPS: ' + (w.cooldown / 1000).toFixed(1) + ' secs\n' +
      'COST: ' + w.cost + ' points'
    );
    this.warningText.setText('');
    if (w.img) {
      this.setDescImg(w.img);
      this.descImg.setVisible(true);
    } else {
      this.descImg.setVisible(false);
    }
    this.showActionButton();
    this.descBox.setVisible(true);
  }

  onBuy() {
    if (!this.selectedWeapon) return;
    // al pulsar COMPRAR se oculta y aparecen CONFIRMAR / CANCELAR
    this.buyBtn.setVisible(false);
    this.warningText.setText('');
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
      // guarda el arma para el jugador y la equipa
      this.addOwned(this.selectedWeapon);
      this.equip(this.selectedWeapon);
      this.updatePoints();
      this.updateTicks();
      this.showShopAfterPurchase();
      this.showActionButton();
      this.warningText.setText(w.label + ' comprada.');
    } else {
      this.warningText.setText('Puntos insuficientes.');
      this.showActionButton();
    }
  }

  onEquip() {
    if (!this.selectedWeapon) return;
    this.equip(this.selectedWeapon);
    this.warningText.setText('');
    // tras equipar, la arma activa pasa a gris
    this.showActionButton();
  }

  // equipa un arma: actualiza la del jugador y la guarda como equipada
  equip(key) {
    const game = this.gameScene;
    if (!game) return;
    if (game.player.setWeapon) game.player.setWeapon(key);
    else game.player.weapon = key;
    if (game.reloadWeapon) game.reloadWeapon();
    game.bazookaReady = true;
    this.game.equippedWeapon = key;
    this.updateEquip();
  }

  cancelBuy() {
    // al pulsar CANCELAR desaparecen y vuelve a aparecer COMPRAR (o EQUIPAR si ya está comprada)
    this.warningText.setText('');
    this.showActionButton();
  }

  // actualiza los ticks verdes de las armas compradas en la lista
  updateTicks() {
    for (const key in this.weaponTicks) {
      this.weaponTicks[key].setVisible(this.isOwned(key));
    }
  }

  continueGame() {
    if (this.game.tiendaMusic && this.game.tiendaMusic.isPlaying) this.game.tiendaMusic.stop();
    this.scene.stop('ShopScene');
    const game = this.scene.get('GameScene');
    if (game) {
      // reanudar la música normal del juego tras salir de la tienda (con fundido)
      if (game.game.music && !game.game.music.isPlaying) {
        game.game.music.resume();
        game.game.music.setVolume(0);
        game.tweens.add({ targets: game.game.music, volume: 0.5, duration: 500, ease: 'Linear' });
      }
      game.scene.resume();
      game.startWaveTransition();
    }
  }

  surrender() {
    if (this.game.tiendaMusic && this.game.tiendaMusic.isPlaying) this.game.tiendaMusic.stop();
    const game = this.scene.get('GameScene');
    if (game) this.game.records.submit(game.scoreSystem.score);
    if (this.game.music && this.game.music.isPlaying) this.game.music.stop();
    if (this.game.bossMusic && this.game.bossMusic.isPlaying) this.game.bossMusic.stop();
    this.scene.stop('ShopScene');
    this.scene.stop('GameScene');
    this.scene.stop('UIScene');
    this.scene.start('BootScene');
  }
}
