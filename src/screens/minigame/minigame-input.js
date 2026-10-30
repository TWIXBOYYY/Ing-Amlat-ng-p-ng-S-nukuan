/**
 * Who Is Who — input handling (mouse, touch and pen through Pointer Events, plus
 * tap-to-place and keyboard). The game rules live in minigame.js; this module only
 * decides WHAT the player did and calls the game's place / remove functions.
 *
 * Sources a player can move:   a chip in the pool (.mg-tag)  or  a chip already in a slot
 * Targets:                     answer slots (.mg-drop-zone)
 */

const DRAG_THRESHOLD_PX = 6;      // below this a press is a tap
const HIT_SLOP_PX = 12;           // forgiving drop targets
const EDGE_SCROLL_ZONE_PX = 60;
const EDGE_SCROLL_STEP_PX = 12;
const RETURN_MS = 150;

/**
 * @param {HTMLElement} el       the minigame screen
 * @param {{ placeChip: (zone: HTMLElement, id: string) => void,
 *           removeChip: (zone: HTMLElement) => void }} game
 */
export function wireInput(el, game) {
  const board = el.querySelector('.mg-board');
  const zones = [...el.querySelectorAll('.mg-drop-zone')];
  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const chipFor = id => el.querySelector(`.mg-tag[data-id="${id}"]`);

  // ── Selection (tap-to-place / keyboard) ──
  let selectedId = null;

  function select(id) {
    selectedId = id;
    el.querySelectorAll('.mg-tag').forEach(chip => {
      const on = chip.dataset.id === id;
      chip.classList.toggle('is-selected', on);
      chip.setAttribute('aria-pressed', String(on));
    });
  }

  const clearSelection = () => select(null);
  el._mgClearSelection = clearSelection;

  /** What a tap (or Enter/Space) on this element does. */
  function activate(target) {
    const chip = target.closest('.mg-tag');
    const zone = target.closest('.mg-drop-zone');

    if (chip && !chip.disabled) {
      select(selectedId === chip.dataset.id ? null : chip.dataset.id);
    } else if (zone) {
      if (selectedId) {
        game.placeChip(zone, selectedId);   // empty slot, or a filled one (same rule as a drop)
        clearSelection();
      } else if (zone.dataset.filled) {
        game.removeChip(zone);              // tap a placed chip: back to the pool
      }
    }
  }

  // Keyboard: Enter / Space arrive as a click with detail 0. Real taps are handled
  // from pointer events, so clicks with detail > 0 are ignored here.
  board.addEventListener('click', e => {
    if (e.detail !== 0) return;
    activate(e.target);
  });

  // No long-press menu / magnifier on chips and slots
  board.addEventListener('contextmenu', e => {
    if (e.target.closest('.mg-tag, .mg-drop-zone')) e.preventDefault();
  });

  // ── Pointer drag ──
  /** @type {null | {pointerId:number, source:HTMLElement, id:string, fromZone:HTMLElement|null,
   *   startX:number, startY:number, offX:number, offY:number, x:number, y:number,
   *   dragging:boolean, ghost:HTMLElement|null, hover:HTMLElement|null, raf:number}} */
  let drag = null;

  board.addEventListener('pointerdown', e => {
    if (drag) return;                                          // one active pointer only
    if (e.pointerType === 'mouse' && e.button !== 0) return;   // primary button only
    if (!e.isPrimary) return;

    const chip = e.target.closest('.mg-tag');
    const zone = e.target.closest('.mg-drop-zone');
    const source = chip && !chip.disabled ? chip : (zone?.dataset.filled ? zone : null);
    if (!source) {
      // Empty slot (or nothing): it can still be tapped, so remember a tap candidate
      if (zone) drag = tapOnly(e, zone);
      return;
    }

    const rect = source.getBoundingClientRect();
    drag = {
      pointerId: e.pointerId,
      source,
      id: source.dataset.id || source.dataset.filled,
      fromZone: source === zone ? zone : null,
      startX: e.clientX, startY: e.clientY,
      offX: e.clientX - rect.left, offY: e.clientY - rect.top,
      x: e.clientX, y: e.clientY,
      dragging: false, ghost: null, hover: null, raf: 0,
    };
    source.setPointerCapture?.(e.pointerId);
  });

  /** A press on an empty slot: no drag, only a tap on release. */
  function tapOnly(e, zone) {
    return {
      pointerId: e.pointerId, source: zone, id: null, fromZone: null,
      startX: e.clientX, startY: e.clientY, offX: 0, offY: 0, x: e.clientX, y: e.clientY,
      dragging: false, ghost: null, hover: null, raf: 0, tapOnly: true,
    };
  }

  board.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.pointerId) return;
    drag.x = e.clientX;
    drag.y = e.clientY;
    if (drag.tapOnly) return;

    if (!drag.dragging) {
      if (Math.hypot(drag.x - drag.startX, drag.y - drag.startY) <= DRAG_THRESHOLD_PX) return;
      beginDrag();
    }
    e.preventDefault();
  });

  board.addEventListener('pointerup', e => {
    if (!drag || e.pointerId !== drag.pointerId) return;
    const d = drag;
    drag = null;
    release(d);

    if (!d.dragging) {
      // Tap: the finger / cursor stayed within the threshold
      if (Math.hypot(e.clientX - d.startX, e.clientY - d.startY) <= DRAG_THRESHOLD_PX) activate(d.source);
      return;
    }
    finishDrag(d, e.clientX, e.clientY);
  });

  const cancel = e => {
    if (!drag || e.pointerId !== drag.pointerId) return;
    const d = drag;
    drag = null;
    release(d);
    if (d.dragging) returnToOrigin(d, originRect(d));
  };
  board.addEventListener('pointercancel', cancel);
  board.addEventListener('lostpointercapture', cancel);

  function release(d) {
    cancelAnimationFrame(d.raf);
    d.source.releasePointerCapture?.(d.pointerId);
    setHover(d, null);
  }

  function beginDrag() {
    const d = drag;
    d.dragging = true;
    clearSelection();

    const rect = d.source.getBoundingClientRect();
    const cs = getComputedStyle(d.source);

    // Ghost: a visual copy in <body> (an ancestor transform would break position: fixed).
    // Size and font come from the source, because cqw units don't resolve outside the board.
    const ghost = document.createElement('div');
    ghost.className = 'mg-ghost';
    ghost.textContent = d.source.textContent;
    ghost.style.setProperty('--gw', `${rect.width}px`);
    ghost.style.setProperty('--gh', `${rect.height}px`);
    ghost.style.setProperty('--gf', cs.fontSize);
    ghost.style.setProperty('--gr', cs.borderRadius);
    document.body.appendChild(ghost);
    d.ghost = ghost;

    d.source.classList.add('dragging');
    document.body.classList.add('mg-is-dragging');
    tick(d);
  }

  /** One frame: move the ghost, update the hover target, auto-scroll near the edges. */
  function tick(d) {
    if (drag !== d) return;
    d.ghost.style.transform = `translate3d(${d.x - d.offX}px, ${d.y - d.offY}px, 0)`;
    setHover(d, zoneAt(d.x, d.y));

    const vh = window.innerHeight;
    const dir = d.y < EDGE_SCROLL_ZONE_PX ? -1 : d.y > vh - EDGE_SCROLL_ZONE_PX ? 1 : 0;
    if (dir) {
      const scroller = el.scrollHeight > el.clientHeight ? el : window;
      scroller.scrollBy(0, dir * EDGE_SCROLL_STEP_PX);
    }
    d.raf = requestAnimationFrame(() => tick(d));
  }

  /** The slot under the point: exact hit first, otherwise the closest one within HIT_SLOP_PX. */
  function zoneAt(x, y) {
    const exact = document.elementsFromPoint(x, y).find(n => n.classList?.contains('mg-drop-zone'));
    if (exact) return exact;
    let best = null, bestDist = Infinity;
    zones.forEach(z => {
      const r = z.getBoundingClientRect();
      if (x < r.left - HIT_SLOP_PX || x > r.right + HIT_SLOP_PX || y < r.top - HIT_SLOP_PX || y > r.bottom + HIT_SLOP_PX) return;
      const dist = Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2));
      if (dist < bestDist) { best = z; bestDist = dist; }
    });
    return best;
  }

  function setHover(d, zone) {
    if (d.hover === zone) return;
    d.hover?.classList.remove('drag-over');
    zone?.classList.add('drag-over');
    d.hover = zone;
  }

  function finishDrag(d, x, y) {
    const target = zoneAt(x, y);
    zones.forEach(z => z.classList.remove('drag-over'));

    if (target && target !== d.fromZone) {
      if (d.fromZone) game.removeChip(d.fromZone);   // moving between slots: free the old one first
      game.placeChip(target, d.id);                  // a filled target is replaced (its chip returns to the pool)
      endDrag(d);
    } else if (target && target === d.fromZone) {
      returnToOrigin(d, d.source.getBoundingClientRect());   // dropped back on its own slot
    } else if (d.fromZone) {
      game.removeChip(d.fromZone);                           // placed chip dropped outside: back to the pool
      returnToOrigin(d, chipFor(d.id)?.getBoundingClientRect() ?? originRect(d));
    } else {
      returnToOrigin(d, originRect(d));                      // pool chip dropped outside: back where it was
    }
  }

  const originRect = d => (d.fromZone ? d.source : chipFor(d.id) ?? d.source).getBoundingClientRect();

  /** Slide the ghost to `rect`, then clean up. */
  function returnToOrigin(d, rect) {
    const ghost = d.ghost;
    if (!ghost) return endDrag(d);
    if (reduceMotion()) return endDrag(d);
    ghost.classList.add('is-returning');
    ghost.style.transform = `translate3d(${rect.left}px, ${rect.top}px, 0)`;
    setTimeout(() => endDrag(d), RETURN_MS + 20);
  }

  function endDrag(d) {
    d.ghost?.remove();
    d.ghost = null;
    d.source.classList.remove('dragging');
    zones.forEach(z => z.classList.remove('drag-over'));
    if (!drag) document.body.classList.remove('mg-is-dragging');
  }
}
