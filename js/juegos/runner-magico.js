// =========================================================
// RUNNER-MAGICO.JS — La mascota corre y salta los hongos que
// se acercan; cada uno esquivado suma monedas. Soporte de
// teclado y táctil.
// =========================================================
Object.assign(Minigames, {
  startRunnerGame() {
    this.showCountdown(() => {
      const content = document.getElementById('modal-content');
      const best = Minigames.getBestScore('runner');
      content.innerHTML = `
        <h3 style="color:#ab47bc; margin-bottom:2px;">🦄 Runner Mágico</h3>
        ${Minigames.renderHUD('🦄', best)}
        <div class="game-stage">
          <canvas id="runnerCanvas" width="300" height="280" style="background:linear-gradient(180deg, #fff9c4 0%, #f3e5f5 100%); border-radius:16px; display:block; border:3px solid #ffd54f; touch-action:none; width:100%; height:auto; aspect-ratio:300/280;"></canvas>
        </div>
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
      let stopped = false; // Salida forzada: las monedas ya las cobra forceExitIfActive()

      // La mascota es la corredora. playerY sigue siendo el borde superior de
      // la zona de choque (30 de alto), así la dificultad no cambia.
      const PET_SIZE = 42;
      const GROUND = 240;
      const pet = Minigames.createActor(canvas, PET_SIZE);
      pet.run();
      pet.place(35, GROUND);
      let groundOffset = 0; // desplazamiento de las marcas del piso
      let cloudX = 220;

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
        stopped = true;
        pet.destroy();
        return score;
      };

      const frameClock = Minigames.createFrameClock();

      function loop(now) {
        const f = frameClock(now); // 1 = un frame a 60 Hz
        if (stopped) return;
        if (gameOver) {
          window.removeEventListener('keydown', handleKeyDown);
          canvas.removeEventListener('touchstart', jump);
          pet.destroy();
          const isRecord = Minigames.saveBestScore('runner', score);
          Minigames.showResult('¡Juego terminado!', '🦄', score, () => Minigames.startRunnerGame(), isRecord);
          return;
        }

        playerY += playerVY * f;
        playerVY += 0.65 * f;

        if (playerY >= 210) {
          playerY = 210;
          isJumping = false;
        }
        pet.run(!isJumping); // trota en el piso, se estira en el aire

        obstacleX -= 4.2 * f;
        if (obstacleX < -25) {
          obstacleX = 300;
          score += 10;
          Minigames.updateHudScore(score);
          pet.cheer();
        }

        if (obstacleX < 45 && obstacleX > 15 && playerY > 180) gameOver = true;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Nube que pasa lento, para dar sensación de avance
        cloudX -= 0.5 * f;
        if (cloudX < -50) cloudX = 330;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.ellipse(cloudX, 60, 26, 12, 0, 0, Math.PI * 2);
        ctx.ellipse(cloudX - 14, 54, 13, 11, 0, 0, Math.PI * 2);
        ctx.ellipse(cloudX + 8, 50, 16, 13, 0, 0, Math.PI * 2);
        ctx.fill();

        // Suelo con marcas que se mueven a la velocidad de los obstáculos
        ctx.fillStyle = '#e1bee7';
        ctx.fillRect(0, GROUND, 300, 40);
        ctx.fillStyle = '#ce93d8';
        ctx.fillRect(0, GROUND, 300, 4);
        groundOffset = (groundOffset + 4.2 * f) % 40;
        ctx.fillStyle = '#d7aee0';
        for (let x = -groundOffset; x < 300; x += 40) {
          ctx.fillRect(x, GROUND + 16, 18, 5);
          ctx.fillRect(x + 20, GROUND + 28, 12, 4);
        }

        // Sombra de la mascota: se achica cuando salta
        const air = (210 - playerY) / 100;
        ctx.fillStyle = 'rgba(74, 20, 140, 0.18)';
        ctx.beginPath();
        ctx.ellipse(35, GROUND + 3, Math.max(8, 18 - air * 8), Math.max(2, 5 - air * 2), 0, 0, Math.PI * 2);
        ctx.fill();

        // Mascota (sus pies van en playerY + 30)
        pet.place(35, playerY + 30);

        // Obstáculo
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.font = '26px sans-serif';
        // Color opaco: los emojis heredan la transparencia del fillStyle (venía el de la sombra)
        ctx.fillStyle = '#000';
        ctx.fillText('🍄', obstacleX + 10, GROUND - 1);

        requestAnimationFrame(loop);
      }

      requestAnimationFrame(loop);
    });
  },
});
