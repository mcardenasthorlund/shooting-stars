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
    // la vida del BOSS crece con cada oleada según la dificultad seleccionada.
    // La base es CFG.BOSS_LIFE (25); al comenzar una partida nueva (wave=1) se
    // vuelve al valor inicial, por lo que CONTINUAR no arrastra el incremento.
    const inc = this.scene.getBossLifeInc ? this.scene.getBossLifeInc() : 0;
    const bossLife = CFG.BOSS_LIFE + inc * (this.scene.wave - 1);
    this.boss = new Boss(this.scene, CFG.WIDTH + 60, CFG.HEIGHT / 2, bossLife);
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
    // enemigo3 desde la fase 2 (no como variante forzada, para no mezclarlo con Alt+N).
    // En dificultad alta hay más spawns (intervalo menor), así que la probabilidad
    // se reduce con la dificultad y se limita el nº de enemy3 simultáneos en pantalla.
    if (!variant && this.scene.wave >= CFG.ENEMY3_START_WAVE) {
      const chance = Phaser.Math.Clamp(0.25 / (this.scene.difficulty || 1), 0, 0.25);
      if (Math.random() < chance && this.countActiveEnemy3() < CFG.ENEMY3_MAX_ACTIVE) {
        const enemy = new Enemy3(this.scene, CFG.WIDTH + 30, y);
        this.enemies.add(enemy.sprite);
        enemy.sprite.setData('handler', enemy);
        return;
      }
    }
    // enemigo4 desde la fase 3 (original que se duplica al quedarse con 3 de vida)
    if (!variant && this.scene.wave >= CFG.ENEMY4_START_WAVE) {
      const chance4 = Phaser.Math.Clamp(0.2 / (this.scene.difficulty || 1), 0, 0.2);
      if (Math.random() < chance4) {
        const enemy4 = new Enemy4(this.scene, CFG.WIDTH + 30, y);
        this.enemies.add(enemy4.sprite);
        enemy4.sprite.setData('handler', enemy4);
        return;
      }
    }
    const enemy = new Enemy(this.scene, CFG.WIDTH + 30, y, variant);
    this.enemies.add(enemy.sprite);
    enemy.sprite.setData('handler', enemy);
  }

  spawnVariantEnemy() {
    this.spawnEnemy(0, true);
  }

  // nº de enemigos Enemy3 activos en pantalla (para limitarlos en dificultad alta)
  countActiveEnemy3() {
    let n = 0;
    this.enemies.children.iterate((s) => {
      if (!s || !s.active) return;
      const h = s.getData('handler');
      if (h instanceof Enemy3) n++;
    });
    return n;
  }

  updateAll(dt, time) {
    const lineX = CFG.PLAYER_X;
    this.enemies.children.iterate((s) => {
      if (!s || !s.active) return;
      const h = s.getData('handler');
      if (h) h.update(dt, time / 1000);
      if (s.x < lineX && !s.getData('passedLine')) {
        s.setData('passedLine', true);
        if (h instanceof Boss) {
          // el BOSS al llegar a la línea mata al jugador instantáneamente
          this.scene.player.damage(CFG.MAX_HEALTH);
          this.scene.events.emit('player-hurt', this.scene.player.health);
          if (this.scene.game.sfx) this.scene.game.sfx.damage();
          s.destroy();
          if (!this.scene.gameOver) {
            this.scene.endGame();
          }
        } else {
          // daño al cruzar la línea: por defecto -10% de la vida total, salvo que el
          // enemigo defina su propio daño (Enemy4 y su clon: 10 / 5 / 15 con venganza)
          const dmg = (h && h.damageOnHit)
            ? h.damageOnHit
            : (CFG.MAX_HEALTH * CFG.CONTACT_DAMAGE_PERCENT) / 100;
          this.scene.player.damage(dmg);
          this.scene.events.emit('player-hurt', this.scene.player.health);
          if (this.scene.game.sfx) this.scene.game.sfx.damage();
          this.scene.spawnShieldExplosion(s.x, s.y);
          this.scene.spawnShieldFlash();
          s.destroy();
          if (!this.scene.player.isAlive() && !this.scene.gameOver) {
            this.scene.endGame();
          }
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
    // al empezar una fase nueva el reloj (gameplayTime) vuelve a 0, así que el
    // siguiente spawn debe poder dispararse de inmediato (si no, el primer
    // enemigo no aparecería hasta los ~60s, justo cuando llega el BOSS)
    this.nextSpawnTime = 0;
    this.bossSpawned = false;
    this.bossActive = false;
    this.boss = null;
  }

  get activeEnemies() {
    return this.enemies.countActive(true);
  }
}