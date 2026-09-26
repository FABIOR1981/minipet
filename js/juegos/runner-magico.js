// =========================================================
// RUNNER-MAGICO.JS — Saltar obstáculos que se acercan; cada
// obstáculo esquivado suma monedas. Soporte de teclado y táctil.
// =========================================================
Object.assign(Minigames, {
  startRunnerGame() {
    this.showCountdown(() => {
      const content = document.getElementById('modal-content');
      const best = Minigames.getBestScore('runner');
      content.innerHTML = `
        <h3 style="color:#ab47bc; margin-bottom:2px;">🦄 Runner Mágico</h3>
        ${Minigames.renderHUD('🦄', best)}
        <canvas id="runnerCanvas" width="300" height="280" style="background:linear-gradient(180deg, #fff9c4 0%, #f3e5f5 100%); border-radius:16px; margin:6px auto; display:block; border:3px solid #ffd54f; touch-action:none; width:100%; max-width:300px; height:auto; aspect-ratio:300/280;"></canvas>
        <p style="font-size:0.8rem; text-align:center; color:#666;">Toca la pantalla o Espacio para saltar</p>
      `;

      const canvas = document.getElementById('runnerCanvas');
      const ctx = canvas.getContext('2d');

      let playerY = 210;
      let playerVY = 0;
      let isJumping = false;
      let obstacleX = 300;
      let score = 0;
      let gameOver = false;

      const jump = (e) => {
        if (e) e.preventDefault();
        if (!isJumping) {
          playerVY = -11;
          isJumping = true;
          AudioEffects.playTone(550, 'square', 0.08);
        }
      };

      const handleKeyDown = (e) => { if (e.code === 'Space') jump(); };
      window.addEventListener('keydown', handleKeyDown);
      canvas.addEventListener('touchstart', jump, { passive: false });
      canvas.onclick = jump;

      Minigames.inProgress = true;
      Minigames.exitHandler = () => {
        window.removeEventListener('keydown', handleKeyDown);
        canvas.removeEventListener('touchstart', jump);
        canvas.onclick = null;
        gameOver = true;
        return score;
      };

      function loop() {
        if (gameOver) {
          window.removeEventListener('keydown', handleKeyDown);
          canvas.removeEventListener('touchstart', jump);
          const isRecord = Minigames.saveBestScore('runner', score);
          Minigames.showResult('¡Juego terminado!', '🦄', score, () => Minigames.startRunnerGame(), isRecord);
          return;
        }

        playerY += playerVY;
        playerVY += 0.65;

        if (playerY >= 210) {
          playerY = 210;
          isJumping = false;
        }

        obstacleX -= 4.2;
        if (obstacleX < -25) {
          obstacleX = 300;
          score += 10;
          Minigames.updateHudScore(score);
        }

        if (obstacleX < 45 && obstacleX > 15 && playerY > 180) gameOver = true;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Suelo
        ctx.fillStyle = '#e1bee7';
        ctx.fillRect(0, 240, 300, 40);

        // Personaje
        ctx.fillStyle = '#ff4081';
        ctx.beginPath();
        ctx.arc(35, playerY + 15, 15, 0, Math.PI * 2);
        ctx.fill();

        // Obstáculo
        ctx.fillStyle = '#ffb300';
        ctx.beginPath();
        ctx.arc(obstacleX + 10, 225, 12, 0, Math.PI * 2);
        ctx.fill();

        requestAnimationFrame(loop);
      }

      requestAnimationFrame(loop);
    });
  },
});
