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
        <p id="simon-status" style="margin-top:5px; text-align:center; font-weight:bold; color:#7e57c2;">¡Memoriza la secuencia!</p>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin:20px 0;">
          <button id="simon-0" onclick="Minigames.simonClick(0)" style="height:75px; background:#ff80ab; border:none; border-radius:18px; cursor:pointer; box-shadow:0 4px 0 #f50057; touch-action:manipulation;"></button>
          <button id="simon-1" onclick="Minigames.simonClick(1)" style="height:75px; background:#80deea; border:none; border-radius:18px; cursor:pointer; box-shadow:0 4px 0 #00acc1; touch-action:manipulation;"></button>
          <button id="simon-2" onclick="Minigames.simonClick(2)" style="height:75px; background:#b388ff; border:none; border-radius:18px; cursor:pointer; box-shadow:0 4px 0 #673ab7; touch-action:manipulation;"></button>
          <button id="simon-3" onclick="Minigames.simonClick(3)" style="height:75px; background:#ffe082; border:none; border-radius:18px; cursor:pointer; box-shadow:0 4px 0 #ffb300; touch-action:manipulation;"></button>
        </div>
      `;

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
          if (el) el.innerText = '¡Tu turno! 👆';
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
    btn.style.opacity = '0.3';
    setTimeout(() => btn.style.opacity = '1', 350);
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
      Minigames.showResult('¡Casi! ¿Otra ronda?', '🧠', reward, () => Minigames.startSimonGame(), isRecord);
      return;
    }

    if (this.userSequence.length === this.simonSequence.length) {
      this.simonAcceptingInput = false;
      this.simonScore++;
      Minigames.updateHudScore(this.simonScore);
      Minigames.spectate('cheer');
      const roundTimeout = setTimeout(() => this.nextSimonRound(), 1000);
      this.simonTimers.push(roundTimeout);
    }
  },
});
