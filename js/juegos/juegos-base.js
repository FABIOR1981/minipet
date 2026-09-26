// =========================================================
// JUEGOS-BASE.JS — Estado y utilidades compartidas por los 6
// minijuegos: salida segura (forceExitIfActive), menú principal,
// conteo regresivo, pantalla de resultado, mejor puntaje por
// juego (localStorage), HUD reutilizable y escala de canvas.
// Los demás archivos de js/juegos/ agregan sus métodos a este
// mismo objeto Minigames vía Object.assign.
// =========================================================
const Minigames = {
  // Estado de un minijuego en curso. Si el usuario cierra el modal o
  // navega a otra pestaña mientras `inProgress` es true, `exitHandler()`
  // se ejecuta para limpiar listeners/timers y devolver las monedas
  // ganadas hasta ese momento, en vez de perderlas en silencio.
  inProgress: false,
  exitHandler: null,

  forceExitIfActive() {
    if (this.inProgress && this.exitHandler) {
      const earned = this.exitHandler();
      this.inProgress = false;
      this.exitHandler = null;
      if (earned > 0) {
        PetState.addCoins(earned);
      }
    }
  },

  // Menú Principal de Minijuegos (6 Opciones Kawaii)
 renderMenu() {
  const content = document.getElementById('modal-content');
  content.innerHTML = `
    <h2 style="text-align:center; color:#6a1b9a; margin-bottom:4px;">🎮 Minijuegos</h2>
    <p style="margin-bottom:14px; font-size:0.85rem; color:#7b1fa2; text-align:center; font-weight:600;">
      ¡Gana monedas y haz feliz a tu mascota!
    </p>
    <div class="grid-container">
      <div class="item-card" onclick="Minigames.startCatchGame()" style="cursor:pointer;">
        <span style="font-size:2rem; margin-bottom:4px;">🎈</span>
        <span class="card-title">Atrapa Dulces</span>
        <button class="card-btn">Jugar</button>
      </div>
      <div class="item-card" onclick="Minigames.startPopGame()" style="cursor:pointer;">
        <span style="font-size:2rem; margin-bottom:4px;">🌸</span>
        <span class="card-title">Explotar Globos</span>
        <button class="card-btn">Jugar</button>
      </div>
      <div class="item-card" onclick="Minigames.startCakeGame()" style="cursor:pointer;">
        <span style="font-size:2rem; margin-bottom:4px;">🍰</span>
        <span class="card-title">Torre de Postres</span>
        <button class="card-btn">Jugar</button>
      </div>
      <div class="item-card" onclick="Minigames.startSimonGame()" style="cursor:pointer;">
        <span style="font-size:2rem; margin-bottom:4px;">🧠</span>
        <span class="card-title">Simón Memoria</span>
        <button class="card-btn">Jugar</button>
      </div>
      <div class="item-card" onclick="Minigames.startRunnerGame()" style="cursor:pointer;">
        <span style="font-size:2rem; margin-bottom:4px;">🦄</span>
        <span class="card-title">Runner Mágico</span>
        <button class="card-btn">Jugar</button>
      </div>
      <div class="item-card" onclick="Minigames.startBubbleGame()" style="cursor:pointer;">
        <span style="font-size:2rem; margin-bottom:4px;">✨</span>
        <span class="card-title">Burbujas Mágicas</span>
        <button class="card-btn">Jugar</button>
      </div>
    </div>
  `;
},

  // Conteo Regresivo Estilo Kawaii
  showCountdown(onComplete) {
    const content = document.getElementById('modal-content');
    content.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:260px;">
        <div id="countdown-num" class="kawaii-countdown">3</div>
        <p id="countdown-sub" style="font-weight:bold; color:#ab47bc; margin-top:10px;">¡Prepárate! ✨</p>
      </div>
    `;

    let count = 3;
    AudioEffects.playTone(523, 'sine', 0.15);

    const interval = setInterval(() => {
      count--;
      const numEl = document.getElementById('countdown-num');
      const subEl = document.getElementById('countdown-sub');

      if (!numEl) {
        clearInterval(interval);
        return;
      }

      if (count > 0) {
        numEl.innerText = count;
        numEl.style.animation = 'none';
        numEl.offsetHeight;
        numEl.style.animation = 'popNum 0.6s ease-out';
        AudioEffects.playTone(523 + (3 - count) * 100, 'sine', 0.15);
      } else if (count === 0) {
        numEl.innerText = '¡A JUGAR! 🌸';
        numEl.style.fontSize = '2rem';
        subEl.innerText = '✨ ¡Diviértete! ✨';
        AudioEffects.playTone(880, 'triangle', 0.3);
      } else {
        clearInterval(interval);
        onComplete();
      }
    }, 900);
  },

  // Pantalla de Resultado Kawaii (reemplaza los alert() nativos)
  showResult(title, emoji, score, restartFn, isRecord = false) {
    // El juego terminó de forma natural: ya no hay nada que cobrar al salir
    this.inProgress = false;
    this.exitHandler = null;

    const content = document.getElementById('modal-content');
    content.innerHTML = `
      <div class="result-screen">
        <div class="result-emoji">${emoji}</div>
        <h2 class="result-title">${title}</h2>
        ${isRecord ? '<div class="result-record">🏆 ¡Nuevo récord!</div>' : ''}
        <div class="result-coins-box">
          <span>🪙</span>
          <span id="result-coin-num">0</span>
        </div>
        <div class="result-actions">
          <button class="card-btn result-btn-again" id="result-again">🔁 Jugar de nuevo</button>
          <button class="card-btn result-btn-menu" id="result-menu">🎮 Menú</button>
        </div>
      </div>
    `;

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
  BEST_SCORES_KEY: 'minipetBestScores',

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
        <span class="hud-chip hud-best">⭐ <span id="hud-best">${best}</span></span>
        ${timeLeft !== undefined ? `<span class="hud-chip hud-timer">⏰ <span id="hud-timer">${timeLeft}</span>s</span>` : ''}
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
