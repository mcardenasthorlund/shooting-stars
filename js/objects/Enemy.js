class Enemy {
  constructor(scene, x, y, variant = false) {
    this.scene = scene;
    this.variant = variant;
    this.points = variant ? CFG.POINTS_PER_VARIANT : CFG.POINTS_PER_ENEMY;

    const size = CFG.ENEMY_SIZE;
    const life = variant ? CFG.VARIANT_LIFE_MULT : 1;

    if (variant) {
      this.sprite = scene.physics.add.sprite(x, y, 'enemy_variant_img');
      this.sprite.setDisplaySize(CFG.VARIANT_SIZE, CFG.VARIANT_SIZE);
      this.sprite.body.setSize(CFG.VARIANT_SIZE, CFG.VARIANT_SIZE, true);
    } else {
      this.sprite = scene.physics.add.sprite(x, y, 'enemy_img');
      // forzar la visualización al tamaño de enemigo (la imagen nativa es grande)
      this.sprite.setDisplaySize(size, size);
      this.sprite.body.setSize(size, size, true);
    }
    this.sprite.setOrigin(0.5, 0.5);

    this.maxLife = life;
    this.life = life;
    this.speedX = CFG.ENEMY_SPEED * (variant ? CFG.VARIANT_SPEED_MULT : 1) * (scene.difficulty || 1);
    this.oscillate = Phaser.Math.RND.pick([true, false]);
    if (this.oscillate) {
      this.amp = Phaser.Math.Between(20, 70);
      this.freq = Phaser.Math.FloatBetween(1.2, 2.4);
      this.phase = Phaser.Math.FloatBetween(0, Math.PI * 2);
    } else {
      this.vySpeed = Phaser.Math.Between(60, 140);
      this.direction = 1;
    }
  }

  generateTexture(key, size, variant) {
    const g = this.scene.make.graphics({ x: 0, y: 0 }, false);
    const color = variant ? CFG.VARIANT_COLOR : CFG.ENEMY_COLOR;
    g.fillStyle(0x0a0a12, 1);
    g.fillRect(0, 0, size, size);
    g.fillStyle(color, 1);
    g.fillRect(2, 2, size - 4, size - 4);
    g.fillStyle(0xffffff, 0.9);
    g.fillRect(size - 7, 2, 3, 3);
    g.fillRect(2, size - 6, 3, 3);
    g.fillStyle(0x000000, 1);
    g.fillRect(size - 6, size - 6, 3, 3);
    g.generateTexture(key, size, size);
    g.destroy();
  }

  update(dt, time) {
    if (!this.variant) {
      this.sprite.rotation += (dt / 1000) * CFG.ENEMY_ROT_SPEED;
    }
    this.sprite.setVelocityX(-this.speedX);

    if (this.oscillate) {
      // movimiento vertical oscilante (senoidal), sin salirse de los límites
      const vy = Math.sin(time * this.freq + this.phase) * this.amp * 2;
      this.sprite.setVelocityY(vy);
      const half = this.sprite.width / 2;
      if (this.sprite.y < half) this.sprite.y = half;
      if (this.sprite.y > CFG.HEIGHT - half) this.sprite.y = CFG.HEIGHT - half;
      return;
    }

    // rebotar en los bordes superior e inferior y cambiar la dirección vertical
    const half = this.sprite.width / 2;
    if (this.sprite.y - half <= 0) {
      this.sprite.y = half;
      this.direction = 1;
    } else if (this.sprite.y + half >= CFG.HEIGHT) {
      this.sprite.y = CFG.HEIGHT - half;
      this.direction = -1;
    }
    this.sprite.setVelocityY(this.vySpeed * this.direction);
  }

  takeHit() {
    return this.damage(1);
  }

  damage(amount) {
    this.life -= amount;
    if (this.life <= 0) {
      this.sprite.destroy();
      return true;
    }
    if (this.variant && this.life <= 1) {
      const size = this.variant ? CFG.VARIANT_SIZE : CFG.ENEMY_SIZE;
      this.sprite.setTexture('enemy_low_img');
      this.sprite.setDisplaySize(size, size);
      this.sprite.body.setSize(size, size, true);
    } else {
      this.sprite.setTint(0xffffff);
    }
    return false;
  }
}