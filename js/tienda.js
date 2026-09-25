// =========================================================
// TIENDA.JS — Renderizado de la tienda, el armario (Accesorios/
// Escenario) y el panel "Mi Pet" (color, tamaño, forma,
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
      <div class="grid-container"></div>
      <div class="store-tabs" role="tablist" aria-label="Categorías de la tienda">
        <button class="store-tab ${category === 'all' ? 'active' : ''}" data-category="all">Todos</button>
        <button class="store-tab ${category === 'acc' ? 'active' : ''}" data-category="acc">Accesorios</button>
        <button class="store-tab ${category === 'bg' ? 'active' : ''}" data-category="bg">Escenarios</button>
      </div>
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
              <button class="color-option ${PetState.petColor === '#ff80ab' ? 'selected' : ''}" onclick="PetState.setColor('#ff80ab'); Store.renderMyPet();" aria-label="Color rosa" style="background:#ff80ab;"></button>
              <button class="color-option ${PetState.petColor === '#b388ff' ? 'selected' : ''}" onclick="PetState.setColor('#b388ff'); Store.renderMyPet();" aria-label="Color violeta" style="background:#b388ff;"></button>
              <button class="color-option ${PetState.petColor === '#80cbc4' ? 'selected' : ''}" onclick="PetState.setColor('#80cbc4'); Store.renderMyPet();" aria-label="Color turquesa" style="background:#80cbc4;"></button>
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
    };
  },

  renderMyPet() {
    const content = document.getElementById('modal-content');
    content.innerHTML = `
      <h2 style="text-align:center; color:#6a1b9a;">🐾 Mi Pet</h2>
      ${this.renderPetCustomization()}
    `;
    this.bindPetCustomization(content);
  },

  renderCollection(title, category, includeLooks, rerender) {
    const content = document.getElementById('modal-content');
    content.innerHTML = `
      <h2 style="text-align:center; color:#6a1b9a;">${title}</h2>
      ${includeLooks ? `<div style="margin: 4px 0 8px; text-align:center;">
        <p style="font-size:0.8rem; color:#666; margin-bottom:4px; font-weight:bold;">⭐ Mis Looks:</p>
        <div id="looks-list" style="display:flex; flex-wrap:wrap; gap:6px; justify-content:center; margin-bottom:8px;"></div>
        <button onclick="Store.saveCurrentLook()" class="card-btn" style="width:auto; padding:6px 16px; background:#7e57c2;">💾 Guardar look actual</button>
      </div>` : ''}
      <hr style="border:none; border-top:1px solid #eee; margin:8px 0;">
      <div class="grid-container"></div>
    `;

    if (includeLooks) {
      const looksList = content.querySelector('#looks-list');
      if (!PetState.looks || PetState.looks.length === 0) {
        looksList.innerHTML = `<span style="font-size:0.72rem; color:#999;">Todavía no guardaste ningún look</span>`;
      } else {
        PetState.looks.forEach(look => {
          const chip = document.createElement('div');
          chip.className = 'look-chip';
          chip.innerHTML = `
            <span class="look-chip-name">${look.name}</span>
            <div class="look-chip-actions">
              <button onclick="PetState.applyLook('${look.id}'); Store.renderAccessories();" title="Aplicar look">✨</button>
              <button onclick="PetState.deleteLook('${look.id}'); Store.renderAccessories();" title="Borrar look">🗑️</button>
            </div>
          `;
          looksList.appendChild(chip);
        });
      }
    }

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

  renderAccessories() {
    this.renderCollection('🎒 Accesorios', 'acc', true, () => this.renderAccessories());
  },

  renderScenery() {
    this.renderCollection('🏡 Escenario', 'bg', false, () => this.renderScenery());
  },

  saveCurrentLook() {
    const name = prompt('Nombre para este look:', `Look ${(PetState.looks ? PetState.looks.length : 0) + 1}`);
    if (name === null) return; // El usuario canceló
    PetState.saveLook(name.trim());
    this.renderAccessories();
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
      alert('¡No tienes suficientes monedas!');
    }
  }
};
