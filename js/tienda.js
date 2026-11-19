import { Avisos } from './avisos.js';
import { Catalogo } from './catalogo.js';
import { ico, tituloPantalla } from './iconos.js';
import { Minigames } from './juegos/juegos-base.js';
import { PetState } from './mascota-estado.js';
import { Staff } from './staff.js';
import { switchTab } from './navegacion.js';
import { AudioEffects } from './sonidos.js';
// =========================================================
// TIENDA.JS — Renderizado de la tienda, la ventana Escenario
// y el panel "Mi Pet" (color, tamaño, forma,
// brillantina). Usa los datos de Catalogo (catalogo.js) y el
// estado de PetState — no define datos propios.
// =========================================================
// Rasgos que se dejan de ofrecer en Mi Pet (se siguen dibujando si ya estaban puestos)
const RASGOS_OCULTOS = { eyes: ['button'], mouth: ['omega'], cheeks: ['big'] };

export const Store = {
  storeCategory: 'all',

  // Ícono de la card: mini-preview del gradiente real para fondos,
  // ícono SVG para accesorios.
  renderIcon(item) {
    if (item.category === 'bg') {
      return `<div class="bg-preview" style="${item.preview}"><span class="bg-preview-badge">${item.image}</span></div>`;
    }
    return `<img src="${item.image}" class="card-icon" alt="${item.name}">`;
  },

  // El tendero de la tienda: lo ocupa el personaje que queda libre (ver js/staff.js)
  tenderoHTML() {
    return Staff.saludoHTML(PetState.petSpecies, 'tienda', '¡Bienvenido! Soy {nombre}, elegí lo que quieras.');
  },

  renderStore(category = this.storeCategory) {
    this.storeCategory = category;
    const content = document.getElementById('modal-content');
    content.innerHTML = `
      ${tituloPantalla('tienda', 'Tienda')}
      ${this.tenderoHTML()}
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
      // Sin botón: se toca la tarjeta. Lo que ya es tuyo queda marcado.
      const card = document.createElement('div');
      // Sin monedas suficientes: se ve el precio en rojo, sin bloquear la tarjeta
      const sinMonedas = !isOwned && item.price > PetState.coins;
      card.className = `item-card ${isOwned ? 'tuyo' : 'tocable'} ${sinMonedas ? 'sin-monedas' : ''}`;
      card.innerHTML = `
        ${this.renderIcon(item)}
        <span class="card-title">${item.name}</span>
        ${isOwned
          ? `<span class="card-estado">${ico('listo')}Tuyo</span>`
          : `<span class="card-price">${item.price === 0 ? 'Gratis' : ico('moneda', 'ico-moneda') + item.price}</span>`}
      `;
      if (!isOwned) {
        card.setAttribute('role', 'button');
        card.tabIndex = 0;
        card.setAttribute('aria-label', `Comprar ${item.name}`);
        card.onclick = () => this.tocarItem(item.id);
      }
      container.appendChild(card);
    });
  },

  renderPetCustomization() {
    return `
      <section class="pet-customization-panel" aria-label="Personalizar Mi Pet">
        <div class="wardrobe-top-row">
          <div style="margin: 8px 0; text-align:center;">
            <p class="wardrobe-label">Color</p>
            <div class="color-picker">
              ${Catalogo.colors.map(c => `<button class="color-option ${PetState.petColor === c.hex ? 'selected' : ''}" data-color="${c.hex}" aria-label="Color ${c.name}" style="background:${c.hex};"></button>`).join('')}
            </div>
          </div>
          <div style="margin: 8px 0; text-align:center;">
            <p class="wardrobe-label">Tamaño</p>
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
          <p class="wardrobe-label">Forma</p>
          <div id="shape-picker" class="shape-picker"></div>
        </div>
        <div class="glitter-intensity">
          <label for="glitter-intensity">Brillantina <output id="glitter-intensity-value">${PetState.glitterIntensity}%</output></label>
          <input id="glitter-intensity" type="range" min="0" max="100" value="${PetState.glitterIntensity}">
        </div>
      </section>
    `;
  },

  bindPetCustomization(content) {
    content.querySelectorAll('[data-color]').forEach(btn => {
      btn.onclick = () => { PetState.setColor(btn.dataset.color); this.renderMyPet(); };
    });
    const shapePicker = content.querySelector('#shape-picker');
    Catalogo.shapes.forEach(shape => {
      const isSelected = PetState.petShape === shape.id;
      const btn = document.createElement('button');
      btn.className = `card-btn shape-option ${isSelected ? 'selected' : ''}`;
      btn.setAttribute('aria-label', `Forma ${shape.name}`);
      // Muestra la forma de verdad: una copia chiquita de la mascota
      const muestra = document.createElement('span');
      muestra.className = 'shape-muestra';
      muestra.appendChild(Minigames.createMiniPet(34, { shape: shape.id, accessory: null }).el);
      const nombre = document.createElement('span');
      nombre.textContent = shape.name;
      btn.append(muestra, nombre);
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
      ${tituloPantalla('mipet', 'Mi Pet')}
      <div class="mypet-cabecera">
      <div id="mypet-preview" class="mypet-preview"></div>
      <div class="mypet-datos">
      <label class="mypet-name">Nombre
        <input id="mypet-name" type="text" maxlength="14" placeholder="Luna" autocomplete="off">
      </label>
      <button id="sonido-toggle" class="sonido-toggle" aria-pressed="${!AudioEffects.silenciado}">
        <span class="sonido-estado">${AudioEffects.silenciado ? 'Sonido apagado' : 'Sonido encendido'}</span>
        <span class="sonido-pista">Toca para ${AudioEffects.silenciado ? 'encenderlo' : 'apagarlo'}</span>
      </button>
      </div>
      </div>
      <div class="store-tabs" role="tablist" aria-label="Secciones de Mi Pet">
        <button class="store-tab ${tab === 'cuerpo' ? 'active' : ''}" data-tab="cuerpo">Cuerpo</button>
        <button class="store-tab ${tab === 'rasgos' ? 'active' : ''}" data-tab="rasgos">Rasgos</button>
        <button class="store-tab ${tab === 'personaje' ? 'active' : ''}" data-tab="personaje">Personaje</button>
      </div>
      ${tab === 'cuerpo' ? this.renderPetCustomization() : tab === 'rasgos' ? this.renderTraits() : this.renderPersonaje()}
      <p class="privacidad-enlace"><a href="privacidad.html" target="_blank" rel="noopener">Política de privacidad</a></p>
    `;
    content.querySelectorAll('.store-tab').forEach(btn => {
      btn.onclick = () => { this.myPetTab = btn.dataset.tab; this.renderMyPet(); };
    });
    this.refreshPetPreview();

    content.querySelector('#sonido-toggle').onclick = () => {
      const conSonido = AudioEffects.alternar();
      if (conSonido) AudioEffects.playCoin(); // confirma que ya suena
      this.renderMyPet();
    };

    // El nombre se guarda mientras se escribe, sin redibujar la ventana
    const nameInput = content.querySelector('#mypet-name');
    nameInput.value = PetState.petName;
    nameInput.oninput = () => PetState.setName(nameInput.value);

    if (tab === 'cuerpo') this.bindPetCustomization(content);
    else if (tab === 'rasgos') this.bindTraits(content);
    else this.bindPersonaje(content);
  },

  renderPersonaje() {
    return `
      <section class="pet-customization-panel" aria-label="Elegir personaje">
        <p class="wardrobe-label">Elegí tu personaje</p>
        <div class="personaje-grid"></div>
      </section>
    `;
  },

  bindPersonaje(content) {
    const grid = content.querySelector('.personaje-grid');
    Catalogo.species.forEach(especie => {
      const btn = document.createElement('button');
      const elegido = PetState.petSpecies === especie.id;
      btn.className = `personaje-card ${elegido ? 'selected' : ''} ${especie.disponible ? '' : 'proximamente'}`;
      btn.setAttribute('aria-label', especie.name + (especie.disponible ? '' : ' (próximamente)'));
      btn.setAttribute('aria-pressed', String(elegido));
      // Vista previa de la especie; la silueta se muestra aunque sea la de otro personaje
      const mini = Minigames.createMiniPet(84);
      const sprite = mini.el.querySelector('.pet-sprite');
      if (sprite && especie.disponible) sprite.classList.add(`species-${especie.id}`);
      const nombre = document.createElement('span');
      nombre.className = 'personaje-nombre';
      nombre.textContent = especie.name;
      const pista = document.createElement('span');
      pista.className = 'personaje-pista';
      pista.textContent = especie.disponible ? (elegido ? 'Tu personaje' : 'Elegir') : 'Pronto';
      btn.append(mini.el, nombre, pista);
      if (especie.disponible) {
        btn.onclick = () => { PetState.setSpecies(especie.id); this.renderMyPet(); };
      } else {
        btn.disabled = true;
      }
      grid.appendChild(btn);
    });
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
        <p class="wardrobe-label">Ojos</p>
        <div class="trait-row" data-kind="eyes"></div>
        <p class="wardrobe-label">Boca</p>
        <div class="trait-row" data-kind="mouth"></div>
        <p class="wardrobe-label">Mejillas</p>
        <div class="trait-row" data-kind="cheeks"></div>
      </section>
    `;
  },

  bindTraits(content) {
    const current = { eyes: PetState.petEyes, mouth: PetState.petMouth, cheeks: PetState.petCheeks };
    // Rasgos que ya no se ofrecen: si la mascota los tenía puestos, vuelve al primero disponible
    Object.keys(RASGOS_OCULTOS).forEach(kind => {
      if (!RASGOS_OCULTOS[kind].includes(current[kind])) return;
      const primero = Catalogo.traits[kind].find(o => !RASGOS_OCULTOS[kind].includes(o.id));
      PetState.setTrait(kind, primero.id);
      current[kind] = primero.id;
    });
    content.querySelectorAll('.trait-row').forEach(row => {
      const kind = row.dataset.kind;
      Catalogo.traits[kind].filter(o => !(RASGOS_OCULTOS[kind] || []).includes(o.id)).forEach(option => {
        const btn = document.createElement('button');
        btn.className = `trait-option ${current[kind] === option.id ? 'selected' : ''}`;
        btn.setAttribute('aria-label', option.name);
        // Cada opción muestra la cara de la mascota, ampliada, con ese rasgo
        const zoom = document.createElement('span');
        zoom.className = `trait-zoom trait-zoom-${kind}`;
        zoom.appendChild(Minigames.createMiniPet(92, { [kind]: option.id, accessory: null }).el);
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
      ${title}
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
      // Como en el vestidor: se toca la tarjeta y la elegida queda marcada
      card.className = `item-card tocable ${isEquipped ? 'selected' : ''}`;
      card.setAttribute('role', 'button');
      card.tabIndex = 0;
      card.setAttribute('aria-pressed', isEquipped ? 'true' : 'false');
      card.innerHTML = `
        ${this.renderIcon(item)}
        <span class="card-title">${item.name}</span>
        ${isEquipped ? `<span class="card-check">${ico('listo')}</span>` : ''}
      `;
      card.onclick = () => {
        if (isEquipped) return;
        PetState.equipItem(item.id);
        rerender();
      };
      container.appendChild(card);
    });

    // Escenarios: al final, una tarjeta que invita a la Tienda con lo que falta comprar
    if (category === 'bg') {
      const total = Catalogo.items.filter(i => i.category === 'bg').length;
      const faltan = total - PetState.inventory.filter(id => Catalogo.items.find(i => i.id === id)?.category === 'bg').length;
      if (faltan > 0) {
        const teaser = document.createElement('div');
        teaser.className = 'item-card tocable tienda-teaser';
        teaser.setAttribute('role', 'button');
        teaser.tabIndex = 0;
        teaser.setAttribute('data-action', 'tienda');
        teaser.innerHTML = `
          <span class="teaser-icono">${ico('tienda')}</span>
          <span class="card-title">${faltan === 1 ? '1 escenario más' : `${faltan} escenarios más`}</span>
          <span class="teaser-sub">Ir a la Tienda</span>
        `;
        container.appendChild(teaser);
      }
    }
  },

  renderScenery() {
    this.renderCollection(tituloPantalla('escenario', 'Escenario'), 'bg', () => this.renderScenery());
  },


  // Toque en una tarjeta de la tienda: pide confirmación antes de gastar,
  // porque ahora toda la tarjeta es tocable y se puede tocar sin querer.
  tocarItem(itemId) {
    const item = Catalogo.items.find(i => i.id === itemId);
    if (!item || PetState.inventory.includes(itemId)) return;
    if (item.price === 0 || PetState.coins < item.price) { this.buyItem(itemId); return; }
    Avisos.confirmar(`Cuesta ${item.price === 1 ? '1 moneda' : `${item.price} monedas`}.`, {
      titulo: `¿Comprar ${item.name}?`, icono: 'tienda', tinte: 'tienda', aceptar: 'Comprar'
    }).then(ok => { if (ok) this.buyItem(itemId); });
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
      const faltan = item.price - PetState.coins;
      Avisos.confirmar(`Te ${faltan === 1 ? 'falta 1 moneda' : `faltan ${faltan} monedas`} para ${item.name}. Puedes conseguirlas en los minijuegos.`, {
        titulo: 'Todavía no alcanza', icono: 'moneda', tinte: 'tienda', aceptar: 'Ir a jugar'
      }).then(ok => { if (ok) switchTab('minigames'); });
    }
  }
};
