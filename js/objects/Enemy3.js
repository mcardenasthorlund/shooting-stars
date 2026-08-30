class Enemy3 {
  constructor(scene, x, y) {
    this.scene = scene;
    this.points = CFG.POINTS_PER_ENEMY3;

    const size = CFG.ENEMY3_SIZE;
    this.sprite = scene.physics.add.sprite(x, y, 'enemy3_img');
    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.setDisplaySize(size, size);
    this.sprite.body.setSize(size, size, true);

    this.maxLife = CFG.ENEMY3_LIFE;
    this.life = CFG.ENEMY3_LIFE;
    this.speedX = CFG.ENEMY3_SPEED * (scene.difficulty || 1);
    this.amp = Phaser.Math.Between(25, 60);
    this.freq = Phaser.Math.FloatBetween(1.0, 1.8);
    this.phase = Phaser.Math.FloatBetween(0, Math.PI * 2);

    // temporizador de disparo del meteorito (cada 4s)
    this.shootTimer = Phaser.Math.Between(500, 2000);
    this.shootInterval = CFG.ENEMY3_SHOOT_INTERVAL;
  }

  shoot() {
    if (!this.sprite.active) return;
    const meteoro = new Meteorite(this.scene, this.sprite.x, this.sprite.y, this.scene.player, this.speedX * 2);
    this.scene.spawner.enemies.add(meteoro.sprite);
    meteoro.sprite.setData('handler', meteoro);
    if (this.scene.game.sfx) this.scene.game.sfx.shot(0.35);
  }

  update(dt, time) {
    // se acerca al player con una leve oscilación vertical
    this.sprite.setVelocityX(-this.speedX);
    const vy = Math.sin(time * this.freq + this.phase) * this.amp;
    this.sprite.setVelocityY(vy);
    const half = this.sprite.width / 2;
    if (this.sprite.y < half) this.sprite.y = half;
    if (this.sprite.y > CFG.HEIGHT - half) this.sprite.y = CFG.HEIGHT - half;

    // temporizador de disparo
    this.shootTimer += dt;
    if (this.shootTimer >= this.shootInterval) {
      this.shootTimer = 0;
      this.shoot();
    }
  }

  damage(amount) {
    this.life -= amount;
    if (this.life <= 0) {
      this.sprite.destroy();
      return true;
    }
    this.sprite.setTint(0xffffff);
    return false;
  }
}

// meteorito que el enemigo3 dispara con aimbot hacia el jugador (1 de vida)
class Meteorite {
  constructor(scene, x, y, player, speed) {
    this.scene = scene;
    this.points = 0;
    const size = CFG.METEOR_SIZE;
    this.sprite = scene.physics.add.sprite(x, y, 'enemy3_shot_img');
    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.setDisplaySize(size, size);
    this.sprite.body.setSize(size, size, true);

    this.life = CFG.METEOR_LIFE;
    this.speed = speed || CFG.METEOR_SPEED;
    // apuntar al jugador (aimbot) en el momento del disparo
    const ang = Math.atan2(player.sprite.y - y, player.sprite.x - x);
    this.vx = Math.cos(ang) * this.speed;
    this.vy = Math.sin(ang) * this.speed;
    this.sprite.setVelocity(this.vx, this.vy);
  }

  update(dt, time) {
    // re-aplicar la velocidad cada frame (igual que balas y enemigos)
    this.sprite.setVelocity(this.vx, this.vy);
    // gira mientras avanza
    this.sprite.rotation += (dt / 1000) * 6;
  }

  damage(amount) {
    this.life -= amount;
    if (this.life <= 0) {
      this.sprite.destroy();
      return true;
    }
    return false;
  }
}