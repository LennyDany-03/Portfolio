# LDD — Lenny Dany Derek D.

Personal portfolio. A dark, editorial single-page site where scrolling is a
**deck of slides** rather than a continuous document: one gesture moves one
beat, and section changes are hidden behind a curved full-screen wipe.

**Live:** [lennydany.vercel.app](https://lennydany.vercel.app)

---

## Stack

|               |                                                                             |
| ------------- | --------------------------------------------------------------------------- |
| Framework     | Next.js 16.3.1 (App Router)                                                 |
| UI            | React 19.2.8, TypeScript 5                                                  |
| Styling       | Tailwind CSS v4 (CSS-native `@theme`, no `tailwind.config.js`)              |
| Motion        | GSAP 3.15 + `@gsap/react` — ScrollTrigger, Observer, SplitText, DrawSVG     |
| Smooth scroll | Lenis 1.3.26                                                                |
| Fonts         | `next/font` — Space Grotesk (display), IBM Plex Sans (body), JetBrains Mono |

One animation engine, deliberately. Everything runs on a single GSAP ticker so
timelines can't fight each other.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

| Script          |                            |
| --------------- | -------------------------- |
| `npm run dev`   | dev server (Turbopack)     |
| `npm run build` | production build           |
| `npm start`     | serve the production build |
| `npm run lint`  | ESLint                     |

Type-check with `npx tsc --noEmit` — it is not part of `lint`.

Requires Node 20+ (developed on 24).

---

## How the page works

The unusual part of this codebase is the scroll system. Read this before
touching anything in `lib/`.

### The page is locked

`components/ScrollSnap.tsx` takes over scrolling entirely. The lock is **two
things**, and it does not work with only one of them:

1. A GSAP `Observer` with `preventDefault: true`, cancelling native wheel/touch.
2. **Lenis is stopped.** Lenis drives scroll from its own wheel handling and
   does not care that the native default was cancelled — leaving it running is
   why the page still scrolled freely. Every programmatic move therefore passes
   `force`, which is Lenis's "scroll even though you are stopped".

`touch-action: pinch-zoom` backs this up on touch, where `preventDefault` alone
is unreliable once a browser has committed to a pan. `pinch-zoom` rather than
`none`, so zoom still works.

Three escape hatches stay open on purpose: keyboard (`PageDown`/`Home`/`End`),
dragging the native scrollbar, and two failsafes that thaw Lenis and hand
scrolling back — if no stops are registered, or if the lock outlives a
transition 3× over. With a hard lock, one bug means a page nobody can scroll.

### Stops

Sections don't hard-code their scroll positions. Each registers a provider with
`lib/snap.ts`, and `ScrollSnap` re-collects them **on every gesture**:

- A plain section emits one stop at its top, **plus one per viewport** if it is
  taller than the screen. Without those, a tall section is only ever seen from
  its top — Process is ~1.6 viewports, so step 04 sat permanently below the fold.
- **Work emits one stop per card**, taken from its own pinned ScrollTrigger, so
  a gesture inside Work advances the deck rather than skipping the section.

Every stop carries a **`section` id** and a live **`measure()`**:

- `section` decides the curtain. It plays when a step **crosses sections**,
  never because of a particular target. A per-stop boolean could not express
  this: Crest is both the Work section's entry _and_ card 01 of the deck, so
  flagging it meant scrolling up from Bloom fired a full wipe to move one card.
- `measure()` is called again one frame **after** jumping. Engaging or releasing
  a pin changes layout, so a position measured beforehand can be stale by a
  fraction of a viewport. The correction happens while the screen is still
  covered, so it is invisible — and it self-corrects for any layout shift, not
  just the ones anyone predicted.

### The curtain

`components/SectionCurtain.tsx` — three full-viewport panels, each capped top
and bottom with a shallow arc so the leading edge is a curve. They sweep in,
cover, hold, then sweep out the far side. **The page teleports while covered**,
which is what makes it read as one slide replacing another rather than a fast
scroll past everything between. The jump also crosses every reveal trigger at
once, so the incoming section animates in exactly as the bands clear.

A preview title (`NEXT_LABELS` in `lib/data.ts`) shows during the covered beat.

**Every position on that timeline is absolute.** A relative (`"+="`) offset is
measured from the timeline _end_, so adding any tween silently pushes later
beats out of sync with `CURTAIN_TOTAL` — ScrollSnap then unlocks while bands are
still on screen, the next gesture kills the timeline mid-cover, the `onComplete`
that resets visibility never runs, and the whole page goes black.

### Everything else

| File                   |                                                         |
| ---------------------- | ------------------------------------------------------- |
| `lib/gsap.ts`          | single plugin registration + `MEDIA` matchMedia queries |
| `lib/direction.ts`     | one shared Observer feeding direction-aware reveals     |
| `lib/intro.ts`         | holds the hero entrance until the loader hands off      |
| `lib/lenis.ts`         | freeze/thaw + `scrollToY`                               |
| `lib/silhouette.ts`    | traced portrait contour (see below)                     |
| `hooks/useMagnetic.ts` | magnetic pull, `quickTo`-based                          |

Every animation is gated through `gsap.matchMedia()`, so reduced-motion
teardown is automatic. `useGSAP` runs on `useLayoutEffect`, so any
`gsap.set(opacity: 0)` commits before first paint — there is no FOUC path, and
text stays visible if JS is slow.

---

## Section order

```
Hero → 01 About → 02 Selected Work → 03 Stack → 04 Process → 05 Reach Me → 06 Contact
```

`components/sections/Frames.tsx` is built but **not rendered**. It is a photo
collage with a lightbox; the component, its `JOURNEY` data and the images in
`public/journey/` are all intact. To restore it, import it in `app/page.tsx`,
add a nav link, and renumber Frames → 05 / Contact → 07.

## Content

Nearly all copy lives in **`lib/data.ts`** — projects, stack groups, process
steps, reach channels, curtain labels, nav and social links. Edit there, not in
components.

Some strings are **written for you rather than by you** and are worth reviewing:
the `04 / PROCESS` step bodies, the `05 / REACH ME` intro and its "best for"
lines, and the Frames captions. They are grounded in facts already on the site,
but they are not your words.

## The portrait outline

`lib/silhouette.ts` is a traced contour of `public/lenny-nobackground.png` —
left shoulder, up the neck, around the jaw and hair, down the right shoulder.

It is **not hand-drawn**. It was generated by decoding the PNG's alpha channel
and running a Moore-neighbour boundary trace over the binarised mask, then
simplifying with Douglas-Peucker and fitting Catmull-Rom beziers with clamped
handles. Verified fit: **mean 0.55px, max 3.30px** against the true boundary on
a 500px source.

Regenerate it only if the portrait asset changes — a "topmost opaque pixel per
column" scan will not do, because it structurally cannot see the concave notch
where the neck meets the shoulder.

## Tuning

| What                   | Where                                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------ |
| Transition timing      | `CURTAIN` in `lib/curtain.ts` — `hold` is how long the preview title is readable; everything else re-derives |
| Non-curtain step speed | `PLAIN_STEP` in `components/ScrollSnap.tsx`                                                                  |
| Deck card transition   | `deckState()` in `components/sections/Work.tsx`                                                              |
| Colours / fonts        | `@theme` block at the top of `app/globals.css`                                                               |

## Responsive

The snap, curtain and Work deck run at **every width**. The Work deck had to go
universal: ScrollSnap captures touch, so the old mobile horizontal scroll-snap
rail would never have received a swipe. `MEDIA.desktopMotion` is now only for
genuinely pointer-only work — hover parallax and magnetic pull.

Under `prefers-reduced-motion: reduce` the whole system disengages: no lock, no
curtain, no deck. The page becomes an ordinary scrolling document and Work falls
back to a CSS-only horizontal rail.

## Known gaps

- **`public/images/` is ~13MB of unused originals** — the curated copies live in
  `public/journey/` (~3MB). They will deploy as-is unless removed.
- Slicing sections into viewport chunks still cuts content at arbitrary places
  on small screens, because that content was not designed in viewport-sized
  units. The proper mobile fix is different behaviour — curtain between
  sections, free native scrolling within one.
- One project (`Bloom`) still carries placeholder copy in `lib/data.ts`.

## Deployment

Vercel, from `main`. `metadataBase` in `app/layout.tsx` points at the production
URL and must be updated if the domain changes.

## Notes

`AGENTS.md` is generated and re-added by `next dev` — do not delete it, commit
it with your changes to keep the tree clean. `CLAUDE.md` references it.
