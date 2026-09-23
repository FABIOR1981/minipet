# 🐾 Mi Mascota  (MiniPet)

Mascota virtual estilo Tamagotchi, 100% web, instalable como **PWA**. Cuidá a tu mascota, vestila con accesorios, decorá su escenario y ganá monedas jugando minijuegos.

## ✨ Funcionalidades

- **Estado en vivo**: monedas 🪙, felicidad ❤️, hambre 🍕 y energía ⚡, que decaen con el tiempo (`tick()` cada 8s).
- **Mascota animada**: rostro kawaii modular (feliz, con hambre, enferma, cansada, aburrida, durmiendo) y frases aleatorias cargadas desde `data/dialogues.json`.
- **La mascota se mueve sola** por la habitación cada 6s (si no está durmiendo ni enferma).
- **Acciones**: Comer 🍗, Medicina 🏥 (cura si está enferma) y Dormir 😴 (recupera energía al 100%).
- **Armario**: 22 accesorios equipables (sombreros, orejas, lentes, alas, etc.) + selector de color de piel.
- **Tienda**: 17 escenarios/fondos temáticos (living, playa, espacio, castillo, volcán, dojo, disco, etc.), cada uno comprable con monedas.
- **6 minijuegos** para ganar monedas: Atrapa Dulces, Explotar Globos, Torre de Postres, Simón Memoria, Runner Mágico y Burbujas Mágicas — todos con soporte táctil y de teclado.
- **Efectos de sonido** generados con Web Audio API (sin archivos de audio externos).
- **PWA instalable**: `manifest.json` + `sw.js` con estrategia *network-first* y caché offline; avisa al usuario cuando hay una versión nueva disponible.
- **Persistencia local**: todo el progreso se guarda en `localStorage`.

## 📁 Estructura del proyecto

```
minipet/
├── index.html              # Estructura principal de la app
├── manifest.json            # Metadatos PWA (ícono, colores, modo standalone)
├── sw.js                    # Service Worker (caché offline, versión de caché)
├── data/
│   └── dialogues.json       # Frases de la mascota por estado de ánimo
├── css/
│   └── styles.css           # Estilos, animaciones y fondos de escenarios
├── js/
│   ├── pet.js                # Estado del juego (PetState): stats, guardado, UI
│   ├── store.js               # Catálogo de accesorios/fondos, tienda y armario
│   ├── minigames.js           # Los 6 minijuegos
│   └── app.js                 # Sonidos (AudioEffects), init y registro del SW
└── img/
    └── accessories/          # Iconos SVG de los accesorios equipables
```

## ▶️ Cómo correrlo

Es una app estática: basta con servir la carpeta con cualquier servidor HTTP (necesario para que `fetch('data/dialogues.json')` y el Service Worker funcionen; no se puede abrir `index.html` directo con `file://`).

```bash
npx serve .
# o
python3 -m http.server
```

Luego abrir la URL en el navegador. En móvil, se puede "Agregar a pantalla de inicio" para instalarla como PWA.

## 🔧 Notas técnicas

- Al agregar un accesorio nuevo hay que sumarlo en tres lugares: el `.svg` en `img/accessories/`, la entrada en `Store.items` (`js/store.js`) y la ruta en `ASSETS_TO_CACHE` (`sw.js`) para que quede disponible offline.
- Al agregar un fondo/escenario nuevo: la entrada en `Store.items` (categoría `bg`) y el estilo `.room.bg_<id>` en `css/styles.css`.
- Cada vez que se publica una versión nueva, conviene subir `CACHE_VERSION` en `sw.js` para forzar la actualización en los dispositivos de los usuarios.
