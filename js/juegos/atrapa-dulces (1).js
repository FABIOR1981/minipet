// =========================================================
// ATRAPA-DULCES.JS — Agarrar con una cesta los dulces que caen
// antes de que toquen el piso. Soporte de teclado y táctil.
// =========================================================
Object.assign(Minigames, {
  startCatchGame() {
    this.showCountdown(() => {
      const content = document.getElementById('modal-content');
      const best = Minigames.getBestScore('catch');
      content.innerHTML = `
        <h3 style="color:#ab47bc; margin-bottom:2px;">🎈 Atrapa Dulces</h3>
        ${Minigames.renderHUD('🍬', best)}
        <canvas id="gameCanvas" width="300" height="300" style="background:linear-gradient(180deg, #e1f5fe 0%, #f3e5f5 100%); border-radius:16px; margin:6px auto; display:block; border:3px solid #ce93d8; touch-action:none; width:100%; max-width:300px; height:auto; aspect-ratio:1/1;"></canvas>
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
        gameOver = true;
        return score;
      };

      function loop() {
        if (gameOver) {
          window.removeEventListener('keydown', handleKeyDown);
          window.removeEventListener('keyup', handleKeyUp);
          canvas.removeEventListener('touchstart', handleTouch);
          canvas.removeEventListener('touchmove', handleTouch);
          const isRecord = Minigames.saveBestScore('catch', score);
          Minigames.showResult('¡Juego terminado!', '🎈', score, () => Minigames.startCatchGame(), isRecord);
          return;
        }

        if (keys['ArrowLeft'] && basketX > 5) basketX -= 6;
        if (keys['ArrowRight'] && basketX < 235) basketX += 6;

        itemY += 3.8;

        if (itemY >= 260 && itemX >= basketX - 10 && itemX <= basketX + 60) {
          score += 5;
          Minigames.updateHudScore(score);
          AudioEffects.playTone(800, 'sine', 0.05);
          itemY = 0;
          itemX = Math.random() * 250 + 10;
          currentCandy = CANDY_EMOJIS[Math.floor(Math.random() * CANDY_EMOJIS.length)];
        }

        if (itemY > 300) gameOver = true;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Cesta
        ctx.font = '38px sans-serif';
        ctx.fillText('🧺', basketX + 30, 285);

        // Dulce cayendo
        ctx.font = '26px sans-serif';
        ctx.fillText(currentCandy, itemX, itemY);

        requestAnimationFrame(loop);
      }

      requestAnimationFrame(loop);
    });
  }
});
