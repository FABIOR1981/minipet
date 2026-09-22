const PetState = {
  coins: 100,
  happiness: 100,
  hunger: 100,
  energy: 100,
  isSick: false,
  isSleeping: false,
  inventory: [],
  equippedAccessory: 'bow_tie',

  init() {
    this.loadData();
    this.updateUI();
    setInterval(() => this.tick(), 8000);
  },

  updateUI() {
    document.getElementById('coin-count').innerText = this.coins;
    document.getElementById('happy-count').innerText = this.happiness;
    document.getElementById('hunger-count').innerText = this.hunger;
    document.getElementById('energy-count').innerText = this.energy;

    // Renderizar imagen del accesorio equipado
    const accessoryEl = document.getElementById('pet-accessory');
    accessoryEl.className = 'accessory';

    if (this.equippedAccessory) {
      const item = Store.items.find(i => i.id === this.equippedAccessory);
      if (item) {
        accessoryEl.innerHTML = `<img src="${item.image}" alt="${item.name}">`;
        accessoryEl.classList.add(`pos-${item.type}`);
      }
    } else {
      accessoryEl.innerHTML = '';
    }

    this.updateFaceAndThought();
  },

  updateFaceAndThought() {
    const face = document.getElementById('kawaii-face');
    const thought = document.getElementById('pet-thought');
    const extraProp = document.getElementById('extra-prop');
    
    face.className = 'kawaii-face';
    extraProp.innerText = '';

    if (this.isSleeping) {
      face.classList.add('sleeping');
      thought.innerText = '💤 Zzz... Descansando...';
      extraProp.innerText = '💤';
    } else if (this.isSick) {
      face.classList.add('sick');
      thought.innerText = '🥺 Me siento mal... ¿Me das medicina?';
      extraProp.innerText = '🌡️';
    } else if (this.hunger < 30) {
      face.classList.add('hungry');
      thought.innerText = '🍕 ¡Tengo hambre! ¡Comida rica!';
      extraProp.innerText = '💧';
    } else if (this.energy < 30) {
      face.classList.add('tired');
      thought.innerText = '😴 Tengo sueño... ¡A dormir!';
    } else if (this.happiness < 40) {
      face.classList.add('bored');
      thought.innerText = '🎮 ¿Jugamos un minijuego?';
    } else {
      face.classList.add('happy');
      thought.innerText = '❤️ ¡Me encanta estar contigo!';
    }
  },

  petPet() {
    if (this.isSleeping) return;
    this.happiness = Math.min(100, this.happiness + 10);
    const petEl = document.getElementById('pet');
    petEl.classList.add('happy-jump');
    setTimeout(() => petEl.classList.remove('happy-jump'), 500);
    
    AudioEffects.playTone(600, 'sine', 0.1);
    this.saveData();
    this.updateUI();
  },

  feed() {
    if (this.isSleeping) return;
    if (this.hunger >= 100) {
      alert('¡Tu mascota ya está pancita llena!');
      return;
    }
    this.hunger = Math.min(100, this.hunger + 30);
    AudioEffects.playEat();
    this.saveData();
    this.updateUI();
  },

  heal() {
    if (!this.isSick) {
      alert('¡Tu mascota no está enferma!');
      return;
    }
    this.isSick = false;
    this.happiness = Math.min(100, this.happiness + 20);
    AudioEffects.playHeal();
    this.saveData();
    this.updateUI();
  },

  sleep() {
    this.isSleeping = !this.isSleeping;
    if (this.isSleeping) {
      this.energy = 100;
      AudioEffects.playTone(300, 'sine', 0.3);
    }
    this.saveData();
    this.updateUI();
  },

  equipAccessory(itemId) {
    this.equippedAccessory = (this.equippedAccessory === itemId) ? null : itemId;
    AudioEffects.playTone(800, 'sine', 0.08);
    this.saveData();
    this.updateUI();
  },

  addCoins(amount) {
    this.coins += amount;
    if (amount > 0) AudioEffects.playCoin();
    this.saveData();
    this.updateUI();
  },

  tick() {
    if (this.isSleeping) {
      this.energy = Math.min(100, this.energy + 10);
      if (this.energy === 100) this.isSleeping = false;
    } else {
      this.hunger = Math.max(0, this.hunger - 3);
      this.happiness = Math.max(0, this.happiness - 2);
      this.energy = Math.max(0, this.energy - 2);

      if (!this.isSick && (this.hunger < 40 || this.happiness < 40) && Math.random() < 0.2) {
        this.isSick = true;
      }
    }
    this.saveData();
    this.updateUI();
  },

  saveData() {
    localStorage.setItem('virtualPetData', JSON.stringify({
      coins: this.coins,
      happiness: this.happiness,
      hunger: this.hunger,
      energy: this.energy,
      isSick: this.isSick,
      inventory: this.inventory,
      equippedAccessory: this.equippedAccessory
    }));
  },

  loadData() {
    const saved = localStorage.getItem('virtualPetData');
    if (saved) {
      const data = JSON.parse(saved);
      this.coins = data.coins ?? 100;
      this.happiness = data.happiness ?? 100;
      this.hunger = data.hunger ?? 100;
      this.energy = data.energy ?? 100;
      this.isSick = data.isSick ?? false;
      this.inventory = data.inventory || [];
      this.equippedAccessory = data.equippedAccessory || null;
    }
  }
};