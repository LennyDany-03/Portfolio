'use client'

import { useRef } from 'react'
import { gsap, useGSAP, SplitText, MEDIA } from '@/lib/gsap'
import { useMagnetic } from '@/hooks/useMagnetic'

export default function Hero() {
  const root = useRef<HTMLElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const grid = useRef<HTMLDivElement>(null)
  const glow = useRef<HTMLDivElement>(null)
  const signature = useRef<SVGPathElement>(null)
  const cta = useMagnetic<HTMLAnchorElement>()

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      /* ---------------- Full motion ---------------- */
      mm.add(MEDIA.motionOK, () => {
        const intro = gsap.timeline({ defaults: { ease: 'expo.out' } })

        // SplitText's own `mask` option wraps each line in an overflow-clipped
        // element for us, so no hand-rolled wrapper divs are needed.
        // `autoSplit` re-splits on font load / resize, and returning the tween
        // from onSplit lets GSAP kill + rebuild it cleanly on each re-split.
        SplitText.create(heading.current, {
          type: 'lines',
          mask: 'lines',
          autoSplit: true,
          aria: 'auto', // keeps the real sentence in the a11y tree
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 120,
              duration: 1.2,
              stagger: 0.08,
              ease: 'expo.out',
            }),
        })

        intro
          .from('[data-hero-eyebrow]', { opacity: 0, y: 20, duration: 0.9 }, 0.1)
          .from(
            '[data-hero-rule]',
            { scaleX: 0, transformOrigin: 'left center', duration: 1 },
            0.15,
          )
          .from(
            ['[data-hero-tagline]', '[data-hero-actions]'],
            { opacity: 0, y: 28, duration: 1, stagger: 0.1 },
            0.55,
          )
          .from('[data-hero-scroll]', { opacity: 0, duration: 0.8 }, 0.9)

        // Signature line-draw. DrawSVGPlugin computes the true path length
        // instead of the mockup's hard-coded stroke-dasharray: 900, so the
        // stroke stays correct at any viewport width.
        gsap.fromTo(
          signature.current,
          { drawSVG: '0%' },
          { drawSVG: '100%', duration: 3.2, ease: 'power2.inOut', delay: 0.4 },
        )
      })

      /* ---------------- Parallax ---------------- */
      const parallax = (target: Element | null, factor: number) => {
        if (!target) return
        gsap.to(target, {
          y: () => window.innerHeight * factor,
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
      }

      mm.add(MEDIA.desktopMotion, () => {
        parallax(grid.current, 0.35)
        parallax(glow.current, 0.7)
      })

      // Mobile keeps a hint of depth at 0.15x, per the design spec.
      mm.add(MEDIA.mobileMotion, () => {
        parallax(grid.current, 0.15)
        parallax(glow.current, 0.15)
      })

      /* ---------------- Reduced motion ---------------- */
      mm.add(MEDIA.reduced, () => {
        gsap.from(
          [
            heading.current,
            '[data-hero-eyebrow]',
            '[data-hero-tagline]',
            '[data-hero-actions]',
          ],
          { opacity: 0, duration: 0.2, ease: 'none', stagger: 0.04 },
        )
        gsap.set(signature.current, { drawSVG: '100%' })
      })
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      id="top"
      className="relative grid min-h-svh content-center overflow-hidden px-5 pt-32 pb-20 md:px-10 md:pt-[150px] md:pb-24 lg:px-[60px]"
    >
      <div
        ref={grid}
        aria-hidden
        className="hero-grid pointer-events-none absolute -inset-[10%] will-change-transform"
      />
      <div
        ref={glow}
        aria-hidden
        className="pointer-events-none absolute top-[12%] -right-[6%] h-[640px] w-[640px] rounded-full blur-[20px] will-change-transform"
        style={{
          background:
            'radial-gradient(circle, rgb(255 70 85 / 0.16), transparent 62%)',
        }}
      />
      <div
        aria-hidden
        className="dot-field animate-drift pointer-events-none absolute inset-0 opacity-50"
      />

      <div className="relative mx-auto grid w-full max-w-[1240px] gap-8 md:gap-[42px]">
        <p
          data-hero-eyebrow
          className="text-accent flex items-center gap-4 font-mono text-[10px] tracking-[0.24em] uppercase md:text-[11px]"
        >
          <span
            data-hero-rule
            aria-hidden
            className="bg-accent hidden h-px w-[46px] md:block"
          />
          Full-stack · Desktop · AI/ML · 2nd yr CSE
        </p>

        <h1
          ref={heading}
          className="text-hi font-display m-0 text-[clamp(48px,9.4vw,158px)] leading-[0.86] font-semibold tracking-[-0.045em]"
        >
          <span className="block">LENNY DANY</span>
          <span className="text-dim-2 block">
            DEREK D<span className="text-accent">.</span>
          </span>
        </h1>

        <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-[60px]">
          <div className="grid gap-7 md:gap-[30px]">
            <p
              data-hero-tagline
              className="text-body font-display m-0 max-w-[640px] text-[clamp(20px,2.3vw,34px)] leading-[1.24] tracking-[-0.02em] text-pretty"
            >
              I don&apos;t write the code, I ship the code.
            </p>

            <div
              data-hero-actions
              className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-[26px]"
            >
              <a
                ref={cta}
                href="#work"
                className="bg-accent text-ink inline-flex w-full items-center justify-center gap-3.5 rounded-[2px] px-8 py-5 font-mono text-xs font-bold tracking-[0.2em] uppercase transition-shadow duration-300 will-change-transform hover:shadow-[0_0_44px_rgb(255_70_85_/_0.45)] sm:w-auto"
              >
                View Work <span aria-hidden>→</span>
              </a>
              <p className="text-dim font-mono text-[11px] leading-[1.7] tracking-[0.14em]">
                8+ shipped products
                <br />
                1,331+ commits · solo
              </p>
            </div>
          </div>

          <svg
            viewBox="0 0 420 120"
            aria-hidden
            className="h-auto w-full opacity-90"
          >
            <path
              ref={signature}
              d="M8 92 C 46 34, 62 100, 96 62 S 132 12, 168 68 C 196 108, 214 30, 244 58 C 272 84, 292 26, 322 60 C 348 90, 372 44, 412 52"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth={2}
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      <div
        data-hero-scroll
        aria-hidden
        className="text-dim-2 absolute right-5 bottom-11 hidden items-center gap-3 font-mono text-[10px] tracking-[0.2em] md:right-10 md:flex lg:right-[60px]"
      >
        SCROLL
        <span className="block h-10 w-px bg-gradient-to-b from-[var(--color-accent)] to-transparent" />
      </div>
    </section>
  )
}
