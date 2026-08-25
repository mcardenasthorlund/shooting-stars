class Bullet {
  constructor(scene, x, y, angle, sizeFactor = 1, weapon = null) {
    this.scene = scene;
    this.sizeFactor = sizeFactor;
    const bulletColor = weapon ? weapon.bulletColor : CFG.BULLET_COLOR;
    const baseSize = weapon ? weapon.bulletSize : CFG.BULLET_SIZE;
    const damage = weapon ? weapon.damage : 1;
    const size = baseSize * sizeFactor;
    const texKey = 'bullet_' + bulletColor.toString(16) + '_' + Math.round(size);

    // textura generada por código (solo una vez)
    if (!scene.textures.exists(texKey)) {
      const g = scene.make.graphics({ x: 0, y: 0 }, false);
      g.fillStyle(bulletColor, 1);
      g.fillRect(0, 0, size, size);
      g.generateTexture(texKey, size, size);
      g.destroy();
    }

    this.sprite = scene.physics.add.sprite(x, y, texKey);
    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.setGravityY(0);
    this.sprite.body.setSize(size, size);
    this.sprite.setCollideWorldBounds(false);
    this.sprite.setData('damage', damage);
    this.angle = angle;
    this.applyVelocity();
  }

  applyVelocity() {
    this.sprite.setVelocity(
      Math.cos(this.angle) * CFG.BULLET_SPEED,
      Math.sin(this.angle) * CFG.BULLET_SPEED
    );
  }

  update() {
    // igual que los enemigos: re-aplicar la velocidad cada frame
    this.applyVelocity();
  }
}