"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { releaseIntro } from "@/lib/intro";

/**
 * Boot sequence: mono counter + accent progress line over a full-bleed panel,
 * which then wipes upward to hand off to the hero.
 *
 * Two things it deliberately does NOT do:
 *  - block content. The panel is an overlay; the real page is mounted and in
 *    the DOM underneath the whole time, so crawlers and no-JS visitors see the
 *    full document and nothing is gated behind an animation.
 *  - outstay its welcome. Fixed ~1.5s, not tied to real asset loading. A load
 *    -bound loader punishes fast connections with a flash and slow ones with an
 *    indefinite wait; a fixed beat is honest about being a piece of theatre.
 *
 * releaseIntro() fires as the wipe STARTS, not when it ends, so the hero
 * entrance is already in motion as the panel clears.
 */
export default function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const counter = { value: 0 };

        const tl = gsap.timeline({
          onComplete: () => {
            // The panel is gone; make sure it can never eat a click.
            gsap.set(root.current, { display: "none" });
          },
        });

        tl.to(counter, {
          value: 100,
          duration: 1.4,
          // Not linear: loaders that ease feel like they are measuring
          // something. A constant rate reads as a fake progress bar.
          ease: "power2.inOut",
          onUpdate: () => {
            if (count.current) {
              count.current.textContent = String(
                Math.round(counter.value),
              ).padStart(3, "0");
            }
          },
        })
          .to(
            bar.current,
            { scaleX: 1, duration: 1.4, ease: "power2.inOut" },
            0,
          )
          // Counter and label clear before the panel moves, so the wipe reveals
          // the hero rather than dragging UI chrome up the screen with it.
          .to(
            "[data-loader-fade]",
            { opacity: 0, duration: 0.3, ease: "power2.in" },
            "+=0.15",
          )
          .to(
            root.current,
            {
              yPercent: -100,
              duration: 0.9,
              ease: "expo.inOut",
              onStart: releaseIntro,
            },
            "-=0.1",
          );

        return () => {
          // matchMedia revert (or unmount) must not strand the hero paused.
          releaseIntro();
        };
      });

      // Reduced motion: no theatre at all. Hide the panel on the first frame
      // and let the hero render normally.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(root.current, { display: "none" });
        releaseIntro();
      });
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      aria-hidden
      className="bg-ink pointer-events-none fixed inset-0 z-[1000] grid place-items-center"
    >
      <div className="grid w-full max-w-[420px] gap-8 px-8">
        <div
          data-loader-fade
          className="text-body flex items-center gap-3 font-mono text-xs tracking-[0.16em]"
        >
          <span className="bg-accent block h-2 w-2 rounded-full shadow-[0_0_12px_var(--color-accent)]" />
          LDD
        </div>

        <span
          ref={count}
          data-loader-fade
          className="text-hi font-display block text-[clamp(56px,12vw,110px)] leading-none font-semibold tracking-[-0.05em] tabular-nums"
        >
          000
        </span>

        <div
          data-loader-fade
          className="relative h-px w-full bg-[rgb(255_255_255_/_0.12)]"
        >
          <span
            ref={bar}
            className="bg-accent absolute inset-0 block origin-left shadow-[0_0_10px_var(--color-accent)]"
            style={{ transform: "scaleX(0)" }}
          />
        </div>

        <p
          data-loader-fade
          className="text-dim font-mono text-[10px] tracking-[0.22em] uppercase"
        >
          Loading · Chennai, IN
        </p>
      </div>
    </div>
  );
}
