// Motor Sintetizador de Sonidos
const AudioEffects = {
  ctx: null,

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },

  playTone(freq, type, duration) {
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Ignorar
    }
  },

  playEat() {
    this.playTone(300, 'sine', 0.1);
    setTimeout(() => this.playTone(450, 'sine', 0.15), 100);
  },

  playCoin() {
    this.playTone(987.77, 'sine', 0.08);
    setTimeout(() => this.playTone(1318.51, 'sine', 0.2), 80);
  },

  playHeal() {
    this.playTone(523.25, 'triangle', 0.15);
    setTimeout(() => this.playTone(659.25, 'triangle', 0.15), 120);
    setTimeout(() => this.playTone(783.99, 'triangle', 0.2), 240);
  }
};

// Inicialización del Juego y Registro del Service Worker PWA
document.addEventListener('DOMContentLoaded', () => {
  PetState.init();
  registerServiceWorker();
});

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then((reg) => {
      // Escucha si hay una versión nueva esperando activarse
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Notificar al usuario que hay una actualización lista
            if (confirm('✨ ¡Hay una nueva versión del juego disponible! ¿Quieres actualizar ahora?')) {
              window.location.reload();
            }
          }
        });
      });
    }).catch((err) => console.log('Error al registrar PWA:', err));
  }
}

function switchTab(tab) {
  Minigames.forceExitIfActive();
  const modal = document.getElementById('modal-screen');
  modal.classList.remove('hidden');
  
  if (tab === 'store') {
    Store.renderStore();
  } else if (tab === 'accessories') {
    Store.renderAccessories();
  } else if (tab === 'scenery') {
    Store.renderScenery();
  } else if (tab === 'my-pet') {
    Store.renderMyPet();
  } else if (tab === 'minigames') {
    Minigames.renderMenu();
  }
}

function closeModal() {
  Minigames.forceExitIfActive();
  document.getElementById('modal-screen').classList.add('hidden');
}