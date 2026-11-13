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

  // Medidas de las ilustraciones de img/escenarios/ (400x480, con el piso
  // ocupando los 200 px de abajo). Sirven para saber dónde está el piso
  // en pantalla y dejar que la mascota camine por todo él.
  SCENE: { width: 400, height: 480, floor: 200 },

  // Cuánto se achica la mascota al llegar al fondo del piso (horizonte).
  // Adelante mide 1; en el medio, un valor intermedio.
  FAR_DEPTH: 0.72,

  // Punto del piso donde está parada: x = centro, t = 0 (fondo) a 1 (adelante).
  // Se guarda como proporción para que siga valiendo si cambia el tamaño
  // de la pantalla o de la mascota.
  walkPos: null,

  moveRandomly() {
    const petEl = document.getElementById('pet');
    if (!petEl) return;

    this.walkPos = { x: Math.random(), t: Math.random() };
    petEl.classList.add('walking');
    this.applyWalkPosition(true);

    setTimeout(() => {
      petEl.classList.remove('walking');
    }, 2500);
  },

  // Coloca la mascota y su sombra en el punto guardado en walkPos.
  // Zona caminable: todo el ancho de la habitación y todo el piso del
  // escenario, desde el horizonte hasta el borde de abajo. Cuanto más al
  // fondo, más chica se ve. Con walking = true el traslado dura lo que el
  // paseo; si no (cambio de tamaño, forma o pantalla) se acomoda enseguida.
  applyWalkPosition(walking = false) {
    const petEl = document.getElementById('pet');
    const roomEl = document.getElementById('pet-room');
    const shadowEl = document.getElementById('pet-shadow');
    if (!petEl || !roomEl || !this.walkPos) return;

    roomEl.style.setProperty('--walk-time', walking ? '2.5s' : '0.2s');

    const roomW = roomEl.clientWidth;
    const roomH = roomEl.clientHeight;
    const halfW = petEl.offsetWidth / 2;
    const halfH = petEl.offsetHeight / 2;
    const margin = 6;

    // El fondo usa background-size: cover anclado abajo, así que el piso
    // mide SCENE.floor por el factor de escala de la imagen.
    const bgScale = Math.max(roomW / this.SCENE.width, roomH / this.SCENE.height);
    const horizon = roomH - this.SCENE.floor * bgScale;

    const depth = this.FAR_DEPTH + (1 - this.FAR_DEPTH) * this.walkPos.t;
    const baseScale = parseFloat(getComputedStyle(petEl).getPropertyValue('--pet-scale')) || 1;
    const scale = baseScale * depth; // tamaño visible

    // Altura de los pies: de un poco debajo del horizonte al borde inferior,
    // sin dejar que la cabeza se salga por arriba en pantallas muy bajas
    const maxFeet = roomH - margin;
    const minFeet = Math.min(maxFeet, Math.max(horizon + 12, margin + 2 * halfH * scale));
    const feetY = minFeet + (maxFeet - minFeet) * this.walkPos.t;

    // Centro horizontal, dejando entrar a la mascota entera
    const minCenter = margin + halfW * scale;
    const maxCenter = Math.max(minCenter, roomW - margin - halfW * scale);
    const centerX = minCenter + (maxCenter - minCenter) * this.walkPos.x;

    // left/top son los de la caja sin escalar (la escala se aplica desde el centro)
    petEl.style.left = `${Math.round(centerX - halfW)}px`;
    petEl.style.top = `${Math.round(feetY - halfH * (1 + scale))}px`;
    petEl.style.scale = depth.toFixed(3);

    if (shadowEl) {
      shadowEl.style.left = `${Math.round(centerX)}px`;
      shadowEl.style.top = `${Math.round(feetY - 1)}px`;
      shadowEl.style.transform = `translate(-50%, -50%) scale(${scale.toFixed(3)})`;
      shadowEl.classList.add('visible');
    }
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

    // Si cambió el tamaño o la forma, la mantiene apoyada en el mismo punto del piso
    this.applyWalkPosition();

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
