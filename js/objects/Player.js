class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.sprite = scene.add.graphics({ x, y });
    this.gun = scene.add.graphics({ x, y });
    this.gunImg = scene.add.image(x, y, 'weapon_revolver_img').setOrigin(0, 0.5).setVisible(false);
    this.gunAngle = 0;            // grados, en rango [-90, 90]
    this.health = CFG.MAX_HEALTH;
    this.shield = 0;
    this.weapon = CFG.DEFAULT_WEAPON;
    this.fireLock = false;
    this.draw();
    this.drawGun();
    this.setWeapon(this.weapon);
  }

  draw() {
    const g = this.sprite;
    g.clear();
    // cuerpo de la nave pixel
    g.fillStyle(0x4dd4ff, 1);
    g.fillRect(-8, -10, 16, 20);
    g.fillStyle(0xffffff, 1);
    g.fillRect(-3, -4, 6, 8);
    g.fillStyle(0x0a2a3a, 1);
    g.fillRect(-4, 4, 8, 3);
    g.fillStyle(0xff5a5a, 1);
    g.fillRect(-11, -8, 3, 16);
  }

  drawGun() {
    const g = this.gun;
    g.clear();
    // cañón apuntando a la derecha (ángulo 0)
    g.fillStyle(0xe6e9f2, 1);
    g.fillRect(0, -4, 18, 8);
    g.fillStyle(0x39415c, 1);
    g.fillRect(10, -5, 5, 10);
    g.fillStyle(0xffd93b, 1);
    g.fillRect(14, -3, 4, 6);
  }

  setGunAngle(deg) {
    this.gunAngle = Phaser.Math.Clamp(deg, CFG.GUN_MIN_ANGLE, CFG.GUN_MAX_ANGLE);
    const rad = Phaser.Math.DegToRad(this.gunAngle);
    this.gun.rotation = rad;
    if (this.gunImg) this.gunImg.rotation = rad;
  }

  // cambia el arma equipada y su aspecto en el cañón:
  // BLASTER usa el cañón procedural por defecto; las demás muestran el sprite del arma
  setWeapon(key) {
    this.weapon = key;
    const w = CFG.WEAPONS[key];
    if (!w || !w.img || key === CFG.DEFAULT_WEAPON) {
      this.gun.visible = true;
      this.gunImg.visible = false;
      return;
    }
    this.gun.visible = false;
    const tex = this.scene.textures.get(w.img);
    if (!tex || !tex.getSourceImage || !tex.getSourceImage().width) return;
    const nw = tex.getSourceImage().width;
    const nh = tex.getSourceImage().height;
    const base = 52; // mismo tamaño que antes (el doble para armas no-BLASTER)
    const scale = base / nw;
    this.gunImg.setTexture(w.img).setScale(scale);
    // se baja un poco en vertical para que las balas parezcan salir de la boca del arma
    this.gunImg.setPosition(this.sprite.x, this.sprite.y + 6);
    this.gunImg.setVisible(true);
  }

  getGunRadians() {
    return Phaser.Math.DegToRad(this.gunAngle);
  }

  getGunTipX() {
    return this.sprite.x + Math.cos(this.getGunRadians()) * 20;
  }

  getGunTipY() {
    return this.sprite.y + Math.sin(this.getGunRadians()) * 20;
  }

  damage(amount) {
    // el escudo RIOT SHIELD absorbe el daño antes que la vida
    if (this.shield > 0) {
      const absorbed = Math.min(this.shield, amount);
      this.shield -= absorbed;
      amount -= absorbed;
    }
    this.health = Math.max(0, this.health - amount);
  }

  setShield(amount) {
    this.shield = Math.min(CFG.RIOT_SHIELD_AMOUNT, this.shield + amount);
  }

  heal(amount) {
    this.health = Math.min(CFG.MAX_HEALTH, this.health + amount);
  }

  isAlive() {
    return this.health > 0;
  }
}