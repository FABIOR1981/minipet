// =========================================================
// STAFF.JS — Reparto de puestos del staff. El jugador elige
// su mascota principal entre los 7 personajes; los otros 6
// ocupan los puestos. Si el personaje "preferido" de un puesto
// es la mascota principal, el puesto lo toma otro que no eligió.
// Sin DOM: solo datos y cálculo (se prueba en tests/).
// =========================================================
import { Catalogo } from './catalogo.js';
import { PersonajesDibujos } from './personajes-dibujos.js';
export const Staff = {
  // Puestos del staff, en orden. 'preferido' es quien encaja mejor
  puestos: [
    { id: 'tienda',     nombre: 'Tendero de la tienda',               preferido: 'buho' },
    { id: 'minijuegos', nombre: 'Anfitrión de minijuegos',            preferido: 'pollito' },
    { id: 'vestidor',   nombre: 'Estilista del vestidor',             preferido: 'conejita' },
    { id: 'escenario',  nombre: 'Decorador del escenario',            preferido: 'gatito' },
    { id: 'cuidados',   nombre: 'Cuidadora de medicina y comida',     preferido: 'gotita' },
    { id: 'ayudante',   nombre: 'Ayudante de minijuegos',             preferido: 'mochi' },
  ],

  // Personajes que pueden ser mascota principal (ver Catalogo.species)
  personajes: ['mochi', 'gotita', 'nube', 'pollito', 'gatito', 'conejita', 'buho'],

  // Devuelve { puestoId: personajeId } para una mascota principal dada
  asignar(principal) {
    if (!this.personajes.includes(principal)) return null;
    const disponibles = this.personajes.filter(p => p !== principal);
    const asignacion = {};
    // 1) Cada puesto va a su preferido, si el preferido no es la principal ni está tomado
    this.puestos.forEach(puesto => {
      if (disponibles.includes(puesto.preferido)) {
        asignacion[puesto.id] = puesto.preferido;
        disponibles.splice(disponibles.indexOf(puesto.preferido), 1);
      }
    });
    // 2) Los puestos que quedaron libres los toman los que no eligió, en orden
    this.puestos.forEach(puesto => {
      if (asignacion[puesto.id] === undefined) {
        asignacion[puesto.id] = disponibles.shift();
      }
    });
    return asignacion;
  },

  // Solo el dibujo de quien ocupa un puesto (para encabezados)
  avatarHTML(principal, puestoId) {
    const id = this.ocupante(principal, puestoId);
    return PersonajesDibujos[id] ? `<span class="staff-avatar">${PersonajesDibujos[id]}</span>` : '';
  },

  // Globo de saludo de quien ocupa un puesto. En 'frase', {nombre} se cambia por el nombre del personaje
  saludoHTML(principal, puestoId, frase) {
    const id = this.ocupante(principal, puestoId);
    const info = Catalogo.species.find(s => s.id === id);
    if (!info) return '';
    const texto = frase.replace('{nombre}', info.name);
    return `
      <div class="staff-saludo">
        <span class="staff-avatar" aria-hidden="true">${PersonajesDibujos[id] || ''}</span>
        <p class="staff-globo">${texto}</p>
      </div>`;
  },

  // Nombre (texto) de quien ocupa un puesto
  nombreDe(principal, puestoId) {
    const id = this.ocupante(principal, puestoId);
    const info = Catalogo.species.find(s => s.id === id);
    return info ? info.name : '';
  },

  // Qué personaje ocupa un puesto, dada la mascota principal
  ocupante(principal, puestoId) {
    const asignacion = this.asignar(principal);
    return asignacion ? asignacion[puestoId] : undefined;
  },
};
