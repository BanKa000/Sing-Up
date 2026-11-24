const cacheName = 'orlova-groom-v4';
const assets = ['./', './index.html', './style.css?v=4', './app.js?v=4', './manifest.webmanifest',
  './hero.webp', './dog.webp', './cat.webp', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(assets)));
});
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name.startsWith('orlova-groom-') && name !== cacheName)
      .map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(async () => (await caches.open(cacheName)).match('./index.html')));
    return;
  }
  event.respondWith((async () => {
    const cached = await (await caches.open(cacheName)).match(request);
    return cached || fetch(request);
  })());
});
