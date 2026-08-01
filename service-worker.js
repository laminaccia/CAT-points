const CACHE = 'mappa-squadra-v72';
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
  // `cache: 'reload'` obbliga ogni richiesta a passare dalla rete, scavalcando
  // la cache HTTP del browser. Senza, il precaricamento può rimettere in cache
  // proprio i file vecchi che il bump di CACHE doveva sostituire: è già
  // successo: la cache v21 conteneva un index.html che chiedeva ancora
  // styles.css?v=13. Il risultato è un aggiornamento pubblicato che non arriva
  // a nessuno, pur avendo bumpato correttamente tutte le versioni.
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(ASSETS.map((url) => new Request(url, { cache: 'reload' })))
    )
  );
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

  event.respondWith(
    caches.match(event.request).then((trovata) => {
      if (trovata) return trovata;

      return fetch(event.request)
        .then((response) => {
          // Quello che si scarica finisce in cache con la sua URL esatta, così
          // un file appena versionato è disponibile offline dalla volta dopo
          // senza aspettare la prossima installazione del service worker.
          if (response.ok && event.request.method === 'GET' && requestUrl.origin === self.location.origin) {
            const copia = response.clone();
            event.waitUntil(caches.open(CACHE).then((cache) => cache.put(event.request, copia)));
          }
          return response;
        })
        .catch(() => {
          // Rete assente. La lista ASSETS è precaricata SENZA query
          // ('./styles.css'), ma index.html chiede 'styles.css?v=13' e per la
          // Cache API la query fa parte dell'identità della risorsa: la
          // corrispondenza esatta qui sopra fallisce sempre. Senza questa
          // seconda ricerca che ignora la query, offline non arrivavano né il
          // CSS né il JS e restava un guscio HTML nudo.
          //
          // Sta in fondo, e non al posto della ricerca esatta, di proposito:
          // online il ?v=N continua a funzionare da cache-buster com'è sempre
          // stato — versione nuova, corrispondenza mancata, file preso dalla
          // rete. Qui si ripiega su una versione vecchia soltanto quando
          // l'alternativa è non mostrare niente.
          return caches.match(event.request, { ignoreSearch: true });
        });
    })
  );
});
