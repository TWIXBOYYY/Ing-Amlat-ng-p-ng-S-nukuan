import { gsap } from 'gsap';
import { navigate } from '../../utils/router.js';
import { AudioManager } from '../../audio/AudioManager.js';
import { showSettings } from '../../components/settings/settings.js';
import { addParallaxLayers, startParallax } from '../../utils/parallax-bg.js';


export function createHomeScreen() {
  const el = document.createElement('div');
  el.className = 'screen screen-home';
  el.dataset.screen = '#home';

  el.innerHTML = `
    <!-- Title -->
    <div class="home-title-block" aria-label="Ing Amlat ng Ápûng Sinukuan">
      <img src="/assets/ui/Homepage Text .png" class="home-title-img" alt="Ing Amlat ng Ápûng Sinukuan" draggable="false"/>
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
  el._stopParallax?.();
  el._stopParallax = null;
  gsap.killTweensOf(el.querySelectorAll('.home-menu-btn, .home-settings-btn, .home-title-block'));
}
