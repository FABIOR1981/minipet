// =========================================================
// ICONOS DE LA INTERFAZ
// Los dibujos están como <symbol> en index.html. Acá van las
// ayudas para usarlos desde el HTML que arma cada pantalla.
// =========================================================

// Devuelve el <svg> de un icono. `clase` es opcional (por ejemplo "ico-moneda").
function ico(nombre, clase = '') {
  return `<svg class="ico${clase ? ' ' + clase : ''}" aria-hidden="true"><use href="#i-${nombre}"/></svg>`;
}

// Título de una pantalla (modal): el icono en su pastilla de color + el texto.
// `tinte` es el mismo color del botón del menú que abre esa pantalla.
function tituloPantalla(nombre, texto, tinte = nombre) {
  return `<h2 class="titulo-pantalla"><span class="titulo-ico tinte-${tinte}">${ico(nombre)}</span>${texto}</h2>`;
}
