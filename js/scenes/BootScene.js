class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.load.image('logo', 'assets/logo.png');
    this.load.image('maniac_logo', 'assets/Logo-Maniac.png');
    this.load.image('intro_p1', 'assets/Intro_P1.png');
    this.load.image('intro_p2', 'assets/Intro_P2.png');
    this.load.image('intro_p3', 'assets/Intro_P3.png');
    this.load.image('intro_p4', 'assets/Intro_P4.png');
    this.load.image('enemy_img', CFG.ENEMY_IMG);
    this.load.image('enemy_variant_img', CFG.VARIANT_IMG);
    this.load.image('enemy_low_img', CFG.LOW_IMG);
    this.load.image('enemy3_img', CFG.ENEMY3_IMG);
    this.load.image('enemy3_shot_img', CFG.ENEMY3_SHOT_IMG);
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

    if (this.sys.canvas) this.sys.canvas.style.cursor = 'default';

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

    this.creditsBtn = this.makeButton(W - 160, H - 64, 'CREDITOS', () => this.showCredits());

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

    if (this.shootingStarTimers) {
      this.shootingStarTimers.forEach((t) => t.remove());
      this.shootingStarTimers = [];
    }
    if (this.shootingStars) {
      this.shootingStars.forEach((s) => {
        this.tweens.killTweensOf(s.star);
        if (s.trail) s.trail.destroy();
        if (s.star) s.star.destroy();
      });
      this.shootingStars = [];
    }

    const W = CFG.WIDTH, H = CFG.HEIGHT;

    const overlay = this.add.graphics();
    overlay.fillStyle(0x05070f, 0.92);
    overlay.fillRect(0, 0, W, H);

    const slides = [
      { img: 'intro_p1', text: 'A nosotros nos dieron la tarea de explorar un planeta que apenas acababa de ser descubierto' },
      { img: 'intro_p2', text: 'Montamos nuestro campamento y nos dimos cuenta que había seres vivos no descubiertos' },
      { img: 'intro_p3', text: 'Esos monstruos destruyeron nuestro planeta y a todos con él' },
      { img: 'intro_p4', text: 'Por eso nos queremos vengar destruyendo toda su especie para cobrar lo que nos deben' },
    ];

    let current = 0;
    let currentImg = null;
    let transitioning = false;

    const bgBox = this.add.rectangle(0, 0, 1, 1, 0x007c0f, 1);
    bgBox.setOrigin(0.5, 0.5);

    const imgText = this.add.text(W / 2, 0, '', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#c8d2ea',
      align: 'center',
      wordWrap: { width: W - 80 },
    }).setOrigin(0.5, 0.5);

    const nextBtn = this.add.container(W / 2, H - 55);
    const nextRect = this.add.rectangle(0, 0, 150, 40, 0x1a2338, 1).setStrokeStyle(2, 0x4dd4ff, 1);
    const nextLabel = this.add.text(0, 0, 'SIGUIENTE', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#c8d2ea',
    }).setOrigin(0.5, 0.5);
    nextBtn.add([nextRect, nextLabel]);
    nextBtn.setSize(150, 40);
    nextBtn.setInteractive({ useHandCursor: true });
    nextBtn.on('pointerover', () => {
      nextRect.setFillStyle(0x2a3a5a, 1);
      nextLabel.setColor('#ffffff');
    });
    nextBtn.on('pointerout', () => {
      nextRect.setFillStyle(0x1a2338, 1);
      nextLabel.setColor('#c8d2ea');
    });

    this.game.sfx = this.game.sfx || new SoundFX();

    let typingEvent = null;

    const showSlide = (i) => {
      if (typingEvent) typingEvent.remove();
      const slide = slides[i];
      const src = this.textures.get(slide.img).getSourceImage();
      const maxW = W - 40;
      const maxH = H - 220;
      const scale = Math.min(maxW / src.width, maxH / src.height);
      const displayW = src.width * scale;
      const displayH = src.height * scale;
      const restX = W / 2;
      const restY = 20 + (displayH / 2);

      bgBox.setSize(displayW, displayH);
      bgBox.setPosition(restX, restY);

      if (currentImg) currentImg.destroy();
      const newImg = this.add.image(W + displayW / 2, restY, slide.img);
      newImg.setScale(scale);
      newImg.setOrigin(0.5, 0.5);
      currentImg = newImg;
      this.tweens.add({
        targets: newImg,
        x: restX,
        duration: 400,
        ease: 'Sine.easeOut',
      });

      imgText.setText('');
      imgText.setPosition(W / 2, restY + (displayH / 2) + 45);
      imgText.setAlpha(0);
      this.tweens.add({ targets: imgText, alpha: 1, duration: 200 });

      const text = slide.text;
      let idx = 0;
      typingEvent = this.time.addEvent({
        delay: 35,
        repeat: text.length - 1,
        callback: () => {
          if (this.game.sfx) this.game.sfx.type();
          idx++;
          imgText.setText(text.slice(0, idx));
        },
        callbackScope: this,
      });

      nextLabel.setText(i === slides.length - 1 ? 'COMENZAR' : 'SIGUIENTE');
    };

    const advance = () => {
      if (transitioning) return;
      if (typingEvent) {
        typingEvent.remove();
        typingEvent = null;
      }
      if (current < slides.length - 1) {
        transitioning = true;
        const outX = -(currentImg.displayWidth / 2);
        this.tweens.add({
          targets: currentImg,
          x: outX,
          duration: 400,
          ease: 'Sine.easeIn',
          onComplete: () => {
            current++;
            transitioning = false;
            showSlide(current);
          },
        });
      } else {
        nextBtn.off('pointerdown');
        keyEnter.off('down');
        this.input.off('pointerdown');
        this.tweens.killTweensOf(currentImg);
        currentImg.destroy();
        bgBox.destroy();
        overlay.destroy();
        imgText.destroy();
        nextBtn.destroy();
        this.showDifficultyMenu();
      }
    };

    nextBtn.on('pointerdown', advance);

    const keyEnter = this.input.keyboard.addKeys('ENTER').ENTER;
    const onEnter = () => {
      if (this.input.manager.activePointer.isDown) return;
      advance();
    };
    keyEnter.on('down', onEnter);

    showSlide(0);
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
    this.shootingStars = [];
    this.shootingStarTimers = [];
    const spawnShootingStar = () => {
      const y = Phaser.Math.Between(H * 0.1, H * 0.5);
      const speed = Phaser.Math.Between(250, 450);
      const length = Phaser.Math.Between(45, 80);
      const angle = Phaser.Math.Between(20, 40);

      const star = this.add.circle(0, y, 2.5, 0xffffff, 1);
      const trail = this.add.graphics();
      star.setAlpha(0);

      this.shootingStars.push({ star, trail });

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
        if (this.shootingStars) {
          const idx = this.shootingStars.findIndex((s) => s.star === star);
          if (idx !== -1) this.shootingStars.splice(idx, 1);
        }
        trail.destroy();
        star.destroy();
        const timer = this.time.delayedCall(Phaser.Math.Between(1500, 4000), spawnShootingStar);
        if (this.shootingStarTimers) this.shootingStarTimers.push(timer);
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

  makeButton(x, y, label, onClick) {
    const container = this.add.container(x, y);
    const rect = this.add.rectangle(0, 0, 130, 34, 0x1a2338, 1).setStrokeStyle(1, 0x4dd4ff, 1);
    const text = this.add.text(0, 0, label, {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#c8d2ea',
    }).setOrigin(0.5, 0.5);
    container.add([rect, text]);
    container.setSize(130, 34);
    container.setInteractive({ useHandCursor: true });
    container.on('pointerover', () => {
      rect.setFillStyle(0x2a3a5a, 1);
      text.setColor('#ffffff');
    });
    container.on('pointerout', () => {
      rect.setFillStyle(0x1a2338, 1);
      text.setColor('#c8d2ea');
    });
    container.on('pointerdown', (pointer, localX, localY, event) => {
      event.stopPropagation();
      onClick();
    });
    return container;
  }

  showCredits() {
    const W = CFG.WIDTH, H = CFG.HEIGHT;

    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x05070f, 0.85).setInteractive();
    const win = this.add.container(W / 2, H / 2);
    const close = () => {
      win.destroy();
      overlay.destroy();
    };
    overlay.on('pointerdown', (pointer, localX, localY, event) => {
      event.stopPropagation();
      close();
    });

    const winW = 700, winH = 460;
    const winBg = this.add.rectangle(0, 0, winW, winH, 0x0d1424, 1).setStrokeStyle(2, 0x4dd4ff, 1);

    const maniac = this.add.image(0, -50, 'maniac_logo');
    const src = this.textures.get('maniac_logo').getSourceImage();
    const maxW = winW - 40, maxH = 340;
    const scale = Math.min(maxW / src.width, maxH / src.height);
    maniac.setScale(scale);
    maniac.setOrigin(0.5, 0.5);

    const creditText = this.add.text(0, 140, ['HECHO POR MANUEL Y MANOLO', 'y una máquina llamada DeepSeek'], {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffd93b',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5, 0.5);

    const exitBtn = this.add.container(0, 195);
    const exitRect = this.add.rectangle(0, 0, 120, 34, 0x1a2338, 1).setStrokeStyle(1, 0xff5a5a, 1);
    const exitText = this.add.text(0, 0, 'SALIR', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#c8d2ea',
    }).setOrigin(0.5, 0.5);
    exitBtn.add([exitRect, exitText]);
    exitBtn.setSize(120, 34);
    exitBtn.setInteractive({ useHandCursor: true });
    exitBtn.on('pointerover', () => {
      exitRect.setFillStyle(0x2a3a5a, 1);
      exitText.setColor('#ffffff');
    });
    exitBtn.on('pointerout', () => {
      exitRect.setFillStyle(0x1a2338, 1);
      exitText.setColor('#c8d2ea');
    });
    exitBtn.on('pointerdown', (pointer, localX, localY, event) => {
      event.stopPropagation();
      close();
    });

    win.add([winBg, maniac, creditText, exitBtn]);
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

  showDifficultyMenu() {
    const W = CFG.WIDTH, H = CFG.HEIGHT;
    const overlay = this.add.graphics();
    overlay.fillStyle(0x05070f, 0.92);
    overlay.fillRect(0, 0, W, H);

    this.add.text(W / 2, H / 2 - 170, 'SELECCIONA LA DIFICULTAD', {
      fontFamily: 'monospace',
      fontSize: '26px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);

    const levels = [
      'FACIL', 'MEDIO', 'DIFICIL', 'EXTREMO',
    ];
    const startY = H / 2 - 80;
    levels.forEach((key, i) => {
      const def = CFG.DIFFICULTIES[key];
      const y = startY + i * 70;
      const btn = this.add.container(W / 2, y);
      const rect = this.add.rectangle(0, 0, 260, 54, 0x1a2338, 1).setStrokeStyle(2, def.color, 1);
      const text = this.add.text(0, 0, def.label, {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#c8d2ea',
        fontStyle: 'bold',
      }).setOrigin(0.5, 0.5);
      btn.add([rect, text]);
      btn.setSize(260, 54);
      btn.setInteractive({ useHandCursor: true });
      btn.on('pointerover', () => {
        rect.setFillStyle(0x2a3a5a, 1);
        text.setColor('#ffffff');
      });
      btn.on('pointerout', () => {
        rect.setFillStyle(0x1a2338, 1);
        text.setColor('#c8d2ea');
      });
      btn.on('pointerdown', (pointer, localX, localY, event) => {
        event.stopPropagation();
        this.game.selectedDifficulty = def.mult;
        this.start();
      });
    });
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
      gs.difficulty = this.game.selectedDifficulty || 1;
      gs.startTime = this.time.now;
      gs.gameplayTime = 0;
      gs.inTransition = false;
      gs.gameOver = false;
      gs.victoryPending = false;
      if (gs.spawner) gs.spawner.resetWave();
    }
    this.scene.start('GameScene');
    this.scene.launch('UIScene');
  }
}