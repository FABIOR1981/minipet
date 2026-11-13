// =========================================================
// MASCOTA-MINI.JS — La mascota dentro de los minijuegos.
//
// createMiniPet() hace una copia en miniatura de la mascota real
// (#pet), con su color, forma, cara, brillantina y accesorio
// puesto, así en los juegos se ve igual que en la habitación.
//
// Se usa de tres maneras:
//   · Protagonista (Runner, Atrapa Dulces): createActor() la monta
//     sobre el canvas y el juego la mueve con place(x, y).
//   · Espectadora (Globos, Burbujas, Torre, Simón): renderHeader()
//     deja un lugar junto al título y mountSpectator() la sienta ahí;
//     el juego la hace reaccionar con spectate('cheer' | 'oops' | 'nod').
//   · Conteo regresivo y pantalla de resultado (juegos-base.js).
//
// Los estilos (.mini-pet, .game-stage, .game-header) están en
// css/juegos.css.
// =========================================================
Object.assign(Minigames, {
  // Devuelve { el, setSize, cheer, oops, nod, party, run }.
  // `size` es el alto/ancho en píxeles que ocupa en pantalla.
  createMiniPet(size = 56) {
    const source = document.getElementById('pet');
    const wrap = document.createElement('div');
    wrap.className = 'mini-pet';
    wrap.setAttribute('aria-hidden', 'true');

    let sprite;
    if (source) {
      sprite = source.cloneNode(true);
      // La copia no debe compartir ids ni comportamiento con la original
      sprite.removeAttribute('id');
      sprite.removeAttribute('onclick');
      sprite.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
      sprite.querySelectorAll('.heart-particle, .food-bite').forEach(node => node.remove());
      // Conserva solo la forma; fuera tamaño, caminata, saltos y mirada
      sprite.className = sprite.className.split(/\s+/)
        .filter(c => c === 'pet-sprite' || c.startsWith('shape-')).join(' ');
      sprite.style.left = '';
      sprite.style.top = '';
      sprite.style.scale = '';
      // En los juegos siempre está contenta
      const face = sprite.querySelector('.kawaii-face');
      if (face) face.className = 'kawaii-face happy';
      const prop = sprite.querySelector('.extra-prop');
      if (prop) prop.innerText = '';
    } else {
      sprite = document.createElement('div');
      sprite.className = 'pet-sprite shape-circle';
    }
    wrap.appendChild(sprite);

    const mouth = sprite.querySelector('.mouth');
    const normalMouth = mouth ? mouth.innerText : '';
    let mouthTimer = null;

    // Reinicia y lanza una animación corta (clase que se quita sola)
    const react = (cls, ms) => {
      wrap.classList.remove('cheer', 'oops', 'nod');
      void wrap.offsetWidth;
      wrap.classList.add(cls);
      clearTimeout(wrap._reactTimer);
      wrap._reactTimer = setTimeout(() => wrap.classList.remove(cls), ms);
    };

    const api = {
      el: wrap,
      setSize(px) {
        wrap.style.setProperty('--mini-size', `${px}px`);
        // La mascota real mide 120 px; se escala hasta el tamaño pedido
        sprite.style.setProperty('--pet-scale', (px / 120).toFixed(4));
      },
      cheer() { react('cheer', 450); },   // saltito de alegría
      nod() { react('nod', 300); },       // cabeceo al ritmo
      oops() {                            // sorpresa
        react('oops', 550);
        if (mouth) {
          mouth.innerText = 'o';
          clearTimeout(mouthTimer);
          mouthTimer = setTimeout(() => { mouth.innerText = normalMouth; }, 700);
        }
      },
      party(on = true) { wrap.classList.toggle('party', on); },  // festejo continuo
      run(on = true) { wrap.classList.toggle('run', on); }       // trote
    };
    api.setSize(size);
    return api;
  },

  // ---------------------------------------------------------
  // ESPECTADORA
  // ---------------------------------------------------------
  spectator: null,

  // Encabezado de un juego con lugar para la espectadora a la izquierda
  renderHeader(title, hudHtml) {
    return `
      <div class="game-header">
        <div id="spectator-slot" class="spectator-slot"></div>
        <div class="game-header-info">
          <h3 class="game-title">${title}</h3>
          ${hudHtml}
        </div>
      </div>
    `;
  },

  mountSpectator(size = 50) {
    const slot = document.getElementById('spectator-slot');
    this.spectator = null;
    if (!slot) return;
    this.spectator = this.createMiniPet(size);
    slot.appendChild(this.spectator.el);
  },

  // Hace reaccionar a la espectadora, si sigue en pantalla
  spectate(action) {
    const pet = this.spectator;
    if (pet && pet.el.isConnected && typeof pet[action] === 'function') pet[action]();
  },

  // ---------------------------------------------------------
  // PROTAGONISTA
  // ---------------------------------------------------------
  // Monta la mascota sobre un canvas. `size` va en unidades del canvas.
  // place(x, y) la ubica con los pies en (x, y), también en unidades
  // del canvas, sin importar a qué tamaño se vea en pantalla.
  createActor(canvas, size) {
    const stage = canvas.parentElement;
    const holder = document.createElement('div');
    holder.className = 'stage-actor';
    const pet = this.createMiniPet(size);
    holder.appendChild(pet.el);
    stage.appendChild(holder);

    let unit = 1;   // píxeles de pantalla por unidad del canvas
    let offset = 0; // borde del canvas
    const measure = () => {
      unit = canvas.clientWidth / canvas.width || 1;
      offset = canvas.clientLeft || 0;
      pet.setSize(size * unit);
    };
    measure();
    window.addEventListener('resize', measure);

    return Object.assign(pet, {
      place(x, y) {
        const px = offset + (x - size / 2) * unit;
        const py = offset + (y - size) * unit;
        holder.style.transform = `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px)`;
      },
      destroy() {
        window.removeEventListener('resize', measure);
        holder.remove();
      }
    });
  }
});
