import { Avisos } from './avisos.js';
import { Catalogo } from './catalogo.js';
import { Staff } from './staff.js';
import { AudioEffects } from './sonidos.js';
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
export const PARAMETRO_PRUEBA = new URLSearchParams(window.location.search).get('prueba');

// Versión del formato de guardado (localStorage). Si cambia la estructura de
// los datos, se sube este número y se agrega una migración en MIGRACIONES:
// cada una pasa un guardado de la versión N a la N+1.
export const VERSION_GUARDADO = 1;
export const MIGRACIONES = {
  // 0 -> 1: los guardados anteriores no tenían el campo `version`. Los datos son los mismos.
  0: (datos) => datos,
};

// Devuelve los datos listos para la versión actual, o null si el guardado es
// de una versión más nueva (no se sabe leerlo y no se debe pisar).
export function migrarGuardado(datos) {
  let version = Number.isInteger(datos.version) ? datos.version : 0;
  if (version > VERSION_GUARDADO) return null;
  let actual = datos;
  while (version < VERSION_GUARDADO) {
    actual = MIGRACIONES[version](actual);
    version++;
  }
  return actual;
}

export const PetState = {
  testMode: PARAMETRO_PRUEBA !== null,
  TEST_COINS: 99999,
  STORAGE_KEY: PARAMETRO_PRUEBA !== null ? 'virtualPetDataPrueba' : 'virtualPetData',

  coins: 500, // Monedas iniciales de una partida nueva
  happiness: 100,
  hunger: 100,
  energy: 100,
  petName: '', // Nombre que le pone el usuario (puede quedar vacío)
  petColor: '#ff80ab',
  // Rasgos de la cara (ids de Catalogo.traits)
  petEyes: 'round',
  petMouth: 'cat',
  petCheeks: 'round',
  petShape: 'shape-circle',
  // Personaje elegido (ver Catalogo.species). Cambia la silueta, no la forma elegida en Mi Pet
  petSpecies: 'mochi',
  petSize: 'medium',
  glitterEnabled: false,
  avisoGuardadoMostrado: false,
  guardadoBloqueado: false, // true si hay un guardado de una versión más nueva
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
        happy: ['❤️ Me gusta estar contigo.', '✨ Hoy me siento muy bien.', '🌸 Eres mi persona favorita.'],
        hungry: ['🍕 Es hora de comer algo rico.', '🍗 Mmm... ¿hay algo para picar?'],
        sick: ['🥺 ¿Me das una medicina para sentirme mejor?', '💊 Es hora de mi medicina.'],
        tired: ['😴 Es hora de dormir.', '💤 Una siesta me vendría bien.'],
        bored: ['🎮 ¿Jugamos un minijuego?', '🎈 Tengo ganas de jugar. ¿Vamos?'],
        sleeping: ['💤 Zzz... Descansando...', '🌙 Zzz... Soñando con caramelos...']
      };
    }
  },

  feed() {
    if (this.isSleeping) return;
    if (this.hunger >= 100) {
      this.showDialogue(this.getDialogue('full', 'Gracias, ya tengo la pancita llena.'));
      return;
    }
    const before = this.hunger;
    this.hunger = Math.min(100, this.hunger + 30);
    AudioEffects.playEat();
    this.saveData();
    this.updateUI();
    this.showEating();
    this.floatText(`+${this.hunger - before}`, 'hambre');
    this.showDialogue(`${Staff.nombreDe(this.petSpecies, 'cuidados')}: ¡Buen provecho!`);
  },

  heal() {
    if (!this.isSick) {
      this.showDialogue(this.getDialogue('healthy', 'Me siento muy bien.'));
      return;
    }
    this.isSick = false;
    const before = this.happiness;
    this.happiness = Math.min(100, this.happiness + 20);
    AudioEffects.playHeal();
    this.saveData();
    this.updateUI();
    this.burst(['💚', '✨', '💊', '✨']);
    this.floatText(this.happiness > before ? `+${this.happiness - before}` : 'Curada', 'felicidad');
  },

  sleep() {
    if (!this.isSleeping && this.energy >= 100) {
      this.showDialogue(this.getDialogue('rested', 'Tengo toda la energía.'));
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

  // Nombre de la mascota: hasta 14 caracteres; vacío = sin nombre
  setName(name) {
    this.petName = String(name || '').trim().slice(0, 14);
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

  // Cambia el personaje (solo los que ya tienen diseño)
  setSpecies(id) {
    if (!Catalogo.species.some(s => s.id === id && s.disponible)) return;
    this.petSpecies = id;
    const color = Catalogo.species.find(s => s.id === id).color;
    if (color) this.petColor = color;
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
        // Aviso visible: sin esto el cambio pasa casi desapercibido
        this.floatText(`¡Me siento mal! ${Staff.nombreDe(this.petSpecies, 'cuidados')} dice: usá la medicina.`, 'felicidad');
      }
    }
    this.saveData();
    this.updateUI();
  },

  // Aviso una sola vez por sesión: el progreso no se guarda porque
  // hay una partida de una versión más nueva en este navegador
  avisarGuardadoBloqueado() {
    if (this.avisoGuardadoMostrado) return;
    if (typeof document === 'undefined' || !document.body) return;
    this.avisoGuardadoMostrado = true;
    Avisos.aviso(
      'Tu progreso no se está guardando en este navegador porque hay una partida de una versión más nueva del juego. Recargá la página para usar la versión actual.',
      { titulo: 'Guardado en pausa', icono: 'mipet' }
    );
  },

  saveData() {
    // Un guardado de una versión más nueva no se pisa
    if (this.guardadoBloqueado) {
      this.avisarGuardadoBloqueado();
      return;
    }
    const datos = JSON.stringify({
      version: VERSION_GUARDADO,
      coins: this.coins,
      happiness: this.happiness,
      hunger: this.hunger,
      energy: this.energy,
      petName: this.petName,
      petColor: this.petColor,
      petEyes: this.petEyes,
      petMouth: this.petMouth,
      petCheeks: this.petCheeks,
      petShape: this.petShape,
      petSpecies: this.petSpecies,
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
      const crudo = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
      if (crudo && typeof crudo === 'object') {
        data = migrarGuardado(crudo);
        this.guardadoBloqueado = data === null;
      }
    } catch (e) {
      console.warn('No se pudo leer la partida guardada; se usan los valores iniciales.', e);
    }
    if (data && typeof data === 'object') {
      this.coins = data.coins ?? this.coins;
      this.happiness = data.happiness ?? 100;
      this.hunger = data.hunger ?? 100;
      this.energy = data.energy ?? 100;
      this.petName = typeof data.petName === 'string' ? data.petName.slice(0, 14) : '';
      this.petColor = data.petColor || '#ff80ab';
      this.petEyes = data.petEyes || 'round';
      this.petMouth = data.petMouth || 'cat';
      this.petCheeks = data.petCheeks || 'round';
      this.petShape = data.petShape || 'shape-circle';
      this.petSpecies = Catalogo.species.some(s => s.id === data.petSpecies && s.disponible) ? data.petSpecies : 'mochi';
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
