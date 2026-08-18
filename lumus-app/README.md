# Lumus — AI assistant demo

A **mobile** demo of an AI assistant that connects to Calendar, Gmail and Jira to report on work,
research it and book meetings — with **Lumi**, a mascot that reacts to what you are doing.

Everything is fixture data. No external API is called, nothing is persisted, no credential is stored.

Open it at a phone viewport (375x812 is what it was tuned against). On a wider screen the app stays a
centred phone-width column; there is no separate desktop layout by design.

## Run it

```bash
npm --prefix lumus-app install
```

```bash
npm --prefix lumus-app run dev
```

Then open <http://localhost:3100>. `/` redirects to `/login`.

Demo credentials: any email, any password ≥ 6 characters, OTP `123456`.

## Screens

| Route | What it shows |
|---|---|
| `/login` | Two-step sign-in; the best place to see the mascot react to focus |
| `/dashboard` | Today's agenda, inbox needing action, sprint progress, weekly focus chart |
| `/chat` | Streaming replies with live Calendar/Gmail/Jira tool-call cards |
| `/integrations` | Connect and disconnect tools, with the exact permission scopes |

## Try the mascot

Lumi is the Lumus mark itself: two gradient blades over a base bar, with two capsule eyes. Geometry,
gradients and pupil travel come from the supplied reference file.

- **Press and hold** for about a second — it shakes, its brows drop, it turns red and steams, and it
  buzzes on phones that support `navigator.vibrate`.
- **Tap** briefly — it hops and says something.
- **Focus the password field** — the eyes shut, the pupils fade, and two shutters slide over them.
  Reveal the password and it peeks again.
- **Focus the email field and type** — the pupils track the caret.
- **Move the pointer** with nothing focused — the pupils follow you.
- **Send a chat message** — the eyes squint and the aura takes the running tool's brand colour.

## Commands

```bash
npm --prefix lumus-app run typecheck
```

```bash
npm --prefix lumus-app run build
```

Do not run `build` while `dev` is running — they share `.next`, and the production build overwrites
the chunks the dev server is holding, which makes every route return 500 until `.next` is deleted.
`next.config.ts` reads `NEXT_DIST_DIR`, so a build alongside a live dev server goes elsewhere:

```bash
cd lumus-app && NEXT_DIST_DIR=.next-build npx next build
```

## Architecture

Next.js 15 App Router, React 19, TypeScript strict (with `noUncheckedIndexedAccess`), CSS Modules.
No UI framework or CSS framework — colours come from the repo's generated design-system tokens.

```
lumus-app/
├── app/
│   ├── layout.tsx                    neutral ground + providers + pre-paint theme script
│   ├── globals.css                   token imports, resets, ground, phone column, reduced-motion
│   ├── page.tsx                      redirect → /login
│   ├── login/                        page, OTP input, styles
│   └── (workspace)/
│       ├── layout.tsx
│       ├── dashboard/
│       ├── chat/                     page, RichText, ToolCallCard
│       └── integrations/
├── components/
│   ├── glass/                        GlassCard, GlassButton, GlassField, Segmented, Badge
│   ├── mascot/                       MascotContext, Mascot, ConnectionBeam
│   └── shell/                        Providers, WorkspaceShell (header + tab bar + settings sheet),
│                                     PreferenceControls
├── lib/
│   ├── i18n/                         typed vi/en dictionary + provider
│   ├── theme/                        light/dark/system provider + bootstrap script
│   ├── mock/                         fixture data and the scripted chat intents
│   └── tools.tsx                     tool registry, brand accents, icons
└── styles/
    ├── tokens.colors.css             copied from ../design-system/colors.css
    └── glass.css                     liquid-glass + mascot tokens, per theme
```

### Mascot state model

Two layers, so app state and user reactions cannot fight:

- **base mood** — `idle`, `watching`, `shy`, `thinking`, `working`, `sleeping`
- **override mood** — `happy`, `angry`, timed, wins while active

`MascotProvider` owns a document-level `focusin`/`focusout` watcher. A `password` input or any
`data-secret="true"` input sets `shy`; any other text field sets `watching` and feeds the mascot a
caret position measured with a canvas `measureText` pass. `Mascot` runs one `requestAnimationFrame`
loop that lerps the pupils toward the gaze target and reports its own viewport centre so
`ConnectionBeam` can draw from it.

### Liquid glass

One recipe, `.lg` in `styles/glass.css`, used everywhere. Each surface is three layers:

1. **fill** — `backdrop-filter: blur(28px) saturate(180%)` over an achromatic alpha colour
2. **`::before`** — a 1px specular rim, drawn as a gradient border masked with `mask-composite`
3. **`::after`** — edge lensing: `backdrop-filter: blur(5px) brightness(1.07)` masked to the rim,
   which is what makes the boundary look refractive instead of merely see-through

Modifiers: `lgChrome` (thicker mix for headers and the tab bar), `lgThin`, `lgThick`, `lgPress`.
There are fallbacks for `@supports not (backdrop-filter)` and `prefers-reduced-transparency`.

**The glass carries no hue.** White alpha in light, graphite alpha in dark. Brand blue `#1b5ee4` is
reserved for primary intent: the primary button, active tab, focus ring, live-meeting marker,
progress and chart fills, the user's own chat bubble, and the mascot. If you find yourself reaching
for blue on a container, reach for `--bg-tertiary` instead.

### Mobile shell

`WorkspaceShell` gives every workspace screen a sticky glass header (title, settings button, mascot
at 54px) and a floating capsule tab bar inset by `env(safe-area-inset-bottom)`. Pass `fill` for
screens that scroll internally — chat uses it so only the transcript moves and the composer stays
docked. Settings live in a bottom sheet. Inputs use 16px type so iOS Safari does not zoom on focus.

### Theming

`styles/glass.css` follows the same three-block pattern as the generated colour tokens: bare `:root`
defines light, `:root[data-theme="dark"]` and `@media (prefers-color-scheme: dark)` +
`:root:not([data-theme="light"])` redefine only what changes. `lib/theme/themeBootstrapScript` runs
before paint so the first frame is already correct.

### Adding a chat intent

Append to `INTENTS` in `lib/mock/chatScript.ts`: keywords per locale, the tool runs to play, the
reply text in both languages, and optionally a `proposal` to render a confirmation card. Keys in
`lib/i18n/dictionary.ts` are typed from the Vietnamese source, so a missing English key fails `tsc`.

## Known limits

- Replies are scripted per intent; unmatched input hits a fallback that says so.
- No auth guard — routes are directly reachable by design.
- Deliberate deviation from the brief: the brief asked for "blue `#9E77ED`", but that hex is violet.
  The design system's brand blue `#1b5ee4` is used as the primary colour.
- No desktop layout. Wide viewports get the phone column centred, not a rearranged UI.
