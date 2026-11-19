import { gsap } from 'gsap';
import { navigate } from '../../utils/router.js';
import { AudioManager } from '../../audio/AudioManager.js';
import { showSettings } from '../../components/settings/settings.js';
import { addParallaxLayers, startParallax } from '../../utils/parallax-bg.js';


const STAR_SVG = `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 0 C53 34 66 47 100 50 C66 53 53 66 50 100 C47 66 34 53 0 50 C34 47 47 34 50 0Z" fill="#fff6c8"/></svg>')}")`;

/**
 * Sparkles on the title: small four-point stars that twinkle on the letters. Spots are picked from the
 * logo's own opaque pixels, so a star never lands on empty sky. Returns a function that stops it.
 */
function startTitleSparkles(el) {
  const art = el.querySelector('.home-title-art');
  const img = el.querySelector('.home-title-img');
  const layer = el.querySelector('.home-sparkles');
  if (!art || !img || !layer || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};

  let spots = null, timer = null, stopped = false;

  const buildSpots = () => {
    const W = 240, H = Math.max(1, Math.round(W * img.naturalHeight / img.naturalWidth));
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(img, 0, 0, W, H);
    const px = g.getImageData(0, 0, W, H).data;
    const out = [];
    for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) if (px[(y * W + x) * 4 + 3] > 200) out.push([x / W * 100, y / H * 100]);
    return out;
  };

  const spawn = () => {
    if (stopped || !spots?.length || layer.childElementCount > 9) return;
    const [x, y] = spots[Math.floor(Math.random() * spots.length)];
    const size = art.clientWidth * (0.04 + Math.random() * 0.05);   // relative to the logo, so it scales with it
    const star = document.createElement('i');
    star.className = 'home-sparkle';
    star.style.cssText = `left:${x}%;top:${y}%;width:${size}px;height:${size}px;background-image:${STAR_SVG}`;
    layer.appendChild(star);
    gsap.timeline({ onComplete: () => star.remove() })
      .fromTo(star, { scale: 0, rotate: -40, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: 0.32, ease: 'back.out(2)' })
      .to(star, { scale: 0, rotate: 50, opacity: 0, duration: 0.5, ease: 'power2.in' }, '+=0.12');
  };

  const begin = () => {
    spots = buildSpots();
    timer = setInterval(spawn, 190);
  };
  if (img.complete && img.naturalWidth) begin(); else img.addEventListener('load', begin, { once: true });

  return () => {
    stopped = true;
    clearInterval(timer);
    gsap.killTweensOf(layer.children);
    layer.replaceChildren();
  };
}

export function createHomeScreen() {
  const el = document.createElement('div');
  el.className = 'screen screen-home';
  el.dataset.screen = '#home';

  el.innerHTML = `
    <!-- Title -->
    <div class="home-title-block" aria-label="Ing Amlat ng Ápûng Sinukuan">
      <div class="home-title-art">
        <img src="/assets/ui/Homepage Text .png" class="home-title-img" alt="Ing Amlat ng Ápûng Sinukuan" draggable="false"/>
        <div class="home-sparkles" aria-hidden="true"></div>
      </div>
      <p class="home-tagline">Where Mt. Alaya Myths Come Alive</p>
    </div>

    <!-- Main menu -->
    <nav class="home-menu" role="navigation" aria-label="Main menu">
      <button class="home-menu-btn" data-action="story"     >Story</button>
      <button class="home-menu-btn" data-action="characters">Characters</button>
      <button class="home-menu-btn" data-action="about"     >About</button>
      <button class="home-menu-btn" data-action="credits"   >Credits</button>
    </nav>

    <!-- Settings button -->
    <button class="home-settings-btn" aria-label="Open audio settings" aria-expanded="false">
      <span class="home-settings-btn-img" aria-hidden="true">
        <img src="/assets/ui/Rectangle 43.png" draggable="false" alt=""/>
        <img src="/assets/ui/Rectangle 43.png" draggable="false" alt=""/>
        <img src="/assets/ui/Rectangle 43.png" draggable="false" alt=""/>
      </span>
    </button>

    <!-- Continue reading (hidden until saved progress exists) -->
    <button class="home-continue-btn" aria-label="Continue reading">Continue</button>
  `;

  // Back to front. Nearer layers move more; the mountain barely moves (mostly up/down).
  addParallaxLayers(el, [
    { src: '/assets/ui/layer-blue-bg.webp', depth: 0.5 },
    { src: '/assets/ui/layer-clouds.webp', depth: 1.4, y: 1.4, drift: 1.2 },
    { src: '/assets/ui/layer-ayala.webp',  depth: 0.3, y: 1.8 },
    // Same vertical travel as the mountain (0.3 * 1.8 = 0.8 * 0.675) so no gap can open at the seam
    { src: '/assets/ui/layer-ground.webp', depth: 0.8, y: 0.675, shift: 1.3 },
  ]);

  return el;
}

/** @param {HTMLElement} el */
export function mountHome(el) {
  const settingsBtn = el.querySelector('.home-settings-btn');

  // Animate in every visit
  const menu       = el.querySelector('.home-menu');
  const menuBtns   = el.querySelectorAll('.home-menu-btn');
  const titleBlock = el.querySelector('.home-title-block');
  gsap.set(menu,        { opacity: 1 });
  gsap.set(menuBtns,    { opacity: 0, y: 22 });
  gsap.set(settingsBtn, { opacity: 0, y: -20 });
  gsap.set(titleBlock,  { opacity: 0, y: -18 });

  gsap.to(titleBlock,  { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.1 });
  gsap.to(menuBtns, {
    opacity: 1, y: 0,
    duration: 0.7, ease: 'power3.out',
    stagger: 0.12, delay: 0.4,
  });
  gsap.to(settingsBtn, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.7 });

  // Background follows the cursor (restarted on every visit, stopped in unmount)
  el._stopParallax?.();
  el._stopParallax = startParallax(el);
  el._stopSparkles?.();
  gsap.delayedCall(1.2, () => { el._stopSparkles = startTitleSparkles(el); });   // after the title has faded in

  // Only wire up listeners once
  if (el._mounted) return;
  el._mounted = true;

  // Menu actions
  el.querySelector('[data-action="story"]').addEventListener('click', () => {
    AudioManager.unlock();
    navigate('#reader');
  });
  el.querySelector('[data-action="characters"]').addEventListener('click', () => navigate('#characters'));
  el.querySelector('[data-action="about"]')     .addEventListener('click', () => navigate('#about'));
  el.querySelector('[data-action="credits"]')   .addEventListener('click', () => navigate('#credits'));

  settingsBtn.addEventListener('click', showSettings);

}

/** @param {HTMLElement} el */
export function unmountHome(el) {
  el._stopSparkles?.();
  el._stopSparkles = null;
  el._stopParallax?.();
  el._stopParallax = null;
  gsap.killTweensOf(el.querySelectorAll('.home-menu-btn, .home-settings-btn, .home-title-block'));
}
