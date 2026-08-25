class InputHandler {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.mouseActive = false;

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
  }
}