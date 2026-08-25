class Boss {
  constructor(scene, x, y) {
    this.scene = scene;
    this.points = CFG.POINTS_PER_BOSS;

    const size = CFG.BOSS_SIZE;
    this.sprite = scene.physics.add.sprite(x, y, 'boss_img');
    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.setDisplaySize(size, size);
    this.sprite.body.setSize(size, size, true);

    this.maxLife = CFG.BOSS_LIFE;
    this.life = CFG.BOSS_LIFE;
    this.speedX = 30;
    this.amp = 90;
    this.freq = 0.9;
    this.phaseSwap = false;
    this.swapTimer = null;
    this.swapIdx = 0;
  }

  startPhaseSwap() {
    if (this.phaseSwap) return;
    this.phaseSwap = true;
    const swap = () => {
      if (!this.sprite.active || this.sprite.scene !== this.scene) return;
      this.swapIdx = 1 - this.swapIdx;
      this.sprite.setTexture(this.swapIdx === 0 ? 'boss_img2' : 'boss_img3');
      const size = CFG.BOSS_SIZE;
      this.sprite.setDisplaySize(size, size);
    };
    swap();
    this.swapTimer = this.scene.time.addEvent({
      delay: CFG.BOSS_SWAP_INTERVAL,
      loop: true,
      callback: swap,
    });
  }

  stopPhaseSwap() {
    if (this.swapTimer) {
      this.swapTimer.remove();
      this.swapTimer = null;
    }
  }

  update(dt, time) {
    const vy = Math.sin(time * this.freq) * this.amp;
    this.sprite.setVelocity(-this.speedX, vy);
    const half = this.sprite.width / 2;
    if (this.sprite.y < half) this.sprite.y = half;
    if (this.sprite.y > CFG.HEIGHT - half) this.sprite.y = CFG.HEIGHT - half;
  }

  takeHit() {
    return this.damage(1);
  }

  damage(amount) {
    this.life -= amount;
    this.scene.events.emit('boss-hurt', this.life);
    if (this.life <= 0) {
      this.stopPhaseSwap();
      this.sprite.destroy();
      return true;
    }
    if (!this.phaseSwap && this.life <= this.maxLife * CFG.BOSS_PHASE_THRESHOLD) {
      this.startPhaseSwap();
    }
    this.sprite.setTint(0xffe0e0);
    return false;
  }
}
