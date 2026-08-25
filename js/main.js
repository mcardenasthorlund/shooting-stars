const config = {
  type: Phaser.AUTO,
  width: CFG.WIDTH,
  height: CFG.HEIGHT,
  parent: 'game',
  backgroundColor: '#05070f',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, GameScene, UIScene, ShopScene],
};

const game = new Phaser.Game(config);
game.records = new RecordSystem();