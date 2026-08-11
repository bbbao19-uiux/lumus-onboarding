import fs from 'fs';
import path from 'path';

/**
 * Generate the color-token system DIRECTLY from the Figma DTCG exports
 * (design-system/figma-tokens/*.tokens.json) — the authoritative source.
 *   Base.tokens.json  -> primitives (all scales, exact hex)
 *   Light.tokens.json -> semantic tokens, light mode  (hex + primitive alias)
 *   Dark.tokens.json  -> semantic tokens, dark mode   (hex + primitive alias)
 * Outputs: colors.css, colors.js, colors.ts
 */

const SRC = path.resolve('design-system/figma-tokens');
const readJson = (f) => JSON.parse(fs.readFileSync(path.join(SRC, f), 'utf8'));
const base = readJson('Base.tokens.json').Colors;
const lightSrc = readJson('Light.tokens.json').Colors;
const darkSrc = readJson('Dark.tokens.json').Colors;

// "Gray (light mode)" -> "gray-light-mode", "Rosé" -> "rose", "Orange dark" -> "orange-dark"
const normFamily = (name) => name
  .replace(/[éÉ]/g, 'e').toLowerCase()
  .replace(/[()]/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
const cleanToken = (name) => name.replace(/\s*\(\d+\)\s*$/, '').trim();

// ---------------------------------------------------------------- PRIMITIVES
const primitives = {};       // familyNorm -> { step -> hex }
const familyOrder = [];      // normalized family names, in file order
for (const [figName, scale] of Object.entries(base)) {
  const fam = normFamily(figName);
  familyOrder.push(fam);
  primitives[fam] = {};
  for (const [step, node] of Object.entries(scale)) {
    if (node && node.$type === 'color') primitives[fam][step] = node.$value.hex.toLowerCase();
  }
}
const PRIMARY = ['gray-light-mode', 'gray-dark-mode', 'gray-dark-mode-alpha', 'brand', 'error', 'warning', 'success'];
const groups = {
  primary: familyOrder.filter(f => PRIMARY.includes(f)),
  secondary: familyOrder.filter(f => f !== 'base' && !PRIMARY.includes(f)),
};

// alias "Colors/Gray (light mode)/900" -> {family:'gray-light-mode', step:'900'}
function parseAlias(node) {
  const a = node.$extensions?.['com.figma.aliasData']?.targetVariableName;
  if (!a) return null;
  const parts = a.split('/');                 // ["Colors","Gray (light mode)","900"]
  const step = parts.pop();
  const family = normFamily(parts.slice(1).join('/')); // drop leading "Colors"
  return { family, step, raw: a };
}

// recursively collect color leaves under a semantic group
function collectColors(obj, out) {
  for (const [key, node] of Object.entries(obj)) {
    if (node && node.$type === 'color') out.push({ key, node });
    else if (node && typeof node === 'object' && !node.$type) collectColors(node, out);
  }
  return out;
}

// ------------------------------------------------------------------ SEMANTIC
// group -> [{ name, light:{hex,alias}, dark:{hex,alias} }]
const hexFromPrimitive = (alias) => alias && primitives[alias.family]?.[alias.step] || null;
// "{Colors.Background.bg-secondary}" -> "bg-secondary" (semantic-to-semantic alias)
const parseSemAlias = (v) => {
  if (typeof v !== 'string') return null;
  const m = v.match(/^\{Colors\.(.+)\}$/);
  if (!m) return null;
  const parts = m[1].split('.');
  return cleanToken(parts[parts.length - 1]);
};
function readMode(src) {
  const map = {}; // group -> tokenName -> {hex, alias, semAlias}
  for (const [group, tokens] of Object.entries(src)) {
    map[group] = {};
    for (const { key, node } of collectColors(tokens, [])) {
      const v = node.$value;
      const alias = parseAlias(node);
      const semAlias = parseSemAlias(v);
      let hex = (v && typeof v === 'object' && v.hex) ? v.hex.toLowerCase() : hexFromPrimitive(alias);
      if (!hex && !semAlias) continue;  // skip non-color effects (e.g. shadows)
      map[group][cleanToken(key)] = { hex, alias, semAlias };
    }
  }
  // resolve semantic-to-semantic aliases to a concrete hex (follow chains)
  const flat = () => Object.assign({}, ...Object.values(map));
  for (let i = 0; i < 5; i++) {
    const all = flat();
    for (const tokens of Object.values(map))
      for (const t of Object.values(tokens))
        if (!t.hex && t.semAlias && all[t.semAlias]?.hex) t.hex = all[t.semAlias].hex;
  }
  return map;
}
const lightMap = readMode(lightSrc);
const darkMap = readMode(darkSrc);

const semanticGroups = {};   // group -> { token -> {light, dark} }
for (const group of Object.keys(lightMap)) {
  semanticGroups[group] = {};
  for (const token of Object.keys(lightMap[group])) {
    semanticGroups[group][token] = { light: lightMap[group][token], dark: darkMap[group]?.[token] || null };
  }
}

// --------------------------------------------------------------- GENERATORS
const primVar = (fam, step) => `--color-${fam}-${step}`;
const aliasRef = (mode) => {
  if (!mode) return null;
  if (mode.semAlias) return `var(--${mode.semAlias})`;              // semantic -> semantic
  if (mode.alias) return `var(${primVar(mode.alias.family, mode.alias.step)})`; // semantic -> primitive
  return mode.hex;                                                  // raw value
};

function primitiveCss() {
  const out = ['  /* Base */'];
  for (const [step, hex] of Object.entries(primitives.base)) out.push(`  ${primVar('base', step)}: ${hex};`);
  for (const [gname, fams] of Object.entries(groups)) {
    out.push(`\n  /* ${gname[0].toUpperCase() + gname.slice(1)} */`);
    for (const fam of fams) for (const [step, hex] of Object.entries(primitives[fam])) out.push(`  ${primVar(fam, step)}: ${hex};`);
  }
  return out.join('\n');
}
function semanticCss(mode) {
  const out = [];
  for (const [group, tokens] of Object.entries(semanticGroups)) {
    out.push(`  /* ${group} */`);
    for (const [token, modes] of Object.entries(tokens)) {
      const ref = aliasRef(modes[mode]);
      if (ref) out.push(`  --${token}: ${ref};`);
    }
  }
  return out.join('\n');
}

const css = `/* ============================================================================
 * Lumus Design System — Color Tokens
 * AUTO-GENERATED from Figma DTCG exports (design-system/figma-tokens/*.tokens.json)
 * Do not edit by hand — edit the source tokens and re-run build-from-tokens.mjs.
 * ========================================================================== */

/* Layer 1 — Primitives */
:root {
${primitiveCss()}
}

/* Layer 2 — Semantic · LIGHT (default) */
:root, :root[data-theme="light"] {
${semanticCss('light')}
}

/* Layer 2 — Semantic · DARK */
:root[data-theme="dark"] {
${semanticCss('dark')}
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
${semanticCss('dark')}
  }
}
`;

// exports for the viewer UI
const jsBody = `export const primitives = ${JSON.stringify(primitives, null, 2)};
export const groups = ${JSON.stringify(groups, null, 2)};
export const steps = ${JSON.stringify(['25','50','100','200','300','400','500','600','700','800','900','950'])};
export const semantic = ${JSON.stringify(semanticGroups, null, 2)};
`;

const outDir = path.resolve('design-system');
fs.writeFileSync(path.join(outDir, 'colors.css'), css);
fs.writeFileSync(path.join(outDir, 'colors.js'), `// AUTO-GENERATED from Figma DTCG exports. Do not edit by hand.\n${jsBody}`);
fs.writeFileSync(path.join(outDir, 'colors.ts'),
  `// AUTO-GENERATED from Figma DTCG exports. Do not edit by hand.\n${jsBody.replace(/;\n$/, ' as const;\n')}\nexport type ColorMode = 'light' | 'dark';\n`);

const nFam = familyOrder.length;
const nPrim = Object.values(primitives).reduce((a, s) => a + Object.keys(s).length, 0);
const nSem = Object.values(semanticGroups).reduce((a, g) => a + Object.keys(g).length, 0);
const noDark = [];
for (const [g, tks] of Object.entries(semanticGroups)) for (const [t, m] of Object.entries(tks)) if (!m.dark) noDark.push(`${g}/${t}`);
console.log(`Primitives: ${nFam} families, ${nPrim} tokens`);
console.log(`Semantic: ${nSem} tokens x {light,dark} across ${Object.keys(semanticGroups).length} groups`);
if (noDark.length) console.log(`⚠ ${noDark.length} tokens missing dark value:`, noDark.slice(0, 8).join(', '));
