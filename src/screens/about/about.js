import { gsap } from 'gsap';
import { navigate } from '../../utils/router.js';

export function createAboutScreen() {
  const el = document.createElement('div');
  el.className = 'screen screen-about';
  el.dataset.screen = '#about';

  el.innerHTML = `
    <div class="about-text">
      <h1 class="about-heading">HELLO!</h1>
      <p class="about-body">
        <strong>Áyup Production</strong> is a team composing of four Multimedia arts students
        under Graphic Design, developing a project entitled "Ing Amlat ng Ápûng Sínukuan,
        an interactive digital comic retelling Mt. Alaya myths for today's youth".
        The project combines qualitative research on the Kapampangan myths along with
        visual storytelling to create an accessible material that is engaging yet
        culturally rooted.
      </p>
    </div>

    <div class="about-image-wrap">
      <img class="about-image loaded" src="/assets/ui/awkward dog.jpg" alt="Áyup Production team" />
    </div>

    <button class="screen-back-btn" aria-label="Go back to home">
      <img src="/assets/ui/NEXT BUTTON.png" class="nav-arrow-img nav-arrow-flip" alt="" aria-hidden="true" draggable="false"/>
      <span class="screen-back-label">Back</span>
    </button>
  `;

  return el;
}

/** @param {HTMLElement} el */
export function mountAbout(el) {
  const text    = el.querySelector('.about-text');
  const img     = el.querySelector('.about-image-wrap');
  const backBtn = el.querySelector('.screen-back-btn');

  // Animate in every visit
  gsap.set([text, img, backBtn], { opacity: 0, y: 24 });
  gsap.to(text,    { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out', delay: 0.1  });
  gsap.to(img,     { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out', delay: 0.22 });
  gsap.to(backBtn, { opacity: 1, y: 0, duration: 0.5,  ease: 'power3.out', delay: 0.32 });

  // Only wire up listeners once
  if (el._mounted) return;
  el._mounted = true;

  el.querySelector('.screen-back-btn').addEventListener('click', () => navigate('#home'));

  // Try loading the real team photo
  const realImg = el.querySelector('.about-image');
  const ph      = el.querySelector('.about-image-placeholder');
  realImg.addEventListener('load', () => {
    realImg.classList.add('loaded');
    if (ph) ph.style.display = 'none';
  });
}
