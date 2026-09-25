const PetState = {
  coins: 500,
  happiness: 100,
  hunger: 100,
  energy: 100,
  petColor: '#ff80ab',
  petShape: 'shape-circle',
  petSize: 'medium',
  glitterEnabled: false,
  glitterIntensity: 0,
  isSick: false,
  isSleeping: false,
  inventory: ['bow_tie', 'bg_living'],
  equippedAccessory: 'bow_tie',
  equippedBackground: 'bg_living',
  looks: [],
  dialogues: {},

  async init() {
    this.loadData();
    await this.loadDialogues();
    this.updateUI();
    setInterval(() => this.tick(), 8000);
    this.startWandering();
  },

  async loadDialogues() {
    try {
      const response = await fetch('data/dialogues.json');
      this.dialogues = await response.json();
    } catch (e) {
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

  getDialogue(key, fallback) {
    return this.dialogues.alerts?.[key] || fallback;
  },

  showDialogue(message) {
    const thought = document.getElementById('pet-thought');
    if (!thought) return;
    thought.innerText = message;
    clearTimeout(this.dialogueTimeout);
    this.dialogueTimeout = setTimeout(() => this.updateFaceAndThought(), 3000);
  },

  startWandering() {
    clearInterval(this.wanderingTimer);
    this.moveRandomly();
    this.wanderingTimer = setInterval(() => {
      // Solo se mueve si NO está durmiendo ni enferma
      if (!this.isSleeping && !this.isSick) {
        this.moveRandomly();
      }
    }, 5000);
  },

  moveRandomly() {
    const petEl = document.getElementById('pet');
    const roomEl = document.getElementById('pet-room');
    if (!petEl || !roomEl) return;

    const roomWidth = roomEl.clientWidth;
    const petWidth = petEl.offsetWidth;
    const minX = 20;
    const maxX = Math.max(minX, roomWidth - petWidth - 20);

    const targetX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;

    petEl.classList.add('walking');
    petEl.style.left = `${targetX}px`;

    setTimeout(() => {
      petEl.classList.remove('walking');
    }, 2500);
  },

  updateUI() {
    document.getElementById('coin-count').innerText = this.coins;
    document.getElementById('happy-count').innerText = this.happiness;
    document.getElementById('hunger-count').innerText = this.hunger;
    document.getElementById('energy-count').innerText = this.energy;

    const petEl = document.getElementById('pet');
    if (petEl) {
      petEl.style.backgroundColor = this.petColor;
      // currentColor: lo usan las formas decorativas (orejitas, nube, corazón)
      petEl.style.color = this.petColor;
      // No pisa 'walking'/'happy-jump' u otras clases temporales que ya tenga el elemento
      petEl.className = petEl.className.replace(/\bshape-\S+/g, '').trim();
      petEl.classList.add(this.petShape || 'shape-circle');
      petEl.className = petEl.className.replace(/\bsize-\S+/g, '').trim();
      petEl.classList.add(`size-${this.petSize || 'medium'}`);
      const glitterEl = document.getElementById('pet-glitter');
      if (glitterEl) {
        glitterEl.classList.toggle('enabled', this.glitterIntensity > 0);
        glitterEl.style.setProperty('--glitter-opacity', (0.1 + this.glitterIntensity / 100 * 0.9).toFixed(2));
      }
    }

    const roomEl = document.getElementById('pet-room');
    if (roomEl) {
      roomEl.className = `room ${this.equippedBackground}`;
    }

    if (typeof Particles !== 'undefined') {
      Particles.render(this.equippedBackground);
    }

    const accessoryEl = document.getElementById('pet-accessory');
    accessoryEl.className = 'accessory';
    accessoryEl.style.cssText = '';

    if (this.equippedAccessory) {
      const item = Store.items.find(i => i.id === this.equippedAccessory);
      if (item) {
        accessoryEl.innerHTML = `<img src="${item.image}" alt="${item.name}">`;
        accessoryEl.classList.add(`pos-${item.type}`);
        accessoryEl.classList.add(`item-${item.id}`);
        const fit = Store.accessoryFits?.[item.id];
        if (fit) {
          const accessoryImg = accessoryEl.querySelector('img');
          accessoryImg.style.setProperty('--accessory-scale', fit.scale);
          accessoryImg.style.setProperty('--accessory-y', `${fit.y}px`);
          accessoryImg.style.setProperty('--accessory-x', `${fit.x || 0}px`);
          accessoryImg.style.setProperty('--accessory-rotate', `${fit.rotate || 0}deg`);
        }
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
      this.showDialogue(this.getDialogue('full', 'No preciso comer ahora.'));
      return;
    }
    this.hunger = Math.min(100, this.hunger + 30);
    AudioEffects.playEat();
    this.saveData();
    this.updateUI();
  },

  heal() {
    if (!this.isSick) {
      this.showDialogue(this.getDialogue('healthy', 'No preciso un doctor ahora.'));
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
    
    // Si se duerme, quita la animación de caminar de inmediato
    const petEl = document.getElementById('pet');
    if (petEl) petEl.classList.remove('walking');

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

  setShape(shapeId) {
    this.petShape = shapeId;
    AudioEffects.playTone(700, 'sine', 0.1);
    this.saveData();
    this.updateUI();
  },

  setSize(size) {
    if (!['small', 'medium', 'large'].includes(size)) return;
    this.petSize = size;
    AudioEffects.playTone(700, 'sine', 0.1);
    this.saveData();
    this.updateUI();
  },

  setGlitterIntensity(intensity) {
    this.glitterIntensity = Math.max(0, Math.min(100, Number(intensity) || 0));
    this.glitterEnabled = this.glitterIntensity > 0;
    this.saveData();
    this.updateUI();
  },

  setGlitterEnabled(enabled) {
    this.glitterEnabled = Boolean(enabled);
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

  // Guarda la combinación actual (accesorio + fondo + color) como un "look".
  // Máximo 6 guardados: al superar el límite se descarta el más viejo.
  saveLook(name) {
    if (!this.looks) this.looks = [];
    const look = {
      id: 'look_' + Date.now(),
      name: (name && name.length > 0) ? name : `Look ${this.looks.length + 1}`,
      accessory: this.equippedAccessory,
      background: this.equippedBackground,
      color: this.petColor
    };
    this.looks.push(look);
    if (this.looks.length > 6) this.looks.shift();
    AudioEffects.playCoin();
    this.saveData();
  },

  applyLook(lookId) {
    const look = (this.looks || []).find(l => l.id === lookId);
    if (!look) return;
    this.equippedAccessory = look.accessory;
    this.equippedBackground = look.background;
    this.petColor = look.color;
    AudioEffects.playTone(800, 'sine', 0.08);
    this.saveData();
    this.updateUI();
  },

  deleteLook(lookId) {
    this.looks = (this.looks || []).filter(l => l.id !== lookId);
    this.saveData();
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
      this.happiness = Math.max(0, this.happiness - 3);
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
      petShape: this.petShape,
      petSize: this.petSize,
      glitterEnabled: this.glitterEnabled,
      glitterIntensity: this.glitterIntensity,
      isSick: this.isSick,
      inventory: this.inventory,
      equippedAccessory: this.equippedAccessory,
      equippedBackground: this.equippedBackground,
      looks: this.looks
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
      this.petShape = data.petShape || 'shape-circle';
      this.petSize = ['small', 'medium', 'large'].includes(data.petSize) ? data.petSize : 'medium';
      const savedGlitterIntensity = data.glitterIntensity ?? (data.glitterEnabled ? 50 : 0);
      this.glitterIntensity = Math.max(0, Math.min(100, Number(savedGlitterIntensity)));
      this.glitterEnabled = this.glitterIntensity > 0;
      this.isSick = data.isSick ?? false;
      this.inventory = data.inventory || ['bow_tie', 'bg_living'];
      this.equippedAccessory = data.equippedAccessory || null;
      this.equippedBackground = data.equippedBackground || 'bg_living';
      this.looks = data.looks || [];
    }
  }
};