// =========================================================
// MASCOTA-ESTADO.JS — Datos de la mascota (stats, inventario,
// looks, diálogos) y todo lo que los modifica: acciones (comer,
// dormir, medicina), setters de personalización, persistencia
// en localStorage y el decaimiento periódico (tick).
// mascota-visual.js agrega a este mismo objeto PetState los
// métodos de renderizado y movimiento vía Object.assign.
// =========================================================
// Modo prueba: abrir el juego con ?prueba en la URL (por ejemplo
// https://minipetkw.netlify.app/?prueba). Usa una partida aparte, que no
// toca la partida real, y siempre arranca con monedas de sobra para poder
// comprar y probar todo. Con ?prueba=reiniciar esa partida empieza de cero.
const PARAMETRO_PRUEBA = new URLSearchParams(window.location.search).get('prueba');

const PetState = {
  testMode: PARAMETRO_PRUEBA !== null,
  TEST_COINS: 99999,
  STORAGE_KEY: PARAMETRO_PRUEBA !== null ? 'virtualPetDataPrueba' : 'virtualPetData',

  coins: 500, // Monedas iniciales de una partida nueva
  happiness: 100,
  hunger: 100,
  energy: 100,
  petColor: '#ff80ab',
  // Rasgos de la cara (ids de Catalogo.traits)
  petEyes: 'round',
  petMouth: 'cat',
  petCheeks: 'round',
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
    if (this.testMode) {
      const badge = document.getElementById('test-badge');
      if (badge) badge.hidden = false;
    }
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
        hungry: ['🍕 ¡Es hora de comer algo rico!', '🍗 Mmm... ¿Hay algo para picar?'],
        sick: ['🥺 ¿Me das una medicina para sentirme mejor?', '💊 ¡Es hora de mi medicina!'],
        tired: ['😴 ¡Es hora de dormir!', '💤 ¡Una siesta me vendría genial!'],
        bored: ['🎮 ¿Jugamos un minijuego?', '🎈 ¡Tengo ganas de jugar! ¿Vamos?'],
        sleeping: ['💤 Zzz... Descansando...', '🌙 Zzz... Soñando con caramelos...']
      };
    }
  },

  feed() {
    if (this.isSleeping) return;
    if (this.hunger >= 100) {
      this.showDialogue(this.getDialogue('full', '¡Gracias! Ya tengo la pancita llena.'));
      return;
    }
    const before = this.hunger;
    this.hunger = Math.min(100, this.hunger + 30);
    AudioEffects.playEat();
    this.saveData();
    this.updateUI();
    this.showEating();
    this.floatText(`+${this.hunger - before} 🍕`);
  },

  heal() {
    if (!this.isSick) {
      this.showDialogue(this.getDialogue('healthy', '¡Me siento de maravilla!'));
      return;
    }
    this.isSick = false;
    const before = this.happiness;
    this.happiness = Math.min(100, this.happiness + 20);
    AudioEffects.playHeal();
    this.saveData();
    this.updateUI();
    this.burst(['💚', '✨', '💊', '✨']);
    this.floatText(this.happiness > before ? `+${this.happiness - before} ❤️` : '¡Curada! 💚');
  },

  sleep() {
    if (!this.isSleeping && this.energy >= 100) {
      this.showDialogue(this.getDialogue('rested', '¡Estoy con toda la energía!'));
      return;
    }
    // Alterna dormir/despertar. La energía se recupera de a poco en
    // tick() mientras duerme, y se despierta sola al llegar a 100.
    this.isSleeping = !this.isSleeping;
    
    // Si se duerme, quita la animación de caminar de inmediato
    const petEl = document.getElementById('pet');
    if (petEl) petEl.classList.remove('walking');

    if (this.isSleeping) {
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

  // Cambia un rasgo de la cara: kind es 'eyes', 'mouth' o 'cheeks'
  setTrait(kind, id) {
    const field = { eyes: 'petEyes', mouth: 'petMouth', cheeks: 'petCheeks' }[kind];
    if (!field || !Catalogo.traits[kind].some(option => option.id === id)) return;
    this[field] = id;
    AudioEffects.playTone(700, 'sine', 0.1);
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
    const item = Catalogo.items.find(i => i.id === itemId);
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
    const datos = JSON.stringify({
      coins: this.coins,
      happiness: this.happiness,
      hunger: this.hunger,
      energy: this.energy,
      petColor: this.petColor,
      petEyes: this.petEyes,
      petMouth: this.petMouth,
      petCheeks: this.petCheeks,
      petShape: this.petShape,
      petSize: this.petSize,
      glitterEnabled: this.glitterEnabled,
      glitterIntensity: this.glitterIntensity,
      isSick: this.isSick,
      inventory: this.inventory,
      equippedAccessory: this.equippedAccessory,
      equippedBackground: this.equippedBackground,
      looks: this.looks
    });
    try {
      localStorage.setItem(this.STORAGE_KEY, datos);
    } catch (e) {
      // Sin almacenamiento disponible (modo privado, cuota llena): se sigue jugando sin guardar
    }
  },

  loadData() {
    // Si el guardado está dañado o no se puede leer, se arranca con los
    // valores por defecto en vez de dejar el juego sin iniciar.
    let data = null;
    try {
      if (PARAMETRO_PRUEBA === 'reiniciar') {
        localStorage.removeItem(this.STORAGE_KEY);
        localStorage.removeItem('minipetBestScoresPrueba');
      }
      data = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
    } catch (e) {
      console.warn('No se pudo leer la partida guardada; se usan los valores iniciales.', e);
    }
    if (data && typeof data === 'object') {
      this.coins = data.coins ?? this.coins;
      this.happiness = data.happiness ?? 100;
      this.hunger = data.hunger ?? 100;
      this.energy = data.energy ?? 100;
      this.petColor = data.petColor || '#ff80ab';
      this.petEyes = data.petEyes || 'round';
      this.petMouth = data.petMouth || 'cat';
      this.petCheeks = data.petCheeks || 'round';
      this.petShape = data.petShape || 'shape-circle';
      this.petSize = ['small', 'medium', 'large'].includes(data.petSize) ? data.petSize : 'medium';
      const savedGlitterIntensity = data.glitterIntensity ?? (data.glitterEnabled ? 50 : 0);
      this.glitterIntensity = Math.max(0, Math.min(100, Number(savedGlitterIntensity)));
      this.glitterEnabled = this.glitterIntensity > 0;
      this.isSick = data.isSick ?? false;
      this.inventory = Array.isArray(data.inventory) ? data.inventory : ['bow_tie', 'bg_living'];
      this.equippedAccessory = data.equippedAccessory || null;
      this.equippedBackground = data.equippedBackground || 'bg_living';
      this.looks = Array.isArray(data.looks) ? data.looks : [];
    }

    // En modo prueba siempre hay monedas de sobra
    if (this.testMode) this.coins = Math.max(this.coins, this.TEST_COINS);
  }
};
