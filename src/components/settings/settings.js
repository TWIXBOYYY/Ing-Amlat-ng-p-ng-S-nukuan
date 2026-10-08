import { AudioManager } from '../../audio/AudioManager.js';

const CHANNELS = [
  { key: 'master',    label: 'Master Volume'        },
  { key: 'music',     label: 'Music Volume'          },
  { key: 'ambience',  label: 'Ambience Volume'       },
  { key: 'sfx',       label: 'Sound Effects Volume'  },
  { key: 'narration', label: 'Dialogue Volume'       },
];

const ICON_ON  = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;
const ICON_OFF = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`;

const BACK_ICON = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>`;

const ORNAMENT_L = `
<svg class="settings-ornament" viewBox="0 0 88 44" fill="none" aria-hidden="true">
  <path d="M44,22 C38,11 22,6 4,16 C14,9 30,13 44,22Z"  fill="#c9a227" opacity="0.65"/>
  <path d="M44,22 C38,33 22,38 4,28 C14,35 30,31 44,22Z" fill="#c9a227" opacity="0.55"/>
  <circle cx="44" cy="22" r="4" fill="#e8c84a" opacity="0.8"/>
</svg>`;

const ORNAMENT_R = `
<svg class="settings-ornament" viewBox="0 0 88 44" fill="none" aria-hidden="true" style="transform:scaleX(-1)">
  <path d="M44,22 C38,11 22,6 4,16 C14,9 30,13 44,22Z"  fill="#c9a227" opacity="0.65"/>
  <path d="M44,22 C38,33 22,38 4,28 C14,35 30,31 44,22Z" fill="#c9a227" opacity="0.55"/>
  <circle cx="44" cy="22" r="4" fill="#e8c84a" opacity="0.8"/>
</svg>`;

const SUN_DECO = `
<svg class="settings-sun-deco" viewBox="0 0 108 108" fill="none" aria-hidden="true">
  <defs>
    <radialGradient id="sg-orb" cx="38%" cy="33%" r="62%">
      <stop offset="0%"   stop-color="#e8e0d0"/>
      <stop offset="100%" stop-color="#b0a898"/>
    </radialGradient>
  </defs>
  <g class="settings-sun-deco-rays">
    ${[0,30,60,90,120,150,180,210,240,270,300,330].map(a =>
      `<path d="M54,14 C57,30 57,36 54,46 C51,36 51,30 54,14Z" fill="#c9a227" opacity="0.82" transform="rotate(${a},54,54)"/>`
    ).join('')}
  </g>
  <circle cx="54" cy="54" r="26" fill="url(#sg-orb)"/>
  <ellipse cx="47" cy="50" rx="8" ry="10" fill="rgba(80,70,60,0.2)" transform="rotate(-18,47,50)"/>
</svg>`;

/** @type {HTMLElement|null} */
let _overlay = null;
/** @type {HTMLElement|null} */
let _previousFocus = null;

function buildRow({ key, label }) {
  const vol   = AudioManager.getVolume(key);
  const muted = AudioManager.getMute(key);
  const pct   = Math.round(vol * 100);
  return `
    <div class="settings-row${muted ? ' row-muted' : ''}" data-channel="${key}">
      <span class="settings-row-label">${label}</span>
      <div class="settings-slider-wrap" style="--val:${pct}">
        <div class="settings-slider-track"></div>
        <div class="settings-slider-fill"></div>
        <input
          type="range" class="settings-slider"
          min="0" max="100" value="${pct}" step="1"
          aria-label="${label}"
          aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"
        />
      </div>
      <span class="settings-pct">${pct}%</span>
      <button
        class="settings-mute-btn ${muted ? 'muted' : ''}"
        aria-label="${muted ? 'Unmute' : 'Mute'} ${label}"
        aria-pressed="${muted}"
      >${muted ? ICON_OFF : ICON_ON}</button>
    </div>`;
}

export function createSettingsOverlay() {
  _overlay = document.createElement('div');
  _overlay.className = 'settings-overlay';
  _overlay.setAttribute('aria-hidden', 'true');

  _overlay.innerHTML = `
    <div class="settings-panel" role="dialog" aria-modal="true" aria-label="Audio settings">
      ${SUN_DECO}
      <div class="settings-sliders">
        ${CHANNELS.map(buildRow).join('')}
      </div>
    </div>`;

  // Close on backdrop click
  _overlay.addEventListener('click', e => { if (e.target === _overlay) hideSettings(); });

  // Esc key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && _overlay.classList.contains('open')) hideSettings();
  });

  // Wire sliders and mute buttons
  _overlay.querySelectorAll('.settings-row').forEach(row => {
    const ch      = row.dataset.channel;
    const slider  = row.querySelector('.settings-slider');
    const pctEl   = row.querySelector('.settings-pct');
    const muteBtn = row.querySelector('.settings-mute-btn');
    const channel = CHANNELS.find(c => c.key === ch);

    const sliderWrap = row.querySelector('.settings-slider-wrap');
    slider.addEventListener('input', () => {
      const val = Number.parseInt(slider.value, 10) / 100;
      AudioManager.setVolume(ch, val);
      pctEl.textContent = `${slider.value}%`;
      slider.setAttribute('aria-valuenow', slider.value);
      sliderWrap.style.setProperty('--val', slider.value);
    });

    muteBtn.addEventListener('click', () => {
      const muted = AudioManager.toggleMute(ch);
      muteBtn.classList.toggle('muted', muted);
      row.classList.toggle('row-muted', muted);
      muteBtn.setAttribute('aria-pressed', muted);
      muteBtn.setAttribute('aria-label', `${muted ? 'Unmute' : 'Mute'} ${channel.label}`);
      muteBtn.innerHTML = muted ? ICON_OFF : ICON_ON;

      if (muted) {
        slider.value = '0';
        pctEl.textContent = '0%';
        slider.setAttribute('aria-valuenow', '0');
        sliderWrap.style.setProperty('--val', '0');
      } else {
        const restore = Math.round(AudioManager.getVolume(ch) * 100);
        slider.value = restore;
        pctEl.textContent = `${restore}%`;
        slider.setAttribute('aria-valuenow', restore);
        sliderWrap.style.setProperty('--val', restore);
      }
    });
  });

  return _overlay;
}

export function toggleSettings() {
  if (_overlay && _overlay.classList.contains('open')) hideSettings();
  else showSettings();
}

export function showSettings() {
  if (!_overlay) return;
  _previousFocus = document.activeElement;
  _overlay.classList.add('open');
  _overlay.removeAttribute('aria-hidden');
  _overlay.querySelector('.settings-panel')?.focus();
}

export function hideSettings() {
  if (!_overlay) return;
  _overlay.classList.remove('open');
  _overlay.setAttribute('aria-hidden', 'true');
  if (_previousFocus) { _previousFocus.focus(); _previousFocus = null; }
  // Re-trigger HUD idle timer now that panel is closed
  document.dispatchEvent(new CustomEvent('settings:closed'));
}
