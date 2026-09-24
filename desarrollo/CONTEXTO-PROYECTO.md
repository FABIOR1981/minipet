# Contexto del proyecto Minipet

## Resumen

`minipet` es una mascota virtual hecha con Vanilla JavaScript, HTML y CSS. No usa React, TypeScript ni un sistema de build. Es una PWA sencilla que puede ejecutarse como sitio estático y publicarse en Netlify.

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

- `index.html`: estructura principal, mascota, navegación inferior y modal.
- `css/styles.css`: layout, mascota, formas, animaciones, accesorios, modal y escenarios CSS.
- `js/app.js`: inicialización de sonidos, Service Worker y navegación entre modales.
- `js/pet.js`: estado principal `PetState`, necesidades, movimiento, persistencia y actualización visual.
- `js/store.js`: tienda, accesorios, escenarios, looks y modal `Mi Pet`.
- `js/minigames.js`: minijuegos y monedas.
- `js/particulas.js`: partículas de los escenarios.
- `data/dialogues.json`: frases de la mascota y mensajes hablados.
- `sw.js`: Service Worker y caché PWA.
- `manifest.json`: configuración PWA.

## Navegación actual

La barra inferior tiene dos filas de cuatro columnas:

Primera fila:

- Comer
- Medicina
- Dormir
- Juegos

Segunda fila:

- Mi Pet
- Accesorios
- Escenario
- Tienda

No debe volver a aparecer un botón llamado `Armario`. La personalización se dividió en `Mi Pet`, `Accesorios` y `Escenario`.

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

La antigua vista Armario fue eliminada.

### Accesorios

`Store.renderAccessories()` muestra solo artículos con:

```js
category: 'acc'
```

Incluye accesorios de cabeza, ojos, orejas y cuello/cuerpo. También conserva la gestión de Looks guardados.

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
<div id="pet" class="pet-sprite">
```

La cara, el accesorio y la capa de brillantina están dentro de ese elemento.

El movimiento autónomo se implementa en `PetState.startWandering()` y `moveRandomly()`:

- Hay un primer movimiento al iniciar.
- Luego intenta moverse cada 5 segundos.
- No se mueve cuando `isSleeping` es `true`.
- No se mueve cuando `isSick` es `true`.
- Esta condición debe conservarse.

Las animaciones `walking` y `happy-jump` deben conservar la variable `--pet-scale` para no romper el tamaño elegido.

## Accesorios: sistema de ajuste

Los accesorios se renderizan dentro de `#pet-accessory`.

Cada accesorio recibe una clase de posición:

- `pos-head`
- `pos-eyes`
- `pos-ears`
- `pos-neck`

También recibe una clase individual como `item-hat_crown`.

`Store.accessoryFits` permite ajustar cada accesorio con:

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

- `No preciso comer ahora.`
- `No preciso un doctor ahora.`

Si el JSON no carga, `pet.js` tiene frases de respaldo para que el juego siga funcionando.

## Persistencia

La clave principal de `localStorage` es:

```text
virtualPetData
```

Incluye monedas, estadísticas, color, forma, tamaño, brillantina, enfermedad, inventario, accesorio equipado, escenario equipado y looks.

No eliminar campos existentes al modificar `saveData()` o `loadData()`.

## Service Worker

`sw.js` usa Network First y una caché versionada.

La versión actual es `v2.0.3`.

Si se modifican archivos principales de la aplicación, subir la versión de `CACHE_VERSION` para forzar la actualización en dispositivos que tengan la PWA instalada.

Los archivos de desarrollo no deben entrar en la caché de producción.

## Carpeta de desarrollo

Los archivos de pruebas y demos están en:

`desarrollo/`

Actualmente contiene documentación y demos visuales, como:

- `prueba-accesorios.md`
- `prueba-accesorios.csv`
- `prueba-accesorios-visual.html`
- `escenarios-demo.html`
- Este documento de contexto.

La carpeta está excluida del deploy mediante `.netlifyignore`:

```text
desarrollo/
```

Si se mueven archivos dentro de esta carpeta, revisar las rutas relativas de imágenes. Desde un HTML dentro de `desarrollo/`, las imágenes del proyecto se referencian normalmente como:

```text
../img/accessories/nombre.svg
```

## Demo de escenarios

`desarrollo/escenarios-demo.html` es una demo visual independiente. No representa todavía los escenarios reales de la aplicación.

Cada tarjeta muestra:

- `Antes`: referencia simple del escenario actual.
- `Propuesta`: versión visual mejorada.

La demo contiene los 17 escenarios actuales y sirve para aprobar la dirección visual antes de modificar `styles.css` o añadir recursos reales.

El Dojo Ninja se usa como referencia de calidad visual y tiene:

- Piso de madera.
- Torii construido por capas.
- Monte Fuji con cima nevada.
- Sol rojo.
- Mascota separada de los elementos importantes.

## Cómo agregar un minijuego

Los minijuegos se gestionan desde `js/minigames.js`. Para agregar uno nuevo:

1. Añadir una tarjeta dentro de `renderMenu()` con un icono, nombre y llamada a un método nuevo:

```html
<div class="item-card" onclick="Minigames.startNewGame()" style="cursor:pointer;">
	<span style="font-size:2rem;">🎯</span>
	<span class="card-title">Nuevo juego</span>
	<button class="card-btn">Jugar</button>
</div>
```

2. Crear `startNewGame()` dentro del objeto `Minigames`.
3. Usar `showCountdown()` si el juego necesita cuenta regresiva.
4. Marcar `inProgress = true` cuando comience.
5. Registrar `exitHandler` para limpiar timers, listeners y devolver monedas si el usuario cierra el modal.
6. Usar `renderHUD()` para mostrar puntuación, récord y tiempo.
7. Guardar récords con `getBestScore()` y `saveBestScore()` usando un identificador único.
8. Terminar con `showResult()` para entregar monedas y ofrecer volver a jugar o volver al menú.

Normalmente no hace falta tocar `index.html`: el menú se genera desde `minigames.js`. Solo agregar CSS si el juego necesita estilos propios en `styles.css` y actualizar `sw.js` si se incorporan imágenes o sonidos.

## Cómo agregar un escenario

Los escenarios se registran como objetos en `Store.items`, dentro de `js/store.js`:

```js
{
	id: 'bg_new_scene',
	name: 'Nuevo Escenario',
	price: 80,
	image: '🌿',
	type: 'bg',
	category: 'bg',
	preview: 'background: ...;'
}
```

Pasos:

1. Crear una clase CSS con el mismo identificador, por ejemplo `.room.bg_new_scene`, en `css/styles.css`.
2. Definir fondo, suelo, capas y objetos del ambiente mediante pseudo-elementos o elementos auxiliares.
3. Mantener a la mascota como protagonista y no taparla con los objetos principales.
4. Si necesita partículas, agregar el caso correspondiente en `js/particulas.js`.
5. Verificar que `renderScenery()` lo muestre automáticamente: filtra los artículos con `category: 'bg'`.
6. Añadir la imagen o recurso a `ASSETS_TO_CACHE` en `sw.js` si el escenario usa archivos externos.
7. Incrementar `CACHE_VERSION` cuando se modifique la aplicación publicada.

La clase del escenario debe coincidir con el valor usado por `PetState.equippedBackground`, porque `updateUI()` aplica esa clase al elemento `#pet-room`.

## Cómo agregar un accesorio

Los accesorios se registran en `Store.items` dentro de `js/store.js`:

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
- `neck`: moños, bufandas, varitas y alas.

Pasos:

1. Crear el SVG o imagen dentro de `img/accessories/`.
2. Añadir el artículo a `Store.items` con `category: 'acc'`.
3. Añadirlo a `Store.accessoryFits` en `js/store.js` para definir `scale`, `x`, `y` y, si hace falta, `rotate`.
4. Probarlo con Círculo, Mochi y Dumpling.
5. Probarlo en Chico, Mediano y Grande.
6. Si una forma necesita una excepción, añadir una regla específica en `styles.css` sin romper el ajuste individual.
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

El accesorio se muestra automáticamente en `Accesorios` cuando pertenece al inventario y se equipa mediante `PetState.equipItem()`.

## Reglas de trabajo para otra IA

1. Leer este documento antes de explorar todos los archivos.
2. No modificar la aplicación principal si la petición es solo sobre la demo.
3. No eliminar cambios existentes sin confirmar.
4. Mantener las API públicas actuales de `PetState` y `Store`.
5. Preferir patrones ya existentes en el proyecto.
6. Validar `pet.js`, `store.js`, `app.js`, `styles.css` e `index.html` después de editar.
7. Si se cambia la aplicación principal, probar persistencia, navegación, movimiento y selección visual.
8. Si se cambia `sw.js`, incrementar `CACHE_VERSION`.
9. Mantener la condición de que la mascota no se mueva dormida o enferma.
10. Mantener la carpeta `desarrollo/` fuera del deploy de Netlify.

## Validación manual recomendada

- Abrir `Mi Pet` y cambiar color, forma y tamaño.
- Confirmar que los cambios persisten al recargar.
- Probar brillantina en `0`, `50` y `100`.
- Abrir Accesorios y probar cabeza, ojos, orejas y cuello.
- Probar accesorios con Círculo, Mochi y Dumpling.
- Abrir Escenario y cambiar fondos.
- Confirmar que la mascota se mueve cuando está activa.
- Confirmar que no se mueve dormida ni enferma.
- Abrir Tienda y cambiar entre Todos, Accesorios y Escenarios.
- Comprobar que los botones no ocultan contenido en móvil.
