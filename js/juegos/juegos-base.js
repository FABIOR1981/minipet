import { ico, tituloPantalla } from '../iconos.js';
import { PetState } from '../mascota-estado.js';
import { AudioEffects } from '../sonidos.js';
// =========================================================
// JUEGOS-BASE.JS — Estado y utilidades compartidas por los
// minijuegos: salida segura (forceExitIfActive), menú principal,
// conteo regresivo, pantalla de resultado, mejor puntaje por
// juego (localStorage), HUD reutilizable y escala de canvas.
// Los demás archivos de js/juegos/ agregan sus métodos a este
// mismo objeto Minigames vía Object.assign.
// =========================================================
// Temas de fondo para los minijuegos de canvas (ver Minigames.paisaje)
const PAISAJES = {
  dulces:   { cielo: ['#d9f1ff', '#fbe3ff'], luz: '#fff7c2', nubes: [{ x: 30, y: 0.16, v: 9, s: 1 }, { x: 170, y: 0.30, v: 6, s: 0.8 }, { x: 250, y: 0.10, v: 12, s: 0.6 }], colinaFondo: '#ffd0ec', colinaFrente: '#f4a7d6', suelo: '#c6f2a6', sueloBorde: '#9fdf84', destello: '#ffffff' },
  globos:   { cielo: ['#ffe5f2', '#fff1d9'], luz: '#fff3b0', nubes: [{ x: 60, y: 0.14, v: 7, s: 1 }, { x: 200, y: 0.34, v: 10, s: 0.7 }], colinaFondo: '#ffc9e0', colinaFrente: '#ffabd0', suelo: '#ffe0b0', sueloBorde: '#f7c77a', destello: '#ffffff' },
  burbujas: { cielo: ['#d6fbf5', '#e6e9ff'], luz: '#e6fff9', nubes: [{ x: 90, y: 0.12, v: 8, s: 0.9 }, { x: 230, y: 0.28, v: 5, s: 0.7 }], colinaFondo: '#b3e9e4', colinaFrente: '#8fd9d3', suelo: '#bdeee0', sueloBorde: '#8fd9d3', destello: '#ffffff' },
  pista:    { cielo: ['#fff6c9', '#f7d9ff'], luz: '#fff0a6', nubes: [{ x: 40, y: 0.14, v: 6, s: 1 }, { x: 180, y: 0.22, v: 9, s: 0.8 }], colinaFondo: '#ffd1a6', colinaFrente: '#f6b98a', suelo: '#e8c7f2', sueloBorde: '#ce93d8', destello: '#ffffff' },
  comida:   { cielo: ['#e6fbe9', '#fff7de'], luz: '#fffbd6', nubes: [{ x: 50, y: 0.16, v: 7, s: 0.9 }, { x: 210, y: 0.30, v: 6, s: 0.8 }], colinaFondo: '#c8efcf', colinaFrente: '#a6e3b5', suelo: '#b7eab0', sueloBorde: '#8fd98a', destello: '#ffffff' },
  torre:    { cielo: ['#ffe9f4', '#e3f6f3'], luz: '#fff4d1', nubes: [{ x: 70, y: 0.12, v: 5, s: 1 }, { x: 220, y: 0.26, v: 7, s: 0.7 }], colinaFondo: '#ffd3e8', colinaFrente: '#bfe9e0', suelo: '#f8e3a6', sueloBorde: '#f0cf7d', destello: '#ffffff' },
};

// Nube de tres óvalos
function dibujarNube(ctx, x, y, s) {
  ctx.beginPath();
  ctx.ellipse(x, y, 26 * s, 12 * s, 0, 0, Math.PI * 2);
  ctx.ellipse(x - 14 * s, y - 6 * s, 13 * s, 11 * s, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 8 * s, y - 10 * s, 16 * s, 13 * s, 0, 0, Math.PI * 2);
  ctx.fill();
}

// Colina ondulada desde y hasta el piso
function dibujarColina(ctx, W, y, amplitud, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.quadraticCurveTo(W * 0.25, y - amplitud, W * 0.5, y);
  ctx.quadraticCurveTo(W * 0.75, y + amplitud, W, y);
  ctx.lineTo(W, y + 60);
  ctx.lineTo(0, y + 60);
  ctx.closePath();
  ctx.fill();
}

export const Minigames = {
  // Estado de un minijuego en curso. Si el usuario cierra el modal o
  // navega a otra pestaña mientras `inProgress` es true, `exitHandler()`
  // se ejecuta para limpiar listeners/timers y devolver las monedas
  // ganadas hasta ese momento, en vez de perderlas en silencio.
  inProgress: false,
  exitHandler: null,

  forceExitIfActive() {
    this.cancelCountdown();
    if (this.inProgress && this.exitHandler) {
      const earned = this.exitHandler();
      this.inProgress = false;
      this.exitHandler = null;
      if (earned > 0) {
        PetState.addCoins(earned);
      }
    }
  },

  // Conteo regresivo en curso (si lo hay). Se cancela al iniciar otro
  // o al salir, para que un doble toque en "Jugar" no arranque dos
  // partidas a la vez.
  countdownTimer: null,

  cancelCountdown() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  },

  // Devuelve una función que, llamada en cada frame con el timestamp de
  // requestAnimationFrame, da el factor de tiempo transcurrido respecto
  // a un frame de 60 Hz (1 a 60 Hz, 0.5 a 120 Hz). Multiplicar los
  // movimientos por ese factor hace que los juegos vayan a la misma
  // velocidad en cualquier pantalla. Se limita a 3 para que una pausa
  // (pestaña en segundo plano) no provoque un salto enorme.
  createFrameClock() {
    let last = null;
    return (now) => {
      const factor = last === null ? 1 : Math.min(3, Math.max(0, (now - last) / (1000 / 60)));
      last = now;
      return factor;
    };
  },

  // Menú Principal de Minijuegos
 renderMenu() {
  const content = document.getElementById('modal-content');
  content.innerHTML = `
    ${tituloPantalla('juegos', 'Minijuegos')}
    <p style="margin-bottom:14px; font-size:0.85rem; color:#7b1fa2; text-align:center; font-weight:600;">
      Gana monedas y haz feliz a tu mascota.
    </p>
    <div class="grid-container games-grid">
      <div class="item-card tocable" role="button" tabindex="0" data-juego="startCatchGame">
        <span class="game-emoji tinte-medicina"><svg class="ico" aria-hidden="true"><use href="#i-juego-atrapa"/></svg></span>
        <span class="card-title">Atrapa Dulces</span>
      </div>
      <div class="item-card tocable" role="button" tabindex="0" data-juego="startPopGame">
        <span class="game-emoji tinte-mipet"><svg class="ico" aria-hidden="true"><use href="#i-juego-globos"/></svg></span>
        <span class="card-title">Explotar Globos</span>
      </div>
      <div class="item-card tocable" role="button" tabindex="0" data-juego="startCakeGame">
        <span class="game-emoji tinte-comer"><svg class="ico" aria-hidden="true"><use href="#i-juego-torre"/></svg></span>
        <span class="card-title">Torre de Postres</span>
      </div>
      <div class="item-card tocable" role="button" tabindex="0" data-juego="startSimonGame">
        <span class="game-emoji tinte-juegos"><svg class="ico" aria-hidden="true"><use href="#i-juego-simon"/></svg></span>
        <span class="card-title">Simón Memoria</span>
      </div>
      <div class="item-card tocable" role="button" tabindex="0" data-juego="startRunnerGame">
        <span class="game-emoji tinte-dormir"><svg class="ico" aria-hidden="true"><use href="#i-juego-runner"/></svg></span>
        <span class="card-title">Runner Mágico</span>
      </div>
      <div class="item-card tocable" role="button" tabindex="0" data-juego="startBubbleGame">
        <span class="game-emoji tinte-armario"><svg class="ico" aria-hidden="true"><use href="#i-juego-burbujas"/></svg></span>
        <span class="card-title">Burbujas Mágicas</span>
      </div>
      <div class="item-card tocable" role="button" tabindex="0" data-juego="startPairsGame">
        <span class="game-emoji tinte-tienda"><svg class="ico" aria-hidden="true"><use href="#i-juego-parejas"/></svg></span>
        <span class="card-title">Parejas</span>
      </div>
      <div class="item-card tocable" role="button" tabindex="0" data-juego="startHideGame">
        <span class="game-emoji tinte-escenario"><svg class="ico" aria-hidden="true"><use href="#i-juego-donde"/></svg></span>
        <span class="card-title">¿Dónde Está?</span>
      </div>
      <div class="item-card tocable" role="button" tabindex="0" data-juego="startDressGame">
        <span class="game-emoji tinte-mipet"><svg class="ico" aria-hidden="true"><use href="#i-juego-vestir"/></svg></span>
        <span class="card-title">Vestirla Igual</span>
      </div>
      <div class="item-card tocable" role="button" tabindex="0" data-juego="startFoodGame">
        <span class="game-emoji tinte-medicina"><svg class="ico" aria-hidden="true"><use href="#i-juego-comida"/></svg></span>
        <span class="card-title">Lluvia de Comida</span>
      </div>
    </div>
  `;
  // Cada tarjeta lleva el nombre del método que la inicia en data-juego
  content.querySelectorAll('[data-juego]').forEach((card) => {
    card.onclick = () => Minigames[card.dataset.juego]();
  });
},

  // Conteo Regresivo Estilo Kawaii
  showCountdown(onComplete) {
    this.cancelCountdown();
    const content = document.getElementById('modal-content');
    content.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:260px;">
        <div id="countdown-pet" class="countdown-pet"></div>
        <div id="countdown-num" class="kawaii-countdown">3</div>
        <p id="countdown-sub" style="font-weight:bold; color:#ab47bc; margin-top:10px;">¡Prepárate! ✨</p>
      </div>
    `;

    // La mascota hace la cuenta: un saltito por número
    const countPet = this.createMiniPet(76);
    document.getElementById('countdown-pet').appendChild(countPet.el);
    countPet.cheer();

    let count = 3;
    AudioEffects.playTone(523, 'sine', 0.15);

    const interval = setInterval(() => {
      count--;
      const numEl = document.getElementById('countdown-num');
      const subEl = document.getElementById('countdown-sub');

      if (!numEl) {
        this.cancelCountdown();
        return;
      }

      if (count >= 0) countPet.cheer();

      if (count > 0) {
        numEl.innerText = count;
        numEl.style.animation = 'none';
        numEl.offsetHeight;
        numEl.style.animation = 'popNum 0.6s ease-out';
        AudioEffects.playTone(523 + (3 - count) * 100, 'sine', 0.15);
      } else if (count === 0) {
        numEl.innerText = '¡A JUGAR! 🌸';
        numEl.style.fontSize = '2rem';
        subEl.innerText = '✨ Diviértete ✨';
        AudioEffects.playTone(880, 'triangle', 0.3);
      } else {
        this.cancelCountdown();
        onComplete();
      }
    }, 900);
    this.countdownTimer = interval;
  },

  // Pantalla de Resultado Kawaii (reemplaza los alert() nativos)
  showResult(title, emoji, score, restartFn, isRecord = false) {
    // El juego terminó de forma natural: ya no hay nada que cobrar al salir
    this.inProgress = false;
    this.exitHandler = null;

    const content = document.getElementById('modal-content');
    content.innerHTML = `
      <div class="result-screen">
        <div class="result-pet-row">
          <div id="result-pet" class="result-pet"></div>
          <div class="result-emoji">${emoji}</div>
        </div>
        <h2 class="result-title">${title}</h2>
        ${isRecord ? `<div class="result-record con-ico">${ico('trofeo')}¡Nuevo récord!</div>` : ''}
        <div class="result-coins-box">
          ${ico('moneda', 'ico-moneda')}
          <span id="result-coin-num">0</span>
        </div>
        <div class="result-actions">
          <button class="card-btn con-ico result-btn-again" id="result-again">${ico('repetir')}Jugar de nuevo</button>
          <button class="card-btn con-ico result-btn-menu" id="result-menu">${ico('menu')}Menú</button>
        </div>
      </div>
    `;

    // La mascota festeja el resultado
    const resultPet = this.createMiniPet(88);
    resultPet.party();
    document.getElementById('result-pet').appendChild(resultPet.el);

    PetState.addCoins(score);

    // Animación de conteo de monedas ganadas
    const numEl = document.getElementById('result-coin-num');
    let current = 0;
    const step = Math.max(1, Math.ceil(score / 25));
    const counter = setInterval(() => {
      current = Math.min(score, current + step);
      numEl.innerText = current;
      if (current >= score) clearInterval(counter);
    }, 25);

    document.getElementById('result-again').onclick = () => restartFn();
    document.getElementById('result-menu').onclick = () => Minigames.renderMenu();
  },

  // =========================================================
  // MEJOR PUNTAJE POR JUEGO (persistido en localStorage)
  // =========================================================
  // El modo prueba guarda sus récords aparte, igual que su partida
  BEST_SCORES_KEY: PetState.testMode ? 'minipetBestScoresPrueba' : 'minipetBestScores',

  getBestScore(gameId) {
    try {
      const data = JSON.parse(localStorage.getItem(this.BEST_SCORES_KEY) || '{}');
      return data[gameId] || 0;
    } catch (e) {
      return 0;
    }
  },

  // Guarda el puntaje si es un nuevo récord. Devuelve true si lo fue.
  saveBestScore(gameId, score) {
    try {
      const data = JSON.parse(localStorage.getItem(this.BEST_SCORES_KEY) || '{}');
      if (score > (data[gameId] || 0)) {
        data[gameId] = score;
        localStorage.setItem(this.BEST_SCORES_KEY, JSON.stringify(data));
        return true;
      }
    } catch (e) {
      // Si localStorage falla, seguimos sin romper el juego
    }
    return false;
  },

  // =========================================================
  // HUD REUTILIZABLE (marcador + mejor puntaje + tiempo opcional)
  // =========================================================
  renderHUD(icon, best, timeLeft) {
    return `
      <div class="game-hud">
        <span class="hud-chip">${icon} <span id="hud-score">0</span></span>
        <span class="hud-chip hud-best">${ico('trofeo')}<span id="hud-best">${best}</span></span>
        ${timeLeft !== undefined ? `<span class="hud-chip hud-timer">${ico('reloj')}<span><span id="hud-timer">${timeLeft}</span>s</span></span>` : ''}
      </div>
    `;
  },

  updateHudScore(score) {
    const el = document.getElementById('hud-score');
    if (el) el.innerText = score;
  },

  updateHudTimer(t) {
    const el = document.getElementById('hud-timer');
    if (el) el.innerText = t;
  },

  // Lienzo que ocupa todo el escenario. El ancho lógico queda en 300 (como
  // antes) y el alto se ajusta a la proporción real de la pantalla, así el
  // dibujo no se estira. Devuelve { W, H } para que cada juego ubique sus cosas.
  prepararLienzo(canvas) {
    const stage = canvas.parentElement;
    const ancho = stage.clientWidth || 300;
    const alto = stage.clientHeight || 300;
    const W = 300;
    const H = Math.max(260, Math.min(560, Math.round(W * alto / ancho)));
    canvas.width = W;
    canvas.height = H;
    return { W, H };
  },

  // Fondos de los minijuegos de canvas: cielo con luz, nubes que derivan,
  // colinas y piso. Se dibuja entero en cada frame (reemplaza al clearRect).
  paisaje(ctx, W, H, tema) {
    const T = PAISAJES[tema] || PAISAJES.dulces;
    const t = performance.now() / 1000;

    const cielo = ctx.createLinearGradient(0, 0, 0, H);
    cielo.addColorStop(0, T.cielo[0]);
    cielo.addColorStop(1, T.cielo[1]);
    ctx.fillStyle = cielo;
    ctx.fillRect(0, 0, W, H);

    // Luz suave del sol
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = T.luz;
    ctx.beginPath();
    ctx.arc(W * 0.82, H * 0.13, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Nubes que derivan despacio
    ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
    T.nubes.forEach((n) => {
      const x = ((n.x + t * n.v) % (W + 120)) - 60;
      dibujarNube(ctx, x, H * n.y, n.s);
    });

    // Colinas de fondo y de frente
    dibujarColina(ctx, W, H - 96, 14, T.colinaFondo);
    dibujarColina(ctx, W, H - 64, 10, T.colinaFrente);

    // Piso con borde
    ctx.fillStyle = T.suelo;
    ctx.fillRect(0, H - 30, W, 30);
    ctx.fillStyle = T.sueloBorde;
    ctx.fillRect(0, H - 30, W, 3);

    // Destellos que titilan
    ctx.fillStyle = T.destello;
    for (let i = 0; i < 6; i++) {
      const x = (i * 97 + 23) % W;
      const y = 20 + ((i * 53) % Math.max(40, H * 0.5));
      ctx.globalAlpha = 0.35 + 0.35 * Math.sin(t * 2 + i);
      ctx.beginPath();
      ctx.arc(x, y, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  },

  // Chispas que salen del centro del escenario al acertar (y un texto que sube).
  // Se borran solas; el escenario debe tener position relative (.game-stage).
  celebrar(escenario, emoji = '✨', texto = '') {
    if (!escenario) return;
    const cx = escenario.clientWidth / 2;
    const cy = escenario.clientHeight / 2;
    for (let i = 0; i < 8; i++) {
      const chispa = document.createElement('span');
      chispa.className = 'juego-chispa';
      chispa.textContent = emoji;
      const angulo = (i / 8) * Math.PI * 2;
      chispa.style.left = `${cx}px`;
      chispa.style.top = `${cy}px`;
      chispa.style.setProperty('--dx', `${Math.cos(angulo) * 64}px`);
      chispa.style.setProperty('--dy', `${Math.sin(angulo) * 64}px`);
      escenario.appendChild(chispa);
      setTimeout(() => chispa.remove(), 700);
    }
    if (texto) {
      const sube = document.createElement('span');
      sube.className = 'juego-texto-sube';
      sube.textContent = texto;
      sube.style.left = `${cx}px`;
      sube.style.top = `${cy}px`;
      escenario.appendChild(sube);
      setTimeout(() => sube.remove(), 900);
    }
  },

  // Sacudida corta del escenario al fallar
  sacudir(escenario) {
    if (!escenario) return;
    escenario.classList.remove('sacudir');
    void escenario.offsetWidth; // reinicia la animación
    escenario.classList.add('sacudir');
  },

  // Factor de escala entre la resolución lógica del canvas (width/height)
  // y su tamaño real en pantalla (que ahora es responsive vía CSS).
  // Necesario para que los toques/clics caigan en el punto correcto
  // sin importar qué tan grande o chico se vea el canvas.
  getCanvasScale(canvas) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: canvas.width / rect.width,
      y: canvas.height / rect.height
    };
  }
};
