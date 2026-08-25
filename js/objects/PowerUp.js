class PowerUp {
  constructor(scene, type) {
    this.scene = scene;
    this.type = type;
    const meta = CFG.POWER_UPS[type];

    this.sprite = scene.physics.add.sprite(
      Phaser.Math.Between(CFG.PLAYER_X + 40, CFG.WIDTH - 40),
      -20,
      'powerup_' + type
    );
    this.sprite.setOrigin(0.5, 0.5);

    // textura de la estrella de power up generada por código (una sola vez)
    const texKey = 'powerup_' + type;
    if (!scene.textures.exists(texKey)) {
      const g = scene.make.graphics({ x: 0, y: 0 }, false);
      g.fillStyle(meta.color, 1);
      g.fillCircle(6, 6, 6);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 2);
      g.generateTexture(texKey, 12, 12);
      g.destroy();
    }

    this.sprite.setData('handler', this);
    this.sprite.setScale(1.4);
    this.drift = Phaser.Math.FloatBetween(-15, 15);
  }

  update(dt) {
    this.sprite.y += (CFG.POWER_UP_FALL_SPEED * dt) / 1000;
    this.sprite.x += (this.drift * dt) / 1000;
    this.sprite.rotation += (dt / 1000) * 2;
  }

  outOfBounds() {
    return this.sprite.y - 20 > CFG.HEIGHT;
  }

  destroy() {
    this.sprite.destroy();
  }
}
