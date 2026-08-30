class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.load.image('logo', 'assets/logo.png');
    this.load.image('enemy_img', CFG.ENEMY_IMG);
    this.load.image('enemy_variant_img', CFG.VARIANT_IMG);
    this.load.image('enemy_low_img', CFG.LOW_IMG);
    this.load.image('boss_img', CFG.BOSS_IMG);
    this.load.image('boss_img2', CFG.BOSS_IMG2);
    this.load.image('boss_img3', CFG.BOSS_IMG3);
    this.load.image('powerup_bigboy_img', 'assets/Big_Boy.png');
    this.load.image('powerup_bigboom_img', 'assets/Big_Boom.png');
    this.load.image('powerup_heal_img', 'assets/Heal.png');
    this.load.image('powerup_shield_img', 'assets/Shield.png');
    this.load.image('powerup_timestop_img', 'assets/Time_Stop.png');
    this.load.image('powerup_granade_img', 'assets/Granade.png');
    this.load.image('weapon_revolver_img', 'assets/Revolver.png');
    this.load.image('weapon_shotgun_img', 'assets/Shotgun.png');
    this.load.image('weapon_uzi_img', 'assets/Uzi.png');
    this.load.image('shop_img', 'assets/tienda.png');
    this.load.image('shop_img3', 'assets/tienda3.png');
    this.load.image('shop_img4', 'assets/tienda4.png');
    this.load.image('shop_img5', 'assets/tienda5.png');
    this.load.image('planet1', 'assets/Planeta_Fondo_N1.png');
    this.load.image('planet2', 'assets/Planeta_Fondo_N2.png');
    this.load.image('planet3', 'assets/Planeta_Fondo_N3.png');
    this.load.image('back_planet_img', 'assets/Back_Planet.png');
    this.load.audio('music', 'assets/audio/musica.mp3');
    this.load.audio('boss_music', 'assets/audio/musica-boss.mp3');
    this.load.audio('victory', 'assets/audio/victoria.mp3');
  }

  create() {
    const { WIDTH: W, HEIGHT: H } = CFG;

    // genera el sprite de la nave del jugador para el arma BLASTER
    if (!this.textures.exists('player_img')) {
      const g = this.make.graphics({ x: 0, y: 0 }, false);
      const ox = 13, oy = 12;
      g.fillStyle(0x4dd4ff, 1);
      g.fillRect(ox - 8, oy - 10, 16, 20);
      g.fillStyle(0xffffff, 1);
      g.fillRect(ox - 3, oy - 4, 6, 8);
      g.fillStyle(0x0a2a3a, 1);
      g.fillRect(ox - 4, oy + 4, 8, 3);
      g.fillStyle(0xff5a5a, 1);
      g.fillRect(ox - 11, oy - 8, 3, 16);
      g.generateTexture('player_img', 24, 24);
      g.destroy();
    }

    // ocultar el logo HTML al estar en la página inicial
    const htmlLogo = document.getElementById('logo');
    if (htmlLogo) htmlLogo.style.display = 'none';

    const bg = this.add.graphics();
    bg.fillStyle(0x05070f, 1);
    bg.fillRect(0, 0, W, H);

    this.createStarfield(W, H);
    this.createShootingStars(W, H);

    const logo = this.add.image(W / 2, H / 2 - 100, 'logo');
    logo.setScale(0.2);
    logo.setOrigin(0.5, 0.5);

    const controls = this.add.text(W / 2, H / 2 + 150, [
      'Apuntar: ratón o dedo   •   Disparar: clic, ESPACIO o tocar la pantalla',
      'El arma rota de -90° a +90°',
      'Aguanta 60s para que aparezca el BOSS',
    ], {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#c8d2ea',
      align: 'center',
    }).setOrigin(0.5, 0.5);

    this.hint = this.add.text(W / 2, H - 60, 'Pulsa CLIC o TOCA para comenzar', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5, 0.5);

    const credit = this.add.text(W - 10, H - 10, 'HECHO POR MANUEL Y MANOLO', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#6a7aa8',
    }).setOrigin(1, 1);

    this.add.text(10, H - 10, 'v' + CFG.VERSION, {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#6a7aa8',
    }).setOrigin(0, 1);

    this.updateRecord();
    this.game.records.on('new-record', this.updateRecord, this);

    this.tweens.add({
      targets: this.hint,
      alpha: 0.2,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    this.input.keyboard.once('keydown-ENTER', this.showIntro, this);
    this.input.once('pointerdown', this.showIntro, this);
  }

  showIntro() {
    this.input.off('pointerdown');
    this.input.keyboard.off('keydown-ENTER');
    this.tweens.killTweensOf(this.hint);

    const overlay = this.add.graphics();
    overlay.fillStyle(0x05070f, 0.85);
    overlay.fillRect(0, 0, CFG.WIDTH, CFG.HEIGHT);

    const lines = [
      { text: 'PILOTO, DESPIERTA.', color: '#4dd4ff', size: '22px' },
      { text: 'La flota de estrellas fugaces', color: '#c8d2ea', size: '16px' },
      { text: 'se aproxima a la nave.', color: '#c8d2ea', size: '16px' },
      { text: 'DESTRÚYELAS A TODAS.', color: '#ffd93b', size: '18px' },
      { text: 'Aguanta hasta que aparezca el BOSS.', color: '#9aa7c8', size: '15px' },
    ];

    const total = lines.length;
    const typeDelay = 28;
    const texts = [];
    const typeEvents = [];
    let currentLine = 0;
    let skipTyping = false;

    const keyEnter = this.input.keyboard.addKeys('ENTER').ENTER;
    const onKey = () => {
      if (skipTyping) return;
      skipTyping = true;
      if (typeEvents[currentLine]) typeEvents[currentLine].remove();
      const typed = texts[currentLine];
      if (typed) typed.setText(lines[currentLine].text);
      currentLine++;
      advance();
    };
    keyEnter.on('down', onKey);
    this.input.on('pointerdown', onKey);

    const advance = () => {
      if (currentLine >= total) {
        keyEnter.off('down', onKey);
        this.input.off('pointerdown', onKey);
        this.time.delayedCall(300, () => this.start());
        return;
      }
      skipTyping = false;
      const { text, color, size } = lines[currentLine];
      const typed = this.add.text(CFG.WIDTH / 2, CFG.HEIGHT / 2 - 60 + currentLine * 40, '', {
        fontFamily: 'monospace',
        fontSize: size,
        color,
        align: 'center',
      }).setOrigin(0.5, 0.5).setAlpha(0);
      texts[currentLine] = typed;
      this.tweens.add({ targets: typed, alpha: 1, duration: 200 });

      let idx = 0;
      const ev = this.time.addEvent({
        delay: typeDelay,
        repeat: text.length - 1,
        callback: () => {
          if (skipTyping) return;
          typed.setText(text.slice(0, idx + 1));
          idx++;
          if (idx === text.length) {
            currentLine++;
            this.time.delayedCall(250, advance);
          }
        },
        callbackScope: this,
      });
      typeEvents[currentLine] = ev;
    };

    advance();
  }

  createStarfield(W, H) {
    for (let i = 0; i < 120; i++) {
      const x = Phaser.Math.Between(0, W);
      const y = Phaser.Math.Between(0, H);
      const size = Phaser.Math.Between(1, 2);
      const alpha = Phaser.Math.FloatBetween(0.3, 1);
      const star = this.add.circle(x, y, size, 0xffffff, alpha);
      this.tweens.add({
        targets: star,
        alpha: 0.1,
        duration: Phaser.Math.Between(600, 2000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  createShootingStars(W, H) {
    const spawnShootingStar = () => {
      const y = Phaser.Math.Between(H * 0.1, H * 0.5);
      const speed = Phaser.Math.Between(250, 450);
      const length = Phaser.Math.Between(45, 80);
      const angle = Phaser.Math.Between(20, 40);

      const star = this.add.circle(0, y, 2.5, 0xffffff, 1);
      const trail = this.add.graphics();
      star.setAlpha(0);

      const onUpdate = (tween, target, progress) => {
        const x1 = target.x - length * Math.cos(Phaser.Math.DegToRad(angle));
        const y1 = target.y + length * Math.sin(Phaser.Math.DegToRad(angle));
        const t = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
        trail.clear();
        trail.lineStyle(2, 0xffffff, t);
        trail.beginPath();
        trail.moveTo(target.x, target.y);
        trail.lineTo(x1, y1);
        trail.strokePath();
      };

      const finished = () => {
        trail.destroy();
        star.destroy();
        this.time.delayedCall(Phaser.Math.Between(1500, 4000), spawnShootingStar);
      };

      this.tweens.add({
        targets: star,
        x: W + length,
        y: y + W * Math.tan(Phaser.Math.DegToRad(angle)),
        duration: (W + length) / speed * 1000,
        delay: 400,
        onUpdate,
        onComplete: finished,
      });

      this.tweens.add({
        targets: star,
        alpha: 1,
        duration: 150,
      });
    };

    for (let i = 0; i < 3; i++) {
      this.time.delayedCall(i * 1200, spawnShootingStar);
    }
  }

  updateRecord() {
    const score = this.game.records.highScore;
    if (this.recordText) this.recordText.destroy();
    this.recordText = this.add.text(CFG.WIDTH / 2, CFG.HEIGHT / 2 + 95, 'RÉCORD: ' + score, {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ffd93b',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);
  }

  start() {
    // Reinicio garantizado de una partida anterior: al reutilizarse la instancia
    // de GameScene (tras game over o surrender) hay que forzar que la dificultad,
    // la fase y el reloj de spawns vuelvan a su valor inicial.
    this.scene.stop('GameScene');
    this.scene.stop('UIScene');
    const gs = this.scene.get('GameScene');
    if (gs) {
      gs.wave = 1;
      gs.difficulty = 1;
      gs.startTime = this.time.now;
      gs.gameplayTime = 0;
      gs.inTransition = false;
      gs.gameOver = false;
      if (gs.spawner) gs.spawner.resetWave();
    }
    this.scene.start('GameScene');
    this.scene.launch('UIScene');
  }
}