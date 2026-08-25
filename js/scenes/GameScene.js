class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    const { WIDTH: W, HEIGHT: H } = CFG;
    this.gameOver = false;

    // mostrar el logo HTML solo durante el juego
    const logo = document.getElementById('logo');
    if (logo) logo.style.display = 'block';

    const bg = this.add.graphics();
    bg.fillStyle(0x05070f, 1);
    bg.fillRect(0, 0, W, H);

    this.stars = [];
    for (let i = 0; i < 60; i++) {
      this.stars.push(new Star(this));
    }

    // capas parallax de planetas (profundidad del escenario)
    this.planetLayers = [
      new PlanetLayer(this, 4, {
        speed: 20,
        minSize: 22,
        maxSize: 36,
        alpha: 0.4,
        ringChance: 0.2,
        palette: [0x4a5a8a, 0x5a4a7a, 0x3a5a6a, 0x7a4a4a],
        dangerPalette: [0x7a1a1a, 0x5a0a0a, 0x8a2a1a, 0x6a1515],
      }),
      new PlanetLayer(this, 3, {
        speed: 42,
        minSize: 44,
        maxSize: 64,
        alpha: 0.6,
        ringChance: 0.5,
        palette: [0x8a5a3a, 0x3a8a6a, 0x8a3a5a, 0x5a7a8a],
        dangerPalette: [0x8a1a0a, 0x6a0808, 0x9a2a12, 0x7a1212],
      }),
    ];

    this.player = new Player(this, CFG.PLAYER_X, CFG.PLAYER_Y);
    this.controls = new InputHandler(this, this.player);

    this.bullets = this.physics.add.group();
    this.lastFireTime = -CFG.FIRE_COOLDOWN;
    this.fireQueue = [];

    this.spawner = new EnemySpawner(this);
    this.startTime = this.time.now;
    this.scoreSystem = new ScoreSystem();
    this.powerUpSystem = new PowerUpSystem(this);
    this.bigBoyUntil = 0;
    this.explosions = [];
    this.wave = 1;
    this.difficulty = 1;
    this.inTransition = false;
    this.tunnel = null;
    this.tunnelZ = 0;
    this.bossSpawnedThisWave = false;

    this.setupCollisions();

    this.events.on('boss-spawned', this.bossAlarm, this);
    this.input.keyboard.on('keydown-D', (event) => {
      if (event.ctrlKey) this.spawner.spawnBoss();
    });
    this.input.keyboard.on('keydown-K', (event) => {
      if (event.ctrlKey) this.endGame();
    });
    this.input.keyboard.on('keydown-N', (event) => {
      if (event.altKey) this.spawner.spawnVariantEnemy();
    });
    this.input.keyboard.on('keydown-B', (event) => {
      if (event.ctrlKey) this.powerUpSystem.spawnRandom();
    });
    this.input.keyboard.on('keydown-ONE', () => this.activateSlot(0));
    this.input.keyboard.on('keydown-TWO', () => this.activateSlot(1));
    this.input.keyboard.on('keydown-THREE', () => this.activateSlot(2));
  }

  setupCollisions() {
    this.physics.add.overlap(this.bullets, this.spawner.enemies, this.onBulletEnemy, null, this);
    this.physics.add.overlap(this.bullets, this.powerUpSystem.group, this.onBulletPowerUp, null, this);
  }

  onBulletEnemy(bullet, enemySprite) {
    const damage = bullet.getData('damage') || 1;
    bullet.destroy();
    const handler = enemySprite.getData('handler');
    if (!handler) return;
    this.handleHit(handler, enemySprite, damage);
  }

  onBulletPowerUp(bullet, powerUpSprite) {
    bullet.destroy();
    const handler = powerUpSprite.getData('handler');
    if (!handler) return;
    this.powerUpSystem.collect(handler.type);
    powerUpSprite.destroy();
  }

  handleHit(handler, sprite, amount) {
    if (handler.damage(amount)) {
      if (handler instanceof Boss) {
        this.onBossKilled(handler, sprite);
      } else {
        this.spawnExplosion(sprite.x, sprite.y, CFG.ENEMY_EXPLOSION_RADIUS);
        this.scoreSystem.add(handler.points);
        this.events.emit('enemy-killed', handler.points);
      }
    }
  }

  // activar el power up de la casilla indicada (0, 1 o 2)
  activateSlot(index) {
    const type = this.powerUpSystem.use(index);
    if (!type) return;
    this.applyPowerUp(type);
  }

  applyPowerUp(type) {
    switch (type) {
      case 'BIG_BOY':
        this.bigBoyUntil = this.time.now + CFG.BIG_BOY_DURATION;
        break;
      case 'HEALING':
        this.player.heal(CFG.MAX_HEALTH * (CFG.HEAL_PERCENT / 100));
        this.events.emit('player-hurt', this.player.health);
        break;
      case 'BIG_BOOM':
        this.spawnExplosion(this.player.sprite.x, this.player.sprite.y, CFG.BOSS_EXPLOSION_RADIUS);
        this.damageAllEnemies(CFG.BIG_BOOM_DAMAGE);
        break;
      case 'SHIELD':
        this.player.setShield(CFG.RIOT_SHIELD_AMOUNT);
        this.events.emit('player-hurt', this.player.health);
        break;
    }
  }

  damageAllEnemies(amount) {
    const list = this.spawner.enemies.getChildren().slice();
    for (const s of list) {
      if (!s.active) continue;
      const handler = s.getData('handler');
      if (handler) this.handleHit(handler, s, amount);
    }
  }

  onBossKilled(boss, bossSprite) {
    // puntos del BOSS
    this.scoreSystem.add(boss.points);
    this.events.emit('enemy-killed', boss.points);

    // cura 30 de vida sin superar el máximo
    this.player.heal(CFG.BOSS_HEAL_AMOUNT);
    this.events.emit('player-hurt', this.player.health);

    // gran explosión que cubre toda la pantalla
    this.spawnExplosion(bossSprite.x, bossSprite.y, CFG.BOSS_EXPLOSION_RADIUS);

    // elimina a todos los enemigos que queden en pantalla
    if (this.spawner) this.spawner.clearEnemies();

    // fin de la alarma: los planetas vuelven a su color normal
    this.setPlanetDanger(false);

    // pantalla de victoria + tienda (en vez de ir directo a la siguiente fase)
    // se difiere para salir del callback de físicas antes de pausar la escena
    this.time.delayedCall(0, () => this.openShop());
  }

  getWeapon() {
    return CFG.WEAPONS[this.player.weapon] || CFG.WEAPONS[CFG.DEFAULT_WEAPON];
  }

  // pausa la partida y muestra el menú de victoria del BOSS (con la tienda)
  openShop() {
    this.scene.pause();
    this.scene.launch('ShopScene', { score: this.scoreSystem.score });
  }

  // mensaje WAVE COMPLETED + túnel hacia la nueva fase
  startWaveTransition() {
    if (this.inTransition) return;
    this.inTransition = true;

    const { WIDTH: W, HEIGHT: H } = CFG;

    const waveText = this.add.text(W / 2, H / 2 - 40, 'WAVE COMPLETED', {
      fontFamily: 'monospace',
      fontSize: '46px',
      color: '#39ff6e',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5).setAlpha(0);

    const waveNum = this.add.text(W / 2, H / 2 + 20, 'Ola ' + this.wave + ' superada', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#c8d2ea',
    }).setOrigin(0.5, 0.5).setAlpha(0);

    this.tweens.add({ targets: [waveText, waveNum], alpha: 1, duration: 400 });

    this.time.delayedCall(1400, () => {
      this.tweens.add({ targets: [waveText, waveNum], alpha: 0, duration: 300 });
      this.startTunnel();
    });
  }

  startTunnel() {
    this.tunnel = this.add.graphics();
    this.tunnelZ = 0;
    this.tunnelTime = 0;
  }

  updateTunnel(dt) {
    const g = this.tunnel;
    if (!g) return;
    g.clear();
    const cx = CFG.WIDTH / 2;
    const cy = CFG.HEIGHT / 2;
    const maxR = Math.max(CFG.WIDTH, CFG.HEIGHT) * 0.75;
    this.tunnelZ += dt * 0.55;
    this.tunnelTime += dt;

    // anillos del túnel que se expanden hacia afuera (sensación de avance)
    for (let i = 0; i < 14; i++) {
      const r = (this.tunnelZ + i * (maxR / 14)) % maxR;
      const alpha = Math.max(0, 1 - (r / maxR)) * 0.7;
      g.lineStyle(3, 0x9ad0ff, alpha);
      g.strokeCircle(cx, cy, r);
    }

    // estrías de luz radiales (velocidad de la luz)
    const streaks = 72;
    for (let i = 0; i < streaks; i++) {
      const a = (i / streaks) * Math.PI * 2;
      const r1 = (this.tunnelZ * 1.6) % maxR;
      const r2 = r1 + ((i * 37) % 60) + 20;
      const alpha = Math.max(0, 1 - (r1 / maxR));
      g.lineStyle(2, 0xffffff, alpha * 0.9);
      g.lineBetween(
        cx + Math.cos(a) * r1, cy + Math.sin(a) * r1,
        cx + Math.cos(a) * r2, cy + Math.sin(a) * r2
      );
    }

    if (this.tunnelTime > 1900) {
      this.finishTunnel();
    }
  }

  finishTunnel() {
    if (this.tunnel) {
      this.tunnel.destroy();
      this.tunnel = null;
    }
    this.beginNextWave();
  }

  beginNextWave() {
    this.wave++;
    this.difficulty = Math.min(2.5, this.difficulty + 0.25);
    if (this.spawner) this.spawner.resetWave();
    this.startTime = this.time.now;
    this.bossSpawnedThisWave = false;
    this.inTransition = false;
    this.events.emit('wave-started', this.wave);
  }

  // alarma visual al aparecer el BOSS: flash rojo + planetas rojos + alerta
  bossAlarm() {
    this.setPlanetDanger(true);

    const { WIDTH: W, HEIGHT: H } = CFG;
    const flash = this.add.rectangle(W / 2, H / 2, W, H, 0xff2222).setAlpha(0);

    this.tweens.add({
      targets: flash,
      alpha: { from: 0, to: 0.35 },
      duration: 120,
      yoyo: true,
      repeat: 5,
      onComplete: () => flash.destroy(),
    });

    const alert = this.add.text(W / 2, H / 2 - 140, '⚠ ALERTA ⚠', {
      fontFamily: 'monospace',
      fontSize: '40px',
      color: '#ff2b2b',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5).setAlpha(0);

    this.tweens.add({
      targets: alert,
      alpha: { from: 0, to: 1 },
      duration: 120,
      yoyo: true,
      repeat: 7,
      onComplete: () => alert.destroy(),
    });

    // borde rojo que pulsa como una sirena
    const border = this.add.graphics();
    const drawBorder = () => {
      border.clear();
      border.lineStyle(6, 0xff2b2b, 0.8);
      border.strokeRect(3, 3, W - 6, H - 6);
    };
    drawBorder();
    this.tweens.add({
      targets: border,
      alpha: { from: 0.2, to: 1 },
      duration: 150,
      yoyo: true,
      repeat: 8,
      onComplete: () => border.destroy(),
    });
  }

  setPlanetDanger(on) {
    if (this.planetLayers) {
      for (const layer of this.planetLayers) layer.setDanger(on);
    }
  }

  spawnExplosion(x, y, size) {
    this.explosions.push(new Explosion(this, x, y, size * 0.9));
  }

  // explosión distinta al impactar un enemigo contra el escudo del jugador
  spawnShieldExplosion(x, y) {
    this.explosions.push(new Explosion(this, x, y, CFG.SHIELD_EXPLOSION_RADIUS, 0xff3b4a));
  }

  // línea vertical roja tipo escudo que aparece y se desvanece enseguida
  spawnShieldFlash() {
    const x = CFG.PLAYER_X;
    const line = this.add.rectangle(x, CFG.HEIGHT / 2, 4, CFG.HEIGHT, 0xff2b3a).setOrigin(0.5, 0.5);
    line.setAlpha(0);
    this.tweens.add({
      targets: line,
      alpha: { from: 0, to: 0.85 },
      duration: 80,
      yoyo: true,
      hold: 60,
      onComplete: () => line.destroy(),
    });
  }

  endGame() {
    this.gameOver = true;
    this.scene.pause();
    const ui = this.scene.get('UIScene');
    if (ui) ui.showGameOver(this.scoreSystem.score);
  }

  tryFire() {
    this.fireQueue.push(this.time.now);
  }

  doFire() {
    const p = this.player;
    const tipX = p.getGunTipX();
    const tipY = p.getGunTipY();
    const sizeFactor = this.time.now < this.bigBoyUntil ? CFG.BIG_BOY_SIZE_MULT : 1;
    const weapon = this.getWeapon();
    const bullet = new Bullet(this, tipX, tipY, p.getGunRadians(), sizeFactor, weapon);
    this.bullets.add(bullet.sprite);
    bullet.sprite.setData('life', 0);
    bullet.sprite.setData('handler', bullet);
  }

  update(time, delta) {
    if (this.gameOver) return;

    // animar explosiones siempre (incluida la gran explosión del BOSS)
    this.explosions = this.explosions.filter((e) => e.update(delta));

    // durante la transición de fase solo se anima el túnel
    if (this.inTransition) {
      if (this.tunnel) this.updateTunnel(delta);
      if (this.stars) {
        for (const s of this.stars) s.update(delta);
      }
      if (this.planetLayers) {
        for (const layer of this.planetLayers) layer.update(delta);
      }
      return;
    }

    if (this.stars) {
      for (const s of this.stars) s.update(delta);
    }
    if (this.planetLayers) {
      for (const layer of this.planetLayers) layer.update(delta);
    }
    if (this.controls) this.controls.update(delta);

    // mover estrellas de power up que caen
    if (this.powerUpSystem) this.powerUpSystem.update(delta);

    const elapsed = this.time.now - this.startTime;

    // spawn y movimiento de enemigos / boss
    if (this.spawner) {
      this.spawner.update(time, elapsed);
      this.spawner.updateAll(delta, time);
    }

    // gestionar disparos en cola respetando el cooldown del arma (base de tiempo de escena)
    const now = this.time.now;
    const weapon = this.getWeapon();
    if (this.fireQueue.length > 0 && now - this.lastFireTime >= weapon.cooldown) {
      this.fireQueue.shift();
      this.doFire();
      this.lastFireTime = now;
    }

    // destruir balas fuera de pantalla o tras su vida máxima (snapshot para seguridad)
    const bullets = this.bullets.getChildren().slice();
    for (const b of bullets) {
      if (!b.active) continue;
      const handler = b.getData('handler');
      if (handler && handler.update) handler.update();

      const life = (b.getData('life') || 0) + delta;
      b.setData('life', life);
      if (
        life > CFG.BULLET_LIFE ||
        b.x < CFG.PLAYER_X - 40 || b.x > CFG.WIDTH + 20 ||
        b.y < -20 || b.y > CFG.HEIGHT + 20
      ) {
        b.destroy();
      }
    }
  }
}