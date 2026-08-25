class PowerUpSystem {
  constructor(scene) {
    this.scene = scene;
    this.group = scene.physics.add.group();
    this.inventory = [];
    this.cleared = false;

    // cadencia global de 90s (no se reinicia entre fases)
    this.spawnTimer = scene.time.addEvent({
      delay: CFG.POWER_UP_SPAWN_INTERVAL,
      loop: true,
      callback: () => this.spawn(),
      startAt: 0,
    });
  }

  spawnRandom() {
    this.spawn();
  }

  spawn() {
    if (this.cleared) return;
    const types = Object.keys(CFG.POWER_UPS);
    const type = types[Phaser.Math.Between(0, types.length - 1)];
    const powerUp = new PowerUp(this.scene, type);
    this.group.add(powerUp.sprite);
  }

  update(dt) {
    const stars = this.group.getChildren().slice();
    for (const s of stars) {
      if (!s.active) continue;
      const handler = s.getData('handler');
      if (handler) handler.update(dt);
      if (handler && handler.outOfBounds()) {
        s.destroy();
      }
    }
  }

  collect(type) {
    if (this.inventory.length >= CFG.INVENTORY_SIZE) {
      this.inventory.shift();
    }
    this.inventory.push(type);
    this.scene.events.emit('inventory-changed', this.inventory.slice());
  }

  use(slotIndex) {
    if (slotIndex < 0 || slotIndex >= this.inventory.length) return null;
    const type = this.inventory[slotIndex];
    this.inventory.splice(slotIndex, 1);
    this.scene.events.emit('inventory-changed', this.inventory.slice());
    return type;
  }

  peek() {
    return this.inventory.slice();
  }

  clear() {
    this.cleared = true;
    if (this.spawnTimer) {
      this.spawnTimer.remove();
      this.spawnTimer = null;
    }
    const list = this.group.getChildren().slice();
    for (const s of list) s.destroy();
    this.inventory = [];
  }
}
