const PLANET_KEYS = ['planet1', 'planet2', 'planet3'];

class Planet {
  constructor(scene, layer) {
    this.scene = scene;
    this.layer = layer;
    this.speed = layer.speed * Phaser.Math.FloatBetween(0.7, 1.3);
    this.reset();
  }

  reset() {
    const { WIDTH: W, HEIGHT: H } = CFG;
    // aparecen fuera de pantalla por la derecha, nunca en mitad del mapa
    this.x = Phaser.Math.Between(W + 60, W + 400);
    this.y = Phaser.Math.Between(H * 0.1, H * 0.9);
    this.size = Phaser.Math.Between(this.layer.minSize, this.layer.maxSize);
    this.spawn();
  }

  spawn() {
    const key = Phaser.Math.RND.pick(PLANET_KEYS);
    // si la textura aún no está lista, caemos a un círculo para nunca quedar invisible
    if (!this.scene.textures.exists(key)) {
      this.createFallback(key);
      return;
    }
    if (!this.sprite) {
      this.sprite = this.scene.add.image(this.x, this.y, key);
    } else {
      this.sprite.setTexture(key);
      this.sprite.setPosition(this.x, this.y);
    }
    this.sprite.setDisplaySize(this.size * 2, this.size * 2);
    this.sprite.setAlpha(this.layer.alpha);
    this.applyDanger(this.layer.danger);
  }

  createFallback(key) {
    if (!this.scene.textures.exists(key)) {
      this.scene.textures.generate(key, {
        data: [
          '..',
          '..',
          '.1.',
          '.1.',
          '.1.',
          '.1.',
          '..',
          '..',
        ],
        pixelWidth: Math.max(2, Math.floor(this.size / 4)),
        pixelHeight: Math.max(2, Math.floor(this.size / 4)),
        palette: { '.': [0, 0, 0, 0], '1': [180, 90, 160, 255] },
      });
    }
    if (!this.sprite) {
      this.sprite = this.scene.add.image(this.x, this.y, key);
    } else {
      this.sprite.setTexture(key);
      this.sprite.setPosition(this.x, this.y);
    }
    this.sprite.setDisplaySize(this.size * 2, this.size * 2);
    this.sprite.setAlpha(this.layer.alpha);
  }

  applyDanger(on) {
    if (!this.sprite) return;
    if (on) {
      this.sprite.setTint(0xff3a1a);
    } else {
      this.sprite.clearTint();
    }
  }

  destroy() {
    if (this.sprite) this.sprite.destroy();
    this.sprite = null;
  }

  update(dt) {
    this.x -= this.speed * (dt / 1000);
    if (this.x < -this.size - 60) this.reset();
    if (this.sprite) this.sprite.setPosition(this.x, this.y);
  }
}

class PlanetLayer {
  constructor(scene, count, config) {
    this.speed = config.speed;
    this.minSize = config.minSize;
    this.maxSize = config.maxSize;
    this.alpha = config.alpha;
    this.palette = config.palette;
    this.dangerPalette = config.dangerPalette;
    this.danger = false;
    this.planets = [];
    for (let i = 0; i < count; i++) {
      this.planets.push(new Planet(scene, this));
    }
  }

  currentPalette() {
    return this.danger ? this.dangerPalette : this.palette;
  }

  setDanger(on) {
    this.danger = on;
    for (const p of this.planets) p.applyDanger(on);
  }

  update(dt) {
    for (const p of this.planets) p.update(dt);
  }

  destroy() {
    for (const p of this.planets) p.destroy();
    this.planets = [];
  }
}
