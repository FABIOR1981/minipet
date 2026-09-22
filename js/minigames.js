const Minigames = {
  // Menú Principal de Minijuegos (6 Opciones Kawaii)
  renderMenu() {
    const content = document.getElementById('modal-content');
    content.innerHTML = `
      <h2 style="color:#6a1b9a; text-align:center;">🎮 Minijuegos Kawaii</h2>
      <p style="margin-bottom:12px; font-size:0.85rem; color:#666; text-align:center;">¡Gana monedas y haz feliz a tu mascota!</p>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; max-height:360px; overflow-y:auto; padding:4px;">
        <button class="menu-btn" onclick="Minigames.startCatchGame()">🎈 Atrapa Dulces</button>
        <button class="menu-btn" onclick="Minigames.startPopGame()">🌸 Explotar Globos</button>
        <button class="menu-btn" onclick="Minigames.startCakeGame()">🍰 Torre de Postres</button>
        <button class="menu-btn" onclick="Minigames.startSimonGame()">🧠 Simón Memoria</button>
        <button class="menu-btn" onclick="Minigames.startRunnerGame()">🦄 Runner Mágico</button>
        <button class="menu-btn" onclick="Minigames.startBubbleGame()">✨ Burbujas Mágicas</button>
      </div>
    `;
  },

  // Conteo Regresivo Estilo Kawaii
  showCountdown(onComplete) {
    const content = document.getElementById('modal-content');
    content.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:260px;">
        <div id="countdown-num" class="kawaii-countdown">3</div>
        <p id="countdown-sub" style="font-weight:bold; color:#ab47bc; margin-top:10px;">¡Prepárate! ✨</p>
      </div>
    `;

    let count = 3;
    AudioEffects.playTone(523, 'sine', 0.15);

    const interval = setInterval(() => {
      count--;
      const numEl = document.getElementById('countdown-num');
      const subEl = document.getElementById('countdown-sub');

      if (!numEl) {
        clearInterval(interval);
        return;
      }

      if (count > 0) {
        numEl.innerText = count;
        numEl.style.animation = 'none';
        numEl.offsetHeight;
        numEl.style.animation = 'popNum 0.6s ease-out';
        AudioEffects.playTone(523 + (3 - count) * 100, 'sine', 0.15);
      } else if (count === 0) {
        numEl.innerText = '¡A JUGAR! 🌸';
        numEl.style.fontSize = '2rem';
        subEl.innerText = '✨ ¡Diviértete! ✨';
        AudioEffects.playTone(880, 'triangle', 0.3);
      } else {
        clearInterval(interval);
        onComplete();
      }
    }, 900);
  },

  // =========================================================
  // 1. ATRAPA DULCES KAWAII (Soporte Táctil)
  // =========================================================
  startCatchGame() {
    this.showCountdown(() => {
      const content = document.getElementById('modal-content');
      content.innerHTML = `
        <h3 style="color:#ab47bc;">🎈 Atrapa Dulces</h3>
        <canvas id="gameCanvas" width="300" height="300" style="background:linear-gradient(180deg, #e1f5fe 0%, #f3e5f5 100%); border-radius:16px; margin:8px auto; display:block; border:3px solid #ce93d8; touch-action:none;"></canvas>
        <p style="font-size:0.8rem; text-align:center; color:#666;">Arrastra el dedo o usa ⬅️ ➡️ para moverte</p>
      `;

      const canvas = document.getElementById('gameCanvas');
      const ctx = canvas.getContext('2d');
      let basketX = 120;
      let itemX = Math.random() * 260 + 10;
      let itemY = 0;
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
        const touchX = e.touches[0].clientX - rect.left;
        basketX = Math.max(0, Math.min(240, touchX - 30));
      };
      canvas.addEventListener('touchstart', handleTouch, { passive: false });
      canvas.addEventListener('touchmove', handleTouch, { passive: false });

      function loop() {
        if (gameOver) {
          window.removeEventListener('keydown', handleKeyDown);
          window.removeEventListener('keyup', handleKeyUp);
          canvas.removeEventListener('touchstart', handleTouch);
          canvas.removeEventListener('touchmove', handleTouch);
          PetState.addCoins(score);
          alert(`¡Juego terminado! Ganaste 🪙 ${score} monedas.`);
          Minigames.renderMenu();
          return;
        }

        if (keys['ArrowLeft'] && basketX > 5) basketX -= 6;
        if (keys['ArrowRight'] && basketX < 235) basketX += 6;

        itemY += 3.8;

        if (itemY >= 260 && itemX >= basketX - 10 && itemX <= basketX + 60) {
          score += 5;
          AudioEffects.playTone(800, 'sine', 0.05);
          itemY = 0;
          itemX = Math.random() * 250 + 10;
        }

        if (itemY > 300) gameOver = true;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Cesta
        ctx.fillStyle = '#ff80ab';
        ctx.beginPath();
        ctx.roundRect(basketX, 270, 60, 20, 10);
        ctx.fill();

        // Fruta
        ctx.fillStyle = '#ff4081';
        ctx.beginPath();
        ctx.arc(itemX, itemY, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#76ff03';
        ctx.fillRect(itemX - 3, itemY - 15, 6, 5);

        ctx.fillStyle = '#4a148c';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText(`Monedas: 🪙 ${score}`, 12, 25);

        requestAnimationFrame(loop);
      }

      requestAnimationFrame(loop);
    });
  },

  // =========================================================
  // 2. EXPLOTAR GLOBOS KAWAII (Soporte Táctil)
  // =========================================================
  startPopGame() {
    this.showCountdown(() => {
      const content = document.getElementById('modal-content');
      content.innerHTML = `
        <h3 style="color:#ab47bc;">🌸 Explotar Globos</h3>
        <canvas id="popCanvas" width="300" height="300" style="background:linear-gradient(180deg, #fff3e0 0%, #fce4ec 100%); border-radius:16px; margin:8px auto; display:block; border:3px solid #ff80ab; touch-action:none;"></canvas>
        <p style="font-size:0.8rem; text-align:center; color:#666;">¡Toca los globos antes de que suban!</p>
      `;

      const canvas = document.getElementById('popCanvas');
      const ctx = canvas.getContext('2d');
      let balloons = [];
      let score = 0;
      let timeLeft = 20;

      const timerInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          PetState.addCoins(score);
          alert(`¡Tiempo! Explotaste un montón de globos y ganaste 🪙 ${score} monedas.`);
          Minigames.renderMenu();
        }
      }, 1000);

      const handlePop = (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;

        balloons.forEach((b, index) => {
          const dist = Math.hypot(b.x - mouseX, b.y - mouseY);
          if (dist < b.radius + 10) { // Margen extra para dedos en pantalla táctil
            score += 5;
            AudioEffects.playTone(900, 'triangle', 0.08);
            balloons.splice(index, 1);
          }
        });
      };

      canvas.addEventListener('touchstart', handlePop, { passive: false });
      canvas.onclick = handlePop;

      function loop() {
        if (timeLeft <= 0) return;

        if (Math.random() < 0.05 && balloons.length < 6) {
          balloons.push({
            x: Math.random() * 260 + 20,
            y: 320,
            radius: 18,
            speed: Math.random() * 1.5 + 1.2,
            color: ['#ff80ab', '#b388ff', '#80cbc4', '#ffe082'][Math.floor(Math.random() * 4)]
          });
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        balloons.forEach((b, index) => {
          b.y -= b.speed;
          
          ctx.fillStyle = b.color;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#aaa';
          ctx.beginPath();
          ctx.moveTo(b.x, b.y + b.radius);
          ctx.lineTo(b.x, b.y + b.radius + 12);
          ctx.stroke();

          if (b.y < -20) balloons.splice(index, 1);
        });

        ctx.fillStyle = '#4a148c';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText(`🪙 ${score}`, 12, 25);
        ctx.fillText(`⏰ ${timeLeft}s`, 230, 25);

        requestAnimationFrame(loop);
      }

      requestAnimationFrame(loop);
    });
  },

  // =========================================================
  // 3. TORRE DE POSTRES KAWAII (Soporte Táctil)
  // =========================================================
  startCakeGame() {
    this.showCountdown(() => {
      const content = document.getElementById('modal-content');
      content.innerHTML = `
        <h3 style="color:#ab47bc;">🍰 Torre de Postres</h3>
        <canvas id="cakeCanvas" width="300" height="300" style="background:#f3e5f5; border-radius:16px; margin:8px auto; display:block; border:3px solid #b388ff; touch-action:none;"></canvas>
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
          PetState.addCoins(score);
          alert(`¡Ups, se cayó la torre! Ganaste 🪙 ${score} monedas.`);
          Minigames.renderMenu();
          return;
        }

        score += 10;
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

        ctx.fillStyle = '#4a148c';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText(`Puntos: 🪙 ${score}`, 12, 25);

        requestAnimationFrame(loop);
      }

      requestAnimationFrame(loop);
    });
  },

  // =========================================================
  // 4. SIMÓN DICE KAWAII (Soporte Táctil)
  // =========================================================
  startSimonGame() {
    this.showCountdown(() => {
      const content = document.getElementById('modal-content');
      content.innerHTML = `
        <h3 style="color:#ab47bc;">🎯 Simón Memoria</h3>
        <p id="simon-status" style="margin-top:5px; text-align:center; font-weight:bold; color:#7e57c2;">¡Memoriza la secuencia!</p>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin:20px 0;">
          <button id="simon-0" onclick="Minigames.simonClick(0)" style="height:75px; background:#ff80ab; border:none; border-radius:18px; cursor:pointer; box-shadow:0 4px 0 #f50057; touch-action:manipulation;"></button>
          <button id="simon-1" onclick="Minigames.simonClick(1)" style="height:75px; background:#80deea; border:none; border-radius:18px; cursor:pointer; box-shadow:0 4px 0 #00acc1; touch-action:manipulation;"></button>
          <button id="simon-2" onclick="Minigames.simonClick(2)" style="height:75px; background:#b388ff; border:none; border-radius:18px; cursor:pointer; box-shadow:0 4px 0 #673ab7; touch-action:manipulation;"></button>
          <button id="simon-3" onclick="Minigames.simonClick(3)" style="height:75px; background:#ffe082; border:none; border-radius:18px; cursor:pointer; box-shadow:0 4px 0 #ffb300; touch-action:manipulation;"></button>
        </div>
      `;

      this.simonSequence = [];
      this.userSequence = [];
      this.simonScore = 0;
      this.nextSimonRound();
    });
  },

  nextSimonRound() {
    this.userSequence = [];
    this.simonSequence.push(Math.floor(Math.random() * 4));
    document.getElementById('simon-status').innerText = `Ronda ${this.simonSequence.length} ✨`;
    
    let i = 0;
    const interval = setInterval(() => {
      if (i >= this.simonSequence.length) {
        clearInterval(interval);
        return;
      }
      this.flashSimonButton(this.simonSequence[i]);
      i++;
    }, 700);
  },

  flashSimonButton(index) {
    const btn = document.getElementById(`simon-${index}`);
    if (!btn) return;
    const freqs = [350, 450, 550, 650];
    AudioEffects.playTone(freqs[index], 'sine', 0.15);
    btn.style.opacity = '0.3';
    setTimeout(() => btn.style.opacity = '1', 350);
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

  // =========================================================
  // 5. RUNNER MÁGICO KAWAII (Soporte Táctil)
  // =========================================================
  startRunnerGame() {
    this.showCountdown(() => {
      const content = document.getElementById('modal-content');
      content.innerHTML = `
        <h3 style="color:#ab47bc;">🦄 Runner Mágico</h3>
        <canvas id="runnerCanvas" width="300" height="280" style="background:linear-gradient(180deg, #fff9c4 0%, #f3e5f5 100%); border-radius:16px; margin:8px auto; display:block; border:3px solid #ffd54f; touch-action:none;"></canvas>
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

      function loop() {
        if (gameOver) {
          window.removeEventListener('keydown', handleKeyDown);
          canvas.removeEventListener('touchstart', jump);
          PetState.addCoins(score);
          alert(`¡Juego terminado! Ganaste 🪙 ${score} monedas.`);
          Minigames.renderMenu();
          return;
        }

        playerY += playerVY;
        playerVY += 0.65;

        if (playerY >= 210) {
          playerY = 210;
          isJumping = false;
        }

        obstacleX -= 4.2;
        if (obstacleX < -25) {
          obstacleX = 300;
          score += 10;
        }

        if (obstacleX < 45 && obstacleX > 15 && playerY > 180) gameOver = true;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Suelo
        ctx.fillStyle = '#e1bee7';
        ctx.fillRect(0, 240, 300, 40);

        // Personaje
        ctx.fillStyle = '#ff4081';
        ctx.beginPath();
        ctx.arc(35, playerY + 15, 15, 0, Math.PI * 2);
        ctx.fill();

        // Obstáculo
        ctx.fillStyle = '#ffb300';
        ctx.beginPath();
        ctx.arc(obstacleX + 10, 225, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#4a148c';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText(`Monedas: 🪙 ${score}`, 12, 25);

        requestAnimationFrame(loop);
      }

      requestAnimationFrame(loop);
    });
  },

  // =========================================================
  // 6. BURBUJAS KAWAII (Soporte Táctil)
  // =========================================================
  startBubbleGame() {
    this.showCountdown(() => {
      const content = document.getElementById('modal-content');
      content.innerHTML = `
        <h3 style="color:#ab47bc;">✨ Burbujas Mágicas</h3>
        <canvas id="bubbleCanvas" width="300" height="300" style="background:linear-gradient(180deg, #e0f2f1 0%, #e8eaf6 100%); border-radius:16px; margin:8px auto; display:block; border:3px solid #80cbc4; touch-action:none;"></canvas>
        <p style="font-size:0.8rem; text-align:center; color:#666;">Toca las burbujas para atraparlas</p>
      `;

      const canvas = document.getElementById('bubbleCanvas');
      const ctx = canvas.getContext('2d');
      let bubbles = [];
      let score = 0;
      let timeLeft = 15;

      const timer = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
          clearInterval(timer);
          PetState.addCoins(score);
          alert(`¡Tiempo! Ganaste 🪙 ${score} monedas.`);
          Minigames.renderMenu();
        }
      }, 1000);

      const handleTouchBubble = (e) => {
        if (e) e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const mx = clientX - rect.left;
        const my = clientY - rect.top;

        bubbles.forEach((b, i) => {
          if (Math.hypot(b.x - mx, b.y - my) < b.r + 8) { // Margen táctil
            score += b.isGolden ? 15 : 5;
            AudioEffects.playTone(b.isGolden ? 1000 : 750, 'sine', 0.1);
            bubbles.splice(i, 1);
          }
        });
      };

      canvas.addEventListener('touchstart', handleTouchBubble, { passive: false });
      canvas.onclick = handleTouchBubble;

      function loop() {
        if (timeLeft <= 0) return;

        if (Math.random() < 0.08 && bubbles.length < 7) {
          const isGolden = Math.random() < 0.3;
          bubbles.push({
            x: Math.random() * 250 + 25,
            y: Math.random() * 220 + 40,
            r: Math.random() * 8 + 16,
            isGolden: isGolden,
            color: isGolden ? '#ffd54f' : '#b388ff'
          });
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        bubbles.forEach(b => {
          ctx.fillStyle = b.color;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(b.x - b.r / 3, b.y - b.r / 3, b.r / 4, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.fillStyle = '#4a148c';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText(`🪙 ${score}`, 12, 25);
        ctx.fillText(`⏰ ${timeLeft}s`, 230, 25);

        requestAnimationFrame(loop);
      }

      requestAnimationFrame(loop);
    });
  }
};