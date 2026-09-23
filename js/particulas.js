// =========================================================
// PARTÍCULAS AMBIENTALES POR ESCENARIO (CSS puro + spawn en JS)
// Usa el contenedor #bg-particles y las animaciones .fall-slow,
// .float-up y .twinkle ya definidas en css/styles.css.
//
// Para sumar partículas a un fondo nuevo, alcanza con agregar
// una entrada en CONFIG con su modo y sus emojis.
// =========================================================
const Particles = {
  CONFIG: {
    // --- Bloque 4 parte 1 ---
    bg_space:      { mode: 'twinkle',   emojis: ['⭐', '☄️'], count: 8 },
    bg_underwater: { mode: 'float-up',  emojis: ['🫧', '💧', '🐟'], count: 6, interval: 1800 }, // 🐟 Pequeños peces subiendo
    bg_beach:      { mode: 'twinkle',   emojis: ['☀️', '🐚', '🌊'],       count: 5 },
    bg_forest:     { mode: 'fall-slow', emojis: ['🍃', '🍂', '🦋'], count: 5, interval: 2200 }, // 🦋 Mariposas cayendo/volando suavemente

    // --- Bloque 4 parte 2 ---
    bg_living:     { mode: 'twinkle',   emojis: ['✨'],       count: 6 },
    bg_bedroom:    { mode: 'twinkle',   emojis: ['⭐', '💤'], count: 6 },
    bg_playroom:   { mode: 'float-up',  emojis: ['🎈'],       count: 5, interval: 2000 },
    bg_park:       { mode: 'fall-slow', emojis: ['🍃', '🌸'], count: 5, interval: 2200 },
    bg_mountain:   { mode: 'fall-slow', emojis: ['❄️'],       count: 8, interval: 1400 },
    bg_camping:    { mode: 'twinkle',   emojis: ['⭐', '🔥', '🦉'], count: 7 }, // 🦉 Búhos y brasas de la fogata
    bg_desert:     { mode: 'twinkle',   emojis: ['☀️', '💨', '🔥'], count: 5 }, // 💨 Ráfagas de viento y sol intenso
    bg_kitchen:    { mode: 'float-up',  emojis: ['♨️', '🧂', '🧁'], count: 4, interval: 2200 }, // 🧂 Especias y vapor subiendo
    bg_bathroom:   { mode: 'float-up',  emojis: ['🫧', '💧', '🦆'], count: 6, interval: 1600 }, // 🦆 Patitos de hule flotando entre burbujas
    bg_dojo:       { mode: 'fall-slow', emojis: ['🌸', '🍃', '☯️'], count: 5, interval: 2200 }, // ☯️ Equilibrio y pétalos de cerezo
    bg_disco:      { mode: 'twinkle',   emojis: ['✨', '🎶', '🪩'], count: 8 }, // 🎶 Música y destellos de la bola de espejos
    bg_castle:     { mode: 'float-up',  emojis: ['✨'],       count: 5, interval: 2400 },
    bg_volcano:    { mode: 'float-up',  emojis: ['🔥'],       count: 5, interval: 2000 }
  },

  _current: null,
  _spawnTimer: null,

  // Cambia las partículas activas según el fondo equipado.
  // No hace nada si el fondo no cambió (evita reiniciar la animación
  // cada vez que se llama updateUI()).
  render(backgroundId) {
    if (this._current === backgroundId) return;
    this._current = backgroundId;

    const container = document.getElementById('bg-particles');
    if (!container) return;

    container.innerHTML = '';
    if (this._spawnTimer) {
      clearInterval(this._spawnTimer);
      this._spawnTimer = null;
    }

    const config = this.CONFIG[backgroundId];
    if (!config) return; // Este fondo todavía no tiene partículas asignadas

    if (config.mode === 'twinkle') {
      // Partículas fijas que titilan en su lugar (estrellas, brillos)
      for (let i = 0; i < config.count; i++) {
        this.spawnTwinkle(container, config.emojis);
      }
    } else {
      // Partículas que recorren la pantalla (burbujas, hojas) y se renuevan solas
      for (let i = 0; i < config.count; i++) {
        setTimeout(() => this.spawnStream(container, config), i * (config.interval / config.count));
      }
      this._spawnTimer = setInterval(() => {
        this.spawnStream(container, config);
      }, config.interval);
    }
  },

  spawnTwinkle(container, emojis) {
    const el = document.createElement('span');
    el.className = 'particle twinkle';
    el.innerText = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.left = `${Math.random() * 88 + 4}%`;
    el.style.top = `${Math.random() * 65 + 5}%`;
    el.style.fontSize = `${(Math.random() * 0.6 + 0.7).toFixed(2)}rem`;
    el.style.animationDuration = `${(Math.random() * 1.6 + 1.4).toFixed(2)}s`;
    el.style.animationDelay = `${(Math.random() * 2).toFixed(2)}s`;
    container.appendChild(el);
  },

  spawnStream(container, config) {
    const el = document.createElement('span');
    const emoji = config.emojis[Math.floor(Math.random() * config.emojis.length)];
    el.className = `particle ${config.mode}`;
    el.innerText = emoji;
    el.style.left = `${Math.random() * 86 + 4}%`;
    el.style.fontSize = `${(Math.random() * 0.5 + 0.9).toFixed(2)}rem`;
    const duration = Math.random() * 2.5 + 4.5;
    el.style.animationDuration = `${duration.toFixed(2)}s`;
    container.appendChild(el);

    setTimeout(() => el.remove(), (duration + 0.3) * 1000);
  }
};
