'use strict';
/* Cache exclusivo do mini arcade. Não controla as campanhas Godot 13/22. */
const CACHE_NAME = 'correria-no-planalto-v02';
const CORE = [
  './', './index.html', './game.js?v=2', './style.css?v=2',
  './manifest.webmanifest', './arcade-icon.svg',
  './assets/lula_idle.png', './assets/lula_run.png',
  './assets/alckmin_idle.png', './assets/alckmin_run.png',
  './assets/flavio_idle.png', './assets/flavio_run.png',
  './assets/eduardo_idle.png', './assets/eduardo_run.png',
  './assets/maleta.png', '../media/hero13.jpg', '../media/hero22.jpg'
];
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.allSettled(CORE.map(url => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key.startsWith('correria-no-planalto-') && key !== CACHE_NAME)
        .map(key => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      if (response.ok && response.type === 'basic') {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)));
      }
      return response;
    }))
  );
});
