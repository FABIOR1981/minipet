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
  setTimeout(() => {
    Avisos.aviso('Mochi y Nube ya están listos y pronto llegan los demás. Después podés ponerle nombre en Mi Pet.', {
      titulo: '¡Hola! Elegí tu personaje',
      icono: 'mipet',
      tinte: 'mipet',
      aceptar: 'Elegir'
    }).then(() => {
      // Primera vez: se abre directo la pestaña para elegir personaje
      Store.myPetTab = 'personaje';
      switchTab('my-pet');
    });
  }, 600);
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
