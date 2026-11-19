import { ico } from './iconos.js';
// =========================================================
// AVISOS.JS — Ventanitas propias del juego, en lugar de los
// alert() / confirm() / prompt() del navegador.
//
//   Avisos.aviso('Texto', { titulo, icono, tinte })          → Promise<void>
//   Avisos.confirmar('Texto', { titulo, aceptar, cancelar })  → Promise<boolean>
//   Avisos.pedirTexto('Título', { valor, maximo })            → Promise<string|null>
//
// Los estilos (.aviso-*) están en css/base.css.
// =========================================================
export const Avisos = {
  // opciones: { titulo, texto, icono, tinte, campo: { valor, maximo }, botones: [{ texto, valor, principal }] }
  mostrar(opciones) {
    return new Promise(resolve => {
      const fondo = document.createElement('div');
      fondo.className = 'aviso-fondo';
      fondo.innerHTML = `
        <div class="aviso-caja" role="dialog" aria-modal="true">
          <span class="aviso-ico tinte-${opciones.tinte || 'juegos'}">${ico(opciones.icono || 'mipet')}</span>
          <h3 class="aviso-titulo"></h3>
          <p class="aviso-texto"></p>
          <div class="aviso-botones"></div>
        </div>
      `;
      // textContent: los textos pueden traer algo escrito por el usuario
      const titulo = fondo.querySelector('.aviso-titulo');
      const texto = fondo.querySelector('.aviso-texto');
      titulo.textContent = opciones.titulo || '';
      texto.textContent = opciones.texto || '';
      if (!opciones.titulo) titulo.remove();
      if (!opciones.texto) texto.remove();

      let campo = null;
      if (opciones.campo) {
        campo = document.createElement('input');
        campo.type = 'text';
        campo.className = 'aviso-campo';
        campo.maxLength = opciones.campo.maximo || 20;
        campo.value = opciones.campo.valor || '';
        campo.autocomplete = 'off';
        fondo.querySelector('.aviso-botones').before(campo);
      }

      const cerrar = valor => {
        document.removeEventListener('keydown', alTeclear);
        fondo.remove();
        resolve(valor);
      };
      const valorDe = boton => (campo && boton.valor === true ? campo.value : boton.valor);
      const cancelar = (opciones.botones.find(b => !b.principal) || opciones.botones[0]);
      const principal = (opciones.botones.find(b => b.principal) || opciones.botones[0]);
      const alTeclear = e => {
        if (e.key === 'Escape') cerrar(valorDe(cancelar));
        if (e.key === 'Enter') cerrar(valorDe(principal));
      };
      document.addEventListener('keydown', alTeclear);

      const fila = fondo.querySelector('.aviso-botones');
      opciones.botones.forEach(boton => {
        const el = document.createElement('button');
        el.className = `card-btn ${boton.principal ? 'aviso-principal' : 'aviso-secundario'}`;
        el.textContent = boton.texto;
        el.onclick = () => cerrar(valorDe(boton));
        fila.appendChild(el);
      });

      (document.getElementById('app-container') || document.body).appendChild(fondo);
      if (campo) { campo.focus(); campo.select(); }
    });
  },

  aviso(texto, opciones = {}) {
    return this.mostrar({ ...opciones, texto, botones: [{ texto: opciones.aceptar || 'Entendido', valor: undefined, principal: true }] });
  },

  confirmar(texto, opciones = {}) {
    return this.mostrar({
      ...opciones, texto,
      botones: [
        { texto: opciones.cancelar || 'Ahora no', valor: false },
        { texto: opciones.aceptar || 'Sí', valor: true, principal: true }
      ]
    });
  },

  pedirTexto(titulo, opciones = {}) {
    return this.mostrar({
      ...opciones, titulo,
      campo: { valor: opciones.valor, maximo: opciones.maximo },
      botones: [
        { texto: 'Cancelar', valor: null },
        { texto: opciones.aceptar || 'Guardar', valor: true, principal: true }
      ]
    });
  }
};
