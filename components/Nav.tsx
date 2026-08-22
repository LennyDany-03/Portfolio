"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { createMagnetic, MAGNETIC_MEDIA } from "@/hooks/useMagnetic";
import { NAV_LINKS } from "@/lib/data";

export default function Nav() {
  const root = useRef<HTMLElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // The progress bar is scaleX, not width — width triggers layout on every
      // scroll frame, scaleX is composited on the GPU.
      mm.add("all", () => {
        gsap.fromTo(
          bar.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: { start: 0, end: "max", scrub: 0.25 },
          },
        );
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(root.current, {
          yPercent: -100,
          duration: 0.9,
          ease: "expo.out",
          delay: 0.15,
        });
      });

      // Magnetic nav links. Attached imperatively over the rendered list — a
      // hook can't be called inside NAV_LINKS.map(). Tuned much tighter than
      // the primary buttons: these are ~60px wide, so the button's 120px radius
      // would have all four pulling at once.
      mm.add(MAGNETIC_MEDIA, () => {
        const teardowns = gsap.utils
          .toArray<HTMLElement>("[data-magnetic]")
          .map((el) => createMagnetic(el, { strength: 6, radius: 70 }));

        return () => teardowns.forEach((off) => off());
      });
    },
    { scope: root },
  );

  return (
    <header
      ref={root}
      className="fixed inset-x-0 top-0 z-[800] flex items-center justify-between gap-4 px-5 py-4 backdrop-blur-md md:px-10 md:py-[22px]"
      style={{
        background:
          "linear-gradient(180deg, rgb(10 10 12 / 0.92), rgb(10 10 12 / 0))",
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
        // Visible on phones now. With scroll locked into discrete slides, a
        // mobile visitor with no nav would have to swipe through every stop to
        // reach Contact. The location stamp yields the space instead.
        className="flex gap-3 font-mono text-[9px] tracking-[0.12em] uppercase sm:gap-5 sm:text-[10px] sm:tracking-[0.18em] md:gap-8 md:text-[11px]"
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            data-magnetic
            className="text-dim hover:text-body inline-block transition-colors duration-300 will-change-transform"
          >
            {link.label}
          </a>
        ))}
      </nav>

      {/* Hidden on phones so the nav links have room. */}
      <span className="text-dim hidden font-mono text-[10px] tracking-[0.14em] sm:block md:text-[11px]">
        CHENNAI, IN
      </span>

      <div
        ref={bar}
        aria-hidden
        className="bg-accent absolute inset-x-0 bottom-0 h-px origin-left shadow-[0_0_10px_var(--color-accent)]"
      />
    </header>
  );
}
