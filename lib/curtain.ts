"use client";

/**
 * Channel between <ScrollSnap /> (which decides WHEN to move) and
 * <SectionCurtain /> (which owns the transition animation).
 *
 * A module channel rather than props or context because the two live in
 * different branches of the layout tree, and ScrollSnap runs inside a
 * gsap.matchMedia callback where React state is not available.
 */

/** dir: 1 = travelling down the page, -1 = travelling up. */
export type CurtainRunner = (dir: 1 | -1, onCovered: () => void) => void;

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
export function runCurtain(dir: 1 | -1, onCovered: () => void): boolean {
  if (!runner) return false;
  runner(dir, onCovered);
  return true;
}

/** Beat layout, shared so ScrollSnap can time its lock to the same clock. */
export const CURTAIN = {
  /** Sweep in — screen is fully covered at the end of this. */
  in: 0.42,
  /** Gap between layers. */
  stagger: 0.05,
  /** Hold at full cover before sweeping out. */
  hold: 0.1,
  /** Sweep out. */
  out: 0.52,
} as const;

/**
 * Total wall time of one transition.
 *
 * Both sweeps carry the stagger (three layers, so the last one finishes two
 * gaps after the first), hence stagger * 4 rather than * 2 — undercounting
 * here would release the input lock while bands were still on screen.
 */
export const CURTAIN_TOTAL =
  CURTAIN.in + CURTAIN.hold + CURTAIN.out + CURTAIN.stagger * 4;
