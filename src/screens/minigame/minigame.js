import { gsap } from 'gsap';
import { navigate } from '../../utils/router.js';
import { wireInput } from './minigame-input.js';

const ART = '/assets/characters ui';

// image = the character's primary piece; alt describes the picture without naming it.
// tabletImage (optional) = a closer piece used on tablet portrait, where the card art is small
const GAME_CHARS = [
  { id: 'bulan',          name: 'Bulan',          image: `${ART}/Bulan/Right Bulan.png`,                        w: 555,  h: 686, alt: 'Illustration of a fiery red bird' },
  { id: 'apung-mallari',  name: 'Apung Mallari',  image: `${ART}/Apung Mallari/Apung Mallari Whole.png`,         w: 432,  h: 779, alt: 'Illustration of a tall woman with long dark hair and a flowing cape',
    tabletImage: `${ART}/Apung Mallari/Apung Mallari Face.png` },
  { id: 'indung-tibuan',  name: 'Indung Tibuan',  image: `${ART}/Indung Tibuan/Indung Tibuan Whole.png`,         w: 1436, h: 571, alt: 'Illustration of a giant crocodile' },
  { id: 'apung-mangacha', name: 'Apung Mangacha', image: `${ART}/Apung Mangacha/Apung Mangacha Whole.png`,       w: 829,  h: 694, alt: 'Illustration of a giant black spider' },
  { id: 'apung-sinukuan', name: 'Apung Sinukuan', image: `${ART}/Apung Sinukuan/Apung Sinukuan.png`,             w: 456,  h: 794, alt: 'Illustration of a tall white bird with a flame-colored tail' },
  { id: 'aldo',           name: 'Aldo',           image: `${ART}/Aldo/soul aldo.png`,                            w: 853,  h: 850, alt: 'Illustration of a glowing round sun spirit' },
];

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
const TABLET_PORTRAIT = '(max-aspect-ratio: 1/1) and (min-width: 600px)';

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
  if (!el._mgKeys) {
    el._mgKeys = true;
    // Escape closes the result popup; Tab stays inside it while it is open
    document.addEventListener('keydown', e => {
      const modal = el.querySelector('#mg-modal');
      if (e.key === 'Escape' && el.classList.contains('active')) el._mgClearSelection?.();
      if (!el.classList.contains('active') || !modal?.classList.contains('is-open')) return;
      if (e.key === 'Escape') { closeModal(el); return; }
      if (e.key === 'Tab') {
        const btns = [...modal.querySelectorAll('button')];
        const first = btns[0], last = btns[btns.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        else if (!modal.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      }
    });
  }
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
      <button class="mg-home-btn" aria-label="Go back to home">
        <img src="/assets/ui/Vector.png" class="mg-home-arrow" draggable="false" alt=""/>
      </button>
      <div class="mg-title-wrap">
        <h1 class="mg-title">WHO IS WHO</h1>
        <p class="mg-subtitle">Match the names to its image</p>
      </div>

      <div class="mg-grid">
        ${cardOrder.map((c, i) => `
          <div class="mg-card" data-id="${c.id}">
            <div class="mg-img-slot">
              <picture>
                ${c.tabletImage ? `<source media="${TABLET_PORTRAIT}" srcset="${encodeURI(c.tabletImage)}">` : ''}
                <img src="${c.image}" alt="${c.alt}" width="${c.w}" height="${c.h}" draggable="false" decoding="async"${c.tabletImage ? ' class="mg-img--head"' : ''}/>
              </picture>
            </div>
            <button type="button" class="mg-drop-zone" data-answer="${c.id}" aria-label="Answer slot ${i + 1} of ${GAME_CHARS.length}"></button>
          </div>
        `).join('')}
      </div>

      <div class="mg-names">
        ${tagOrder.map(c => `
          <button type="button" class="mg-tag" draggable="false" data-id="${c.id}" aria-pressed="false">${c.name}</button>
        `).join('')}
      </div>
    </div>

    <div class="mg-modal" id="mg-modal" role="dialog" aria-modal="true" aria-labelledby="mg-modal-result">
      <div class="mg-modal-box">
        <div class="mg-modal-panel"></div>
        <h2 class="mg-modal-result" id="mg-modal-result">Correct!</h2>
        <p class="mg-modal-score"><span class="mg-modal-score-label">Score:</span><strong id="mg-modal-score-val">0</strong>/${GAME_CHARS.length}</p>
        <button class="mg-modal-btn" id="mg-retry-btn">Try again</button>
        <button class="mg-modal-btn" id="mg-home-modal-btn">Home</button>
      </div>
    </div>
  `;

  // Card art fades in once loaded
  el.querySelectorAll('.mg-img-slot img').forEach(img => {
    if (img.complete) img.classList.add('is-loaded');
    else img.addEventListener('load', () => img.classList.add('is-loaded'), { once: true });
  });

  wireInput(el, {
    placeChip: (zone, id) => placeChip(el, zone, id),
    removeChip: zone => removeChip(el, zone),
  });

  el.querySelector('.mg-home-btn').addEventListener('click', () => navigate('#home'));
  el.querySelector('#mg-retry-btn').addEventListener('click', () => buildGame(el));
  el.querySelector('#mg-home-modal-btn').addEventListener('click', () => navigate('#home'));
}

/** Put a name in a slot. A filled slot is replaced: its previous name goes back to the pool. */
function placeChip(el, zone, droppedId) {
  const droppedTag = el.querySelector(`.mg-tag[data-id="${droppedId}"]`);
  if (!droppedTag) return;

  const prevId = zone.dataset.filled;
  if (prevId) {
    const prevTag = el.querySelector(`.mg-tag[data-id="${prevId}"]`);
    if (prevTag) { prevTag.classList.remove('used'); prevTag.disabled = false; }
  }

  const char = GAME_CHARS.find(c => c.id === droppedId);
  zone.textContent = char ? char.name : droppedId;
  zone.dataset.filled = droppedId;
  zone.classList.add('filled');
  zone.classList.remove('correct', 'wrong');
  droppedTag.classList.add('used');
  droppedTag.disabled = true;

  checkCompletion(el);
}

/** Take the name out of a slot and return it to the pool. */
function removeChip(el, zone) {
  const id = zone.dataset.filled;
  if (!id) return;
  const tag = el.querySelector(`.mg-tag[data-id="${id}"]`);
  if (tag) { tag.classList.remove('used'); tag.disabled = false; }
  zone.textContent = '';
  delete zone.dataset.filled;
  zone.classList.remove('filled', 'correct', 'wrong');
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

  openModal(el);
}

function openModal(el) {
  const modal = el.querySelector('#mg-modal');
  const reduceMotion = window.matchMedia(REDUCED_MOTION).matches;
  modal.classList.add('is-open');
  gsap.fromTo(modal.querySelector('.mg-modal-box'),
    { opacity: 0, scale: reduceMotion ? 1 : 0.92 },
    { opacity: 1, scale: 1, duration: 0.2, ease: 'power2.out' }
  );
  el.querySelector('#mg-retry-btn').focus();
}

function closeModal(el) {
  el.querySelector('#mg-modal')?.classList.remove('is-open');
}
