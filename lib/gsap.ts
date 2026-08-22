"use client";

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Observer } from "gsap/Observer";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

/**
 * Single registration point. Every animated component imports gsap from here so
 * plugins are guaranteed registered exactly once, in one place.
 *
 * Registering `useGSAP` as a plugin is GSAP's recommended React integration step.
 */
gsap.registerPlugin(useGSAP, ScrollTrigger, Observer, SplitText, DrawSVGPlugin);

/**
 * On mobile, showing/hiding the URL bar fires a resize. Without this, every one
 * of those fires a full ScrollTrigger.refresh(), which re-measures the pinned
 * 100svh Work stage mid-scroll and visibly jolts it. ScrollTrigger already
 * debounces genuine resizes internally, so this is the only resize handling the
 * app needs — a hand-rolled debounced refresh would be redundant.
 */
ScrollTrigger.config({ ignoreMobileResize: true });

/**
 * Every animation in the app is gated through gsap.matchMedia() using these
 * queries. Reduced-motion and the mobile breakpoint are therefore handled
 * declaratively — matchMedia reverts a context automatically when its condition
 * stops matching, so there is no manual teardown anywhere.
 */
export const MEDIA = {
  /** Full motion, any viewport. */
  motionOK: "(prefers-reduced-motion: no-preference)",
  /** User asked for less motion — reveals collapse to a 200ms opacity fade. */
  reduced: "(prefers-reduced-motion: reduce)",
  /**
   * Genuinely pointer-only work: hover parallax, magnetic pull. NOT a general
   * "desktop features" gate any more — the snap, the curtain and the Work deck
   * all run at every width now.
   */
  desktopMotion:
    "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
  /** The touch-side counterpart to desktopMotion. */
  mobileMotion:
    "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
} as const;

/** The reduced-motion substitute for every reveal in the app. */
export const FADE_IN = { opacity: 1, duration: 0.2, ease: "none" } as const;

/**
 * gsap.from() that no-ops on an empty target list.
 *
 * SplitText's autoSplit reverts and re-splits whenever a webfont lands or the
 * box is resized, and onSplit can fire with zero lines mid-cycle. gsap.from([])
 * logs "GSAP target  not found" once per occurrence — pure console noise that
 * looks like a real failure. Every onSplit reveal in the app goes through here.
 */
export function fromLines(lines: Element[], vars: gsap.TweenVars) {
  return lines.length ? gsap.from(lines, vars) : undefined;
}

export { gsap, useGSAP, ScrollTrigger, Observer, SplitText, DrawSVGPlugin };
