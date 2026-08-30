class EnemySpawner {
  constructor(scene) {
    this.scene = scene;
    this.enemies = scene.physics.add.group();
    this.nextSpawnTime = 0;
    this.bossSpawned = false;
    this.bossActive = false;
    this.boss = null;
  }

  currentInterval(elapsed) {
    const t = Phaser.Math.Clamp(elapsed / CFG.SPAWN_RAMP_TIME, 0, 1);
    const base = Phaser.Math.Linear(CFG.BASE_SPAWN_INTERVAL, CFG.MIN_SPAWN_INTERVAL, t);
    return base / (this.scene.difficulty || 1);
  }

  update(time, elapsed) {
    // BOSS: aparece una sola vez a los 60s (tiempo relativo al inicio de la partida)
    if (!this.bossSpawned && elapsed >= CFG.BOSS_TIME) {
      this.spawnBoss();
    }

    // spawn de enemigos según intervalo progresivo (tiempo relativo al inicio de partida)
    if (elapsed >= this.nextSpawnTime) {
      this.spawnEnemy(elapsed);
      this.nextSpawnTime = elapsed + this.currentInterval(elapsed);
    }
  }

  spawnBoss() {
    if (this.bossActive || this.bossSpawned) return;
    this.bossSpawned = true;
    this.bossActive = true;
    this.boss = new Boss(this.scene, CFG.WIDTH + 60, CFG.HEIGHT / 2);
    this.enemies.add(this.boss.sprite);
    this.boss.sprite.setData('handler', this.boss);
    this.scene.events.emit('boss-spawned');
  }

  spawnEnemy(elapsed, forceVariant = false) {
    const y = Phaser.Math.Between(30, CFG.HEIGHT - 30);
    // variantes tras cierto tiempo (probabilidad creciente hasta 35%)
    let variant = false;
    if (forceVariant) {
      variant = true;
    } else if (elapsed >= CFG.VARIANT_START_TIME) {
      const p = Phaser.Math.Clamp((elapsed - CFG.VARIANT_START_TIME) / CFG.SPAWN_RAMP_TIME, 0, 0.35);
      variant = Math.random() < p;
    }
    const enemy = new Enemy(this.scene, CFG.WIDTH + 30, y, variant);
    this.enemies.add(enemy.sprite);
    enemy.sprite.setData('handler', enemy);
  }

  spawnVariantEnemy() {
    this.spawnEnemy(0, true);
  }

  updateAll(dt, time) {
    const lineX = CFG.PLAYER_X;
    this.enemies.children.iterate((s) => {
      if (!s || !s.active) return;
      const h = s.getData('handler');
      if (h) h.update(dt, time / 1000);
      if (s.x < lineX && !s.getData('passedLine')) {
        s.setData('passedLine', true);
        this.scene.player.damage((CFG.MAX_HEALTH * CFG.CONTACT_DAMAGE_PERCENT) / 100);
        this.scene.events.emit('player-hurt', this.scene.player.health);
        if (this.scene.game.sfx) this.scene.game.sfx.damage();
        this.scene.spawnShieldExplosion(s.x, s.y);
        this.scene.spawnShieldFlash();
        s.destroy();
        if (!this.scene.player.isAlive() && !this.scene.gameOver) {
          this.scene.endGame();
        }
      }
    });
  }

  clearEnemies() {
    const list = this.enemies.getChildren().slice();
    for (const s of list) {
      if (s.active) {
        this.scene.spawnExplosion(s.x, s.y, CFG.ENEMY_EXPLOSION_RADIUS);
        s.destroy();
      }
    }
  }

  resetWave() {
    this.bossSpawned = false;
    this.bossActive = false;
    this.boss = null;
  }

  get activeEnemies() {
    return this.enemies.countActive(true);
  }
}