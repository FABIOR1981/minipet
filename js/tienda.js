// =========================================================
// TIENDA.JS — Renderizado de la tienda, la ventana Escenario
// y el panel "Mi Pet" (color, tamaño, forma,
// brillantina). Usa los datos de Catalogo (catalogo.js) y el
// estado de PetState — no define datos propios.
// =========================================================
const Store = {
  storeCategory: 'all',

  // Ícono de la card: mini-preview del gradiente real para fondos,
  // ícono SVG para accesorios.
  renderIcon(item) {
    if (item.category === 'bg') {
      return `<div class="bg-preview" style="${item.preview}"><span class="bg-preview-badge">${item.image}</span></div>`;
    }
    return `<img src="${item.image}" class="card-icon" alt="${item.name}">`;
  },

  renderStore(category = this.storeCategory) {
    this.storeCategory = category;
    const content = document.getElementById('modal-content');
    content.innerHTML = `
      <h2 style="text-align:center; color:#6a1b9a;">🛍️ Tienda de Objetos</h2>
      <div class="store-tabs" role="tablist" aria-label="Categorías de la tienda">
        <button class="store-tab ${category === 'all' ? 'active' : ''}" data-category="all">Todos</button>
        <button class="store-tab ${category === 'acc' ? 'active' : ''}" data-category="acc">Accesorios</button>
        <button class="store-tab ${category === 'bg' ? 'active' : ''}" data-category="bg">Escenarios</button>
      </div>
      <div class="grid-container"></div>
    `;

    content.querySelectorAll('.store-tab').forEach(tab => {
      tab.onclick = () => this.renderStore(tab.dataset.category);
    });
    
    const container = content.querySelector('.grid-container');
    
    Catalogo.items.filter(item => category === 'all' || item.category === category).forEach(item => {
      const isOwned = PetState.inventory.includes(item.id);
      const card = document.createElement('div');
      card.className = 'item-card';

      card.innerHTML = `
        ${this.renderIcon(item)}
        <span class="card-title">${item.name}</span>
        <span class="card-price">${item.price === 0 ? 'Gratis' : '🪙 ' + item.price}</span>
        <button onclick="Store.buyItem('${item.id}')" ${isOwned ? 'disabled' : ''} class="card-btn ${isOwned ? 'owned' : ''}">
          ${isOwned ? 'Comprado' : 'Comprar'}
        </button>
      `;
      container.appendChild(card);
    });
  },

  renderPetCustomization() {
    return `
      <section class="pet-customization-panel" aria-label="Personalizar Mi Pet">
        <h3>Mi Pet</h3>
        <div class="wardrobe-top-row">
          <div style="margin: 8px 0; text-align:center;">
            <p class="wardrobe-label">Color de Piel:</p>
            <div class="color-picker">
              ${Catalogo.colors.map(c => `<button class="color-option ${PetState.petColor === c.hex ? 'selected' : ''}" onclick="PetState.setColor('${c.hex}'); Store.renderMyPet();" aria-label="Color ${c.name}" style="background:${c.hex};"></button>`).join('')}
            </div>
          </div>
          <div style="margin: 8px 0; text-align:center;">
            <p class="wardrobe-label">Tamaño:</p>
            <div id="size-picker" class="size-picker">
              <button class="card-btn size-option ${PetState.petSize === 'small' ? 'equipped' : ''}" data-size="small" aria-label="Tamaño chico">
                <span class="size-preview"><span class="pet-sprite shape-squircle" style="transform:scale(0.6);"></span></span>
              </button>
              <button class="card-btn size-option ${PetState.petSize === 'medium' ? 'equipped' : ''}" data-size="medium" aria-label="Tamaño mediano">
                <span class="size-preview"><span class="pet-sprite shape-squircle" style="transform:scale(0.8);"></span></span>
              </button>
              <button class="card-btn size-option ${PetState.petSize === 'large' ? 'equipped' : ''}" data-size="large" aria-label="Tamaño grande">
                <span class="size-preview"><span class="pet-sprite shape-squircle" style="transform:scale(1);"></span></span>
              </button>
            </div>
          </div>
        </div>
        <div style="margin: 4px 0 8px; text-align:center;">
          <p class="wardrobe-label">Forma:</p>
          <div id="shape-picker" class="shape-picker"></div>
        </div>
        <div class="glitter-intensity">
          <label for="glitter-intensity">✨ Brillantina: <output id="glitter-intensity-value">${PetState.glitterIntensity}%</output></label>
          <input id="glitter-intensity" type="range" min="0" max="100" value="${PetState.glitterIntensity}">
        </div>
      </section>
    `;
  },

  bindPetCustomization(content) {
    const shapePicker = content.querySelector('#shape-picker');
    Catalogo.shapes.forEach(shape => {
      const isSelected = PetState.petShape === shape.id;
      const btn = document.createElement('button');
      btn.className = `card-btn shape-option ${isSelected ? 'selected' : ''}`;
      btn.setAttribute('aria-label', `Forma ${shape.name}`);
      btn.innerHTML = `${shape.emoji}<br>${shape.name}`;
      btn.onclick = () => { PetState.setShape(shape.id); Store.renderMyPet(); };
      shapePicker.appendChild(btn);
    });

    content.querySelectorAll('.size-option').forEach(btn => {
      btn.onclick = () => { PetState.setSize(btn.dataset.size); Store.renderMyPet(); };
    });

    const glitterIntensity = content.querySelector('#glitter-intensity');
    const glitterIntensityValue = content.querySelector('#glitter-intensity-value');
    glitterIntensity.oninput = event => {
      glitterIntensityValue.value = `${event.target.value}%`;
      glitterIntensityValue.textContent = `${event.target.value}%`;
      PetState.setGlitterIntensity(event.target.value);
      this.refreshPetPreview();
    };
  },

  // Mi Pet tiene dos pestañas: Cuerpo (color, tamaño, forma, brillantina)
  // y Rasgos (ojos, boca, mejillas). Arriba va siempre una vista previa,
  // porque la ventana tapa a la mascota.
  myPetTab: 'cuerpo',

  renderMyPet() {
    const content = document.getElementById('modal-content');
    const tab = this.myPetTab;
    content.innerHTML = `
      <h2 style="text-align:center; color:#6a1b9a;">🐾 Mi Pet</h2>
      <div id="mypet-preview" class="mypet-preview"></div>
      <label class="mypet-name">Nombre
        <input id="mypet-name" type="text" maxlength="14" placeholder="Luna" autocomplete="off">
      </label>
      <div class="store-tabs" role="tablist" aria-label="Secciones de Mi Pet">
        <button class="store-tab ${tab === 'cuerpo' ? 'active' : ''}" data-tab="cuerpo">Cuerpo</button>
        <button class="store-tab ${tab === 'rasgos' ? 'active' : ''}" data-tab="rasgos">Rasgos</button>
      </div>
      ${tab === 'cuerpo' ? this.renderPetCustomization() : this.renderTraits()}
    `;
    content.querySelectorAll('.store-tab').forEach(btn => {
      btn.onclick = () => { this.myPetTab = btn.dataset.tab; this.renderMyPet(); };
    });
    this.refreshPetPreview();

    // El nombre se guarda mientras se escribe, sin redibujar la ventana
    const nameInput = content.querySelector('#mypet-name');
    nameInput.value = PetState.petName;
    nameInput.oninput = () => PetState.setName(nameInput.value);

    if (tab === 'cuerpo') this.bindPetCustomization(content);
    else this.bindTraits(content);
  },

  // Vista previa: una copia de la mascota tal como está ahora
  refreshPetPreview() {
    const box = document.getElementById('mypet-preview');
    if (!box) return;
    box.innerHTML = '';
    const preview = Minigames.createMiniPet(92);
    box.appendChild(preview.el);
    return preview;
  },

  renderTraits() {
    return `
      <section class="pet-customization-panel" aria-label="Rasgos de Mi Pet">
        <p class="wardrobe-label">Ojos:</p>
        <div class="trait-row" data-kind="eyes"></div>
        <p class="wardrobe-label">Boca:</p>
        <div class="trait-row" data-kind="mouth"></div>
        <p class="wardrobe-label">Mejillas:</p>
        <div class="trait-row" data-kind="cheeks"></div>
      </section>
    `;
  },

  bindTraits(content) {
    const current = { eyes: PetState.petEyes, mouth: PetState.petMouth, cheeks: PetState.petCheeks };
    content.querySelectorAll('.trait-row').forEach(row => {
      const kind = row.dataset.kind;
      Catalogo.traits[kind].forEach(option => {
        const btn = document.createElement('button');
        btn.className = `trait-option ${current[kind] === option.id ? 'selected' : ''}`;
        btn.setAttribute('aria-label', option.name);
        // Cada opción muestra la cara de la mascota, ampliada, con ese rasgo
        const zoom = document.createElement('span');
        zoom.className = `trait-zoom trait-zoom-${kind}`;
        zoom.appendChild(Minigames.createMiniPet(104, { [kind]: option.id, accessory: null }).el);
        const label = document.createElement('span');
        label.className = 'trait-name';
        label.textContent = option.name;
        btn.append(zoom, label);
        btn.onclick = () => { PetState.setTrait(kind, option.id); this.renderMyPet(); };
        row.appendChild(btn);
      });
    });
  },

  renderCollection(title, category, rerender) {
    const content = document.getElementById('modal-content');
    content.innerHTML = `
      <h2 style="text-align:center; color:#6a1b9a;">${title}</h2>
      <hr style="border:none; border-top:1px solid #eee; margin:8px 0;">
      <div class="grid-container"></div>
    `;

    const container = content.querySelector('.grid-container');

    PetState.inventory.forEach(itemId => {
      const item = Catalogo.items.find(i => i.id === itemId);
      if (!item || item.category !== category) return;

      const isEquipped = item.type === 'bg' 
        ? PetState.equippedBackground === item.id 
        : PetState.equippedAccessory === item.id;

      const card = document.createElement('div');
      card.className = 'item-card';

      card.innerHTML = `
        ${this.renderIcon(item)}
        <span class="card-title">${item.name}</span>
        <button class="card-btn ${isEquipped ? 'equipped' : ''}">
          ${isEquipped ? '✨ Usando' : 'Poner'}
        </button>
      `;
      card.querySelector('.card-btn').onclick = () => {
        PetState.equipItem(item.id);
        rerender();
      };
      container.appendChild(card);
    });
  },

  renderScenery() {
    this.renderCollection('🏡 Escenario', 'bg', () => this.renderScenery());
  },


  buyItem(itemId) {
    const item = Catalogo.items.find(i => i.id === itemId);
    if (item && (PetState.coins >= item.price || item.price === 0) && !PetState.inventory.includes(itemId)) {
      PetState.coins -= item.price;
      PetState.inventory.push(itemId);
      AudioEffects.playCoin();
      PetState.saveData();
      PetState.updateUI();
      this.renderStore(this.storeCategory);
    } else if (item && PetState.coins < item.price) {
      alert(`¡Te faltan ${item.price - PetState.coins} 🪙 para este! Juega un minijuego y lo consigues.`);
    }
  }
};
