const config = {
  type: Phaser.AUTO,
  width: CFG.WIDTH,
  height: CFG.HEIGHT,
  parent: 'game',
  backgroundColor: '#05070f',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
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

// Coloca el logo HTML y el botón fullscreen siguiendo el canvas centrado (Scale.FIT)
function positionHtmlOverlays() {
  const sm = game.scale;
  if (!sm || !sm.parentSize || !sm.displaySize) return;
  const ox = Math.floor((sm.parentSize.width - sm.displaySize.width) / 2);
  const oy = Math.floor((sm.parentSize.height - sm.displaySize.height) / 2);

  const logo = document.getElementById('logo');
  if (logo) {
    logo.style.left = (ox + sm.displaySize.width / 2) + 'px';
    logo.style.top = (oy - 90) + 'px';
  }

  const fsBtn = document.getElementById('fullscreen-btn');
  if (fsBtn) {
    fsBtn.style.left = (ox + sm.displaySize.width - 46) + 'px';
    fsBtn.style.top = (oy + 8) + 'px';
  }
}
game.scale.on('resize', positionHtmlOverlays);
game.events.once('ready', positionHtmlOverlays);

// ---- Botón de pantalla completa ----
const fsBtn = document.getElementById('fullscreen-btn');
if (fsBtn) {
  fsBtn.addEventListener('click', () => {
    if (document.fullscreenElement) {
      if (document.exitFullscreen) document.exitFullscreen();
    } else if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  });
}

// ---- PWA: registro del service worker + aviso de nueva versión ----
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // true si la página ya estaba controlada por un SW (para no avisar en la 1ª instalación)
    const hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register('sw.js').then((reg) => {
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && hadController) {
            showUpdateBanner();
          }
        });
      });
    });
  });
}

function showUpdateBanner() {
  const banner = document.getElementById('update-banner');
  if (!banner) return;
  banner.classList.add('visible');
  const reloadBtn = banner.querySelector('button');
  if (reloadBtn) reloadBtn.onclick = () => location.reload();
  const close = banner.querySelector('.update-close');
  if (close) close.onclick = () => banner.classList.remove('visible');
}