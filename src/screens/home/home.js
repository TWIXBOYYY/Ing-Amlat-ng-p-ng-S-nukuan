import { gsap } from 'gsap';
import { navigate } from '../../utils/router.js';
import { AudioManager } from '../../audio/AudioManager.js';
import { showSettings } from '../../components/settings/settings.js';



export function createHomeScreen() {
  const el = document.createElement('div');
  el.className = 'screen screen-home';
  el.dataset.screen = '#home';

  el.innerHTML = `
    <!-- Background layers (replace divs with <img> tags when real art arrives) -->
    <div class="home-layer home-sky"           data-depth="0"    aria-hidden="true"></div>
    <div class="home-layer home-clouds-left"   data-depth="0.08" aria-hidden="true"></div>
    <div class="home-layer home-clouds-right"  data-depth="0.08" aria-hidden="true"></div>
    <div class="home-mountain-bg"              data-depth="0.06" aria-hidden="true"></div>
    <div class="home-mountain-mid-l"                             aria-hidden="true"></div>
    <div class="home-mountain-mid-r"                             aria-hidden="true"></div>
    <div class="home-layer home-ground"        data-depth="0.14" aria-hidden="true"></div>

    <!-- Main menu -->
    <nav class="home-menu" role="navigation" aria-label="Main menu">
      <button class="home-menu-btn" data-action="story"  >Story</button>
      <button class="home-menu-btn" data-action="about"  >About</button>
      <button class="home-menu-btn" data-action="credits">Credits</button>
    </nav>

    <!-- Settings button -->
    <button class="home-settings-btn" aria-label="Open audio settings">
      <img src="/assets/ui/Asset 4AUTOPLAY 3.png" class="home-settings-btn-img" alt="" aria-hidden="true" draggable="false"/>
    </button>

    <!-- Continue reading (hidden until saved progress exists) -->
    <button class="home-continue-btn" aria-label="Continue reading">Continue</button>
  `;

  return el;
}

/** @param {HTMLElement} el */
export function mountHome(el) {
  const settingsBtn = el.querySelector('.home-settings-btn');

  // Animate in every visit
  const menuBtns = el.querySelectorAll('.home-menu-btn');
  gsap.set(menuBtns,   { opacity: 0, y: 22 });
  gsap.set(settingsBtn, { opacity: 0, y: -20 });

  gsap.to(menuBtns, {
    opacity: 1, y: 0,
    duration: 0.7, ease: 'power3.out',
    stagger: 0.12, delay: 0.25,
  });
  gsap.to(settingsBtn, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.55 });

  // Only wire up listeners once
  if (el._mounted) return;
  el._mounted = true;

  // Menu actions
  el.querySelector('[data-action="story"]').addEventListener('click', () => {
    AudioManager.unlock();
    navigate('#reader');
  });
  el.querySelector('[data-action="about"]')  .addEventListener('click', () => navigate('#about'));
  el.querySelector('[data-action="credits"]').addEventListener('click', () => navigate('#credits'));

  settingsBtn.addEventListener('click', showSettings);

  // Mouse-parallax (desktop only, respects prefers-reduced-motion)
  const parallaxEls = el.querySelectorAll('[data-depth]');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  function onMouseMove(e) {
    if (prefersReduced.matches) return;
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;

    parallaxEls.forEach(layer => {
      const d = parseFloat(layer.dataset.depth);
      const mx = window.innerWidth  * 0.025 * d;
      const my = window.innerHeight * 0.025 * d;
      gsap.to(layer, { x: dx * mx, y: dy * my, duration: 1.4, ease: 'power2.out' });
    });
  }

  el.addEventListener('mousemove', onMouseMove);
  el._cleanup = () => el.removeEventListener('mousemove', onMouseMove);
}

/** @param {HTMLElement} el */
export function unmountHome(el) {
  if (el._cleanup) { el._cleanup(); el._cleanup = null; }
  gsap.killTweensOf(el.querySelectorAll('[data-depth], .home-menu-btn, .home-settings-btn'));
}
