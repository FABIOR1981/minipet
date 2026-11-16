const CACHE_VERSION = 'v2.19.0'; // Change version here to force reload on users' devices
const CACHE_NAME = `minipet-cache-${CACHE_VERSION}`;

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/base.css',
  './css/escenarios.css',
  './css/mascota.css',
  './css/juegos.css',
  './css/vestidor.css',
  './js/app.js',
  './js/dibujos.js',
  './js/iconos.js',
  './js/avisos.js',
  './js/mascota-estado.js',
  './js/mascota-visual.js',
  './js/particulas.js',
  './js/ambiente.js',
  './js/catalogo.js',
  './js/tienda.js',
  './js/vestidor.js',
  './js/juegos/juegos-base.js',
  './js/juegos/mascota-mini.js',
  './js/juegos/atrapa-dulces.js',
  './js/juegos/explota-globos.js',
  './js/juegos/torre-postres.js',
  './js/juegos/simon-memoria.js',
  './js/juegos/runner-magico.js',
  './js/juegos/burbujas-magicas.js',
  './js/juegos/parejas.js',
  './js/juegos/donde-esta.js',
  './js/juegos/vestir-igual.js',
  './js/juegos/lluvia-comida.js',
  './data/dialogues.json',
  './manifest.json',
  './img/dibujos/adhesive-bandage.svg',
  './img/dibujos/artist-palette.svg',
  './img/dibujos/backhand-index-pointing-right-default.svg',
  './img/dibujos/backhand-index-pointing-up-default.svg',
  './img/dibujos/balloon.svg',
  './img/dibujos/banana.svg',
  './img/dibujos/bathtub.svg',
  './img/dibujos/beach-with-umbrella.svg',
  './img/dibujos/bed.svg',
  './img/dibujos/black-square-button.svg',
  './img/dibujos/brain.svg',
  './img/dibujos/broccoli.svg',
  './img/dibujos/bubbles.svg',
  './img/dibujos/bullseye.svg',
  './img/dibujos/camera-with-flash.svg',
  './img/dibujos/candy.svg',
  './img/dibujos/carrot.svg',
  './img/dibujos/castle.svg',
  './img/dibujos/cat-face.svg',
  './img/dibujos/cheese-wedge.svg',
  './img/dibujos/cherry-blossom.svg',
  './img/dibujos/chocolate-bar.svg',
  './img/dibujos/cloud.svg',
  './img/dibujos/coin.svg',
  './img/dibujos/cookie.svg',
  './img/dibujos/cooking.svg',
  './img/dibujos/coral.svg',
  './img/dibujos/couch-and-lamp.svg',
  './img/dibujos/crescent-moon.svg',
  './img/dibujos/crown.svg',
  './img/dibujos/cupcake.svg',
  './img/dibujos/dango.svg',
  './img/dibujos/deciduous-tree.svg',
  './img/dibujos/desert.svg',
  './img/dibujos/diving-mask.svg',
  './img/dibujos/dress.svg',
  './img/dibujos/droplet.svg',
  './img/dibujos/dumpling.svg',
  './img/dibujos/evergreen-tree.svg',
  './img/dibujos/ewe.svg',
  './img/dibujos/face-with-thermometer.svg',
  './img/dibujos/fire.svg',
  './img/dibujos/front-facing-baby-chick.svg',
  './img/dibujos/game-die.svg',
  './img/dibujos/glowing-star.svg',
  './img/dibujos/grapes.svg',
  './img/dibujos/green-heart.svg',
  './img/dibujos/growing-heart.svg',
  './img/dibujos/hamburger.svg',
  './img/dibujos/headphone.svg',
  './img/dibujos/joker.svg',
  './img/dibujos/key.svg',
  './img/dibujos/leaf-fluttering-in-wind.svg',
  './img/dibujos/lollipop.svg',
  './img/dibujos/magic-wand.svg',
  './img/dibujos/milky-way.svg',
  './img/dibujos/mirror-ball.svg',
  './img/dibujos/mirror.svg',
  './img/dibujos/mushroom.svg',
  './img/dibujos/musical-notes.svg',
  './img/dibujos/ninja-default.svg',
  './img/dibujos/pancakes.svg',
  './img/dibujos/party-popper.svg',
  './img/dibujos/partying-face.svg',
  './img/dibujos/paw-prints.svg',
  './img/dibujos/performing-arts.svg',
  './img/dibujos/person-fairy-default.svg',
  './img/dibujos/pill.svg',
  './img/dibujos/pirate-flag.svg',
  './img/dibujos/pizza.svg',
  './img/dibujos/pleading-face.svg',
  './img/dibujos/poultry-leg.svg',
  './img/dibujos/pretzel.svg',
  './img/dibujos/rabbit-face.svg',
  './img/dibujos/rainbow.svg',
  './img/dibujos/red-apple.svg',
  './img/dibujos/red-heart.svg',
  './img/dibujos/ribbon.svg',
  './img/dibujos/rocket.svg',
  './img/dibujos/running-shoe.svg',
  './img/dibujos/scarf.svg',
  './img/dibujos/shinto-shrine.svg',
  './img/dibujos/shortcake.svg',
  './img/dibujos/sleeping-face.svg',
  './img/dibujos/smiling-face-with-smiling-eyes.svg',
  './img/dibujos/snow-capped-mountain.svg',
  './img/dibujos/snowflake.svg',
  './img/dibujos/soccer-ball.svg',
  './img/dibujos/socks.svg',
  './img/dibujos/sparkles.svg',
  './img/dibujos/sparkling-heart.svg',
  './img/dibujos/star.svg',
  './img/dibujos/strawberry.svg',
  './img/dibujos/teddy-bear.svg',
  './img/dibujos/tent.svg',
  './img/dibujos/test-tube.svg',
  './img/dibujos/thermometer.svg',
  './img/dibujos/unicorn.svg',
  './img/dibujos/video-game.svg',
  './img/dibujos/volcano.svg',
  './img/dibujos/watermelon.svg',
  './img/dibujos/white-circle.svg',
  './img/dibujos/wrapped-gift.svg',
  './img/dibujos/wrench.svg',
  './img/dibujos/yawning-face.svg',
  './img/dibujos/zzz.svg',
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
  './img/accessories/bunny_ears.svg',
  './img/accessories/fairy_wings.svg',
  './img/accessories/ninja_band.svg',
  './img/accessories/snorkel.svg',
  './img/accessories/space_helmet.svg',
  './img/accessories/winter_beanie.svg',
  './img/accessories/winter_scarf.svg',
  './img/accessories/shower_cap.svg',
  './img/escenarios/sala.svg',
  './img/escenarios/dormitorio.svg',
  './img/escenarios/juegos.svg',
  './img/escenarios/parque.svg',
  './img/escenarios/playa.svg',
  './img/escenarios/bosque.svg',
  './img/escenarios/montana.svg',
  './img/escenarios/campamento.svg',
  './img/escenarios/desierto.svg',
  './img/escenarios/cocina.svg',
  './img/escenarios/bano.svg',
  './img/escenarios/dojo.svg',
  './img/escenarios/disco.svg',
  './img/escenarios/espacio.svg',
  './img/escenarios/castillo.svg',
  './img/escenarios/submarino.svg',
  './img/escenarios/volcan.svg',
  './img/escenarios/vestidor.svg',
  './img/escenarios/frente/sala.svg',
  './img/escenarios/frente/dormitorio.svg',
  './img/escenarios/frente/juegos.svg',
  './img/escenarios/frente/parque.svg',
  './img/escenarios/frente/playa.svg',
  './img/escenarios/frente/bosque.svg',
  './img/escenarios/frente/montana.svg',
  './img/escenarios/frente/campamento.svg',
  './img/escenarios/frente/desierto.svg',
  './img/escenarios/frente/cocina.svg',
  './img/escenarios/frente/bano.svg',
  './img/escenarios/frente/dojo.svg',
  './img/escenarios/frente/castillo.svg',
  './img/escenarios/frente/submarino.svg',
  './img/escenarios/frente/volcan.svg',
  './img/escenarios/fx/nube.svg',
  './img/escenarios/fx/llama.svg',
  './img/escenarios/fx/pez.svg',
  './img/escenarios/fx/ola.svg'
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
        // ignoreSearch: la página abierta con ?prueba también sale de la caché
        return caches.match(event.request, { ignoreSearch: true });
      })
  );
});