import { gsap } from 'gsap';
import { navigate } from '../../utils/router.js';
import { AudioManager } from '../../audio/AudioManager.js';
import { toggleSettings } from '../../components/settings/settings.js';
import { pages } from '../../data/story.js';

const PRELOAD_AHEAD = 2;

const AUTOPLAY_INTERVAL_MS = 6000;
const HUD_IDLE_MS = 2500;
const VIDEO_START_FALLBACK_MS = 900;
const PAGE_TURN_SFX = encodeURI('/assets/audio/sfx/Turn a page.mp3');
const VIDEO_END_SNAP_S = 1.5;
const LANDSCAPE = '(orientation: landscape) and (min-width: 521px)';

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

  // A page that turns itself holds its last frame; a looping video would jump back to the start (and the
  // caption boxes with it) just before the page turns.
  if (page.video) {
    el.classList.add('reader-page--video');
    el.innerHTML = `
      <div class="reader-page-media">
        <video class="reader-page-video" src="${encodeURI(page.video)}" muted ${page.advanceAfter == null ? 'loop' : ''} playsinline
               preload="${index === 0 ? 'auto' : 'metadata'}" aria-label="${page.alt || `Page ${index + 1}`}"></video>
        <div class="reader-caption-frame">
          ${(page.captions || []).map(c => `
            <div class="reader-caption" data-at-x="${c.at.x}" data-at-y="${c.at.y}">
              <img class="reader-page-caption" src="${encodeURI(c.src)}" alt="${c.alt}" draggable="false" decoding="async">
            </div>`).join('')}
        </div>
      </div>`;
    return el;
  }

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
          <button class="reader-hud-img-btn" id="reader-settings-btn" aria-label="Open audio settings" aria-expanded="false">
            <span class="reader-hud-btn-img" aria-hidden="true">
        <img src="/assets/ui/Rectangle 43.png" draggable="false" alt=""/>
        <img src="/assets/ui/Rectangle 43.png" draggable="false" alt=""/>
        <img src="/assets/ui/Rectangle 43.png" draggable="false" alt=""/>
      </span>
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
/** @type {HTMLElement|null} */
let readerEl = null;
/** @type {number|null} */
let advanceTimer = null;
/** @type {number} page whose video may play (set when a page becomes current) */
let videoTarget = -1;
/** @type {number|null} */
let autoplayTimer = null;

/** @param {HTMLElement} el */
export function mountReader(el) {
  readerEl = el;
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

    // Decode caption pictures now so they are ready to fade in without a hitch
    stage.querySelectorAll('.reader-page-caption').forEach(img => {
      const done = () => layoutCaptions(img.closest('.reader-page'));
      (img.decode ? img.decode() : Promise.resolve()).then(done, done);
    });
    // The picture is cropped differently on every screen shape: re-fit when it changes
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => layoutCaptions(pageEls[currentIndex]), 120);
    });

    // HUD — always visible
    function showHud() {
      [hudTop, ...el.querySelectorAll('.reader-nav'), el.querySelector('#reader-progress')]
        .forEach(h => h && h.classList.add('show'));
    }
    el._showHud = showHud;
    ['pointermove', 'pointerdown', 'keydown'].forEach(t => el.addEventListener(t, () => wakeHud(el), { passive: true }));
    el._stopHud = () => {};

    // Navigation: buttons
    prevBtn.addEventListener('click', () => goTo(currentIndex - 1, 'prev', el));
    nextBtn.addEventListener('click', () => {
      if (currentIndex >= pages.length - 1) {
        stopAutoplay(el);
        navigate('#minigame-loading');
      } else {
        goTo(currentIndex + 1, 'next', el);
      }
    });

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

  // Every visit starts at page 1
  activatePage(0, null, refs);
  preloadAhead(0);
  if (el._showHud) el._showHud();
}

/** @param {HTMLElement} el */
export function unmountReader(el) {
  stopAutoplay(el);
  pageEls.forEach(pe => pe.querySelector('video')?.pause());
  resetCaptions();
  clearTimeout(advanceTimer);
  AudioManager.stopNarration();
  AudioManager.stopAmbience({ fade: true });
  clearTimeout(el._hudIdleTimer);
  el.classList.remove('hud-idle');
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

/** Video pages: portrait keeps the buttons clear of the picture (see .is-video-page in reader.css). */
function markVideoPage(el, idx) {
  if (!el) return;
  el.classList.toggle('is-video-page', !!pages[idx]?.video);
  wakeHud(el);
}

/** Show the buttons; on a landscape video page, hide them again after a few idle seconds. */
function wakeHud(el) {
  el.classList.remove('hud-idle');
  clearTimeout(el._hudIdleTimer);
  if (el.classList.contains('is-video-page') && window.matchMedia(LANDSCAPE).matches) {
    el._hudIdleTimer = setTimeout(() => el.classList.add('hud-idle'), HUD_IDLE_MS);
  }
}

/**
 * Put the current page's video back on its first frame; pause every other one.
 * A page with narration waits for the voice to start (see playPageVideo) so the picture and the
 * voice finish together; other video pages start right away.
 */
function syncVideos(idx) {
  videoTarget = idx;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  pageEls.forEach((pe, i) => {
    const v = pe.querySelector('video');
    if (!v) return;
    v.pause();
    if (i !== idx) return;
    v.currentTime = 0;
    if (!reduced && !pages[i].narration) playPageVideo(i);
  });
}

function playPageVideo(idx) {
  const v = pageEls[idx]?.querySelector('video');
  if (!v || idx !== videoTarget) return;   // the reader has moved on
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  v.play().catch(() => { /* autoplay blocked: first frame stays visible */ });
}

/**
 * Where the panel is drawn inside its frame-sized PNG: its centre and size, in % of the frame.
 * Measured once from the picture's opaque pixels, so a new caption only needs its target position.
 */
function measurePanel(img) {
  if (img._panel) return img._panel;
  const W = 400, H = Math.max(1, Math.round(W * img.naturalHeight / img.naturalWidth));
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const g = canvas.getContext('2d', { willReadFrequently: true });
  g.drawImage(img, 0, 0, W, H);
  const px = g.getImageData(0, 0, W, H).data;
  let l = W, t = H, r = -1, b = -1;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (px[(y * W + x) * 4 + 3] > 40) { if (x < l) l = x; if (x > r) r = x; if (y < t) t = y; if (y > b) b = y; }
    }
  }
  if (r < 0) return (img._panel = { cx: 50, cy: 50, w: 0, h: 0 });
  return (img._panel = {
    cx: (l + r + 1) / 2 / W * 100, cy: (t + b + 1) / 2 / H * 100,
    w: (r - l + 1) / W * 100,      h: (b - t + 1) / H * 100,
  });
}

/** How far to move [a,b] so it sits inside [lo,hi] (0 if it already does, or can't fit). */
const nudge = (a, b, lo, hi) => (b - a > hi - lo ? 0 : a < lo ? lo - a : b > hi ? hi - b : 0);

/**
 * Put each caption panel at its designed spot on the picture. If a narrower screen crops the
 * picture so that the panel would be cut off at the edge, slide it back inside (3% margin).
 */
function layoutCaptions(pe) {
  const frame = pe?.querySelector('.reader-caption-frame');
  const media = pe?.querySelector('.reader-page-media');
  if (!frame || !media) return;
  const fr = frame.getBoundingClientRect();
  const mr = media.getBoundingClientRect();
  if (!fr.width || !mr.width) return;
  const mx = mr.width * 0.03, my = mr.height * 0.03;

  pe.querySelectorAll('.reader-caption').forEach(wrap => {
    const img = wrap.firstElementChild;
    if (!img?.naturalWidth) return;                    // not loaded yet; laid out again once decoded
    const p = measurePanel(img);
    const ax = Number(wrap.dataset.atX), ay = Number(wrap.dataset.atY);
    const left = fr.left + (ax - p.w / 2) / 100 * fr.width;
    const top = fr.top + (ay - p.h / 2) / 100 * fr.height;
    const nx = nudge(left, left + p.w / 100 * fr.width, mr.left + mx, mr.right - mx);
    const ny = nudge(top, top + p.h / 100 * fr.height, mr.top + my, mr.bottom - my);
    // percentages are of the frame (the wrapper is frame-sized), then the px nudge
    wrap.style.translate = `calc(${(ax - p.cx).toFixed(3)}% + ${nx.toFixed(1)}px) calc(${(ay - p.cy).toFixed(3)}% + ${ny.toFixed(1)}px)`;
  });
}

/** Fade a caption panel up into place over the video. */
function revealCaption(img) {
  if (!img || img._shown) return;
  img._shown = true;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  gsap.killTweensOf(img);
  if (reduced) { gsap.set(img, { opacity: 1, y: 0 }); return; }

  // Start the fade only once the picture is decoded, otherwise the first frames are skipped and it pops
  const rise = () => {
    if (!img._shown) return;
    gsap.fromTo(img,
      { opacity: 0, y: 56 },
      { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out' });
  };
  (img.decode ? img.decode() : Promise.resolve()).then(rise, rise);
}

/** Hide every caption and cancel any pending reveal (on leaving a page, or restarting it). */
function resetCaptions() {
  pageEls.forEach(pe => {
    pe._capTimers?.forEach(clearTimeout);
    pe._capTimers = null;
    pe.querySelectorAll('.reader-page-caption').forEach(img => {
      img._shown = false;
      gsap.killTweensOf(img);
      gsap.set(img, { opacity: 0, y: 0 });
    });
  });
}

/**
 * Caption i appears when narration clip i starts. If the narration can't start (audio not
 * unlocked yet, file missing), each caption still appears at its fallbackAt time.
 */
function startCaptions(idx) {
  resetCaptions();
  const page = pages[idx];
  if (!page?.captions) return;
  const imgs = [...pageEls[idx].querySelectorAll('.reader-page-caption')];
  layoutCaptions(pageEls[idx]);
  pageEls[idx]._capTimers = page.captions.map((c, i) =>
    setTimeout(() => revealCaption(imgs[i]), (c.fallbackAt ?? 0) * 1000));
  return imgs;
}

/** Instantly set a page active (no animation) */
function activatePage(idx, _direction, refs) {
  markVideoPage(refs.el, idx);
  syncVideos(idx);
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
  AudioManager.playSfx(PAGE_TURN_SFX);
  markVideoPage(refs.el, idx);
  syncVideos(idx);

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

  if (prevBtn) prevBtn.disabled = i === 0;
  if (nextBtn) nextBtn.disabled = false; // last page leads to minigame, never disabled
  if (progFill) progFill.style.setProperty('--progress', `${pct}%`);

}

function triggerPageAudio(idx) {
  const page = pages[idx];
  if (!page) return;
  const captionImgs = startCaptions(idx);
  clearTimeout(advanceTimer);

  if (page.music)    AudioManager.playMusic(page.music);
  if (page.ambience) AudioManager.playAmbience(page.ambience, { gain: page.ambienceVolume ?? 1 });
  else if (page.ambience === null) AudioManager.stopAmbience({ fade: true });
  // The video starts with the voice; if the voice can't start (audio blocked), start it anyway
  if (page.video && page.narration) {
    (pageEls[idx]._capTimers ||= []).push(setTimeout(() => playPageVideo(idx), VIDEO_START_FALLBACK_MS));
  }
  AudioManager.playNarration(page.narration || null, {
    onTrack: i => {
      if (i === 0) playPageVideo(idx);
      const cap = page.captions?.[i];
      if (!cap) return;
      // wait for the voice itself (clips can open with a moment of silence)
      const t = setTimeout(() => revealCaption(captionImgs?.[i]), (cap.voiceAt ?? 0) * 1000);
      pageEls[idx]._capTimers?.push(t);
    },
    // After the last clip: wait, then turn the page (unless the reader already moved on)
    onEnd: () => {
      if (page.advanceAfter == null) return;
      let wait = page.advanceAfter;
      // If the video is about to finish anyway, turn the page as it does, so the last frame never sits still
      const v = pageEls[idx]?.querySelector('video');
      if (v && !v.loop && v.duration) {
        const left = (v.duration - v.currentTime) / v.playbackRate;
        if (Math.abs(left - wait) <= VIDEO_END_SNAP_S) wait = Math.max(left - 0.3, 0);   // start sliding just before the end
      }
      advanceTimer = setTimeout(() => {
        if (currentIndex === idx && readerEl?.classList.contains('active')) goTo(idx + 1, 'next', readerEl);
      }, wait * 1000);
    },
  });

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
    const video = pageEls[i]?.querySelector('video');
    if (video) video.preload = 'auto';
  }
}
