import { gsap } from 'gsap';
import { navigate } from '../../utils/router.js';
import { mountLoading } from './loading.js';

// The minigame loading screen is the original night loading screen (see loading.js)
export { createMinigameLoadingScreen } from './loading.js';

const DISPLAY_MS = 2600;   // how long it stays up before the minigame starts

/** @param {HTMLElement} el */
export function mountMinigameLoading(el) {
  stopMinigameLoading(el);
  gsap.killTweensOf(el); gsap.set(el, { opacity: 1 });
  mountLoading(el, { duration: DISPLAY_MS / 1000 - 0.35, fadeOut: false, onDone: () => navigate('#minigame') });
}

/** @param {HTMLElement} el */
export function stopMinigameLoading(el) {
  el._stopParallax?.(); el._stopParallax = null;
  el._loadTween?.kill(); el._loadTween = null;
  clearTimeout(el._finishTimer);
  gsap.killTweensOf(el);
  gsap.killTweensOf(el.querySelectorAll('*'));
}
