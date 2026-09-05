class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    const { WIDTH: W, HEIGHT: H } = CFG;
    this.gameOver = false;

    // música de fondo de la partida (no suena en la pantalla de inicio)
    if (this.game.music) this.game.music.stop();
    this.game.music = this.sound.add('music', { loop: true, volume: 0.5 });
    this.game.music.play();
    // música del BOSS (se activa al aparecer el jefe)
    if (this.game.bossMusic) this.game.bossMusic.stop();
    this.game.bossMusic = this.sound.add('boss_music', { loop: true, volume: 0.5 });
    // música del BOSS FINAL (oleada 5)
    if (this.game.finalBossMusic) this.game.finalBossMusic.stop();
    this.game.finalBossMusic = this.sound.add('boss_final_music', { loop: true, volume: 0.5 });

    // efectos de sonido procedurales
    this.game.sfx = this.game.sfx || new SoundFX();

    this.setAimCursor(true);
    this.setupTouchAim();

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

    // planeta de fondo que protege al jugador, pegado al borde izquierdo.
    // Se crea DESPUÉS de estrellas y planetas parallax pero ANTES del jugador,
    // para que el fondo pase por detrás de él y él quede por delante del jugador.
    const backPlanet = this.add.image(0, H / 2, 'back_planet_img');
    backPlanet.setOrigin(0, 0.5);

    this.player = new Player(this, CFG.PLAYER_X, CFG.PLAYER_Y);
    // al iniciar una nueva partida se resetean las armas compradas/equipadas
    this.game.ownedWeapons = [];
    this.game.equippedWeapon = null;
    this.controls = new InputHandler(this, this.player);

    this.bullets = this.physics.add.group();
    this.grenadeGroup = this.physics.add.group();
    this.finalSwords = this.physics.add.group();
    this.lastFireTime = -CFG.FIRE_COOLDOWN;
    this.fireQueue = [];
    this.grenadeShotsLeft = 0;

    // munición del cargador (solo armas con magSize) y recarga
    this.reloadWeapon();

    this.spawner = new EnemySpawner(this);
    this.startTime = this.time.now;
    this.gameplayTime = 0;
    // conservar la puntuación si venimos de CONTINUAR tras el boss final
    this.scoreSystem = new ScoreSystem(this.game.retainedScore || 0);
    this.game.retainedScore = 0;
    this.powerUpSystem = new PowerUpSystem(this);
    this.bigBoyUntil = 0;
    this.explosions = [];
    this.wave = 1;
    this.difficulty = this.game.selectedDifficulty || 1;
    // dificultad base seleccionada (sin la progresión +0.25 por oleada), usada por el boss final
    this.baseDifficulty = this.game.selectedDifficulty || 1;
    this.inTransition = false;
    this.tunnel = null;
    this.tunnelZ = 0;
    this.bossSpawnedThisWave = false;
    this.shopOpened = false;
    this.victoryPending = false;
    this.timestopActive = false;
    this.timestopUntil = 0;
    this.timestopOverlay = null;
    this.timestopText = null;
    this.finalBoss = null;
    this.finalBossActive = false;
    this.finalVictoryShown = false;

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
    this.input.keyboard.on('keydown-Z', (event) => {
      if (event.shiftKey) this.triggerVictory();
    });
    this.input.keyboard.on('keydown-X', (event) => {
      if (event.shiftKey) {
        this.scoreSystem.add(10000);
        this.events.emit('enemy-killed', 10000);
      }
    });
    this.input.keyboard.on('keydown-B', (event) => {
      if (event.ctrlKey) this.powerUpSystem.spawnRandom();
    });
    this.input.keyboard.on('keydown-C', (event) => {
      if (event.shiftKey) this.startFinalBoss();
    });
    this.input.keyboard.on('keydown-V', (event) => {
      if (event.shiftKey) this.forceFinalVictory();
    });
    this.input.keyboard.on('keydown-ONE', () => this.activateSlot(0));
    this.input.keyboard.on('keydown-TWO', () => this.activateSlot(1));
    this.input.keyboard.on('keydown-THREE', () => this.activateSlot(2));
  }

  setupCollisions() {
    this.physics.add.overlap(this.bullets, this.spawner.enemies, this.onBulletEnemy, null, this);
    this.physics.add.overlap(this.grenadeGroup, this.spawner.enemies, this.onGrenadeEnemy, null, this);
    this.physics.add.overlap(this.bullets, this.powerUpSystem.group, this.onBulletPowerUp, null, this);
    this.physics.add.overlap(this.grenadeGroup, this.powerUpSystem.group, this.onGrenadePowerUp, null, this);
    this.physics.add.overlap(this.bullets, this.finalSwords, this.onBulletFinalSword, null, this);
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
        if (this.game.sfx) this.game.sfx.explosion();
        this.scoreSystem.add(handler.points);
        this.events.emit('enemy-killed', handler.points);
      }
    }
  }

  // impacto directo de una granada: 10 de daño + explosión en área
  onGrenadeEnemy(grenadeSprite, enemySprite) {
    const handler = enemySprite.getData('handler');
    if (handler) {
      this.handleHit(handler, enemySprite, CFG.GRANADE_DIRECT_DAMAGE);
    }
    this.explodeGrenade(grenadeSprite);
  }

  // la granada choca con un power up: se recoge y la granada explota
  onGrenadePowerUp(grenadeSprite, powerUpSprite) {
    const handler = powerUpSprite.getData('handler');
    if (handler) {
      this.powerUpSystem.collect(handler.type);
      powerUpSprite.destroy();
    }
    this.explodeGrenade(grenadeSprite);
  }

  // explosión de la granada: 1/8 de pantalla + 5 de daño a los enemigos cercanos
  explodeGrenade(grenadeSprite) {
    if (!grenadeSprite || !grenadeSprite.active) return;
    const cx = grenadeSprite.x;
    const cy = grenadeSprite.y;
    this.spawnExplosion(cx, cy, CFG.GRANADE_EXPLOSION_RADIUS);
    if (this.game.sfx) this.game.sfx.explosion(0.85);

    if (this.spawner) {
      const list = this.spawner.enemies.getChildren().slice();
      for (const s of list) {
        if (!s.active) continue;
        const dist = Phaser.Math.Distance.Between(cx, cy, s.x, s.y);
        if (dist <= CFG.GRANADE_EXPLOSION_RADIUS) {
          const h = s.getData('handler');
          if (h) this.handleHit(h, s, CFG.GRANADE_EXPLOSION_DAMAGE);
        }
      }
    }

    // la explosión también daña las espadas del boss final dentro del radio
    const swords = this.finalSwords.getChildren().slice();
    for (const s of swords) {
      if (!s.active) continue;
      const dist = Phaser.Math.Distance.Between(cx, cy, s.x, s.y);
      if (dist <= CFG.GRANADE_EXPLOSION_RADIUS) {
        this.hitFinalSword(s, CFG.GRANADE_EXPLOSION_DAMAGE);
      }
    }

    // la explosión también recoge los power ups que estén dentro del radio
    if (this.powerUpSystem) {
      const stars = this.powerUpSystem.group.getChildren().slice();
      for (const s of stars) {
        if (!s.active) continue;
        const dist = Phaser.Math.Distance.Between(cx, cy, s.x, s.y);
        if (dist <= CFG.GRANADE_EXPLOSION_RADIUS) {
          const h = s.getData('handler');
          if (h) {
            this.powerUpSystem.collect(h.type);
            s.destroy();
          }
        }
      }
    }

    const h = grenadeSprite.getData('handler');
    if (h) h.destroy();
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
        this.damageAllSwords(CFG.BIG_BOOM_DAMAGE);
        break;
      case 'SHIELD':
        this.player.setShield(CFG.RIOT_SHIELD_AMOUNT);
        this.events.emit('player-hurt', this.player.health);
        break;
      case 'TIMESTOP':
        this.activateTimeStop();
        break;
      case 'GRANADE':
        this.grenadeShotsLeft = CFG.GRANADE_SHOTS;
        this.fireQueue = []; // descartar pulsaciones previas en cola
        break;
    }
  }

  // congela a los enemigos unos segundos: pantalla grisácea + cuenta atrás
  activateTimeStop() {
    this.timestopUntil = this.time.now + CFG.TIMESTOP_DURATION;
    this.timestopActive = true;

    // congelar a los enemigos que haya en pantalla: velocidad a 0 para que la física los detenga
    if (this.spawner) {
      const list = this.spawner.enemies.getChildren().slice();
      for (const s of list) {
        if (s && s.active && s.body) s.body.setVelocity(0, 0);
      }
    }

    // congelar también las espadas del boss final (la física las movería si no)
    if (this.finalSwords) {
      const swords = this.finalSwords.getChildren().slice();
      for (const s of swords) {
        if (s && s.active && s.body) s.body.setVelocity(0, 0);
      }
    }

    const { WIDTH: W, HEIGHT: H } = CFG;
    if (this.timestopOverlay) this.timestopOverlay.destroy();
    if (this.timestopText) this.timestopText.destroy();

    this.timestopOverlay = this.add.rectangle(W / 2, H / 2, W, H, 0x9aa7c8, 0.28).setDepth(100);
    this.timestopText = this.add.text(W / 2, H / 2 - 120, '', {
      fontFamily: 'monospace',
      fontSize: '34px',
      color: '#c8d2ea',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5).setDepth(101);
  }

  endTimeStop() {
    this.timestopActive = false;
    if (this.timestopOverlay) {
      this.timestopOverlay.destroy();
      this.timestopOverlay = null;
    }
    if (this.timestopText) {
      this.timestopText.destroy();
      this.timestopText = null;
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

  // BIG BOOM daña también todas las espadas del boss final
  damageAllSwords(amount) {
    const swords = this.finalSwords.getChildren().slice();
    for (const s of swords) {
      if (!s.active) continue;
      this.hitFinalSword(s, amount);
    }
  }

  // inicia la oleada 5: el boss final aparece desde la derecha con slide-in
  startFinalBoss() {
    if (this.finalBossActive || this.finalBoss) return;

    this.finalBossActive = true;
    this.victoryPending = true; // durante el boss final no aparecen enemigos

    // explosión que elimina a todos los enemigos que hubiera
    if (this.spawner) this.spawner.clearEnemies();

    // en dificultad EXTREMA no se confiscan las armas ni se muestra el mensaje
    this.isExtremeRun = (this.game.selectedDifficulty || 1) >= 1.8;
    if (!this.isExtremeRun) {
      // se confiscan las armas: solo el BLASTER
      this.player.setWeapon(CFG.DEFAULT_WEAPON);
      this.reloadWeapon();
      this.grenadeShotsLeft = 0;
      this.fireQueue = [];
    }

    this.finalBoss = new FinalBoss(this);

    // alarma: planetas rojos + música del boss + WARNING + calavera
    this.setPlanetDanger(true);
    this.fadeMusic(this.game.music, 0, 500, () => {
      if (this.game.music && this.game.music.isPlaying) this.game.music.pause();
    });
    if (this.game.finalBossMusic) {
      if (!this.game.finalBossMusic.isPlaying) this.game.finalBossMusic.play();
      this.game.finalBossMusic.setVolume(0);
      this.fadeMusic(this.game.finalBossMusic, 0.5, 500);
    }
    this.showFinalBossWarning();

    this.events.emit('final-boss-spawned');
    this.events.emit('wave-started', CFG.TOTAL_WAVES);
  }

  // atajo May+V: elimina al boss final al instante y muestra la victoria
  forceFinalVictory() {
    if (!this.finalBoss || !this.finalBoss.sprite.active) {
      this.startFinalBoss();
    }
    if (this.finalBoss && this.finalBoss.sprite.active) {
      this.finalBoss.damage(CFG.FINAL_BOSS_LIFE);
    }
  }

  // aviso WARNING con calavera y el texto de las armas confiscadas
  showFinalBossWarning() {
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

    // textura procedural de la calavera
    if (!this.textures.exists('skull_img')) {
      const g = this.make.graphics({ x: 0, y: 0 }, false);
      g.fillStyle(0xf0f0f0, 1);
      g.fillRoundedRect(8, 10, 32, 26, 6);
      g.fillStyle(0x05070f, 1);
      g.fillRect(13, 16, 8, 9);
      g.fillRect(27, 16, 8, 9);
      g.fillTriangle(22, 22, 26, 22, 24, 27);
      g.fillStyle(0x05070f, 1);
      g.fillRect(18, 30, 4, 5);
      g.fillRect(23, 30, 4, 5);
      g.fillRect(28, 30, 4, 5);
      g.generateTexture('skull_img', 48, 48);
      g.destroy();
    }

    const skull = this.add.image(W / 2, H / 2 - 90, 'skull_img').setScale(1.4).setAlpha(0);
    this.tweens.add({
      targets: skull,
      alpha: { from: 0, to: 1 },
      duration: 120,
      yoyo: true,
      repeat: 7,
      onComplete: () => skull.destroy(),
    });

    const alert = this.add.text(W / 2, H / 2 - 160, '⚠ WARNING ⚠', {
      fontFamily: 'monospace',
      fontSize: '44px',
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

    // en EXTREMO no se muestra el mensaje de confiscación de armas
    if (!this.isExtremeRun) {
      const info = this.add.text(W / 2, H / 2 - 10, 'Has entrado en la zona prohibida, tus armas han sido confiscadas y solo puedes usar el BLASTER', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#ffd93b',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: W - 120 },
      }).setOrigin(0.5, 0.5).setAlpha(0);
      // desaparece junto con el warning (mismo timing que la alerta y la calavera)
      this.tweens.add({
        targets: info,
        alpha: { from: 0, to: 1 },
        duration: 120,
        yoyo: true,
        repeat: 7,
        onComplete: () => info.destroy(),
      });
    }

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

  // una bala del jugador toca una espada:
  // - espada normal -> se orienta al boss y vuelve a gran velocidad
  // - espada fantasma -> se destruye (el jugador debe eliminarlas)
  onBulletFinalSword(bullet, swordSprite) {
    bullet.destroy();
    const h = swordSprite.getData('handler');
    if (!h) return;
    if (h.ghost || h.red) {
      // las espadas fantasma y roja se destruyen disparándoles (la roja tiene 2 vidas)
      h.life -= 1;
      if (h.life <= 0) {
        this.spawnExplosion(swordSprite.x, swordSprite.y, CFG.ENEMY_EXPLOSION_RADIUS);
        if (this.game.sfx) this.game.sfx.explosion(0.6);
        h.destroy();
      } else {
        // parpadeo al recibir el primer impacto
        swordSprite.setTint(0xffffff);
        this.time.delayedCall(60, () => {
          if (swordSprite.active) swordSprite.setTint(h.red ? CFG.RED_SWORD_COLOR : CFG.GHOST_COLOR);
        });
      }
    } else {
      h.returnToBoss();
      if (this.game.sfx) this.game.sfx.shot(0.3);
    }
  }

  // resta vida a una espada; se destruye (con explosión) al llegar a 0
  hitFinalSword(swordSprite, amount) {
    if (!swordSprite || !swordSprite.active) return;
    const h = swordSprite.getData('handler');
    if (!h) return;
    h.life -= amount;
    if (h.life <= 0) {
      this.spawnExplosion(swordSprite.x, swordSprite.y, CFG.ENEMY_EXPLOSION_RADIUS);
      if (this.game.sfx) this.game.sfx.explosion(0.6);
      h.destroy();
    }
  }

  // espada devuelta que impacta contra el boss final: 50 de daño
  checkReturnedSwordHit() {
    if (!this.finalBoss || !this.finalBoss.sprite.active) return;
    const boss = this.finalBoss.sprite;
    const swords = this.finalSwords.getChildren().slice();
    for (const s of swords) {
      if (!s.active) continue;
      const h = s.getData('handler');
      if (!h || !h.returning) continue;
      const dist = Phaser.Math.Distance.Between(s.x, s.y, boss.x, boss.y);
      if (dist < boss.width * 0.6) {
        this.spawnExplosion(boss.x, boss.y, 40);
        if (this.game.sfx) this.game.sfx.explosion(0.7);
        h.destroy();
        this.finalBoss.damage(CFG.FINAL_SWORD_BOSS_DAMAGE);
      }
    }
  }

  // espadas que cruzan la línea del jugador
  checkSwordPlayerLine() {
    const lineX = CFG.PLAYER_X;
    const swords = this.finalSwords.getChildren().slice();
    for (const s of swords) {
      if (!s.active) continue;
      const h = s.getData('handler');
      if (!h || h.returning || h.passedLine) continue;
      if (s.x <= lineX) {
        h.passedLine = true;
        const dmg = h.ghost ? CFG.GHOST_SWORD_DAMAGE : CFG.FINAL_SWORD_DAMAGE;
        this.player.damage(dmg);
        this.events.emit('player-hurt', this.player.health);
        if (this.game.sfx) this.game.sfx.damage();
        this.spawnShieldExplosion(s.x, s.y);
        this.spawnShieldFlash();
        h.destroy();
        if (!this.player.isAlive() && !this.gameOver) {
          this.endGame();
        }
      }
    }
  }

  onBossKilled(boss, bossSprite) {
    // a partir de aquí no deben aparecer más enemigos hasta la siguiente fase
    this.victoryPending = true;

    // puntos del BOSS
    this.scoreSystem.add(boss.points);
    this.events.emit('enemy-killed', boss.points);

    // cura 30 de vida sin superar el máximo
    this.player.heal(CFG.BOSS_HEAL_AMOUNT);
    this.events.emit('player-hurt', this.player.health);

    // gran explosión que cubre toda la pantalla
    this.spawnExplosion(bossSprite.x, bossSprite.y, CFG.BOSS_EXPLOSION_RADIUS);
    if (this.game.sfx) this.game.sfx.explosion(1);

    // elimina a todos los enemigos que queden en pantalla
    if (this.spawner) this.spawner.clearEnemies();

    // fin de la alarma: los planetas vuelven a su color normal
    this.setPlanetDanger(false);

    // se detiene la música del BOSS con fundido (la del juego se reanudará al salir de la tienda)
    this.fadeMusic(this.game.bossMusic, 0, 500, () => {
      if (this.game.bossMusic && this.game.bossMusic.isPlaying) this.game.bossMusic.stop();
    });

    // se espera a que termine la explosión del BOSS y después suena la victoria
    this.time.delayedCall(CFG.BOSS_EXPLOSION_DELAY, () => this.showVictory());
  }

  onFinalBossKilled(boss) {
    this.scoreSystem.add(boss.points);
    this.events.emit('enemy-killed', boss.points);

    this.player.heal(CFG.BOSS_HEAL_AMOUNT);
    this.events.emit('player-hurt', this.player.health);

    this.spawnExplosion(boss.sprite.x, boss.sprite.y, CFG.BOSS_EXPLOSION_RADIUS);
    if (this.game.sfx) this.game.sfx.explosion(1);

    const swords = this.finalSwords.getChildren().slice();
    for (const s of swords) {
      if (s.active) {
        this.spawnExplosion(s.x, s.y, CFG.ENEMY_EXPLOSION_RADIUS);
        s.destroy();
      }
    }

    this.setPlanetDanger(false);
    this.fadeMusic(this.game.finalBossMusic, 0, 500, () => {
      if (this.game.finalBossMusic && this.game.finalBossMusic.isPlaying) this.game.finalBossMusic.stop();
    });

    this.time.delayedCall(CFG.BOSS_EXPLOSION_DELAY, () => this.showFinalVictory());
  }

  // pantalla de victoria final: CONTINUAR (dificultad superior) o TERMINAR
  showFinalVictory() {
    if (this.finalVictoryShown) return;
    this.finalVictoryShown = true;
    this.victoryPending = true;
    const { WIDTH: W, HEIGHT: H } = CFG;

    const title = this.add.text(W / 2, H / 2 - 120, 'VENGANZA CUMPLIDA', {
      fontFamily: 'monospace',
      fontSize: '46px',
      color: '#ffd93b',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5).setAlpha(0).setScale(0.6).setDepth(90);
    this.tweens.add({
      targets: title,
      alpha: 1,
      scale: { from: 0.6, to: 1 },
      duration: 500,
      ease: 'Back.easeOut',
    });

    this.add.text(W / 2, H / 2 + 10, "Madre mía!!! Hay más enemigos!!! No quieren atacarte pero tú puedes atacarlos, ¿qué quieres hacer?", {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#c8d2ea',
      align: 'center',
      wordWrap: { width: W - 160 },
    }).setOrigin(0.5, 0.5).setDepth(90);

    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.5).setDepth(88).setInteractive();

    this.add.text(W / 2, H / 2 + 60, 'Pulsa ENTER o toca CONTINUAR para seguir', {
      fontFamily: 'monospace', fontSize: '15px', color: '#9aa7c8',
    }).setOrigin(0.5, 0.5).setDepth(90);

    const contBtn = this.add.rectangle(W / 2 - 140, H / 2 + 120, 240, 50, 0x1a2340).setDepth(91).setInteractive();
    this.add.text(W / 2 - 140, H / 2 + 120, 'CONTINUAR', {
      fontFamily: 'monospace', fontSize: '20px', color: '#39ff6e', fontStyle: 'bold',
    }).setOrigin(0.5, 0.5).setDepth(92);
    contBtn.on('pointerover', () => contBtn.setFillStyle(0x2a3a5a, 1));
    contBtn.on('pointerout', () => contBtn.setFillStyle(0x1a2340, 1));
    contBtn.on('pointerdown', () => this.continueHigherDifficulty());

    const endBtn = this.add.rectangle(W / 2 + 140, H / 2 + 120, 240, 50, 0x1a2340).setDepth(91).setInteractive();
    this.add.text(W / 2 + 140, H / 2 + 120, 'TERMINAR', {
      fontFamily: 'monospace', fontSize: '20px', color: '#ff5a5a', fontStyle: 'bold',
    }).setOrigin(0.5, 0.5).setDepth(92);
    endBtn.on('pointerover', () => endBtn.setFillStyle(0x2a3a5a, 1));
    endBtn.on('pointerout', () => endBtn.setFillStyle(0x1a2340, 1));
    endBtn.on('pointerdown', () => this.endFinalGame());

    // solo se continúa con ENTER (o los botones); un click genérico no avanza
    this.input.keyboard.once('keydown-ENTER', () => this.continueHigherDifficulty());
  }

  // CONTINUAR: reinicia el juego en la dificultad superior manteniendo la puntuación
  continueHigherDifficulty() {
    // selectedDifficulty se guarda como NÚMERO (el multiplicador, igual que BootScene)
    const cur = this.game.selectedDifficulty || 1;
    let next = cur;
    for (const d of Object.values(CFG.DIFFICULTIES)) {
      if (d.mult > cur + 0.0001) { next = d.mult; break; }
    }
    this.game.selectedDifficulty = next;
    this.game.retainedScore = this.scoreSystem.score;
    this.scene.stop('UIScene');
    this.scene.stop('GameScene');
    // reinicio defensivo de la instancia reutilizada (mismo patrón que BootScene.start)
    const gs = this.scene.get('GameScene');
    if (gs) {
      gs.wave = 1;
      gs.difficulty = next;
      gs.startTime = this.time.now;
      gs.gameplayTime = 0;
      gs.inTransition = false;
      gs.gameOver = false;
      gs.victoryPending = false;
      gs.finalBossActive = false;
      if (gs.spawner) gs.spawner.resetWave();
    }
    this.scene.start('GameScene');
    this.scene.launch('UIScene');
  }

  // TERMINAR: registra el récord y vuelve al menú principal
  endFinalGame() {
    this.game.records.submit(this.scoreSystem.score);
    this.scene.stop('UIScene');
    this.scene.stop('GameScene');
    this.scene.start('BootScene');
  }

  // fundido de volumen de una pista de música (Phaser tweenea la propiedad volume)
  fadeMusic(sound, targetVolume, duration, onComplete) {
    if (!sound) {
      if (onComplete) onComplete();
      return;
    }
    this.tweens.add({
      targets: sound,
      volume: targetVolume,
      duration,
      ease: 'Linear',
      onComplete: () => {
        if (onComplete) onComplete();
      },
    });
  }

  // atajo Ctrl+Z: fuerza la pantalla de victoria y después la tienda
  triggerVictory() {
    // detener los spawns: la victoria se está mostrando
    this.victoryPending = true;
    // se detiene la música del BOSS con fundido (la del juego se reanudará al salir de la tienda)
    this.fadeMusic(this.game.bossMusic, 0, 500, () => {
      if (this.game.bossMusic && this.game.bossMusic.isPlaying) this.game.bossMusic.stop();
    });
    this.showVictory();
  }

  // muestra "VICTORY" mientras suena victoria.mp3 y luego abre el menú de la tienda
  showVictory() {
    if (this.shopOpened) return;
    const { WIDTH: W, HEIGHT: H } = CFG;

    const victoryText = this.add.text(W / 2, H / 2 - 40, 'VICTORY', {
      fontFamily: 'monospace',
      fontSize: '72px',
      color: '#ffd93b',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5).setDepth(90).setAlpha(0).setScale(0.6);
    this.tweens.add({
      targets: victoryText,
      alpha: 1,
      scale: { from: 0.6, to: 1 },
      duration: 500,
      ease: 'Back.easeOut',
    });

    // victoria.mp3 suena una sola vez; la tienda se abre al terminar el audio
    const victory = this.sound.add('victory', { volume: 1 });
    const durationMs = Math.max(2000, (victory.totalDuration || 3) * 1000);
    victory.play();

    this.time.delayedCall(durationMs, () => {
      if (victoryText.active) victoryText.destroy();
      this.openShop();
    });
  }

  getWeapon() {
    return CFG.WEAPONS[this.player.weapon] || CFG.WEAPONS[CFG.DEFAULT_WEAPON];
  }

  // pausa la partida y muestra el menú de victoria del BOSS (con la tienda)
  openShop() {
    if (this.shopOpened) return;
    this.shopOpened = true;
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
    this.gameplayTime = 0;
    this.bossSpawnedThisWave = false;
    this.inTransition = false;
    this.shopOpened = false;
    this.victoryPending = false;
    this.events.emit('wave-started', this.wave);

    // la oleada 5 es el boss final: aparece al entrar en ella
    if (this.wave >= CFG.TOTAL_WAVES) {
      this.time.delayedCall(100, () => this.startFinalBoss());
    }
  }

  // alarma visual al aparecer el BOSS: flash rojo + planetas rojos + alerta
  bossAlarm() {
    this.setPlanetDanger(true);

    // música: fundido de salida de la del juego y fundido de entrada de la del BOSS
    this.fadeMusic(this.game.music, 0, 500, () => {
      if (this.game.music && this.game.music.isPlaying) this.game.music.pause();
    });
    if (this.game.bossMusic) {
      if (!this.game.bossMusic.isPlaying) this.game.bossMusic.play();
      this.game.bossMusic.setVolume(0);
      this.fadeMusic(this.game.bossMusic, 0.5, 500);
    }

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
    this.setAimCursor(false);
    if (this.aimSprite) this.aimSprite.setVisible(false);
    if (this.game.music && this.game.music.isPlaying) this.game.music.stop();
    if (this.game.bossMusic && this.game.bossMusic.isPlaying) this.game.bossMusic.stop();
    if (this.game.finalBossMusic && this.game.finalBossMusic.isPlaying) this.game.finalBossMusic.stop();
    this.scene.pause();
    const ui = this.scene.get('UIScene');
    if (ui) ui.showGameOver(this.scoreSystem.score);
  }

  // cambia el cursor del canvas entre la mira de disparo y el por defecto
  setAimCursor(active) {
    const canvas = this.sys.canvas;
    if (!canvas) return;
    if (!active) {
      canvas.style.cursor = 'default';
      return;
    }
    if (this.aimCursor) {
      canvas.style.cursor = this.aimCursor;
      return;
    }
    const size = 32;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const g = c.getContext('2d');
    const cx = size / 2;
    g.strokeStyle = '#ff3b3b';
    g.lineWidth = 2;
    g.beginPath();
    g.arc(cx, cx, 7, 0, Math.PI * 2);
    g.stroke();
    g.beginPath();
    g.moveTo(cx, cx - 13);
    g.lineTo(cx, cx + 13);
    g.moveTo(cx - 13, cx);
    g.lineTo(cx + 13, cx);
    g.stroke();
    g.fillStyle = '#ffffff';
    g.fillRect(cx - 1, cx - 1, 2, 2);
    this.aimCursor = 'url("' + c.toDataURL() + '") ' + cx + ' ' + cx + ', crosshair';
    canvas.style.cursor = this.aimCursor;
  }

  // mira visible en pantalla para pantallas táctiles (sigue el dedo al apuntar)
  setupTouchAim() {
    if (!this.textures.exists('aim_cursor')) {
      const g = this.make.graphics({ x: 0, y: 0 }, false);
      const cx = 16;
      g.lineStyle(3, 0xff3b3b, 1);
      g.strokeCircle(cx, cx, 8);
      g.beginPath();
      g.moveTo(cx, cx - 15);
      g.lineTo(cx, cx + 15);
      g.moveTo(cx - 15, cx);
      g.lineTo(cx + 15, cx);
      g.strokePath();
      g.fillStyle(0xffffff, 1);
      g.fillCircle(cx, cx, 1.5);
      g.generateTexture('aim_cursor', 32, 32);
      g.destroy();
    }

    this.aimSprite = this.add.image(0, 0, 'aim_cursor');
    this.aimSprite.setDepth(1000);
    this.aimSprite.setVisible(false);

    this.input.on('pointerdown', (pointer) => {
      if (pointer.pointerType !== 'touch') return;
      this.aimSprite.setVisible(true);
      this.aimSprite.setPosition(pointer.x, pointer.y);
    });
    this.input.on('pointermove', (pointer) => {
      if (pointer.pointerType !== 'touch' || !this.aimSprite.visible) return;
      this.aimSprite.setPosition(pointer.x, pointer.y);
    });
    this.input.on('pointerup', (pointer) => {
      if (pointer.pointerType !== 'touch') return;
      this.aimSprite.setVisible(false);
    });
  }

  // inicializa el cargador del arma equipada (0 balas si el arma no tiene cargador)
  reloadWeapon() {
    const weapon = this.getWeapon();
    this.ammo = weapon.magSize || 0;
    this.ammoMax = weapon.magSize || 0;
    this.reloading = false;
    this.emitAmmo();
  }

  // devuelve si el arma actual usa cargador con recarga
  usesMagazine() {
    return !!this.getWeapon().magSize;
  }

  // consumir una bala del cargador; si llega a 0 inicia la recarga (1.5s)
  consumeAmmo() {
    if (!this.usesMagazine() || this.grenadeShotsLeft > 0) return;
    this.ammo = Math.max(0, this.ammo - 1);
    this.emitAmmo();
    if (this.ammo <= 0) {
      this.startReload();
    }
  }

  // inicia la recarga: bloquea el disparo hasta que pase reloadTime
  startReload() {
    if (this.reloading) return;
    this.reloading = true;
    const weapon = this.getWeapon();
    this.time.delayedCall(weapon.reloadTime || 1500, () => {
      this.ammo = this.ammoMax;
      this.reloading = false;
      this.emitAmmo();
    });
  }

  // notifica al HUD el contador de balas restantes
  emitAmmo() {
    this.events.emit('ammo-changed', {
      current: this.ammo,
      max: this.ammoMax,
      reloading: this.reloading,
    });
  }

  tryFire() {
    // durante la recarga no se puede disparar
    if (this.reloading) return;
    // en modo GRANADE: un disparo por pulsación, ignorando las pulsaciones
    // realizadas durante el segundo de espera (no se ponen en cola)
    if (this.grenadeShotsLeft > 0) {
      const now = this.time.now;
      if (now - this.lastFireTime >= CFG.GRANADE_COOLDOWN) {
        this.lastFireTime = now;
        this.doFire();
      }
      return;
    }
    this.fireQueue.push(this.time.now);
  }

  doFire() {
    const p = this.player;
    const tipX = p.getGunTipX();
    const tipY = p.getGunTipY();

    // modo GRANADE: dispara granadas con trayectoria parabólica en vez de balas
    if (this.grenadeShotsLeft > 0) {
      this.grenadeShotsLeft--;
      const grenade = new Grenade(this, tipX, tipY, p.getGunRadians());
      this.grenadeGroup.add(grenade.sprite);
      if (this.game.sfx) this.game.sfx.shot(0.4);
      return;
    }

    const sizeFactor = this.time.now < this.bigBoyUntil ? CFG.BIG_BOY_SIZE_MULT : 1;
    const weapon = this.getWeapon();

    // SHOTGUN y armas con dispersión: disparan varias balas a la vez en abanico
    if (weapon.spread && weapon.pellets > 1) {
      const baseAngle = p.getGunRadians();
      const half = Math.floor((weapon.pellets - 1) / 2);
      for (let i = 0; i < weapon.pellets; i++) {
        const offsetDeg = (i - half) * weapon.spreadAngle;
        this.fireBullet(tipX, tipY, baseAngle + Phaser.Math.DegToRad(offsetDeg), sizeFactor, weapon);
      }
    } else {
      this.fireBullet(tipX, tipY, p.getGunRadians(), sizeFactor, weapon);
    }

    if (this.game.sfx) this.game.sfx.shot();
    this.consumeAmmo();
  }

  fireBullet(x, y, angle, sizeFactor, weapon) {
    const bullet = new Bullet(this, x, y, angle, sizeFactor, weapon);
    this.bullets.add(bullet.sprite);
    bullet.sprite.setData('life', 0);
    bullet.sprite.setData('handler', bullet);
  }

  update(time, delta) {
    if (this.gameOver) return;

    // tiempo de juego acumulado (ms), arranca en 0 al empezar la partida
    this.gameplayTime += delta;

    // temporizador del TIME STOP: actualiza la cuenta atrás y lo termina al agotarse
    if (this.timestopActive) {
      if (this.time.now >= this.timestopUntil) {
        this.endTimeStop();
      } else if (this.timestopText) {
        const remain = Math.max(0, (this.timestopUntil - this.time.now) / 1000);
        this.timestopText.setText('TIME STOP  ' + remain.toFixed(1) + 's');
      }
    }

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

    // lógica del boss final: lanza espadas, las mueve, y controla daños
    // (congelado durante el TIME STOP, igual que los enemigos)
    if (this.finalBoss && this.finalBossActive && !this.timestopActive) {
      this.finalBoss.update(delta);
      const swords = this.finalSwords.getChildren().slice();
      for (const s of swords) {
        if (!s.active) continue;
        const h = s.getData('handler');
        if (h && h.update) h.update(delta);
      }
      this.checkReturnedSwordHit();
      this.checkSwordPlayerLine();
    }

    // spawn y movimiento de enemigos / boss (congelados durante el TIME STOP
    // y durante la pantalla de victoria, donde no deben aparecer más enemigos)
    if (this.spawner && !this.timestopActive && !this.victoryPending) {
      this.spawner.update(time, this.gameplayTime);
      this.spawner.updateAll(delta, time);
    }

    // gestionar disparos en cola respetando el cooldown del arma (base de tiempo de escena)
    const now = this.time.now;
    const weapon = this.getWeapon();
    const fireCooldown = this.grenadeShotsLeft > 0 ? CFG.GRANADE_COOLDOWN : weapon.cooldown;
    if (this.fireQueue.length > 0 && this.grenadeShotsLeft <= 0 && !this.reloading && now - this.lastFireTime >= fireCooldown) {
      this.fireQueue.shift();
      this.doFire();
      this.lastFireTime = now;
    }

    // granadas: integran su trayectoria y explotan al agotar su alcance (3/4 de pantalla)
    if (this.grenadeGroup) {
      const grenades = this.grenadeGroup.getChildren().slice();
      for (const g of grenades) {
        if (!g.active) continue;
        const h = g.getData('handler');
        if (h) h.update(delta);
        if (h && h.outOfRange()) this.explodeGrenade(g);
      }
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