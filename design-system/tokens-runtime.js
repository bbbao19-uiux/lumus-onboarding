// Runtime token loader — apply design tokens from tokens.json WITHOUT a rebuild.
//
//   import { loadTokens, watchTokens } from './tokens-runtime.js';
//   await loadTokens();                 // fetch ./tokens.json and inject CSS vars
//   watchTokens();                      // (optional) poll & hot-swap on change
//
// Point `url` at an externally-editable location (GitHub Gist raw, a CDN, an
// API) and updating that file changes the app's colors on the next load/poll —
// the app itself never has to be redeployed.

const STYLE_ID = 'lumus-runtime-tokens';
const rule = (obj) => Object.entries(obj).map(([k, v]) => `${k}:${v}`).join(';');

function tokensToCss(t) {
  return `:root{${rule(t.primitives)};${rule(t.semantic.light)}}`
    + `:root[data-theme="dark"]{${rule(t.semantic.dark)}}`
    + `@media(prefers-color-scheme:dark){:root:not([data-theme="light"]){${rule(t.semantic.dark)}}}`;
}

function inject(css) {
  let el = document.getElementById(STYLE_ID);
  if (!el) { el = document.createElement('style'); el.id = STYLE_ID; document.head.appendChild(el); }
  el.textContent = css;
}

let lastSig = null;

/** Fetch tokens.json and apply as CSS variables. Returns the token object. */
export async function loadTokens(url = './tokens.json') {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`tokens fetch failed: ${res.status}`);
  const text = await res.text();
  lastSig = text;
  const t = JSON.parse(text);
  inject(tokensToCss(t));
  return t;
}

/** Poll the token file; re-apply only when its content changes. Returns a stop fn. */
export function watchTokens(url = './tokens.json', intervalMs = 2000, onChange) {
  const id = setInterval(async () => {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) return;
      const text = await res.text();
      if (text !== lastSig) {
        lastSig = text;
        inject(tokensToCss(JSON.parse(text)));
        onChange && onChange();
      }
    } catch { /* transient — ignore */ }
  }, intervalMs);
  return () => clearInterval(id);
}
