/* ── Global styles ── */
import './styles/global.css';

/* ── Screen styles ── */
import './screens/loading/splash.css';
import './screens/loading/loading.css';
import './screens/home/home.css';
import './screens/about/about.css';
import './screens/credits/credits.css';
import './screens/reader/reader.css';
import './components/settings/settings.css';

/* ── Utilities ── */
import { initScaler }             from './utils/scaler.js';
import { initRouter, registerScreen, navigate } from './utils/router.js';

/* ── Audio ── */
import { AudioManager }           from './audio/AudioManager.js';

/* ── Screens ── */
import { createSplashScreen,  mountSplash }   from './screens/loading/splash.js';
import { createLoadingScreen, mountLoading }  from './screens/loading/loading.js';
import { createHomeScreen,    mountHome, unmountHome }    from './screens/home/home.js';
import { createAboutScreen,   mountAbout }    from './screens/about/about.js';
import { createCreditsScreen, mountCredits }  from './screens/credits/credits.js';
import { createReaderScreen,  mountReader, unmountReader } from './screens/reader/reader.js';

/* ── Settings overlay (lives above all screens) ── */
import { createSettingsOverlay } from './components/settings/settings.js';

// ─────────────────────────────────────────────────────────────────────────────

function bootstrap() {
  // 1. Scale the 1920×1080 stage to fit the viewport
  initScaler();

  // 2. Initialise audio (loads persisted settings from localStorage)
  AudioManager.init();

  const app = document.getElementById('app');

  // 3. Build all screens and append them to #app
  const screens = [
    createSplashScreen(),
    createLoadingScreen(),
    createHomeScreen(),
    createAboutScreen(),
    createCreditsScreen(),
    createReaderScreen(),
  ];
  screens.forEach(s => app.appendChild(s));

  // 4. Settings overlay sits above everything, also inside #app
  const settingsOverlay = createSettingsOverlay();
  app.appendChild(settingsOverlay);

  // 5. Register routes
  registerScreen('#splash',  { mount: (el) => mountSplash(el) });
  registerScreen('#loading', { mount: (el) => mountLoading(el) });
  registerScreen('#home',    { mount: (el) => mountHome(el),   unmount: (el) => unmountHome(el) });
  registerScreen('#about',   { mount: (el) => mountAbout(el)  });
  registerScreen('#credits', { mount: (el) => mountCredits(el) });
  registerScreen('#reader',  { mount: (el) => mountReader(el), unmount: (el) => unmountReader(el) });

  // 6. Always start at splash — ignore any hash left in the URL from a previous session
  history.replaceState(null, '', '#splash');

  initRouter();
}

bootstrap();
