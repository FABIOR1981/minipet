// =========================================================
// EXPLOTA-GLOBOS.JS — Tocar los globos antes de que suban y
// se escapen de la pantalla. Juego a contrarreloj (20s).
// =========================================================
Object.assign(Minigames, {
  startPopGame() {
    this.showCountdown(() => {
      const content = document.getElementById('modal-content');
      const best = Minigames.getBestScore('pop');
      content.innerHTML = `
        <h3 style="color:#ab47bc; margin-bottom:2px;">🌸 Explotar Globos</h3>
        ${Minigames.renderHUD('🎈', best, 20)}
        <canvas id="popCanvas" width="300" height="300" style="background:linear-gradient(180deg, #fff3e0 0%, #fce4ec 100%); border-radius:16px; margin:6px auto; display:block; border:3px solid #ff80ab; touch-action:none; width:100%; max-width:300px; height:auto; aspect-ratio:1/1;"></canvas>
        <p style="font-size:0.8rem; text-align:center; color:#666;">¡Toca los globos antes de que suban!</p>
      `;

      const canvas = document.getElementById('popCanvas');
      const ctx = canvas.getContext('2d');
      let balloons = [];
      let score = 0;
      let timeLeft = 20;
      let stopped = false;

      const timerInterval = setInterval(() => {
        timeLeft--;
        Minigames.updateHudTimer(timeLeft);
        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          const isRecord = Minigames.saveBestScore('pop', score);
          Minigames.showResult('¡Tiempo!', '🌸', score, () => Minigames.startPopGame(), isRecord);
        }
      }, 1000);

      const handlePop = (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const scale = Minigames.getCanvasScale(canvas);
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const mouseX = (clientX - rect.left) * scale.x;
        const mouseY = (clientY - rect.top) * scale.y;

        balloons.forEach((b, index) => {
          const dist = Math.hypot(b.x - mouseX, b.y - mouseY);
          if (dist < b.radius + 10) { // Margen extra para dedos en pantalla táctil
            score += 5;
            Minigames.updateHudScore(score);
            AudioEffects.playTone(900, 'triangle', 0.08);
            balloons.splice(index, 1);
          }
        });
      };

      canvas.addEventListener('touchstart', handlePop, { passive: false });
      canvas.onclick = handlePop;

      Minigames.inProgress = true;
      Minigames.exitHandler = () => {
        stopped = true;
        clearInterval(timerInterval);
        canvas.removeEventListener('touchstart', handlePop);
        canvas.onclick = null;
        return score;
      };

      function loop() {
        if (stopped || timeLeft <= 0) return;

        if (Math.random() < 0.05 && balloons.length < 6) {
          balloons.push({
            x: Math.random() * 260 + 20,
            y: 320,
            radius: 18,
            speed: Math.random() * 1.5 + 1.2
          });
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        balloons.forEach((b, index) => {
          b.y -= b.speed;

          ctx.font = `${b.radius * 2}px sans-serif`;
          ctx.fillText('🎈', b.x, b.y);

          if (b.y < -20) balloons.splice(index, 1);
        });

        requestAnimationFrame(loop);
      }

      requestAnimationFrame(loop);
    });
  }
});
