"use client";

import type Lenis from "lenis";

/**
 * Handle on the page's Lenis instance, so overlays and <ScrollSnap /> can stop
 * the page moving under them.
 *
 * Stopping Lenis is the only correct freeze. Setting overflow:hidden on <body>
 * is not enough on its own — Lenis keeps its own virtual scroll position and
 * would drift while frozen, then snap when released.
 */
let instance: Lenis | null = null;

/**
 * Whether ScrollSnap wants the page frozen, tracked SEPARATELY from the
 * instance.
 *
 * Ordering bites here: ScrollSnap freezes from a layout effect, while
 * SmoothScroll creates Lenis in a passive effect — and React runs every layout
 * effect before any passive one. So the first freezeScroll() lands while
 * `instance` is still null and would silently do nothing, leaving the page
 * scrollable exactly as if the lock had never been written. Remembering the
 * intent and applying it in setLenis() closes that window.
 */
let frozen = false;

export const setLenis = (next: Lenis | null) => {
  instance = next;
  if (next && frozen) next.stop();
};

/** Modal freeze (FRAMES lightbox): also hides the native scrollbar. */
export function lockScroll() {
  instance?.stop();
  document.body.style.overflow = "hidden";
}

export function unlockScroll() {
  document.body.style.overflow = "";
  // Never resume a page ScrollSnap is deliberately holding frozen — closing an
  // overlay must not hand free scrolling back by accident.
  if (!frozen) instance?.start();
}

/**
 * Freeze the page for <ScrollSnap />.
 *
 * This is THE page lock. Observer.preventDefault() alone is not enough: Lenis
 * drives scroll from its own wheel handling and does not care that the native
 * default was cancelled, so leaving it running let the page keep scrolling
 * freely between sections.
 */
export function freezeScroll() {
  frozen = true;
  instance?.stop();
}

export function thawScroll() {
  frozen = false;
  instance?.start();
}

/**
 * Programmatic scroll that goes THROUGH Lenis rather than around it.
 *
 * window.scrollTo (or GSAP's ScrollToPlugin) sets native scroll directly, which
 * Lenis fights on its next tick because its own virtual target has not moved.
 * Handing the target to Lenis keeps one authority over scroll position.
 *
 * `force` is required whenever the page is frozen — without it Lenis ignores
 * the request outright, which would leave the curtain sweeping over a page that
 * never actually moved.
 */
export function scrollToY(y: number, duration = 0.5, force = false) {
  if (!instance) {
    window.scrollTo({ top: y, behavior: "auto" });
    return;
  }

  // duration 0 must mean "be there on the next frame". { duration: 0 } is not
  // enough — Lenis treats a falsy duration as unset and falls back to its
  // default easing, leaving the page visibly sliding after the curtain has
  // already lifted. `immediate` is the explicit teleport.
  if (duration <= 0) {
    instance.scrollTo(y, { immediate: true, force });
  } else {
    instance.scrollTo(y, { duration, force });
  }
}
