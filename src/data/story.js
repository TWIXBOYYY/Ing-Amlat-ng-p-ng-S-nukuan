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
 *  video       {string}       Optional motion video (MP4) shown instead of the image + layers;
 *                             it loops muted and is kept clear of the on-screen buttons
 *  alt         {string}       Accessibility description of the page
 *  layers      {PageLayer[]}  Parallax layers rendered over the image (depth 0=static,1=full)
 *  narration   {Clip|Clip[]}  Audio file (or several, played one after another) — plays on page enter.
 *                             A clip is a path, or { src, startSeconds, maxSeconds } to play just that part
 *                             of the file (skip leading silence / cut a tail so clips join without a gap)
 *  advanceAfter {number}      Seconds to wait after the narration ends, then turn to the next page
 *  captions    {Caption[]}    Text panels (transparent PNGs the size of the video frame) animated in over
 *                             a video page; caption i appears when narration clip i starts
 *  music       {string}       Background music — continues unchanged if same as prev page
 *  ambience    {string|null}  Ambience loop   — continues unchanged if same as prev page; null fades it out
 *  ambienceVolume {number}    0..1, how loud the ambience sits under the narration (default 1)
 *  sfx         {SfxTrigger[]} One-shot sounds { src, on: 'enter'|'reveal' }
 * ─────────────────────────────────────────────────────────────
 */

/**
 * @typedef {Object} PageLayer
 * @property {string} src
 * @property {number} depth
 * @property {string} [position]
 */

/**
 * @typedef {string|{src:string,startSeconds?:number,maxSeconds?:number}} Clip
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
 */

/**
 * @typedef {Object} SfxTrigger
 * @property {string} src
 * @property {'enter'|'reveal'} on
 */

/**
 * @typedef {Object} StoryPage
 * @property {string}       id
 * @property {string}       image
 * @property {string}       [video]
 * @property {string}       [alt]
 * @property {PageLayer[]}  [layers]
 * @property {Clip|Clip[]} [narration]
 * @property {number}       [advanceAfter]
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
    advanceAfter: 3,
    captions: [
      {
        src: '/assets/comic/S1/S1_P1 (In the beginning).webp',
        alt: 'In the beginning of the world, a great giant spider named Apung Mangacha wove a dome called the "Sikluban."',
        at: { x: 11.81, y: 50.47 },
        voiceAt: 0.2,
        fallbackAt: 0.6,
      },
      {
        src: '/assets/comic/S1/S1_P1 (The bottom of the dome).webp',
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
    advanceAfter: 3,
    // Narration clip 1 reads the "Through the holes" box, clip 2 reads the "Sikluban" box
    captions: [
      {
        src: '/assets/comic/S1p2/S1_P2 (Through the holes).webp',
        alt: 'Through the holes, the Diwatas\' eyes—the stars—peek at the world below.',
        at: { x: 24.6, y: 30.4 },
        voiceAt: 2.2,
        fallbackAt: 2.2,
      },
      {
        src: '/assets/comic/S1p2/S1_P2 (The sikluban has two parts).webp',
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
    alt: 'The ancient forest surrounding the mountain rustles with whispers of old magic and forgotten lore.',
    music:    '/assets/audio/music/theme-forest.mp3',
    ambience: '/assets/audio/ambience/forest-night.mp3',
    narration: '/assets/audio/narration/page-03.mp3',
    sfx: [
      { src: '/assets/audio/sfx/leaves-rustle.mp3', on: 'enter' },
    ],
  },
  {
    id: 'page-04',
    image: '/assets/comic/page-04.webp',
    alt: 'A young Kapampangan explorer discovers a glowing artifact half-buried in the forest floor.',
    music:    '/assets/audio/music/theme-mystery.mp3',
    ambience: '/assets/audio/ambience/forest-night.mp3',
    narration: '/assets/audio/narration/page-04.mp3',
    sfx: [
      { src: '/assets/audio/sfx/artifact-glow.mp3', on: 'enter' },
    ],
  },
  {
    id: 'page-05',
    image: '/assets/comic/page-05.webp',
    alt: 'Sinukuan materialises from the mist, extending a hand — an invitation, or a warning?',
    music:    '/assets/audio/music/theme-mystery.mp3',
    ambience: '/assets/audio/ambience/wind-mountain.mp3',
    narration: '/assets/audio/narration/page-05.mp3',
    sfx: [
      { src: '/assets/audio/sfx/thunder-low.mp3', on: 'enter' },
    ],
  },
  {
    id: 'page-06',
    image: '/assets/comic/page-06.webp',
    alt: 'Page 6 — art coming soon.',
  },
  {
    id: 'page-07',
    image: '/assets/comic/page-07.webp',
    alt: 'Page 7 — art coming soon.',
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
