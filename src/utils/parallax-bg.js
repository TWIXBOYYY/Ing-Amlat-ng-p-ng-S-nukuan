/**
 * Layered parallax background. Each layer is a full-screen picture that shifts against the
 * cursor by its own depth: far layers barely move, near layers move a lot, which is what
 * makes the scene read as 3D. A layer can also drift on its own (clouds).
 *
 * Nothing moves when the user prefers reduced motion.
 */

const RANGE = 0.02;       // travel per 1.0 of depth, as a fraction of the screen size
const EASE = 0.06;        // 0..1, lower = floatier
const SWAY = 0.3;         // idle sway of the whole scene, in cursor units

/**
 * @param {HTMLElement} el
 * @param {{src: string, depth: number, y?: number, drift?: number}[]} layers  back to front.
 *   depth = how far it moves with the cursor, y = vertical multiplier (default 1),
 *   shift = static nudge upward in % of the screen height (hides a seam),
 *   drift = extra slow sideways drift of its own, in % of the screen width
 */
export function addParallaxLayers(el, layers) {
  const wrap = document.createElement('div');
  wrap.className = 'px-stack';
  wrap.setAttribute('aria-hidden', 'true');
  wrap.innerHTML = layers.map(l => {
    const pad = (l.depth * RANGE * 100 * 1.25 + 0.6 + Math.abs(l.shift ?? 0)).toFixed(2);   // overscan so edges never show
    return `<div class="px-layer" data-depth="${l.depth}" data-y="${l.y ?? 1}" data-drift="${l.drift ?? 0}"` +
           ` style="inset:-${pad}%;${l.shift ? `translate:0 ${-l.shift}%;` : ''}background-image:url('${l.src}')"></div>`;
  }).join('');
  el.prepend(wrap);
}

/** Start the loop; returns a stop function. Safe to call again after stopping. */
export function startParallax(el) {
  const layers = [...el.querySelectorAll('.px-layer')].map(node => ({
    node,
    depth: Number(node.dataset.depth),
    y: Number(node.dataset.y),
    drift: Number(node.dataset.drift),
  }));
  if (!layers.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};

  let tx = 0, ty = 0;       // target, -1..1
  let x = 0, y = 0;         // current
  let raf = 0;
  const t0 = performance.now();

  const onMove = e => {
    if (e.pointerType === 'touch') return;
    tx = (e.clientX / window.innerWidth) * 2 - 1;
    ty = (e.clientY / window.innerHeight) * 2 - 1;
  };
  const onLeave = () => { tx = 0; ty = 0; };

  function frame(now) {
    const t = (now - t0) / 1000;
    x += ((tx + Math.sin(t * 0.35) * SWAY) - x) * EASE;
    y += ((ty + Math.cos(t * 0.27) * SWAY) - y) * EASE;
    const w = window.innerWidth, h = window.innerHeight;

    layers.forEach(l => {
      const dx = -x * w * RANGE * l.depth + Math.sin(t * 0.12 + l.depth) * w * l.drift / 100;
      const dy = -y * h * RANGE * l.depth * l.y;
      l.node.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0)`;
    });
    raf = requestAnimationFrame(frame);
  }

  window.addEventListener('pointermove', onMove, { passive: true });
  document.documentElement.addEventListener('mouseleave', onLeave);
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('pointermove', onMove);
    document.documentElement.removeEventListener('mouseleave', onLeave);
  };
}
