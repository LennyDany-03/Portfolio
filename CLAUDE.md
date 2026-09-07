# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev              # dev server (Turbopack) on :3000
npm run build            # production build
npm start                # serve the production build
npm run lint             # ESLint
npx tsc --noEmit         # type-check — NOT part of lint, run it separately
npx prettier --write <f> # this repo is prettier-formatted; run after scripted edits
```

There is no test suite. Verification here means `tsc --noEmit`, `eslint`, and
`next build` all clean — run all three, since each catches things the others do
not.

A dev server is often already running on :3000. Check before starting another;
`next dev` refuses a second instance and exits 1.

`.next/dev/logs/next-development.log` holds browser console output as JSON
lines, which is the only way to see runtime errors without a browser. Its
timestamps are **not** aligned to `date` — do not compare the two to decide
whether an entry is stale. Check whether the error still exists in the source
instead.

## Architecture

`app/page.tsx` renders seven sections in order. Everything else is a motion
system layered underneath by `app/layout.tsx`.

### Scroll is locked — this is the core of the codebase

`components/ScrollSnap.tsx` replaces normal scrolling with discrete steps. The
lock needs **two** things and silently fails with only one:

1. A GSAP `Observer` with `preventDefault: true`.
2. **Lenis stopped** (`freezeScroll()`). Lenis drives scroll from its own wheel
   handling and ignores a cancelled native default. Every programmatic move
   must therefore pass `force` — `scrollToY(y, duration, true)` — or Lenis
   discards it and the page never moves.

Consequences to remember:

- **Anchor links must go through `stepTo()`.** Lenis's own `anchors` handling
  calls `scrollTo` without `force`, so on a frozen page every `#hash` link does
  nothing. `ScrollSnap` intercepts clicks for this reason.
- `freezeScroll()` records intent in a module flag, because `ScrollSnap` runs in
  a layout effect and `SmoothScroll` creates Lenis in a passive effect — the
  first freeze lands while the instance is still `null`.

### Stops

Sections do not hard-code positions. They register providers with `lib/snap.ts`;
`ScrollSnap` re-collects on **every gesture** (cheap, and it removes a whole
class of stale-state bugs).

Each `Stop` carries:

- **`section`** — the curtain plays when a step **crosses sections**, never
  because of a particular target. Do not reintroduce a per-stop `curtain`
  boolean: Crest is both Work's entry _and_ card 01 of its deck, so a flag there
  fired a full wipe just to move back one card.
- **`measure()`** — re-read one frame _after_ jumping, while still covered.
  Pins engaging/releasing shift layout, so a position measured beforehand can be
  stale by a fraction of a viewport.

`sectionStop()` also emits one interior stop per viewport for sections taller
than the screen, sharing the parent's `section` id.

### The curtain

`components/SectionCurtain.tsx` covers the screen, the page **teleports** while
hidden, then it uncovers.

**Every timeline position must be absolute.** A relative `"+="` offset is
measured from the timeline end, so adding any tween pushes later beats out of
sync with `CURTAIN_TOTAL`; ScrollSnap then unlocks while bands are still on
screen, the next gesture kills the timeline mid-cover, the `onComplete` that
resets visibility never runs, and the page goes black. Beats are derived in
`lib/curtain.ts` — change `CURTAIN`, not the component.

### Motion conventions

- All GSAP work is gated through `gsap.matchMedia()` with the `MEDIA` constants
  from `lib/gsap.ts`. `MEDIA.desktopMotion` is now **only** for pointer-only
  work (hover parallax, magnetic pull) — the snap, curtain and Work deck run at
  every width.
- Plugins are registered once in `lib/gsap.ts`. Import GSAP from there, never
  from `gsap` directly.
- Route `SplitText` `onSplit` reveals through `fromLines()`. `autoSplit`
  re-splits on font load and resize and can fire with zero lines; `gsap.from([])`
  logs `GSAP target not found`.
- `useGSAP` runs on `useLayoutEffect`, so `gsap.set(opacity: 0)` commits before
  first paint. There is no FOUC path — do not add CSS pre-hiding.
- That guarantee covers the paint **after** hydration, not the one before it.
  Anything visible on the server-rendered paint — in practice only `<Loader />`,
  since everything else is behind it — must ship its start state as an **inline
  style** in the markup, or the browser shows the finished state for as long as
  hydration takes. The loader's two marks are `opacity: 0` inline for exactly
  this reason, and the signature is handed back with a `gsap.set` in the layout
  effect. This is an inline attribute, not CSS pre-hiding: no stylesheet rule
  that GSAP then has to fight.
- Reveals that hide elements need an "already past" guard, or a reload with a
  restored scroll position leaves them at `opacity: 0` forever. See
  `directionalReveal` in `lib/direction.ts`.

### CSS

Tailwind v4 — there is no `tailwind.config.js`. Tokens live in the `@theme`
block at the top of `app/globals.css`.

Attribute selectors like `[data-work-track]` have the same specificity as
Tailwind utility classes, so **source order decides**. The base Work rail rules
must stay _above_ the deck's media query or the rail wins and re-enables
horizontal scrolling on the deck.

## Content

Nearly all copy is in `lib/data.ts` — projects, stack groups, process steps,
reach channels, curtain labels, nav and social links. Edit there, not in
components.

`components/sections/Frames.tsx` is complete but **not rendered**. Its data
(`JOURNEY`) and images (`public/journey/`) are intact. Restoring it means
importing it in `app/page.tsx`, adding a nav link, and renumbering Frames → 05
and Contact → 07.

`lib/silhouette.ts` is a generated path, not hand-drawn — produced by a
Moore-neighbour boundary trace over the portrait PNG's alpha channel. Regenerate
only if the asset changes, and do not substitute a per-column top-edge scan: it
cannot see the concave neck/shoulder notch.

## The brand mark

Two generators, run by hand — neither is wired into `npm run build`:

```bash
node scripts/gen-logo.mjs    # font outlines  -> lib/logo.ts
node scripts/gen-brand.mjs   # lib/*.ts       -> public/brand/, app/ favicons
```

`lib/logo.ts` is **generated and overwritten wholesale**: glyph outlines for the
"Lenny Dany" signature, the flourished `L`, and the `DD` stamp, lifted out of
three OFL faces so nothing needs a webfont at runtime and the mark can be
rasterised into a favicon. The TTFs land in `scripts/fonts/` (gitignored).
Attribution is in `public/brand/FONT-LICENSE.txt`.

`lib/brand.ts` is the hand-authored counterpart — the pen path, the flourish,
the tile geometry and the intro beats. Kept **import-free** because
`scripts/gen-brand.mjs` loads it from plain Node, which cannot resolve `@/`.
That is also why it hardcodes the monogram's aspect ratio; the script asserts
the literal still matches `MONOGRAM_SIZE` and throws if a regeneration reshaped
the glyph box.

`<BrandMark />` and the rasteriser build **different markup on purpose** — the
component paints from CSS tokens, a PNG has none — but both take their numbers
from `monogramFit(px)`, so the nav logo and the favicon cannot drift apart. That
function also thickens the mark below 160px: Monsieur La Doulaise's hairlines
are 0.28px at a 32px favicon, which rasterises to a faint smear rather than a
thin line. Measured, 80 units is the width that reads; 120 fills the loops in.

### The intro

`components/Loader.tsx` writes the signature, collapses it into the monogram,
then pushes the camera through the mark. The signature reveal is a **masked**
one: DrawSVG runs on `SIGNATURE_PEN_PATH`, a fat invisible centreline stroked
over the glyph, because drawing a font outline directly traces the letter's
_edge_ rather than a pen. `SIGNATURE_PEN_WIDTH` is measured, not eyeballed —
anything under 640 leaves permanent holes in the finished wordmark.

Every timeline position is absolute, derived in `lib/brand.ts`, for the same
reason the curtain's are. `INTRO_TOTAL` schedules `display: none`.

The page "zooming out" behind the mark is one `scale: 1.06` tween on Hero's
gated `intro` timeline. Do not move it to `<main>`: a transform there becomes
the containing block for every `position: fixed` layer above it — nav, cursor,
curtain — and shifts every ScrollTrigger measurement underneath.

`ScrollSnap` steps only once `isIntroReleased()`. Without that gate a wheel
during the intro runs a full curtain and teleport _underneath_ the panel
(`z-1000` beats the curtain's `z-940`), landing the visitor in About having
never seen the hero. The freeze still applies throughout; only stepping waits.

`releaseIntroSoon()` in `lib/intro.ts` defers the loader's teardown release by a
frame so a StrictMode remount can reclaim the gate. A synchronous release there
opens it ~3s early in dev and the whole hero entrance plays unseen.

## Design constraints

The visual design is final. Do not change colours, layout structure, copy or
typography choices unless explicitly asked — work is scoped to motion,
interaction and responsive behaviour.
