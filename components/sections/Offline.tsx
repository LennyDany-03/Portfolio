'use client'

import { useRef } from 'react'
import { gsap, useGSAP, SplitText, MEDIA } from '@/lib/gsap'

export default function Offline() {
  const root = useRef<HTMLElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const reel = useRef<HTMLDivElement>(null)
  const bloom = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(MEDIA.motionOK, () => {
        // Headline reveals line by line as it enters, same masked-line
        // technique as the hero but scroll-triggered instead of on load.
        SplitText.create(heading.current, {
          type: 'lines',
          mask: 'lines',
          autoSplit: true,
          aria: 'auto',
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 110,
              duration: 1,
              stagger: 0.09,
              ease: 'expo.out',
              scrollTrigger: {
                trigger: heading.current,
                start: 'top 80%',
                once: true,
              },
            }),
        })

        gsap.from('[data-offline-copy]', {
          opacity: 0,
          y: 28,
          duration: 0.9,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: root.current, start: 'top 65%', once: true },
        })
      })

      /* Reel drifts against the copy — 1.18x vs 1.0x — with the bloom layer
         lagging at 0.6x to build depth. Desktop only. */
      mm.add(MEDIA.desktopMotion, () => {
        gsap.fromTo(
          reel.current,
          { y: 60 },
          {
            y: -60,
            ease: 'none',
            scrollTrigger: {
              trigger: root.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        )

        gsap.fromTo(
          bloom.current,
          { y: -40 },
          {
            y: 80,
            ease: 'none',
            scrollTrigger: {
              trigger: root.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        )
      })

      mm.add(MEDIA.reduced, () => {
        gsap.from([heading.current, '[data-offline-copy]'], {
          opacity: 0,
          duration: 0.2,
          ease: 'none',
          stagger: 0.04,
          scrollTrigger: { trigger: root.current, start: 'top 75%', once: true },
        })
      })
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      id="offline"
      className="border-hair relative overflow-hidden border-t px-5 py-24 md:px-10 md:py-[170px] lg:px-[60px]"
    >
      <div
        ref={bloom}
        aria-hidden
        className="pointer-events-none absolute -top-[20%] left-1/2 h-[900px] w-[900px] -translate-x-1/2 will-change-transform"
        style={{
          background:
            'radial-gradient(circle, rgb(255 70 85 / 0.09), transparent 60%)',
        }}
      />

      <div className="relative mx-auto grid max-w-[1240px] items-center gap-14 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-[90px]">
        <div className="grid gap-7 md:gap-8">
          <p className="text-accent font-mono text-[11px] tracking-[0.22em]">
            04 / OFF THE CLOCK
          </p>

          <h2
            ref={heading}
            className="text-hi font-display m-0 text-[clamp(28px,4vw,60px)] leading-[1.02] font-semibold tracking-[-0.04em]"
          >
            I also make Valorant content — and that is a distribution skill.
          </h2>

          <p
            data-offline-copy
            className="text-muted-2 m-0 max-w-[560px] text-base leading-[1.75] text-pretty md:text-lg"
          >
            Clips, breakdowns, build-in-public posts. The same instinct that
            gets a clip watched got Crest its first 50 installs with no ads and
            no launch post. Shipping is half the job; getting people to open the
            thing is the other half.
          </p>

          <dl data-offline-copy className="flex gap-10 pt-3">
            <div>
              <dd className="text-hi font-display text-[28px] tracking-[-0.03em] md:text-[34px]">
                50+
              </dd>
              <dt className="text-dim mt-1.5 font-mono text-[10px] tracking-[0.16em]">
                ORGANIC INSTALLS
              </dt>
            </div>
            <div>
              <dd className="text-hi font-display text-[28px] tracking-[-0.03em] md:text-[34px]">
                IG + YT
              </dd>
              <dt className="text-dim mt-1.5 font-mono text-[10px] tracking-[0.16em]">
                BUILD IN PUBLIC
              </dt>
            </div>
          </dl>
        </div>

        <div
          ref={reel}
          className="border-hair-2 bg-panel relative mx-auto grid aspect-[9/16] w-full max-w-[320px] place-items-center overflow-hidden border will-change-transform lg:max-w-none"
        >
          <div
            aria-hidden
            className="absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                'radial-gradient(rgb(255 70 85 / 0.18) 1px, transparent 1.5px)',
              backgroundSize: '34px 34px',
            }}
          />
          <div className="relative grid gap-3 p-5 text-center">
            <p className="text-accent font-mono text-[10px] tracking-[0.2em]">
              MEDIA SLOT
            </p>
            <p className="text-dim font-mono text-[11px] leading-[1.7]">
              9:16 clip reel.
              <br />
              Drop a real clip here.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
