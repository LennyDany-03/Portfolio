"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { setCurtainRunner, CURTAIN } from "@/lib/curtain";

/**
 * Curved band transition between sections.
 *
 * Three full-viewport panels, each capped top and bottom with a shallow arc, so
 * the leading edge that crosses the screen is a curve rather than a straight
 * line. They sweep in staggered, cover the screen completely, then sweep out
 * the far side — the scroll position is jumped while covered, so the travel
 * between sections is never seen. Scrolling up mirrors the whole thing.
 *
 * Palette is strictly the existing tokens (accent-soft, accent, ink): a light
 * red band leads, the full accent follows, and ink lands last so the reveal
 * opens from the page's own background colour rather than a flash of something
 * foreign.
 *
 * The caps are `preserveAspectRatio="none"` on purpose. The arc is meant to
 * stretch to whatever the viewport is wide — a circle-accurate curve would read
 * as a small bump on a 2560px monitor.
 */
const LAYERS = [
  { color: "var(--color-accent-soft)", cap: 13 },
  { color: "var(--color-accent)", cap: 11 },
  { color: "var(--color-ink)", cap: 9 },
];

export default function SectionCurtain() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Same gate as ScrollSnap. If this does not match, runCurtain() returns
      // false and the caller animates the scroll normally instead.
      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          const layers = gsap.utils.toArray<HTMLElement>(
            "[data-curtain-layer]",
          );
          if (!layers.length) return;

          gsap.set(root.current, { visibility: "hidden" });
          gsap.set(layers, { yPercent: 115 });

          let active: gsap.core.Timeline | null = null;

          setCurtainRunner((dir, onCovered) => {
            active?.kill();

            // Travelling down the page means the panels sweep UP across it, so
            // they enter from below and leave through the top.
            const from = dir > 0 ? 115 : -115;
            const to = dir > 0 ? -115 : 115;

            active = gsap
              .timeline({
                onStart: () =>
                  gsap.set(root.current, { visibility: "visible" }),
                onComplete: () => {
                  gsap.set(root.current, { visibility: "hidden" });
                  active = null;
                },
              })
              .set(layers, { yPercent: from })
              .to(layers, {
                yPercent: 0,
                duration: CURTAIN.in,
                stagger: CURTAIN.stagger,
                ease: "power2.inOut",
              })
              // Fires the moment the FIRST layer lands — every layer is a full
              // opaque viewport, so one of them at 0 already hides everything.
              // Waiting for the last would show a needless pause.
              .call(onCovered, undefined, CURTAIN.in)
              .to(
                layers,
                {
                  yPercent: to,
                  duration: CURTAIN.out,
                  stagger: CURTAIN.stagger,
                  ease: "power2.inOut",
                },
                // Explicit hold at full cover. Without the offset this would
                // append straight onto the sweep-in and the bands would
                // reverse the instant they landed, which reads as a bounce
                // rather than a transition.
                `+=${CURTAIN.hold}`,
              );

            return active;
          });

          return () => {
            // Killing a running timeline skips its onComplete, which is what
            // resets visibility — so without this the panels stay parked over
            // the whole page and the site is a black screen. Bites on every
            // hot reload that lands mid-transition.
            active?.kill();
            active = null;
            gsap.set(root.current, { visibility: "hidden" });
            gsap.set(layers, { yPercent: 115 });
            setCurtainRunner(null);
          };
        },
      );
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[940] overflow-hidden"
      style={{ visibility: "hidden" }}
    >
      {LAYERS.map((layer) => (
        <div
          key={layer.color}
          data-curtain-layer
          className="absolute inset-x-0 top-0 h-full will-change-transform"
          style={{ backgroundColor: layer.color }}
        >
          {/* Leading arc when sweeping upward. */}
          <svg
            className="absolute bottom-full left-0 w-full"
            style={{ height: `${layer.cap}vh` }}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path d="M0,100 Q50,-4 100,100 Z" fill={layer.color} />
          </svg>

          {/* Leading arc when sweeping downward. */}
          <svg
            className="absolute top-full left-0 w-full"
            style={{ height: `${layer.cap}vh` }}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path d="M0,0 Q50,104 100,0 Z" fill={layer.color} />
          </svg>
        </div>
      ))}
    </div>
  );
}
