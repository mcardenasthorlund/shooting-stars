// Enemigo de recompensa: solo se mueve en vertical (X fijo), permanece 30s en
// pantalla con un cronómetro y un número de vida restante encima. Si se agota
// el tiempo es absorbido por un remolino (sin premio). Si el jugador lo elimina
// se abre la cinta de premios en la UIScene.
class RewardEnemy {
  constructor(scene, x, y, life) {
    this.scene = scene;
    this.points = 0;

    this.ensureTexture();
    this.sprite = scene.physics.add.sprite(x, y, 'reward_enemy_img');
    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.setDisplaySize(CFG.REWARD_ENEMY_SIZE, CFG.REWARD_ENEMY_SIZE);
    this.sprite.body.setSize(CFG.REWARD_ENEMY_SIZE, CFG.REWARD_ENEMY_SIZE, true);

    this.maxLife = life;
    this.life = life;
    this.lifetime = CFG.REWARD_ENEMY_TIME;
    this.timeLeft = this.lifetime;
    this.absorbing = false;
    this.amp = CFG.REWARD_ENEMY_AMP;
    this.freq = CFG.REWARD_ENEMY_FREQ;

    // número de vida restante y cronómetro, sobre el enemigo
    this.lifeText = scene.add.text(x, y - CFG.REWARD_ENEMY_SIZE - 8, String(this.life), {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ff4d4d',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5).setDepth(10);

    this.timerText = scene.add.text(x, y - CFG.REWARD_ENEMY_SIZE - 28, this.formatTime(this.timeLeft), {
      fontFamily: 'monospace',
      fontSize: '15px',
      color: '#4dd4ff',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5).setDepth(10);

    this.appear();
  }

  // aparece emergiendo de un remolino (efecto inverso al de absorción)
  appear() {
    const sprite = this.sprite;
    sprite.setScale(0);
    if (this.scene.spawnWhirlpool) this.scene.spawnWhirlpool(sprite.x, sprite.y, true);
    this.scene.tweens.add({
      targets: sprite,
      scale: 1,
      angle: 360,
      duration: 800,
      ease: 'Back.easeOut',
    });
  }

  // textura procedural (cristal/estrella) si aún no existe
  ensureTexture() {
    if (this.scene.textures.exists('reward_enemy_img')) return;
    const g = this.scene.make.graphics({ x: 0, y: 0 }, false);
    const s = CFG.REWARD_ENEMY_SIZE;
    const c = CFG.REWARD_ENEMY_COLOR;
    // diamante/cristal con brillo
    g.fillStyle(c, 1);
    g.fillPoints([
      { x: s / 2, y: 0 }, { x: s, y: s / 2 }, { x: s / 2, y: s }, { x: 0, y: s / 2 },
    ], true);
    g.fillStyle(0xffffff, 0.9);
    g.fillPoints([
      { x: s / 2, y: 0 }, { x: s * 0.7, y: s / 2 }, { x: s / 2, y: s / 2 }, { x: s * 0.3, y: s / 2 },
    ], true);
    g.lineStyle(3, 0xffffff, 1);
    g.strokePoints([
      { x: s / 2, y: 0 }, { x: s, y: s / 2 }, { x: s / 2, y: s }, { x: 0, y: s / 2 }, { x: s / 2, y: 0 },
    ], true);
    g.generateTexture('reward_enemy_img', s, s);
    g.destroy();
  }

  formatTime(ms) {
    return (ms / 1000).toFixed(1) + 's';
  }

  update(dt, time) {
    if (this.absorbing) return;

    // movimiento SOLO vertical (vaivén senoidal), X fijo
    const vy = Math.sin(time * this.freq) * this.amp;
    this.sprite.setVelocity(0, vy);

    // cronómetro
    this.timeLeft -= dt;
    if (this.timeLeft <= 0) {
      this.absorb();
      return;
    }
    this.timerText.setText(this.formatTime(this.timeLeft));

    // mantener los textos pegados al sprite
    const sy = this.sprite.y;
    this.lifeText.setPosition(this.sprite.x, sy - CFG.REWARD_ENEMY_SIZE - 8);
    this.timerText.setPosition(this.sprite.x, sy - CFG.REWARD_ENEMY_SIZE - 28);
  }

  // fin del tiempo: absorción por remolino (sin premio)
  absorb() {
    this.absorbing = true;
    if (this.scene.spawnWhirlpool) this.scene.spawnWhirlpool(this.sprite.x, this.sprite.y);
    this.scene.tweens.add({
      targets: this.sprite,
      scale: 0,
      angle: 1080,
      duration: 900,
      ease: 'Back.easeIn',
      onComplete: () => {
        this.sprite.destroy();
        this.lifeText.destroy();
        this.timerText.destroy();
      },
    });
    this.lifeText.destroy();
    this.timerText.destroy();
  }

  damage(amount) {
    if (this.absorbing) return false;
    this.life -= amount;
    if (this.life <= 0) {
      this.sprite.destroy();
      this.lifeText.destroy();
      this.timerText.destroy();
      return true;
    }
    this.lifeText.setText(String(Math.ceil(this.life)));
    this.sprite.setTint(0xffffff);
    return false;
  }
}