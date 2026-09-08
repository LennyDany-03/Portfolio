"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger, MEDIA } from "@/lib/gsap";
import { onSectionChange, setActiveSection } from "@/lib/section";
import { createMagnetic, MAGNETIC_MEDIA } from "@/hooks/useMagnetic";
import { NAV_LINKS } from "@/lib/data";
import BrandMark from "@/components/BrandMark";

export default function Nav() {
  const root = useRef<HTMLElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const mark = useRef<HTMLSpanElement>(null);

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

      /* Which section you are actually in.
         Runs at every width: it is a wayfinding cue, not decoration, and the
         page is seven near-identical dark screens without it. The marker is
         1px wide and stretched with scaleX, so travelling between links is one
         composited transform rather than an animated width. */
      mm.add("all", () => {
        const markEl = mark.current;
        if (!markEl) return;

        const links = gsap.utils.toArray<HTMLElement>("[data-nav-link]");
        let current = -1;

        const setActive = (next: number) => {
          if (next === current) return;
          current = next;

          links.forEach((link, i) => {
            if (i === next) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
          });

          const link = links[next];
          gsap.to(markEl, {
            // Collapsed rather than hidden when nothing matches, and `x` is
            // left alone in that case so the marker shrinks in place instead
            // of sliding back to the first link on its way out.
            scaleX: link ? link.offsetWidth : 0,
            ...(link ? { x: link.offsetLeft } : null),
            duration: 0.45,
            ease: "power3.out",
            overwrite: "auto",
          });
        };

        // Fed by <ScrollSnap />, which already decides which stop the page
        // lands on and therefore knows the answer exactly. Measuring the
        // sections here instead would be wrong: Work is pinned, so the
        // position its element reports depends on whether the pin is engaged,
        // and a trigger measured against it lights up the wrong link by most
        // of the deck's four viewports.
        return onSectionChange((section) =>
          setActive(
            section
              ? NAV_LINKS.findIndex((link) => link.href.slice(1) === section)
              : -1,
          ),
        );
      });

      /* Reduced motion: ScrollSnap does not run, so nothing publishes. There
         is also no Work pin in this mode, which is exactly why measuring the
         sections directly is safe HERE and not above. */
      mm.add(MEDIA.reduced, () => {
        const triggers: (ScrollTrigger | null)[] = [];
        const sync = () =>
          setActiveSection(
            NAV_LINKS[triggers.findIndex((t) => t?.isActive)]?.href.slice(1) ??
              null,
          );

        NAV_LINKS.forEach((link, i) => {
          const el = document.getElementById(link.href.slice(1));
          triggers[i] = el
            ? ScrollTrigger.create({
                trigger: el,
                start: "top 45%",
                end: "bottom 45%",
                onToggle: sync,
                id: "nav-" + i,
              })
            : null;
        });

        // Sections already on screen when this runs never fire a toggle.
        sync();

        return () => {
          triggers.forEach((t) => t?.kill());
          setActiveSection(null);
        };
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
      {/* The mark carries the brand alone here, so it needs an accessible
          name of its own — <BrandMark /> is aria-hidden decoration. */}
      <a href="#top" aria-label="Lenny Dany Derek D., back to top">
        {/* 28px on phones, not 32: the header is only py-4 there, and every
            extra pixel of tile is a pixel of header. Both sizes are well under
            the 64px floor in monogramFit(), so the mark comes back thickened
            and without its tail or DD stamp — neither survives at this size. */}
        <BrandMark
          px={32}
          className="block h-[28px] w-[28px] shrink-0 md:h-[32px] md:w-[32px]"
        />
      </a>

      <nav
        aria-label="Primary"
        // Visible on phones now. With scroll locked into discrete slides, a
        // mobile visitor with no nav would have to swipe through every stop to
        // reach Contact. The location stamp yields the space instead.
        className="relative flex gap-3 font-mono text-[9px] tracking-[0.12em] uppercase sm:gap-5 sm:text-[10px] sm:tracking-[0.18em] md:gap-8 md:text-[11px]"
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            data-magnetic
            data-nav-link
            className="text-dim hover:text-body aria-[current=true]:text-hi inline-block transition-colors duration-300 will-change-transform"
          >
            {link.label}
          </a>
        ))}

        {/* Marks the section you are in. 1px wide, stretched with scaleX. */}
        <span
          ref={mark}
          aria-hidden
          className="bg-accent absolute -bottom-1.5 left-0 h-px w-px origin-left scale-x-0"
        />
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
