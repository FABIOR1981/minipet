// Este archivo lo completa herramientas/construir.js al publicar:
// reemplaza la versión y la lista de archivos (generadas a partir de lo que
// realmente se publica). Sin build (npx serve) sw.js queda con los marcadores
// y el navegador lo registra igual, pero sin lista offline.
const CACHE_VERSION = '__VERSION__';
const CACHE_NAME = `minipet-cache-${CACHE_VERSION}`;

const ASSETS_TO_CACHE = /*__ASSETS__*/[];

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
        // ignoreSearch: la página abierta con ?prueba también sale de la caché
        return caches.match(event.request, { ignoreSearch: true });
      })
  );
});