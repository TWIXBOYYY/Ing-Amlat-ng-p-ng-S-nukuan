# Ing Amlat ng Ápûng Sinukuan
*Interactive digital comic website — Áyup Productions*

---

## Installation

### Prerequisites
- [Node.js](https://nodejs.org/) version **18 or higher**
- npm (comes with Node.js)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/TWIXBOYYY/Ing-Amlat-ng-p-ng-S-nukuan.git
cd Ing-Amlat-ng-p-ng-S-nukuan

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open your browser at **http://localhost:5173** — the site will hot-reload as you edit files.

---

## Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server at `localhost:5173` |
| `npm run build` | Production build → `/dist` |
| `npm run preview` | Preview the production build locally |

---

## Quick start

```bash
npm install
npm run dev        # localhost:5173
npm run build      # production build → /dist
npm run preview    # preview the build locally
```

---

## How to add a comic page

1. **Drop the image** into `/public/assets/comic/` as `page-XX.webp` (and `page-XX.jpg` as fallback).
2. **Open** `src/data/story.js` and append an object to the `pages` array:

```js
{
  id:        'page-06',
  image:     '/assets/comic/page-06.webp',
  alt:       'Describe what happens on this page (screen-reader text).',
  // Optional fields:
  narration: '/assets/audio/narration/page-06.mp3',
  music:     '/assets/audio/music/theme-main.mp3',   // omit = keep current track
  ambience:  '/assets/audio/ambience/forest-night.mp3',
  sfx: [
    { src: '/assets/audio/sfx/rumble.mp3', on: 'enter' },
  ],
  layers: [
    // Parallax layers (depth 0 = static, 1 = full parallax)
    { src: '/assets/comic/page-06-clouds.png', depth: 0.25 },
  ],
},
```

3. Save — the reader picks it up automatically (no code changes needed).

---

## How to add audio

| Channel   | Drop files into                    | Notes                                      |
|-----------|------------------------------------|--------------------------------------------|
| Music     | `/public/assets/audio/music/`      | Loops. Crossfades when the track changes.  |
| Ambience  | `/public/assets/audio/ambience/`   | Loops. Crossfades when the track changes.  |
| SFX       | `/public/assets/audio/sfx/`        | One-shot. Triggered by `sfx` in story.js. |
| Narration | `/public/assets/audio/narration/`  | One per page. Stops on page change.        |

Reference each file by its path from `/public`, e.g. `/assets/audio/music/theme-main.mp3`.

---

## How to replace placeholder art

All UI placeholders are clearly labelled in the code. When real assets arrive:

| Placeholder                  | Replace with                                        |
|------------------------------|-----------------------------------------------------|
| Homepage background layers   | `<img>` tags in `src/screens/home/home.js`          |
| Sun on homepage & loading    | SVG inline → `<img src="/assets/ui/sun.svg">`       |
| Áyup Productions logo (splash)| Replace SVG in `src/screens/loading/splash.js`    |
| Settings sun decoration      | Replace SVG in `src/components/settings/settings.js`|
| Team photo (About page)      | Drop `/public/assets/ui/team-photo.webp`            |
| Comic page images            | Drop into `/public/assets/comic/` per story.js      |

---

## Deploy to Netlify / Vercel / Cloudflare Pages

1. `npm run build` — output is `/dist`.
2. Set the **publish directory** to `dist` and **build command** to `npm run build`.
3. No server required — fully static.

### Unity WebGL trivia game (future)

See `src/utils/unityBridge.js` for full documentation. Short version:

1. Build the Unity 6 project as WebGL (Brotli compression).
2. Copy the build into `/public/trivia/`.
3. Configure your host to serve `.br` files with `Content-Encoding: br`.
4. The `UnityBridge` module handles postMessage in both directions automatically.

---

## Project structure

```
├── public/
│   └── assets/
│       ├── comic/          ← page images (WebP + JPG fallback)
│       ├── ui/             ← logos, icons, team photo
│       └── audio/
│           ├── music/
│           ├── ambience/
│           ├── sfx/
│           └── narration/
├── src/
│   ├── audio/
│   │   └── AudioManager.js     ← Howler.js wrapper, 5 channels
│   ├── components/
│   │   └── settings/           ← settings modal (overlay)
│   ├── data/
│   │   └── story.js            ← ALL comic content lives here
│   ├── screens/
│   │   ├── loading/            ← splash + loading screens
│   │   ├── home/               ← homepage with parallax
│   │   ├── about/
│   │   ├── credits/
│   │   └── reader/             ← comic reader (core feature)
│   ├── styles/
│   │   ├── variables.css       ← CSS custom properties / tokens
│   │   └── global.css          ← reset, stage, rotate screen
│   ├── utils/
│   │   ├── router.js           ← hash-based screen router
│   │   ├── scaler.js           ← 16:9 letterbox stage scaling
│   │   └── unityBridge.js      ← Unity WebGL postMessage bridge
│   └── main.js                 ← app entry point
├── index.html
├── vite.config.js
└── package.json
```

---

## Supported breakpoints

| Viewport            | Behaviour                             |
|---------------------|---------------------------------------|
| 1920 × 1080         | Design baseline (1:1)                 |
| 1366 × 768          | Stage scales down, letterboxed        |
| iPad landscape      | Stage scales down, letterboxed        |
| Phone landscape     | Stage scales down, letterboxed        |
| Phone portrait      | "Please rotate your phone" overlay    |
