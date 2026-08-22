"use client";

import { useRef } from "react";
import { gsap, useGSAP, DrawSVGPlugin } from "@/lib/gsap";
import { gateIntro } from "@/lib/intro";
import { SILHOUETTE_PATH, SILHOUETTE_VIEWBOX } from "@/lib/silhouette";

void DrawSVGPlugin; // keep the plugin import alive for tree-shaking

/**
 * Glitching contour that traces the portrait: left shoulder, up over the head,
 * down to the right shoulder.
 *
 * Three copies of the same path. The base draws itself on with DrawSVG during
 * the hero entrance; the two ghosts sit at zero opacity until a glitch burst
 * fires, when they jump apart horizontally to give the RGB-split read. The
 * split uses accent + hi rather than the usual cyan/magenta so it stays inside
 * the site's two-colour palette.
 *
 * preserveAspectRatio="xMidYMax meet" mirrors the <Image> object-contain /
 * object-bottom placement exactly, so the stroke lands on the cutout's edge at
 * every viewport size without any JS measurement.
 */
export default function PortraitOutline() {
  const root = useRef<SVGSVGElement>(null);
  const base = useRef<SVGPathElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Draw on with the rest of the hero entrance, held by the loader gate.
        gateIntro(
          gsap.fromTo(
            base.current,
            { drawSVG: "0%" },
            {
              drawSVG: "100%",
              duration: 1.6,
              ease: "power2.inOut",
              delay: 0.6,
            },
          ),
        );

        const ghosts = gsap.utils.toArray<SVGPathElement>("[data-ghost]");

        /* One burst = a few very short frames of displacement, then everything
           snaps back. repeatRefresh re-evaluates the random() calls on every
           repeat, so no two bursts are identical and the loop never reads as a
           loop. The long randomised delay between bursts is what keeps this
           feeling like a fault rather than a decoration. */
        const glitch = gsap
          .timeline({
            repeat: -1,
            repeatRefresh: true,
            delay: 2.6,
          })
          .set(ghosts, { opacity: 0.9 })
          .to(root.current, {
            x: () => gsap.utils.random(-7, 7),
            duration: 0.05,
            ease: "steps(1)",
          })
          .to(
            ghosts[0],
            {
              x: () => gsap.utils.random(-10, -3),
              duration: 0.05,
              ease: "steps(1)",
            },
            "<",
          )
          .to(
            ghosts[1],
            {
              x: () => gsap.utils.random(3, 10),
              duration: 0.05,
              ease: "steps(1)",
            },
            "<",
          )
          .to(root.current, {
            x: () => gsap.utils.random(-4, 4),
            duration: 0.05,
            ease: "steps(1)",
          })
          .to(ghosts, { x: 0, duration: 0.05, ease: "steps(1)" })
          .set(ghosts, { opacity: 0 })
          .to(root.current, { x: 0, duration: 0.08, ease: "power2.out" })
          // Randomised gap before the next burst. A spacer tween rather than
          // repeatDelay, because repeatDelay only accepts a fixed number —
          // a function-based duration is what repeatRefresh re-rolls, so no
          // two gaps are the same and the loop never reads as a loop.
          .to({}, { duration: () => gsap.utils.random(2.2, 5.2) });

        return () => glitch.kill();
      });

      // Reduced motion: the contour is simply there, fully drawn, no bursts.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(base.current, { drawSVG: "100%" });
      });
    },
    { scope: root },
  );

  const stroke = (
    ref: React.Ref<SVGPathElement> | undefined,
    color: string,
    width: number,
    extra: Record<string, unknown> = {},
  ) => (
    <path
      ref={ref}
      d={SILHOUETTE_PATH}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
      {...extra}
    />
  );

  return (
    <svg
      ref={root}
      viewBox={SILHOUETTE_VIEWBOX}
      preserveAspectRatio="xMidYMax meet"
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
    >
      {stroke(undefined, "var(--color-accent)", 1.25, {
        "data-ghost": true,
        opacity: 0,
      })}
      {stroke(undefined, "var(--color-hi)", 1.25, {
        "data-ghost": true,
        opacity: 0,
      })}
      {stroke(base, "var(--color-accent)", 1.75, {
        style: { filter: "drop-shadow(0 0 6px rgb(255 70 85 / 0.55))" },
      })}
    </svg>
  );
}
