# Repository guide

This repo holds two kinds of work. Read this before assuming a stack — the global `CLAUDE.md`
workflow rules still apply, but the build commands there do not match every folder here.

| Path | What it is | Stack |
|---|---|---|
| `lumus-app/` | Lumus AI-assistant demo app | Next.js 15 App Router, React 19, TypeScript strict, CSS Modules |
| `design-system/` | Colour tokens generated from Figma DTCG exports | Node scripts, plain CSS/JS |
| `*.html` at the root | Standalone Figma-derived pages (403, 404, coming-soon, onboarding) | Static HTML, no build |

Product requirements live in [docs/PRD.md](docs/PRD.md); user stories with acceptance criteria live
in [docs/USER-STORIES.md](docs/USER-STORIES.md). Both describe `lumus-app/`.

## lumus-app

See [lumus-app/README.md](lumus-app/README.md) for the full architecture. Summary:

- **Mobile-first.** One phone-width column capped at 460px, sticky glass header, floating capsule
  tab bar, bottom settings sheet, safe-area insets. There is no desktop layout on purpose.
- Four routes: `/login`, `/dashboard`, `/chat`, `/integrations`. `/` redirects to `/login`.
- A mascot ("Lumi") — the Lumus mark itself — whose mood is split into a context-owned base mood and
  a timed override mood.
- iOS-flavoured liquid glass: one `.lg` recipe in `styles/glass.css`, three layers per surface
  (frosted fill, masked specular rim, edge-lensing pass).
- **Glass is achromatic; brand blue `#1b5ee4` is only for primary intent** — primary button, active
  tab, focus ring, live marker, progress and chart fills, the user's chat bubble, the mascot. Do not
  tint containers, inputs or avatars blue.
- Runtime language switch (vi/en) from a typed dictionary, and light/dark/system theming.
- All data is fixture data in `lib/mock/`. No API calls, no persistence, no auth guard.

### Commands

Run these from the repo root.

```bash
npm --prefix lumus-app run typecheck
```

```bash
npm --prefix lumus-app run build
```

```bash
npm --prefix lumus-app run dev
```

`dev` serves on port 3100.

**Never run `next build` while `next dev` is running against the same output directory** — the
production build overwrites the chunks the dev server holds in memory and every route starts
returning 500 (`Cannot find module './NNN.js'`) until `.next` is deleted. `next.config.ts` reads
`NEXT_DIST_DIR`, so verification builds go somewhere else:

```bash
cd lumus-app && NEXT_DIST_DIR=.next-build npx next build
```

If `.next` has already been clobbered, the recovery is: stop the dev server, `rm -rf lumus-app/.next`,
start it again.

There is no test suite and no ESLint config in `lumus-app` yet, so `typecheck` plus `build` is the
gate — do not claim a lint or test pass that did not run.

### Static pages and design system

The root HTML files are self-contained; open them directly or serve the repo with
`python -m http.server 8000`. `design-system/colors.css` is generated — edit
`design-system/figma-tokens/*.tokens.json` and re-run `build-from-tokens.mjs`, never the CSS by hand.
`lumus-app/styles/tokens.colors.css` is a copy of that generated file; re-copy it after regenerating.

## Conventions specific to this repo

- TypeScript strict with `noUncheckedIndexedAccess` — index access is `T | undefined`, handle it.
- Server components by default; `'use client'` only where state, effects or context are needed.
- Co-locate route-only components with the route (`app/(workspace)/chat/ToolCallCard.tsx`).
- Shared UI lives in `components/`; shared logic in `lib/`.
- Theme-aware CSS must define light on bare `:root`, then redefine only what changes under both
  `:root[data-theme="dark"]` and `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) }`.
- New UI copy goes in `lib/i18n/dictionary.ts` in both locales. The English object is typed against
  the Vietnamese source, so a missing key is a type error.
- Code, identifiers, comments and committed docs are English. Product copy is bilingual.

## Documentation sync

After changing `lumus-app`, update `lumus-app/README.md`, `docs/PRD.md` and `docs/USER-STORIES.md` so
route lists, component lists and described behaviour match the code. Keep `AGENTS.md` in sync with
this file — this file is the source of truth.
