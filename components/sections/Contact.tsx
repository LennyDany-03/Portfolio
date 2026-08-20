'use client'

import { useRef } from 'react'
import { gsap, useGSAP, SplitText, MEDIA } from '@/lib/gsap'
import { useMagnetic } from '@/hooks/useMagnetic'
import { SOCIAL_LINKS, EMAIL } from '@/lib/data'

export default function Contact() {
  const root = useRef<HTMLElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const mail = useMagnetic<HTMLAnchorElement>()

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(MEDIA.motionOK, () => {
        SplitText.create(heading.current, {
          type: 'lines',
          mask: 'lines',
          autoSplit: true,
          aria: 'auto',
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 115,
              duration: 1.1,
              stagger: 0.08,
              ease: 'expo.out',
              scrollTrigger: {
                trigger: heading.current,
                start: 'top 82%',
                once: true,
              },
            }),
        })

        gsap.from('[data-contact-item]', {
          opacity: 0,
          y: 26,
          duration: 0.8,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: { trigger: root.current, start: 'top 60%', once: true },
        })
      })

      mm.add(MEDIA.reduced, () => {
        gsap.from([heading.current, '[data-contact-item]'], {
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
    <footer
      ref={root}
      id="contact"
      className="border-hair relative overflow-hidden border-t px-5 pt-24 pb-14 md:px-10 md:pt-[190px] md:pb-[70px] lg:px-[60px]"
    >
      <div className="mx-auto grid max-w-[1240px] gap-16 md:gap-[90px]">
        <div className="grid justify-items-start gap-8 md:gap-10">
          <p className="text-accent font-mono text-[11px] tracking-[0.22em]">
            05 / CONTACT
          </p>

          <h2
            ref={heading}
            className="text-hi font-display m-0 text-[clamp(40px,8vw,132px)] leading-[0.9] font-semibold tracking-[-0.045em]"
          >
            <span className="block">Got something</span>
            <span className="block">that needs</span>
            <span className="text-accent block">shipping?</span>
          </h2>

          <a
            ref={mail}
            data-contact-item
            href={'mailto:' + EMAIL}
            className="border-accent text-accent hover:bg-accent hover:text-ink inline-flex w-full items-center justify-center gap-4 border px-8 py-5 font-mono text-[11px] font-bold tracking-[0.2em] break-all uppercase transition-colors duration-300 will-change-transform sm:w-auto sm:px-[38px] sm:text-xs"
          >
            {EMAIL} <span aria-hidden>→</span>
          </a>
        </div>

        <div
          data-contact-item
          className="border-hair-2 flex flex-wrap justify-between gap-8 border-t pt-10 font-mono text-[11px] tracking-[0.14em] uppercase"
        >
          <nav aria-label="Elsewhere" className="flex flex-wrap gap-6 md:gap-7">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="text-muted hover:text-accent transition-colors duration-300"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <p className="text-dim-2">
            © 2026 · Built solo · Chennai, IN
            <span aria-hidden className="text-accent animate-blink ml-1.5">
              ▊
            </span>
          </p>
        </div>
      </div>
    </footer>
  )
}
