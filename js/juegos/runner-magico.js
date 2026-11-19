import { Dibujos } from '../dibujos.js';
import { Minigames } from './juegos-base.js';
import { AudioEffects } from '../sonidos.js';
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
        <h3 class="game-title">🦄 Runner Mágico</h3>
        ${Minigames.renderHUD('🦄', best)}
        <div class="game-stage">
          <canvas id="runnerCanvas"></canvas>
        </div>
        <p class="game-hint">Toca la pantalla o Espacio para saltar</p>
      `;

      const canvas = document.getElementById('runnerCanvas');
      const ctx = canvas.getContext('2d');
      const { W, H } = Minigames.prepararLienzo(canvas);

      // Altura de la mascota de pie (su borde superior) y del piso, según el alto del lienzo
      const GROUND = H - 40;
      const STAND = GROUND - 30;
      let playerY = STAND;
      let playerVY = 0;
      let isJumping = false;
      let obstacleX = W;
      let score = 0;
      let gameOver = false;
      let stopped = false; // Salida forzada: las monedas ya las cobra forceExitIfActive()

      // La mascota es la corredora. playerY sigue siendo el borde superior de
      // la zona de choque (30 de alto), así la dificultad no cambia.
      const PET_SIZE = 42;
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
          Minigames.showResult('Fin del juego', '🦄', score, () => Minigames.startRunnerGame(), isRecord);
          return;
        }

        playerY += playerVY * f;
        playerVY += 0.65 * f;

        if (playerY >= STAND) {
          playerY = STAND;
          isJumping = false;
        }
        pet.run(!isJumping); // trota en el piso, se estira en el aire

        obstacleX -= 4.2 * f;
        if (obstacleX < -25) {
          obstacleX = W;
          score += 10;
          Minigames.updateHudScore(score);
          pet.cheer();
          Minigames.celebrar(canvas.parentElement, '✨', '+10');
        }

        if (obstacleX < 45 && obstacleX > 15 && playerY > STAND - 30) {
          gameOver = true;
          Minigames.sacudir(canvas.parentElement);
        }

        Minigames.paisaje(ctx, W, H, 'pista');

        // Suelo con marcas que se mueven a la velocidad de los obstáculos
        ctx.fillStyle = '#e1bee7';
        ctx.fillRect(0, GROUND, W, H - GROUND);
        ctx.fillStyle = '#ce93d8';
        ctx.fillRect(0, GROUND, W, 4);
        groundOffset = (groundOffset + 4.2 * f) % 40;
        ctx.fillStyle = '#d7aee0';
        for (let x = -groundOffset; x < W; x += 40) {
          ctx.fillRect(x, GROUND + 16, 18, 5);
          ctx.fillRect(x + 20, GROUND + 28, 12, 4);
        }

        // Sombra de la mascota: se achica cuando salta
        const air = (STAND - playerY) / 100;
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
        Dibujos.dibujar(ctx, '🍄', obstacleX + 10, GROUND - 1);

        requestAnimationFrame(loop);
      }

      requestAnimationFrame(loop);
    });
  },
});
