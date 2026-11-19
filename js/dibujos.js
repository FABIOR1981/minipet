// =========================================================
// DIBUJOS.JS — Reemplaza los emojis del sistema por dibujos
// propios del juego, para que se vea igual en todos los teléfonos
// (cada marca dibuja los emojis a su manera).
//
// El resto del código sigue escribiendo emojis como siempre
// ("🎈 Atrapa Dulces"); este archivo los cambia solo, en pantalla,
// por la imagen de img/dibujos/. Si un emoji no está en la lista
// de abajo, queda como emoji común.
//
//   Dibujos.observar()                    lo llama este mismo archivo al cargar
//   Dibujos.dibujar(ctx, emoji, x, y)     para los juegos que pintan en canvas
//
// Los dibujos son Fluent Emoji de Microsoft (licencia MIT, ver
// img/dibujos/LICENCIA.txt).
// =========================================================
export const Dibujos = {
  CARPETA: 'img/dibujos/',

  // emoji → nombre del archivo (sin .svg)
  mapa: {
    '☁': 'cloud', '⚪': 'white-circle', '⚽': 'soccer-ball',
    '⛩': 'shinto-shrine', '⛺': 'tent', '✨': 'sparkles',
    '❄': 'snowflake', '❤': 'red-heart', '⭐': 'star', '🏴': 'pirate-flag',
    '🌈': 'rainbow', '🌋': 'volcano', '🌌': 'milky-way',
    '🌙': 'crescent-moon', '🌟': 'glowing-star', '🌡': 'thermometer',
    '🌲': 'evergreen-tree', '🌳': 'deciduous-tree', '🌸': 'cherry-blossom',
    '🍃': 'leaf-fluttering-in-wind', '🍄': 'mushroom', '🍇': 'grapes',
    '🍉': 'watermelon', '🍌': 'banana', '🍎': 'red-apple',
    '🍓': 'strawberry', '🍔': 'hamburger', '🍕': 'pizza',
    '🍗': 'poultry-leg', '🍡': 'dango', '🍪': 'cookie',
    '🍫': 'chocolate-bar', '🍬': 'candy', '🍭': 'lollipop',
    '🍰': 'shortcake', '🍳': 'cooking', '🎀': 'ribbon',
    '🎁': 'wrapped-gift', '🎈': 'balloon', '🎉': 'party-popper',
    '🎧': 'headphone', '🎨': 'artist-palette', '🎭': 'performing-arts',
    '🎮': 'video-game', '🎯': 'bullseye', '🎲': 'game-die',
    '🎶': 'musical-notes', '🏔': 'snow-capped-mountain', '🏖': 'beach-with-umbrella',
    '🏜': 'desert', '🏰': 'castle', '🏴‍☠': 'pirate-flag',
    '🐑': 'ewe', '🐥': 'front-facing-baby-chick', '🐰': 'rabbit-face',
    '🐱': 'cat-face', '🐾': 'paw-prints', '👆': 'backhand-index-pointing-up-default',
    '👉': 'backhand-index-pointing-right-default', '👑': 'crown', '👗': 'dress',
    '👟': 'running-shoe', '💊': 'pill', '💖': 'sparkling-heart',
    '💗': 'growing-heart', '💚': 'green-heart', '💤': 'zzz',
    '💧': 'droplet', '📸': 'camera-with-flash', '🔑': 'key',
    '🔥': 'fire', '🔧': 'wrench', '🔲': 'black-square-button',
    '😊': 'smiling-face-with-smiling-eyes', '😴': 'sleeping-face', '🚀': 'rocket',
    '🛁': 'bathtub', '🛋': 'couch-and-lamp', '🛏': 'bed',
    '🤒': 'face-with-thermometer', '🤿': 'diving-mask', '🥕': 'carrot',
    '🥞': 'pancakes', '🥟': 'dumpling', '🥦': 'broccoli',
    '🥨': 'pretzel', '🥱': 'yawning-face', '🥳': 'partying-face',
    '🥷': 'ninja-default', '🥺': 'pleading-face', '🦄': 'unicorn',
    '🧀': 'cheese-wedge', '🧁': 'cupcake', '🧚': 'person-fairy-default',
    '🧠': 'brain', '🧣': 'scarf', '🧦': 'socks',
    '🧪': 'test-tube', '🧸': 'teddy-bear', '🩹': 'adhesive-bandage',
    '🪄': 'magic-wand', '🪙': 'coin', '🪞': 'mirror',
    '🪩': 'mirror-ball', '🪸': 'coral', '🫧': 'bubbles',
    '🃏': 'joker'
  },

  patron: null,
  imagenes: {},

  ruta(emoji) {
    const nombre = this.mapa[emoji.replace(/\uFE0F/g, '')];
    return nombre ? `${this.CARPETA}${nombre}.svg` : null;
  },

  // Cambia los emojis de los textos que haya dentro de `raiz`
  pintar(raiz) {
    if (!raiz) return;
    if (raiz.nodeType === Node.TEXT_NODE) { this.pintarTexto(raiz); return; }
    if (raiz.nodeType !== Node.ELEMENT_NODE) return;
    const recorrido = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
    const textos = [];
    while (recorrido.nextNode()) textos.push(recorrido.currentNode);
    textos.forEach(t => this.pintarTexto(t));
  },

  pintarTexto(nodo) {
    const padre = nodo.parentElement;
    if (!padre || padre.closest('script, style, textarea, canvas, svg, .sin-dibujos')) return;
    const texto = nodo.nodeValue;
    this.patron.lastIndex = 0;
    if (!this.patron.test(texto)) return;
    this.patron.lastIndex = 0;
    const trozos = document.createDocumentFragment();
    let desde = 0, hallado;
    while ((hallado = this.patron.exec(texto))) {
      if (hallado.index > desde) trozos.append(texto.slice(desde, hallado.index));
      const img = document.createElement('img');
      img.className = 'dibujo';
      img.src = this.ruta(hallado[0]);
      img.alt = hallado[0];
      img.draggable = false;
      trozos.append(img);
      desde = hallado.index + hallado[0].length;
    }
    if (desde < texto.length) trozos.append(texto.slice(desde));
    nodo.replaceWith(trozos);
  },

  // Vigila la página: cada texto nuevo pasa por pintar()
  observar() {
    const claves = Object.keys(this.mapa).sort((a, b) => b.length - a.length)
      .map(c => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    this.patron = new RegExp(`(?:${claves.join('|')})\uFE0F?`, 'gu');
    this.pintar(document.body);
    new MutationObserver(cambios => {
      cambios.forEach(c => {
        if (c.type === 'characterData') this.pintar(c.target);
        else c.addedNodes.forEach(n => this.pintar(n));
      });
    }).observe(document.body, { childList: true, characterData: true, subtree: true });
  },

  // Para canvas: pinta el dibujo donde ctx.fillText() pintaría el emoji,
  // respetando el tamaño de letra y la alineación que tenga el contexto.
  dibujar(ctx, emoji, x, y) {
    const ruta = this.ruta(emoji);
    let img = ruta && this.imagenes[ruta];
    if (ruta && !img) {
      img = this.imagenes[ruta] = new Image();
      img.src = ruta;
    }
    if (!img || !img.complete || !img.naturalWidth) { ctx.fillText(emoji, x, y); return; }
    const lado = parseFloat(ctx.font) || 24;
    let izq = x, arriba = y - lado * 0.86;
    if (ctx.textAlign === 'center') izq = x - lado / 2;
    else if (ctx.textAlign === 'right' || ctx.textAlign === 'end') izq = x - lado;
    if (ctx.textBaseline === 'middle') arriba = y - lado / 2;
    else if (ctx.textBaseline === 'top' || ctx.textBaseline === 'hanging') arriba = y;
    ctx.drawImage(img, izq, arriba, lado, lado);
  }
};

if (document.body) Dibujos.observar();
else document.addEventListener('DOMContentLoaded', () => Dibujos.observar());
