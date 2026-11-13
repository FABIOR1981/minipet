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
        <h3 style="color:#ab47bc; margin-bottom:2px;">🎈 Atrapa Dulces</h3>
        ${Minigames.renderHUD('🍬', best)}
        <div class="game-stage">
          <canvas id="gameCanvas" width="300" height="300" style="background:linear-gradient(180deg, #e1f5fe 0%, #f3e5f5 100%); border-radius:16px; display:block; border:3px solid #ce93d8; touch-action:none; width:100%; height:auto; aspect-ratio:1/1;"></canvas>
        </div>
        <p style="font-size:0.8rem; text-align:center; color:#666;">Arrastra el dedo o usa ⬅️ ➡️ para moverte</p>
      `;

      const canvas = document.getElementById('gameCanvas');
      const ctx = canvas.getContext('2d');
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
      const GROUND = 296;
      const pet = Minigames.createActor(canvas, PET_SIZE);
      pet.place(basketX + 30, GROUND);

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
          const isRecord = Minigames.saveBestScore('catch', score);
          Minigames.showResult('¡Juego terminado!', '🎈', score, () => Minigames.startCatchGame(), isRecord);
          return;
        }

        if (keys['ArrowLeft']) basketX = Math.max(0, basketX - 6 * f);
        if (keys['ArrowRight']) basketX = Math.min(240, basketX + 6 * f);

        itemY += 3.8 * f;

        if (itemY >= 260 && itemX >= basketX - 10 && itemX <= basketX + 60) {
          score += 5;
          Minigames.updateHudScore(score);
          AudioEffects.playTone(800, 'sine', 0.05);
          pet.cheer();
          itemY = 0;
          itemX = Math.random() * 250 + 10;
          currentCandy = CANDY_EMOJIS[Math.floor(Math.random() * CANDY_EMOJIS.length)];
        }

        if (itemY > 300) gameOver = true;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Sombra de la mascota en el piso
        ctx.fillStyle = 'rgba(74, 20, 140, 0.16)';
        ctx.beginPath();
        ctx.ellipse(basketX + 30, GROUND - 2, 24, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        pet.place(basketX + 30, GROUND);

        // Dulce cayendo
        ctx.font = '26px sans-serif';
        // Color opaco: los emojis heredan la transparencia del fillStyle (venía el de la sombra)
        ctx.fillStyle = '#000';
        ctx.fillText(currentCandy, itemX, itemY);

        requestAnimationFrame(loop);
      }

      requestAnimationFrame(loop);
    });
  }
});
