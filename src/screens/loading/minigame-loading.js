import { gsap } from 'gsap';
import { navigate } from '../../utils/router.js';

// Same artwork with the baked sun + "LOADING..." painted out; the lockup is a separate image
const BG_SRC = '/assets/ui/Minigame Loading Screen (no lockup).png';
const LOCKUP_SRC = '/assets/ui/Loading for Minigame.png';   // sun + LOADING; only the text part is shown
const SUN_SRC = '/assets/ui/SUN (for loading).png';

// How long the screen stays up before the minigame starts
const DISPLAY_MS = 2600;
const DOT_COUNT = 3;
const DOT_STEP_S = 0.4;

export function createMinigameLoadingScreen() {
  const el = document.createElement('div');
  el.className = 'screen screen-minigame-loading';
  el.dataset.screen = '#minigame-loading';

  el.innerHTML = `
    <img src="${BG_SRC}" class="mgl-bg" alt="" aria-hidden="true" draggable="false" fetchpriority="high" decoding="async"/>
    <p class="mgl-sr-only" role="status" aria-live="polite">Loading minigame</p>
    <div class="mgl-row" aria-hidden="true">
      <img src="${LOCKUP_SRC}" class="mgl-lockup" alt="" draggable="false" decoding="async"/>
      <img src="${SUN_SRC}" class="mgl-sun" alt="" draggable="false" decoding="async"/>
      ${Array.from({ length: DOT_COUNT }, () => '<span class="mgl-dot"></span>').join('')}
    </div>
  `;

  // Warm the cache so the artwork is ready the moment the reader hands over
  new Image().src = BG_SRC;
  new Image().src = LOCKUP_SRC;
  new Image().src = SUN_SRC;

  return el;
}

/** @param {HTMLElement} el */
export function mountMinigameLoading(el) {
  const dots = el.querySelectorAll('.mgl-dot');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  stopMinigameLoading(el);

  // Dots appear one by one, hold, then reset and repeat
  gsap.set(dots, { opacity: reduceMotion ? 1 : 0 });
  if (!reduceMotion) {
    const tl = gsap.timeline({ repeat: -1 });
    dots.forEach((dot, i) => tl.set(dot, { opacity: 1 }, i * DOT_STEP_S));
    tl.set(dots, { opacity: 0 }, DOT_COUNT * DOT_STEP_S + 0.6);
    tl.to({}, { duration: 0.3 });
    el._dotsTimeline = tl;
  }

  el._timer = setTimeout(() => navigate('#minigame'), DISPLAY_MS);
}

/** @param {HTMLElement} el */
export function stopMinigameLoading(el) {
  if (el._timer) { clearTimeout(el._timer); el._timer = null; }
  if (el._dotsTimeline) { el._dotsTimeline.kill(); el._dotsTimeline = null; }
}
