class Star {
  constructor(scene) {
    this.scene = scene;
    this.g = scene.add.graphics();
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.length = 10;
    this.color = 0xffffff;
    this.reset(true);
    this.draw();
  }

  reset(randomStart = false) {
    const { WIDTH: W, HEIGHT: H } = CFG;
    this.x = randomStart ? Phaser.Math.Between(0, W) : W + 30;
    this.y = Phaser.Math.Between(0, H);
    this.vx = Phaser.Math.Between(-320, -180);  // se mueve horizontalmente de derecha a izq
    this.vy = 0;
    this.length = Phaser.Math.Between(8, 22);
    this.color = Phaser.Math.RND.pick([0xffffff, 0x9ad0ff, 0xffe08a, 0xb0b9ff]);
  }

  update(dt) {
    this.x += this.vx * (dt / 1000);
    this.y += this.vy * (dt / 1000);
    if (this.x < -40) {
      this.reset(false);
    }
    this.draw();
  }

  draw() {
    const g = this.g;
    g.clear();
    // estela: línea hacia atrás en dirección contraria al movimiento
    const mag = Math.sqrt(this.vx * this.vx + this.vy * this.vy) || 1;
    const tx = (this.vx / mag) * this.length;
    const ty = (this.vy / mag) * this.length;
    g.lineStyle(2, this.color, 0.45);
    g.lineBetween(this.x, this.y, this.x - tx, this.y - ty);
    // cabeza
    g.fillStyle(this.color, 1);
    g.fillRect(this.x - 2, this.y - 2, 4, 4);
  }
}