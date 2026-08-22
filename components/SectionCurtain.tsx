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
  const label = useRef<HTMLDivElement>(null);
  const eyebrow = useRef<HTMLSpanElement>(null);
  const title = useRef<HTMLSpanElement>(null);

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

          setCurtainRunner((dir, onCovered, text) => {
            active?.kill();

            // Fill the preview BEFORE the sweep starts, so the words are
            // already in place the instant the bands finish covering.
            if (eyebrow.current)
              eyebrow.current.textContent = text?.eyebrow ?? "";
            if (title.current) title.current.textContent = text?.title ?? "";
            const hasText = Boolean(text?.eyebrow || text?.title);

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
              // The preview rises in under full cover and clears before the
              // bands move again, so it is never seen sliding around.
              .fromTo(
                label.current,
                { opacity: 0, y: 26 },
                {
                  opacity: hasText ? 1 : 0,
                  y: 0,
                  duration: 0.34,
                  ease: "power3.out",
                },
                CURTAIN.in - 0.06,
              )
              .to(
                label.current,
                { opacity: 0, y: -18, duration: 0.22, ease: "power2.in" },
                CURTAIN.in + CURTAIN.hold + CURTAIN.stagger * 2,
              )
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
            gsap.set(label.current, { opacity: 0 });
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

      {/* Preview of the incoming section. Sits above the bands so it reads on
          the ink layer, and is centred independently of them so it never
          travels with the sweep. */}
      <div
        ref={label}
        className="absolute inset-0 z-10 grid place-items-center px-8 opacity-0"
      >
        <div className="grid max-w-[900px] justify-items-center gap-5 text-center">
          <span
            ref={eyebrow}
            className="text-accent font-mono text-[11px] tracking-[0.24em] uppercase"
          />
          <span
            ref={title}
            className="text-hi font-display text-[clamp(28px,5vw,76px)] leading-[1.02] font-semibold tracking-[-0.04em] text-balance"
          />
        </div>
      </div>
    </div>
  );
}
