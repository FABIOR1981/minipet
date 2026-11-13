# 🐾 Mi Mascota  (MiniPet)

Mascota virtual estilo Tamagotchi, 100% web, instalable como **PWA**. Cuidá a tu mascota, vestila con accesorios, decorá su escenario y ganá monedas jugando minijuegos.

## Documentación

El manual de usuario está en [documentacion-central](https://github.com/FABIOR1981/documentacion-central/tree/main/minipet/documentacion) ([PDF](https://github.com/FABIOR1981/documentacion-central/blob/main/minipet/documentacion/MANUAL_USUARIO.pdf)). También se puede consultar desde la bitácora de proyectos.

El contexto técnico detallado (para quien vaya a tocar el código) está en [`desarrollo/CONTEXTO-PROYECTO.md`](desarrollo/CONTEXTO-PROYECTO.md).

## ✨ Funcionalidades

- **Estado en vivo**: monedas 🪙, felicidad ❤️, hambre 🍕 y energía ⚡, que decaen con el tiempo (`tick()` cada 8s). Una partida nueva arranca con 500 monedas.
- **Mascota animada**: rostro kawaii modular (feliz, con hambre, enferma, cansada, aburrida, durmiendo) y frases aleatorias cargadas desde `data/dialogues.json`. En reposo respira y parpadea, y al caminar mira hacia donde va.
- **La mascota camina sola** por todo el piso del escenario cada 5s (si no está durmiendo ni enferma). Se achica al ir hacia el fondo, tiene sombra apoyada en el piso y pasa por detrás de los objetos del primer plano.
- **Acciones**: Comer 🍗, Medicina 🏥 (cura si está enferma) y Dormir 😴 (recupera energía de a poco y se despierta sola al llegar a 100). Cada una se ve: la mascota mastica un bocado, sale un cartelito con lo que ganó y al dormir se hace de noche en la habitación.
- **Mi Pet**: color de piel, tamaño, forma y brillantina.
- **Accesorios**: 21 accesorios equipables (sombreros, orejas, lentes, alas, etc.) y looks guardados (hasta 6).
- **Escenarios**: 17 escenarios ilustrados (sala, playa, espacio, castillo, volcán, dojo, disco, etc.), cada uno comprable con monedas, con partículas ambientales y detalles animados propios (fuego, nubes, luces, luciérnagas).
- **6 minijuegos** para ganar monedas: Atrapa Dulces, Explotar Globos, Torre de Postres, Simón Memoria, Runner Mágico y Burbujas Mágicas — con soporte táctil y de teclado, y mejor puntaje guardado por juego. Tu mascota participa en todos: es la protagonista en Runner y Atrapa Dulces, mira y reacciona en los demás, hace la cuenta regresiva y festeja el resultado.
- **Efectos de sonido** generados con Web Audio API (sin archivos de audio externos).
- **PWA instalable**: `manifest.json` + `sw.js` con estrategia *network-first* y caché offline; avisa al usuario cuando hay una versión nueva disponible.
- **Persistencia local**: todo el progreso se guarda en `localStorage`.

## 📁 Estructura del proyecto

```
minipet/
├── index.html                 # Estructura principal de la app
├── manifest.json              # Metadatos PWA (ícono, colores, modo standalone)
├── sw.js                      # Service Worker (caché offline, versión de caché)
├── netlify.toml               # Build y cabeceras para Netlify
├── data/
│   └── dialogues.json         # Frases de la mascota por estado de ánimo
├── css/
│   ├── base.css               # Layout general, barras, modal, tienda
│   ├── escenarios.css         # Los 17 escenarios, su primer plano y las partículas
│   ├── mascota.css            # Mascota, formas, accesorios, sombra y animaciones
│   └── juegos.css             # Minijuegos: HUD, conteo y pantalla de resultado
├── js/
│   ├── app.js                 # Sonidos (AudioEffects), inicio, navegación y registro del SW
│   ├── mascota-estado.js      # PetState: stats, acciones, inventario, looks, guardado
│   ├── mascota-visual.js      # PetState: dibujo, cara, diálogos, paseo y profundidad
│   ├── particulas.js          # Partículas ambientales por escenario
│   ├── ambiente.js            # Detalles animados de cada escenario (luces, nubes, fuego)
│   ├── catalogo.js            # Datos: accesorios, escenarios, formas y ajustes
│   ├── tienda.js              # Store: tienda, Accesorios, Escenario y Mi Pet
│   └── juegos/
│       ├── juegos-base.js     # Minigames: menú, conteo, resultado, récords, HUD
│       ├── mascota-mini.js    # La mascota dentro de los juegos (protagonista y espectadora)
│       ├── atrapa-dulces.js
│       ├── explota-globos.js
│       ├── torre-postres.js
│       ├── simon-memoria.js
│       ├── runner-magico.js
│       └── burbujas-magicas.js
├── img/
│   ├── accessories/           # SVG de los accesorios equipables
│   └── escenarios/            # Ilustración SVG de cada escenario
│       ├── frente/            # Objetos que van por delante de la mascota
│       └── fx/                # Sprites del ambiente animado (nube, llama, pez, ola)
├── herramientas/
│   └── construir.js           # Build: copia a publicar/ solo lo que usa el navegador
├── desarrollo/                # Contexto técnico y páginas de prueba (no se publican)
└── documentacion/
    └── LEEME.md               # Enlace a documentacion-central
```

## ▶️ Cómo correrlo

Es una app estática: basta con servir la carpeta con cualquier servidor HTTP (necesario para que `fetch('data/dialogues.json')` y el Service Worker funcionen; no se puede abrir `index.html` directo con `file://`).

```bash
npx serve .
# o
python3 -m http.server
```

Luego abrir la URL en el navegador. En móvil, se puede "Agregar a pantalla de inicio" para instalarla como PWA.

## 🧪 Modo prueba

Agregando `?prueba` a la dirección (por ejemplo `https://minipetkw.netlify.app/?prueba`) el juego abre en modo prueba: usa una partida aparte, que no toca la partida real, y siempre arranca con 99.999 monedas para poder comprar y probar todo sin jugar antes. Se reconoce por el cartel "🧪 Modo prueba" en la esquina de la habitación.

- La partida de prueba se guarda por separado y se conserva entre visitas.
- `?prueba=reiniciar` la borra y empieza de cero.
- Sin el parámetro, el juego funciona como siempre.

## 🚀 Publicación

Netlify ejecuta `node herramientas/construir.js`, que copia a `publicar/` únicamente `index.html`, `manifest.json`, `sw.js`, `css/`, `js/`, `data/` e `img/`. Las carpetas `desarrollo/`, `documentacion/` y `herramientas/` no llegan al sitio publicado.

## 🔧 Notas técnicas

- Al agregar un accesorio nuevo hay que sumarlo en tres lugares: el `.svg` en `img/accessories/`, la entrada en `Catalogo.items` y su ajuste en `Catalogo.accessoryFits` (`js/catalogo.js`), y la ruta en `ASSETS_TO_CACHE` (`sw.js`) para que quede disponible offline.
- Al agregar un escenario nuevo hay que sumarlo en cuatro lugares: la ilustración `.svg` (400x480, piso desde y=280) en `img/escenarios/`, la regla `.room.bg_<id>` en `css/escenarios.css`, la entrada en `Catalogo.items` (`js/catalogo.js`, categoría `bg`, con su `preview`) y la ruta en `ASSETS_TO_CACHE` (`sw.js`). Si lleva objetos por delante de la mascota, van en un segundo `.svg` transparente en `img/escenarios/frente/`, con su regla `.room.bg_<id>::after` y su ruta en el caché.
- Los detalles animados de un escenario se declaran en `Ambiente.CONFIG` (`js/ambiente.js`), usando las mismas coordenadas que la ilustración.
- Los objetos del primer plano deben apoyarse en el borde inferior de la ilustración, para quedar siempre más cerca que la mascota.
- Cada vez que se publica una versión nueva, conviene subir `CACHE_VERSION` en `sw.js` para forzar la actualización en los dispositivos de los usuarios.
