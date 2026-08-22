"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger, MEDIA } from "@/lib/gsap";
import { registerStops, sectionStop } from "@/lib/snap";
import { directionalReveal, retainDirectionObserver } from "@/lib/direction";
import { MARQUEE_ROW_A, MARQUEE_ROW_B, STACK_GRID } from "@/lib/data";
import { NEXT_LABELS } from "@/lib/data";

/** Widest mask shoulder in globals.css — the spotlight must start/end fully clear. */
const SPOT_PAD = 260;

/**
 * One marquee row, rendered as three layout-identical stacked tracks:
 *
 *   base  — every word dim (text-ghost), in normal flow, sets the row height
 *   wide  — the same words in white, masked to a broad moving band
 *   core  — the same words in accent, masked to a narrow hot centre
 *
 * All three are driven by ONE tween so they can never drift out of register.
 * The masks live on the static container-sized wrappers, not on the tracks, so
 * the spotlight holds still in container space while the words travel under it.
 */
function MarqueeRow({
  words,
  outerRef,
}: {
  words: string[];
  outerRef: React.RefObject<HTMLDivElement | null>;
}) {
  // Rendered twice so translating by -50% lands on an identical frame.
  const doubled = [...words, ...words];

  const track = (tone: string) => (
    <div
      data-marquee-track
      className={`font-display flex w-max gap-6 text-[22px] tracking-[-0.03em] whitespace-nowrap will-change-transform sm:gap-10 sm:text-[30px] md:gap-[60px] md:text-[46px] ${tone}`}
    >
      {doubled.map((word, i) => (
        <span key={word + i}>{word}</span>
      ))}
    </div>
  );

  return (
    <div
      ref={outerRef}
      className="marquee-mask relative overflow-hidden"
      aria-hidden
    >
      {track("text-ghost")}
      <div className="spot-wide absolute top-0 left-0 h-full w-full overflow-hidden">
        {track("text-hi")}
      </div>
      <div className="spot-core absolute top-0 left-0 h-full w-full overflow-hidden">
        {track("text-accent")}
      </div>
    </div>
  );
}

export default function Stack() {
  const root = useRef<HTMLElement>(null);
  const rowA = useRef<HTMLDivElement>(null);
  const rowB = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const unregister = registerStops(
        sectionStop(root.current, "stack", NEXT_LABELS.stack),
      );
      const mm = gsap.matchMedia();

      mm.add(MEDIA.motionOK, () => {
        const rowAEl = rowA.current;
        const rowBEl = rowB.current;
        if (!rowAEl || !rowBEl) return;

        const release = retainDirectionObserver();

        const tracksA = rowAEl.querySelectorAll("[data-marquee-track]");
        const tracksB = rowBEl.querySelectorAll("[data-marquee-track]");

        /* ---------------- Marquees ----------------
           Two opposed infinite loops. xPercent -50 across a doubled list is a
           seamless wrap with zero JS per frame beyond GSAP's own tween. Each
           tween targets all three stacked tracks at once. */
        const loopA = gsap.to(tracksA, {
          xPercent: -50,
          duration: 34,
          ease: "none",
          repeat: -1,
        });

        const loopB = gsap.fromTo(
          tracksB,
          { xPercent: -50 },
          { xPercent: 0, duration: 44, ease: "none", repeat: -1 },
        );

        const loops = [loopA, loopB];
        const settle = gsap
          .delayedCall(0.3, () => {
            gsap.to(loops, { timeScale: 1, duration: 0.6, overwrite: true });
          })
          .pause();

        /* ---------------- Spotlight ----------------
           Scroll progress through the section sweeps a lit window across the
           words: row A left-to-right, row B mirrored right-to-left. Writing one
           CSS variable per row beats distance-testing 40 spans per frame, which
           would mean 40 getBoundingClientRect() calls at 60fps.

           Width is cached on refresh, never read inside onUpdate. */
        let rowW = 0;
        const measure = () => {
          rowW = rowAEl.clientWidth;
        };

        const paint = (progress: number) => {
          const travel = rowW + SPOT_PAD * 2;
          rowAEl.style.setProperty(
            "--spot-x",
            -SPOT_PAD + progress * travel + "px",
          );
          rowBEl.style.setProperty(
            "--spot-x",
            rowW + SPOT_PAD - progress * travel + "px",
          );
        };

        // One trigger spanning the section drives both the spotlight sweep and
        // the velocity-reactive marquee speed.
        const st = ScrollTrigger.create({
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          onRefresh: (self) => {
            measure();
            paint(self.progress);
          },
          onUpdate: (self) => {
            paint(self.progress);

            // Scroll velocity modulates marquee speed by up to +/-40%.
            const boost = gsap.utils.clamp(
              0.6,
              1.4,
              1 + Math.abs(self.getVelocity()) / 4000,
            );
            gsap.to(loops, {
              timeScale: boost,
              duration: 0.3,
              overwrite: true,
            });
            settle.restart(true);
          },
        });

        // onRefresh does not fire on initial create, so seed it by hand.
        measure();
        paint(st.progress);

        /* ---------------- Grid ----------------
           ScrollTrigger.batch groups whatever enters in the same frame into ONE
           staggered tween, instead of one observer + one tween per cell. */
        const cells = gsap.utils.toArray<HTMLElement>("[data-stack-cell]");
        gsap.set(cells, { opacity: 0, y: 26 });

        ScrollTrigger.batch(cells, {
          start: "top 88%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease: "power3.out",
              // Column-wise rather than DOM order: axis:'x' makes the stagger
              // sweep left-to-right across the 3-column desktop grid.
              stagger: { each: 0.05, from: "start", grid: "auto", axis: "x" },
              overwrite: true,
            }),
        });

        directionalReveal("[data-stack-title]", {
          distance: 40,
          duration: 0.9,
          start: "top 82%",
          reversible: false,
        });

        return release;
      });

      mm.add(MEDIA.reduced, () => {
        // No marquee motion and no sweep (the overlay layers are display:none
        // under reduced motion); grid gets the flat 200ms fade.
        const cells = gsap.utils.toArray<HTMLElement>("[data-stack-cell]");
        gsap.set(cells, { opacity: 0 });
        ScrollTrigger.batch(cells, {
          start: "top 90%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, { opacity: 1, duration: 0.2, ease: "none" }),
        });
      });
      return unregister;
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="stack"
      className="border-hair relative overflow-hidden border-t py-16 md:py-[180px]"
    >
      <div className="mx-auto mb-8 grid max-w-[1240px] gap-4 px-5 md:mb-20 md:gap-10 md:px-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-20 lg:px-[60px]">
        <p className="text-accent font-mono text-[11px] tracking-[0.22em]">
          03 / STACK
        </p>
        <h2
          data-stack-title
          className="text-hi font-display m-0 text-[clamp(30px,4.4vw,68px)] leading-[0.98] font-semibold tracking-[-0.04em]"
        >
          Whatever the
          <br />
          problem needs.
        </h2>
      </div>

      {/* Second row is hidden on mobile per the design spec. */}
      <div className="mb-8 grid gap-2 md:mb-[90px] md:gap-4">
        <MarqueeRow words={MARQUEE_ROW_A} outerRef={rowA} />
        <div className="hidden md:block">
          <MarqueeRow words={MARQUEE_ROW_B} outerRef={rowB} />
        </div>
      </div>

      <dl className="bg-hair-2 mx-auto grid max-w-[1240px] grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-3">
        {STACK_GRID.map((group) => (
          <div
            key={group.label}
            data-stack-cell
            className="bg-ink grid gap-2 px-5 py-5 md:gap-3.5 md:px-[30px] md:py-[34px]"
          >
            <dt className="text-accent font-mono text-[10px] tracking-[0.2em]">
              {group.label}
            </dt>
            <dd className="text-muted m-0 text-[15px] leading-[1.85] md:text-base">
              {group.items}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
