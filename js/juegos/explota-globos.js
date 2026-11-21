import { Dibujos } from '../dibujos.js';
import { Minigames } from './juegos-base.js';
import { AudioEffects } from '../sonidos.js';
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
        ${Minigames.renderHeader('🌸 Explotar Globos', Minigames.renderHUD('🎈', best, 20))}
        <div class="game-stage">
          <canvas id="popCanvas"></canvas>
        </div>
        <p class="game-hint">Toca los globos antes de que suban.</p>
      `;

      Minigames.mountSpectator();
      const canvas = document.getElementById('popCanvas');
      const ctx = canvas.getContext('2d');
      const { W, H } = Minigames.prepararLienzo(canvas);
      let balloons = [];
      let score = 0;
      let timeLeft = 20;
      let stopped = false;

      // Quien suelta los globos: el anfitrión del staff, que camina por el pasto
      // (si no hay, los globos aparecen solos como antes)
      const STAFF_SIZE = 44;
      const tirador = Minigames.createStaffActor(canvas, STAFF_SIZE, 'minijuegos');
      let staffX = W / 2;
      let objetivoX = null;
      if (tirador) tirador.place(staffX, H - 8);

      const timerInterval = setInterval(() => {
        timeLeft--;
        Minigames.updateHudTimer(timeLeft);
        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          if (tirador) tirador.destroy();
          const isRecord = Minigames.saveBestScore('pop', score);
          Minigames.showResult('Se acabó el tiempo', '🌸', score, () => Minigames.startPopGame(), isRecord);
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

        // Recorrido hacia atrás: quitar un globo no saltea al siguiente
        for (let index = balloons.length - 1; index >= 0; index--) {
          const b = balloons[index];
          const dist = Math.hypot(b.x - mouseX, b.y - mouseY);
          if (dist < b.radius + 10) { // Margen extra para dedos en pantalla táctil
            score += 5;
            Minigames.updateHudScore(score);
            AudioEffects.playTone(900, 'triangle', 0.08);
            Minigames.spectate('cheer');
            if (tirador) tirador.cheer();
            Minigames.celebrar(canvas.parentElement, '✨', '+5');
            balloons.splice(index, 1);
          }
        }
      };

      canvas.addEventListener('touchstart', handlePop, { passive: false });
      canvas.onclick = handlePop;

      Minigames.inProgress = true;
      Minigames.exitHandler = () => {
        stopped = true;
        clearInterval(timerInterval);
        if (tirador) tirador.destroy();
        canvas.removeEventListener('touchstart', handlePop);
        canvas.onclick = null;
        return score;
      };

      const frameClock = Minigames.createFrameClock();

      function loop(now) {
        const f = frameClock(now); // 1 = un frame a 60 Hz
        if (stopped || timeLeft <= 0) return;

        if (tirador) {
          // El anfitrión elige dónde soltar el próximo globo, se desliza y lo suelta
          if (objetivoX === null && balloons.length < 6 && Math.random() < 0.05 * f) {
            objetivoX = Math.random() * 260 + 20;
          }
          if (objetivoX !== null) {
            staffX += (objetivoX - staffX) * Math.min(1, 0.18 * f);
            if (Math.abs(objetivoX - staffX) < 3) {
              balloons.push({ x: staffX, y: H - 52, radius: 24, speed: Math.random() * 1.5 + 1.2 });
              tirador.nod();
              objetivoX = null;
            }
          }
          tirador.place(staffX, H - 8);
        } else if (Math.random() < 0.05 * f && balloons.length < 6) {
          balloons.push({
            x: Math.random() * 260 + 20,
            y: H + 20,
            radius: 24,
            speed: Math.random() * 1.5 + 1.2
          });
        }

        Minigames.paisaje(ctx, W, H, 'globos');
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let index = balloons.length - 1; index >= 0; index--) {
          const b = balloons[index];
          b.y -= b.speed * f;

          ctx.font = `${b.radius * 2}px sans-serif`;
          Dibujos.dibujar(ctx, '🎈', b.x, b.y);

          if (b.y < -20) {
            balloons.splice(index, 1);
            Minigames.spectate('oops'); // se escapó un globo
            if (tirador) tirador.oops();
          }
        }

        requestAnimationFrame(loop);
      }

      requestAnimationFrame(loop);
    });
  }
});
