import { gsap } from 'gsap';
import { navigate } from '../../utils/router.js';

const CHARACTERS = [
  {
    id: 'bulan',
    name: 'Bulan',
    subtitle: 'God of the Moon',
    description: 'The other soul that emerged from Apung Batala\'s two souls, depicted as the Moon and the rival of Aldo. After emerging, Bulan became a red fiery bird who battles Aldo for rulership of the heavens.',
  },
  {
    id: 'apung-mallari',
    name: 'Apung Mallari',
    subtitle: 'Deity of Mt. Pinatubo',
    description: 'As they continued to fight on Earth, the birds take flesh as a mountain-sized female giant and continued to fight Apung Sinukuan using Bamboo poles as their weapon.',
  },
  {
    id: 'indung-tibuan',
    name: 'Indung Tibuan',
    subtitle: 'Ancestral Earth Spirit',
    description: 'The giant crocodile Earth-mother who carries the land on her back. Her movements cause Earthquakes.',
  },
  {
    id: 'apung-mangacha',
    name: 'Apung Mangacha',
    subtitle: 'Spirit of the Weaver',
    description: 'The giant spider who weaves the Sikluban, a dome which holds the sky and water.',
  },
  {
    id: 'apung-sinukuan',
    name: 'Apung Sinukuan',
    subtitle: 'God of the Sun & War',
    description: 'A fiery white bird illuminating the heavens. He clashes with Bulan and is determined to rule the sky. The mighty ruler of Mt. Arayat who commands the forces of fire, war, and the blazing sun.',
  },
  {
    id: 'aldo',
    name: 'Aldo',
    subtitle: 'Solar Deity',
    description: 'One of Apung Batala\'s two souls, released after his body dissolved inside Indung Tibuan\'s belly. Aldo is depicted as the Sun.',
  },
  {
    id: 'apung-namalyari',
    name: 'Apung Namalyari',
    subtitle: 'Creator & Protector',
    description: 'The benevolent creator deity who watches over the people of Pampanga. Apung Namalyari maintains the balance between the divine and mortal worlds.',
  },
];

export function createCharactersScreen() {
  const el = document.createElement('div');
  el.className = 'screen screen-characters';
  el.dataset.screen = '#characters';

  el.innerHTML = `
    <div class="char-viewer">
      <div class="char-text">
        <p class="char-counter">1 / ${CHARACTERS.length}</p>
        <h2 class="char-name">${CHARACTERS[0].name}</h2>
        <p class="char-subtitle">${CHARACTERS[0].subtitle}</p>
        <p class="char-description">${CHARACTERS[0].description}</p>
      </div>
      <div class="char-art">
        <div class="char-art-placeholder">
          <span class="char-art-label">[ Character Art Placeholder ]</span>
        </div>
      </div>
    </div>

    <div class="char-nav">
      <button class="char-nav-btn char-prev-btn" aria-label="Previous character" disabled>
        <img src="/assets/ui/NEXT BUTTON.png" class="char-nav-img char-nav-flip" alt="" aria-hidden="true" draggable="false"/>
      </button>
      <button class="char-nav-btn char-next-btn" aria-label="Next character">
        <img src="/assets/ui/NEXT BUTTON.png" class="char-nav-img" alt="" aria-hidden="true" draggable="false"/>
      </button>
    </div>

    <button class="screen-back-btn" aria-label="Go back to home">
      <img src="/assets/ui/NEXT BUTTON.png" class="nav-arrow-img nav-arrow-flip" alt="" aria-hidden="true" draggable="false"/>
      <span class="screen-back-label">Back</span>
    </button>
  `;

  return el;
}

/** @param {HTMLElement} el */
export function mountCharacters(el) {
  let current = 0;

  const counterEl    = el.querySelector('.char-counter');
  const nameEl       = el.querySelector('.char-name');
  const subtitleEl   = el.querySelector('.char-subtitle');
  const descEl       = el.querySelector('.char-description');
  const artEl        = el.querySelector('.char-art');
  const viewer       = el.querySelector('.char-viewer');
  const prevBtn      = el.querySelector('.char-prev-btn');
  const nextBtn      = el.querySelector('.char-next-btn');

  function updateButtons() {
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === CHARACTERS.length - 1;
  }

  function showCharacter(index, direction = 1) {
    const char = CHARACTERS[index];
    const outX = direction * -60;
    const inX  = direction * 60;

    gsap.to(viewer, {
      opacity: 0, x: outX, duration: 0.25, ease: 'power2.in',
      onComplete: () => {
        counterEl.textContent  = `${index + 1} / ${CHARACTERS.length}`;
        nameEl.textContent     = char.name;
        subtitleEl.textContent = char.subtitle;
        descEl.textContent     = char.description;
        gsap.fromTo(viewer,
          { opacity: 0, x: inX },
          { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' }
        );
      },
    });
    updateButtons();
  }

  // Animate in on each visit
  gsap.set([viewer, el.querySelector('.char-nav'), el.querySelector('.screen-back-btn')], { opacity: 0 });
  gsap.to(viewer, { opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.1 });
  gsap.to(el.querySelector('.char-nav'), { opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.2 });
  gsap.to(el.querySelector('.screen-back-btn'), { opacity: 1, duration: 0.4, ease: 'power3.out', delay: 0.25 });

  if (el._mounted) {
    updateButtons();
    return;
  }
  el._mounted = true;

  el.querySelector('.screen-back-btn').addEventListener('click', () => navigate('#home'));

  prevBtn.addEventListener('click', () => {
    if (current > 0) { current--; showCharacter(current, -1); }
  });

  nextBtn.addEventListener('click', () => {
    if (current < CHARACTERS.length - 1) { current++; showCharacter(current, 1); }
  });
}
