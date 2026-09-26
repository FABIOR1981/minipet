// =========================================================
// SIMON-MEMORIA.JS — Memorizar y repetir la secuencia de
// colores que se enciende, una ronda más larga cada vez.
// =========================================================
Object.assign(Minigames, {
  startSimonGame() {
    this.showCountdown(() => {
      const content = document.getElementById('modal-content');
      const best = Minigames.getBestScore('simon');
      content.innerHTML = `
        <h3 style="color:#ab47bc; margin-bottom:2px;">🎯 Simón Memoria</h3>
        ${Minigames.renderHUD('🧠', best)}
        <p id="simon-status" style="margin-top:5px; text-align:center; font-weight:bold; color:#7e57c2;">¡Memoriza la secuencia!</p>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin:20px 0;">
          <button id="simon-0" onclick="Minigames.simonClick(0)" style="height:75px; background:#ff80ab; border:none; border-radius:18px; cursor:pointer; box-shadow:0 4px 0 #f50057; touch-action:manipulation;"></button>
          <button id="simon-1" onclick="Minigames.simonClick(1)" style="height:75px; background:#80deea; border:none; border-radius:18px; cursor:pointer; box-shadow:0 4px 0 #00acc1; touch-action:manipulation;"></button>
          <button id="simon-2" onclick="Minigames.simonClick(2)" style="height:75px; background:#b388ff; border:none; border-radius:18px; cursor:pointer; box-shadow:0 4px 0 #673ab7; touch-action:manipulation;"></button>
          <button id="simon-3" onclick="Minigames.simonClick(3)" style="height:75px; background:#ffe082; border:none; border-radius:18px; cursor:pointer; box-shadow:0 4px 0 #ffb300; touch-action:manipulation;"></button>
        </div>
      `;

      this.simonSequence = [];
      this.userSequence = [];
      this.simonScore = 0;
      this.nextSimonRound();

      Minigames.inProgress = true;
      Minigames.exitHandler = () => Minigames.simonScore * 10;
    });
  },

  nextSimonRound() {
    this.userSequence = [];
    this.simonSequence.push(Math.floor(Math.random() * 4));
    document.getElementById('simon-status').innerText = `Ronda ${this.simonSequence.length} ✨`;
    
    let i = 0;
    const interval = setInterval(() => {
      if (i >= this.simonSequence.length) {
        clearInterval(interval);
        return;
      }
      this.flashSimonButton(this.simonSequence[i]);
      i++;
    }, 700);
  },

  flashSimonButton(index) {
    const btn = document.getElementById(`simon-${index}`);
    if (!btn) return;
    const freqs = [350, 450, 550, 650];
    AudioEffects.playTone(freqs[index], 'sine', 0.15);
    btn.style.opacity = '0.3';
    setTimeout(() => btn.style.opacity = '1', 350);
  },

  simonClick(index) {
    this.flashSimonButton(index);
    this.userSequence.push(index);

    const currentIndex = this.userSequence.length - 1;
    if (this.userSequence[currentIndex] !== this.simonSequence[currentIndex]) {
      const reward = this.simonScore * 10;
      const isRecord = Minigames.saveBestScore('simon', this.simonScore);
      Minigames.showResult('¡Te equivocaste!', '🧠', reward, () => Minigames.startSimonGame(), isRecord);
      return;
    }

    if (this.userSequence.length === this.simonSequence.length) {
      this.simonScore++;
      Minigames.updateHudScore(this.simonScore);
      setTimeout(() => this.nextSimonRound(), 1000);
    }
  },
});
