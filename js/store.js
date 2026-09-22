const Store = {
  items: [
    { id: 'hat_crown', name: 'Corona Real', price: 50, image: 'img/accessories/hat_crown.svg', type: 'head' },
    { id: 'glasses_cool', name: 'Lentes Kawaii', price: 30, image: 'img/accessories/glasses_cool.svg', type: 'eyes' },
    { id: 'bow_tie', name: 'Moño Coquette', price: 20, image: 'img/accessories/bow_tie.svg', type: 'neck' },
    { id: 'party_hat', name: 'Gorro Fiesta', price: 25, image: 'img/accessories/party_hat.svg', type: 'head' },
    { id: 'headphones', name: 'Auriculares Gato', price: 40, image: 'img/accessories/headphones.svg', type: 'ears' },
    { id: 'magic_wand', name: 'Varita Mágica', price: 60, image: 'img/accessories/magic_wand.svg', type: 'neck' }
  ],

  renderStore() {
    const content = document.getElementById('modal-content');
    content.innerHTML = '<h2>🛍️ Tienda de Objetos</h2><div class="store-list" style="margin-top:15px;"></div>';
    
    const list = content.querySelector('.store-list');
    
    this.items.forEach(item => {
      const isOwned = PetState.inventory.includes(item.id);
      const card = document.createElement('div');
      card.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:10px 8px; border-bottom:1px solid #eee;';
      card.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px;">
          <img src="${item.image}" class="store-icon" alt="${item.name}">
          <span style="font-size:0.95rem; font-weight:600;">${item.name} - 🪙 ${item.price}</span>
        </div>
        <button onclick="Store.buyItem('${item.id}')" ${isOwned ? 'disabled' : ''} style="padding:6px 12px; border-radius:8px; border:none; background:${isOwned ? '#ccc' : '#7e57c2'}; color:white; font-weight:bold; cursor:pointer;">
          ${isOwned ? 'Comprado' : 'Comprar'}
        </button>
      `;
      list.appendChild(card);
    });
  },

  renderWardrobe() {
    const content = document.getElementById('modal-content');
    content.innerHTML = '<h2>🎒 Mi Armario</h2><p style="font-size:0.85rem; color:#666; margin-top:4px;">Selecciona para equipar o quitar</p><div class="wardrobe-list" style="margin-top:15px;"></div>';
    
    const list = content.querySelector('.wardrobe-list');
    
    if (PetState.inventory.length === 0) {
      list.innerHTML = '<p style="margin-top:20px; color:#888;">¡Tu armario está vacío! Ve a la tienda a comprar accesorios.</p>';
      return;
    }

    PetState.inventory.forEach(itemId => {
      const item = this.items.find(i => i.id === itemId);
      if (!item) return;

      const isEquipped = PetState.equippedAccessory === item.id;
      const card = document.createElement('div');
      card.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:10px 8px; border-bottom:1px solid #eee;';
      card.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px;">
          <img src="${item.image}" class="store-icon" alt="${item.name}">
          <span style="font-size:0.95rem; font-weight:600;">${item.name}</span>
        </div>
        <button onclick="PetState.equipAccessory('${item.id}'); Store.renderWardrobe();" style="padding:6px 12px; border-radius:8px; border:none; background:${isEquipped ? '#ff4081' : '#b388ff'}; color:white; font-weight:bold; cursor:pointer;">
          ${isEquipped ? '✨ Quitar' : 'Poner'}
        </button>
      `;
      list.appendChild(card);
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