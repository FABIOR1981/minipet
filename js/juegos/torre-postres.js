// =========================================================
// TORRE-POSTRES.JS — Apilar capas de pastel tocando en el
// momento justo; si la capa cae mal apilada, se acaba el juego.
// =========================================================
Object.assign(Minigames, {
  startCakeGame() {
    this.showCountdown(() => {
      const content = document.getElementById('modal-content');
      const best = Minigames.getBestScore('cake');
      content.innerHTML = `
        <h3 style="color:#ab47bc; margin-bottom:2px;">🍰 Torre de Postres</h3>
        ${Minigames.renderHUD('🍰', best)}
        <canvas id="cakeCanvas" width="300" height="300" style="background:#f3e5f5; border-radius:16px; margin:6px auto; display:block; border:3px solid #b388ff; touch-action:none; width:100%; max-width:300px; height:auto; aspect-ratio:1/1;"></canvas>
        <p style="font-size:0.8rem; text-align:center; color:#666;">Toca la pantalla para apilar el pastel</p>
      `;

      const canvas = document.getElementById('cakeCanvas');
      const ctx = canvas.getContext('2d');
      let layers = [{ x: 100, width: 100, y: 270 }];
      let currentX = 0;
      let currentSpeed = 3;
      let score = 0;
      let gameOver = false;

      const dropLayer = (e) => {
        if (e) e.preventDefault();
        if (gameOver) return;
        const prev = layers[layers.length - 1];
        const diff = currentX - prev.x;

        if (Math.abs(diff) > prev.width) {
          gameOver = true;
          const isRecord = Minigames.saveBestScore('cake', score);
          Minigames.showResult('¡Se cayó la torre!', '🍰', score, () => Minigames.startCakeGame(), isRecord);
          return;
        }

        score += 10;
        Minigames.updateHudScore(score);
        AudioEffects.playTone(700, 'sine', 0.1);
        const newWidth = prev.width - Math.abs(diff);
        const newX = diff > 0 ? currentX : prev.x;

        layers.push({ x: newX, width: newWidth, y: prev.y - 25 });
        currentX = 0;

        if (layers.length > 8) {
          layers.forEach(l => l.y += 25);
        }
      };

      canvas.addEventListener('touchstart', dropLayer, { passive: false });
      canvas.onclick = dropLayer;

      const handleSpace = (e) => { if (e.code === 'Space') dropLayer(); };
      window.addEventListener('keydown', handleSpace);

      Minigames.inProgress = true;
      Minigames.exitHandler = () => {
        canvas.removeEventListener('touchstart', dropLayer);
        canvas.onclick = null;
        window.removeEventListener('keydown', handleSpace);
        gameOver = true;
        return score;
      };

      function loop() {
        if (gameOver) {
          window.removeEventListener('keydown', handleSpace);
          return;
        }

        currentX += currentSpeed;
        const prevWidth = layers[layers.length - 1].width;
        if (currentX > 300 - prevWidth || currentX < 0) currentSpeed *= -1;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        layers.forEach((l, i) => {
          ctx.fillStyle = i % 2 === 0 ? '#ff80ab' : '#80cbc4';
          ctx.beginPath();
          ctx.roundRect(l.x, l.y, l.width, 22, 6);
          ctx.fill();
        });

        const currentY = layers[layers.length - 1].y - 25;
        ctx.fillStyle = '#ffd54f';
        ctx.beginPath();
        ctx.roundRect(currentX, currentY, prevWidth, 22, 6);
        ctx.fill();

        requestAnimationFrame(loop);
      }

      requestAnimationFrame(loop);
    });
  }
});
