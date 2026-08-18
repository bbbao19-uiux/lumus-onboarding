# Lumus — User Stories

Scope: the `lumus-app/` demo build, **mobile-first**. Each story lists acceptance criteria that were
verified against the running app at a 375x812 viewport. "Verified" means checked in the browser
against the dev server, not merely coded.

Legend: ✅ implemented and verified · ⚠️ implemented, verified indirectly · ⛔ out of scope for the demo

---

## Epic A — Sign in

### A1 · Sign in with email and password ✅
**As a** worker **I want** to sign in with my work email **so that** Lumus can reach my tools.

- [x] Email that fails `/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/` shows an inline error and does not advance.
- [x] Password shorter than 6 characters shows an inline error.
- [x] A failed submit makes the mascot angry for ~900 ms.
- [x] A valid submit shows a pending label and advances to the OTP step after ~900 ms.

### A2 · Confirm a two-factor code ✅
**As a** worker **I want** a second factor **so that** my mailbox is not one password away.

- [x] Six single-character boxes; typing a digit advances focus, Backspace on an empty box retreats.
- [x] Arrow keys move between boxes; pasting a 6-digit string fills all of them.
- [x] The step shows the email the code was "sent" to.
- [x] `123456` signs in; any other code shows an error and makes the mascot angry.
- [x] The verify button stays disabled until all six digits are present.
- [x] After sign-in the mascot returns to `idle` rather than staying stuck in `working`.

### A3 · Choose language and theme before signing in ✅
- [x] VI/EN switch changes every string on the page and persists to `localStorage`.
- [x] Light / Dark / System switch changes `data-theme` and persists; System follows the OS.

---

## Epic B — The mascot

### B1 · The mascot covers its eyes for secrets ✅
**As a** worker **I want** visible proof the assistant is not reading my password.

- [x] Focusing an `input[type=password]` sets mood `shy`; verified `data-mood="shy"` on a real tap.
- [x] Eyes shut: both eye groups compute to `matrix(1, 0, 0, 0.07, 0, 0)`. Verified.
- [x] Pupils fade to `opacity: 0` and the curved lids come up to `0.85`. Verified.
- [x] Both gradient shutters reach `opacity: 1` with an identity transform, i.e. fully slid over the
      eyes. Verified.
- [x] Every OTP box carries `data-secret="true"` and triggers the same behaviour on autofocus.
- [x] Blinking stops while shy, so the covered eyes do not twitch.

### B2 · The mascot looks where I am typing ✅
- [x] Focusing a text or email field sets mood `watching`; verified `aria-label="Lumi — watching"`.
- [x] The gaze target is the measured caret position, not the middle of the field.
- [x] With nothing focused the pupils follow the pointer.
- [x] Pupil travel is clamped to the reference range (2.5 user units across, 4 down), so the pupils
      never leave the capsule eyes.

### B3 · The mascot reacts to being poked ✅
- [x] Press and hold ≥ 850 ms → mood `angry` plus a speech bubble. Verified against the previous
      artwork at 917 ms after `pointerdown`; the timer and handlers are unchanged, only the mark they
      drive.
- [x] Anger persists 2.8 s after release, then falls back to the base mood. Verified.
- [x] A short tap → mood `happy` plus a bubble. Verified.
- [x] Keyboard Enter/Space produces the happy reaction, so the interaction is not pointer-only.
- [x] A held press fires a 35 ms haptic through `navigator.vibrate` where the browser supports it.
- [x] Repeated lines are avoided — a new line is picked from the pool excluding the previous one.

### B4 · The mascot shows what the assistant is doing ⚠️
- [x] While a tool call runs the mood is `working` and the aura takes that tool's brand colour.
      Verified per-card accents: Calendar `#1b5ee4`, Gmail `#d92d20`, Jira `#0ba5ec`.
- [x] While composing the mood is `thinking`; the eyes squint — verified computed
      `matrix(1, 0, 0, 0.74, 0, 0)` — and the orbit dots appear.
- [x] The mascot rides in the sticky header, so it stays on screen while you scroll or type.
- [ ] Animation smoothness could not be observed: the verification pane does not composite frames,
      so `requestAnimationFrame` never ticks, and `setTimeout` is throttled to roughly once a second
      because the tab reports `document.hidden === true`. Logic and CSS were verified through
      computed styles and recorded mood transitions instead.

---

## Epic C — Dashboard

### C1 · See today's work in one place ✅
**As a** worker **I want** one screen that merges my three tools.

- [x] Four stat tiles with week-over-week deltas.
- [x] Today's agenda lists 4 events with time, location and attendees; the live one is highlighted
      and offers a join action.
- [x] Inbox lists 4 threads with sender, subject, preview, time and a priority badge.
- [x] Sprint card shows a 21/34 progress bar and the four tickets with status badges.
- [x] Weekly focus-hours chart renders five bars with values.
- [x] All of it renders in both languages — verified the full text in VI and EN.

### C2 · Jump from an overview item into chat ✅
- [x] Four quick-action cards link to `/chat?q=<prompt>`.
- [x] The "Brief me" button in the top bar does the same.
- [x] Chat auto-sends the seeded prompt exactly once per navigation.

---

## Epic D — Chat

### D1 · Ask about my work and watch the tools run ✅
- [x] Sending a message appends a user turn and an assistant turn.
- [x] Tool calls run in sequence; each card shows a spinner while running and a tick when finished.
- [x] Finished cards auto-expand to a label/value result table and can be collapsed again.
- [x] Cards are tinted with the tool's brand colour (Calendar blue, Gmail red, Jira cyan).
- [x] Verified end to end for the scheduling intent: two tool cards with correct result rows.

### D2 · Read a streamed reply ✅
- [x] The reply arrives in chunks with a blinking caret, then the caret disappears.
- [x] `**bold**`, blank-line paragraphs and `- ` bullets render as real markup.
- [x] The stream scrolls itself to the bottom as it grows.
- [x] The send button is disabled while a reply is in flight and while the composer is empty.

### D3 · Confirm before the assistant books anything ✅
**As a** worker **I want** to approve calendar writes **so that** nothing lands on my colleagues'
calendars without me.

- [x] The scheduling intent renders a proposal card with when, duration, attendees and location.
- [x] Row labels are scheduling-specific — verified rendering as When / Duration / Attendees / Where
      in English and Thời gian / Thời lượng / Người tham dự / Địa điểm in Vietnamese — rather than
      reused generic labels.
- [x] Nothing is created until "Tạo sự kiện" is pressed.
- [x] Confirming swaps the buttons for "Đã thêm vào Google Calendar" and makes the mascot happy.
- [x] Verified by clicking through the flow.

### D4 · Start over ✅
- [x] "Cuộc trò chuyện mới" clears the transcript and resets mascot and busy state.

### D5 · Free-form questions ✅
- [x] Unmatched input falls back to a reply that names the four scripted scenarios, rather than
      pretending to answer.

---

## Epic E — Integrations

### E1 · See exactly what the assistant may read ✅
- [x] One card per tool with account, state, description and explicit scope list.
- [x] Gmail's scopes state that mail is never sent without approval.
- [x] A footer note explains that disconnecting wipes synced data.

### E2 · Connect a tool and watch the handshake ✅
- [x] Jira starts disconnected; the other two start connected.
- [x] Pressing Connect puts the card in a connecting state, sets the mascot to `working` in Jira's
      colour, and shows a "Lumi đang bắt tay với Jira" bubble.
- [x] After ~2.2 s the card flips to connected with last sync "vừa xong" and the header count
      becomes 3/3. Verified.
- [x] Other connect buttons are disabled while one connection is in flight.
- [ ] The beam itself could not be observed for the reason given in B4; it now paints on the first
      synchronous measurement instead of waiting for a frame, with a dock-corner fallback origin.

### E3 · Disconnect a tool ✅
- [x] Disconnect flips the card back, clears the last-sync label and decrements the count.

---

## Epic G — Mobile shell

### G1 · The app is built for a phone ✅
**As a** worker **I want** to use this on my phone **so that** I can triage between meetings.

- [x] Single column capped at 460px, centred on wider viewports.
- [x] No horizontal overflow at 375x812 — verified `scrollWidth === innerWidth` on every screen.
- [x] Sticky glass header, measured 64px tall including the status-bar inset.
- [x] Floating capsule tab bar with three tabs, measured at y 738-802 in an 812px viewport, i.e.
      clear of the home-indicator area. Verified `backdrop-filter: blur(34px) saturate(1.8)`.
- [x] `viewport-fit=cover` plus `env(safe-area-inset-*)` padding on header and tab bar.
- [x] Tap targets are at least 44px; text inputs use 16px type so iOS Safari does not zoom on focus.
- [x] Settings (language, theme, account) live in a bottom sheet, not a sidebar.

### G2 · Chat behaves like a messaging app ✅
- [x] The shell locks to the viewport and only the transcript scrolls.
- [x] The composer stays docked above the tab bar — verified composer bottom 736 against tab bar top
      738, so they do not overlap.
- [x] Send is a 44px circular icon button rather than a labelled bar.
- [x] Suggested prompts become a horizontally scrolling chip row.

## Epic H — Liquid glass

### H1 · Surfaces read as glass, not as flat translucent panels ✅
- [x] Every surface composes three layers: frosted fill, masked specular rim, edge-lensing pass.
- [x] Verified live on a card in dark mode: fill `rgba(34, 35, 39, 0.82)`, backdrop
      `blur(28px) saturate(1.8)`, rim `linear-gradient(150deg, rgba(255,255,255,0.34) ...)` with
      `mask-composite: exclude`, lens `blur(5px) brightness(1.07)`.
- [x] Controls yield and spring back on press (`lgPress`).
- [x] Fallbacks exist for `@supports not (backdrop-filter)` and `prefers-reduced-transparency`.

### H2 · The interface is not blue everywhere ✅
**As a** stakeholder **I want** brand blue used as an accent **so that** the product does not read as
a single-hue demo.

- [x] Glass tokens are achromatic — white alpha in light, graphite alpha in dark. Verified
      `--glass: rgba(255 255 255 / 0.6)` and `rgba(30 31 34 / 0.62)`.
- [x] Ground is a neutral wash with exactly one brand bloom behind the mascot.
- [x] Counted on the dashboard: **16 of 369 elements** carry a blue background, and every one is a
      primary use — 2 primary buttons, 3 brand badges, 1 progress fill, 5 chart bars, 4 quick-action
      icons, 1 active tab. No card, input, avatar or container is blue. Verified by walking the DOM.

## Epic F — Cross-cutting

### F1 · Work in Vietnamese or English ✅
- [x] Every screen is fully translated; the dictionary is typed so a missing key fails `tsc`.
- [x] Switching updates `<html lang>` and persists across reloads.

### F2 · Work in light and dark ✅
- [x] Verified dark mode: `data-theme="dark"`, `--canvas: #0b0b0d`, body background `rgb(11,11,13)`.
- [x] Glass tokens are redefined for dark in all three theming blocks (`:root`, `[data-theme]`,
      `prefers-color-scheme`), so the toggle wins in both directions.

### F3 · Respect reduced motion ✅
- [x] A `prefers-reduced-motion: reduce` block collapses animation and transition durations.

### F4 · Out of scope ⛔
- [ ] Real OAuth, real API calls, persistence, route protection, sign-out, and a real LLM backend.
