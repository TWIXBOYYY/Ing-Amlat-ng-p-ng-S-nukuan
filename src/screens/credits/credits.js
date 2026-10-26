import { gsap } from 'gsap';
import { navigate } from '../../utils/router.js';

/**
 * Edit this data to update credits without touching layout code.
 *
 * @type {Array<{ section: string, entries: Array<{ name: string, role: string }> }>}
 */
const CREDITS_DATA = [
  {
    section: 'Team',
    entries: [
      { name: 'Drew Alban',     role: 'Creative Director & Leader' },
      { name: 'Leann Limjoco',  role: 'Artist'                     },
      { name: 'Crishel Marquez', role: 'Research Lead & UI Design' },
      { name: 'Angel Omampo',   role: 'Artist & Web Lead'          },
    ],
  },
  {
    section: 'Special Thanks',
    entries: [
      { name: 'Kristia Quismundo', role: 'Scriptwriter'          },
      { name: 'Jedi Directo',      role: 'Research Adviser'      },
      { name: 'Owen',              role: 'Web Developer'         },
      { name: 'Brian Ragaza',      role: 'Technical Adviser'     },
      { name: 'Mike Pangilinan',   role: 'Cultural Consultant'   },
    ],
  },
  {
    section: 'Audio',
    entries: [
      { name: 'Name 3', role: 'Apùng Sinùkuan · Voice Actor & Narration'  },
      { name: 'Name 4', role: 'Apùng Panàbang · Voice Actor & Narration'  },
    ],
  },
];

export function createCreditsScreen() {
  const el = document.createElement('div');
  el.className = 'screen screen-credits';
  el.dataset.screen = '#credits';

  const sectionsHTML = CREDITS_DATA.map(sec => `
    <div class="credits-block">
      <h3 class="credits-section-title">${sec.section}</h3>
      <ul class="credits-list" role="list">
        ${sec.entries.map(e => `
          <li class="credits-entry">
            <span class="credits-name">${e.name}</span>
            <span class="credits-role">${e.role}</span>
          </li>`).join('')}
      </ul>
    </div>`).join('');

  el.innerHTML = `
    <h2 class="credits-title">CREDITS</h2>
    <div class="credits-grid">${sectionsHTML}</div>
    <p class="credits-footer">Dakal a Salamat!</p>
    <button class="screen-back-btn" aria-label="Go back to home">
      <img src="/assets/ui/NEXT BUTTON.png" class="nav-arrow-img nav-arrow-flip" alt="" aria-hidden="true" draggable="false"/>
      <span class="screen-back-label">Back</span>
    </button>
  `;

  return el;
}

/** @param {HTMLElement} el */
export function mountCredits(el) {
  const title   = el.querySelector('.credits-title');
  const blocks  = el.querySelectorAll('.credits-block');
  const footer  = el.querySelector('.credits-footer');
  const backBtn = el.querySelector('.screen-back-btn');

  // Animate in every visit (kill any previous tween first to avoid stacking)
  gsap.killTweensOf([title, backBtn, footer, ...blocks]);
  gsap.set([title, backBtn, footer, ...blocks], { opacity: 0, y: 20 });

  gsap.to(title,   { opacity: 1, y: 0, duration: 0.6,  ease: 'power3.out', delay: 0.05 });
  gsap.to(backBtn, { opacity: 1, y: 0, duration: 0.5,  ease: 'power3.out', delay: 0.1  });
  gsap.to(blocks,  { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out', stagger: 0.09, delay: 0.2 });
  gsap.to(footer,  { opacity: 1, y: 0, duration: 0.5,  ease: 'power2.out', delay: 0.55  });

  // Only wire up listeners once
  if (el._mounted) return;
  el._mounted = true;

  el.querySelector('.screen-back-btn').addEventListener('click', () => navigate('#home'));
}
