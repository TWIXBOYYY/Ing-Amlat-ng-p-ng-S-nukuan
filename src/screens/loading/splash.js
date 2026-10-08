import { gsap } from 'gsap';
import { navigate } from '../../utils/router.js';


export function createSplashScreen() {
  const el = document.createElement('div');
  el.className = 'screen screen-splash';
  el.dataset.screen = '#splash';

  el.innerHTML = `
    <div class="splash-logo" aria-label="Áyup Productions">
      <img src="/assets/ui/AYUP_WHITE_LOGO.png" class="splash-logo-img" alt="Áyup Productions" draggable="false"/>
    </div>
  `;

  return el;
}

/** @param {HTMLElement} el */
export function mountSplash(el) {
  const logo = el.querySelector('.splash-logo');

  gsap.timeline()
    .fromTo(logo,
      { opacity: 0, scale: 0.88, y: 18 },
      { opacity: 1, scale: 1,    y: 0,  duration: 1.3, ease: 'power3.out' }
    )
    .to(logo, { opacity: 0, scale: 1.05, y: -12, duration: 0.75, ease: 'power2.in', delay: 1.2 })
    .add(() => navigate('#loading'));
}
