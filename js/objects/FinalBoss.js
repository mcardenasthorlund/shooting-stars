// BOSS FINAL de la oleada 5: estático a la derecha, lanza espadas.
// - Espadas normales (rebotan en paredes, se devuelven al boss al ser tocadas por una bala).
// - Espadas fantasma (azul-verdosas, el jugador debe destruirlas, no vuelven).
// - Ataque especial cada 20s: 10 fantasmas en línea horizontal hacia el jugador.
// El boss es inmune a las balas: solo le dañan las espadas devueltas (50 por impacto).

class FinalBoss {
  constructor(scene) {
    this.scene = scene;
    this.points = CFG.POINTS_PER_FINAL_BOSS;
    this.maxLife = CFG.FINAL_BOSS_LIFE;
    this.life = CFG.FINAL_BOSS_LIFE;

    this.w = CFG.FINAL_BOSS_WIDTH;
    this.h = CFG.FINAL_BOSS_HEIGHT;
    this.sprite = scene.physics.add.sprite(CFG.WIDTH + this.w, CFG.HEIGHT / 2, 'final_boss1_img');
    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.setDisplaySize(this.w, this.h);
    this.sprite.body.setSize(this.w, this.h, true);
    this.sprite.body.setAllowGravity(false);
    this.sprite.body.setImmovable(true);
    this.sprite.body.setVelocity(0, 0);

    // slide-in desde la derecha
    scene.tweens.add({
      targets: this.sprite,
      x: CFG.FINAL_BOSS_X,
      duration: 900,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        this.slideDone = true;
      },
    });
    this.slideDone = false;
    this.swayPhase = 0;

    // temporizadores (a más dificultad, más espadas = intervalos menores).
    // Se usa la dificultad BASE seleccionada (no la acumulada por oleadas)
    this.diff = scene.baseDifficulty || scene.difficulty || 1;
    this.ghostInterval = CFG.FINAL_SWORD_INTERVAL / this.diff;
    this.redInterval = CFG.FINAL_SWORD_RED_INTERVAL / this.diff;
    this.normalInterval = CFG.FINAL_SWORD_INTERVAL_NORMAL / this.diff;
    this.specialInterval = CFG.FINAL_SPECIAL_INTERVAL / this.diff;
    this.swordTimer = 0;                          // espadas fantasma
    this.redTimer = this.redInterval;             // espada roja (2 vidas)
    this.normalTimer = this.normalInterval;       // espada normal (vuelve)
    this.specialTimer = this.specialInterval;
    this.throwUntil = 0; // hasta cuándo se muestra la textura boss-final-2
  }

  // lanza una espada desde el eje X del boss en una Y aleatoria y un ángulo variado
  // (siempre hacia delante, nunca a la derecha) para despistar al jugador
  throwSword(ghost = false, red = false) {
    if (!this.sprite.active) return;
    this.throwUntil = this.scene.time.now + CFG.FINAL_BOSS_THROW_DURATION;
    this.sprite.setTexture('final_boss2_img');
    this.sprite.setDisplaySize(this.w, this.h);

    const x = this.sprite.x;
    const y = Phaser.Math.Between(40, CFG.HEIGHT - 40); // cualquier posición del eje Y
    let angle = Phaser.Math.FloatBetween(Math.PI - 0.9, Math.PI + 0.9); // abanico hacia delante
    const sword = new FinalSword(this.scene, x, y, angle, ghost, false, red);
    this.scene.finalSwords.add(sword.sprite);
    sword.sprite.setData('handler', sword);
  }

  // ataque especial: 10 espadas fantasma en línea recta horizontal (dcha -> izq)
  specialAttack() {
    if (!this.sprite.active) return;
    const { HEIGHT: H } = CFG;
    const startY = H / 2 - (CFG.FINAL_SPECIAL_COUNT / 2) * 50;
    for (let i = 0; i < CFG.FINAL_SPECIAL_COUNT; i++) {
      const y = startY + i * 50;
      const sword = new FinalSword(this.scene, this.sprite.x, y, Math.PI, true, true);
      sword.sprite.setData('handler', sword);
      this.scene.finalSwords.add(sword.sprite);
    }
  }

  damage(amount) {
    this.life -= amount;
    this.scene.events.emit('final-boss-hurt', this.life);
    this.sprite.setTint(0xffe0e0);
    if (this.life <= 0) {
      this.sprite.destroy();
      this.scene.onFinalBossKilled(this);
      return true;
    }
    this.scene.time.delayedCall(60, () => {
      if (this.sprite.active) this.sprite.clearTint();
    });
    return false;
  }

  update(delta) {
    // vaivén suave y constante tras el slide-in: retrocede ligeramente y vuelve
    if (this.slideDone && this.sprite.active) {
      this.swayPhase += (delta / 1000) * 1.5;
      this.sprite.x = CFG.FINAL_BOSS_X + Math.sin(this.swayPhase) * 10;
    }

    // volver a la textura normal tras el "flip" de lanzamiento
    if (this.sprite.active && this.scene.time.now >= this.throwUntil) {
      this.sprite.setTexture('final_boss1_img');
      this.sprite.setDisplaySize(this.w, this.h);
    }

    // espadas fantasma: una cada (intervalo / dificultad)
    this.swordTimer += delta;
    if (this.swordTimer >= this.ghostInterval) {
      this.swordTimer = 0;
      this.throwSword(true);
    }

    // espada normal (se vuelve contra el boss): una cada (10s / dificultad)
    this.normalTimer -= delta;
    if (this.normalTimer <= 0) {
      this.normalTimer = this.normalInterval;
      this.throwSword(false);
    }

    // espada roja (2 de vida): una cada (3s / dificultad)
    this.redTimer -= delta;
    if (this.redTimer <= 0) {
      this.redTimer = this.redInterval;
      this.throwSword(false, true);
    }

    // ataque especial cada (20s / dificultad)
    this.specialTimer -= delta;
    if (this.specialTimer <= 0) {
      this.specialTimer = this.specialInterval;
      this.specialAttack();
    }
  }

  destroy() {
    if (this.sprite && this.sprite.active) this.sprite.destroy();
  }
}

// Espada del boss final. Tiene dos modos:
// - bouncing: se mueve en línea recta y rebota en las paredes.
// - returning: vuelve al boss a gran velocidad (solo las espadas normales tocadas).
class FinalSword {
  constructor(scene, x, y, angle, ghost = false, straight = false, red = false) {
    this.scene = scene;
    this.ghost = ghost;
    this.red = red;
    this.life = red ? CFG.FINAL_SWORD_RED_LIFE : 1;
    const size = CFG.FINAL_SWORD_SIZE;
    this.sprite = scene.physics.add.sprite(x, y, 'final_sword_img');
    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.setDisplaySize(size, size);
    this.sprite.body.setSize(size, size, true);
    this.sprite.body.setAllowGravity(false);
    if (ghost) {
      this.sprite.setTint(CFG.GHOST_COLOR);
    } else if (red) {
      this.sprite.setTint(CFG.RED_SWORD_COLOR);
    }

    this.angle = angle;
    this.returning = false;
    this.passedLine = false;
    // velocidad variable entre 1x y 2x, escalada por la dificultad base seleccionada
    const speed = CFG.FINAL_SWORD_SPEED * (this.scene.baseDifficulty || this.scene.difficulty || 1) * Phaser.Math.FloatBetween(1, 2);
    if (straight) {
      // ataque especial: recta horizontal hacia la izquierda
      this.vx = -speed;
      this.vy = 0;
      this.sprite.rotation = Math.PI;
    } else {
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.sprite.rotation = angle;
    }
    this.sprite.setVelocity(this.vx, this.vy);
  }

  // la espada se orienta hacia el boss y vuelve a gran velocidad
  returnToBoss() {
    if (this.returning || this.ghost) return;
    this.returning = true;
    this.passedLine = true; // ya no puede volver a dañar al jugador
    const boss = this.scene.finalBoss ? this.scene.finalBoss.sprite : null;
    if (!boss || !boss.active) {
      this.sprite.destroy();
      return;
    }
    const ang = Math.atan2(boss.y - this.sprite.y, boss.x - this.sprite.x);
    this.vx = Math.cos(ang) * CFG.FINAL_SWORD_RETURN_SPEED;
    this.vy = Math.sin(ang) * CFG.FINAL_SWORD_RETURN_SPEED;
    this.sprite.rotation = ang;
  }

  destroy() {
    if (this.sprite && this.sprite.active) this.sprite.destroy();
  }

  update(delta) {
    if (!this.sprite.active) return;
    this.sprite.setVelocity(this.vx, this.vy);

    // rebotar en las paredes (bouncing) si no vuelve al boss
    if (!this.returning) {
      const half = this.sprite.width / 2;
      if (this.sprite.y < half) {
        this.sprite.y = half;
        this.vy = Math.abs(this.vy);
      } else if (this.sprite.y > CFG.HEIGHT - half) {
        this.sprite.y = CFG.HEIGHT - half;
        this.vy = -Math.abs(this.vy);
      }
      if (this.sprite.x < half) {
        this.sprite.x = half;
        this.vx = Math.abs(this.vx);
      } else if (this.sprite.x > CFG.WIDTH - half) {
        this.sprite.x = CFG.WIDTH - half;
        this.vx = -Math.abs(this.vx);
      }
      // espada girando mientras rebota (lentamente)
      this.sprite.rotation += (delta / 1000) * CFG.FINAL_SWORD_ROT_SPEED;
    } else {
      // al volver, si se pasa del boss, se elimina por seguridad
      if (this.sprite.x > CFG.WIDTH + 40 || this.sprite.x < -40) {
        this.sprite.destroy();
      }
    }
  }
}