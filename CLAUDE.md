# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

A static site (no framework, no bundler, no `package.json`) for Lumus's onboarding flow, plus a small
standalone design-token pipeline that feeds it. There is no build step for the site itself — HTML files
are served as-is.

- `index.html` — meta-refresh redirect to `lumus-original.html`.
- `lumus-original.html`, `403.html`, `404.html` — large, machine-generated "bundled" HTML pages (each one
  is a single self-contained file with inlined SVG/CSS, `<title>Bundled Page</title>` boilerplate, and
  `__bundler_*` element IDs). These come from an external no-code export tool, not hand-authored. **Do not
  hand-edit their internals** — treat them as build output; if content needs to change, it needs to change
  upstream and be re-exported. Small, targeted patches (e.g. layout/asset tweaks) are acceptable when that's
  what's been asked for, but avoid wholesale reformatting since it makes future re-exports impossible to diff.
  Per `.gitignore`, one-off transform scripts used to patch these exports (`patch-404.mjs`, `patch-403.mjs`,
  `coming-soon.html`) are local/untracked — expect them to be absent from a fresh checkout.
- `design-system/` — a self-contained Figma-token-to-CSS pipeline (see below).
- `.claude/launch.json` — local static preview config (`python -m http.server 8000`).

## Commands

There is no `package.json`, so there's no `npm install`/`npm run` anything — everything runs via `node`
directly on the `.mjs` scripts in `design-system/`, and the site is served with any static file server.

```bash
# Preview the static site locally
python -m http.server 8000          # matches .claude/launch.json; serve from repo root

# Regenerate colors.css / colors.js / colors.ts / tokens.json from the Figma token exports
node design-system/build-from-tokens.mjs

# Watch design-system/figma-tokens/*.tokens.json and rebuild automatically on change
node design-system/watch.mjs

# Serve the token editor UI with a save endpoint (writes design-system/tokens.json)
node design-system/editor-server.mjs   # -> http://localhost:8100/design-system/index.html
```

There is no test suite, linter, or type checker configured in this repo.

## Design-system token pipeline

`design-system/` implements a two-layer color token system generated from Figma DTCG (Design Tokens
Community Group format) exports. Understanding the data flow across files matters more than any single file:

1. **Source of truth**: `design-system/figma-tokens/{Base,Light,Dark}.tokens.json` — raw exports from
   Figma. `Base.tokens.json` holds primitive color scales (e.g. `gray-light-mode/900`); `Light.tokens.json`
   and `Dark.tokens.json` hold semantic tokens (e.g. `text-primary`) that alias primitives or other
   semantic tokens per mode.
2. **Build step**: `build-from-tokens.mjs` reads those three files, resolves primitive/semantic alias
   chains, and writes four generated outputs into `design-system/`:
   - `colors.css` — CSS custom properties in two layers (primitives, then semantic light/dark via
     `:root[data-theme]` and `prefers-color-scheme`).
   - `colors.js` / `colors.ts` — the same data as JS/TS exports, consumed by the token editor UI.
   - `tokens.json` — a flat runtime-oriented dump of the same variables, meant to be fetched at page load
     (see `tokens-runtime.js`) so a page's colors can be updated **without a rebuild or redeploy**.
   
   **All four are generated — never hand-edit them.** Edit the `figma-tokens/*.tokens.json` sources (or
   `tokens.json` via the editor UI) and re-run the build.
3. **Runtime consumption**: `tokens-runtime.js` exports `loadTokens()`/`watchTokens()`, which fetch
   `tokens.json` and inject it as a `<style>` block of CSS variables at runtime — this is how
   `design-system/runtime.html` demos live token updates with zero `colors.css` include.
4. **Editor UI**: `design-system/index.html` is a token editor/viewer (view + edit modes, change log) that
   reads `colors.js`/`colors.ts` for display and can POST edits to `editor-server.mjs`'s
   `/api/save-tokens` endpoint, which writes `design-system/tokens.json` directly (optionally re-running
   the DTCG build to keep `colors.css` in sync — check `editor-server.mjs` before assuming this happens
   automatically).
5. `usage.js` — hand-authored (not generated) Vietnamese usage notes per semantic token, shown in the
   editor UI. Safe to edit freely; keep it in sync when adding/renaming semantic tokens.

Semantic token naming convention: `{category}-{variant}[_{state-or-context}]`, e.g. `bg-brand-solid_hover`,
`text-secondary_on-brand`. Categories in use: `text`, `border`, `fg` (icons/graphics), `bg`, plus
`focus-ring*` and `shadow-*` effect tokens.

## Language / locale conventions

UI copy in this codebase is Vietnamese (`lang="vi"` throughout, e.g. `design-system/index.html`,
`design-system/runtime.html`, `index.html`), including code comments in `usage.js`. Match this when adding
user-facing strings to design-system pages.
