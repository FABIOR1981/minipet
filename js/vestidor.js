// =========================================================
// VESTIDOR.JS — El armario: un lugar aparte adonde la mascota va
// a probarse accesorios. Reemplaza a la vieja ventana "Accesorios".
//
// Al abrirlo, la habitación cambia a la ilustración del vestidor
// (ropero y espejo), la mascota camina hasta el espejo y la
// botonera de abajo se cambia por el panel del vestidor. Como no
// hay una ventana encima, cada accesorio se ve puesto al instante,
// en la mascota y en su reflejo.
//
// Acá solo se cambia LO QUE SE PONE (accesorios y looks). Cómo es
// la mascota (color, forma, rasgos) se elige en "Mi Pet". Las
// frases festejan el juego de disfrazarse y nunca comparan ni
// opinan sobre su aspecto; están en data/dialogues.json ("dressup").
//
// Los estilos están en css/vestidor.css.
// =========================================================
const Vestidor = {
  // Frases de respaldo, por si no carga dialogues.json
  FALLBACK: {
    welcome: ['🪞 ¡Me encanta jugar a disfrazarme!', '✨ ¿Qué me pongo hoy?'],
    wear: ['🎭 ¡Qué divertido!', '✨ ¡Me gusta cómo se siente!'],
    none: ['😊 ¡Así también estoy genial!'],
    saved: ['📸 ¡Look guardado!'],
    items: {}
  },

  // Devuelve una frase del grupo pedido (o la propia del accesorio)
  phrase(group, itemId) {
    const data = (PetState.dialogues && PetState.dialogues.dressup) || {};
    if (itemId) {
      const own = (data.items || {})[itemId];
      if (own) return own;
    }
    const list = (Array.isArray(data[group]) && data[group].length) ? data[group] : this.FALLBACK[group];
    return list[Math.floor(Math.random() * list.length)];
  },

  open() {
    if (PetState.isSleeping) {
      PetState.showDialogue('💤 Cuando despierte vamos al vestidor.');
      return;
    }
    if (PetState.inVestidor) return;
    closeModal();

    PetState.inVestidor = true;
    document.getElementById('app-container').classList.add('en-vestidor');
    document.getElementById('vestidor-panel').hidden = false;
    this.render();
    PetState.updateUI();

    // La habitación cambió de alto al cambiar la botonera por el panel:
    // se espera un frame para medir bien y recién ahí camina hasta el espejo
    requestAnimationFrame(() => {
      Ambiente.fit();
      this.walkTo(0.4, 0.42);
    });
    PetState.showDialogue(this.phrase('welcome'));
  },

  close() {
    if (!PetState.inVestidor) return;
    PetState.inVestidor = false;
    document.getElementById('app-container').classList.remove('en-vestidor');
    document.getElementById('vestidor-panel').hidden = true;
    PetState.updateUI();
    requestAnimationFrame(() => {
      Ambiente.fit();
      PetState.applyWalkPosition();
    });
  },

  // Lleva a la mascota a un punto del piso (mismas proporciones que walkPos)
  walkTo(x, t) {
    const petEl = document.getElementById('pet');
    if (!petEl) return;
    PetState.walkPos = { x, t };
    petEl.classList.add('walking', 'look-right'); // el espejo está a la derecha
    PetState.applyWalkPosition(true);
    clearTimeout(PetState.walkEndTimer);
    PetState.walkEndTimer = setTimeout(() => petEl.classList.remove('walking', 'look-right'), 2500);
  },

  // Dibuja la tira de accesorios y los looks guardados
  render() {
    const strip = document.getElementById('vestidor-strip');
    const looksList = document.getElementById('vestidor-looks-list');
    if (!strip || !looksList) return;

    const owned = PetState.inventory
      .map(id => Catalogo.items.find(i => i.id === id))
      .filter(item => item && item.category === 'acc');
    const current = PetState.equippedAccessory;

    strip.innerHTML = `
      <button class="vestidor-item ${current ? '' : 'selected'}" data-id="">
        <span class="vestidor-item-emoji">😊</span>
        <span class="vestidor-item-name">Sin nada</span>
      </button>
      ${owned.map(item => `
        <button class="vestidor-item ${current === item.id ? 'selected' : ''}" data-id="${item.id}">
          <img src="${item.image}" alt="">
          <span class="vestidor-item-name">${item.name}</span>
        </button>`).join('')}
      <button class="vestidor-item vestidor-more" data-id="tienda">
        <span class="vestidor-item-emoji">🛍️</span>
        <span class="vestidor-item-name">Más en la tienda</span>
      </button>
    `;
    strip.onclick = (e) => {
      const btn = e.target.closest('.vestidor-item');
      if (!btn) return;
      if (btn.dataset.id === 'tienda') {
        this.close();
        switchTab('store');
        Store.renderStore('acc');
        return;
      }
      this.wear(btn.dataset.id || null);
    };

    looksList.innerHTML = '';
    (PetState.looks || []).forEach(look => {
      const chip = document.createElement('div');
      chip.className = 'look-chip';
      chip.innerHTML = `
        <span class="look-chip-name"></span>
        <div class="look-chip-actions">
          <button data-action="apply" title="Usar este look" aria-label="Usar este look">✨</button>
          <button data-action="delete" title="Borrar look" aria-label="Borrar look">🗑️</button>
        </div>
      `;
      // textContent: el nombre lo escribe el usuario y no debe interpretarse como HTML
      chip.querySelector('.look-chip-name').textContent = look.name;
      chip.querySelector('[data-action="apply"]').onclick = () => {
        PetState.applyLook(look.id);
        this.render();
        this.react(PetState.equippedAccessory);
      };
      chip.querySelector('[data-action="delete"]').onclick = () => {
        PetState.deleteLook(look.id);
        this.render();
      };
      looksList.appendChild(chip);
    });
  },

  // Se pone (o se saca) un accesorio. id null = sin nada.
  wear(id) {
    if (id === PetState.equippedAccessory || (!id && !PetState.equippedAccessory)) {
      // Tocar lo que ya tiene puesto no cambia nada; solo vuelve a festejar
      this.react(PetState.equippedAccessory);
      return;
    }
    if (id) {
      PetState.equipItem(id);
    } else {
      PetState.equippedAccessory = null;
      AudioEffects.playTone(800, 'sine', 0.08);
      PetState.saveData();
      PetState.updateUI();
    }
    this.render();
    this.react(id);
  },

  // La mascota festeja lo que se probó: saltito y frase
  react(id) {
    const petEl = document.getElementById('pet');
    if (petEl) {
      petEl.classList.remove('happy-jump');
      void petEl.offsetWidth;
      petEl.classList.add('happy-jump');
      setTimeout(() => petEl.classList.remove('happy-jump'), 400);
    }
    PetState.showDialogue(id ? this.phrase('wear', id) : this.phrase('none'));
  },

  saveLook() {
    const name = prompt('Nombre para este look:', `Look ${(PetState.looks ? PetState.looks.length : 0) + 1}`);
    if (name === null) return; // El usuario canceló
    PetState.saveLook(name.trim());
    this.render();
    PetState.showDialogue(this.phrase('saved'));
  },

  // Reflejo en el espejo: una copia de la mascota, dada vuelta.
  // La llama PetState.updateUI() cada vez que cambia el aspecto.
  refreshMirror() {
    const glass = document.getElementById('vestidor-espejo');
    if (!glass) return;
    glass.innerHTML = '';
    glass.appendChild(Minigames.createMiniPet(74).el);
  }
};
