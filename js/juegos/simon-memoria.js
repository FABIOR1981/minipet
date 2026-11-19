import { Minigames } from './juegos-base.js';
import { AudioEffects } from '../sonidos.js';
// =========================================================
// SIMON-MEMORIA.JS — Memorizar y repetir la secuencia de
// colores que se enciende, una ronda más larga cada vez.
// =========================================================
Object.assign(Minigames, {
  // Timers pendientes (reproducción de la secuencia y pausa entre rondas).
  // Se cancelan al salir o al perder para que no sigan corriendo sobre
  // una pantalla que ya no existe.
  simonTimers: [],
  // Solo se aceptan toques cuando terminó de mostrarse la secuencia
  simonAcceptingInput: false,

  clearSimonTimers() {
    this.simonTimers.forEach(id => {
      clearInterval(id);
      clearTimeout(id);
    });
    this.simonTimers = [];
  },

  startSimonGame() {
    this.showCountdown(() => {
      this.clearSimonTimers();
      const content = document.getElementById('modal-content');
      const best = Minigames.getBestScore('simon');
      content.innerHTML = `
        ${Minigames.renderHeader('🎯 Simón Memoria', Minigames.renderHUD('🧠', best))}
        <p id="simon-status" style="margin-top:5px; text-align:center; font-weight:bold; color:#7e57c2;">Memoriza la secuencia.</p>
        <div class="game-stage stage-dom"><div class="simon-grid">
          <button id="simon-0" class="simon-pad" data-simon="0" style="--c:#ff80ab; --d:#f50057;" aria-label="Botón 0"></button>
          <button id="simon-1" class="simon-pad" data-simon="1" style="--c:#80deea; --d:#00acc1;" aria-label="Botón 1"></button>
          <button id="simon-2" class="simon-pad" data-simon="2" style="--c:#b388ff; --d:#673ab7;" aria-label="Botón 2"></button>
          <button id="simon-3" class="simon-pad" data-simon="3" style="--c:#ffe082; --d:#ffb300;" aria-label="Botón 3"></button>
        </div></div>
      `;

      content.querySelectorAll('[data-simon]').forEach((b) => {
        b.onclick = () => Minigames.simonClick(Number(b.dataset.simon));
      });

      Minigames.mountSpectator();

      this.simonSequence = [];
      this.userSequence = [];
      this.simonScore = 0;
      this.simonAcceptingInput = false;

      Minigames.inProgress = true;
      Minigames.exitHandler = () => {
        Minigames.clearSimonTimers();
        Minigames.simonAcceptingInput = false;
        return Minigames.simonScore * 10;
      };

      this.nextSimonRound();
    });
  },

  nextSimonRound() {
    const statusEl = document.getElementById('simon-status');
    if (!statusEl) return; // El jugador ya salió del juego

    this.simonAcceptingInput = false;
    this.userSequence = [];
    this.simonSequence.push(Math.floor(Math.random() * 4));
    statusEl.innerText = `Ronda ${this.simonSequence.length} ✨`;

    let i = 0;
    const interval = setInterval(() => {
      this.flashSimonButton(this.simonSequence[i]);
      i++;
      if (i >= this.simonSequence.length) {
        clearInterval(interval);
        // Habilita los toques recién cuando se apagó el último botón
        const turnTimeout = setTimeout(() => {
          this.simonAcceptingInput = true;
          const el = document.getElementById('simon-status');
          if (el) el.innerText = 'Tu turno 👆';
        }, 400);
        this.simonTimers.push(turnTimeout);
      }
    }, 700);
    this.simonTimers.push(interval);
  },

  flashSimonButton(index) {
    const btn = document.getElementById(`simon-${index}`);
    if (!btn) return;
    const freqs = [350, 450, 550, 650];
    AudioEffects.playTone(freqs[index], 'sine', 0.15);
    Minigames.spectate('nod'); // cabecea al ritmo de la secuencia
    btn.classList.add('on');
    setTimeout(() => btn.classList.remove('on'), 350);
  },

  simonClick(index) {
    // Ignora toques mientras se muestra la secuencia o entre rondas
    if (!this.simonAcceptingInput) return;

    this.flashSimonButton(index);
    this.userSequence.push(index);

    const currentIndex = this.userSequence.length - 1;
    if (this.userSequence[currentIndex] !== this.simonSequence[currentIndex]) {
      this.simonAcceptingInput = false;
      this.clearSimonTimers();
      const reward = this.simonScore * 10;
      const isRecord = Minigames.saveBestScore('simon', this.simonScore);
      Minigames.sacudir(document.querySelector('.game-stage'));
      Minigames.showResult('Se rompió la secuencia. ¿Otra ronda?', '🧠', reward, () => Minigames.startSimonGame(), isRecord);
      return;
    }

    if (this.userSequence.length === this.simonSequence.length) {
      this.simonAcceptingInput = false;
      this.simonScore++;
      Minigames.updateHudScore(this.simonScore);
      Minigames.spectate('cheer');
      Minigames.celebrar(document.querySelector('.game-stage'), '✨');
      const roundTimeout = setTimeout(() => this.nextSimonRound(), 1000);
      this.simonTimers.push(roundTimeout);
    }
  },
});
