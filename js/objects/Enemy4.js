class Enemy4 {
  constructor(scene, x, y) {
    this.scene = scene;
    this.points = CFG.POINTS_PER_ENEMY4;
    // el original quita 10 de vida; si matas al clon y él te golpea, quita 15
    this.damageOnHit = CFG.ENEMY4_DAMAGE;

    const size = CFG.ENEMY4_SIZE;
    this.sprite = scene.physics.add.sprite(x, y, 'enemy4_img');
    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.setDisplaySize(size, size);
    this.sprite.body.setSize(size, size, true);

    this.maxLife = CFG.ENEMY4_LIFE;
    this.life = CFG.ENEMY4_LIFE;
    this.speedX = CFG.ENEMY4_SPEED * (scene.difficulty || 1);
    this.amp = Phaser.Math.Between(20, 55);
    this.freq = Phaser.Math.FloatBetween(1.0, 1.8);
    this.phase = Phaser.Math.FloatBetween(0, Math.PI * 2);

    this.duplicated = false;
    this.clone = null;
  }

  update(dt, time) {
    // este enemigo NO gira: solo avanza hacia el player con leve oscilación
    this.sprite.setVelocityX(-this.speedX);
    const vy = Math.sin(time * this.freq + this.phase) * this.amp;
    this.sprite.setVelocityY(vy);
    const half = this.sprite.width / 2;
    if (this.sprite.y < half) this.sprite.y = half;
    if (this.sprite.y > CFG.HEIGHT - half) this.sprite.y = CFG.HEIGHT - half;
  }

  damage(amount) {
    this.life -= amount;
    if (this.life <= 0) {
      // si el clon sigue vivo y matas al original, el clon se enfurece (15 de daño)
      if (this.clone && this.clone.sprite && this.clone.sprite.active) {
        this.clone.damageOnHit = CFG.ENEMY4_VENGEANCE_DAMAGE;
      }
      this.sprite.destroy();
      return true;
    }
    // al quedar con 3 de vida: cambia de sprite y se duplica (sale un clon suyo).
    // Se crea en un delayedCall para no modificar el grupo de físicas en mitad del
    // callback de overlap en el que suele llamarse a damage().
    if (!this.duplicated && this.life <= CFG.ENEMY4_DUPLICATE_LIFE) {
      this.duplicated = true;
      const size = CFG.ENEMY4_SIZE;
      this.sprite.setTexture('enemy4_img2');
      this.sprite.setDisplaySize(size, size);
      this.sprite.body.setSize(size, size, true);
      const ox = this.sprite.x;
      const oy = this.sprite.y;
      this.scene.time.delayedCall(0, () => {
        this.clone = new Enemy4Clone(this.scene, ox, oy, this);
        this.scene.spawner.enemies.add(this.clone.sprite);
        this.clone.sprite.setData('handler', this.clone);
      });
    } else {
      this.sprite.setTint(0xffffff);
    }
    return false;
  }
}

// clon del enemigo4: verde-azulado, 2 de vida, quita 5 (o 15 si matas al original)
class Enemy4Clone {
  constructor(scene, x, y, original) {
    this.scene = scene;
    this.points = CFG.POINTS_PER_ENEMY4_CLONE;
    this.damageOnHit = CFG.ENEMY4_CLONE_DAMAGE;
    this.original = original;

    const size = CFG.ENEMY4_CLONE_SIZE;
    this.sprite = scene.physics.add.sprite(x, y, 'enemy4_img2');
    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.setDisplaySize(size, size);
    this.sprite.body.setSize(size, size, true);
    this.sprite.setTint(CFG.ENEMY4_CLONE_COLOR);

    this.life = CFG.ENEMY4_CLONE_LIFE;
    this.speedX = CFG.ENEMY4_SPEED * (scene.difficulty || 1);

    // trayectoria propia, distinta de la del original
    this.amp = Phaser.Math.Between(35, 85);
    this.freq = Phaser.Math.FloatBetween(1.5, 2.6);
    this.phase = Phaser.Math.FloatBetween(0, Math.PI * 2);

    // al nacer, se lanza rápido en vertical para separarse del original y no
    // quedar apilado en el mismo sitio (fácil de eliminar con una sola bala)
    const center = CFG.HEIGHT / 2;
    this.dashDir = this.sprite.y >= center ? -1 : 1; // se aleja hacia el centro libre
    this.dashSpeed = Phaser.Math.Between(140, 220);
    this.separation = 1.1; // segundos que dura el impulso de separación
  }

  update(dt, time) {
    // el clon tampoco gira: avanza hacia el player con oscilación.
    // Al principio se aleja rápido en vertical para separarse del original.
    let vy = Math.sin(time * this.freq + this.phase) * this.amp;
    if (this.separation > 0) {
      this.separation -= dt / 1000;
      this.sprite.setVelocityX(-this.speedX * 1.6);
      vy += this.dashDir * this.dashSpeed;
    } else {
      this.sprite.setVelocityX(-this.speedX);
    }
    this.sprite.setVelocityY(vy);
    const half = this.sprite.width / 2;
    if (this.sprite.y < half) this.sprite.y = half;
    if (this.sprite.y > CFG.HEIGHT - half) this.sprite.y = CFG.HEIGHT - half;
  }

  damage(amount) {
    this.life -= amount;
    if (this.life <= 0) {
      // si el original sigue vivo y matas al clon, el original se enfurece (15 de daño)
      if (this.original && this.original.sprite && this.original.sprite.active) {
        this.original.damageOnHit = CFG.ENEMY4_VENGEANCE_DAMAGE;
      }
      this.sprite.destroy();
      return true;
    }
    // parpadeo al recibir un impacto y vuelta al color verde-azulado
    this.sprite.setTint(0xffffff);
    this.scene.time.delayedCall(60, () => {
      if (this.sprite.active) this.sprite.setTint(CFG.ENEMY4_CLONE_COLOR);
    });
    return false;
  }
}
