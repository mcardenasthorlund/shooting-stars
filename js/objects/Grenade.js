class Grenade {
  constructor(scene, x, y, angle) {
    this.scene = scene;
    this.originX = x;

    this.sprite = scene.physics.add.sprite(x, y, 'powerup_granade_img');
    this.sprite.setDisplaySize(CFG.POWER_UP_IMG_SIZE, CFG.POWER_UP_IMG_SIZE);
    this.sprite.setData('handler', this);
    this.sprite.setData('grenade', true);
    this.sprite.setAngularVelocity(360);

    // no usamos la física para moverla (el grupo resetea la velocidad del cuerpo);
    // integramos la trayectoria parabólica manualmente y mantenemos el cuerpo en sync
    // para que las colisiones sigan funcionando.
    this.sprite.body.setAllowGravity(false);
    this.sprite.body.setVelocity(0, 0);
    this.sprite.body.setSize(CFG.POWER_UP_IMG_SIZE, CFG.POWER_UP_IMG_SIZE);

    this.vx = CFG.GRANADE_SPEED * Math.cos(angle);
    this.vy = CFG.GRANADE_SPEED * Math.sin(angle);
    this.exploded = false;
  }

  update(dt) {
    // integración manual: la gravedad acumula en vy -> trayectoria de cañón
    const s = dt / 1000;
    this.vy += CFG.GRANADE_GRAVITY * s;
    this.sprite.x += this.vx * s;
    this.sprite.y += this.vy * s;
    // mantener el cuerpo al día para que el overlap con los enemigos funcione
    this.sprite.body.position.set(
      this.sprite.x - this.sprite.body.halfWidth,
      this.sprite.y - this.sprite.body.halfHeight
    );
  }

  // devuelve true si la granada debe explotar al agotar su alcance o salir de pantalla
  outOfRange() {
    if (this.exploded) return false;
    return (
      this.sprite.x - this.originX >= CFG.GRANADE_RANGE ||
      this.sprite.x > CFG.WIDTH + 40 ||
      this.sprite.y > CFG.HEIGHT + 60
    );
  }

  destroy() {
    this.exploded = true;
    this.sprite.destroy();
  }
}