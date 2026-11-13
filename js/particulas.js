// =========================================================
// PARTÍCULAS AMBIENTALES POR ESCENARIO (CSS puro + spawn en JS)
// Usa el contenedor #bg-particles y las animaciones .fall-slow,
// .float-up y .twinkle definidas en css/escenarios.css.
//
// Los escenarios son ilustraciones completas, así que las partículas
// solo suman movimiento: pocas, chicas y sin repetir lo que ya está
// dibujado (el sol, los peces, la fogata...).
//
// Cada entrada de CONFIG admite:
//   mode      'twinkle' (titilan en su lugar), 'fall-slow' (caen)
//             o 'float-up' (suben)
//   emojis    lista de emojis posibles
//   count     cantidad en pantalla
//   interval  ms entre tandas (solo fall-slow y float-up)
//   area      [desde, hasta] en % de alto donde aparecen (solo twinkle);
//             sirve para dejarlas en el cielo o la pared
//   size      multiplicador de tamaño (1 por defecto)
// =========================================================
const Particles = {
  CONFIG: {
    // Interiores
    bg_living:     { mode: 'twinkle',   emojis: ['✨'],       count: 5, area: [8, 50] },
    bg_bedroom:    { mode: 'twinkle',   emojis: ['✨', '⭐'], count: 6, area: [8, 45] },
    bg_playroom:   { mode: 'float-up',  emojis: ['🎈'],       count: 3, interval: 3200 },
    bg_kitchen:    { mode: 'twinkle',   emojis: ['✨'],       count: 4, area: [10, 45] },
    bg_bathroom:   { mode: 'float-up',  emojis: ['🫧'],       count: 6, interval: 2000 },
    bg_dojo:       { mode: 'fall-slow', emojis: ['🌸'],       count: 7, interval: 2200 },
    bg_disco:      { mode: 'twinkle',   emojis: ['✨', '🎶'], count: 9, area: [8, 55] },
    bg_space:      { mode: 'twinkle',   emojis: ['✨'],       count: 5, area: [10, 45] },
    bg_castle:     { mode: 'twinkle',   emojis: ['✨'],       count: 6, area: [8, 50] },

    // Exteriores
    bg_park:       { mode: 'fall-slow', emojis: ['🌸', '🍃'], count: 6, interval: 2400 },
    bg_beach:      { mode: 'twinkle',   emojis: ['✨'],       count: 5, area: [44, 58] }, // brillos sobre el mar
    bg_forest:     { mode: 'fall-slow', emojis: ['🍃'],       count: 5, interval: 2600 },
    bg_mountain:   { mode: 'fall-slow', emojis: ['❄️'],       count: 12, interval: 1400 },
    bg_camping:    { mode: 'twinkle',   emojis: ['✨'],       count: 6, area: [5, 40] },
    bg_desert:     { mode: 'twinkle',   emojis: ['✨'],       count: 4, area: [8, 40] },
    bg_underwater: { mode: 'float-up',  emojis: ['🫧'],       count: 8, interval: 1800 },
    bg_volcano:    { mode: 'float-up',  emojis: ['🔥'],       count: 4, interval: 2400, size: 0.6 } // brasas
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
        this.spawnTwinkle(container, config);
      }
    } else {
      // Ráfaga inicial para no esperar al primer intervalo
      for (let i = 0; i < config.count; i++) {
        setTimeout(() => {
          // Si mientras tanto se cambió de escenario, esta tanda ya no corresponde
          if (this._current === backgroundId) this.spawnStream(container, config);
        }, i * (config.interval / config.count));
      }
      // Cuántas partículas nacen por tick para que la densidad sostenida
      // en pantalla siga reflejando el `count` configurado (antes solo
      // nacía 1 por tick sin importar cuánto se subiera `count`).
      const perTick = Math.max(1, Math.round(config.count / 5));
      this._spawnTimer = setInterval(() => {
        for (let i = 0; i < perTick; i++) {
          this.spawnStream(container, config);
        }
      }, config.interval);
    }
  },

  spawnTwinkle(container, config) {
    const emojis = config.emojis;
    const [from, to] = config.area || [5, 70];
    const size = config.size || 1;
    const el = document.createElement('span');
    el.className = 'particle twinkle';
    el.innerText = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.left = `${Math.random() * 88 + 4}%`;
    el.style.top = `${(from + Math.random() * (to - from)).toFixed(1)}%`;
    el.style.fontSize = `${((Math.random() * 0.4 + 0.6) * size).toFixed(2)}rem`;
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
    el.style.fontSize = `${((Math.random() * 0.4 + 0.8) * (config.size || 1)).toFixed(2)}rem`;
    const duration = Math.random() * 2.5 + 4.5;
    el.style.animationDuration = `${duration.toFixed(2)}s`;
    container.appendChild(el);

    setTimeout(() => el.remove(), (duration + 0.3) * 1000);
  }
};
