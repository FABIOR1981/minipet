// =========================================================
// DONDE-ESTA.JS — La mascota se esconde en una de tres cajas,
// las cajas se mezclan y hay que seguirla con la vista. Cada
// ronda mezcla más veces y más rápido.
// =========================================================
Object.assign(Minigames, {
  startHideGame() {
    this.showCountdown(() => {
      const content = document.getElementById('modal-content');
      const best = Minigames.getBestScore('hide');
      const COLORS = ['#ff80ab', '#80cbc4', '#b388ff'];

      content.innerHTML = `
        <h3 class="game-title" style="text-align:center;">🎁 ¿Dónde Está?</h3>
        ${Minigames.renderHUD('🎁', best)}
        <div class="hide-stage" id="hide-stage">
          ${COLORS.map((c, i) => `
            <button class="hide-cup" data-cup="${i}" aria-label="Caja ${i + 1}" style="--cup:${c};">
              <span class="hide-pet"></span>
              <span class="hide-cover"></span>
            </button>`).join('')}
        </div>
        <p id="hide-status" class="game-status">¡Mira dónde se esconde!</p>
      `;

      const stage = document.getElementById('hide-stage');
      const cups = [...stage.querySelectorAll('.hide-cup')];
      const pet = Minigames.createMiniPet(56);
      const slots = [0, 1, 2]; // slots[i] = lugar (0 a 2) que ocupa la caja i
      let petCup = 0;
      let round = 0;
      let score = 0;
      let accepting = false;
      let timers = [];

      const later = (fn, ms) => { timers.push(setTimeout(fn, ms)); };
      const setStatus = (text) => {
        const el = document.getElementById('hide-status');
        if (el) el.innerText = text;
      };
      const layout = (ms) => {
        cups.forEach((cup, i) => {
          cup.style.transitionDuration = `${ms}ms`;
          cup.style.left = `${slots[i] * 33.333 + 2.5}%`;
        });
      };

      const shuffleCups = (swapsLeft, ms, done) => {
        if (swapsLeft === 0) return done();
        const a = Math.floor(Math.random() * 3);
        const b = (a + 1 + Math.floor(Math.random() * 2)) % 3;
        [slots[a], slots[b]] = [slots[b], slots[a]];
        layout(ms);
        AudioEffects.playTone(420, 'sine', 0.04);
        later(() => shuffleCups(swapsLeft - 1, ms, done), ms + 60);
      };

      const startRound = () => {
        accepting = false;
        cups.forEach(cup => cup.classList.remove('open'));
        petCup = Math.floor(Math.random() * 3);
        cups[petCup].querySelector('.hide-pet').appendChild(pet.el);
        setStatus('¡Mira dónde se esconde!');

        // Muestra la caja con la mascota, la tapa y mezcla
        later(() => { cups[petCup].classList.add('open'); pet.cheer(); }, 250);
        later(() => cups[petCup].classList.remove('open'), 1250);
        later(() => {
          setStatus('Síguela con la vista...');
          const swaps = Math.min(12, 3 + round);
          const speed = Math.max(170, 520 - round * 45);
          shuffleCups(swaps, speed, () => {
            accepting = true;
            setStatus('¿Dónde está? 👆');
          });
        }, 1750);
      };

      const onPick = (e) => {
        const cup = e.target.closest('.hide-cup');
        if (!cup || !accepting) return;
        accepting = false;
        const picked = Number(cup.dataset.cup);
        cup.classList.add('open');

        if (picked === petCup) {
          score += 10;
          round++;
          Minigames.updateHudScore(score);
          AudioEffects.playTone(880, 'triangle', 0.12);
          pet.cheer();
          setStatus('¡La encontraste! 🎉');
          later(startRound, 1100);
        } else {
          AudioEffects.playTone(300, 'sine', 0.15);
          setStatus('¡Estaba aquí!');
          later(() => { cups[petCup].classList.add('open'); pet.cheer(); }, 350);
          later(() => {
            const isRecord = Minigames.saveBestScore('hide', score);
            Minigames.showResult('¡Casi! ¿Otra vez?', '🎁', score, () => Minigames.startHideGame(), isRecord);
          }, 1700);
        }
      };

      stage.addEventListener('click', onPick);
      layout(0);

      Minigames.inProgress = true;
      Minigames.exitHandler = () => {
        timers.forEach(clearTimeout);
        timers = [];
        accepting = false;
        stage.removeEventListener('click', onPick);
        return score;
      };

      startRound();
    });
  }
});
