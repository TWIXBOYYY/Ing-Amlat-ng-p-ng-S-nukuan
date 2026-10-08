import { gsap } from 'gsap';

/** @type {Map<string, {mount?: Function, unmount?: Function}>} */
const routes = new Map();
let currentHash = null;

/**
 * @param {string} hash - e.g. '#home'
 * @param {{ mount?: Function, unmount?: Function }} hooks
 */
export function registerScreen(hash, hooks) {
  routes.set(hash, hooks);
}

/** @param {string} hash */
export function navigate(hash) {
  window.location.hash = hash;
}

export function getCurrentHash() {
  return currentHash;
}

function activate(hash) {
  const next   = routes.get(hash);
  const nextEl = document.querySelector(`.screen[data-screen="${hash}"]`);

  const doMount = () => {
    if (nextEl) {
      gsap.set(nextEl, { opacity: 0 });
      nextEl.classList.add('active');
      gsap.to(nextEl, { opacity: 1, duration: 0.4, ease: 'power2.out' });
    }
    if (next?.mount) next.mount(nextEl);
    currentHash = hash;
  };

  // Fade out previous screen, then show next
  if (currentHash && currentHash !== hash) {
    const prev   = routes.get(currentHash);
    const prevEl = document.querySelector(`.screen[data-screen="${currentHash}"]`);
    if (prev?.unmount) prev.unmount(prevEl);
    if (prevEl) {
      gsap.to(prevEl, {
        opacity: 0, duration: 0.28, ease: 'power2.in',
        onComplete: () => {
          prevEl.classList.remove('active');
          gsap.set(prevEl, { opacity: 1 }); // reset for next visit
          doMount();
        },
      });
    } else {
      doMount();
    }
  } else {
    doMount();
  }
}

function onHashChange() {
  const hash = window.location.hash || '#splash';
  if (routes.has(hash)) {
    activate(hash);
  } else {
    // Unknown route → go home
    navigate('#home');
  }
}

export function initRouter() {
  window.addEventListener('hashchange', onHashChange);
  onHashChange();
}
