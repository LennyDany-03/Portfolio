'use client'

import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { NAV_LINKS } from '@/lib/data'

export default function Nav() {
  const root = useRef<HTMLElement>(null)
  const bar = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      // The progress bar is scaleX, not width — width triggers layout on every
      // scroll frame, scaleX is composited on the GPU.
      mm.add('all', () => {
        gsap.fromTo(
          bar.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: { start: 0, end: 'max', scrub: 0.25 },
          },
        )
      })

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from(root.current, {
          yPercent: -100,
          duration: 0.9,
          ease: 'expo.out',
          delay: 0.15,
        })
      })
    },
    { scope: root },
  )

  return (
    <header
      ref={root}
      className="fixed inset-x-0 top-0 z-[800] flex items-center justify-between gap-4 px-5 py-4 backdrop-blur-md md:px-10 md:py-[22px]"
      style={{
        background:
          'linear-gradient(180deg, rgb(10 10 12 / 0.92), rgb(10 10 12 / 0))',
      }}
    >
      <a
        href="#top"
        className="text-body flex items-center gap-3 font-mono text-xs tracking-[0.16em]"
      >
        <span
          aria-hidden
          className="bg-accent block h-2 w-2 rounded-full shadow-[0_0_12px_var(--color-accent)]"
        />
        LDD
      </a>

      <nav
        aria-label="Primary"
        className="hidden gap-8 font-mono text-[11px] tracking-[0.18em] uppercase md:flex"
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="text-dim hover:text-body transition-colors duration-300"
          >
            {link.label}
          </a>
        ))}
      </nav>

      <span className="text-dim font-mono text-[10px] tracking-[0.14em] md:text-[11px]">
        CHENNAI, IN
      </span>

      <div
        ref={bar}
        aria-hidden
        className="bg-accent absolute inset-x-0 bottom-0 h-px origin-left shadow-[0_0_10px_var(--color-accent)]"
      />
    </header>
  )
}
