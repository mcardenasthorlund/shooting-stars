class InputHandler {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.mouseActive = false;
    this.suppressAutoFire = false;

    // teclado (alternativa al ratón)
    this.keys = scene.input.keyboard.addKeys({
      up: 'UP',
      down: 'DOWN',
      w: 'W',
      s: 'S',
    });

    this.space = scene.input.keyboard.addKey('SPACE');
    this.space.on('down', () => scene.tryFire());
    scene.input.on('pointerdown', () => scene.tryFire());
    scene.input.on('pointermove', (pointer) => {
      this.mouseActive = true;
      this.aimWithMouse(pointer);
    });
    scene.input.on('pointerdown', (pointer) => {
      this.mouseActive = true;
      this.aimWithMouse(pointer);
    });
  }

  aimWithMouse(pointer) {
    const player = this.player;
    const dx = pointer.worldX - player.sprite.x;
    const dy = pointer.worldY - player.sprite.y;
    const deg = Phaser.Math.RadToDeg(Math.atan2(dy, dx));
    player.setGunAngle(deg);
  }

  update(dt) {
    const player = this.player;
    const scene = this.scene;

    // teclado solo si el ratón aún no se ha usado
    if (!this.mouseActive) {
      const keys = this.keys;
      if (keys.up.isDown || keys.w.isDown) {
        player.setGunAngle(player.gunAngle - (CFG.PLAYER_INTRO_SPEED * dt) / 1000);
      }
      if (keys.down.isDown || keys.s.isDown) {
        player.setGunAngle(player.gunAngle + (CFG.PLAYER_INTRO_SPEED * dt) / 1000);
      }
    }

    // Durante el modo GRANADE se desactiva el disparo continuo (una granada por pulsación).
    // Al terminar el power up, se espera a soltar el botón antes de reanudar el disparo continuo,
    // para que el jugador no empiece a disparar solo sin volver a pulsar.
    const grenadeMode = scene.grenadeShotsLeft > 0;
    if (grenadeMode) {
      this.suppressAutoFire = true;
    } else if (!scene.input.activePointer.isDown) {
      this.suppressAutoFire = false;
    }

    // disparo continuo mientras se mantenga pulsado (ratón o dedo en pantalla)
    if (scene.input.activePointer.isDown && !grenadeMode && !this.suppressAutoFire) {
      const weapon = scene.getWeapon();
      if (scene.time.now - scene.lastFireTime >= weapon.cooldown) {
        scene.tryFire();
      }
    }
  }
}