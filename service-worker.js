const CACHE = 'mappa-squadra-v18';
const MAP_PATH = '/assets/map-placeholder.jpg';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './assets/streets.json',
  './assets/map-placeholder.pdf',
  './assets/map-placeholder.jpg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  if (requestUrl.pathname.endsWith(MAP_PATH)) {
    event.respondWith(
      fetch(event.request).then((response) => {
        if (response.ok) {
          event.waitUntil(
            caches.open(CACHE).then((cache) => cache.put(event.request, response.clone()))
          );
        }
        return response;
      }).catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
