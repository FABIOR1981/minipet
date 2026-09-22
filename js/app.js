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
      // Ignorar si el audio aún no fue activado por interacción
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

document.addEventListener('DOMContentLoaded', () => {
  PetState.init();
});

function switchTab(tab) {
  const modal = document.getElementById('modal-screen');
  modal.classList.remove('hidden');
  
  if (tab === 'store') {
    Store.renderStore();
  } else if (tab === 'wardrobe') {
    Store.renderWardrobe();
  } else if (tab === 'minigames') {
    Minigames.renderMenu();
  }
}

function closeModal() {
  document.getElementById('modal-screen').classList.add('hidden');
}