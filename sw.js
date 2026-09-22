const CACHE_VERSION = 'v1.0.0'; // Change version here to force reload on users' devices
const CACHE_NAME = `minipet-cache-${CACHE_VERSION}`;

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './js/pet.js',
  './js/store.js',
  './js/minigames.js',
  './data/dialogues.json',
  './manifest.json',
  './img/accessories/hat_crown.svg',
  './img/accessories/glasses_cool.svg',
  './img/accessories/bow_tie.svg',
  './img/accessories/party_hat.svg',
  './img/accessories/headphones.svg',
  './img/accessories/magic_wand.svg',
  './img/accessories/ribbon_pink.svg',
  './img/accessories/star_glasses.svg',
  './img/accessories/flower_pink.svg',
  './img/accessories/cat_ears.svg',
  './img/accessories/pirate_hat.svg',
  './img/accessories/wizard_hat.svg',
  './img/accessories/chef_hat.svg',
  './img/accessories/bunny_ears.svg'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Forzar activación inmediata de la nueva versión
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activación y limpieza de caché de versiones anteriores
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache); // Borra caché vieja
          }
        })
      );
    }).then(() => self.clients.claim()) // Toma control de los clientes abiertos
  );
});

// Estrategia de búsqueda: Network First (prioriza descargar lo más nuevo si hay conexión)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Si hay red, actualiza la copia en caché y devuelve la versión más reciente
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      })
      .catch(() => {
        // Si no hay conexión (offline), devuelve desde la caché
        return caches.match(event.request);
      })
  );
});