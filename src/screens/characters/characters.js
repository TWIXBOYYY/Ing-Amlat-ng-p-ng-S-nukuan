import { gsap } from 'gsap';
import { navigate } from '../../utils/router.js';

const CHARACTERS = [
  {
    id: 'bulan',
    name: 'Bulan',
    subtitle: 'God of the Moon',
    description: 'The other soul that emerged from Apung Batala\'s two souls, depicted as the Moon and the rival of Aldo. After emerging, Bulan became a red fiery bird who battles Aldo for rulership of the heavens.',
    artLeft: '/assets/characters ui/Bulan/Left Bulan.png',
    artRight: '/assets/characters ui/Bulan/Right Bulan.png',
  },
  {
    id: 'apung-mallari',
    name: 'Apung Mallari',
    subtitle: 'Deity of Mt. Pinatubo',
    description: 'As they continued to fight on Earth, the birds take flesh as a mountain-sized female giant and continued to fight Apung Sinukuan using Bamboo poles as their weapon.',
    layout: 'text-right',
    artLeft: '/assets/characters ui/Apung Mallari/Apung Mallari Face.png',
    artRight: '/assets/characters ui/Apung Mallari/Apung Mallari Whole.png',
    artExtra: null,
  },
  {
    id: 'indung-tibuan',
    name: 'Indung Tibuan',
    subtitle: 'Ancestral Earth Spirit',
    description: 'The giant crocodile Earth-mother who carries the land on her back. Her movements cause Earthquakes.',
    layout: 'indung',
    artLeft: '/assets/characters ui/Indung Tibuan/Indung Tibuan with Water.png',
    artRight: '/assets/characters ui/Indung Tibuan/Indung Tibuan Whole.png',
  },
  {
    id: 'apung-batala',
    name: 'Apung Batálâ',
    subtitle: 'Kingfisher of the Sky',
    description: 'The blue feathered Kingfisher who originally rules the sky. His feathers makes the sky blue.\n\nHe earns the name «Salaksak» for his courageous act when he bravely entered Indung Tibuan\'s mouth and pecked at the flesh, causing for him to be swallowed.',
    layout: 'batala',
    artLeft: '/assets/characters ui/Apung Batala/Apung Batala Whole.png',
    artRight: '/assets/characters ui/Apung Batala/Apung Batala Left.png',
  },
  {
    id: 'apung-mangacha',
    name: 'Apung Mangacha',
    subtitle: 'Spirit of the Weaver',
    description: 'The giant spider who weaves the Sikluban, a dome which holds the sky and water.',
    layout: 'mangacha',
    artLeft: '/assets/characters ui/Apung Mangacha/Apung Mangacha Head.png',
    artRight: '/assets/characters ui/Apung Mangacha/Apung Mangacha Whole.png',
  },
  {
    id: 'apung-sinukuan',
    name: 'Apung Sinukuan',
    subtitle: 'God of the Sun & War',
    description: 'A fiery white bird illuminating the heavens. He clashes with Bulan and is determined to rule the sky. The mighty ruler of Mt. Arayat who commands the forces of fire, war, and the blazing sun.',
    layout: 'sinukuan',
    artLeft: '/assets/characters ui/Apung Sinukuan/Apung Sinukuan Face.png',
    artRight: '/assets/characters ui/Apung Sinukuan/Apung Sinukuan.png',
  },
  {
    id: 'aldo',
    name: 'Aldo',
    subtitle: 'Solar Deity',
    description: 'One of Apung Batala\'s two souls, released after his body dissolved inside Indung Tibuan\'s belly. Aldo is depicted as the Sun.',
    layout: 'aldo',
    artLeft: null,
    artRight: '/assets/characters ui/Aldo/soul aldo.png',
  },
  {
    id: 'apung-namalyari',
    name: 'Bulan',
    subtitle: 'Creator & Protector',
    description: 'The other soul that emerged from Apung Batálâ and depicted as the Moon and the rival of Aldo.',
    layout: 'namalyari',
    artLeft: null,
    artRight: '/assets/characters ui/Bulan/Soul  Bulan.png',
  },
];

export function createCharactersScreen() {
  const el = document.createElement('div');
  el.className = 'screen screen-characters';
  el.dataset.screen = '#characters';

  const first = CHARACTERS[0];

  el.innerHTML = `
    <div class="char-border char-border-top" aria-hidden="true"></div>
    <div class="char-border char-border-bottom" aria-hidden="true"></div>

    <div class="char-viewer" data-layout="text-left">
      <div class="char-text">
        <h2 class="char-name">${first.name}</h2>
        <div class="char-description"></div>
      </div>
      <div class="char-art-area">
        <div class="char-art char-art-body">
          <img src="${first.artRight || ''}" class="char-art-img" alt="" draggable="false" decoding="async"/>
        </div>
        <div class="char-art-row">
          <div class="char-art char-art-face">
            <img src="${first.artLeft || ''}" class="char-art-img" alt="" draggable="false" decoding="async"/>
          </div>
          <div class="char-art char-art-extra" hidden>
            <img class="char-art-img" alt="" draggable="false" decoding="async"/>
          </div>
        </div>
      </div>
    </div>

    <div class="char-nav">
      <button class="char-nav-btn char-prev-btn" aria-label="Previous character" disabled>
        <img src="/assets/ui/NEXT BUTTON.png" class="char-nav-img char-nav-flip" alt="" aria-hidden="true" draggable="false"/>
      </button>
      <div class="char-dots">
        ${CHARACTERS.map((_, i) => `<button class="char-dot${i === 0 ? ' is-active' : ''}" aria-label="Go to character ${i + 1}"></button>`).join('')}
      </div>
      <button class="char-nav-btn char-next-btn" aria-label="Next character">
        <img src="/assets/ui/NEXT BUTTON.png" class="char-nav-img" alt="" aria-hidden="true" draggable="false"/>
      </button>
    </div>

    <button class="char-back-btn" aria-label="Go back to home">
      <img src="/assets/ui/Vector.png" class="char-back-arrow" alt="" aria-hidden="true" draggable="false"/>
    </button>
  `;

  setDescription(el.querySelector('.char-description'), first.description);

  return el;
}

/** Render a description as one <p> per paragraph (paragraphs are separated by a blank line). */
function setDescription(target, text) {
  target.replaceChildren(...text.split('\n\n').map((para) => {
    const p = document.createElement('p');
    p.textContent = para;
    return p;
  }));
}

function preloadArt(char) {
  if (!char) return;
  [char.artLeft, char.artRight, char.artExtra].forEach((src) => {
    if (src) new Image().src = src;
  });
}

const SWIPE_MIN_PX = 50;
const SWIPE_RATIO = 1.5;
const SLIDE_PX = 12;

/** @param {HTMLElement} el */
export function mountCharacters(el) {
  const nameEl   = el.querySelector('.char-name');
  const descEl   = el.querySelector('.char-description');
  const bodyEl   = el.querySelector('.char-art-body');
  const faceEl   = el.querySelector('.char-art-face');
  const extraEl  = el.querySelector('.char-art-extra');
  const rowEl    = el.querySelector('.char-art-row');
  const textEl   = el.querySelector('.char-text');
  const viewer   = el.querySelector('.char-viewer');
  const navEl    = el.querySelector('.char-nav');
  const backBtn  = el.querySelector('.char-back-btn');
  const prevBtn  = el.querySelector('.char-prev-btn');
  const nextBtn  = el.querySelector('.char-next-btn');
  const dots     = el.querySelectorAll('.char-dot');

  function setArt(slot, src) {
    const img = slot.querySelector('.char-art-img');
    if (src) img.src = src;
    else img.removeAttribute('src');
    slot.hidden = !src;
  }

  function applyCharacter(char) {
    viewer.dataset.layout = char.layout || 'text-left';
    nameEl.textContent = char.name;
    setDescription(descEl, char.description);
    setArt(bodyEl, char.artRight);
    setArt(faceEl, char.artLeft);
    setArt(extraEl, char.artExtra);
    rowEl.hidden = faceEl.hidden && extraEl.hidden;
  }

  function updateButtons() {
    prevBtn.disabled = el._current === 0;
    nextBtn.disabled = el._current === CHARACTERS.length - 1;
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === el._current));
  }

  function showCharacter(index, direction = 1) {
    const char = CHARACTERS[index];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pieces = [textEl, bodyEl, faceEl, extraEl];
    const slide = reduceMotion ? 0 : SLIDE_PX;

    gsap.killTweensOf(pieces);
    gsap.to(pieces, {
      opacity: 0, '--dx': `${-direction * slide}px`, duration: 0.14, ease: 'power1.in',
      onComplete: () => {
        applyCharacter(char);
        // text and primary art together, secondary pieces ~60ms later
        gsap.fromTo([textEl, bodyEl],
          { opacity: 0, '--dx': `${direction * slide}px` },
          { opacity: 1, '--dx': '0px', duration: 0.28, ease: 'power2.out' });
        gsap.fromTo([faceEl, extraEl],
          { opacity: 0, '--dx': `${direction * slide}px` },
          { opacity: 1, '--dx': '0px', duration: 0.28, ease: 'power2.out', delay: reduceMotion ? 0 : 0.06 });
      },
    });
    updateButtons();
    preloadArt(CHARACTERS[index - 1]);
    preloadArt(CHARACTERS[index + 1]);
  }

  function goTo(index) {
    if (index < 0 || index > CHARACTERS.length - 1 || index === el._current) return;
    const direction = index > el._current ? 1 : -1;
    el._current = index;
    showCharacter(index, direction);
  }

  // Reset to the first character and animate in on each visit
  el._current = 0;
  applyCharacter(CHARACTERS[0]);
  gsap.set([viewer, navEl, backBtn], { opacity: 0 });
  gsap.set([textEl, bodyEl, faceEl, extraEl], { opacity: 1, '--dx': '0px' });
  gsap.to(viewer, { opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.1 });
  gsap.to(navEl, { opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.2 });
  gsap.to(backBtn, { opacity: 1, duration: 0.4, ease: 'power3.out', delay: 0.25 });
  updateButtons();
  preloadArt(CHARACTERS[1]);

  if (el._mounted) return;
  el._mounted = true;

  backBtn.addEventListener('click', () => navigate('#home'));
  prevBtn.addEventListener('click', () => goTo(el._current - 1));
  nextBtn.addEventListener('click', () => goTo(el._current + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

  // Swipe on the art + text area (touch / pen). Horizontal must dominate vertical.
  let start = null;
  viewer.addEventListener('pointerdown', (e) => {
    start = e.pointerType === 'mouse' ? null : { x: e.clientX, y: e.clientY };
  });
  viewer.addEventListener('pointercancel', () => { start = null; });
  viewer.addEventListener('pointerup', (e) => {
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    start = null;
    if (Math.abs(dx) >= SWIPE_MIN_PX && Math.abs(dx) > Math.abs(dy) * SWIPE_RATIO) {
      goTo(el._current + (dx < 0 ? 1 : -1));
    }
  });

  // Keyboard: left / right arrows, only while this screen is showing
  document.addEventListener('keydown', (e) => {
    if (!el.classList.contains('active')) return;
    if (e.key === 'ArrowRight') goTo(el._current + 1);
    else if (e.key === 'ArrowLeft') goTo(el._current - 1);
  });
}
