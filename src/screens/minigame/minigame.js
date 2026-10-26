import { gsap } from 'gsap';
import { navigate } from '../../utils/router.js';

const GAME_CHARS = [
  { id: 'bulan',          name: 'Bulan',          image: null },
  { id: 'apung-mallari',  name: 'Apung Mallari',  image: null },
  { id: 'indung-tibuan',  name: 'Indung Tibuan',  image: null },
  { id: 'apung-mangacha', name: 'Apung Mangacha', image: null },
  { id: 'apung-sinukuan', name: 'Apung Sinukuan', image: null },
  { id: 'aldo',           name: 'Aldo',           image: null },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function createMinigameScreen() {
  const el = document.createElement('div');
  el.className = 'screen screen-minigame';
  el.dataset.screen = '#minigame';
  return el;
}

export function mountMinigame(el) {
  buildGame(el);
  gsap.fromTo(el.querySelector('.mg-board'),
    { opacity: 0, scale: 0.96 },
    { opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out', delay: 0.05 }
  );
}

function buildGame(el) {
  const cardOrder = shuffle(GAME_CHARS);
  const tagOrder  = shuffle(GAME_CHARS);

  el.innerHTML = `
    <div class="mg-board">
      <div class="mg-header">
        <button class="mg-home-btn" aria-label="Go back to home">
          <img src="/assets/ui/Vector.png" class="mg-home-arrow" draggable="false" alt=""/>
        </button>
        <div class="mg-title-wrap">
          <h1 class="mg-title">WHO IS WHO</h1>
          <p class="mg-subtitle">Match the names to its image</p>
        </div>
      </div>

      <div class="mg-grid">
        ${cardOrder.map(c => `
          <div class="mg-card" data-id="${c.id}">
            <div class="mg-img-slot">
              ${c.image
                ? `<img src="${c.image}" alt="${c.name}" draggable="false"/>`
                : `<span class="mg-img-placeholder-label">[ ${c.name} ]</span>`
              }
            </div>
            <div class="mg-drop-zone" data-answer="${c.id}" aria-label="Drop zone for ${c.name}"></div>
          </div>
        `).join('')}
      </div>

      <div class="mg-names">
        ${tagOrder.map(c => `
          <div class="mg-tag" draggable="true" data-id="${c.id}">${c.name}</div>
        `).join('')}
      </div>

      <div class="mg-modal" id="mg-modal" hidden>
        <div class="mg-modal-box">
          <h2 class="mg-modal-result" id="mg-modal-result">Correct!</h2>
          <p class="mg-modal-score">Score:&nbsp;<strong id="mg-modal-score-val">0</strong>/${GAME_CHARS.length}</p>
          <div class="mg-modal-btns">
            <button class="mg-modal-btn" id="mg-retry-btn">Try again</button>
            <button class="mg-modal-btn" id="mg-home-modal-btn">Home</button>
          </div>
        </div>
      </div>
    </div>
  `;

  wireDragDrop(el);

  el.querySelector('.mg-home-btn').addEventListener('click', () => navigate('#home'));
  el.querySelector('#mg-retry-btn').addEventListener('click', () => buildGame(el));
  el.querySelector('#mg-home-modal-btn').addEventListener('click', () => navigate('#home'));
}

function wireDragDrop(el) {
  const tags  = el.querySelectorAll('.mg-tag');
  const zones = el.querySelectorAll('.mg-drop-zone');

  tags.forEach(tag => {
    tag.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', tag.dataset.id);
      e.dataTransfer.effectAllowed = 'move';
      tag.classList.add('dragging');
    });
    tag.addEventListener('dragend', () => tag.classList.remove('dragging'));
  });

  zones.forEach(zone => {
    zone.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      zone.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));

    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('drag-over');

      const droppedId = e.dataTransfer.getData('text/plain');
      const droppedTag = el.querySelector(`.mg-tag[data-id="${droppedId}"]`);
      if (!droppedTag) return;

      // If this zone already has a name, return the old tag to the pool
      const prevId = zone.dataset.filled;
      if (prevId) {
        const prevTag = el.querySelector(`.mg-tag[data-id="${prevId}"]`);
        if (prevTag) prevTag.classList.remove('used');
      }

      // Place the dropped name
      const char = GAME_CHARS.find(c => c.id === droppedId);
      zone.textContent = char ? char.name : droppedId;
      zone.dataset.filled = droppedId;
      zone.classList.add('filled');
      zone.classList.remove('correct', 'wrong');
      droppedTag.classList.add('used');

      checkCompletion(el);
    });
  });
}

function checkCompletion(el) {
  const zones = el.querySelectorAll('.mg-drop-zone');
  const allFilled = [...zones].every(z => z.dataset.filled);
  if (!allFilled) return;

  let score = 0;
  zones.forEach(zone => {
    const correct = zone.dataset.filled === zone.dataset.answer;
    zone.classList.remove('filled');
    zone.classList.add(correct ? 'correct' : 'wrong');
    if (correct) score++;
  });

  const modal     = el.querySelector('#mg-modal');
  const resultEl  = el.querySelector('#mg-modal-result');
  const scoreEl   = el.querySelector('#mg-modal-score-val');

  scoreEl.textContent = score;
  const perfect = score === GAME_CHARS.length;
  resultEl.textContent = perfect ? 'Correct!' : 'Good try!';
  resultEl.classList.toggle('partial', !perfect);

  modal.removeAttribute('hidden');
  gsap.fromTo(modal.querySelector('.mg-modal-box'),
    { opacity: 0, scale: 0.88 },
    { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.4)' }
  );
}
