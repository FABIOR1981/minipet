// Función global para manejar el cambio de pestañas/modales
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

// Inicialización de la aplicación al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar estado de la mascota
  if (typeof PetState !== 'undefined') {
    PetState.init();
  }

  // Evento para cerrar modal con el botón de cerrar
  const closeBtn = document.getElementById('modal-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => switchTab('close'));
  }
});