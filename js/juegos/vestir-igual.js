// =========================================================
// VESTIR-IGUAL.JS — Se muestra un look unos segundos (color,
// forma y accesorio) y hay que armarlo de memoria eligiendo
// entre tres opciones de cada cosa. Cada ronda se ve menos tiempo.
// =========================================================
Object.assign(Minigames, {
  startDressGame() {
    this.showCountdown(() => {
      const content = document.getElementById('modal-content');
      const best = Minigames.getBestScore('dress');
      const COLORS = ['#ff80ab', '#b388ff', '#80cbc4'];
      const SHAPES = Catalogo.shapes.map(s => s.id);
      const ACCESSORIES = Catalogo.items.filter(i => i.category === 'acc');
      const NEUTRAL = { color: '#d7ccc8', shape: 'shape-circle', accessory: null };

      content.innerHTML = `
        <h3 class="game-title" style="text-align:center;">👗 Vestirla Igual</h3>
        ${Minigames.renderHUD('👗', best)}
        <div id="dress-area" class="dress-area"></div>
      `;

      const area = document.getElementById('dress-area');
      let round = 0;
      let score = 0;
      let timers = [];
      const later = (fn, ms) => { timers.push(setTimeout(fn, ms)); };
      const pick = (list) => list[Math.floor(Math.random() * list.length)];
      // Tres opciones al azar que incluyen la correcta
      const optionsWith = (correct, all) =>
        Minigames.shuffle([correct, ...Minigames.shuffle(all.filter(x => x !== correct)).slice(0, 2)]);

      const startRound = () => {
        const target = { color: pick(COLORS), shape: pick(SHAPES), accessory: pick(ACCESSORIES).id };
        const viewMs = Math.max(1300, 3200 - round * 300);

        // --- Fase 1: mirar el look ---
        area.innerHTML = `
          <p class="game-status">¡Mira bien el look!</p>
          <div class="dress-show" id="dress-show"></div>
          <div class="dress-timer"><i style="animation-duration:${viewMs}ms;"></i></div>
        `;
        const shown = Minigames.createMiniPet(110, target);
        document.getElementById('dress-show').appendChild(shown.el);
        shown.cheer();

        later(() => build(target), viewMs);
      };

      // --- Fase 2: armarlo de memoria ---
      const build = (target) => {
        const choice = { color: null, shape: null, accessory: null };
        const colorOptions = Minigames.shuffle(COLORS);
        const shapeOptions = optionsWith(target.shape, SHAPES);
        const accessoryOptions = optionsWith(target.accessory, ACCESSORIES.map(a => a.id));

        area.innerHTML = `
          <p class="game-status" id="dress-status">¿Cómo era? Ármala igual</p>
          <div class="dress-show" id="dress-show"></div>
          <div class="dress-row" data-kind="color">
            ${colorOptions.map(c => `<button class="dress-option" data-value="${c}" aria-label="Color"><span class="dress-swatch" style="background:${c};"></span></button>`).join('')}
          </div>
          <div class="dress-row" data-kind="shape">
            ${shapeOptions.map(s => `<button class="dress-option" data-value="${s}" aria-label="Forma"></button>`).join('')}
          </div>
          <div class="dress-row" data-kind="accessory">
            ${accessoryOptions.map(a => `<button class="dress-option" data-value="${a}" aria-label="Accesorio"><img src="${Catalogo.items.find(i => i.id === a).image}" alt=""></button>`).join('')}
          </div>
          <button class="card-btn dress-ready" id="dress-ready" disabled>¡Lista! ✔</button>
        `;

        const preview = Minigames.createMiniPet(84, NEUTRAL);
        document.getElementById('dress-show').appendChild(preview.el);

        // Las formas se muestran con una mascotita gris de esa forma
        area.querySelectorAll('.dress-row[data-kind="shape"] .dress-option').forEach(btn => {
          btn.appendChild(Minigames.createMiniPet(34, { color: '#bdb5c9', shape: btn.dataset.value, accessory: null }).el);
        });

        const ready = document.getElementById('dress-ready');

        area.onclick = (e) => {
          const option = e.target.closest('.dress-option');
          if (!option) return;
          const row = option.parentElement;
          row.querySelectorAll('.dress-option').forEach(b => b.classList.remove('selected'));
          option.classList.add('selected');
          choice[row.dataset.kind] = option.dataset.value;
          preview.setLook({ [row.dataset.kind]: option.dataset.value });
          preview.nod();
          AudioEffects.playTone(560, 'sine', 0.05);
          ready.disabled = !(choice.color && choice.shape && choice.accessory);
        };

        ready.onclick = () => {
          area.onclick = null;
          ready.disabled = true;
          const ok = choice.color === target.color && choice.shape === target.shape && choice.accessory === target.accessory;

          if (ok) {
            score += 10;
            round++;
            Minigames.updateHudScore(score);
            AudioEffects.playTone(880, 'triangle', 0.12);
            preview.cheer();
            document.getElementById('dress-status').innerText = '¡Igualita! 🎉';
            later(startRound, 1100);
          } else {
            // Muestra el look correcto al lado del armado
            AudioEffects.playTone(300, 'sine', 0.15);
            document.getElementById('dress-status').innerText = 'Era así 👉';
            const answer = Minigames.createMiniPet(84, target);
            document.getElementById('dress-show').appendChild(answer.el);
            answer.cheer();
            later(() => {
              const isRecord = Minigames.saveBestScore('dress', score);
              Minigames.showResult('¡Casi! ¿Otro look?', '👗', score, () => Minigames.startDressGame(), isRecord);
            }, 2000);
          }
        };
      };

      Minigames.inProgress = true;
      Minigames.exitHandler = () => {
        timers.forEach(clearTimeout);
        timers = [];
        area.onclick = null;
        return score;
      };

      startRound();
    });
  }
});
