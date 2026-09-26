// =========================================================
// MASCOTA-VISUAL.JS — Todo lo que dibuja o mueve a la mascota
// en pantalla: pintar stats/forma/color/accesorio (updateUI),
// rostro y globo de diálogo, la animación de acariciar (petPet)
// y el paseo autónomo por la habitación. Se agrega al mismo
// objeto PetState (definido en mascota-estado.js) vía
// Object.assign, así que debe cargarse después de ese archivo.
// =========================================================
Object.assign(PetState, {
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
      const item = Catalogo.items.find(i => i.id === this.equippedAccessory);
      if (item) {
        accessoryEl.innerHTML = `<img src="${item.image}" alt="${item.name}">`;
        accessoryEl.classList.add(`pos-${item.type}`);
        accessoryEl.classList.add(`item-${item.id}`);
        const fit = Catalogo.accessoryFits?.[item.id];
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
  }
});
