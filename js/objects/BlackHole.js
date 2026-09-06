// AGUJERO NEGRO (power up BLACK HOLE): aparece en una posición aleatoria
// (nunca por detrás del jugador) y atrae a los enemigos, meteoritos y espadas.
// Se mueve muy ligeramente en una trayectoria circular solo para dar sensación de vida.
class BlackHole {
  constructor(scene) {
    this.scene = scene;
    // aparece desde la mitad de la pantalla en adelante (hacia la derecha) para
    // que la órbita de los enemigos nunca alcance la línea de vida del jugador
    const x = Phaser.Math.Between(CFG.WIDTH / 2, CFG.WIDTH - 60);
    const y = Phaser.Math.Between(80, CFG.HEIGHT - 80);
    this.centerX = x;
    this.centerY = y;
    this.phase = Phaser.Math.FloatBetween(0, Math.PI * 2);

    this.sprite = scene.add.image(x, y, 'black_hole_img');
    this.sprite.setOrigin(0.5, 0.5);
    // ancho estirado 1.25x, manteniendo el alto actual (BLACK_HOLE_SIZE)
    this.sprite.setDisplaySize(CFG.BLACK_HOLE_SIZE * 1.25, CFG.BLACK_HOLE_SIZE);
    this.sprite.setDepth(5);
  }

  update(dt) {
    // movimiento circular muy leve (solo sensación de movimiento)
    this.phase += (dt / 1000) * CFG.BLACK_HOLE_ORBIT_SPEED;
    this.sprite.x = this.centerX + Math.cos(this.phase) * CFG.BLACK_HOLE_ORBIT_RADIUS;
    this.sprite.y = this.centerY + Math.sin(this.phase) * CFG.BLACK_HOLE_ORBIT_RADIUS;
  }

  destroy() {
    if (this.sprite && this.sprite.active) this.sprite.destroy();
  }
}
