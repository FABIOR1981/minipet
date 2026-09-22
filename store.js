const Store = {
  items: [
    // Accesorios
    { id: 'hat_crown', name: 'Corona Real', price: 50, image: 'img/accessories/hat_crown.svg', type: 'head', category: 'acc' },
    { id: 'party_hat', name: 'Gorro Fiesta', price: 25, image: 'img/accessories/party_hat.svg', type: 'head', category: 'acc' },
    { id: 'ribbon_pink', name: 'Lazo Rosado', price: 15, image: 'img/accessories/ribbon_pink.svg', type: 'head', category: 'acc' },
    { id: 'flower_pink', name: 'Flor Primavera', price: 18, image: 'img/accessories/flower_pink.svg', type: 'head', category: 'acc' },
    { id: 'pirate_hat', name: 'Gorro Pirata', price: 55, image: 'img/accessories/pirate_hat.svg', type: 'head', category: 'acc' },
    { id: 'wizard_hat', name: 'Gorro de Mago', price: 60, image: 'img/accessories/wizard_hat.svg', type: 'head', category: 'acc' },
    { id: 'chef_hat', name: 'Gorro de Chef', price: 35, image: 'img/accessories/chef_hat.svg', type: 'head', category: 'acc' },
    { id: 'glasses_cool', name: 'Lentes Corazón', price: 30, image: 'img/accessories/glasses_cool.svg', type: 'eyes', category: 'acc' },
    { id: 'star_glasses', name: 'Lentes Estrella', price: 35, image: 'img/accessories/star_glasses.svg', type: 'eyes', category: 'acc' },
    { id: 'headphones', name: 'Auriculares Gato', price: 40, image: 'img/accessories/headphones.svg', type: 'ears', category: 'acc' },
    { id: 'cat_ears', name: 'Orejitas Violeta', price: 45, image: 'img/accessories/cat_ears.svg', type: 'ears', category: 'acc' },
    { id: 'bunny_ears', name: 'Orejas Conejo', price: 40, image: 'img/accessories/bunny_ears.svg', type: 'ears', category: 'acc' },
    { id: 'bow_tie', name: 'Moño Coquette', price: 20, image: 'img/accessories/bow_tie.svg', type: 'neck', category: 'acc' },
    { id: 'magic_wand', name: 'Varita Mágica', price: 60, image: 'img/accessories/magic_wand.svg', type: 'neck', category: 'acc' },

    // Fondos / Escenarios Temáticos
    { id: 'bg_living', name: 'Sala de Estar', price: 0, image: '🛋️', type: 'bg', category: 'bg' },
    { id: 'bg_bedroom', name: 'Dormitorio', price: 40, image: '🛏️', type: 'bg', category: 'bg' },
    { id: 'bg_playroom', name: 'Sala de Juegos', price: 60, image: '🧸', type: 'bg', category: 'bg' },
    { id: 'bg_park', name: 'Parque Mágico', price: 80, image: '🌳', type: 'bg', category: 'bg' },
    { id: 'bg_beach', name: 'Playa Tropical', price: 50, image: '🏖️', type: 'bg', category: 'bg' }
  ],

  renderStore() {
    const content = document.getElementById('modal-content');
    content.innerHTML = `
      <h2 style="text-align:center; color:#6a1b9a;">🛍️ Tienda de Objetos</h2>
      <div class="grid-container"></div>
    `;
    
    const container = content.querySelector('.grid-container');
    
    this.items.forEach(item => {
      const isOwned = PetState.inventory.includes(item.id);
      const card = document.createElement('div');
      card.className = 'item-card';
      
      const iconHTML = item.category === 'bg' 
        ? `<span style="font-size: 2.2rem;">${item.image}</span>`
        : `<img src="${item.image}" class="card-icon" alt="${item.name}">`;

      card.innerHTML = `
        ${iconHTML}
        <span class="card-title">${item.name}</span>
        <span class="card-price">${item.price === 0 ? 'Gratis' : '🪙 ' + item.price}</span>
        <button onclick="Store.buyItem('${item.id}')" ${isOwned ? 'disabled' : ''} class="card-btn ${isOwned ? 'owned' : ''}">
          ${isOwned ? 'Comprado' : 'Comprar'}
        </button>
      `;
      container.appendChild(card);
    });
  },

  renderWardrobe() {
    const content = document.getElementById('modal-content');
    content.innerHTML = `
      <h2 style="text-align:center; color:#6a1b9a;">🎒 Mi Armario</h2>
      <div style="margin: 8px 0; text-align:center;">
        <p style="font-size:0.8rem; color:#666; margin-bottom:4px; font-weight:bold;">Color de Piel:</p>
        <div style="display:flex; justify-content:center; gap:10px;">
          <button onclick="PetState.setColor('#ff80ab')" style="width:28px; height:28px; border-radius:50%; background:#ff80ab; border:2px solid #fff; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.15);"></button>
          <button onclick="PetState.setColor('#b388ff')" style="width:28px; height:28px; border-radius:50%; background:#b388ff; border:2px solid #fff; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.15);"></button>
          <button onclick="PetState.setColor('#80cbc4')" style="width:28px; height:28px; border-radius:50%; background:#80cbc4; border:2px solid #fff; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.15);"></button>
        </div>
      </div>
      <hr style="border:none; border-top:1px solid #eee; margin:8px 0;">
      <div class="grid-container"></div>
    `;
    
    const container = content.querySelector('.grid-container');

    PetState.inventory.forEach(itemId => {
      const item = this.items.find(i => i.id === itemId);
      if (!item) return;

      const isEquipped = item.type === 'bg' 
        ? PetState.equippedBackground === item.id 
        : PetState.equippedAccessory === item.id;

      const card = document.createElement('div');
      card.className = 'item-card';

      const iconHTML = item.category === 'bg' 
        ? `<span style="font-size: 2.2rem;">${item.image}</span>`
        : `<img src="${item.image}" class="card-icon" alt="${item.name}">`;

      card.innerHTML = `
        ${iconHTML}
        <span class="card-title">${item.name}</span>
        <button onclick="PetState.equipItem('${item.id}'); Store.renderWardrobe();" class="card-btn ${isEquipped ? 'equipped' : ''}">
          ${isEquipped ? '✨ Usando' : 'Poner'}
        </button>
      `;
      container.appendChild(card);
    });
  },

  buyItem(itemId) {
    const item = this.items.find(i => i.id === itemId);
    if (item && (PetState.coins >= item.price || item.price === 0) && !PetState.inventory.includes(itemId)) {
      PetState.coins -= item.price;
      PetState.inventory.push(itemId);
      AudioEffects.playCoin();
      PetState.saveData();
      PetState.updateUI();
      this.renderStore();
    } else if (item && PetState.coins < item.price) {
      alert('¡No tienes suficientes monedas!');
    }
  }
};