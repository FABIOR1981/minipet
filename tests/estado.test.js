// Pruebas de PetState (js/mascota-estado.js): guardado, migraciones y acciones.
// Se ejecuta con `npm test`, sin dependencias: node:test + vm.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ARCHIVO = path.join(__dirname, '..', 'js', 'mascota-estado.js');
const CLAVE = 'virtualPetData';

// Carga mascota-estado.js en un entorno aislado con un localStorage de mentira.
function cargarPetState(guardadoInicial) {
  const almacen = new Map();
  if (guardadoInicial !== undefined) almacen.set(CLAVE, guardadoInicial);

  const contexto = {
    window: { location: { search: '' } },
    localStorage: {
      getItem: (k) => (almacen.has(k) ? almacen.get(k) : null),
      setItem: (k, v) => almacen.set(k, String(v)),
      removeItem: (k) => almacen.delete(k),
    },
    URLSearchParams,
    console,
    document: { getElementById: () => null },
    AudioEffects: { playEat() {}, playTone() {}, playHeal() {} },
  };
  vm.createContext(contexto);
  vm.runInContext(fs.readFileSync(ARCHIVO, 'utf8'), contexto);
  const PetState = vm.runInContext('PetState', contexto);

  // Lo que dibuja mascota-visual.js no se carga acá: se reemplaza por no-ops
  Object.assign(PetState, {
    updateUI() {},
    showDialogue() {},
    showEating() {},
    floatText() {},
    burst() {},
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
