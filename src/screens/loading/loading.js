import { gsap } from 'gsap';
import { navigate } from '../../utils/router.js';
import { addParallaxLayers, startParallax } from '../../utils/parallax-bg.js';


const DAY_BG   = '/assets/ui/MT.ALAYA_DAY.webp';
const NIGHT_BG = '/assets/ui/MT.ALAYA_DAY__NIGHT.webp';

/** The sun + LOADING... + progress bar over a parallax mountain. Day for the start, night for the minigame. */
export function buildLoadingScreen({ bg, className, screen }) {
  const el = document.createElement('div');
  el.className = `screen screen-loading ${className}`.trim();
  el.dataset.screen = screen;

  el.innerHTML = `
    <p class="loading-label" role="status" aria-live="polite" aria-atomic="true">LOADING...</p>
    <div class="loading-orb-wrap" aria-hidden="true">
      <div class="loading-orb-glow"></div>
      <img src="/assets/ui/SUN (for loading).png" class="loading-orb-img" alt="" draggable="false"/>
    </div>
    <div class="loading-progress-bar" role="progressbar" aria-label="Loading progress"
         aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
      <div class="loading-progress-fill"></div>
    </div>
  `;

  addParallaxLayers(el, [{ src: bg, depth: 0.35, y: 1.6 }]);   // starts fetching now
  return el;
}

export function createLoadingScreen() {
  const el = buildLoadingScreen({ bg: DAY_BG, className: '', screen: '#loading' });
  // The home screen's layers load while the loading screen plays
  ['bg', 'clouds', 'ayala', 'ground'].forEach(n => { new Image().src = `/assets/ui/layer-${n}.webp`; });
  return el;
}

export function createMinigameLoadingScreen() {
  return buildLoadingScreen({ bg: NIGHT_BG, className: 'screen-minigame-loading', screen: '#minigame-loading' });
}

/** @param {HTMLElement} el */
export function mountLoading(el, { duration = 1.6, onDone = () => navigate('#home'), fadeOut = true } = {}) {
  el._stopParallax?.();
  el._stopParallax = startParallax(el);

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
    el._loadTween = gsap.to({ v: 0 }, {
      v: 100,
      duration,
      ease: 'power1.inOut',
      onUpdate() { setProgress(this.targets()[0].v); },
      onComplete() { finish(el, onDone, fadeOut); },
    });
  } else {
    let done = 0;
    criticalAssets.forEach(src => {
      const img = new Image();
      img.onload = img.onerror = () => {
        done++;
        setProgress((done / criticalAssets.length) * 100);
        if (done === criticalAssets.length) finish(el, onDone, fadeOut);
      };
      img.src = src;
    });
  }
}

function finish(el, onDone, fadeOut) {
  el._finishTimer = setTimeout(() => {
    if (!fadeOut) { onDone(); return; }
    gsap.to(el, { opacity: 0, duration: 0.75, ease: 'power2.inOut', onComplete: onDone });
  }, 350);
}
