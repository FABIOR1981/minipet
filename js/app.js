import './ambiente.js';
import './catalogo.js';
import './dibujos.js';
import './iconos.js';
import './juegos/atrapa-dulces.js';
import './juegos/burbujas-magicas.js';
import './juegos/donde-esta.js';
import './juegos/explota-globos.js';
import './juegos/juegos-base.js';
import './juegos/lluvia-comida.js';
import './juegos/mascota-mini.js';
import './juegos/parejas.js';
import './juegos/runner-magico.js';
import './juegos/simon-memoria.js';
import './juegos/torre-postres.js';
import './juegos/vestir-igual.js';
import './mascota-visual.js';
import './particulas.js';
import './sonidos.js';
import { Store } from './tienda.js';
import { Avisos } from './avisos.js';
import { PetState } from './mascota-estado.js';
import { closeModal, switchTab } from './navegacion.js';
import { Vestidor } from './vestidor.js';
import { Catalogo } from './catalogo.js';
import { Minigames } from './juegos/juegos-base.js';
// Inicialización del Juego y Registro del Service Worker PWA
document.addEventListener('DOMContentLoaded', () => {
  PetState.init();
  mostrarBienvenida();
  registerServiceWorker();
});

// Bienvenida: se muestra una sola vez por dispositivo, en la primera visita
function mostrarBienvenida() {
  const CLAVE = 'mipetkawaii-bienvenida-v1';
  try {
    if (localStorage.getItem(CLAVE)) return;
    localStorage.setItem(CLAVE, '1');
  } catch (e) {
    return; // sin localStorage no hay forma de recordar: mejor no molestar
  }
  setTimeout(mostrarTarjetaBienvenida, 600);
}

// Tarjeta de bienvenida: los dos personajes listos flotan y se elige desde ahí
function mostrarTarjetaBienvenida() {
  const fondo = document.createElement('div');
  fondo.className = 'aviso-fondo bienvenida-fondo';
  fondo.innerHTML = `
    <section class="bienvenida-card" role="dialog" aria-modal="true" aria-labelledby="bienvenida-titulo">
      <div class="bienvenida-mascotas"></div>
      <h2 id="bienvenida-titulo" class="bienvenida-titulo">¡Hola! Te damos la bienvenida</h2>
      <p class="bienvenida-texto">Mochi y Nube ya están listos y pronto llegan los demás. Después podés ponerle nombre en Mi Pet.</p>
      <button class="card-btn bienvenida-boton">Elegir mi personaje</button>
    </section>`;

  const contenedor = fondo.querySelector('.bienvenida-mascotas');
  ['mochi', 'nube'].forEach(id => {
    const especie = Catalogo.species.find(e => e.id === id);
    if (!especie) return;
    const mini = Minigames.createMiniPet(96, { color: especie.color || '#ff80ab', accessory: null });
    const sprite = mini.el.querySelector('.pet-sprite');
    if (sprite) {
      sprite.className = sprite.className.replace(/\bspecies-\S+/g, '').trim();
      sprite.classList.add(`species-${id}`);
    }
    mini.el.classList.add('bienvenida-mini');
    contenedor.appendChild(mini.el);
  });

  fondo.querySelector('.bienvenida-boton').onclick = () => {
    fondo.remove();
    // Primera vez: se abre directo la pestaña para elegir personaje
    Store.myPetTab = 'personaje';
    switchTab('my-pet');
  };
  document.body.appendChild(fondo);
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then((reg) => {
      // Escucha si hay una versión nueva esperando activarse
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Notificar al usuario que hay una actualización lista
            Avisos.confirmar('¿Quieres actualizarla ahora?', {
              titulo: 'Hay una versión nueva', icono: 'repetir', tinte: 'escenario', aceptar: 'Actualizar'
            }).then(ok => { if (ok) window.location.reload(); });
          }
        });
      });
    }).catch((err) => console.log('Error al registrar PWA:', err));
  }
}

// Las tarjetas tocables (role="button") también responden a Enter y Espacio
document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('.item-card.tocable')) {
    e.preventDefault();
    e.target.click();
  }
});

// Acciones de la botonera y de los botones fijos del HTML. En lugar de un
// onclick en cada botón, un único listener en el documento lee data-action.
const ACCIONES = {
  'pet': () => PetState.petPet(),
  'comer': () => PetState.feed(),
  'medicina': () => PetState.heal(),
  'dormir': () => PetState.sleep(),
  'juegos': () => switchTab('minigames'),
  'mi-pet': () => switchTab('my-pet'),
  'armario': () => Vestidor.open(),
  'armario-desde-hub': () => { closeModal(); Vestidor.open(); },
  'personalizar': () => switchTab('my-pet'),
  'escenario': () => switchTab('scenery'),
  'tienda': () => switchTab('store'),
  'vestidor-cerrar': () => Vestidor.close(),
  'vestidor-guardar-look': () => Vestidor.saveLook(),
  'cerrar-modal': () => closeModal(),
};

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const accion = ACCIONES[el.dataset.action];
  if (accion) accion();
});
