const Minigames = {
  renderMenu() {
    const content = document.getElementById('modal-content');
    content.innerHTML = `
      <h2>🎮 Elige un Minijuego</h2>
      <p style="margin-bottom:15px; font-size:0.9rem; color:#555;">¡Gana monedas para comprar accesorios en la tienda!</p>
      <div style="display:flex; flex-direction:column; gap:12px;">
        <button class="menu-btn" onclick="Minigames.startCatchGame()">🍎 Atrapa las Manzanas</button>
        <button class="menu-btn" onclick="Minigames.startSimonGame()">🎯 Simón Dice (Memoria)</button>
        <button class="menu-btn" onclick="Minigames.startRunnerGame()">🏃 Runner Infinito</button>
      </div>
    `;
  },

  startCatchGame() {
    const content = document.getElementById('modal-content');
    content.innerHTML = `
      <h3>🍎 Atrapa las Manzanas</h3>
      <canvas id="gameCanvas" width="300" height="320" style="background:#e0f7fa; border-radius:12px; margin:10px auto; display:block;"></canvas>
      <p style="font-size:0.85rem; text-align:center;">Usa las Flechas ⬅️ ➡️ para moverte</p>
    `;

    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    let basketX = 120;
    let appleX = Math.random() * 260;
    let appleY = 0;
    let score = 0;
    let gameOver = false;

    const keys = {};
    const handleKeyDown = (e) => keys[e.key] = true;
    const handleKeyUp = (e) => keys[e.key] = false;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    function loop() {
      if (gameOver) {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        PetState.addCoins(score);
        alert(`¡Juego terminado! Ganaste 🪙 ${score} monedas.`);
        Minigames.renderMenu();
        return;
      }

      if (keys['ArrowLeft'] && basketX > 0) basketX -= 5;
      if (keys['ArrowRight'] && basketX < 240) basketX += 5;

      appleY += 3.5;

      if (appleY >= 280 && appleX >= basketX - 15 && appleX <= basketX + 60) {
        score += 5;
        AudioEffects.playTone(800, 'sine', 0.05);
        appleY = 0;
        appleX = Math.random() * 260;
      }

      if (appleY > 320) gameOver = true;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#8d6e63';
      ctx.fillRect(basketX, 290, 60, 15);

      ctx.fillStyle = '#e53935';
      ctx.beginPath();
      ctx.arc(appleX + 10, appleY + 10, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#333';
      ctx.font = '16px sans-serif';
      ctx.fillText(`Monedas: ${score}`, 10, 25);

      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
  },

  startSimonGame() {
    const content = document.getElementById('modal-content');
    content.innerHTML = `
      <h3>🎯 Simón Dice</h3>
      <p id="simon-status" style="margin-top:5px;">¡Memoriza el patrón!</p>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin:20px 0;">
        <button id="simon-0" onclick="Minigames.simonClick(0)" style="height:80px; background:#ef5350; border:none; border-radius:12px; cursor:pointer;"></button>
        <button id="simon-1" onclick="Minigames.simonClick(1)" style="height:80px; background:#42a5f5; border:none; border-radius:12px; cursor:pointer;"></button>
        <button id="simon-2" onclick="Minigames.simonClick(2)" style="height:80px; background:#66bb6a; border:none; border-radius:12px; cursor:pointer;"></button>
        <button id="simon-3" onclick="Minigames.simonClick(3)" style="height:80px; background:#ffee58; border:none; border-radius:12px; cursor:pointer;"></button>
      </div>
    `;

    this.simonSequence = [];
    this.userSequence = [];
    this.simonScore = 0;
    this.nextSimonRound();
  },

  nextSimonRound() {
    this.userSequence = [];
    this.simonSequence.push(Math.floor(Math.random() * 4));
    document.getElementById('simon-status').innerText = `Ronda ${this.simonSequence.length}`;
    
    let i = 0;
    const interval = setInterval(() => {
      if (i >= this.simonSequence.length) {
        clearInterval(interval);
        return;
      }
      this.flashSimonButton(this.simonSequence[i]);
      i++;
    }, 800);
  },

  flashSimonButton(index) {
    const btn = document.getElementById(`simon-${index}`);
    if (!btn) return;
    const freqs = [300, 400, 500, 600];
    AudioEffects.playTone(freqs[index], 'sine', 0.15);
    btn.style.opacity = '0.3';
    setTimeout(() => btn.style.opacity = '1', 400);
  },

  simonClick(index) {
    this.flashSimonButton(index);
    this.userSequence.push(index);

    const currentIndex = this.userSequence.length - 1;
    if (this.userSequence[currentIndex] !== this.simonSequence[currentIndex]) {
      const reward = this.simonScore * 10;
      PetState.addCoins(reward);
      alert(`¡Te equivocaste! Ganaste 🪙 ${reward} monedas.`);
      Minigames.renderMenu();
      return;
    }

    if (this.userSequence.length === this.simonSequence.length) {
      this.simonScore++;
      setTimeout(() => this.nextSimonRound(), 1000);
    }
  },

  startRunnerGame() {
    const content = document.getElementById('modal-content');
    content.innerHTML = `
      <h3>🏃 Runner Infinito</h3>
      <canvas id="runnerCanvas" width="300" height="280" style="background:#fff3e0; border-radius:12px; margin:10px auto; display:block;"></canvas>
      <p style="font-size:0.85rem; text-align:center;">Presiona <b>Espacio</b> o Toca la pantalla para Saltar</p>
    `;

    const canvas = document.getElementById('runnerCanvas');
    const ctx = canvas.getContext('2d');

    let playerY = 210;
    let playerVY = 0;
    let isJumping = false;
    let obstacleX = 300;
    let score = 0;
    let gameOver = false;

    const jump = () => {
      if (!isJumping) {
        playerVY = -12;
        isJumping = true;
        AudioEffects.playTone(500, 'square', 0.08);
      }
    };

    const handleKeyDown = (e) => { if (e.code === 'Space') jump(); };
    window.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('touchstart', jump);

    function loop() {
      if (gameOver) {
        window.removeEventListener('keydown', handleKeyDown);
        PetState.addCoins(score);
        alert(`¡Juego terminado! Ganaste 🪙 ${score} monedas.`);
        Minigames.renderMenu();
        return;
      }

      playerY += playerVY;
      playerVY += 0.7;

      if (playerY >= 210) {
        playerY = 210;
        isJumping = false;
      }

      obstacleX -= 4;
      if (obstacleX < -20) {
        obstacleX = 300;
        score += 10;
      }

      if (obstacleX < 50 && obstacleX > 10 && playerY > 180) {
        gameOver = true;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#8d6e63';
      ctx.fillRect(0, 240, 300, 40);

      ctx.fillStyle = '#ab47bc';
      ctx.fillRect(20, playerY, 30, 30);

      ctx.fillStyle = '#2e7d32';
      ctx.fillRect(obstacleX, 210, 20, 30);

      ctx.fillStyle = '#333';
      ctx.font = '16px sans-serif';
      ctx.fillText(`Monedas: ${score}`, 10, 25);

      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
  }
};
