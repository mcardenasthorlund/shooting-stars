class Explosion {
  constructor(scene, x, y, radius = 18, color = 0xffd24a) {
    this.scene = scene;
    this.g = scene.add.graphics();
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.t = 0;
    this.duration = 350;
    this.draw();
  }

  update(dt) {
    this.t += dt;
    const p = Math.min(this.t / this.duration, 1);
    if (p >= 1) {
      this.g.destroy();
      return false;
    }
    this.draw();
    return true;
  }

  draw() {
    const g = this.g;
    g.clear();
    const p = Math.min(this.t / this.duration, 1);
    const r = this.radius * (0.4 + 1.2 * p);
    const alpha = 1 - p;

    // anillo exterior
    g.fillStyle(this.color, alpha * 0.9);
    g.fillCircle(this.x, this.y, r);

    // núcleo blanco
    g.fillStyle(0xffffff, alpha);
    g.fillCircle(this.x, this.y, r * 0.5);

    // borde naranja/rojo
    g.lineStyle(2, 0xff6a2a, alpha);
    g.strokeCircle(this.x, this.y, r);
  }
}
