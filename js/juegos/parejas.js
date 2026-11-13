// =========================================================
// PAREJAS.JS — Memotest: dar vuelta las cartas de a dos y
// encontrar los pares. Las cartas muestran accesorios del
// juego. Sin límite de tiempo: paga más cuantos menos intentos.
// =========================================================
Object.assign(Minigames, {
  startPairsGame() {
    this.showCountdown(() => {
      const PAIRS = 6;
      const content = document.getElementById('modal-content');
      const best = Minigames.getBestScore('pairs');

      // Seis accesorios al azar, cada uno dos veces, mezclados
      const accessories = Minigames.shuffle(Catalogo.items.filter(i => i.category === 'acc')).slice(0, PAIRS);
      const deck = Minigames.shuffle([...accessories, ...accessories]);

      const hud = `
        <div class="game-hud">
          <span class="hud-chip">🃏 <span id="pairs-found">0</span>/${PAIRS}</span>
          <span class="hud-chip hud-timer">👆 <span id="pairs-moves">0</span></span>
          <span class="hud-chip hud-best">⭐ <span id="hud-best">${best}</span></span>
        </div>`;

      content.innerHTML = `
        ${Minigames.renderHeader('🃏 Parejas', hud)}
        <div class="pairs-grid" id="pairs-grid">
          ${deck.map((item, i) => `
            <button class="pair-card" data-index="${i}" aria-label="Carta ${i + 1}">
              <span class="pair-inner">
                <span class="pair-back">🐾</span>
                <span class="pair-front"><img src="${item.image}" alt="${item.name}"></span>
              </span>
            </button>`).join('')}
        </div>
        <p class="game-hint">Encuentra las dos cartas iguales</p>
      `;
      Minigames.mountSpectator();

      const grid = document.getElementById('pairs-grid');
      let first = null;   // primera carta dada vuelta del intento
      let locked = false; // mientras se muestran dos cartas distintas
      let found = 0;
      let moves = 0;
      let timers = [];

      // Menos intentos, más monedas: de 60 (sin errores) a un piso de 20
      const reward = () => Math.max(20, 60 - (moves - PAIRS) * 3);

      const finish = () => {
        const coins = reward();
        const isRecord = Minigames.saveBestScore('pairs', coins);
        Minigames.showResult('¡Encontraste todas!', '🃏', coins, () => Minigames.startPairsGame(), isRecord);
      };

      const onClick = (e) => {
        const card = e.target.closest('.pair-card');
        if (!card || locked || card.classList.contains('open')) return;

        card.classList.add('open');
        AudioEffects.playTone(520, 'sine', 0.06);

        if (!first) {
          first = card;
          return;
        }

        moves++;
        document.getElementById('pairs-moves').innerText = moves;
        const second = card;
        const isPair = deck[first.dataset.index].id === deck[second.dataset.index].id;

        if (isPair) {
          first.classList.add('matched');
          second.classList.add('matched');
          first = null;
          found++;
          document.getElementById('pairs-found').innerText = found;
          AudioEffects.playTone(880, 'triangle', 0.12);
          Minigames.spectate('cheer');
          if (found === PAIRS) timers.push(setTimeout(finish, 700));
        } else {
          locked = true;
          const a = first;
          first = null;
          Minigames.spectate('nod');
          timers.push(setTimeout(() => {
            a.classList.remove('open');
            second.classList.remove('open');
            locked = false;
          }, 850));
        }
      };

      grid.addEventListener('click', onClick);

      Minigames.inProgress = true;
      Minigames.exitHandler = () => {
        timers.forEach(clearTimeout);
        timers = [];
        grid.removeEventListener('click', onClick);
        // Al salir antes de terminar se cobra un poco por cada pareja encontrada
        return found * 3;
      };
    });
  }
});
