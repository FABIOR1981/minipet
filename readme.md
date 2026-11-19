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
- **Mi Pet**: la identidad de la mascota, con vista previa. Nombre (aparece sobre el globo de diálogo y en algunas frases), pestaña Cuerpo (diez colores de piel, tamaño, forma y brillantina) y pestaña Rasgos (cinco estilos de ojos, de boca y de mejillas). Todo es gratis.
- **Armario**: un vestidor con ropero y espejo adonde la mascota va a probarse sus accesorios (21 en total: sombreros, orejas, lentes, alas, etc.). Se ven puestos al instante, en ella y en su reflejo, y se pueden guardar hasta 6 looks.
- **Escenarios**: 17 escenarios ilustrados (sala, playa, espacio, castillo, volcán, dojo, disco, etc.), cada uno comprable con monedas, con partículas ambientales y detalles animados propios (fuego, nubes, luces, luciérnagas).
- **10 minijuegos** para ganar monedas, con soporte táctil y mejor puntaje guardado por juego:
  - De reflejos: Atrapa Dulces, Explotar Globos, Burbujas Mágicas, Runner Mágico, Torre de Postres y Lluvia de Comida (atrapar la comida y esquivar lo que no se come).
  - De memoria y atención: Simón Memoria, Parejas (memotest con los accesorios), ¿Dónde Está? (seguir a la mascota entre tres cajas que se mezclan) y Vestirla Igual (memorizar un look y armarlo).
  - Tu mascota participa en todos: es la protagonista en Runner, Atrapa Dulces, Lluvia de Comida y ¿Dónde Está?, mira y reacciona en los demás, hace la cuenta regresiva y festeja el resultado.
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
│   ├── juegos.css             # Minijuegos: HUD, conteo, resultado y juegos sin canvas
│   └── vestidor.css           # Panel del vestidor y reflejo en el espejo
├── js/
│   ├── app.js                 # Entrada de la app (módulo principal), acciones (data-action) y registro del SW
│   ├── sonidos.js             # Sonidos sintetizados (AudioEffects)
│   ├── navegacion.js          # Cambio entre ventanas (switchTab, closeModal)
│   ├── mascota-estado.js      # PetState: stats, acciones, inventario, looks, guardado
│   ├── mascota-visual.js      # PetState: dibujo, cara, diálogos, paseo y profundidad
│   ├── particulas.js          # Partículas ambientales por escenario
│   ├── ambiente.js            # Detalles animados de cada escenario (luces, nubes, fuego)
│   ├── catalogo.js            # Datos: accesorios, escenarios, formas y ajustes
│   ├── tienda.js              # Store: tienda, Escenario y Mi Pet
│   ├── vestidor.js            # Vestidor: el armario donde se prueba accesorios
│   └── juegos/
│       ├── juegos-base.js     # Minigames: menú, conteo, resultado, récords, HUD
│       ├── mascota-mini.js    # La mascota dentro de los juegos (protagonista y espectadora)
│       ├── atrapa-dulces.js
│       ├── explota-globos.js
│       ├── torre-postres.js
│       ├── simon-memoria.js
│       ├── runner-magico.js
│       ├── burbujas-magicas.js
│       ├── parejas.js
│       ├── donde-esta.js
│       ├── vestir-igual.js
│       └── lluvia-comida.js
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

## 🧩 Módulos

La app usa módulos ES (`import`/`export`). `index.html` carga un único script, `js/app.js`, que importa el resto. Por eso hay que servirla por HTTP (ver abajo); abrir el archivo directo no funciona.

## 🧪 Pruebas

`npm test` corre las pruebas de la lógica de la mascota (guardado, migraciones y acciones) con `node:test`, sin dependencias. Requiere Node 18 o superior.

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

Netlify ejecuta `node herramientas/construir.js`, que copia a `publicar/` únicamente `index.html`, `manifest.json`, `sw.js`, `css/`, `js/`, `data/` e `img/`. Las carpetas `desarrollo/`, `documentacion/` y `herramientas/` no llegan al sitio publicado. Además completa `sw.js` con la versión de caché (hash del contenido) y la lista de archivos offline.

## 🔧 Notas técnicas

- Al agregar un accesorio nuevo hay que sumarlo en dos lugares: el `.svg` en `img/accessories/` y la entrada en `Catalogo.items` con su ajuste en `Catalogo.accessoryFits` (`js/catalogo.js`). Queda disponible offline sola: el build lista todos los archivos publicados.
- Al agregar un escenario nuevo hay que sumarlo en cuatro lugares: la ilustración `.svg` (400x480, piso desde y=280) en `img/escenarios/`, la regla `.room.bg_<id>` en `css/escenarios.css`, la entrada en `Catalogo.items` (`js/catalogo.js`, categoría `bg`, con su `preview`). Si lleva objetos por delante de la mascota, van en un segundo `.svg` transparente en `img/escenarios/frente/`, con su regla `.room.bg_<id>::after` y su ruta en el caché.
- Los detalles animados de un escenario se declaran en `Ambiente.CONFIG` (`js/ambiente.js`), usando las mismas coordenadas que la ilustración.
- Los objetos del primer plano deben apoyarse en el borde inferior de la ilustración, para quedar siempre más cerca que la mascota.
- La versión de caché del Service Worker la calcula `herramientas/construir.js` a partir del contenido publicado: cada cambio genera una versión nueva y no hace falta tocar `sw.js` a mano. `sw.js` tiene marcadores (`'__VERSION__'` y `/*__ASSETS__*/[]`) que el build completa.
- El guardado en `localStorage` tiene un número de versión (`VERSION_GUARDADO` en `js/mascota-estado.js`). Si cambia la estructura de los datos, se sube ese número y se agrega una migración en `MIGRACIONES`.

## 🎨 Dibujos en lugar de emojis

Cada marca de teléfono dibuja los emojis a su manera, así que el juego no los muestra tal cual: `js/dibujos.js` los cambia en pantalla por las imágenes de `img/dibujos/`, para que se vea igual en todos lados. El código sigue escribiendo emojis como siempre; si uno no está en la lista de `js/dibujos.js`, queda como emoji común.

- Para sumar un dibujo: copiar el `.svg` a `img/dibujos/` y agregarlo al `mapa` de `js/dibujos.js`. El build lo incluye en el caché offline solo.
- Los íconos de la interfaz (botonera, tienda, menú de minijuegos) son símbolos SVG en `index.html`, con el prefijo `i-`. Los botones se conectan con `data-action` (ver `ACCIONES` en `js/app.js`), no con `onclick`.
- Los juegos que pintan en canvas usan `Dibujos.dibujar(ctx, emoji, x, y)` en vez de `ctx.fillText()`.
- Las imágenes son Fluent Emoji de Microsoft, con licencia MIT (ver `img/dibujos/LICENCIA.txt`).
