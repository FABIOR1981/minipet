const Store = {
  items: [
    { id: 'hat_crown', name: 'Corona Real', price: 50, image: 'img/accessories/hat_crown.svg', type: 'head' },
    { id: 'glasses_cool', name: 'Lentes Corazón', price: 30, image: 'img/accessories/glasses_cool.svg', type: 'eyes' },
    { id: 'bow_tie', name: 'Moño Coquette', price: 20, image: 'img/accessories/bow_tie.svg', type: 'neck' },
    { id: 'party_hat', name: 'Gorro Fiesta', price: 25, image: 'img/accessories/party_hat.svg', type: 'head' },
    { id: 'headphones', name: 'Auriculares Gato', price: 40, image: 'img/accessories/headphones.svg', type: 'ears' },
    { id: 'magic_wand', name: 'Varita Mágica', price: 60, image: 'img/accessories/magic_wand.svg', type: 'neck' },
    // Nuevos Accesorios
    { id: 'ribbon_pink', name: 'Lazo Rosado', price: 15, image: 'img/accessories/ribbon_pink.svg', type: 'head' },
    { id: 'star_glasses', name: 'Lentes Estrella', price: 35, image: 'img/accessories/star_glasses.svg', type: 'eyes' },
    { id: 'flower_pink', name: 'Flor Primavera', price: 18, image: 'img/accessories/flower_pink.svg', type: 'head' },
    { id: 'cat_ears', name: 'Orejitas Violeta', price: 45, image: 'img/accessories/cat_ears.svg', type: 'ears' }
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
    content.innerHTML = `
      <h2>🎒 Mi Armario</h2>
      <div style="margin: 10px 0;">
        <p style="font-size:0.85rem; color:#666; margin-bottom:6px;">Color de Mascota:</p>
        <div style="display:flex; gap:10px;">
          <button onclick="PetState.setColor('#ff80ab')" style="width:32px; height:32px; border-radius:50%; background:#ff80ab; border:2px solid #fff; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.15);"></button>
          <button onclick="PetState.setColor('#b388ff')" style="width:32px; height:32px; border-radius:50%; background:#b388ff; border:2px solid #fff; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.15);"></button>
          <button onclick="PetState.setColor('#80cbc4')" style="width:32px; height:32px; border-radius:50%; background:#80cbc4; border:2px solid #fff; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.15);"></button>
        </div>
      </div>
      <hr style="border:none; border-top:1px solid #eee; margin:10px 0;">
      <p style="font-size:0.85rem; color:#666;">Accesorios:</p>
      <div class="wardrobe-list" style="margin-top:10px;"></div>
    `;
    
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