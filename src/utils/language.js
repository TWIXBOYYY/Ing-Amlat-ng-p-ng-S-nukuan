/** Story language: 'en' (English, default) or 'pam' (Kapampangan). Persisted in localStorage. */
const KEY = 'sinukuan-language';
export const LANGUAGES = [
  { code: 'en',  label: 'English'     },
  { code: 'pam', label: 'Kapampangan' },
];

let current = 'en';
try {
  const saved = localStorage.getItem(KEY);
  if (LANGUAGES.some(l => l.code === saved)) current = saved;
} catch { /* ignore */ }

export const getLanguage = () => current;

export function setLanguage(code) {
  if (code === current || !LANGUAGES.some(l => l.code === code)) return;
  current = code;
  try { localStorage.setItem(KEY, code); } catch { /* ignore */ }
  document.dispatchEvent(new CustomEvent('language:change', { detail: code }));
}

/** Caption image for the current language; falls back to English (c.src). */
export const captionSrc = (c) => (c.srcByLang && c.srcByLang[current]) || c.src;
