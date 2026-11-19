import { AudioManager } from './AudioManager.js';

const HOVER = encodeURI('/assets/audio/sfx/ui/hover 1.mp3');
const CLICK = encodeURI('/assets/audio/sfx/ui/click.mp3');
// both files open with ~0.4-0.5s of silence before the sound, which would make buttons feel laggy: skip it
const HOVER_PART = { start: 0.5, length: 0.7 };
const CLICK_PART = { start: 0.38, length: 0.7 };

// Buttons that already turn a page (previous/next in the story and the characters) stay quiet: they
// have the page-turn sound, so no click or hover sound is added there.
const SILENT = '.reader-nav-btn, .char-nav-btn, .char-dot';

/** The click sound, for places that react to a press without being a <button> (e.g. "click to continue"). */
export function playClickSound() {
  AudioManager.playSfx(CLICK, 1, CLICK_PART);
}

/** The enabled button under an event target, or null if it should stay silent. */
function soundButton(target) {
  const btn = target instanceof Element ? target.closest('button') : null;
  if (!btn || btn.disabled || btn.closest(SILENT)) return null;
  return btn;
}

/** Hover and click sounds for every button on the site, in one place (event delegation). */
export function initUiSounds() {
  // browsers only allow sound after a first click or key press, so any first interaction unlocks audio
  const unlock = () => AudioManager.unlock();
  document.addEventListener('pointerdown', unlock, { once: true, capture: true });
  document.addEventListener('keydown', unlock, { once: true, capture: true });

  let lastPress = 0;

  // hover: once each time a mouse pointer moves onto a button (not for touch). Not while a mouse button is
  // held down, and not right after a press (a new screen can slide a button under the pointer).
  document.addEventListener('pointerover', (e) => {
    if (e.pointerType !== 'mouse' || e.buttons) return;
    if (performance.now() - lastPress < 600) return;
    const btn = soundButton(e.target);
    if (!btn || btn.contains(e.relatedTarget)) return;
    AudioManager.playSfx(HOVER, 0.6, HOVER_PART);
  });

  // pressing a button cuts any hover sound short, so a click only ever sounds like a click
  document.addEventListener('pointerdown', (e) => {
    if (!soundButton(e.target)) return;
    lastPress = performance.now();
    AudioManager.stopSfx(HOVER, HOVER_PART);
  }, true);

  document.addEventListener('click', (e) => {
    if (!soundButton(e.target)) return;
    lastPress = performance.now();
    AudioManager.stopSfx(HOVER, HOVER_PART);
    playClickSound();
  }, true);
}
