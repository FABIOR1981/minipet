const AudioEffects = {
  ctx: null,

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  },

  playTone(freq, type = 'sine', duration = 0.1) {
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  },

  // Efecto al comer (dos tonos agudos)
  playEat() {
    this.playTone(400, 'triangle', 0.08);
    setTimeout(() => this.playTone(600, 'triangle', 0.12), 90);
  },

  // Efecto al curar (escala ascendente)
  playHeal() {
    this.playTone(523, 'sine', 0.08);
    setTimeout(() => this.playTone(659, 'sine', 0.08), 80);
    setTimeout(() => this.playTone(783, 'sine', 0.15), 160);
  },

  // Efecto de moneda/compra (brillo metalico)
  playCoin() {
    this.playTone(987, 'sine', 0.08);
    setTimeout(() => this.playTone(1318, 'sine', 0.2), 80);
  }
};

// Inicializar contexto de audio con la primera interacción del usuario
window.addEventListener('touchstart', () => AudioEffects.init(), { once: true });
window.addEventListener('click', () => AudioEffects.init(), { once: true });