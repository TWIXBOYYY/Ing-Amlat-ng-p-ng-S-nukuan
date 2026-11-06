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
const FADE_OUT_MS = 350;
const AMBIENCE_FADE_MS = 1500;
/** @type {Howl[]} */ let _narrationHowls = [];
let _narrationToken = 0;   // bumped whenever narration is replaced, so a stale clip never chains on
let _musicSrc    = null;
let _ambienceGain = 1;   // per-page level of the ambience, relative to the ambience channel
const _sfxCache = new Map();
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
    if (_ambience)  _ambience.volume(eff('ambience') * _ambienceGain);
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

  /**
   * Loop an ambience, fading it in. Replaces (and fades out) the current one.
   * @param {string|null} src
   * @param {{ crossfade?: boolean, gain?: number }} opts  gain: 0..1, level under the ambience channel volume
   */
  playAmbience(src, { crossfade = true, gain = 1 } = {}) {
    if (!src || src === _ambienceSrc && _ambience?.playing()) return;
    this.stopAmbience({ fade: crossfade });
    _ambienceSrc = src;
    _ambienceGain = gain;
    const target = eff('ambience') * gain;
    _ambience = new Howl({ src: [src], loop: true, volume: unlocked ? 0 : target });
    if (unlocked) {
      _ambience.play();
      _ambience.fade(0, target, AMBIENCE_FADE_MS);
    }
  },

  /** @param {{ fade?: boolean }} opts */
  stopAmbience({ fade = false } = {}) {
    const old = _ambience;
    _ambience = null; _ambienceSrc = null;
    if (!old) return;
    if (fade) {
      old.fade(old.volume(), 0, AMBIENCE_FADE_MS);
      setTimeout(() => old.unload(), AMBIENCE_FADE_MS + 100);
    } else {
      old.unload();
    }
  },

  /**
   * One clip, or a list played back to back. A clip is a path, or an object:
   *   { src, startSeconds?, maxSeconds? } plays the part of the file from startSeconds up to maxSeconds
   *   (use it to skip leading silence or cut a tail). A clip with maxSeconds fades out over its
   *   last moment instead of stopping dead. startSeconds needs maxSeconds.
   * Every clip is loaded up front, so the next one starts the instant the previous one ends.
   * @param {Clip|Clip[]|null} src
   * @param {{ onTrack?: (index: number) => void, onEnd?: () => void }} opts
   *   onTrack runs as each clip starts, onEnd after the last one finishes
   */
  playNarration(src, { onTrack, onEnd } = {}) {
    this.stopNarration();
    const token = _narrationToken;
    const list = Array.isArray(src) ? src : (src ? [src] : []);

    const howls = list.map((item, i) => {
      const clip = typeof item === 'string' ? { src: item } : item;
      const startMs = (clip.startSeconds || 0) * 1000;
      const endMs = (clip.maxSeconds || 0) * 1000;
      const lengthMs = endMs - startMs;
      const h = new Howl({
        src: [clip.src],
        volume: eff('narration'),
        sprite: endMs ? { __default: [startMs, lengthMs] } : undefined,   // play() then covers just that part
        onplay: () => {
          if (token !== _narrationToken) return;
          onTrack?.(i);
          if (endMs) setTimeout(() => { if (token === _narrationToken) h.fade(h.volume(), 0, FADE_OUT_MS); }, lengthMs - FADE_OUT_MS);
        },
        onend: () => playAt(i + 1),
      });
      return h;
    });
    _narrationHowls = howls;

    function playAt(i) {
      if (token !== _narrationToken) return;
      if (i >= howls.length) { if (howls.length) onEnd?.(); return; }
      _narration = howls[i];
      _narration.volume(eff('narration'));
      if (unlocked) _narration.play();   // otherwise unlock() starts it
    }
    playAt(0);
  },

  stopNarration() {
    _narrationToken++;
    _narration?.stop(); _narration = null;
    _narrationHowls.forEach(h => h.unload());   // drop clips that never got to play
    _narrationHowls = [];
  },

  /** Fire-and-forget SFX. */
  playSfx(src) {
    if (!unlocked || !src) return;
    let h = _sfxCache.get(src);   // one Howl per file, so a repeated sound starts instantly
    if (!h) { h = new Howl({ src: [src] }); _sfxCache.set(src, h); }
    h.volume(eff('sfx'));
    h.play();
  },

  pauseAll() { _music?.pause(); _ambience?.pause(); _narration?.pause(); },
  resumeAll() {
    if (!unlocked) return;
    _music?.play(); _ambience?.play(); _narration?.play();
  },
};
