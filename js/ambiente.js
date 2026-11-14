// =========================================================
// AMBIENTE.JS — Detalles animados de cada escenario: luces que
// laten, nubes que pasan, humo, fuego, luciérnagas, peces.
//
// Crea los elementos dentro de #scene-fx, una capa que mide lo
// mismo que la ilustración del escenario (400x480) y se escala
// igual que ella. Por eso las posiciones de CONFIG usan las
// mismas coordenadas que los SVG de img/escenarios/.
// Los estilos y animaciones (.fx-*) están en css/escenarios.css.
//
// Tipos disponibles (campo `t`) y sus datos:
//   glow     x, y, r | rx, ry, c (color), d (seg), min (opacidad mínima), flicker
//   cloud    y, s (escala), d (seg que tarda en cruzar), delay, op (opacidad)
//   puff     x, y, r, c, d, delay, rise (px que sube), bubble
//   dot      x, y, r, c, d, delay
//   firefly  x, y, dx, dy (px que deambula), d, delay
//   flame    x, y (base de la llama), w, h
//   beam     x, w, c, d, delay
//   ring     x, y, rx, ry, c, d
//   window   x, y, w, h, radius  (recorte con una estrella fugaz)
//   fish     y, s, d, delay, rev (nada de derecha a izquierda)
//   wave     y
//   blink    x, y, w, h, c, delay
//   sparkle  x, y, size, c, d, delay
//   mirror   x, y, w, h  (óvalo donde js/vestidor.js dibuja el reflejo)
// =========================================================
const Ambiente = {
  SCENE: { width: 400, height: 480 },

  CONFIG: {
    bg_living: [
      { t: 'glow', x: 206, y: 150, r: 84, c: '#fff2a8', d: 3.5 }
    ],
    bg_bedroom: [
      { t: 'glow', x: 218, y: 206, r: 84, c: '#ffe9a8', d: 4 },
      { t: 'dot', x: 30, y: 40, r: 5, c: '#ffd166', d: 1.6 },
      { t: 'dot', x: 75, y: 52, r: 5, c: '#ff9fb5', d: 2.1, delay: 0.4 },
      { t: 'dot', x: 120, y: 56, r: 5, c: '#8fe0ff', d: 1.8, delay: 0.9 },
      { t: 'dot', x: 290, y: 46, r: 5, c: '#ffd166', d: 2.2, delay: 0.2 },
      { t: 'dot', x: 335, y: 41, r: 5, c: '#8fe0ff', d: 1.7, delay: 0.7 },
      { t: 'dot', x: 378, y: 34, r: 5, c: '#ff9fb5', d: 2, delay: 1.1 }
    ],
    bg_playroom: [
      { t: 'sparkle', x: 360, y: 198, size: 22, c: '#ffd54f', d: 1.6 },
      { t: 'sparkle', x: 344, y: 270, size: 14, c: '#ffffff', d: 2.2, delay: 0.6 }
    ],
    bg_park: [
      { t: 'glow', x: 322, y: 92, r: 84, c: '#fff3a6', d: 5 },
      { t: 'cloud', y: 50, s: 0.9, d: 75 },
      { t: 'cloud', y: 130, s: 0.55, d: 105, delay: -50, op: 0.8 }
    ],
    bg_beach: [
      { t: 'glow', x: 92, y: 104, r: 90, c: '#fff3a6', d: 5 },
      { t: 'cloud', y: 44, s: 0.8, d: 90, delay: -20 },
      { t: 'wave', y: 296 }
    ],
    bg_forest: [
      { t: 'glow', x: 366, y: 252, r: 38, c: '#fff59d', d: 2.6 },
      { t: 'firefly', x: 110, y: 170, dx: 34, dy: -26, d: 9 },
      { t: 'firefly', x: 250, y: 150, dx: -30, dy: 24, d: 11, delay: -3 },
      { t: 'firefly', x: 180, y: 270, dx: 40, dy: -18, d: 8, delay: -5 },
      { t: 'firefly', x: 300, y: 300, dx: -36, dy: -30, d: 12, delay: -2 },
      { t: 'firefly', x: 140, y: 360, dx: 28, dy: -34, d: 10, delay: -6 }
    ],
    bg_mountain: [
      { t: 'cloud', y: 40, s: 0.8, d: 100, delay: -30 },
      { t: 'puff', x: 101, y: 184, r: 8, c: '#ffffff', d: 4.5, rise: 64 },
      { t: 'puff', x: 101, y: 184, r: 8, c: '#ffffff', d: 4.5, rise: 64, delay: -1.5 },
      { t: 'puff', x: 101, y: 184, r: 8, c: '#ffffff', d: 4.5, rise: 64, delay: -3 },
      { t: 'glow', x: 100, y: 264, r: 30, c: '#ffe08a', d: 2.8 }
    ],
    bg_camping: [
      { t: 'glow', x: 304, y: 326, r: 120, c: 'rgba(255, 179, 71, 0.55)', flicker: true },
      { t: 'flame', x: 304, y: 338, w: 64, h: 78 },
      { t: 'puff', x: 298, y: 268, r: 2.5, c: '#ffcf70', d: 2.6, rise: 80 },
      { t: 'puff', x: 312, y: 262, r: 2, c: '#ffcf70', d: 3.2, rise: 90, delay: -1.2 },
      { t: 'puff', x: 304, y: 270, r: 2, c: '#ffe9a8', d: 2.9, rise: 70, delay: -2 },
      { t: 'glow', x: 96, y: 282, r: 50, c: 'rgba(255, 230, 163, 0.6)', d: 3.2 }
    ],
    bg_desert: [
      { t: 'glow', x: 286, y: 196, r: 120, c: '#fff1b5', d: 5 },
      { t: 'cloud', y: 60, s: 0.7, d: 120, delay: -40, op: 0.6 }
    ],
    bg_kitchen: [
      { t: 'glow', x: 332, y: 270, r: 30, c: '#ffcf70', d: 1.8 },
      { t: 'puff', x: 320, y: 176, r: 7, c: '#ffffff', d: 3.6, rise: 46 },
      { t: 'puff', x: 342, y: 180, r: 7, c: '#ffffff', d: 3.6, rise: 46, delay: -1.8 }
    ],
    bg_bathroom: [
      { t: 'puff', x: 250, y: 204, r: 7, d: 5, rise: 80, bubble: true },
      { t: 'puff', x: 304, y: 198, r: 5, d: 6, rise: 96, bubble: true, delay: -2 },
      { t: 'puff', x: 346, y: 206, r: 8, d: 5.5, rise: 70, bubble: true, delay: -3.6 }
    ],
    bg_dojo: [
      { t: 'glow', x: 350, y: 236, r: 34, c: '#ffe9a8', d: 2.4 },
      { t: 'cloud', y: 84, s: 0.6, d: 130, delay: -60, op: 0.7 }
    ],
    bg_disco: [
      { t: 'beam', x: 90, w: 150, c: '#ff4fb3', d: 4.5 },
      { t: 'beam', x: 318, w: 150, c: '#22d3ee', d: 5.5, delay: -2 },
      { t: 'beam', x: 202, w: 130, c: '#ffd166', d: 3.8, delay: -1 },
      { t: 'glow', x: 292, y: 96, r: 76, c: 'rgba(255, 255, 255, 0.5)', d: 1.2 },
      { t: 'sparkle', x: 270, y: 78, size: 18, c: '#ffffff', d: 0.9 },
      { t: 'sparkle', x: 318, y: 114, size: 14, c: '#ffffff', d: 1.3, delay: 0.3 },
      { t: 'sparkle', x: 340, y: 64, size: 16, c: '#ffffff', d: 1.1, delay: 0.6 }
    ],
    bg_space: [
      { t: 'window', x: 52, y: 74, w: 296, h: 140, radius: 34 },
      { t: 'dot', x: 88, y: 240, r: 4, c: '#ff6b6b', d: 0.9 },
      { t: 'dot', x: 100, y: 240, r: 4, c: '#ffd166', d: 1.4, delay: 0.3 },
      { t: 'dot', x: 112, y: 240, r: 4, c: '#6fd08c', d: 1.1, delay: 0.6 },
      { t: 'ring', x: 200, y: 394, rx: 128, ry: 38, c: '#5ef0ff', d: 3 },
      { t: 'ring', x: 200, y: 394, rx: 128, ry: 38, c: '#5ef0ff', d: 3, delay: -1.5 },
      { t: 'glow', x: 336, y: 250, r: 54, c: 'rgba(94, 240, 255, 0.45)', d: 2.6 }
    ],
    bg_castle: [
      { t: 'glow', x: 200, y: 200, r: 100, c: 'rgba(255, 209, 102, 0.5)', d: 3.5 },
      { t: 'sparkle', x: 78, y: 130, size: 16, c: '#ffffff', d: 2.4 },
      { t: 'sparkle', x: 322, y: 170, size: 16, c: '#ffffff', d: 2.9, delay: 1 },
      { t: 'sparkle', x: 200, y: 140, size: 14, c: '#fff8e1', d: 1.8, delay: 0.5 }
    ],
    bg_underwater: [
      { t: 'fish', y: 70, s: 0.8, d: 30 },
      { t: 'fish', y: 220, s: 0.6, d: 40, delay: -18, rev: true },
      { t: 'glow', x: 326, y: 330, r: 62, c: 'rgba(255, 226, 122, 0.7)', d: 2.2 }
    ],
    // El vestidor (js/vestidor.js) no es un escenario comprable
    bg_vestidor: [
      { t: 'mirror', x: 274, y: 96, w: 92, h: 152 },
      { t: 'dot', x: 28, y: 36, r: 5, c: '#ffd166', d: 1.6 },
      { t: 'dot', x: 72, y: 46, r: 5, c: '#ff9fb5', d: 2.1, delay: 0.4 },
      { t: 'dot', x: 118, y: 50, r: 5, c: '#8fe0ff', d: 1.8, delay: 0.9 },
      { t: 'dot', x: 164, y: 46, r: 5, c: '#ffd166', d: 2.2, delay: 0.2 },
      { t: 'dot', x: 238, y: 42, r: 5, c: '#ff9fb5', d: 1.7, delay: 0.7 },
      { t: 'dot', x: 286, y: 42, r: 5, c: '#8fe0ff', d: 2, delay: 1.1 },
      { t: 'dot', x: 332, y: 37, r: 5, c: '#ffd166', d: 1.9, delay: 0.5 },
      { t: 'dot', x: 376, y: 30, r: 5, c: '#ff9fb5', d: 2.3 }
    ],
    bg_volcano: [
      { t: 'glow', x: 200, y: 120, r: 150, c: 'rgba(255, 179, 71, 0.6)', d: 2.4, min: 0.35 },
      { t: 'glow', x: 200, y: 384, rx: 260, ry: 70, c: 'rgba(255, 106, 43, 0.5)', d: 1.8, min: 0.3 },
      { t: 'blink', x: 339, y: 266, w: 28, h: 12, c: '#12080b' },
      { t: 'puff', x: 196, y: 108, r: 3, c: '#ffcf70', d: 2.8, rise: 70 },
      { t: 'puff', x: 210, y: 112, r: 2.5, c: '#ffcf70', d: 3.4, rise: 86, delay: -1.6 }
    ]
  },

  _current: null,

  // Dibuja el ambiente del escenario equipado. Si no cambió, solo
  // reajusta la escala (por si cambió el tamaño de la pantalla).
  render(backgroundId) {
    const container = document.getElementById('scene-fx');
    if (!container) return;
    this.fit();
    if (this._current === backgroundId) return;
    this._current = backgroundId;

    container.innerHTML = '';
    (this.CONFIG[backgroundId] || []).forEach(item => {
      const el = this.build(item);
      if (el) container.appendChild(el);
    });
  },

  // Misma escala que el fondo (background-size: cover, anclado abajo)
  fit() {
    const container = document.getElementById('scene-fx');
    const room = document.getElementById('pet-room');
    if (!container || !room) return;
    const scale = Math.max(room.clientWidth / this.SCENE.width, room.clientHeight / this.SCENE.height);
    container.style.setProperty('--scene-scale', scale.toFixed(4));
  },

  build(item) {
    const el = document.createElement('div');
    const s = el.style;
    const box = (x, y, w, h) => {
      s.left = `${x}px`; s.top = `${y}px`; s.width = `${w}px`; s.height = `${h}px`;
    };
    if (item.c) s.setProperty('--c', item.c);
    if (item.d) s.setProperty('--d', `${item.d}s`);
    if (item.delay) s.animationDelay = `${item.delay}s`;
    el.className = `fx-${item.t}`;

    switch (item.t) {
      case 'glow': {
        const rx = item.rx || item.r;
        const ry = item.ry || item.r;
        box(item.x - rx, item.y - ry, rx * 2, ry * 2);
        if (item.min !== undefined) s.setProperty('--min', item.min);
        if (item.flicker) el.classList.add('flicker');
        break;
      }
      case 'cloud':
        s.top = `${item.y}px`;
        s.setProperty('--s', item.s || 1);
        if (item.op) s.opacity = item.op;
        break;
      case 'puff':
        box(item.x - item.r, item.y - item.r, item.r * 2, item.r * 2);
        s.setProperty('--rise', `${item.rise || 50}px`);
        if (item.bubble) el.classList.add('bubble');
        break;
      case 'dot':
        box(item.x - item.r, item.y - item.r, item.r * 2, item.r * 2);
        break;
      case 'firefly':
        box(item.x - 2.5, item.y - 2.5, 5, 5);
        s.setProperty('--dx', `${item.dx}px`);
        s.setProperty('--dy', `${item.dy}px`);
        break;
      case 'flame':
        box(item.x - item.w / 2 + 2, item.y - item.h + 4, item.w, item.h);
        break;
      case 'beam':
        s.left = `${item.x - item.w / 2}px`;
        s.width = `${item.w}px`;
        break;
      case 'ring':
        box(item.x - item.rx, item.y - item.ry, item.rx * 2, item.ry * 2);
        break;
      case 'window': {
        box(item.x, item.y, item.w, item.h);
        s.borderRadius = `${item.radius || 0}px`;
        const streak = document.createElement('div');
        streak.className = 'fx-streak';
        el.appendChild(streak);
        break;
      }
      case 'fish':
        s.top = `${item.y}px`;
        s.setProperty('--s', item.s || 1);
        if (item.rev) el.classList.add('rev');
        break;
      case 'wave':
        s.top = `${item.y}px`;
        break;
      case 'blink':
        box(item.x, item.y, item.w, item.h);
        break;
      case 'mirror':
        box(item.x, item.y, item.w, item.h);
        el.id = 'vestidor-espejo';
        break;
      case 'sparkle':
        box(item.x - item.size / 2, item.y - item.size / 2, item.size, item.size);
        break;
      default:
        return null;
    }
    return el;
  }
};

window.addEventListener('resize', () => Ambiente.fit());
