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

## Design constraints

The visual design is final. Do not change colours, layout structure, copy or
typography choices unless explicitly asked — work is scoped to motion,
interaction and responsive behaviour.
