// SERVICE WORKER — SHOOTING STARS
// Estrategia NETWORK-FIRST: el contenido siempre se busca en internet.
// La caché solo se usa como respaldo si no hay red (offline).
// Al publicar una nueva versión, sube el número de VERSION para que el
// navegador detecte un SW nuevo y aparezca el aviso "NUEVA VERSIÓN DESCARGADA".

const VERSION = '0.3.0';
const RUNTIME = 'shooting-stars-' + VERSION + '-runtime';

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    await self.skipWaiting();
    // calentamiento ligero de la caché (red en caliente) para que el juego
    // funcione offline desde la primera instalación. No se sirve desde caché
    // mientras haya red: solo es el respaldo.
    const cache = await caches.open(RUNTIME);
    const urls = [
      './',
      './index.html',
      './css/style.css',
      './manifest.webmanifest',
      'https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js',
    ];
    await Promise.all(urls.map(async (u) => {
      try {
        const res = await fetch(u);
        if (res && res.ok) await cache.put(u, res);
      } catch (e) { /* sin red en el primer arranque: se ignora */ }
    }));
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((k) => k.startsWith('shooting-stars-') && k !== RUNTIME)
        .map((k) => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (!req.url.startsWith('http')) return;

  event.respondWith((async () => {
    const cache = await caches.open(RUNTIME);
    try {
      const res = await fetch(req);
      if (res && (res.ok || res.type === 'opaque')) {
        cache.put(req, res.clone());
      }
      return res;
    } catch (err) {
      // offline: se usa el respaldo guardado
      const cached = await cache.match(req);
      if (cached) return cached;
      if (req.mode === 'navigate') {
        const shell = await cache.match('./index.html');
        if (shell) return shell;
      }
      throw err;
    }
  })());
});