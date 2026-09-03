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

  const installBtn = document.getElementById('install-btn');
  if (installBtn) {
    installBtn.style.left = (ox + 8) + 'px';
    installBtn.style.top = (oy + 8) + 'px';
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

// ---- Fullscreen automático en el primer toque (solo móviles táctiles) ----
// El navegador exige un gesto del usuario para el fullscreen; se aprovecha el
// primer toque para pedirlo. En escritorio o como app standalone se ignora.
function isTouchDevice() {
  return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
}

function enterFullscreen() {
  if (document.fullscreenElement) return;
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(() => {});
  }
}

if (isTouchDevice()) {
  const requestFs = () => {
    enterFullscreen();
    window.removeEventListener('pointerdown', requestFs);
  };
  window.addEventListener('pointerdown', requestFs, { passive: true });
}

// ---- PWA: registro del service worker + aviso de nueva versión ----
// En localhost (desarrollo) se desactiva el SW: se desregistra cualquier copia
// ya instalada para evitar fallos de fetch (ERR_CACHE_MISS) que ralentizan la carga.
if ('serviceWorker' in navigator) {
  const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  if (isLocalhost) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((reg) => reg.unregister());
      });
    });
  } else {
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

// ---- PWA: botón de instalación (solo si el navegador puede instalarla) ----
let deferredInstallPrompt = null;
const installBtn = document.getElementById('install-btn');

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

function setInstallButtonVisible(visible) {
  if (installBtn) installBtn.style.display = visible ? 'flex' : 'none';
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  if (!isStandalone()) setInstallButtonVisible(true);
});

if (installBtn) {
  installBtn.addEventListener('click', async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    const choice = await deferredInstallPrompt.userChoice;
    if (choice && choice.outcome === 'accepted') {
      setInstallButtonVisible(false);
    }
    deferredInstallPrompt = null;
  });
}

window.addEventListener('appinstalled', () => {
  setInstallButtonVisible(false);
  deferredInstallPrompt = null;
});

// Si el juego ya se abre como app instalada, no mostrar el botón
if (isStandalone()) setInstallButtonVisible(false);