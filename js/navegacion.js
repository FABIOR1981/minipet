import { Minigames } from './juegos/juegos-base.js';
import { Store } from './tienda.js';
import { Vestidor } from './vestidor.js';
// Cambio entre ventanas (modales) de la app
export function switchTab(tab) {
  Minigames.forceExitIfActive();
  // Abrir cualquier ventana saca a la mascota del vestidor
  if (typeof Vestidor !== 'undefined') Vestidor.close();
  const modal = document.getElementById('modal-screen');
  modal.classList.remove('hidden');
  
  if (tab === 'store') {
    Store.renderStore();
  } else if (tab === 'scenery') {
    Store.renderScenery();
  } else if (tab === 'my-pet') {
    Store.renderMyPet();
  } else if (tab === 'minigames') {
    Minigames.renderMenu();
  }
}

export function closeModal() {
  Minigames.forceExitIfActive();
  document.getElementById('modal-screen').classList.add('hidden');
}
