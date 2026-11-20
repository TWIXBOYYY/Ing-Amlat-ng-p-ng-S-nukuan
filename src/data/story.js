/**
 * ─────────────────────────────────────────────────────────────
 *  HOW TO ADD A COMIC PAGE
 * ─────────────────────────────────────────────────────────────
 *  1. Drop the page image into /public/assets/comic/ (WebP preferred,
 *     PNG/JPG as fallback). Name it e.g. page-06.webp / page-06.jpg.
 *  2. Add a new object to the `pages` array below.
 *  3. Only `id` and `image` are required. Everything else is optional.
 *
 *  FIELD REFERENCE
 *  ───────────────
 *  id          {string}       Unique slug, e.g. "page-06"
 *  image       {string}       Path from /public root, e.g. "/assets/comic/page-06.webp"
 *  videoAspect {number}       width / height of the video file (default 1920/1165); sets how it is cropped/fitted
 *  videoFocusY {number}       0..1, which part of a tall video stays in view on wide screens (0 top, 1 bottom, default .5)
 *  video       {string}       Optional motion video (MP4) shown instead of the image + layers;
 *                             it loops muted and is kept clear of the on-screen buttons
 *  alt         {string}       Accessibility description of the page
 *  layers      {PageLayer[]}  Parallax layers rendered over the image (depth 0=static,1=full)
 *  narration   {Clip|Clip[]}  Audio file (or several, played one after another) — plays on page enter.
 *                             A clip is a path, or { src, startSeconds, maxSeconds } to play just that part
 *                             of the file (skip leading silence / cut a tail so clips join without a gap)
 *  narrationDelay {number}    Seconds the video plays on its own before the narration starts (default 0)
 *  advanceAfter {number}      Seconds to wait after the narration ends, then turn to the next page
 *  captions    {Caption[]}    Text panels (transparent PNGs the size of the video frame) animated in over
 *                             a video page; caption i appears when narration clip i starts
 *  music       {string}       Background music — continues unchanged if same as prev page
 *  ambience    {string|null}  Ambience loop   — continues unchanged if same as prev page; null fades it out
 *  ambienceVolume {number}    0..1, how loud the ambience sits under the narration (default 1)
 *  sfx         {SfxTrigger[]} One-shot sounds { src, on: 'enter'|'reveal', at?: delay in seconds, clip?: narration clip index to start with, volume?: 0..1,
 *                             stopAtClip?: fade it out when that narration clip starts }
 * ─────────────────────────────────────────────────────────────
 */

/**
 * @typedef {Object} PageLayer
 * @property {string} src
 * @property {number} depth
 * @property {string} [position]
 */

/**
 * @typedef {string|{src:string,startSeconds?:number,maxSeconds?:number,pauseSeconds?:number}} Clip
 */

/**
 * @typedef {Object} Caption
 * @property {string} src       WebP/PNG with the panel drawn on a transparent canvas the size of the video frame
 * @property {string} alt       the panel's text, for screen readers
 * @property {{x:number,y:number}} at      where its centre should sit on the page, in % of the frame (as designed).
 *                    Panels are never resized. Where the picture is cropped by a narrower screen, a panel that
 *                    would be cut off is nudged back inside the screen.
 * @property {number} [voiceAt]  seconds after its narration clip starts that the voice begins (the clip can open with silence)
 * @property {number} fallbackAt  seconds after page enter to show it if the narration can't play (clip start + voiceAt)
 * @property {number[]} [replaces]  indexes of earlier boxes drawn over the same spot; they fade out as this one appears
 */

/**
 * @typedef {Object} SfxTrigger
 * @property {string} src
 * @property {'enter'|'reveal'} on
 * @property {number} [at]     seconds to wait (after the page opens, or after its narration clip starts); default 0
 * @property {number} [clip]   narration clip index: start with that clip instead of when the page opens
 * @property {number} [stopAtClip] fade the sound out when that narration clip starts
 */

/**
 * @typedef {Object} StoryPage
 * @property {string}       id
 * @property {string}       image
 * @property {string}       [video]
 * @property {number}       [videoAspect]
 * @property {number}       [videoFocusY]
 * @property {string}       [alt]
 * @property {PageLayer[]}  [layers]
 * @property {Clip|Clip[]} [narration]
 * @property {number}       [advanceAfter]
 * @property {number}       [videoSeconds]  play only this many seconds of the video, then turn the page
 * @property {Caption[]}    [captions]
 * @property {string}       [music]
 * @property {string|null}  [ambience]
 * @property {number}       [ambienceVolume]
 * @property {SfxTrigger[]} [sfx]
 */

/** @type {StoryPage[]} */
export const pages = [
  {
    id: 'page-01',
    image: '/assets/comic/page-01.webp',
    video: '/assets/comic/S1/S1p1 Motion.mp4',
    alt: 'The sacred mountain of Arayat rises against a golden dawn sky, its silhouette wreathed in ancient mist.',
    music:    '/assets/audio/music/theme-main.mp3',
    ambience: '/assets/audio/ambience/space-ambient.mp3',
    ambienceVolume: 0.3,
    narration: [
      '/assets/narration/S1/S1-P1-NARRATOR-001.wav',
      '/assets/narration/S1/S1-P1-NARRATOR-002.1.wav',
    ],
    // The voice says "a great giant spider named Apung Mangacha" from ~2.7s into clip 1; the alien sound (30s, quiet) starts there
    sfx: [{ src: '/assets/audio/sfx/s1p1/Alien sound.mp3', on: 'enter', clip: 0, at: 2.7, volume: 0.8 }],
    advanceAfter: 3,
    captions: [
      {
        src: '/assets/comic/S1/English/ENG_IN THE BEGINNING.webp',
        srcByLang: { pam: '/assets/comic/S1/Pampanga/PAM_IN THE BEGINNING.webp' },
        alt: 'In the beginning of the world, a great giant spider named Apung Mangacha wove a dome called the "Sikluban."',
        at: { x: 11.81, y: 50.47 },
        voiceAt: 0.2,
        fallbackAt: 0.6,
      },
      {
        src: '/assets/comic/S1/English/ENG_BOTTOM OF THE DOME.webp',
        srcByLang: { pam: '/assets/comic/S1/Pampanga/PAM_BOTTOM OF THE DOME.webp' },
        alt: 'The bottom of the dome, the Suklob, was tightly woven and filled with water. Meanwhile, the top was loosely knit and had holes as the great spider ran out of silk.',
        at: { x: 83.77, y: 52.99 },
        voiceAt: 0.8,
        fallbackAt: 11.3,   // first clip (10.45s) + voiceAt
      },
    ],
  },
  {
    id: 'page-02',
    image: '/assets/comic/page-02.webp',
    video: '/assets/comic/S1p2/S1P2 MOTION.mp4',
    alt: 'The Sikluban dome has two parts: at the top, the Father Sky where a great Sky Bird spreads his blue wings, with stars peeking through the holes.',
    music:    '/assets/audio/music/theme-main.mp3',
    ambience: null,   // the space ambience from page 1 ends here
    narration: [
      // clip 1: voice ends ~9.3s, played to 10s so it finishes in silence. Clip 2: voice starts ~1.8s in,
      // played from 0.8s so a 1s silent beat separates the two; its tail is cut at 16s (silent from ~15.6s)
      { src: '/assets/narration/s1p2/S1-P2-NARRATOR-001.wav', maxSeconds: 10 },
      { src: '/assets/narration/s1p2/S1-P2-NARRATOR-002.wav', startSeconds: 0.8, maxSeconds: 16 },
    ],
    // The wing flap is 2.0-3.0s into its file. Started 7.2s into clip 1 it sounds at 9.2-10.2s: the end of clip 1 (10s), just before clip 2
    sfx: [{ src: '/assets/audio/sfx/s1p2/WINGS.mp3', on: 'enter', clip: 0, at: 7.2 }],
    advanceAfter: 3,
    // Narration clip 1 reads the "Through the holes" box, clip 2 reads the "Sikluban" box
    captions: [
      {
        src: '/assets/comic/S1p2/English/ENG_Through the holes.webp',
        srcByLang: { pam: '/assets/comic/S1p2/Pampanga/PAM_Through the holes.webp' },
        alt: 'Through the holes, the Diwatas\' eyes—the stars—peek at the world below.',
        at: { x: 24.6, y: 30.4 },
        voiceAt: 2.2,
        fallbackAt: 2.2,
      },
      {
        src: '/assets/comic/S1p2/English/ENG_The Sikluban.webp',
        srcByLang: { pam: '/assets/comic/S1p2/Pampanga/PAM_The Sikluban.webp' },
        alt: 'The Sikluban has two parts. At the top is *Ibpang Banua, the Father Sky, where a Sky Bird holds dominion—his wings painting the heavens a beautiful blue.',
        at: { x: 82.35, y: 69.5 },
        voiceAt: 0,
        fallbackAt: 10,   // as the second clip starts (after the first, 10s)
      },
    ],
  },
  {
    id: 'page-03',
    image: '/assets/comic/page-03.webp',
    video: '/assets/comic/s1p3/S1P3 MOTION.mp4',
    alt: 'At the bottom lies Indung Laut, the mother ocean, where a giant crocodile rests.',
    music:    '/assets/audio/music/theme-main.mp3',
    ambience: null,
    // Clip 1: the recording has other takes before the line for this page, which starts at 16s.
    // Clips 2-3 are one recording: the croco line (voice stops ~7.3s) and the "world shakes" line (starts ~8.1s),
    // split at 7.5s so each has its own box; the 0.6s of silence between them is kept.
    narration: [
      { src: '/assets/narration/s1p3/S1-P3-NARRATOR-001.wav', startSeconds: 16, maxSeconds: 24.5 },        // 8.5s
      { src: '/assets/narration/s1p3/S1-P3-PANEL1-NARRATOR-001.wav', startSeconds: 0.3, maxSeconds: 7.5 },   // 7.2s
      { src: '/assets/narration/s1p3/S1-P3-PANEL1-NARRATOR-001.wav', startSeconds: 7.5, maxSeconds: 11.8 },  // 4.3s
    ],
    // The sliding is audible 2.5-4.7s into its file. Started 3.8s into clip 1 (8.5s long) it sounds at ~6.3-8.5s: right before clip 1 ends
    sfx: [{ src: '/assets/audio/sfx/s1p3/Crocodile sliding.mp3', on: 'enter', clip: 0, at: 3.8 }],
    advanceAfter: 3,
    videoSeconds: 20,          // the narration adds up to 8.5 + 7.2 + 4.3 = 20s; only that much video is used
    // Box i is shown as narration clip i starts. Every box stays on screen once it has appeared.
    captions: [
      {
        src: '/assets/comic/s1p3/English/ENG_At the bottom lies.webp',
        srcByLang: { pam: '/assets/comic/s1p3/Pampanga/PAM_At the bottom lies.webp' },
        alt: 'At the bottom lies Indung Laut, the mother ocean, where a giant crocodile rests.',
        at: { x: 18.05, y: 26.05 },
        voiceAt: 0.3,
        fallbackAt: 0.3,
      },
      {
        src: '/assets/comic/s1p3/English/ENG_The giant crocodile.webp',   // no Kapampangan art yet: shows the English box
        alt: 'The giant crocodile is named Indung Tibuan.',
        at: { x: 21.15, y: 34.95 },
        voiceAt: 0.5,
        fallbackAt: 8.5,
      },
      {
        src: '/assets/comic/s1p3/English/ENG_and the world shakes.webp',
        srcByLang: { pam: '/assets/comic/s1p3/Pampanga/PAM_and the world shakes.webp' },
        alt: '...and the world shakes whenever she moves!',
        at: { x: 85.2, y: 74.45 },
        voiceAt: 0.6,
        fallbackAt: 16.2,
      },
      {
        src: '/assets/comic/s1p3/English/ENG_FOOTNOTE.webp',   // no Kapampangan art yet: shows the English box
        alt: '*Ibpang Banua is the sky and Indung Laut is the water. They are both formless in nature.',
        at: { x: 21.65, y: 92.7 },
        fallbackAt: 6,   // no voice of its own: it follows the first box
      },
      {
        // second half of the croco narration clip (starts at 8.5s): no clip of its own, so it is timed
        src: '/assets/comic/s1p3/English/ENG_The earth rests upon her back.webp',
        srcByLang: { pam: '/assets/comic/s1p3/Pampanga/PAM_The earth rests upon her back.webp' },
        alt: 'The earth rests upon her back...',
        at: { x: 76.85, y: 66.05 },
        fallbackAt: 12.2,
      },
    ],
  },
  {
    id: 'page-04',
    video: '/assets/comic/s1p4/S1P4 Motion.mp4',
    alt: 'Long ago, it fell down...',
    music:    '/assets/audio/music/theme-mystery.mp3',
    ambience: null,
    // Clip 1 plays from 1s to 12s (11s). Clip 2 skips 0.5s of lead-in (~2.9s). Clip 3 follows after a 1s pause.
    narration: [
      { src: '/assets/narration/s1p4/S1-P4-PANEL1-NARRATOR-002.wav', startSeconds: 1, maxSeconds: 12 },
      // the voice in 003 and PANEL2-001 starts ~1.0s into the file; each clip opens 0.1s before it
      { src: '/assets/narration/s1p4/S1-P4-PANEL1-NARRATOR-003.wav', startSeconds: 0.9, maxSeconds: 2.6, pauseSeconds: 0.9 },   // voice at 0:12
      { src: '/assets/narration/s1p4/S1-P4-PANEL2-NARRATOR-001.wav', startSeconds: 0.9, maxSeconds: 12.39, pauseSeconds: 0.8 },  // 1s of silence after "It fell down", voice at ~0:14.5
    ],
    // clip 2 (index 1) is the "It fell down" box: the flying sound starts with it.
    // clip 3 (index 2) is "Landing right on...": the impact lands with it (see below) and the roar starts with it.
    sfx: [
      { src: '/assets/audio/sfx/s1p4/SUPERMAN FLYING SOUND EFFECT - FREE.mp3', on: 'enter', clip: 1 },
      // the impact is 2.0s into its file; clip 2 lasts 1.7s and the pause before clip 3 is 0.8s (2.5s in total), so starting
      // it 0.5s into clip 2 makes the hit land as clip 3 starts
      { src: '/assets/audio/sfx/s1p4/WATER IMPACT.mp3', on: 'enter', clip: 1, at: 0.5 },
      { src: '/assets/audio/sfx/s1p4/MONSTER ROAR.mp3', on: 'enter', clip: 2 },
    ],
    advanceAfter: 3,
    videoSeconds: 27.5,        // narration ends at ~25.9s
    // Box centres follow the artwork's own layout. Boxes stay on screen once shown; only "Landing right on" clears the first two.
    captions: [
      {
        src: '/assets/comic/s1p4/English/ENG_LONG AGO AS APUNG.webp',
        srcByLang: { pam: '/assets/comic/s1p4/Pampanga/PAM_Long ago as Apung.webp' },
        alt: 'Long ago, as Apung Mangacha was still weaving, her *sikwan slipped from her grip... dropping deep into the dome.',
        at: { x: 18.1, y: 12.2 },     // top left
        voiceAt: 0.3,
        fallbackAt: 0.3,
      },
      {
        src: '/assets/comic/s1p4/English/ENG_IT FELL DOWN.webp',
        srcByLang: { pam: '/assets/comic/s1p4/Pampanga/PAM_IT FELL DOWN.webp' },
        alt: 'It fell down...',
        at: { x: 18.45, y: 86.8 },    // bottom left
        voiceAt: 0.1,        // shows as its voice starts, 0:12
        fallbackAt: 12,
      },
      {
        src: '/assets/comic/s1p4/English/ENG_LANDING RIGHT ON INDUNG.webp',
        srcByLang: { pam: '/assets/comic/s1p4/Pampanga/PAM_LANDING RIGHT ON INDUNG.webp' },
        alt: "Landing right on Indung Tibuan's back, piercing her into place. The end of sikwan pokes out from her, forming Mt. Alaya.",
        at: { x: 67.25, y: 19.45 },   // open sky, upper right
        voiceAt: 0.1,         // ~0:14.5
        fallbackAt: 14.5,
        replaces: [0, 1],     // "Long ago" and "It fell down" go away only now
      },
      {
        src: '/assets/comic/s1p4/English/FOOTNOTE.webp',
        srcByLang: { pam: '/assets/comic/s1p4/Pampanga/PAM_FOOTNOTE.webp' },
        alt: '"Sikwan" is a Kapampangan term for a weaving or netting needle. In this story, the sikwan is a bamboo needle that Apung Mangacha used to weave the dome.',
        at: { x: 77.55, y: 93.7 },    // bottom right
        fallbackAt: 3,   // no voice of its own: it follows the first box
      },
    ],
  },
  {
    id: 'page-05',
    video: '/assets/comic/S2P1/S2-P1 Motion Finall.mp4',
    videoAspect: 1920 / 1165,   // the file's own shape, so it is cropped to fill the screen (landscape) or shown whole (portrait)
    alt: 'Season 2, page 1 — motion graphic.',
    music:    '/assets/audio/music/theme-mystery.mp3',
    ambience: null,
    // Four clips back to back (13.8 + 10.5 + 6.6 + 16.1 = 47s); the video starts with the first voice
    narration: [
      { src: '/assets/narration/s2p1/S2-P1-PANEL1-NARRATOR-001.wav' },     // played whole so the last word is not cut
      { src: '/assets/narration/s2p1/S2-P1-PANEL1-NARRATOR-002.wav', startSeconds: 0.5, maxSeconds: 11 },     // 0:00.5 to 0:11 (10.5s)
      { src: '/assets/narration/s2p1/S2-P1-PANEL2-NARRATOR-001.wav', startSeconds: 1.2, maxSeconds: 7.8 },     // skips the 1.2s of silence before the voice (starts ~1.5s), so no gap
      { src: '/assets/narration/s2p1/S2-P1-PANEL3-NARRATOR-001.wav' },
    ],
    advanceAfter: 3,
    // Layout: kept inside y 11-89%, because a wide screen crops the top and bottom of the video and would push boxes together.
    // "Until" and "But found nothing" use the template's two slots on the middle panel (top, bottom); the boxes still to come go in the last panel's slots.
    // Captions follow the narration: clip 1 (13.8s) says the first two boxes, clip 2 (from 0.5s) the next three and, as its last word, "until".
    // voiceAt is seconds after the clip starts; fallbackAt is seconds after the page opens (used only if the voice can't start).
    captions: [
      { src: '/assets/comic/S2P1/ENG_HIGH IN THE HEAVENS.webp',        alt: 'High in the heavens, Apung Batala, the majestic sky bird, reigns.', at: { x: 21.6, y: 15 },    clip: 0, voiceAt: 0.5, fallbackAt: 1.5 },
      { src: '/assets/comic/S2P1/ENG_ONE FATEFUL DAY.webp',            alt: 'One fateful day, they wandered the world, hungry.',               at: { x: 30.8, y: 25 },   clip: 0, voiceAt: 6.0, fallbackAt: 7 },
      { src: '/assets/comic/S2P1/ENG_THEY SEARCHED EVERYWHERE.webp',   alt: 'They searched everywhere—above...',                            at: { x: 23, y: 74 },     clip: 1, voiceAt: 0.5, fallbackAt: 15.3 },
      { src: '/assets/comic/S2P1/ENG_AND BELOW.webp',                  alt: 'And below...',                                                    at: { x: 32, y: 83 },     clip: 1, voiceAt: 3.8, fallbackAt: 18.6 },
      { src: '/assets/comic/S2P1/ENG_BUT FOUND NOTHING.webp',          alt: 'But found nothing...',                                            at: { x: 49.5, y: 80 }, clip: 1, voiceAt: 6.1, fallbackAt: 20.9 },
      { src: '/assets/comic/S2P1/ENG_UNTIL.webp',                      alt: 'Until...',                                                        at: { x: 58.5, y: 20 }, clip: 1, voiceAt: 9.5, fallbackAt: 24.3,   // the last word of narration clip 2 (its voice is ~10.1-10.7s in the file, 9.6-10.2s after the clip starts)
        replaces: [0, 1, 2, 3, 4] },   // every earlier box clears away as "Until" appears
    ],
    // Wings with the first voice; the wind runs under the story until the third clip ("until...") arrives and then fades;
    // the stomach growl lands at the end of the first clip (the voice says "hungry" at ~11.9s)
    sfx: [
      { src: '/assets/audio/sfx/s2p1/Wings Flapping Soaring Sound Effect.mp3', on: 'enter', clip: 0 },
      // the bird is silent for its first 2.5s, then sings until ~7s: under "Apung Batala, the majestic sky bird" (voice at 2.7-5.5s)
      { src: '/assets/audio/sfx/s2p1/One Bird Singing Sound Effect.mp3', on: 'enter', clip: 0, volume: 0.8 },
      { src: '/assets/audio/sfx/s2p1/WindFlying Sound Effects.mp3', on: 'enter', clip: 0, volume: 0.5, stopAtClip: 2 },
      { src: '/assets/audio/sfx/s2p1/Stomach Growling Sound Effect.mp3', on: 'enter', clip: 0, at: 11.6 },
    ],
  },
  {
    id: 'page-06',
    video: '/assets/comic/S2P2/S2P2 Motion Final.mp4',
    videoAspect: 1920 / 1080,   // the file's own shape, so it is cropped to fill the screen (landscape) or shown whole (portrait)
    alt: 'Season 2, page 2 — motion graphic.',
    music:    '/assets/audio/music/theme-mystery.mp3',
    ambience: null,
    // Clip 1 (13.6s) is cut at 0:10; clip 2 (3.6s) follows straight after. The video runs 24.2s, so the page turns as it ends.
    narration: [
      { src: '/assets/narration/s2p2/S2-P2-NARRATOR-001.1.wav', startSeconds: 0, maxSeconds: 10 },
      { src: '/assets/narration/s2p2/S2-P2-PANEL3-NARRATOR-001.2.wav' },
    ],
    advanceAfter: 3,
    videoSeconds: 24.2,
    // The sound starts 8s into narration clip 1 (clip index 0)
    sfx: [{ src: '/assets/audio/sfx/s2p2/Alligator Growl And Snap Sound Effect.mp3', on: 'enter', clip: 0, at: 8 }],
  },
  {
    id: 'page-07',
    video: '/assets/comic/S2P3/S2-P3.mp4',
    videoAspect: 1920 / 1080,   // natural 16:9 size; fills the screen on landscape, shown whole in portrait
    alt: 'Season 2, page 3 — motion graphic.',
    music:    '/assets/audio/music/theme-mystery.mp3',
    ambience: null,
    // The video plays alone for 6s, then the two clips follow back to back (11.8 + 9.4s); the page turns as the 30s video ends
    narrationDelay: 6,
    narration: [
      { src: '/assets/narration/s2p3/S2-P3-NARRATOR-001.wav' },
      { src: '/assets/narration/s2p3/S2-P3-NARRATOR-002.wav' },
    ],
    advanceAfter: 3,
    videoSeconds: 30,
  },
  {
    id: 'page-08',
    image: '/assets/comic/page-08.webp',
    alt: 'Page 8 — art coming soon.',
  },
  {
    id: 'page-09',
    image: '/assets/comic/page-09.webp',
    alt: 'Page 9 — art coming soon.',
  },
  {
    id: 'page-10',
    image: '/assets/comic/page-10.webp',
    alt: 'Page 10 — art coming soon.',
  },
  {
    id: 'page-11',
    image: '/assets/comic/page-11.webp',
    alt: 'Page 11 — art coming soon.',
  },
  {
    id: 'page-12',
    image: '/assets/comic/page-12.webp',
    alt: 'Page 12 — art coming soon.',
  },
  {
    id: 'page-13',
    image: '/assets/comic/page-13.webp',
    alt: 'Page 13 — art coming soon.',
  },
  {
    id: 'page-14',
    image: '/assets/comic/page-14.webp',
    alt: 'Page 14 — art coming soon.',
  },
  {
    id: 'page-15',
    image: '/assets/comic/page-15.webp',
    alt: 'Page 15 — art coming soon.',
  },
  {
    id: 'page-16',
    image: '/assets/comic/page-16.webp',
    alt: 'Page 16 — art coming soon.',
  },
];

export const totalPages = pages.length;
