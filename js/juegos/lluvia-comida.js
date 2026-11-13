// =========================================================
// LLUVIA-COMIDA.JS — Cae comida mezclada con cosas que no se
// comen. La mascota atrapa la comida y esquiva lo demás; tiene
// tres corazones. Va cayendo cada vez más rápido.
// Soporte de teclado y táctil.
// =========================================================
Object.assign(Minigames, {
  startFoodGame() {
    this.showCountdown(() => {
      const content = document.getElementById('modal-content');
      const best = Minigames.getBestScore('food');
      content.innerHTML = `
        <h3 class="game-title" style="text-align:center;">🍎 Lluvia de Comida</h3>
        ${Minigames.renderHUD('🍎', best)}
        <div class="game-stage">
          <canvas id="foodCanvas" width="300" height="300" style="background:linear-gradient(180deg, #e8f5e9 0%, #fff8e1 100%); border-radius:16px; display:block; border:3px solid #a5d6a7; touch-action:none; width:100%; height:auto; aspect-ratio:1/1;"></canvas>
        </div>
        <p class="game-hint">Atrapa la comida 🍎 y esquiva lo que no se come 🧦</p>
      `;
      document.querySelector('.game-hud').insertAdjacentHTML('beforeend', '<span class="hud-chip hud-timer" id="hud-lives">❤️❤️❤️</span>');

      const canvas = document.getElementById('foodCanvas');
      const ctx = canvas.getContext('2d');
      const FOOD = ['🍎', '🥕', '🍓', '🍌', '🥦', '🍇', '🧀', '🍉'];
      const NOT_FOOD = ['🧦', '👟', '⚽', '🔧', '🧸', '🔑'];
      const PET_SIZE = 58;
      const GROUND = 296;

      let petX = 150;
      let items = [];
      let score = 0;
      let lives = 3;
      let elapsed = 0;      // frames (a 60 Hz) desde que empezó
      let nextSpawn = 20;
      let gameOver = false;
      let stopped = false;  // Salida forzada: las monedas ya las cobra forceExitIfActive()

      const pet = Minigames.createActor(canvas, PET_SIZE);
      pet.place(petX, GROUND);

      // Teclado
      const keys = {};
      const handleKeyDown = (e) => keys[e.key] = true;
      const handleKeyUp = (e) => keys[e.key] = false;
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);

      // Táctil y mouse: la mascota sigue al dedo
      const handlePointer = (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const scale = Minigames.getCanvasScale(canvas);
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        petX = Math.max(30, Math.min(270, (clientX - rect.left) * scale.x));
      };
      canvas.addEventListener('touchstart', handlePointer, { passive: false });
      canvas.addEventListener('touchmove', handlePointer, { passive: false });
      canvas.addEventListener('mousemove', handlePointer);

      const cleanup = () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        canvas.removeEventListener('touchstart', handlePointer);
        canvas.removeEventListener('touchmove', handlePointer);
        canvas.removeEventListener('mousemove', handlePointer);
        pet.destroy();
      };

      Minigames.inProgress = true;
      Minigames.exitHandler = () => {
        cleanup();
        stopped = true;
        return score;
      };

      const frameClock = Minigames.createFrameClock();

      function loop(now) {
        const f = frameClock(now); // 1 = un frame a 60 Hz
        if (stopped) return;
        if (gameOver) {
          cleanup();
          const isRecord = Minigames.saveBestScore('food', score);
          Minigames.showResult('¡Buen provecho!', '🍎', score, () => Minigames.startFoodGame(), isRecord);
          return;
        }

        elapsed += f;
        if (keys['ArrowLeft']) petX = Math.max(30, petX - 6 * f);
        if (keys['ArrowRight']) petX = Math.min(270, petX + 6 * f);

        // Aparición: cada vez más seguida, hasta un tope
        nextSpawn -= f;
        if (nextSpawn <= 0) {
          const good = Math.random() < 0.65;
          const list = good ? FOOD : NOT_FOOD;
          items.push({
            x: Math.random() * 260 + 20,
            y: -16,
            good,
            emoji: list[Math.floor(Math.random() * list.length)],
            // Velocidad: sube de a poco durante el primer minuto
            speed: 2.2 + Math.min(2.2, elapsed / 60 * 0.045) + Math.random() * 0.6
          });
          nextSpawn = Math.max(24, 58 - elapsed / 60 * 0.7);
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Sombra de la mascota
        ctx.fillStyle = 'rgba(27, 94, 32, 0.16)';
        ctx.beginPath();
        ctx.ellipse(petX, GROUND - 2, 24, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        pet.place(petX, GROUND);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '26px sans-serif';

        for (let i = items.length - 1; i >= 0; i--) {
          const item = items[i];
          item.y += item.speed * f;

          // La atrapa (o la toca) cuando llega a la altura de la mascota
          if (item.y >= 250 && item.y <= 288 && Math.abs(item.x - petX) < 30) {
            if (item.good) {
              score += 5;
              Minigames.updateHudScore(score);
              AudioEffects.playTone(800, 'sine', 0.05);
              pet.cheer();
            } else {
              lives--;
              document.getElementById('hud-lives').innerText = '❤️'.repeat(lives) + '🤍'.repeat(3 - lives);
              AudioEffects.playTone(260, 'sine', 0.15);
              pet.oops();
              if (lives <= 0) gameOver = true;
            }
            items.splice(i, 1);
            continue;
          }

          if (item.y > 320) {
            items.splice(i, 1); // lo que cae al piso no resta
            continue;
          }
          ctx.fillText(item.emoji, item.x, item.y);
        }

        requestAnimationFrame(loop);
      }

      requestAnimationFrame(loop);
    });
  }
});
