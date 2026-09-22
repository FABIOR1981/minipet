const PetState = {
  coins: 100,
  happiness: 100,
  hunger: 100,
  energy: 100,
  petColor: '#ff80ab',
  isSick: false,
  isSleeping: false,
  inventory: ['bow_tie', 'bg_living'],
  equippedAccessory: 'bow_tie',
  equippedBackground: 'bg_living',
  dialogues: {},

  async init() {
    this.loadData();
    await this.loadDialogues();
    this.updateUI();
    setInterval(() => this.tick(), 8000);
  },

  async loadDialogues() {
    try {
      const response = await fetch('data/dialogues.json');
      this.dialogues = await response.json();
    } catch (e) {
      // Frases de respaldo por si falla la carga del JSON
      this.dialogues = {
        happy: ['❤️ ¡Me encanta estar contigo!', '✨ ¡Hoy es un día genial!', '🌸 ¡Eres mi persona favorita!'],
        hungry: ['🍕 ¡Tengo hambre! ¡Comida rica!', '🍗 Mmm... ¿Hay algo para picar?'],
        sick: ['🥺 Me siento mal... ¿Me das medicina?', '🤒 Me dolió la pancita...'],
        tired: ['😴 Tengo sueño... ¡A dormir!', '💤 Mis ojitos se cierran...'],
        bored: ['🎮 ¿Jugamos un minijuego?', '🎈 ¡Estoy aburrida! Vamos a jugar.'],
        sleeping: ['💤 Zzz... Descansando...', '🌙 Zzz... Soñando con caramelos...']
      };
    }
  },

  getRandomPhrase(category) {
    const list = this.dialogues[category] || ['❤️ ¡Hola!'];
    const index = Math.floor(Math.random() * list.length);
    return list[index];
  },

  updateUI() {
    document.getElementById('coin-count').innerText = this.coins;
    document.getElementById('happy-count').innerText = this.happiness;
    document.getElementById('hunger-count').innerText = this.hunger;
    document.getElementById('energy-count').innerText = this.energy;

    // Aplicar color de piel
    const petEl = document.getElementById('pet');
    if (petEl) petEl.style.backgroundColor = this.petColor;

    // Aplicar Fondo de Habitación
    const roomEl = document.getElementById('pet-room');
    if (roomEl) {
      roomEl.className = `room ${this.equippedBackground}`;
    }

    // Renderizar Accesorio Equipado
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
    
    if (!face || !thought) return;

    face.className = 'kawaii-face';
    extraProp.innerText = '';

    if (this.isSleeping) {
      face.classList.add('sleeping');
      thought.innerText = this.getRandomPhrase('sleeping');
      extraProp.innerText = '💤';
    } else if (this.isSick) {
      face.classList.add('sick');
      thought.innerText = this.getRandomPhrase('sick');
      extraProp.innerText = '🌡️';
    } else if (this.hunger < 30) {
      face.classList.add('hungry');
      thought.innerText = this.getRandomPhrase('hungry');
      extraProp.innerText = '💧';
    } else if (this.energy < 30) {
      face.classList.add('tired');
      thought.innerText = this.getRandomPhrase('tired');
    } else if (this.happiness < 40) {
      face.classList.add('bored');
      thought.innerText = this.getRandomPhrase('bored');
    } else {
      face.classList.add('happy');
      thought.innerText = this.getRandomPhrase('happy');
    }
  },

  petPet() {
    if (this.isSleeping) return;
    this.happiness = Math.min(100, this.happiness + 10);
    const petEl = document.getElementById('pet');
    petEl.classList.add('happy-jump');
    setTimeout(() => petEl.classList.remove('happy-jump'), 500);

    // Animación de corazones flotantes
    for (let i = 0; i < 3; i++) {
      const heart = document.createElement('div');
      heart.className = 'heart-particle';
      heart.innerText = '❤️';
      const offsetX = (Math.random() - 0.5) * 60;
      heart.style.setProperty('--dx', `${offsetX}px`);
      heart.style.left = `calc(50% + ${offsetX / 2}px)`;
      heart.style.top = '10px';
      petEl.appendChild(heart);
      setTimeout(() => heart.remove(), 800);
    }

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

  setColor(color) {
    this.petColor = color;
    this.saveData();
    this.updateUI();
  },

  equipItem(itemId) {
    const item = Store.items.find(i => i.id === itemId);
    if (!item) return;

    if (item.type === 'bg') {
      this.equippedBackground = (this.equippedBackground === itemId) ? 'bg_living' : itemId;
    } else {
      this.equippedAccessory = (this.equippedAccessory === itemId) ? null : itemId;
    }

    AudioEffects.playTone(800, 'sine', 0.08);
    this.saveData();
    this.updateUI();
  },

  addCoins(amount) {
    this.coins += amount;
    if (amount > 0) {
      this.happiness = Math.min(100, this.happiness + 15);
      AudioEffects.playCoin();
    }
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
      petColor: this.petColor,
      isSick: this.isSick,
      inventory: this.inventory,
      equippedAccessory: this.equippedAccessory,
      equippedBackground: this.equippedBackground
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
      this.petColor = data.petColor || '#ff80ab';
      this.isSick = data.isSick ?? false;
      this.inventory = data.inventory || ['bow_tie', 'bg_living'];
      this.equippedAccessory = data.equippedAccessory || null;
      this.equippedBackground = data.equippedBackground || 'bg_living';
    }
  }
};