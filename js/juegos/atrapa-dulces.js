import { Dibujos } from '../dibujos.js';
import { Minigames } from './juegos-base.js';
import { AudioEffects } from '../sonidos.js';
// =========================================================
// ATRAPA-DULCES.JS — La mascota corre de lado a lado y atrapa
// los dulces que caen antes de que toquen el piso. Soporte de
// teclado y táctil.
// =========================================================
Object.assign(Minigames, {
  startCatchGame() {
    this.showCountdown(() => {
      const content = document.getElementById('modal-content');
      const best = Minigames.getBestScore('catch');
      content.innerHTML = `
        <h3 class="game-title">🎈 Atrapa Dulces</h3>
        ${Minigames.renderHUD('🍬', best)}
        <div class="game-stage">
          <canvas id="gameCanvas"></canvas>
        </div>
        <p class="game-hint">Arrastra el dedo o usa las flechas para moverte</p>
      `;

      const canvas = document.getElementById('gameCanvas');
      const ctx = canvas.getContext('2d');
      const { W, H } = Minigames.prepararLienzo(canvas);
      const CANDY_EMOJIS = ['🍬', '🍭', '🍡', '🍫'];
      let basketX = 120;
      let itemX = Math.random() * 260 + 10;
      let itemY = 0;
      let currentCandy = CANDY_EMOJIS[Math.floor(Math.random() * CANDY_EMOJIS.length)];
      let score = 0;
      let gameOver = false;
      let stopped = false; // Salida forzada: las monedas ya las cobra forceExitIfActive()

      // La mascota es quien atrapa. basketX sigue siendo el borde izquierdo de
      // la zona de atrape (60 de ancho), así la dificultad no cambia.
      const PET_SIZE = 58;
      const GROUND = H - 14;
      const pet = Minigames.createActor(canvas, PET_SIZE);
      pet.place(basketX + 30, GROUND);

      // Quien tira los dulces: el anfitrión del staff (si no hay, caen del cielo como antes)
      const STAFF_SIZE = 44, STAFF_Y = 54, MANO = 26;
      const tirador = Minigames.createStaffActor(canvas, STAFF_SIZE, 'minijuegos');
      let staffX = W / 2;
      let objetivoX = itemX;
      let apuntando = tirador ? 28 : 0; // frames de espera antes de soltar
      if (tirador) { tirador.place(staffX, STAFF_Y); itemY = -999; }
      const nuevoDulce = () => {
        currentCandy = CANDY_EMOJIS[Math.floor(Math.random() * CANDY_EMOJIS.length)];
        itemX = Math.random() * 250 + 10;
        if (tirador) { objetivoX = itemX; itemY = -999; apuntando = 24; }
        else itemY = 0;
      };

      // Teclado
      const keys = {};
      const handleKeyDown = (e) => keys[e.key] = true;
      const handleKeyUp = (e) => keys[e.key] = false;
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);

      // Controles Táctiles (Móvil / Tablet)
      const handleTouch = (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const scale = Minigames.getCanvasScale(canvas);
        const touchX = (e.touches[0].clientX - rect.left) * scale.x;
        basketX = Math.max(0, Math.min(240, touchX - 30));
      };
      canvas.addEventListener('touchstart', handleTouch, { passive: false });
      canvas.addEventListener('touchmove', handleTouch, { passive: false });

      Minigames.inProgress = true;
      Minigames.exitHandler = () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        canvas.removeEventListener('touchstart', handleTouch);
        canvas.removeEventListener('touchmove', handleTouch);
        stopped = true;
        pet.destroy();
        if (tirador) tirador.destroy();
        return score;
      };

      const frameClock = Minigames.createFrameClock();

      function loop(now) {
        const f = frameClock(now); // 1 = un frame a 60 Hz
        if (stopped) return;
        if (gameOver) {
          window.removeEventListener('keydown', handleKeyDown);
          window.removeEventListener('keyup', handleKeyUp);
          canvas.removeEventListener('touchstart', handleTouch);
          canvas.removeEventListener('touchmove', handleTouch);
          pet.destroy();
          if (tirador) tirador.destroy();
          const isRecord = Minigames.saveBestScore('catch', score);
          Minigames.showResult('Fin del juego', '🎈', score, () => Minigames.startCatchGame(), isRecord);
          return;
        }

        if (keys['ArrowLeft']) basketX = Math.max(0, basketX - 6 * f);
        if (keys['ArrowRight']) basketX = Math.min(240, basketX + 6 * f);

        if (tirador && itemY === -999) {
          // El anfitrión se desliza hasta su posición y suelta el dulce
          const meta = Math.max(STAFF_SIZE / 2, Math.min(W - STAFF_SIZE / 2, objetivoX - MANO));
          staffX += (meta - staffX) * Math.min(1, 0.12 * f);
          if (Math.abs(meta - staffX) < 3) {
            apuntando -= f;
            if (apuntando <= 0) {
              itemX = Math.max(10, Math.min(W - 10, staffX + MANO));
              itemY = STAFF_Y - 20;
              tirador.nod();
            }
          }
        } else {
          itemY += (tirador ? 4.1 : 3.8) * f;
        }

        if (itemY >= GROUND - 36 && itemX >= basketX - 10 && itemX <= basketX + 60) {
          score += 5;
          Minigames.updateHudScore(score);
          AudioEffects.playTone(800, 'sine', 0.05);
          pet.cheer();
          if (tirador) tirador.cheer();
          Minigames.celebrar(canvas.parentElement, '✨', '+5');
          nuevoDulce();
        }

        if (itemY > H) { gameOver = true; if (tirador) tirador.oops(); }

        Minigames.paisaje(ctx, W, H, 'dulces');
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Sombra de la mascota en el piso
        ctx.fillStyle = 'rgba(74, 20, 140, 0.16)';
        ctx.beginPath();
        ctx.ellipse(basketX + 30, GROUND - 2, 24, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        pet.place(basketX + 30, GROUND);

        if (tirador) tirador.place(staffX, STAFF_Y);

        // Dulce cayendo (o sostenido por el anfitrión mientras apunta)
        ctx.font = (tirador && itemY === -999 ? '24px' : '34px') + ' sans-serif';
        // Color opaco: los emojis heredan la transparencia del fillStyle (venía el de la sombra)
        ctx.fillStyle = '#000';
        if (tirador && itemY === -999) Dibujos.dibujar(ctx, currentCandy, staffX + MANO, STAFF_Y - 22);
        else Dibujos.dibujar(ctx, currentCandy, itemX, itemY);

        requestAnimationFrame(loop);
      }

      requestAnimationFrame(loop);
    });
  }
});
