import { Howl, Howler } from 'howler';

const STORAGE_KEY = 'sinukuan_audio_v1';

const DEFAULTS = {
  volumes: { master: 1, music: 1, ambience: 1, sfx: 1, narration: 1 },
  mutes:   { master: false, music: false, ambience: false, sfx: false, narration: false },
};

/** @type {typeof DEFAULTS} */
let state = JSON.parse(JSON.stringify(DEFAULTS));

let unlocked = false;

/** @type {Howl|null} */ let _music     = null;
/** @type {Howl|null} */ let _ambience  = null;
/** @type {Howl|null} */ let _narration = null;
let _musicSrc    = null;
let _ambienceSrc = null;

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      state.volumes = { ...DEFAULTS.volumes, ...saved.volumes };
      state.mutes   = { ...DEFAULTS.mutes,   ...saved.mutes };
    }
  } catch { /* ignore */ }
}

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

/** Effective volume for a channel (respects master + per-channel mute). */
function eff(ch) {
  if (state.mutes.master || state.mutes[ch]) return 0;
  return state.volumes.master * state.volumes[ch];
}

export const AudioManager = {
  init() {
    load();
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        Howler.volume(0);
      } else {
        Howler.volume(1);
        this._applyAll();
      }
    });
  },

  /** Must be called on the first user interaction to satisfy browser autoplay policy. */
  unlock() {
    if (unlocked) return;
    unlocked = true;
    if (_music)    _music.play();
    if (_ambience) _ambience.play();
  },

  _applyAll() {
    if (_music)     _music.volume(eff('music'));
    if (_ambience)  _ambience.volume(eff('ambience'));
    if (_narration) _narration.volume(eff('narration'));
  },

  setVolume(ch, val) {
    state.volumes[ch] = Math.max(0, Math.min(1, val));
    this._applyAll();
    save();
  },

  getVolume(ch) { return state.volumes[ch]; },

  setMute(ch, muted) {
    state.mutes[ch] = !!muted;
    this._applyAll();
    save();
  },

  getMute(ch) { return state.mutes[ch]; },

  toggleMute(ch) {
    this.setMute(ch, !state.mutes[ch]);
    return state.mutes[ch];
  },

  getState() { return state; },

  /** @param {string|null} src @param {{ crossfade?: boolean }} opts */
  playMusic(src, { crossfade = true } = {}) {
    if (!src || src === _musicSrc && _music?.playing()) return;
    if (_music) {
      const old = _music;
      if (crossfade) {
        old.fade(old.volume(), 0, 800);
        setTimeout(() => old.stop(), 900);
      } else {
        old.stop();
      }
    }
    _musicSrc = src;
    _music = new Howl({ src: [src], loop: true, volume: eff('music') });
    if (unlocked) _music.play();
  },

  stopMusic(fade = true) {
    if (!_music) return;
    if (fade) {
      _music.fade(_music.volume(), 0, 800);
      setTimeout(() => { _music?.stop(); _music = null; }, 900);
    } else {
      _music.stop(); _music = null;
    }
    _musicSrc = null;
  },

  /** @param {string|null} src */
  playAmbience(src, { crossfade = true } = {}) {
    if (!src || src === _ambienceSrc && _ambience?.playing()) return;
    if (_ambience) {
      const old = _ambience;
      if (crossfade) {
        old.fade(old.volume(), 0, 1200);
        setTimeout(() => old.stop(), 1300);
      } else {
        old.stop();
      }
    }
    _ambienceSrc = src;
    _ambience = new Howl({ src: [src], loop: true, volume: eff('ambience') });
    if (unlocked) _ambience.play();
  },

  stopAmbience() {
    _ambience?.stop(); _ambience = null; _ambienceSrc = null;
  },

  /** @param {string|null} src */
  playNarration(src) {
    _narration?.stop(); _narration = null;
    if (!src) return;
    _narration = new Howl({ src: [src], volume: eff('narration') });
    if (unlocked) _narration.play();
  },

  stopNarration() { _narration?.stop(); _narration = null; },

  /** Fire-and-forget SFX. */
  playSfx(src) {
    if (!unlocked || !src) return;
    new Howl({ src: [src], volume: eff('sfx') }).play();
  },

  pauseAll() { _music?.pause(); _ambience?.pause(); _narration?.pause(); },
  resumeAll() {
    if (!unlocked) return;
    _music?.play(); _ambience?.play(); _narration?.play();
  },
};
