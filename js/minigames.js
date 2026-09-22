const Minigames = {
  renderMenu() {
    const content = document.getElementById('modal-content');
    content.innerHTML = `
      <h2 style="text-align:center; color:#6a1b9a; margin-bottom:4px;">🎮 Minijuegos</h2>
      <p style="margin-bottom:14px; font-size:0.85rem; color:#7b1fa2; text-align:center; font-weight:600;">
        ¡Gana monedas y haz feliz a tu mascota!
      </p>
      <div class="grid-container">
        <div class="item-card" onclick="Minigames.startCatchGame()" style="cursor:pointer;">
          <span style="font-size:2rem; margin-bottom:4px;">🎈</span>
          <span class="card-title">Atrapa Dulces</span>
          <button class="card-btn">Jugar</button>
        </div>
        <div class="item-card" onclick="Minigames.startPopGame()" style="cursor:pointer;">
          <span style="font-size:2rem; margin-bottom:4px;">🌸</span>
          <span class="card-title">Explotar Globos</span>
          <button class="card-btn">Jugar</button>
        </div>
        <div class="item-card" onclick="Minigames.startCakeGame()" style="cursor:pointer;">
          <span style="font-size:2rem; margin-bottom:4px;">🍰</span>
          <span class="card-title">Torre de Postres</span>
          <button class="card-btn">Jugar</button>
        </div>
        <div class="item-card" onclick="Minigames.startSimonGame()" style="cursor:pointer;">
          <span style="font-size:2rem; margin-bottom:4px;">🧠</span>
          <span class="card-title">Simón Memoria</span>
          <button class="card-btn">Jugar</button>
        </div>
        <div class="item-card" onclick="Minigames.startRunnerGame()" style="cursor:pointer;">
          <span style="font-size:2rem; margin-bottom:4px;">🦄</span>
          <span class="card-title">Runner Mágico</span>
          <button class="card-btn">Jugar</button>
        </div>
        <div class="item-card" onclick="Minigames.startBubbleGame()" style="cursor:pointer;">
          <span style="font-size:2rem; margin-bottom:4px;">✨</span>
          <span class="card-title">Burbujas Mágicas</span>
          <button class="card-btn">Jugar</button>
        </div>
      </div>
    `;
  },

  // 1. Atrapa Dulces
  startCatchGame() {
    AudioEffects.playTone(523, 'sine', 0.1);
    let score = 0;
    const content = document.getElementById('modal-content');
    content.innerHTML = `
      <h3 style="text-align:center; color:#6a1b9a;">🎈 Atrapa Dulces</h3>
      <p style="text-align:center; font-weight:bold; color:#7b1fa2; margin:6px 0;">Puntos: <span id="game-score">0</span></p>
      <div id="game-area" style="position:relative; width:100%; height:260px; background:#fff3e0; border:2px dashed #ffb74d; border-radius:16px; overflow:hidden;"></div>
    `;

    const area = document.getElementById('game-area');
    const interval = setInterval(() => {
      if (!document.getElementById('game-area')) {
        clearInterval(interval);
        return;
      }
      const candy = document.createElement('div');
      candy.innerText = ['🍬', '🍭', '🍩', '🍫'][Math.floor(Math.random() * 4)];
      candy.style.cssText = `position:absolute; left:${Math.random() * 80 + 10}%; top:0px; font-size:1.8rem; cursor:pointer; transition:top 2s linear;`;
      
      candy.onclick = () => {
        score += 5;
        AudioEffects.playEat();
        document.getElementById('game-score').innerText = score;
        candy.remove();
      };
      
      area.appendChild(candy);
      setTimeout(() => candy.style.top = '220px', 50);
      setTimeout(() => { if (candy.parentNode) candy.remove(); }, 2050);
    }, 800);

    setTimeout(() => {
      clearInterval(interval);
      AudioEffects.playCoin();
      PetState.addCoins(score);
      alert(`¡Juego terminado! Ganaste ${score} monedas 🪙`);
      this.renderMenu();
    }, 15000);
  },

  // 2. Explotar Globos
  startPopGame() {
    AudioEffects.playTone(587, 'sine', 0.1);
    let score = 0;
    const content = document.getElementById('modal-content');
    content.innerHTML = `
      <h3 style="text-align:center; color:#6a1b9a;">🌸 Explotar Globos</h3>
      <p style="text-align:center; font-weight:bold; color:#7b1fa2; margin:6px 0;">Puntos: <span id="game-score">0</span></p>
      <div id="game-area" style="position:relative; width:100%; height:260px; background:#f3e5f5; border:2px dashed #ce93d8; border-radius:16px; overflow:hidden;"></div>
    `;

    const area = document.getElementById('game-area');
    const interval = setInterval(() => {
      if (!document.getElementById('game-area')) {
        clearInterval(interval);
        return;
      }
      const balloon = document.createElement('div');
      balloon.innerText = ['🎈', '💖', '⭐'][Math.floor(Math.random() * 3)];
      balloon.style.cssText = `position:absolute; left:${Math.random() * 80 + 10}%; bottom:0px; font-size:2rem; cursor:pointer; transition:bottom 2.5s linear;`;
      
      balloon.onclick = () => {
        score += 3;
        AudioEffects.playTone(800, 'triangle', 0.05);
        document.getElementById('game-score').innerText = score;
        balloon.remove();
      };
      
      area.appendChild(balloon);
      setTimeout(() => balloon.style.bottom = '220px', 50);
      setTimeout(() => { if (balloon.parentNode) balloon.remove(); }, 2550);
    }, 700);

    setTimeout(() => {
      clearInterval(interval);
      AudioEffects.playCoin();
      PetState.addCoins(score);
      alert(`¡Tiempo terminado! Ganaste ${score} monedas 🪙`);
      this.renderMenu();
    }, 12000);
  },

  // 3. Torre de Postres
  startCakeGame() {
    AudioEffects.playTone(659, 'sine', 0.1);
    let score = 0;
    const content = document.getElementById('modal-content');
    content.innerHTML = `
      <h3 style="text-align:center; color:#6a1b9a;">🍰 Torre de Postres</h3>
      <p style="text-align:center; font-weight:bold; color:#7b1fa2; margin:6px 0;">Nivel de la Torre: <span id="game-score">0</span></p>
      <button onclick="Minigames.stackCake()" class="card-btn" style="width:100%; padding:10px; margin-bottom:10px; background:#ff80ab;">¡Apilar Postre!</button>
      <div id="tower-area" style="display:flex; flex-direction:column-reverse; align-items:center; height:200px; background:#fff8e1; border:2px dashed #ffe082; border-radius:16px; overflow:hidden; padding-bottom:10px;"></div>
    `;
    this.cakeScore = 0;
  },

  stackCake() {
    this.cakeScore += 1;
    AudioEffects.playTone(400 + (this.cakeScore * 50), 'sine', 0.08);
    document.getElementById('game-score').innerText = this.cakeScore;
    
    const tower = document.getElementById('tower-area');
    const layer = document.createElement('div');
    layer.innerText = ['🎂', '🧁', '🍰', '🥞', '🍮'][Math.floor(Math.random() * 5)];
    layer.style.fontSize = '1.8rem';
    tower.appendChild(layer);

    if (this.cakeScore >= 10) {
      AudioEffects.playCoin();
      const prize = this.cakeScore * 4;
      PetState.addCoins(prize);
      alert(`¡Increíble torre! Ganaste ${prize} monedas 🪙`);
      this.renderMenu();
    }
  },

  // 4. Simón Memoria
  startSimonGame() {
    AudioEffects.playTone(783, 'sine', 0.1);
    let sequence = [];
    let playerStep = 0;
    let score = 0;

    const content = document.getElementById('modal-content');
    content.innerHTML = `
      <h3 style="text-align:center; color:#6a1b9a;">🧠 Simón Memoria</h3>
      <p id="simon-status" style="text-align:center; font-weight:bold; color:#7b1fa2; margin:6px 0;">¡Observa la secuencia!</p>
      <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:12px; margin-top:15px;">
        <button id="s-0" onclick="Minigames.pressSimon(0)" style="height:70px; background:#ff80ab; border:none; border-radius:16px; font-size:1.5rem;">🔴</button>
        <button id="s-1" onclick="Minigames.pressSimon(1)" style="height:70px; background:#80cbc4; border:none; border-radius:16px; font-size:1.5rem;">🟢</button>
        <button id="s-2" onclick="Minigames.pressSimon(2)" style="height:70px; background:#ffd54f; border:none; border-radius:16px; font-size:1.5rem;">🟡</button>
        <button id="s-3" onclick="Minigames.pressSimon(3)" style="height:70px; background:#b388ff; border:none; border-radius:16px; font-size:1.5rem;">🔵</button>
      </div>
    `;

    this.simonSeq = [Math.floor(Math.random() * 4)];
    this.simonStep = 0;
    this.playSimonSequence();
  },

  playSimonSequence() {
    document.getElementById('simon-status').innerText = '¡Memoriza!';
    let i = 0;
    const interval = setInterval(() => {
      const btnId = this.simonSeq[i];
      const btn = document.getElementById(`s-${btnId}`);
      if (btn) {
        btn.style.opacity = '0.3';
        AudioEffects.playTone(300 + (btnId * 150), 'sine', 0.15);
        setTimeout(() => btn.style.opacity = '1', 250);
      }
      i++;
      if (i >= this.simonSeq.length) {
        clearInterval(interval);
        document.getElementById('simon-status').innerText = '¡Tu turno!';
      }
    }, 600);
  },

  pressSimon(id) {
    AudioEffects.playTone(300 + (id * 150), 'sine', 0.1);
    if (id === this.simonSeq[this.simonStep]) {
      this.simonStep++;
      if (this.simonStep >= this.simonSeq.length) {
        const prize = this.simonSeq.length * 5;
        PetState.addCoins(prize);
        this.simonStep = 0;
        this.simonSeq.push(Math.floor(Math.random() * 4));
        setTimeout(() => this.playSimonSequence(), 800);
      }
    } else {
      AudioEffects.playTone(200, 'sawtooth', 0.3);
      alert('¡Ups! Fallaste la secuencia. ¡Inténtalo de nuevo!');
      this.renderMenu();
    }
  },

  // 5. Runner Mágico
  startRunnerGame() {
    AudioEffects.playTone(523, 'sine', 0.1);
    let score = 0;
    const content = document.getElementById('modal-content');
    content.innerHTML = `
      <h3 style="text-align:center; color:#6a1b9a;">🦄 Runner Mágico</h3>
      <p style="text-align:center; font-weight:bold; color:#7b1fa2; margin:4px 0;">Monedas: <span id="game-score">0</span></p>
      <div id="runner-area" onclick="Minigames.jumpRunner()" style="position:relative; width:100%; height:200px; background:#e1f5fe; border:2px solid #81d4fa; border-radius:16px; overflow:hidden; cursor:pointer;">
        <div id="runner-pet" style="position:absolute; left:30px; bottom:10px; font-size:2rem; transition:bottom 0.3s ease;">🦄</div>
        <div id="runner-obs" style="position:absolute; right:0px; bottom:10px; font-size:1.8rem;">📦</div>
      </div>
      <p style="text-align:center; font-size:0.75rem; color:#888; margin-top:6px;">Toca la pantalla para saltar</p>
    `;

    this.runnerJumping = false;
    let obsPos = 100;
    const interval = setInterval(() => {
      const obs = document.getElementById('runner-obs');
      if (!obs) {
        clearInterval(interval);
        return;
      }
      obsPos -= 4;
      if (obsPos < -10) {
        obsPos = 100;
        score += 5;
        AudioEffects.playCoin();
        document.getElementById('game-score').innerText = score;
      }
      obs.style.right = `${100 - obsPos}%`;

      // Colisión básica
      if (obsPos > 10 && obsPos < 30 && !this.runnerJumping) {
        clearInterval(interval);
        AudioEffects.playTone(200, 'sawtooth', 0.3);
        PetState.addCoins(score);
        alert(`¡Chocaste! Ganaste ${score} monedas 🪙`);
        this.renderMenu();
      }
    }, 50);
  },

  jumpRunner() {
    if (this.runnerJumping) return;
    this.runnerJumping = true;
    AudioEffects.playTone(600, 'sine', 0.1);
    const pet = document.getElementById('runner-pet');
    if (pet) pet.style.bottom = '80px';

    setTimeout(() => {
      if (pet) pet.style.bottom = '10px';
      this.runnerJumping = false;
    }, 400);
  },

  // 6. Burbujas Mágicas
  startBubbleGame() {
    AudioEffects.playTone(880, 'sine', 0.1);
    let score = 0;
    const content = document.getElementById('modal-content');
    content.innerHTML = `
      <h3 style="text-align:center; color:#6a1b9a;">✨ Burbujas Mágicas</h3>
      <p style="text-align:center; font-weight:bold; color:#7b1fa2; margin:6px 0;">Burbujas: <span id="game-score">0</span></p>
      <div id="game-area" style="position:relative; width:100%; height:240px; background:#e0f7fa; border:2px dashed #4dd0e1; border-radius:16px; overflow:hidden;"></div>
    `;

    const area = document.getElementById('game-area');
    for (let i = 0; i < 8; i++) {
      const bubble = document.createElement('div');
      bubble.innerText = '🫧';
      bubble.style.cssText = `position:absolute; left:${Math.random() * 80 + 5}%; top:${Math.random() * 70 + 10}%; font-size:2.2rem; cursor:pointer; transition:transform 0.2s;`;
      
      bubble.onclick = () => {
        score += 2;
        AudioEffects.playTone(1000, 'sine', 0.05);
        document.getElementById('game-score').innerText = score;
        bubble.style.transform = 'scale(1.4)';
        setTimeout(() => {
          bubble.style.left = `${Math.random() * 80 + 5}%`;
          bubble.style.top = `${Math.random() * 70 + 10}%`;
          bubble.style.transform = 'scale(1)';
        }, 200);
      };
      
      area.appendChild(bubble);
    }

    setTimeout(() => {
      AudioEffects.playCoin();
      PetState.addCoins(score);
      alert(`¡Tiempo! Explotaste suficientes burbujas y ganaste ${score} monedas 🪙`);
      this.renderMenu();
    }, 10000);
  }
};