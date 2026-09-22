// Manejador global de navegación y modales
function switchTab(tab) {
  const modal = document.getElementById('modal-overlay');
  if (!modal) return;

  if (tab === 'store') {
    modal.classList.remove('hidden');
    Store.renderStore();
  } else if (tab === 'wardrobe') {
    modal.classList.remove('hidden');
    Store.renderWardrobe();
  } else if (tab === 'minigames') {
    modal.classList.remove('hidden');
    Minigames.renderMenu();
  } else if (tab === 'close') {
    modal.classList.add('hidden');
  }
}

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
  if (typeof PetState !== 'undefined') {
    PetState.init();
  }
});