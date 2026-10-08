import { gsap } from 'gsap';
import { navigate } from '../../utils/router.js';


export function createLoadingScreen() {
  const el = document.createElement('div');
  el.className = 'screen screen-loading';
  el.dataset.screen = '#loading';

  el.innerHTML = `
    <p class="loading-label" role="status" aria-live="polite" aria-atomic="true">LOADING...</p>
    <div class="loading-orb-wrap" aria-hidden="true">
      <div class="loading-orb-glow"></div>
      <img src="/assets/ui/image 5.png" class="loading-orb-img" alt="" draggable="false"/>
    </div>
    <div class="loading-progress-bar" role="progressbar" aria-label="Loading progress"
         aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
      <div class="loading-progress-fill"></div>
    </div>
  `;

  return el;
}

/** @param {HTMLElement} el */
export function mountLoading(el) {
  const label    = el.querySelector('.loading-label');
  const bar      = el.querySelector('.loading-progress-bar');
  const fill     = el.querySelector('.loading-progress-fill');

  const orbWrap = el.querySelector('.loading-orb-wrap');

  gsap.set(label,   { opacity: 0, y: 10 });
  gsap.set(orbWrap, { opacity: 0, scale: 0.78 });

  gsap.to(label,   { opacity: 1, y: 0, duration: 0.7,  ease: 'power3.out', delay: 0.1 });
  gsap.to(orbWrap, { opacity: 1, scale: 1, duration: 1.1, ease: 'back.out(1.5)', delay: 0.2 });

  setTimeout(() => bar.classList.add('visible'), 400);

  function setProgress(p) {
    fill.style.width = `${p}%`;
    bar.setAttribute('aria-valuenow', Math.round(p));
  }

  // Slots for real critical assets (add paths when art lands)
  const criticalAssets = [
    // e.g. '/assets/ui/homepage-bg.webp'
  ];

  if (criticalAssets.length === 0) {
    // No real assets yet — simulate a short timed load
    gsap.to({ v: 0 }, {
      v: 100,
      duration: 1.6,
      ease: 'power1.inOut',
      onUpdate() { setProgress(this.targets()[0].v); },
      onComplete() { finish(el); },
    });
  } else {
    let done = 0;
    criticalAssets.forEach(src => {
      const img = new Image();
      img.onload = img.onerror = () => {
        done++;
        setProgress((done / criticalAssets.length) * 100);
        if (done === criticalAssets.length) finish(el);
      };
      img.src = src;
    });
  }
}

function finish(el) {
  setTimeout(() => {
    gsap.to(el, {
      opacity: 0,
      duration: 0.75,
      ease: 'power2.inOut',
      onComplete: () => navigate('#home'),
    });
  }, 350);
}
