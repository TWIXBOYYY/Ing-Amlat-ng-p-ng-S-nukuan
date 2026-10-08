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
 *  alt         {string}       Accessibility description of the page
 *  layers      {PageLayer[]}  Parallax layers rendered over the image (depth 0=static,1=full)
 *  narration   {string}       Audio file path — plays on page enter
 *  music       {string}       Background music — continues unchanged if same as prev page
 *  ambience    {string}       Ambience loop   — continues unchanged if same as prev page
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
 * @typedef {Object} SfxTrigger
 * @property {string} src
 * @property {'enter'|'reveal'} on
 */

/**
 * @typedef {Object} StoryPage
 * @property {string}       id
 * @property {string}       image
 * @property {string}       [alt]
 * @property {PageLayer[]}  [layers]
 * @property {string}       [narration]
 * @property {string}       [music]
 * @property {string}       [ambience]
 * @property {SfxTrigger[]} [sfx]
 */

/** @type {StoryPage[]} */
export const pages = [
  {
    id: 'page-01',
    image: '/assets/comic/page-01.webp',
    alt: 'The sacred mountain of Arayat rises against a golden dawn sky, its silhouette wreathed in ancient mist.',
    music:    '/assets/audio/music/theme-main.mp3',
    ambience: '/assets/audio/ambience/wind-mountain.mp3',
    narration: '/assets/audio/narration/page-01.mp3',
    layers: [
      { src: '/assets/comic/page-01-clouds.png', depth: 0.25, position: 'center top' },
      { src: '/assets/comic/page-01-sun.png',    depth: 0.12, position: 'center 15%' },
    ],
  },
  {
    id: 'page-02',
    image: '/assets/comic/page-02.webp',
    alt: 'Ápûng Sinukuan, the spirit of Mt. Arayat, stirs awake within his mountain throne.',
    music:    '/assets/audio/music/theme-main.mp3',
    ambience: '/assets/audio/ambience/wind-mountain.mp3',
    narration: '/assets/audio/narration/page-02.mp3',
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
];

export const totalPages = pages.length;
