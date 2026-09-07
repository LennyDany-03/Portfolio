"use client";

import { useRef } from "react";
import { gsap, useGSAP, MEDIA } from "@/lib/gsap";
import { releaseIntro, releaseIntroSoon, holdIntro } from "@/lib/intro";
import BrandMark from "@/components/BrandMark";
import { SIGNATURE_PATH } from "@/lib/logo";
import {
  SIGNATURE_BLOCK_VIEWBOX,
  SIGNATURE_PEN_PATH,
  SIGNATURE_PEN_WIDTH,
  SIGNATURE_FLOURISH_PATH,
  INTRO,
  INTRO_FLOURISH_AT,
  INTRO_COLLAPSE_AT,
  INTRO_TAIL_AT,
  INTRO_ZOOM_AT,
  INTRO_RELEASE_AT,
  INTRO_TOTAL,
} from "@/lib/brand";

/**
 * Boot sequence: the signature writes itself, contracts into the LDD monogram,
 * and the camera pushes THROUGH the mark to land on the site.
 *
 * Two things it deliberately does NOT do:
 *  - block content. The panel is an overlay; the real page is mounted and in
 *    the DOM underneath the whole time, so crawlers and no-JS visitors see the
 *    full document and nothing is gated behind an animation.
 *  - outstay its welcome. A fixed beat, not tied to real asset loading. A load
 *    -bound loader punishes fast connections with a flash and slow ones with an
 *    indefinite wait; a fixed beat is honest about being a piece of theatre.
 *
 * releaseIntro() fires as the ground STARTS to clear, not when it finishes, so
 * the hero entrance is already in motion behind the departing mark. It is also
 * what un-gates ScrollSnap — until then a wheel gesture would teleport the page
 * to another section invisibly, under a panel that outranks the curtain.
 *
 * Every timeline position below is ABSOLUTE, from lib/brand.ts. See the note on
 * INTRO there for why a relative offset would be a bug.
 */
export default function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const ground = useRef<HTMLDivElement>(null);
  const pen = useRef<SVGPathElement>(null);
  const flourish = useRef<SVGPathElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MEDIA.motionOK, () => {
        // This instance now owns the gate — cancel any release the previous
        // one scheduled on its way out. See releaseIntroSoon().
        holdIntro();

        // The markup ships both marks at opacity 0 so the SERVER-RENDERED
        // paint is a plain black panel. Without that, the browser paints the
        // finished signature and a full-size tile for however long hydration
        // takes — the timeline's start values cannot apply until React has
        // mounted, and useLayoutEffect only beats the paint that follows
        // hydration, not the one before it. The mark keeps its inline state
        // (the collapse tween's `from` matches it exactly); the signature is
        // handed back here, still invisible because the pen is at 0%.
        gsap.set("[data-intro-sig]", { opacity: 1 });

        const tl = gsap.timeline({
          onComplete: () => {
            // The panel is gone; make sure it can never eat a click.
            gsap.set(root.current, { display: "none" });
          },
        });

        tl
          // The pen is a mask, not artwork. As it draws, the letterforms it
          // covers appear — in writing order, because that is the order the
          // centreline visits them.
          .fromTo(
            pen.current,
            { drawSVG: "0%" },
            {
              drawSVG: "100%",
              duration: INTRO.write,
              // Not linear: a hand accelerates out of the first stroke and
              // eases off the last. A constant rate reads as a machine.
              ease: "power1.inOut",
            },
            INTRO.writeAt,
          )
          .fromTo(
            flourish.current,
            { drawSVG: "0%" },
            { drawSVG: "100%", duration: INTRO.flourish, ease: "power2.out" },
            INTRO_FLOURISH_AT,
          )

          // Collapse. Both marks sit in the same centred grid cell, so scaling
          // one down while the other scales up reads as the signature
          // condensing into the monogram rather than as a crossfade.
          .to(
            "[data-intro-sig]",
            {
              scale: 0.26,
              opacity: 0,
              filter: "blur(6px)",
              duration: INTRO.collapse,
              ease: "power2.inOut",
            },
            INTRO_COLLAPSE_AT,
          )
          .fromTo(
            "[data-intro-mark]",
            { scale: 0.42, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              duration: INTRO.collapse,
              ease: "power3.out",
            },
            INTRO_COLLAPSE_AT,
          )
          .fromTo(
            "[data-brand-tail]",
            { drawSVG: "0%" },
            { drawSVG: "100%", duration: 0.35, ease: "power2.out" },
            INTRO_TAIL_AT,
          )

          // Push through the mark.
          .to(
            "[data-intro-mark]",
            {
              scale: 9,
              opacity: 0,
              filter: "blur(14px)",
              duration: INTRO.zoom,
              ease: "power3.in",
            },
            INTRO_ZOOM_AT,
          )
          .to(
            "[data-intro-stamp]",
            { opacity: 0, duration: 0.3, ease: "power2.in" },
            INTRO_ZOOM_AT,
          )
          .to(
            ground.current,
            {
              opacity: 0,
              duration: INTRO.reveal,
              ease: "power2.inOut",
              onStart: releaseIntro,
            },
            INTRO_RELEASE_AT,
          )
          // Pins the timeline to INTRO_TOTAL, so onComplete cannot fire early
          // if a later tween is ever shortened.
          .to({}, { duration: 0 }, INTRO_TOTAL);

        return () => {
          // matchMedia revert (or unmount) must not strand the hero paused —
          // but deferred, so a StrictMode remount can take the gate back.
          releaseIntroSoon();
        };
      });

      // Reduced motion: no theatre at all. Hide the panel on the first frame
      // and let the hero render normally.
      mm.add(MEDIA.reduced, () => {
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
      className="pointer-events-none fixed inset-0 z-[1000] grid place-items-center"
    >
      {/* The ground is a sibling that fades, not the panel itself. Fading the
          panel would take the mark's own zoom-through down with it. */}
      <div ref={ground} className="bg-ink absolute inset-0" />

      {/* One cell, two marks stacked. The collapse depends on them sharing a
          centre — grid-area rather than absolute positioning, so neither has to
          know the other's size. */}
      <div className="relative grid place-items-center [grid-template-areas:'mark']">
        <div
          data-intro-sig
          className="w-[min(78vw,900px)] [grid-area:mark] will-change-transform"
          style={{ opacity: 0 }}
        >
          <svg
            viewBox={SIGNATURE_BLOCK_VIEWBOX}
            className="block w-full overflow-visible"
            style={{ filter: "drop-shadow(0 0 26px rgb(255 70 85 / 0.28))" }}
          >
            <defs>
              {/* A literal id, not useId(): the loader mounts exactly once, and
                  a constant is trivially hydration-stable. */}
              <mask
                id="ldd-pen-mask"
                maskUnits="userSpaceOnUse"
                x="-500"
                y="-500"
                width="5278"
                height="2420"
              >
                <path
                  ref={pen}
                  d={SIGNATURE_PEN_PATH}
                  fill="none"
                  stroke="#fff"
                  strokeWidth={SIGNATURE_PEN_WIDTH}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </mask>
            </defs>

            <path
              d={SIGNATURE_PATH}
              fill="var(--color-accent)"
              mask="url(#ldd-pen-mask)"
            />
            <path
              ref={flourish}
              d={SIGNATURE_FLOURISH_PATH}
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="22"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div
          data-intro-mark
          className="[grid-area:mark] will-change-transform"
          style={{ opacity: 0, transform: "scale(0.42)" }}
        >
          <BrandMark
            px={240}
            className="h-[min(38vw,240px)] w-[min(38vw,240px)]"
          />
        </div>
      </div>

      <p
        data-intro-stamp
        className="text-dim absolute bottom-10 font-mono text-[10px] tracking-[0.22em] uppercase"
      >
        LDD · Chennai, IN
      </p>
    </div>
  );
}
