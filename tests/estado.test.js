// Pruebas de PetState (js/mascota-estado.js): guardado, migraciones y acciones.
// Se ejecutan con `npm test`, sin dependencias (node:test).
import { test } from 'node:test';
import assert from 'node:assert/strict';

// El módulo lee window, localStorage y document al cargarse: se simulan antes de importarlo
const almacen = new Map();
globalThis.window = { location: { search: '' } };
globalThis.localStorage = {
  getItem: (k) => (almacen.has(k) ? almacen.get(k) : null),
  setItem: (k, v) => almacen.set(k, String(v)),
  removeItem: (k) => almacen.delete(k),
};
globalThis.document = {
  body: null,
  addEventListener() {},
  getElementById: () => null,
  createTreeWalker: () => ({ nextNode: () => null }),
};

const { PetState } = await import('../js/mascota-estado.js');
const CLAVE = 'virtualPetData';

// Deja a PetState en valores iniciales y carga el guardado indicado
function cargarPetState(guardadoInicial) {
  almacen.clear();
  if (guardadoInicial !== undefined) almacen.set(CLAVE, guardadoInicial);
  Object.assign(PetState, {
    coins: 500, happiness: 100, hunger: 100, energy: 100, petName: '',
    isSick: false, isSleeping: false, guardadoBloqueado: false,
    // Lo que dibuja mascota-visual.js no se carga acá: se reemplaza por no-ops
    updateUI() {}, showDialogue() {}, showEating() {}, floatText() {}, burst() {},
    getDialogue: (_clave, fallback) => fallback,
  });
  // Lo mismo que hace init() al arrancar, sin el resto de la app
  PetState.loadData();
  return { PetState, almacen };
}

test('saveData guarda el campo version y loadData lo vuelve a leer', () => {
  const { PetState, almacen } = cargarPetState();
  PetState.coins = 777;
  PetState.petName = 'Luna';
  PetState.saveData();

  const guardado = JSON.parse(almacen.get(CLAVE));
  assert.equal(guardado.version, 1);

  const otra = cargarPetState(almacen.get(CLAVE)).PetState;
  assert.equal(otra.coins, 777);
  assert.equal(otra.petName, 'Luna');
});

test('un guardado sin version (formato anterior) se carga igual', () => {
  const viejo = JSON.stringify({ coins: 300, hunger: 40, petName: 'Mochi' });
  const { PetState } = cargarPetState(viejo);
  assert.equal(PetState.coins, 300);
  assert.equal(PetState.hunger, 40);
  assert.equal(PetState.petName, 'Mochi');
});

test('un guardado de una versión más nueva no se carga ni se pisa', () => {
  const futuro = JSON.stringify({ version: 99, coins: 123 });
  const { PetState, almacen } = cargarPetState(futuro);
  assert.equal(PetState.guardadoBloqueado, true);
  assert.equal(PetState.coins, 500); // valor inicial
  PetState.feed();
  assert.equal(almacen.get(CLAVE), futuro);
});

test('un guardado dañado arranca con los valores iniciales', () => {
  const { PetState } = cargarPetState('{esto no es json');
  assert.equal(PetState.coins, 500);
  assert.equal(PetState.guardadoBloqueado, false);
});

test('el nombre se corta a 14 caracteres al cargar', () => {
  const largo = JSON.stringify({ version: 1, petName: 'a'.repeat(30) });
  const { PetState } = cargarPetState(largo);
  assert.equal(PetState.petName.length, 14);
});

test('comer suma 30 de hambre y no pasa de 100', () => {
  const { PetState } = cargarPetState();
  PetState.hunger = 50;
  PetState.feed();
  assert.equal(PetState.hunger, 80);
  PetState.feed();
  PetState.feed();
  assert.equal(PetState.hunger, 100);
});

test('dormir alterna entre dormir y despertar', () => {
  const { PetState } = cargarPetState();
  PetState.energy = 50;
  PetState.sleep();
  assert.equal(PetState.isSleeping, true);
  PetState.sleep();
  assert.equal(PetState.isSleeping, false);
});

test('setTrait cambia el rasgo y rechaza ids que no existen', () => {
  const { PetState } = cargarPetState();
  PetState.setTrait('eyes', 'sparkle');
  assert.equal(PetState.petEyes, 'sparkle');
  PetState.setTrait('eyes', 'no-existe');
  assert.equal(PetState.petEyes, 'sparkle');
  PetState.setTrait('nariz', 'round');
  assert.equal(PetState.petEyes, 'sparkle');
});

test('heal cura a la mascota enferma y no hace nada si está sana', () => {
  const { PetState } = cargarPetState();
  PetState.isSick = true;
  PetState.heal();
  assert.equal(PetState.isSick, false);
  PetState.happiness = 50;
  PetState.heal();
  assert.equal(PetState.happiness, 50);
});

test('con guardado bloqueado, saveData no escribe ni falla sin pantalla', () => {
  const { PetState, almacen } = cargarPetState(JSON.stringify({ version: 999, coins: 1 }));
  assert.equal(PetState.guardadoBloqueado, true);
  const antes = almacen.get(CLAVE);
  PetState.coins = 777;
  assert.doesNotThrow(() => PetState.saveData());
  assert.equal(almacen.get(CLAVE), antes);
});
