'use client'

import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'

/**
 * Custom cursor ring. Pure transform/opacity, driven by quickTo so pointermove
 * never allocates a tween. Disabled outright on touch devices and under
 * reduced-motion — matchMedia tears the whole thing down and restores the
 * native cursor automatically.
 */
export default function Cursor() {
  const ring = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const el = ring.current
    if (!el) return

    const mm = gsap.matchMedia()

    mm.add(
      '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
      () => {
        document.body.dataset.customCursor = 'true'

        gsap.set(el, { xPercent: -50, yPercent: -50, opacity: 0 })

        const xTo = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3' })
        const yTo = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3' })

        let seen = false
        const onMove = (event: PointerEvent) => {
          if (!seen) {
            seen = true
            gsap.set(el, { x: event.clientX, y: event.clientY })
            gsap.to(el, { opacity: 1, duration: 0.3 })
          }
          xTo(event.clientX)
          yTo(event.clientY)
        }

        // Delegated hover detection: one listener, not one per element.
        const isInteractive = (target: EventTarget | null) =>
          target instanceof Element &&
          target.closest('a, button, [data-cursor-grow]')

        const onOver = (event: PointerEvent) => {
          if (!isInteractive(event.target)) return
          gsap.to(el, {
            scale: 3,
            backgroundColor: 'rgb(255 70 85 / 0.15)',
            borderColor: 'rgb(255 70 85 / 0)',
            duration: 0.35,
            ease: 'power3.out',
          })
        }

        const onOut = (event: PointerEvent) => {
          if (!isInteractive(event.target)) return
          gsap.to(el, {
            scale: 1,
            backgroundColor: 'rgb(255 70 85 / 0)',
            borderColor: 'rgb(255 70 85 / 1)',
            duration: 0.35,
            ease: 'power3.out',
          })
        }

        window.addEventListener('pointermove', onMove, { passive: true })
        document.addEventListener('pointerover', onOver)
        document.addEventListener('pointerout', onOut)

        return () => {
          window.removeEventListener('pointermove', onMove)
          document.removeEventListener('pointerover', onOver)
          document.removeEventListener('pointerout', onOut)
          delete document.body.dataset.customCursor
        }
      },
    )
  })

  return (
    <div
      ref={ring}
      aria-hidden
      className="border-accent pointer-events-none fixed top-0 left-0 z-[950] h-6 w-6 rounded-full border opacity-0 will-change-transform"
    />
  )
}
