'use client'

import { useRef } from 'react'
import { gsap, useGSAP, MEDIA } from '@/lib/gsap'
import { STAT_BLOCKS } from '@/lib/data'

export default function About() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(MEDIA.motionOK, () => {
        // Scramble the opening clause as it enters — charset and duration per
        // the design spec.
        gsap.to('[data-scramble]', {
          duration: 0.9,
          ease: 'none',
          scrambleText: {
            text: '{original}',
            chars: '01<>/',
            speed: 0.6,
            revealDelay: 0.15,
          },
          scrollTrigger: {
            trigger: '[data-scramble]',
            start: 'top 80%',
            once: true,
          },
        })

        // Paragraphs wipe up from a clip-path inset rather than fading, so the
        // text edge stays crisp. Fires at 40% viewport entry.
        gsap.from('[data-reveal-clip]', {
          clipPath: 'inset(0 0 100% 0)',
          y: 24,
          duration: 1.1,
          ease: 'power3.out',
          stagger: 0.12,
          scrollTrigger: {
            trigger: root.current,
            start: 'top 60%',
            once: true,
          },
        })

        // Stat counters. The tween mutates a plain object and writes text in
        // onUpdate — no layout reads, one text write per frame.
        gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
          const target = Number(el.dataset.count)
          const decimals = Number(el.dataset.decimals ?? 0)
          const proxy = { value: 0 }

          gsap.to(proxy, {
            value: target,
            duration: 1.8,
            ease: 'power2.out',
            snap: { value: decimals ? 0.01 : 1 },
            onUpdate: () => {
              el.textContent = proxy.value.toLocaleString('en-IN', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
              })
            },
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          })
        })
      })

      mm.add(MEDIA.reduced, () => {
        gsap.from('[data-reveal-clip]', {
          opacity: 0,
          duration: 0.2,
          ease: 'none',
          stagger: 0.04,
          scrollTrigger: { trigger: root.current, start: 'top 70%', once: true },
        })
      })
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      className="border-hair relative border-t px-5 py-24 md:px-10 md:py-[180px] lg:px-[60px]"
    >
      <div className="mx-auto grid max-w-[1240px] gap-12 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-20">
        <p className="text-accent font-mono text-[11px] tracking-[0.22em]">
          01 / ABOUT
        </p>

        <div className="grid max-w-[860px] gap-8 md:gap-10">
          <p
            data-reveal-clip
            className="text-hi font-display m-0 text-[clamp(24px,3vw,44px)] leading-[1.22] tracking-[-0.025em] text-pretty"
          >
            <span data-scramble>
              Second-year CSE (AI &amp; ML) at SRM IST.
            </span>{' '}
            I build production systems end-to-end — backend, frontend, infra,
            release pipeline — alone.
          </p>

          <p
            data-reveal-clip
            className="text-muted-2 m-0 max-w-[640px] text-base leading-[1.75] text-pretty md:text-lg"
          >
            Native Windows overlays in Rust/Tauri. HRMS platforms on Flutter
            with biometric attendance. Registration systems holding 1,800+ live
            users. Three internships, one freelance venture (Ascendry,
            Udyam-registered), and a habit tracker selling on Gumroad. The
            pattern is the same every time: pick the hard part, ship it, keep it
            running.
          </p>

          <dl
            data-reveal-clip
            className="bg-hair-2 mt-5 grid grid-cols-2 gap-px lg:grid-cols-4"
          >
            {STAT_BLOCKS.map((stat) => (
              <div key={stat.label} className="bg-ink px-5 py-6 md:px-[22px]">
                <dd className="text-hi font-display text-[32px] tracking-[-0.03em] md:text-[40px]">
                  <span data-count={stat.value} data-decimals={stat.decimals}>
                    0
                  </span>
                  {stat.suffix && (
                    <span className="text-accent">{stat.suffix}</span>
                  )}
                </dd>
                <dt className="text-dim mt-2 font-mono text-[10px] tracking-[0.16em]">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
