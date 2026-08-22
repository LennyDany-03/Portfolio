"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP, SplitText, MEDIA, fromLines } from "@/lib/gsap";
import { registerStops, sectionStop } from "@/lib/snap";
import { gateIntro } from "@/lib/intro";
import PortraitOutline from "@/components/PortraitOutline";
import { useMagnetic } from "@/hooks/useMagnetic";

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const tagline = useRef<HTMLParagraphElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const portrait = useRef<HTMLDivElement>(null);
  const cta = useMagnetic<HTMLAnchorElement>();

  useGSAP(
    () => {
      const unregister = registerStops(sectionStop(root.current));
      const mm = gsap.matchMedia();

      /* ---------------- Full motion ---------------- */
      mm.add(MEDIA.motionOK, () => {
        // Every entrance here is built PAUSED and released by <Loader />, so it
        // plays as the panel wipes rather than finishing unseen behind it.
        const intro = gateIntro(
          gsap.timeline({ defaults: { ease: "expo.out" } }),
        );

        // SplitText's own `mask` option wraps each line in an overflow-clipped
        // element for us, so no hand-rolled wrapper divs are needed.
        // `autoSplit` re-splits on font load / resize, and returning the tween
        // from onSplit lets GSAP kill + rebuild it cleanly on each re-split.
        SplitText.create(heading.current, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          aria: "auto", // keeps the real sentence in the a11y tree
          onSplit: (self) =>
            gateIntro(
              fromLines(self.lines, {
                yPercent: 120,
                // Skew settle. skewX (not skewY) because the shear then scales
                // with the LINE HEIGHT, not the line width — on a 158px display
                // face a skewY would displace the far edge by ~80px and clip
                // against the mask wrapper. transformOrigin pins the left edge
                // so the shear pushes right, into the container's slack.
                skewX: 5,
                transformOrigin: "left top",
                duration: 1.2,
                // Widened from 0.08 so DEREK D. lands a clear beat behind
                // LENNY DANY and the white/grey hierarchy survives the motion.
                stagger: 0.14,
                ease: "expo.out",
              }),
            ),
        });

        // Tagline gets a masked line wipe rather than a fade, so the text edge
        // stays crisp. Standalone with a delay instead of living on `intro`:
        // autoSplit rebuilds this tween on every re-split, and a timeline
        // holding the old reference would go stale.
        SplitText.create(tagline.current, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          aria: "auto",
          onSplit: (self) =>
            gateIntro(
              fromLines(self.lines, {
                yPercent: 110,
                duration: 0.7,
                stagger: 0.06,
                delay: 0.55, // matches the old timeline position
                ease: "expo.out",
              }),
            ),
        });

        intro
          .from(
            "[data-hero-eyebrow]",
            { opacity: 0, y: 20, duration: 0.9 },
            0.1,
          )
          .from(
            "[data-hero-rule]",
            { scaleX: 0, transformOrigin: "left center", duration: 1 },
            0.15,
          )
          // Portrait rises out of its own clip while the name is still landing,
          // so the figure and the type arrive as one move rather than in turn.
          .from(
            portrait.current,
            {
              clipPath: "inset(100% 0 0 0)",
              yPercent: 12,
              scale: 1.06,
              duration: 1.3,
            },
            0.35,
          )
          .from("[data-hero-actions]", { opacity: 0, y: 28, duration: 1 }, 0.65)
          .from("[data-hero-scroll]", { opacity: 0, duration: 0.8 }, 0.9);

        // (The squiggle signature line was removed — the portrait contour in
        // <PortraitOutline /> now carries the drawn-line motif on its own.)
      });

      /* ---------------- Parallax ---------------- */
      const parallax = (target: Element | null, factor: number) => {
        if (!target) return;
        gsap.to(target, {
          y: () => window.innerHeight * factor,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
      };

      mm.add(MEDIA.desktopMotion, () => {
        parallax(grid.current, 0.35);
        parallax(glow.current, 0.7);

        /* ---------------- Pointer drift ----------------
           The scroll parallax above already owns `y` on both layers, so this
           writes `x` only — two tweens on one property would fight. quickTo
           re-targets a single tween, so pointermove never allocates.
           Deliberately tiny: a few px, felt more than seen. */
        const gridX = gsap.quickTo(grid.current, "x", {
          duration: 0.8,
          ease: "power3",
        });
        const glowX = gsap.quickTo(glow.current, "x", {
          duration: 1.1,
          ease: "power3",
        });

        const onMove = (event: PointerEvent) => {
          const ratio = event.clientX / window.innerWidth - 0.5; // -0.5..0.5
          gridX(ratio * -16); // ±8px, opposing the pointer
          glowX(ratio * 28); // ±14px, following it — the split builds depth
        };

        window.addEventListener("pointermove", onMove, { passive: true });
        return () => window.removeEventListener("pointermove", onMove);
      });

      // Mobile keeps a hint of depth at 0.15x, per the design spec.
      mm.add(MEDIA.mobileMotion, () => {
        parallax(grid.current, 0.15);
        parallax(glow.current, 0.15);
      });

      /* ---------------- Reduced motion ---------------- */
      mm.add(MEDIA.reduced, () => {
        gsap.from(
          [
            heading.current,
            "[data-hero-eyebrow]",
            "[data-hero-tagline]",
            "[data-hero-actions]",
          ],
          { opacity: 0, duration: 0.2, ease: "none", stagger: 0.04 },
        );
      });
      return unregister;
    },
    { scope: root },
  );

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
            "radial-gradient(circle, rgb(255 70 85 / 0.16), transparent 62%)",
        }}
      />
      <div
        aria-hidden
        className="dot-field animate-drift pointer-events-none absolute inset-0 opacity-50"
      />

      {/* Portrait cutout, anchored to the right edge and sitting BEHIND the
          type (it precedes the relative content wrapper in the DOM). The
          .portrait-fade mask dissolves its left and bottom edges into the page
          so it reads as part of the background rather than a pasted-on photo,
          and never competes with the headline for attention. Desktop only —
          at narrow widths there is no room beside the type. */}
      <div
        ref={portrait}
        aria-hidden
        className="pointer-events-none absolute right-[-4%] bottom-0 hidden h-[76svh] w-[46vw] max-w-[640px] will-change-transform lg:block"
      >
        {/* The fade mask wraps ONLY the photo. If the outline shared it, the
            left shoulder — the point the contour starts from — would be masked
            away. Leaving the stroke unmasked also means the contour carries on
            across the region where the photo has already dissolved, which
            reads as a wireframe over the figure rather than a sticker on it. */}
        <div className="portrait-fade absolute inset-0">
          <Image
            src="/lenny-nobackground.png"
            alt=""
            fill
            priority
            sizes="46vw"
            className="object-contain object-bottom"
          />
        </div>

        <PortraitOutline />
      </div>

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

        {/* Single column now the squiggle is gone — the old
            [1fr_420px] split existed only to hold it, and keeping it would
            reserve 420px of dead space beside the tagline. */}
        <div className="grid items-end gap-10">
          <div className="grid gap-7 md:gap-[30px]">
            <p
              ref={tagline}
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
                data-cursor-label="View"
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
  );
}
