/**
 * One icon set for the whole site: Lucide (https://lucide.dev, ISC licence), inlined so the
 * icons take their colour from CSS (`color`) and scale with their container.
 */

const PATHS = {
  'chevron-left':  '<path d="m15 18-6-6 6-6"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  'arrow-left':    '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  'menu':          '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
  'circle-play':   '<circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>',
  'circle-pause':  '<circle cx="12" cy="12" r="10"/><line x1="10" x2="10" y1="15" y2="9"/><line x1="14" x2="14" y1="15" y2="9"/>',
};

/** @param {keyof typeof PATHS} name @param {string} [cls] extra class names */
export function icon(name, cls = '') {
  return `<svg class="ui-icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${PATHS[name]}</svg>`;
}
