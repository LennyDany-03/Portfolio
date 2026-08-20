'use client'

import { useRef } from 'react'
import { gsap, useGSAP, ScrollTrigger, MEDIA } from '@/lib/gsap'
import {
  MARQUEE_ROW_A,
  MARQUEE_ROW_B,
  MARQUEE_ACCENT,
  MARQUEE_BRIGHT,
  STACK_GRID,
} from '@/lib/data'

function MarqueeRow({
  words,
  innerRef,
}: {
  words: string[]
  innerRef: React.RefObject<HTMLDivElement | null>
}) {
  // Rendered twice so translating by -50% lands on an identical frame.
  const doubled = [...words, ...words]

  return (
    <div className="marquee-mask overflow-hidden" aria-hidden>
      <div
        ref={innerRef}
        className="font-display flex w-max gap-10 text-[32px] tracking-[-0.03em] whitespace-nowrap will-change-transform md:gap-[60px] md:text-[46px]"
      >
        {doubled.map((word, i) => (
          <span
            key={word + i}
            className={
              MARQUEE_ACCENT.has(word)
                ? 'text-accent'
                : MARQUEE_BRIGHT.has(word)
                  ? 'text-hi'
                  : 'text-ghost'
            }
          >
            {word}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Stack() {
  const root = useRef<HTMLElement>(null)
  const rowA = useRef<HTMLDivElement>(null)
  const rowB = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(MEDIA.motionOK, () => {
        /* ---------------- Marquees ---------------- */
        // Two opposed infinite loops. xPercent -50 across a doubled list is a
        // seamless wrap with zero JS per frame beyond GSAP's own tween.
        const loopA = gsap.to(rowA.current, {
          xPercent: -50,
          duration: 34,
          ease: 'none',
          repeat: -1,
        })

        const loopB = gsap.fromTo(
          rowB.current,
          { xPercent: -50 },
          { xPercent: 0, duration: 44, ease: 'none', repeat: -1 },
        )

        const loops = [loopA, loopB]
        const settle = gsap.delayedCall(0.3, () => {
          gsap.to(loops, { timeScale: 1, duration: 0.6, overwrite: true })
        }).pause()

        ScrollTrigger.create({
          trigger: root.current,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: (self) => {
            // Scroll velocity modulates marquee speed by up to +/-40%.
            const boost = gsap.utils.clamp(
              0.6,
              1.4,
              1 + Math.abs(self.getVelocity()) / 4000,
            )
            gsap.to(loops, { timeScale: boost, duration: 0.3, overwrite: true })
            settle.restart(true)
          },
        })

        /* ---------------- Grid ---------------- */
        // ScrollTrigger.batch groups whatever enters in the same frame into ONE
        // staggered tween, instead of one observer + one tween per cell.
        const cells = gsap.utils.toArray<HTMLElement>('[data-stack-cell]')
        gsap.set(cells, { opacity: 0, y: 26 })

        ScrollTrigger.batch(cells, {
          start: 'top 88%',
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease: 'power3.out',
              stagger: 0.04,
              overwrite: true,
            }),
        })

        gsap.from('[data-stack-title]', {
          opacity: 0,
          y: 30,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: root.current, start: 'top 70%', once: true },
        })
      })

      mm.add(MEDIA.reduced, () => {
        // No marquee motion at all; grid gets the flat 200ms fade.
        const cells = gsap.utils.toArray<HTMLElement>('[data-stack-cell]')
        gsap.set(cells, { opacity: 0 })
        ScrollTrigger.batch(cells, {
          start: 'top 90%',
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, { opacity: 1, duration: 0.2, ease: 'none' }),
        })
      })
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      id="stack"
      className="border-hair relative overflow-hidden border-t py-24 md:py-[180px]"
    >
      <div className="mx-auto mb-16 grid max-w-[1240px] gap-10 px-5 md:mb-20 md:px-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-20 lg:px-[60px]">
        <p className="text-accent font-mono text-[11px] tracking-[0.22em]">
          03 / STACK
        </p>
        <h2
          data-stack-title
          className="text-hi font-display m-0 text-[clamp(30px,4.4vw,68px)] leading-[0.98] font-semibold tracking-[-0.04em]"
        >
          Whatever the
          <br />
          problem needs.
        </h2>
      </div>

      {/* Second row is hidden on mobile per the design spec. */}
      <div className="mb-16 grid gap-4 md:mb-[90px]">
        <MarqueeRow words={MARQUEE_ROW_A} innerRef={rowA} />
        <div className="hidden md:block">
          <MarqueeRow words={MARQUEE_ROW_B} innerRef={rowB} />
        </div>
      </div>

      <dl className="bg-hair-2 mx-auto grid max-w-[1240px] grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-3">
        {STACK_GRID.map((group) => (
          <div
            key={group.label}
            data-stack-cell
            className="bg-ink grid gap-3.5 px-6 py-8 md:px-[30px] md:py-[34px]"
          >
            <dt className="text-accent font-mono text-[10px] tracking-[0.2em]">
              {group.label}
            </dt>
            <dd className="text-muted m-0 text-[15px] leading-[1.85] md:text-base">
              {group.items}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
