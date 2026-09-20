// Rueda de ruleta de la tienda: casillas alternas rojas/negras y un marcador
// fijo en la parte superior. Al girar, el color que queda bajo el marcador
// se elige con probabilidad 50/50 (uniforme) y se devuelve por callback.
class RouletteWheel {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.cells = CFG.ROULETTE_CELLS;
    this.radius = CFG.ROULETTE_WHEEL_RADIUS;
    this.segDeg = 360 / this.cells;

    // contenedor de la rueda (se rota al girar)
    this.wheel = scene.add.container(x, y);
    this.g = scene.add.graphics();
    this.wheel.add(this.g);

    // estado de giro acumulado en grados (siempre en sentido horario)
    this.currentDeg = 0;
    this.spinning = false;

    this.draw();
    this.drawPointer();
  }

  colorOf(index) {
    // última casilla → verde; el resto alternan roja (par) / negra (impar),
    // dando 10 rojas y 10 negras con 21 casillas.
    if (index === this.cells - 1) return 'green';
    return index % 2 === 0 ? 'red' : 'black';
  }

  colorHex(color) {
    if (color === 'green') return CFG.ROULETTE_GREEN;
    return color === 'red' ? CFG.ROULETTE_RED : CFG.ROULETTE_BLACK;
  }

  draw() {
    const g = this.g;
    g.clear();
    const R = this.radius;
    // borde exterior
    g.fillStyle(0x3a3a4a, 1);
    g.fillCircle(0, 0, R + 8);
    g.lineStyle(3, 0x05070f, 1);
    g.strokeCircle(0, 0, R + 8);

    for (let i = 0; i < this.cells; i++) {
      const a0 = -90 + i * this.segDeg;
      const a1 = a0 + this.segDeg;
      const color = this.colorHex(this.colorOf(i));
      const n = Math.max(3, Math.round(this.segDeg / 3));
      const pts = [{ x: 0, y: 0 }];
      for (let s = 0; s <= n; s++) {
        const ang = Phaser.Math.DegToRad(a0 + (a1 - a0) * s / n);
        pts.push({ x: Math.cos(ang) * R, y: Math.sin(ang) * R });
      }
      g.fillStyle(color, 1);
      g.fillPoints(pts, true);
      g.lineStyle(2, 0x05070f, 1);
      g.strokePoints(pts, true);
    }
  }

  // marcador (flecha) fijo apuntando hacia abajo, encima de la rueda
  drawPointer() {
    const p = this.scene.add.graphics();
    p.setPosition(this.x, this.y);
    p.fillStyle(0xffd93b, 1);
    p.fillTriangle(-12, -this.radius - 18, 12, -this.radius - 18, 0, -this.radius + 8);
    p.fillStyle(0xffffff, 1);
    p.fillTriangle(-6, -this.radius - 16, 6, -this.radius - 16, 0, -this.radius - 4);
    p.setDepth(5);
    this.pointer = p;
  }

  // centro en grados (medido en horario desde las 3 en punto, el top es -90)
  centerDeg(index) {
    return -90 + (index + 0.5) * this.segDeg;
  }

  // giro de la rueda; el resultado (rojo/negro/verde) se entrega por callback.
  // Cada casilla tiene la misma probabilidad (10 rojas, 10 negras, 1 verde).
  spin(callback) {
    if (this.spinning) return;
    this.spinning = true;

    // elige una casilla uniformemente
    const k = Phaser.Math.Between(0, this.cells - 1);
    const resultColor = this.colorOf(k);

    // ángulo objetivo (coloca el centro de la casilla k bajo el marcador, en top)
    let base = ((-90 - this.centerDeg(k)) % 360 + 360) % 360;
    // pequeño desplazamiento aleatorio dentro de la casilla para que no caiga siempre al centro
    const jitter = (Math.random() - 0.5) * (this.segDeg - 6);
    base = ((base + jitter) % 360 + 360) % 360;

    // sigue girando hacia delante (horario): suma vueltas hasta superar la posición actual
    let target = base;
    while (target <= this.currentDeg) target += 360;
    // añade giros completos extra para que parezca que da muchas vueltas
    target += 360 * Phaser.Math.Between(4, 6);

    const from = this.currentDeg;
    const scene = this.scene;

    scene.tweens.add({
      targets: { r: from },
      r: target,
      duration: CFG.ROULETTE_SPIN_DURATION,
      ease: 'Cubic.easeOut',
      onUpdate: (tween) => {
        this.currentDeg = tween.getValue();
        this.wheel.setRotation(Phaser.Math.DegToRad(this.currentDeg));
      },
      onComplete: () => {
        this.currentDeg = target;
        this.spinning = false;
        if (callback) callback(resultColor);
      },
    });
  }
}