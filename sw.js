// SERVICE WORKER — SHOOTING STARS
// Estrategia NETWORK-FIRST: el contenido siempre se busca en internet.
// La caché solo se usa como respaldo si no hay red (offline).
// Al publicar una nueva versión, sube el número de VERSION para que el
// navegador detecte un SW nuevo y aparezca el aviso "NUEVA VERSIÓN DESCARGADA".

const VERSION = '0.8-prerelease';
const RUNTIME = 'shooting-stars-' + VERSION + '-runtime';

// Rutas del shell de la app, usadas como respaldo de navegación
const SHELL_CANDIDATES = ['./index.html', './'];

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
        // cache: 'no-store' ignora la caché HTTP (heurística) del navegador,
        // garantizando que el calentamiento guarde la versión más reciente
        const res = await fetch(u, { cache: 'no-store' });
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

// Página mínima de "sin conexión" (último recurso, evita ERR_CACHE_MISS)
function offlinePage() {
  return new Response(
    '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>SHOOTING STARS — SIN CONEXIÓN</title>' +
    '<style>body{background:#05070f;color:#c8d2ea;font-family:monospace;display:flex;' +
    'align-items:center;justify-content:center;height:100vh;margin:0;text-align:center}' +
    'h1{color:#4dd4ff;letter-spacing:2px}p{line-height:1.6}</style></head>' +
    '<body><div><h1>SHOOTING STARS</h1><p>Sin conexión a internet.<br>' +
    'Conéctate y vuelve a abrir la app.</p></div></body></html>',
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

// Busca la app en caché: primero la URL exacta de la petición, luego el shell
async function shellFromCache(cache, req) {
  const reqHit = await cache.match(req);
  if (reqHit) return reqHit;
  for (const key of SHELL_CANDIDATES) {
    const hit = await cache.match(key);
    if (hit) return hit;
  }
  return null;
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (!req.url.startsWith('http')) return;
  const isNavigate = req.mode === 'navigate';

  event.respondWith((async () => {
    const cache = await caches.open(RUNTIME);

    // Sin conexión: no intentar la red, servir la copia guardada
    if (!navigator.onLine) {
      const hit = await shellFromCache(cache, req);
      return hit || offlinePage();
    }

    try {
      // cache: 'no-store' es CLAVE: un fetch() en un SW respeta la caché HTTP
      // del navegador (incluida la heurística sin Cache-Control). Sin esto,
      // tras publicar una versión el navegador podía servir los JS antiguos
      // desde su caché HTTP y "vencer" a la estrategia network-first.
      const res = await fetch(req, { cache: 'no-store' });
      if (res && (res.ok || res.type === 'opaque')) {
        try { await cache.put(req, res.clone()); } catch (e) { /* el cache put nunca debe romper la respuesta */ }
      }
      return res;
    } catch (err) {
      // La red falló (o el servidor no respondió): respaldo en caché
      const hit = await shellFromCache(cache, req);
      if (hit) return hit;
      if (isNavigate) return offlinePage();
      return new Response('', { status: 504, statusText: 'Offline' });
    }
  })());
});