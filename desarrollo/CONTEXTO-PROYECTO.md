# Contexto del proyecto Minipet

## Resumen

`minipet` es una mascota virtual hecha con Vanilla JavaScript, HTML y CSS. No usa React, TypeScript ni dependencias. Es una PWA sencilla que se ejecuta como sitio estático y se publica en Netlify; el único paso de build es `herramientas/construir.js`, que copia a `publicar/` los archivos que usa el navegador.

La mascota puede:

- Comer, dormir y recibir medicina.
- Cambiar felicidad, hambre y energía.
- Cambiar color de piel.
- Cambiar forma.
- Cambiar tamaño.
- Equipar accesorios.
- Cambiar escenario/fondo.
- Guardar looks.
- Jugar minijuegos.
- Mostrar frases desde un archivo JSON.
- Guardar el progreso en `localStorage`.

## Archivos principales

- `index.html`: estructura principal, mascota, sombra, navegación inferior y modal.
- `css/base.css`: layout general, barra superior, navegación, modal y tarjetas de la tienda.
- `css/escenarios.css`: los 17 escenarios (`.room.bg_*`), su primer plano (`.room::after`) y las animaciones de partículas.
- `css/mascota.css`: mascota, formas, tamaños, brillantina, accesorios, sombra y animaciones.
- `css/juegos.css`: HUD, conteo regresivo y pantalla de resultado de los minijuegos.
- `js/app.js`: sonidos (`AudioEffects`), inicio, registro del Service Worker y navegación entre modales (`switchTab`, `closeModal`).
- `js/mascota-estado.js`: objeto `PetState` con stats, acciones (comer, dormir, medicina), inventario, looks, persistencia y `tick()`.
- `js/mascota-visual.js`: agrega a `PetState` el dibujo (`updateUI`), la cara, los diálogos, el paseo y la profundidad.
- `js/catalogo.js`: objeto `Catalogo`, solo datos: `items` (accesorios y escenarios), `shapes` y `accessoryFits`.
- `js/tienda.js`: objeto `Store`, que dibuja la Tienda, Escenario y Mi Pet.
- `js/vestidor.js`: objeto `Vestidor`, el armario donde la mascota se prueba accesorios.
- `js/particulas.js`: objeto `Particles`, partículas ambientales por escenario.
- `js/ambiente.js`: objeto `Ambiente`, detalles animados de cada escenario (luces, nubes, humo, fuego).
- `js/juegos/juegos-base.js`: objeto `Minigames` con menú, conteo, resultado, récords, HUD y reloj de frames.
- `js/juegos/mascota-mini.js`: copia en miniatura de la mascota para usar dentro de los juegos.
- `js/juegos/*.js`: un archivo por minijuego; cada uno agrega su método a `Minigames`.
- `img/accessories/`: SVG de los accesorios.
- `img/escenarios/`: ilustración SVG de cada escenario; `img/escenarios/frente/` tiene los objetos que van por delante de la mascota e `img/escenarios/fx/` los sprites del ambiente animado.
- `data/dialogues.json`: frases de la mascota y mensajes hablados.
- `sw.js`: Service Worker y caché PWA.
- `manifest.json`: configuración PWA.
- `netlify.toml` y `herramientas/construir.js`: build y publicación.

Orden de carga de los scripts en `index.html`: `mascota-estado.js`, `mascota-visual.js`, `particulas.js`, `ambiente.js`, `catalogo.js`, `tienda.js`, `juegos/juegos-base.js`, `juegos/mascota-mini.js`, los diez minijuegos y por último `app.js`. `mascota-visual.js` y los minijuegos usan `Object.assign` sobre objetos ya definidos, así que el orden importa.

## Navegación actual

La barra inferior tiene dos filas de cuatro columnas:

Primera fila:

- Comer
- Medicina
- Dormir
- Juegos

Segunda fila:

- Mi Pet
- Armario
- Escenario
- Tienda

La personalización se divide por lo que significa cada cosa:

- `Mi Pet` es "así soy yo": la identidad de la mascota (color, forma, tamaño, brillantina y rasgos). Todo es gratis y ninguna opción vale más que otra.
- `Armario` es "qué me pongo hoy": el vestidor, con accesorios y looks guardados.
- `Escenario` es dónde está.

Esta separación es deliberada y hay que mantenerla: los rasgos de la cara no van en el vestidor ni se venden en la tienda, para que cambiar de aspecto sea jugar a disfrazarse y no "arreglarse". (Una versión anterior de este documento prohibía un botón `Armario`; se refería a la vieja ventana que mezclaba accesorios y escenarios, que ya no existe.)

## Modal Mi Pet

`Mi Pet` abre `Store.renderMyPet()` desde `switchTab('my-pet')`.

Contiene únicamente:

- Color de piel.
- Tamaño.
- Forma.
- Control de `Brillantina`.

El control de brillantina es una barra de 0 a 100:

- `0`: desactivada.
- `1` a `99`: intensidad progresiva.
- `100`: máxima intensidad.

La intensidad se guarda como `PetState.glitterIntensity` en `localStorage`. El valor predeterminado es `0`.

La forma de la mascota se guarda en `PetState.petShape` y el tamaño en `PetState.petSize`.

Tamaños activos:

- `small`
- `medium`
- `large`

Formas activas en el selector:

- `shape-circle`
- `shape-mochi`
- `shape-onigiri`
- `shape-squircle`
- `shape-dumpling`

Hay otras formas CSS comentadas o preparadas, pero no todas están activas en el selector.

## Accesorios y escenarios

### Armario (vestidor)

El botón `Armario` no abre una ventana: lleva a la mascota al vestidor (`js/vestidor.js`, objeto `Vestidor`; estilos en `css/vestidor.css`).

- `Vestidor.open()` pone `PetState.inVestidor = true`. Con esa bandera, `updateUI()` muestra la ilustración `bg_vestidor` en lugar del escenario equipado y la mascota deja de pasear.
- La botonera se oculta (clase `en-vestidor` en `#app-container`) y en su lugar aparece `#vestidor-panel`, con una tira deslizable de los accesorios comprados (`category: 'acc'`), la opción "Sin nada", un acceso a la tienda y los looks guardados.
- Como no hay ventana encima, cada accesorio se ve puesto al instante. La mascota festeja con un saltito y una frase.
- El espejo refleja a la mascota: `Ambiente.CONFIG.bg_vestidor` declara un elemento `mirror` y `Vestidor.refreshMirror()` le pone una copia dada vuelta (`createMiniPet`). `updateUI()` lo llama cada vez que cambia el aspecto.
- `Vestidor.close()` (botón "Listo") vuelve a la habitación. Abrir cualquier ventana con `switchTab()` también lo cierra. Si la mascota duerme, no entra.
- `bg_vestidor` no es un artículo del catálogo: no se compra ni se equipa.

Las frases están en `data/dialogues.json`, clave `dressup` (`welcome`, `wear`, `none`, `saved` e `items`, con una frase propia por accesorio). Criterio: festejan el juego ("¡Hoy voy de pirata!") y nunca comparan ni opinan sobre el aspecto ("ahora sí estoy linda"). Sin nada puesto también está contenta.

### Escenario

`Store.renderScenery()` muestra solo artículos con:

```js
category: 'bg'
```

Los escenarios comprados se equipan mediante `PetState.equipItem()` y actualizan la clase del elemento `#pet-room`.

### Tienda

La Tienda tiene pestañas:

- Todos
- Accesorios
- Escenarios

`Store.storeCategory` conserva la pestaña activa después de comprar.

## Mascota y movimiento

La mascota principal es:

```html
<div id="pet-shadow" class="pet-shadow"></div>
<div id="pet" class="pet-sprite">
```

La cara, el accesorio y la capa de brillantina están dentro de `#pet`. La sombra es un elemento hermano, no hijo, para que no la recorten las formas ni salte con la mascota.

El movimiento autónomo se implementa en `PetState.startWandering()`, `moveRandomly()` y `applyWalkPosition()` (`js/mascota-visual.js`):

- Hay un primer movimiento al iniciar.
- Luego intenta moverse cada 5 segundos.
- No se mueve cuando `isSleeping` es `true`.
- No se mueve cuando `isSick` es `true`.
- Esta condición debe conservarse.

Zona caminable: todo el ancho de la habitación y todo el piso del escenario, desde el horizonte hasta el borde inferior. La posición se guarda en `PetState.walkPos` como proporciones (`x` de 0 a 1, `t` de 0 = fondo a 1 = adelante), y `applyWalkPosition()` las convierte a píxeles según el tamaño real de la habitación. `PetState.SCENE` tiene las medidas de las ilustraciones (400x480, piso de 200) para saber dónde está el horizonte.

Profundidad: al ir al fondo la mascota se achica hasta `PetState.FAR_DEPTH` (0.72). Ese factor va en la propiedad CSS `scale` del elemento, separada de `transform`, que sigue usando `--pet-scale` para el tamaño elegido. No mezclar las dos: las animaciones `walking` y `happy-jump` escriben `transform` y deben conservar `--pet-scale`.

La duración del traslado sale de la variable `--walk-time` de `#pet-room`: 2.5 s durante un paseo y 0.2 s cuando solo se reacomoda (cambio de tamaño, forma o pantalla).

Capas dentro de `#pet-room`, de atrás hacia adelante: fondo del escenario, ambiente animado `#scene-fx` (`z-index: 1`), partículas (2), sombra (3), mascota (4), primer plano del escenario (5, no recibe toques) y la capa de noche `#night-overlay` (6).

### Vida en reposo y reacciones

- En reposo, `#pet` respira (animación `breathe`) y los ojos parpadean (`blink`). La respiración se aplica solo a `#pet`, no a `.pet-sprite`, para no afectar las miniaturas de `Mi Pet`.
- Al caminar, `moveRandomly()` agrega `look-left` o `look-right` a `#pet`, que corre la cara y los lentes unos píxeles hacia ese lado.
- `PetState.floatText(texto)` muestra un cartelito que sube desde la mascota; `burst(emojis)` lanza una ráfaga de emojis; `showEating()` anima el bocado y la masticación. Los usan `feed()`, `heal()` y `petPet()`.
- Al dormir, `updateUI()` pone la clase `sleeping` en `#pet-room`, que enciende `#night-overlay`.
- Cuando una stat sube, su casillero de la barra superior hace un pulso (`.stat-box.bump`).
- Todo respeta `prefers-reduced-motion`.

## Accesorios: sistema de ajuste

Los accesorios se renderizan dentro de `#pet-accessory`.

Cada accesorio recibe una clase de posición:

- `pos-head`
- `pos-eyes`
- `pos-ears`
- `pos-neck`
- `pos-forehead`
- `pos-wrap`
- `pos-hand`
- `pos-back`
- `pos-full`

Cada forma de mascota declara en `css/mascota.css` sus medidas (`--body-w`, `--body-h`, `--eye-y`, `--band-w`, `--wrap-w`, `--full-scale`). Las posiciones nuevas y el moño se calculan a partir de esas medidas, así un mismo accesorio calza en las cinco formas sin ajustes por separado. Si se agrega una forma, hay que darle esos valores.

El tamaño (chico, mediano, grande) escala la mascota entera con el accesorio incluido, así que no cambia el calce.

También recibe una clase individual como `item-hat_crown`.

`Catalogo.accessoryFits` permite ajustar cada accesorio con:

- `scale`
- `x`
- `y`
- `rotate`

Estos valores se aplican mediante variables CSS sobre la imagen del accesorio.

Las formas anchas como Mochi y Dumpling tienen ajustes CSS adicionales. Cualquier nuevo accesorio debe probarse con varias formas y tamaños.

## Brillantina slime

La capa visual es:

```html
<div id="pet-glitter" class="pet-glitter"></div>
```

La brillantina está apagada cuando la intensidad es `0`. La clase `.enabled` se aplica solo si `PetState.glitterIntensity > 0`.

El efecto usa:

- Puntos radiales.
- Reflejo diagonal.
- Animación de desplazamiento.
- Variable `--glitter-opacity`.

No debe convertirse en un efecto obligatorio: el usuario controla la intensidad desde `Mi Pet`.

## Diálogos

Las frases principales se cargan desde:

`data/dialogues.json`

Categorías actuales:

- `happy`
- `hungry`
- `sick`
- `tired`
- `bored`
- `sleeping`
- `alerts`

Los mensajes de comida y medicina se muestran en el globo `#pet-thought`, no mediante `alert()` del navegador.

Mensajes actuales:

- `¡Gracias! Ya tengo la pancita llena.`
- `¡Me siento de maravilla!`
- `¡Estoy con toda la energía!` (al tocar Dormir con la energía en 100)

Criterio de redacción: todas las frases van en clave positiva. La mascota no se queja ni dice lo que le falta o le duele; propone lo que quiere hacer ("¡Es hora de comer algo rico!" en vez de "Tengo hambre"). Lo mismo vale para los títulos de resultado de los minijuegos y los avisos de la tienda. Evitar adjetivos con género para la mascota.

Si el JSON no carga, `js/mascota-estado.js` tiene frases de respaldo para que el juego siga funcionando.

## Persistencia

La clave principal de `localStorage` es:

```text
virtualPetData
```

Incluye monedas, estadísticas, color, forma, tamaño, brillantina, enfermedad, inventario, accesorio equipado, escenario equipado y looks.

No eliminar campos existentes al modificar `saveData()` o `loadData()`. Si el guardado está dañado o no se puede leer, `loadData()` arranca con los valores iniciales (500 monedas).

Los mejores puntajes de los minijuegos se guardan aparte, en la clave `minipetBestScores`.

### Modo prueba

Con `?prueba` en la URL, `PetState.testMode` queda en `true`: la partida se guarda en `virtualPetDataPrueba`, los récords en `minipetBestScoresPrueba`, y al cargar se garantizan `PetState.TEST_COINS` (99.999) monedas. `?prueba=reiniciar` borra esas dos claves antes de cargar. La partida real no se lee ni se escribe en este modo. Todo acceso a `localStorage` debe pasar por `PetState.STORAGE_KEY` y `Minigames.BEST_SCORES_KEY` para respetar la separación.

## Service Worker

`sw.js` usa Network First y una caché versionada.

La versión vigente es el valor de `CACHE_VERSION` al inicio de `sw.js`; no se repite acá para que no quede desactualizada.

Si se modifican archivos de la aplicación, subir `CACHE_VERSION` para forzar la actualización en dispositivos que tengan la PWA instalada.

Todo archivo nuevo que deba funcionar sin conexión (JS, CSS, SVG) se agrega a `ASSETS_TO_CACHE`. Los archivos de desarrollo no deben entrar en la caché de producción.

## Carpeta de desarrollo

Los archivos de pruebas y demos están en:

`desarrollo/`

Actualmente contiene:

- `prueba-accesorios-visual.html`: página para revisar cómo calza cada accesorio.
- `escenarios-demo_3.html`: demo histórica de escenarios (ver más abajo).
- Este documento de contexto.

La carpeta no se publica: el build (`herramientas/construir.js`) copia a `publicar/` solo `index.html`, `manifest.json`, `sw.js`, `css/`, `js/`, `data/` e `img/`.

Si se mueven archivos dentro de esta carpeta, revisar las rutas relativas de imágenes. Desde un HTML dentro de `desarrollo/`, las imágenes del proyecto se referencian normalmente como:

```text
../img/accessories/nombre.svg
```

## Demo de escenarios

`desarrollo/escenarios-demo_3.html` es una demo visual independiente que se usó para explorar la dirección de los escenarios. Muestra, por cada uno, el fondo anterior y dos alternativas en CSS.

Quedó como referencia histórica: los escenarios reales de la aplicación son las ilustraciones SVG de `img/escenarios/` y no salen de esta demo.

## Cómo agregar un minijuego

Cada minijuego vive en su propio archivo dentro de `js/juegos/` y agrega su método al objeto `Minigames` (definido en `js/juegos/juegos-base.js`). Para agregar uno nuevo:

1. Crear `js/juegos/nuevo-juego.js` con:

```js
Object.assign(Minigames, {
	startNewGame() {
		this.showCountdown(() => {
			// armar el HTML del juego y arrancar
		});
	}
});
```

2. Añadir una tarjeta dentro de `renderMenu()` (`juegos-base.js`) con un icono, nombre y la llamada al método nuevo:

```html
<div class="item-card" onclick="Minigames.startNewGame()" style="cursor:pointer;">
	<span style="font-size:2rem;">🎯</span>
	<span class="card-title">Nuevo juego</span>
	<button class="card-btn">Jugar</button>
</div>
```

3. Cargar el archivo en `index.html`, después de `juegos-base.js` y antes de `app.js`.
4. Agregarlo a `ASSETS_TO_CACHE` en `sw.js`.
5. Usar `showCountdown()` para la cuenta regresiva: ya evita que un doble toque arranque dos partidas.
6. Marcar `inProgress = true` cuando comience.
7. Registrar `exitHandler` para limpiar timers y listeners y devolver las monedas ganadas si el usuario cierra el modal. El bucle del juego debe cortar sin llamar a `showResult()` cuando la salida fue forzada (ver la variable `stopped` en `atrapa-dulces.js`), o las monedas se cobran dos veces.
8. Si el juego se dibuja en un canvas con `requestAnimationFrame`, multiplicar los movimientos por el factor de `Minigames.createFrameClock()` para que vaya a la misma velocidad en pantallas de 60 y 120 Hz.
9. Usar `renderHUD()` para mostrar puntuación, récord y tiempo, y `getCanvasScale()` para convertir toques a coordenadas del canvas.
10. Guardar récords con `getBestScore()` y `saveBestScore()` usando un identificador único.
11. Terminar con `showResult()` para entregar monedas y ofrecer volver a jugar o volver al menú.
12. Integrar a la mascota (`js/juegos/mascota-mini.js`), de una de dos formas:
    - **Espectadora:** armar el encabezado con `renderHeader(título, renderHUD(...))`, llamar a `mountSpectator()` después de escribir el HTML, y hacerla reaccionar con `spectate('cheer')` al acertar, `spectate('oops')` al fallar o `spectate('nod')` para marcar el ritmo.
    - **Protagonista:** envolver el canvas en `<div class="game-stage">`, crear `const pet = Minigames.createActor(canvas, tamaño)` y ubicarla en cada frame con `pet.place(x, y)`, donde `(x, y)` son los pies en unidades del canvas. Llamar a `pet.destroy()` al terminar y en `exitHandler`.

La mascota en miniatura es una copia de `#pet` hecha con `createMiniPet(tamaño, look)`: toma color, forma, cara, brillantina y accesorio en el momento de crearla, sin ids, y siempre con cara contenta. El segundo parámetro es opcional y le da otro aspecto (`{ color, shape, accessory }`); lo usa Vestirla Igual para mostrar looks que no son el de la mascota real.

Juegos actuales y cuánto pagan:

| Juego | Archivo | Tipo | Monedas |
|---|---|---|---|
| Atrapa Dulces | `atrapa-dulces.js` | canvas, protagonista | 5 por dulce |
| Explotar Globos | `explota-globos.js` | canvas, 20 s | 5 por globo |
| Torre de Postres | `torre-postres.js` | canvas | 10 por capa |
| Simón Memoria | `simon-memoria.js` | botones | 10 por ronda |
| Runner Mágico | `runner-magico.js` | canvas, protagonista | 10 por obstáculo |
| Burbujas Mágicas | `burbujas-magicas.js` | canvas, 15 s | 5 o 15 por burbuja |
| Parejas | `parejas.js` | cartas, sin tiempo | 60 sin errores, 3 menos por intento extra, mínimo 20 |
| ¿Dónde Está? | `donde-esta.js` | tres cajas | 10 por ronda |
| Vestirla Igual | `vestir-igual.js` | botones | 10 por look |
| Lluvia de Comida | `lluvia-comida.js` | canvas, protagonista, 3 vidas | 5 por comida |

Los juegos que no usan canvas (Parejas, ¿Dónde Está?, Vestirla Igual) guardan sus `setTimeout` en una lista y los cancelan en `exitHandler`, para que no sigan corriendo sobre una pantalla que ya no existe. El conteo regresivo y la pantalla de resultado ya la muestran solos.

Los estilos propios del juego, si los necesita, van en `css/juegos.css`.

## Cómo agregar un escenario

Los escenarios se registran como objetos en `Catalogo.items`, dentro de `js/catalogo.js`:

```js
{
	id: 'bg_new_scene',
	name: 'Nuevo Escenario',
	price: 80,
	image: '🌿',
	type: 'bg',
	category: 'bg',
	preview: 'background: #cfe url(img/escenarios/nuevo.svg) center 42% / cover;'
}
```

Pasos:

1. Dibujar la ilustración en `img/escenarios/nuevo.svg`, de 400x480, con el piso ocupando los 200 px de abajo (el horizonte en `y=280`). Esa altura es la que usa la mascota para caminar; si cambia, hay que cambiar `PetState.SCENE`.
2. Dejar libre la franja superior central: ahí se superpone el globo de diálogo, y en pantallas bajas se recorta parte de arriba.
3. Añadir en `css/escenarios.css` la regla `.room.bg_new_scene` con el color de respaldo y la imagen.
4. Si lleva objetos por delante de la mascota, dibujarlos en un segundo SVG transparente del mismo tamaño en `img/escenarios/frente/nuevo.svg` y añadir la regla `.room.bg_new_scene::after`. Esos objetos deben apoyarse en el borde inferior, para quedar siempre más cerca que la mascota, y conviene que ocupen solo las esquinas.
5. Si necesita partículas, agregar su entrada en `Particles.CONFIG` (`js/particulas.js`). Pocas, chicas y sin repetir lo que ya está dibujado.
   Para detalles animados (una luz que late, humo, una nube), agregar su entrada en `Ambiente.CONFIG` (`js/ambiente.js`) con las coordenadas del dibujo; los tipos disponibles están listados al inicio de ese archivo.
6. Verificar que `renderScenery()` lo muestre automáticamente: filtra los artículos con `category: 'bg'`.
7. Añadir los SVG a `ASSETS_TO_CACHE` en `sw.js`.
8. Incrementar `CACHE_VERSION`.

La clase del escenario debe coincidir con el valor usado por `PetState.equippedBackground`, porque `updateUI()` aplica esa clase al elemento `#pet-room`.

## Cómo agregar un accesorio

Los accesorios se registran en `Catalogo.items` dentro de `js/catalogo.js`:

```js
{
	id: 'new_accessory',
	name: 'Nuevo Accesorio',
	price: 40,
	image: 'img/accessories/new_accessory.svg',
	type: 'head',
	category: 'acc'
}
```

El campo `type` debe ser uno de los anclajes existentes:

- `head`: sombreros, coronas, flores y accesorios superiores.
- `eyes`: gafas y visores.
- `ears`: orejas y auriculares.
- `neck`: moños, debajo de la boca.
- `forehead`: vinchas y bandas, entre la coronilla y los ojos; se ajustan al ancho de la cabeza.
- `wrap`: bufandas, alrededor de la parte baja del cuerpo.
- `hand`: varitas y objetos que sostiene, al costado derecho.
- `back`: alas; se dibujan detrás del cuerpo. Un hijo no puede pintarse detrás del fondo de su padre, así que cuando hay un accesorio `back` el JS agrega la clase `with-back` a la mascota, que la convierte en contexto 3D (`transform-style: preserve-3d`), y el accesorio se aleja con `translateZ(-1px)`. El SVG se dibuja completo, con las alas unidas en el centro. No poner `overflow`, `filter`, `opacity` ni `clip-path` en `.pet-sprite.with-back`: anulan el contexto 3D y las alas pasarían adelante.
- `full`: cascos y burbujas que envuelven toda la mascota; conviene que sean translúcidos para que se vea la cara.

Los SVG de `back`, `full` y los auriculares llevan `preserveAspectRatio="none"` porque se estiran al tamaño de cada forma.

Pasos:

1. Crear el SVG o imagen dentro de `img/accessories/`.
2. Añadir el artículo a `Catalogo.items` con `category: 'acc'`.
3. Añadirlo a `Catalogo.accessoryFits` en `js/catalogo.js` para definir `scale`, `x`, `y` y, si hace falta, `rotate`.
4. Probarlo en las cinco formas. En Dumpling, lo que va en la cabeza (`head`, `ears`, `full`) oculta los pliegues de arriba.
5. Probarlo en Chico, Mediano y Grande.
6. Si una forma necesita una excepción, añadir una regla específica en `css/mascota.css` sin romper el ajuste individual.
7. Añadir el recurso a `ASSETS_TO_CACHE` en `sw.js` si debe funcionar offline.

Ejemplo de ajuste:

```js
new_accessory: {
	scale: 1.15,
	x: 0,
	y: -3,
	rotate: 0
}
```

El accesorio aparece automáticamente en la tira del vestidor cuando pertenece al inventario y se equipa mediante `PetState.equipItem()`. Conviene sumarle su frase en `dressup.items` de `data/dialogues.json`.

## Reglas de trabajo para otra IA

1. Leer este documento antes de explorar todos los archivos.
2. No modificar la aplicación principal si la petición es solo sobre la demo.
3. No eliminar cambios existentes sin confirmar.
4. Mantener las API públicas actuales de `PetState`, `Store`, `Catalogo` y `Minigames`.
5. Preferir patrones ya existentes en el proyecto.
6. Validar los archivos de `js/` y `css/` que se tocaron e `index.html` después de editar.
7. Si se cambia la aplicación principal, probar persistencia, navegación, movimiento y selección visual.
8. Si se cambia `sw.js`, incrementar `CACHE_VERSION`.
9. Mantener la condición de que la mascota no se mueva dormida o enferma.
10. Mantener la carpeta `desarrollo/` fuera del deploy de Netlify: no agregarla a la lista de `herramientas/construir.js`.

## Validación manual recomendada

- Abrir `Mi Pet` y cambiar color, forma y tamaño.
- Confirmar que los cambios persisten al recargar.
- Probar brillantina en `0`, `50` y `100`.
- Abrir Armario y probar al menos uno de cada posición (cabeza, ojos, orejas, cuello, frente, bufanda, mano, espalda y envolvente) en más de una forma.
- Probar accesorios con Círculo, Mochi y Dumpling.
- Abrir Escenario y cambiar fondos; revisar ilustración, primer plano y partículas.
- Salir de un minijuego a mitad de partida y confirmar que las monedas se cobran una sola vez.
- Confirmar que la mascota camina por todo el piso, se achica al ir al fondo y pasa por detrás de los objetos del primer plano.
- Confirmar que no se mueve dormida ni enferma.
- Abrir Tienda y cambiar entre Todos, Accesorios y Escenarios.
- Comprobar que los botones no ocultan contenido en móvil.
