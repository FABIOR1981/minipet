// Pruebas del reparto de puestos (js/staff.js): cada puesto tiene una sola persona
// y nunca lo ocupa la mascota principal.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Staff } from '../js/staff.js';

test('la mascota principal nunca ocupa un puesto', () => {
  Staff.personajes.forEach(principal => {
    const valores = Object.values(Staff.asignar(principal));
    assert.ok(!valores.includes(principal), `${principal} quedó en un puesto`);
  });
});

test('cada puesto tiene exactamente un ocupante distinto', () => {
  Staff.personajes.forEach(principal => {
    const valores = Object.values(Staff.asignar(principal));
    assert.equal(valores.length, Staff.puestos.length);
    assert.equal(new Set(valores).size, valores.length);
    // Los 6 que no eligió ocupan los 6 puestos
    assert.deepEqual([...valores].sort(), Staff.personajes.filter(p => p !== principal).sort());
  });
});

test('si el preferido es la principal, el puesto lo toma otro', () => {
  // Con Vendedora búho como principal, la tienda no puede ser para el búho
  assert.notEqual(Staff.ocupante('buho', 'tienda'), 'buho');
  assert.ok(Staff.ocupante('buho', 'tienda'));
});

test('sin preferido elegido, cada puesto va a su preferido', () => {
  // Con Nube como principal, Mochi no tiene preferido en otro puesto: queda de ayudante
  assert.equal(Staff.ocupante('nube', 'tienda'), 'buho');
  assert.equal(Staff.ocupante('nube', 'ayudante'), 'mochi');
});

test('principal desconocida no asigna nada', () => {
  assert.equal(Staff.asignar('dragon'), null);
});
