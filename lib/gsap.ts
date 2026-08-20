'use client'

import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'

/**
 * Single registration point. Every animated component imports gsap from here so
 * plugins are guaranteed registered exactly once, in one place.
 *
 * Registering `useGSAP` as a plugin is GSAP's recommended React integration step.
 */
gsap.registerPlugin(
  useGSAP,
  ScrollTrigger,
  SplitText,
  DrawSVGPlugin,
  ScrambleTextPlugin,
)

/**
 * Every animation in the app is gated through gsap.matchMedia() using these
 * queries. Reduced-motion and the mobile breakpoint are therefore handled
 * declaratively — matchMedia reverts a context automatically when its condition
 * stops matching, so there is no manual teardown anywhere.
 */
export const MEDIA = {
  /** Full motion, any viewport. */
  motionOK: '(prefers-reduced-motion: no-preference)',
  /** User asked for less motion — reveals collapse to a 200ms opacity fade. */
  reduced: '(prefers-reduced-motion: reduce)',
  /** Pin/scrub work is desktop-only; mobile Safari handles it badly. */
  desktopMotion: '(min-width: 768px) and (prefers-reduced-motion: no-preference)',
  /** Below the pin breakpoint, but motion still allowed. */
  mobileMotion: '(max-width: 767px) and (prefers-reduced-motion: no-preference)',
} as const

/** The reduced-motion substitute for every reveal in the app. */
export const FADE_IN = { opacity: 1, duration: 0.2, ease: 'none' } as const

export {
  gsap,
  useGSAP,
  ScrollTrigger,
  SplitText,
  DrawSVGPlugin,
  ScrambleTextPlugin,
}
