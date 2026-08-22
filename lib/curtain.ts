"use client";

/**
 * Channel between <ScrollSnap /> (which decides WHEN to move) and
 * <SectionCurtain /> (which owns the transition animation).
 *
 * A module channel rather than props or context because the two live in
 * different branches of the layout tree, and ScrollSnap runs inside a
 * gsap.matchMedia callback where React state is not available.
 */

/** Preview text shown on the curtain while the screen is covered. */
export type CurtainLabel = { eyebrow?: string; title?: string };

/** dir: 1 = travelling down the page, -1 = travelling up. */
export type CurtainRunner = (
  dir: 1 | -1,
  onCovered: () => void,
  label?: CurtainLabel,
) => void;

let runner: CurtainRunner | null = null;

export const setCurtainRunner = (next: CurtainRunner | null) => {
  runner = next;
};

/**
 * Run the transition, calling `onCovered` at the instant the screen is fully
 * hidden — that is when the caller should jump the scroll position.
 *
 * Returns false if no curtain is mounted (reduced motion), so the caller can
 * fall back to simply animating the scroll instead of teleporting the page.
 */
export function runCurtain(
  dir: 1 | -1,
  onCovered: () => void,
  label?: CurtainLabel,
): boolean {
  if (!runner) return false;
  runner(dir, onCovered, label);
  return true;
}

/**
 * Beat layout. Every number is an ABSOLUTE offset on the curtain timeline —
 * no relative ("+=") positions anywhere, because a relative offset is measured
 * from the timeline END, so adding any tween silently pushes later beats out
 * of sync with CURTAIN_TOTAL.
 */
export const CURTAIN = {
  /** Sweep in. */
  in: 0.38,
  /** Gap between the three layers. */
  stagger: 0.045,
  /**
   * Hold at full cover. This is the ONLY window the preview title exists in,
   * so it has to fit a fade in, a readable beat, and a fade out. At the old
   * 0.1s it did not: the two opacity tweens overlapped, the fade-in outlived
   * the fade-out and drove the label back to full opacity, and it hung over
   * the live page while the bands swept away.
   */
  hold: 0.55,
  /** Sweep out. */
  out: 0.45,
} as const;

/** The instant the screen is fully hidden (first layer landed). */
export const CURTAIN_COVER = CURTAIN.in;

/** When the sweep-out begins: last layer in, plus the hold. */
export const CURTAIN_OUT_AT = CURTAIN.in + CURTAIN.stagger * 2 + CURTAIN.hold;

/** Total wall time, last layer fully gone. */
export const CURTAIN_TOTAL = CURTAIN_OUT_AT + CURTAIN.out + CURTAIN.stagger * 2;

/**
 * Preview label beats, derived so they CANNOT overlap each other and both sit
 * strictly inside the covered window. Kept here rather than in the component
 * so the no-overlap guarantee lives next to the numbers it depends on.
 */
export const LABEL = {
  inAt: CURTAIN_COVER - 0.04,
  inFor: 0.3,
  outFor: 0.2,
} as const;

/** Fade-out starts only once the fade-in has fully finished. */
export const LABEL_OUT_AT = CURTAIN_OUT_AT - LABEL.outFor;
