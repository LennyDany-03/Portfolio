'use client'

import { useRef } from 'react'
import { gsap, useGSAP, MEDIA } from '@/lib/gsap'
import { PROJECTS } from '@/lib/data'

export default function Work() {
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const rail = useRef<HTMLSpanElement>(null)
  const counter = useRef<HTMLSpanElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      const total = PROJECTS.length

      /* ------------------------------------------------------------------
         Desktop: real ScrollTrigger pin + scrub.
         The horizontal position is a genuine tween owned by ScrollTrigger —
         no getBoundingClientRect() math in a scroll handler anywhere.
      ------------------------------------------------------------------ */
      mm.add(MEDIA.desktopMotion, () => {
        const trackEl = track.current
        const railEl = rail.current
        const counterEl = counter.current
        if (!trackEl || !railEl || !counterEl) return

        // Measured on refresh only (invalidateOnRefresh re-runs these
        // functions), never inside onUpdate.
        const distance = () => trackEl.scrollWidth - trackEl.clientWidth

        // How much page-scroll the traverse costs, as a multiple of the
        // horizontal travel. 1 would be a literal 1:1 drag; the design calls
        // for a slower, more deliberate pace (~360% of viewport), and deriving
        // it from travel means adding a 6th card scales the pin automatically
        // instead of needing the hard-coded 460vh the mockup used.
        const SCROLL_RATIO = 1.6

        const setRail = gsap.quickSetter(railEl, 'scaleX')
        const skewTo = gsap.quickTo('[data-card]', 'skewX', {
          duration: 0.5,
          ease: 'power3',
        })
        // One reusable delayed call instead of allocating one per frame.
        const settle = gsap.delayedCall(0.15, () => skewTo(0)).pause()

        let lastIndex = -1

        gsap.to(trackEl, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: () => '+=' + distance() * SCROLL_RATIO,
            pin: true,
            anticipatePin: 1,
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              // Rail + counter read ScrollTrigger's own progress — the single
              // source of truth for how far through the track we are.
              setRail(gsap.utils.mapRange(0, 1, 1 / total, 1, self.progress))

              const index = gsap.utils.clamp(
                1,
                total,
                Math.floor(self.progress * total) + 1,
              )
              if (index !== lastIndex) {
                lastIndex = index
                counterEl.textContent =
                  String(index).padStart(2, '0') +
                  ' / ' +
                  String(total).padStart(2, '0')
              }

              // Velocity skew. getVelocity() is ScrollTrigger's cached value,
              // so this costs no layout read.
              skewTo(gsap.utils.clamp(-4, 4, self.getVelocity() / -400))
              settle.restart(true)
            },
          },
        })

        gsap.from('[data-card]', {
          opacity: 0,
          y: 40,
          duration: 0.8,
          stagger: 0.07,
          ease: 'power3.out',
          scrollTrigger: { trigger: root.current, start: 'top 70%', once: true },
        })
      })

      /* ------------------------------------------------------------------
         Below 768px: no pin, no scrub. The track is a native scroll-snap
         rail (see globals.css) and cards just fade up on entry.
      ------------------------------------------------------------------ */
      mm.add(MEDIA.mobileMotion, () => {
        gsap.from('[data-card]', {
          opacity: 0,
          y: 30,
          duration: 0.7,
          stagger: 0.06,
          ease: 'power3.out',
          scrollTrigger: { trigger: root.current, start: 'top 75%', once: true },
        })
      })

      mm.add(MEDIA.reduced, () => {
        gsap.from('[data-card]', {
          opacity: 0,
          duration: 0.2,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top 75%', once: true },
        })
      })
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      id="work"
      className="border-hair relative border-t"
      aria-label="Selected work"
    >
      <div
        data-work-stage
        className="flex flex-col justify-center gap-10 py-24 md:gap-0 md:py-0"
      >
        <header className="mx-auto flex w-full max-w-[1240px] flex-col gap-4 px-5 md:px-10 md:pt-[130px] md:pb-10 lg:px-[60px]">
          <p className="text-accent font-mono text-[11px] tracking-[0.22em]">
            02 / SELECTED WORK
          </p>
          <h2 className="text-hi font-display m-0 text-[clamp(30px,4.4vw,68px)] leading-[0.98] font-semibold tracking-[-0.04em]">
            Things that are
            <br />
            running right now.
          </h2>
        </header>

        <div
          ref={track}
          data-work-track
          className="no-scrollbar flex gap-5 px-5 pb-2 md:gap-[30px] md:px-10 md:pb-0 lg:px-[60px]"
        >
          {PROJECTS.map((project) => (
            <article
              key={project.title}
              data-card
              className="border-hair-2 bg-panel grid min-h-[420px] w-[85vw] shrink-0 grid-rows-[auto_1fr_auto] gap-6 border p-7 sm:w-[70vw] md:min-h-[460px] md:w-[520px] md:gap-[26px] md:p-[38px]"
            >
              <div className="text-dim flex items-center justify-between font-mono text-[10px] tracking-[0.18em]">
                <span className="text-accent">{project.index}</span>
                <span>{project.meta}</span>
              </div>

              <div className="grid content-start gap-4">
                <h3 className="text-hi font-display m-0 text-[36px] font-semibold tracking-[-0.03em] md:text-[44px]">
                  {project.title}
                </h3>
                <p className="text-muted-2 m-0 text-[16px] leading-[1.6] md:text-[17px]">
                  {project.summary}
                </p>
                <p className="text-dim m-0 font-mono text-[11px] leading-[1.8]">
                  {project.detail}
                </p>
              </div>

              <div className="grid gap-5">
                <ul className="flex flex-wrap gap-2">
                  {project.stack.map((tech) => (
                    <li
                      key={tech}
                      className="text-muted border-hair-3 border px-2.5 py-1.5 font-mono text-[10px] tracking-[0.1em]"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>

                <div className="flex gap-5 font-mono text-[11px] tracking-[0.14em] uppercase">
                  {project.links.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className={
                        link.primary
                          ? 'text-accent hover:text-accent-soft transition-colors'
                          : 'text-dim hover:text-body transition-colors'
                      }
                    >
                      {link.label} <span aria-hidden>↗</span>
                    </a>
                  ))}
                  {project.note && (
                    <span className="text-dim-2">{project.note}</span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mx-auto flex w-full max-w-[1240px] items-center gap-5 px-5 md:px-10 md:pt-12 lg:px-[60px]">
          <span
            ref={counter}
            className="text-dim font-mono text-[11px] tracking-[0.18em] tabular-nums"
          >
            01 / {String(PROJECTS.length).padStart(2, '0')}
          </span>
          <div
            aria-hidden
            className="relative h-px flex-1 bg-[rgb(255_255_255_/_0.1)]"
          >
            <span
              ref={rail}
              className="bg-accent absolute inset-0 block origin-left"
              style={{ transform: 'scaleX(0.2)' }}
            />
          </div>
          <span className="text-dim-2 font-mono text-[10px] tracking-[0.18em] md:hidden">
            SWIPE →
          </span>
        </div>
      </div>
    </section>
  )
}
