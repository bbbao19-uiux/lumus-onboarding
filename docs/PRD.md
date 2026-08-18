# Lumus — Product Requirements

> Status: **demo build** (`lumus-app/`), **mobile-first**. Every integration is simulated with
> fixture data; no external API is called and no credential is stored.

## 1. Problem

Knowledge workers keep their working context in three separate places — a calendar, a mailbox and an
issue tracker. Answering "what should I do today?" means opening all three, reconciling them by hand,
and then writing the summary a third time for standup. Existing chat assistants can talk about the
work but cannot see it.

## 2. Product

Lumus is an AI assistant that connects to Calendar, Gmail and Jira, then reports on, researches and
acts on the work it finds there — including booking meetings — through a chat interface comparable to
Claude or ChatGPT.

Its differentiator is **Lumi**, a mascot that makes the assistant's state legible and its handling of
sensitive input visibly trustworthy.

## 3. Goals

| # | Goal | How it is measured in the demo |
|---|---|---|
| G1 | One place to see today's work | Dashboard shows calendar, inbox and sprint side by side |
| G2 | Tool use is visible, never a black box | Every tool call renders a card with its inputs and results |
| G3 | The assistant never acts unilaterally | Meeting creation and mail sending require explicit confirmation |
| G4 | Sensitive input feels safe | Mascot covers its eyes on password and OTP fields |
| G5 | Usable in Vietnamese and English | Full UI copy in both, switchable at runtime |
| G6 | Light and dark are both first-class | Every surface defined in both palettes |
| G7 | Designed for a phone, not shrunk onto one | Bottom tab bar, 44px targets, safe-area insets, single column |

## 4. Non-goals

- Real OAuth, real API traffic, or persistence of any kind.
- A production LLM backend — replies are scripted per intent.
- Mobile-native apps; the demo targets mobile web. On a wide screen the app stays a centred
  phone-width column rather than expanding into a separate desktop layout.
- Team/admin features (SSO provisioning, audit logs, billing).

## 5. Scope — the four screens

### 5.1 Login + OTP (`/login`)
Two-step sign-in that exists mainly to demonstrate the mascot's context awareness.

- Step 1: work email + password. Email is validated with a regex; password requires ≥ 6 characters.
- Step 2: six-box OTP. The demo code is `123456`; anything else shows an inline error.
- Failed validation makes the mascot briefly angry; success makes it happy and routes to the dashboard.
- Language and theme switchers are available before sign-in.

### 5.2 Dashboard (`/dashboard`)
Read-only overview assembled from all three tools.

- Greeting card with connection status and a high-priority mail count.
- Four week-over-week stat tiles: meetings, focus hours, tickets closed, unread mail.
- Today's agenda (4 events) with the in-progress meeting highlighted and a join action.
- Inbox needing action (4 threads) with per-thread priority.
- Current sprint: progress bar over story points plus the ticket list with status.
- Weekly focus-hours bar chart.
- Four quick actions, each of which deep-links into chat with a pre-filled prompt.

### 5.3 Chat (`/chat`)
The assistant surface.

- Streaming assistant replies with a live caret. The header carries the mascot plus an icon-only new-chat action; the composer docks above the tab bar.
- Sequential tool-call cards (Calendar / Gmail / Jira) showing a spinner while running and an
  expandable result table when finished. Each card is tinted with its tool's brand colour.
- Four suggested prompts on the empty state and three as a horizontally scrolling composer chip row.
- Scheduling intent produces a meeting proposal card that must be confirmed before the event is
  "created" — this encodes G3.
- Accepts `?q=<prompt>` to auto-send once, which is how the dashboard quick actions arrive.
- Four scripted intents — brief, schedule, triage, standup — plus a fallback that explains the demo.

### 5.4 Integrations (`/integrations`)
Consent and connection management.

- One card per tool: account, connection state, description, and the exact permission scopes.
- Calendar and Gmail start connected; Jira starts disconnected so the connect flow is demonstrable.
- Connecting takes ~2.2s, during which a light beam is drawn from the mascot to the card and the
  mascot switches to that tool's colour.
- Disconnecting is immediate and resets the last-sync label.

## 6. The mascot

Lumi is the Lumus mark itself, rendered as inline SVG: two gradient blades meeting at a peak over a
base bar, with two tall capsule eyes. Geometry, gradients, eye positions and pupil travel
(±2.5 / ±4 user units) come from the supplied `Lumus Effect.html` reference.

Its state is split in two layers so that app-driven states and user-driven reactions cannot fight
each other:

- **Base mood**, owned by context: `idle`, `watching`, `shy`, `thinking`, `working`, `sleeping`.
- **Override mood**, a timed reaction that wins while active: `happy`, `angry`.

| Trigger | Behaviour |
|---|---|
| Press and hold ≥ 850 ms | Shakes, brows drop, red tint via a clipped colour-blend layer, steam puffs; stays angry 2.8 s after release. Fires a 35 ms haptic where supported |
| Short tap / Enter / Space | Hops and shows a speech bubble |
| Focus a `password` field or any `data-secret="true"` input | Eyes shut to slits, pupils fade, curved lids appear, and two gradient shutters slide inward over the eyes |
| Reveal the password | Field becomes text, so the mascot peeks again |
| Focus a text field | Pupils track the measured caret position |
| Pointer moves anywhere | Pupils follow the cursor when no field is focused |
| Assistant is reasoning | Eyes squint to 74%, orbit dots appear, float speeds up |
| A tool call is running | Aura and orbit take the tool's brand colour |
| Idle | Slow bob, periodic blink, and a specular streak travelling across the mark |

## 7. Visual system

- **Liquid glass, iOS-flavoured** (`styles/glass.css`, the global `.lg` recipe). Three layers per
  surface: a frosted fill, a 1px specular rim drawn as a masked gradient border, and an edge-lensing
  pass (`backdrop-filter: blur(5px) brightness(1.07)` masked to the rim) which is what makes the
  boundary look refractive rather than merely translucent. Capsule-leaning radii, and a press state
  that yields and springs back.
- **The glass is achromatic.** The material is white or graphite alpha; colour comes from whatever
  sits behind it. This is the rule that keeps the interface from being blue everywhere.
- **Colour policy**: brand blue `#1b5ee4` is reserved for primary intent — the primary button, the
  active tab, focus rings, the live-meeting marker, progress and chart fills, the user's own chat
  bubble, and the mascot. Measured on the dashboard: 16 of 369 elements carry a blue background.
  (The brief said "blue `#9E77ED`"; that hex is violet, so the design system's brand blue was used
  instead — confirmed with the requester.)
- **Ground**: a neutral vertical wash with exactly one brand bloom, parked top-centre behind the
  mascot, plus a faint grain so large blurred panels do not band.
- Fallbacks for both `@supports not (backdrop-filter)` and
  `@media (prefers-reduced-transparency: reduce)` swap in opaque surfaces.
- **Theming**: `data-theme="light" | "dark"` on `<html>`, plus `prefers-color-scheme` when the user
  has not chosen. A pre-paint inline script applies the stored choice to avoid a flash.
- **Motion**: honours `prefers-reduced-motion: reduce`.

## 8. Mobile shell

- A single scrolling column capped at 460px, centred on wider viewports.
- Sticky glass header carrying the screen title, a settings button and the mascot at 54px, so the
  mascot is always on screen to react to the field being typed into.
- Floating capsule tab bar at the bottom (Overview / Chat / Integrations), inset by
  `env(safe-area-inset-bottom)`; the header pads by `env(safe-area-inset-top)`.
- `viewport-fit=cover`, so the chrome runs under the status bar and home indicator.
- Settings live in a bottom sheet rather than a sidebar: language, theme, account.
- Every tap target is at least 44px; text inputs use 16px type so iOS Safari does not zoom on focus.
- Chat locks the shell to the viewport and scrolls only the transcript, keeping the composer docked
  above the tab bar.

## 9. Accessibility

- All interactive controls are real buttons, links or inputs and reachable by keyboard.
- The mascot exposes `role="button"` with a mood-bearing `aria-label`, and responds to Enter/Space.
- Speech bubbles are `role="status"`; tool cards expose `aria-expanded`.
- Focus rings come from the design system's `--focus-ring` token.

## 10. Risks and follow-ups

| Risk | Mitigation / next step |
|---|---|
| `backdrop-filter` is expensive with many stacked panels | Panel count is bounded; fallback exists |
| Scripted replies will not survive a real user typing freely | Fallback intent explains the demo's limits |
| No auth, so any route is directly reachable | Acceptable for a demo; real build needs middleware |
| Caret measurement is an approximation | Good enough for gaze; would need per-font metrics to be exact |
| Three stacked `backdrop-filter` layers per surface is not free on older phones | Card count per screen is bounded; the reduced-transparency path drops both extra layers |
