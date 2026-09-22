const Store = {
  items: [
    // Sombreros y Cabeza
    { id: 'hat_crown', name: 'Corona Real', price: 50, image: 'img/accessories/hat_crown.svg', type: 'head' },
    { id: 'party_hat', name: 'Gorro Fiesta', price: 25, image: 'img/accessories/party_hat.svg', type: 'head' },
    { id: 'ribbon_pink', name: 'Lazo Rosado', price: 15, image: 'img/accessories/ribbon_pink.svg', type: 'head' },
    { id: 'flower_pink', name: 'Flor Primavera', price: 18, image: 'img/accessories/flower_pink.svg', type: 'head' },
    { id: 'pirate_hat', name: 'Gorro Pirata', price: 55, image: 'img/accessories/pirate_hat.svg', type: 'head' },
    { id: 'wizard_hat', name: 'Gorro de Mago', price: 60, image: 'img/accessories/wizard_hat.svg', type: 'head' },
    { id: 'chef_hat', name: 'Gorro de Chef', price: 35, image: 'img/accessories/chef_hat.svg', type: 'head' },

    // Lentes y Ojos
    { id: 'glasses_cool', name: 'Lentes Corazón', price: 30, image: 'img/accessories/glasses_cool.svg', type: 'eyes' },
    { id: 'star_glasses', name: 'Lentes Estrella', price: 35, image: 'img/accessories/star_glasses.svg', type: 'eyes' },

    // Orejas
    { id: 'headphones', name: 'Auriculares Gato', price: 40, image: 'img/accessories/headphones.svg', type: 'ears' },
    { id: 'cat_ears', name: 'Orejitas Violeta', price: 45, image: 'img/accessories/cat_ears.svg', type: 'ears' },
    { id: 'bunny_ears', name: 'Orejas de Conejo', price: 40, image: 'img/accessories/bunny_ears.svg', type: 'ears' },

    // Cuello y Objetos
    { id: 'bow_tie', name: 'Moño Coquette', price: 20, image: 'img/accessories/bow_tie.svg', type: 'neck' },
    { id: 'magic_wand', name: 'Varita Mágica', price: 60, image: 'img/accessories/magic_wand.svg', type: 'neck' }
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
      card.innerHTML = `
        <img src="${item.image}" class="card-icon" alt="${item.name}">
        <span class="card-title">${item.name}</span>
        <span class="card-price">🪙 ${item.price}</span>
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
      <div style="margin: 10px 0; text-align:center;">
        <p style="font-size:0.85rem; color:#666; margin-bottom:6px; font-weight:bold;">Color de Mascota:</p>
        <div style="display:flex; justify-content:center; gap:12px;">
          <button onclick="PetState.setColor('#ff80ab')" style="width:32px; height:32px; border-radius:50%; background:#ff80ab; border:2px solid #fff; cursor:pointer; box-shadow:0 2px 5px rgba(0,0,0,0.2);"></button>
          <button onclick="PetState.setColor('#b388ff')" style="width:32px; height:32px; border-radius:50%; background:#b388ff; border:2px solid #fff; cursor:pointer; box-shadow:0 2px 5px rgba(0,0,0,0.2);"></button>
          <button onclick="PetState.setColor('#80cbc4')" style="width:32px; height:32px; border-radius:50%; background:#80cbc4; border:2px solid #fff; cursor:pointer; box-shadow:0 2px 5px rgba(0,0,0,0.2);"></button>
        </div>
      </div>
      <hr style="border:none; border-top:1px solid #eee; margin:10px 0;">
      <p style="font-size:0.85rem; color:#666; text-align:center; font-weight:bold; margin-bottom:8px;">Mis Accesorios:</p>
      <div class="grid-container"></div>
    `;
    
    const container = content.querySelector('.grid-container');
    
    if (PetState.inventory.length === 0) {
      container.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#888; margin-top:20px;">¡Tu armario está vacío! Ve a la tienda a comprar accesorios.</p>';
      return;
    }

    PetState.inventory.forEach(itemId => {
      const item = this.items.find(i => i.id === itemId);
      if (!item) return;

      const isEquipped = PetState.equippedAccessory === item.id;
      const card = document.createElement('div');
      card.className = 'item-card';
      card.innerHTML = `
        <img src="${item.image}" class="card-icon" alt="${item.name}">
        <span class="card-title">${item.name}</span>
        <button onclick="PetState.equipAccessory('${item.id}'); Store.renderWardrobe();" class="card-btn ${isEquipped ? 'equipped' : ''}">
          ${isEquipped ? '✨ Quitar' : 'Poner'}
        </button>
      `;
      container.appendChild(card);
    });
  },

  buyItem(itemId) {
    const item = this.items.find(i => i.id === itemId);
    if (item && PetState.coins >= item.price && !PetState.inventory.includes(itemId)) {
      PetState.coins -= item.price;
      PetState.inventory.push(itemId);
      AudioEffects.playCoin();
      PetState.saveData();
      PetState.updateUI();
      this.renderStore();
    } else if (item && PetState.coins < item.price) {
      alert('¡No tienes suficientes monedas! Juega minijuegos para ganar más.');
    }
  }
};