'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '@/lib/gsap'

/**
 * Lenis <-> ScrollTrigger sync.
 *
 * The two failure modes this avoids:
 *  1. Driving lenis.raf() from its own requestAnimationFrame while GSAP runs a
 *     second rAF loop. Two loops = two clocks = the classic pin/scrub jitter.
 *     Everything here runs on gsap.ticker, one clock.
 *  2. Letting ScrollTrigger poll scroll position itself. Instead Lenis pushes
 *     ScrollTrigger.update on every scroll event, so they can never disagree.
 */
export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Reduced motion: skip JS smoothing entirely and let the OS-native scroll
    // do its job. ScrollTrigger still works fine on native scroll.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({
      lerp: 0.09, // per the design spec
      smoothWheel: true,
      anchors: true, // nav #hash links glide instead of jumping
      autoRaf: false, // explicit: gsap.ticker owns the loop, nothing else
    })

    lenis.on('scroll', ScrollTrigger.update)

    const raf = (time: number) => {
      // gsap.ticker reports seconds, Lenis expects milliseconds.
      lenis.raf(time * 1000)
    }

    gsap.ticker.add(raf)
    // Lag smoothing would let GSAP "skip" time after a long frame, which
    // desyncs the scroll position from the animation. Off while Lenis drives.
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(raf)
      gsap.ticker.lagSmoothing(500, 33) // restore GSAP's default
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
