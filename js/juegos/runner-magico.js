import { Dibujos } from '../dibujos.js';
import { Minigames } from './juegos-base.js';
import { AudioEffects } from '../sonidos.js';
// =========================================================
// RUNNER-MAGICO.JS — La mascota corre y salta los hongos que
// se acercan; cada uno esquivado suma monedas. Tiene doble salto
// (el segundo se hace en el aire). Soporte de teclado y táctil.
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
      let saltos = 0; // saltos usados desde el piso: 2 como máximo (doble salto)
      const obstacles = []; // { x, tipo, w, contado }
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
        // Primer salto desde el piso; el segundo sale desde donde esté la mascota en el aire
        if (saltos < 2) {
          playerVY = saltos === 0 ? -11 : -10;
          saltos++;
          isJumping = true;
          AudioEffects.playTone(saltos === 1 ? 550 : 660, 'square', 0.08);
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
          saltos = 0;
        }
        pet.run(!isJumping); // trota en el piso, se estira en el aire

        // Velocidad: sube con el puntaje (hasta un tope)
        const velocidad = 3.0 + Math.min(1.8, score / 80);
        obstacles.forEach((o) => { o.x -= velocidad * f; });

        // Un obstáculo nuevo aparece cuando el anterior ya se alejó lo suficiente.
        // Tres tipos: hongo (saltar), barra (saltar sobre un tramo largo, hay
        // que caer bien) y estrella voladora (no saltar tan alto: se esquiva
        // quedándose en el piso).
        const ultimo = obstacles[obstacles.length - 1];
        if (!ultimo || ultimo.x < W - (170 + Math.random() * 90)) {
          const r = Math.random();
          const tipo = score < 40 || r < 0.55 ? 'hongo' : r < 0.8 ? 'barra' : 'estrella';
          const w = tipo === 'barra' ? 62 : tipo === 'estrella' ? 30 : 22;
          obstacles.push({ x: W, tipo, w, contado: false });
        }

        for (let i = obstacles.length - 1; i >= 0; i--) {
          const o = obstacles[i];
          if (!o.contado && o.x < 15) {
            o.contado = true;
            score += 10;
            Minigames.updateHudScore(score);
            pet.cheer();
            Minigames.celebrar(canvas.parentElement, '✨', '+10');
          }
          if (o.x < -60) obstacles.splice(i, 1);
        }

        // Choque: hongos y barras con la mascota en el piso; la estrella si salta alto
        for (const o of obstacles) {
          const toca = o.x < 48 && o.x + o.w > 12; // se superpone con la zona de la mascota
          if (!toca) continue;
          const choca = o.tipo === 'estrella' ? playerY < STAND - 45 : playerY > STAND - 30;
          if (choca) {
            gameOver = true;
            Minigames.sacudir(canvas.parentElement);
          }
        }

        Minigames.paisaje(ctx, W, H, 'pista');

        // Suelo con marcas que se mueven a la velocidad de los obstáculos
        ctx.fillStyle = '#e1bee7';
        ctx.fillRect(0, GROUND, W, H - GROUND);
        ctx.fillStyle = '#ce93d8';
        ctx.fillRect(0, GROUND, W, 4);
        groundOffset = (groundOffset + velocidad * f) % 40;
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

        // Obstáculos
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.font = '28px sans-serif';
        // Color opaco: los emojis heredan la transparencia del fillStyle (venía el de la sombra)
        ctx.fillStyle = '#000';
        obstacles.forEach((o) => {
          if (o.tipo === 'estrella') {
            Dibujos.dibujar(ctx, '⭐', o.x + 15, STAND - 45);
          } else if (o.tipo === 'barra') {
            // Tramo de piso con rayas, de lado a lado de la barra
            ctx.fillStyle = '#f48fb1';
            ctx.beginPath();
            ctx.roundRect(o.x, GROUND - 24, o.w, 24, 8);
            ctx.fill();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            for (let x = o.x + 8; x < o.x + o.w - 8; x += 16) ctx.fillRect(x, GROUND - 20, 6, 16);
            ctx.font = '28px sans-serif';
            ctx.fillStyle = '#000';
          } else {
            Dibujos.dibujar(ctx, '🍄', o.x + 10, GROUND - 1);
          }
        });

        requestAnimationFrame(loop);
      }

      requestAnimationFrame(loop);
    });
  },
});
