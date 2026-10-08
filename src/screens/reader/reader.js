import { gsap } from 'gsap';
import { navigate } from '../../utils/router.js';
import { AudioManager } from '../../audio/AudioManager.js';
import { toggleSettings } from '../../components/settings/settings.js';
import { pages } from '../../data/story.js';

const STORAGE_KEY = 'sinukuan_last_page';
const PRELOAD_AHEAD = 2;

const AUTOPLAY_INTERVAL_MS = 6000;

/** Build a placeholder page for when the real image isn't available yet. */
function placeholderPage(page, index) {
  return `
    <div class="reader-page-placeholder" aria-label="${page.alt || `Page ${index + 1}`}">
      <span class="reader-placeholder-num" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>
      <span class="reader-placeholder-label">[ Art placeholder — ${page.id} ]</span>
    </div>`;
}

/** Build one .reader-page element. */
function buildPageEl(page, index) {
  const el = document.createElement('div');
  el.className = 'reader-page';
  el.dataset.pageId = page.id;
  el.dataset.index  = index;

  // Image with WebP + fallback (using <picture> when both exist)
  const imgSrc = page.image;
  const jpgSrc = imgSrc.replace(/\.webp$/, '.jpg');

  el.innerHTML = `
    ${placeholderPage(page, index)}
    <picture>
      <source srcset="${imgSrc}" type="image/webp">
      <img class="reader-page-img" src="${jpgSrc}" alt="${page.alt || `Page ${index + 1}`}" loading="lazy">
    </picture>
    ${(page.layers || []).map(l =>
      `<div class="reader-parallax-layer"
            style="background-image:url('${l.src}');background-position:${l.position || 'center'}"
            data-depth="${l.depth}"></div>`
    ).join('')}`;

  // Hide placeholder once image loads
  const img = el.querySelector('.reader-page-img');
  const ph  = el.querySelector('.reader-page-placeholder');
  img.addEventListener('load', () => { if (ph) ph.style.display = 'none'; });

  return el;
}

export function createReaderScreen() {
  const el = document.createElement('div');
  el.className = 'screen screen-reader';
  el.dataset.screen = '#reader';

  el.innerHTML = `
    <div class="reader-stage" aria-live="polite" aria-atomic="true"></div>

    <div class="reader-hud" aria-label="Reader controls">
      <!-- Top HUD -->
      <div class="reader-hud-top" id="reader-hud-top">
        <div class="reader-hud-left">
          <!-- Home -->
          <button class="reader-hud-img-btn" id="reader-home-btn" aria-label="Return to home">
            <img src="/assets/ui/Vector.png" class="reader-hud-btn-img" alt="" aria-hidden="true" draggable="false"/>
          </button>
          <!-- Restart -->
          <button class="reader-hud-img-btn reader-hud-restart-btn" id="reader-restart-btn" aria-label="Restart from page 1">
            <span class="reader-restart-label">Restart</span>
          </button>
          <!-- Autoplay -->
          <button class="reader-hud-img-btn" id="reader-autoplay-btn" aria-label="Toggle autoplay" aria-pressed="false">
            <img src="/assets/ui/Layer 6.png" class="reader-hud-btn-img" alt="" aria-hidden="true" draggable="false"/>
          </button>
        </div>
        <div class="reader-hud-right">
          <!-- Settings -->
          <button class="reader-hud-img-btn" id="reader-settings-btn" aria-label="Open audio settings">
            <img src="/assets/ui/Asset 4AUTOPLAY 3.png" class="reader-hud-btn-img" alt="" aria-hidden="true" draggable="false"/>
          </button>
        </div>
      </div>

      <!-- Prev arrow -->
      <div class="reader-nav reader-nav-prev">
        <button class="reader-nav-btn" id="reader-prev-btn" aria-label="Previous page">
          <img src="/assets/ui/NEXT BUTTON.png" class="nav-arrow-img nav-arrow-flip" alt="" aria-hidden="true" draggable="false"/>
        </button>
      </div>

      <!-- Next arrow -->
      <div class="reader-nav reader-nav-next">
        <button class="reader-nav-btn" id="reader-next-btn" aria-label="Next page">
          <img src="/assets/ui/NEXT BUTTON.png" class="nav-arrow-img" alt="" aria-hidden="true" draggable="false"/>
        </button>
      </div>

      <!-- Bottom progress -->
      <div class="reader-progress" id="reader-progress">
        <div class="reader-progress-track" id="reader-progress-track">
          <div class="reader-progress-fill" id="reader-progress-fill"></div>
          <img class="reader-progress-frame" src="/assets/ui/PROGRESS BAR.png"
               alt="" draggable="false" aria-hidden="true"/>
        </div>
      </div>

    </div>
  `;

  return el;
}

/** @type {number} */
let currentIndex = 0;
/** @type {HTMLElement[]} */
let pageEls = [];
/** @type {boolean} */
let isTransitioning = false;
/** @type {number|null} */
let autoplayTimer = null;

/** @param {HTMLElement} el */
export function mountReader(el) {
  const stage    = el.querySelector('.reader-stage');
  const hudTop   = el.querySelector('#reader-hud-top');
  const prevBtn  = el.querySelector('#reader-prev-btn');
  const nextBtn  = el.querySelector('#reader-next-btn');
  const progFill = el.querySelector('#reader-progress-fill');
  const refs = { stage, prevBtn, nextBtn, progFill, el };

  if (!el._mounted) {
    el._mounted = true;

    // Build page DOM once
    pageEls = pages.map((p, i) => {
      const pe = buildPageEl(p, i);
      stage.appendChild(pe);
      return pe;
    });

    // HUD — always visible
    function showHud() {
      [hudTop, ...el.querySelectorAll('.reader-nav'), el.querySelector('#reader-progress')]
        .forEach(h => h && h.classList.add('show'));
    }
    el._showHud = showHud;
    el._stopHud = () => {};

    // Navigation: buttons
    prevBtn.addEventListener('click', () => goTo(currentIndex - 1, 'prev', el));
    nextBtn.addEventListener('click', () => goTo(currentIndex + 1, 'next', el));

    // Navigation: keyboard (only fires when reader is the active screen)
    document.addEventListener('keydown', e => {
      if (!el.classList.contains('active')) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goTo(currentIndex + 1, 'next', el);
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   goTo(currentIndex - 1, 'prev', el);
    });

    // Navigation: touch swipe
    let touchStartX = 0, touchStartY = 0;
    stage.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    stage.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
        dx < 0 ? goTo(currentIndex + 1, 'next', el) : goTo(currentIndex - 1, 'prev', el);
      }
    }, { passive: true });

    // Navigation: horizontal wheel / trackpad
    let wheelLock = false;
    stage.addEventListener('wheel', e => {
      if (wheelLock) return;
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(delta) < 30) return;
      wheelLock = true;
      setTimeout(() => { wheelLock = false; }, 700);
      delta > 0 ? goTo(currentIndex + 1, 'next', el) : goTo(currentIndex - 1, 'prev', el);
    }, { passive: true });

    // Navigation: click left/right half
    stage.addEventListener('click', e => {
      // Ignore clicks that originated from HUD buttons
      if (e.target.closest('.reader-hud')) return;
      const x = e.clientX / window.innerWidth;
      if (x > 0.55)      goTo(currentIndex + 1, 'next', el);
      else if (x < 0.45) goTo(currentIndex - 1, 'prev', el);
    });

    // HUD action buttons
    el.querySelector('#reader-home-btn').addEventListener('click', () => {
      stopAutoplay(el);
      AudioManager.pauseAll();
      navigate('#home');
    });

    el.querySelector('#reader-restart-btn').addEventListener('click', () => {
      stopAutoplay(el);
      goTo(0, currentIndex > 0 ? 'prev' : 'next', el);
    });

    el.querySelector('#reader-autoplay-btn').addEventListener('click', () => {
      const btn = el.querySelector('#reader-autoplay-btn');
      if (autoplayTimer) {
        stopAutoplay(el);
      } else {
        startAutoplay(el);
      }
      btn.setAttribute('aria-pressed', String(!!autoplayTimer));
    });

    el.querySelector('#reader-settings-btn').addEventListener('click', toggleSettings);
  }

  // Every visit: restore saved page, activate, show HUD
  try {
    const saved = parseInt(localStorage.getItem(STORAGE_KEY), 10);
    if (!isNaN(saved) && saved >= 0 && saved < pages.length) currentIndex = saved;
  } catch { /* ignore */ }

  activatePage(currentIndex, null, refs);
  preloadAhead(currentIndex);
  if (el._showHud) el._showHud();
}

/** @param {HTMLElement} el */
export function unmountReader(el) {
  stopAutoplay(el);
  if (el._hideTimer) el._hideTimer();
  gsap.killTweensOf(pageEls);
}

// ─────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────

function goTo(idx, direction, rootEl) {
  if (idx < 0 || idx >= pages.length || isTransitioning) return;
  const refs = getRefs(rootEl);
  transitionTo(idx, direction, refs);
}

function getRefs(el) {
  return {
    stage:    el.querySelector('.reader-stage'),
    prevBtn:  el.querySelector('#reader-prev-btn'),
    nextBtn:  el.querySelector('#reader-next-btn'),
    progFill: el.querySelector('#reader-progress-fill'),
    el,
  };
}

/** Instantly set a page active (no animation) */
function activatePage(idx, _direction, refs) {
  pageEls.forEach((pe, i) => {
    pe.classList.toggle('is-current', i === idx);
    gsap.set(pe, { opacity: i === idx ? 1 : 0, x: 0 });
  });
  currentIndex = idx;
  updateUI(refs);
  triggerPageAudio(idx);
}

/** Animated transition to a page */
function transitionTo(idx, direction, refs) {
  if (isTransitioning || idx === currentIndex) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const outEl = pageEls[currentIndex];
  const inEl  = pageEls[idx];
  const sign   = direction === 'next' ? 1 : -1;

  isTransitioning = true;

  if (reduced) {
    gsap.set(outEl, { opacity: 0 });
    gsap.set(inEl,  { opacity: 1, x: 0 });
    outEl.classList.remove('is-current');
    inEl.classList.add('is-current');
    currentIndex = idx;
    isTransitioning = false;
    updateUI(refs);
    triggerPageAudio(idx);
    preloadAhead(idx);
    return;
  }

  // Position incoming page off screen
  gsap.set(inEl, { x: sign * 1920, opacity: 1 });
  inEl.classList.add('is-current');

  gsap.timeline({ onComplete: () => { isTransitioning = false; } })
    .to(outEl, { x: -sign * 200, opacity: 0, duration: 0.45, ease: 'power2.in' }, 0)
    .to(inEl,  { x: 0,            opacity: 1, duration: 0.55, ease: 'power2.out' }, 0.08)
    .add(() => {
      outEl.classList.remove('is-current');
      gsap.set(outEl, { x: 0 });
      currentIndex = idx;
      updateUI(refs);
      triggerPageAudio(idx);
      preloadAhead(idx);
    });
}

function updateUI({ prevBtn, nextBtn, progFill }) {
  const i   = currentIndex;
  const n   = pages.length;
  const pct = (n > 1) ? (i / (n - 1)) * 100 : 100;

  if (prevBtn)  prevBtn.disabled = i === 0;
  if (nextBtn)  nextBtn.disabled = i === n - 1;
  if (progFill) progFill.style.setProperty('--progress', `${pct}%`);

  try { localStorage.setItem(STORAGE_KEY, String(i)); } catch { /* ignore */ }
}

function triggerPageAudio(idx) {
  const page = pages[idx];
  if (!page) return;

  if (page.music)    AudioManager.playMusic(page.music);
  if (page.ambience) AudioManager.playAmbience(page.ambience);
  AudioManager.playNarration(page.narration || null);

  (page.sfx || []).filter(s => s.on === 'enter').forEach(s => AudioManager.playSfx(s.src));
}

function startAutoplay(el) {
  autoplayTimer = setInterval(() => {
    if (currentIndex >= pages.length - 1) {
      stopAutoplay(el);
      return;
    }
    goTo(currentIndex + 1, 'next', el);
  }, AUTOPLAY_INTERVAL_MS);
  el.querySelector('#reader-autoplay-btn')?.classList.add('autoplay-active');
}

function stopAutoplay(el) {
  if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; }
  el?.querySelector('#reader-autoplay-btn')?.classList.remove('autoplay-active');
}

function preloadAhead(idx) {
  for (let i = idx + 1; i <= idx + PRELOAD_AHEAD && i < pages.length; i++) {
    const img = pageEls[i]?.querySelector('.reader-page-img');
    if (img && !img.src) img.src = pages[i].image;
  }
}
