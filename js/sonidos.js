// Sonidos sintetizados con Web Audio (sin archivos de audio)
// Motor Sintetizador de Sonidos
const CLAVE_SONIDO = 'mipetkawaii-sonido';

export const AudioEffects = {
  ctx: null,

  // Silencio guardado en este dispositivo (clave propia, aparte del guardado de la mascota)
  silenciado: (() => {
    try { return localStorage.getItem(CLAVE_SONIDO) === '0'; } catch (e) { return false; }
  })(),

  // Cambia entre con sonido y en silencio. Devuelve true si quedó con sonido.
  alternar() {
    this.silenciado = !this.silenciado;
    try { localStorage.setItem(CLAVE_SONIDO, this.silenciado ? '0' : '1'); } catch (e) { /* sin guardado */ }
    return !this.silenciado;
  },

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },

  playTone(freq, type, duration) {
    if (this.silenciado) return;
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
