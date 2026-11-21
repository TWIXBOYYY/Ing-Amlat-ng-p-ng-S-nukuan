/**
 * Keeps pictures and videos from staying blank after a failed or slow download.
 *
 * - A picture or video that fails is asked for again (up to 4 more times, waiting a little longer each time).
 *   The retry adds ?r=N to the address, so the browser cannot answer with the failed result it remembered.
 * - preloadImage() does the same for pictures the site fetches ahead of time.
 */

const DELAYS_MS = [700, 1500, 3000, 5000];

/** The address with a retry counter on it (and any earlier counter removed). */
function withRetry(src, n) {
  const clean = src.replace(/([?&])r=\d+(&|$)/, (m, a, b) => (b ? a : '')).replace(/[?&]$/, '');
  return `${clean}${clean.includes('?') ? '&' : '?'}r=${n}`;
}

function retryElement(el) {
  const tries = (el._assetTries || 0);
  if (tries >= DELAYS_MS.length) return;
  el._assetTries = tries + 1;
  const original = el._assetSrc ||= el.getAttribute('src');
  if (!original) return;
  setTimeout(() => {
    if (!el.isConnected && !el._assetKeep) return;
    el.setAttribute('src', withRetry(original, el._assetTries));
    if (el.tagName === 'VIDEO') el.load();
  }, DELAYS_MS[tries]);
}

/** Watch the whole page: a failing <img> or <video> is retried. Call once at start-up. */
export function initAssetGuard() {
  // 'error' does not bubble, but it can be caught on the way down
  window.addEventListener('error', (e) => {
    const t = e.target;
    if (t instanceof HTMLImageElement || t instanceof HTMLVideoElement) retryElement(t);
  }, true);
}

/** Fetch a picture ahead of time, retrying on failure. Resolves with the image (or null if every try failed). */
export function preloadImage(src) {
  return new Promise((resolve) => {
    let n = 0;
    const attempt = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => {
        if (n >= DELAYS_MS.length) { resolve(null); return; }
        setTimeout(attempt, DELAYS_MS[n]);
        n++;
      };
      img.src = n ? withRetry(src, n) : src;
    };
    attempt();
  });
}

/**
 * A picture used as a CSS background can't report its own failure, so check it separately: if the first
 * request failed but a retry works, the element is switched to the address that worked.
 */
export function guardBackground(node, src) {
  const probe = new Image();
  probe.onload = () => {};
  probe.onerror = () => {
    preloadImage(src).then((img) => {
      if (img) node.style.backgroundImage = `url('${img.src}')`;
    });
  };
  probe.src = src;
}
