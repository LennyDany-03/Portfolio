'use client'

import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'

export type MagneticOptions = {
  /** Max px the element travels toward the cursor. */
  strength?: number
  /** Px radius at which the pull starts. */
  radius?: number
}

/** Real pointers only, and only if the user welcomes motion. */
const MAGNETIC_MEDIA =
  '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)'

/**
 * Imperative core of the magnetic effect. Returns its own teardown.
 *
 * Exported separately from the hook because hooks can't be called inside a
 * .map() — Nav needs to attach this across a rendered list of links, so it
 * calls this directly over a queried NodeList instead.
 *
 * quickTo() creates ONE reusable tween and just re-targets its end value, so a
 * pointermove burst costs a number assignment instead of allocating a fresh
 * tween per event (what a naive style.transform mousemove handler does).
 *
 * The element's rect is cached and only re-read when the page has actually
 * scrolled or resized, so moving the pointer over a static page performs zero
 * layout reads.
 */
export function createMagnetic(
  el: HTMLElement,
  { strength = 14, radius = 120 }: MagneticOptions = {},
): () => void {
  const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3' })
  const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' })

  let rect = el.getBoundingClientRect()
  let stale = false
  const markStale = () => {
    stale = true
  }

  const onMove = (event: PointerEvent) => {
    if (stale) {
      rect = el.getBoundingClientRect()
      stale = false
    }

    const dx = event.clientX - (rect.left + rect.width / 2)
    const dy = event.clientY - (rect.top + rect.height / 2)
    const distance = Math.hypot(dx, dy) || 1

    if (distance < radius) {
      const pull = (1 - distance / radius) * strength
      xTo((dx / distance) * pull)
      yTo((dy / distance) * pull)
    } else {
      xTo(0)
      yTo(0)
    }
  }

  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('scroll', markStale, { passive: true })
  window.addEventListener('resize', markStale)

  return () => {
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('scroll', markStale)
    window.removeEventListener('resize', markStale)
  }
}

/**
 * Ref-based wrapper around createMagnetic for single elements (Hero CTA,
 * Contact email). matchMedia handles the teardown on query change.
 */
export function useMagnetic<T extends HTMLElement>(
  options: MagneticOptions = {},
) {
  const ref = useRef<T>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return

      const mm = gsap.matchMedia()
      mm.add(MAGNETIC_MEDIA, () => createMagnetic(el, options))
    },
    { scope: ref },
  )

  return ref
}

export { MAGNETIC_MEDIA }
