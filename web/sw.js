/* Tamoveer service worker: offline-first, versioned cache */
const VERSION = 'tamoveer-v2.1.0';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('tamoveer-') && k !== VERSION).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Page loads: serve the cached game instantly (works offline), refresh it in the background.
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(VERSION);
      const cached = (await cache.match('index.html')) || (await cache.match('./'));
      const refresh = fetch(req).then(res => { if (res && res.ok) cache.put('index.html', res.clone()); return res; }).catch(() => null);
      event.waitUntil(refresh);
      return cached || (await refresh) || new Response('Tamoveer is offline and not cached yet. Open it once while online.', { status: 503, headers: { 'Content-Type': 'text/plain' } });
    })());
    return;
  }

  // Everything else: cache first, update in background.
  event.respondWith((async () => {
    const hit = await caches.match(req);
    const refresh = fetch(req).then(res => {
      if (res && res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => hit);
    if (hit) { event.waitUntil(refresh); return hit; }
    return (await refresh) || new Response('', { status: 504 });
  })());
});
