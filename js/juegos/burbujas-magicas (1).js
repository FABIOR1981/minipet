// =========================================================
// BURBUJAS-MAGICAS.JS — Tocar burbujas antes de que se vayan;
// las doradas valen más puntos. Juego a contrarreloj (15s).
// =========================================================
Object.assign(Minigames, {
  startBubbleGame() {
    this.showCountdown(() => {
      const content = document.getElementById('modal-content');
      const best = Minigames.getBestScore('bubble');
      content.innerHTML = `
        <h3 style="color:#ab47bc; margin-bottom:2px;">✨ Burbujas Mágicas</h3>
        ${Minigames.renderHUD('✨', best, 15)}
        <canvas id="bubbleCanvas" width="300" height="300" style="background:linear-gradient(180deg, #e0f2f1 0%, #e8eaf6 100%); border-radius:16px; margin:6px auto; display:block; border:3px solid #80cbc4; touch-action:none; width:100%; max-width:300px; height:auto; aspect-ratio:1/1;"></canvas>
        <p style="font-size:0.8rem; text-align:center; color:#666;">Toca las burbujas para atraparlas</p>
      `;

      const canvas = document.getElementById('bubbleCanvas');
      const ctx = canvas.getContext('2d');
      let bubbles = [];
      let score = 0;
      let timeLeft = 15;
      let stopped = false;

      const timer = setInterval(() => {
        timeLeft--;
        Minigames.updateHudTimer(timeLeft);
        if (timeLeft <= 0) {
          clearInterval(timer);
          const isRecord = Minigames.saveBestScore('bubble', score);
          Minigames.showResult('¡Tiempo!', '✨', score, () => Minigames.startBubbleGame(), isRecord);
        }
      }, 1000);

      const handleTouchBubble = (e) => {
        if (e) e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const scale = Minigames.getCanvasScale(canvas);
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const mx = (clientX - rect.left) * scale.x;
        const my = (clientY - rect.top) * scale.y;

        bubbles.forEach((b, i) => {
          if (Math.hypot(b.x - mx, b.y - my) < b.r + 8) { // Margen táctil
            score += b.isGolden ? 15 : 5;
            Minigames.updateHudScore(score);
            AudioEffects.playTone(b.isGolden ? 1000 : 750, 'sine', 0.1);
            bubbles.splice(i, 1);
          }
        });
      };

      canvas.addEventListener('touchstart', handleTouchBubble, { passive: false });
      canvas.onclick = handleTouchBubble;

      Minigames.inProgress = true;
      Minigames.exitHandler = () => {
        stopped = true;
        clearInterval(timer);
        canvas.removeEventListener('touchstart', handleTouchBubble);
        canvas.onclick = null;
        return score;
      };

      function loop() {
        if (stopped || timeLeft <= 0) return;

        if (Math.random() < 0.08 && bubbles.length < 7) {
          const isGolden = Math.random() < 0.3;
          bubbles.push({
            x: Math.random() * 250 + 25,
            y: Math.random() * 220 + 40,
            r: Math.random() * 8 + 16,
            isGolden: isGolden
          });
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        bubbles.forEach(b => {
          ctx.font = `${b.r * 2}px sans-serif`;
          ctx.fillText(b.isGolden ? '🌟' : '🫧', b.x, b.y);
        });

        requestAnimationFrame(loop);
      }

      requestAnimationFrame(loop);
    });
  }
});
