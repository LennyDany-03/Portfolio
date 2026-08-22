"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger, Observer, MEDIA } from "@/lib/gsap";
import { retainDirectionObserver } from "@/lib/direction";
import { scrollToY } from "@/lib/lenis";
import { registerStops } from "@/lib/snap";
import { PROJECTS, NEXT_LABELS } from "@/lib/data";

/**
 * Resting transform for a card, by its distance from the active one.
 *
 *   p < 0  already read — swiped up and out, tilted away from the viewer
 *   p = 0  active
 *   p > 0  queued — stacked below, progressively smaller and dimmer
 *
 * Returning a plain object (rather than tweening ad hoc) means the deck can be
 * re-applied idempotently from any index, which is what makes jumping several
 * cards at once — or landing mid-deck on a refresh — settle correctly.
 */
function deckState(p: number) {
  if (p < 0) {
    return {
      yPercent: -62,
      scale: 0.9,
      rotateX: 14,
      opacity: 0,
      zIndex: 0,
      filter: "blur(6px)",
    };
  }
  if (p === 0) {
    return {
      yPercent: 0,
      scale: 1,
      rotateX: 0,
      opacity: 1,
      zIndex: 40,
      filter: "blur(0px)",
    };
  }
  return {
    yPercent: 5 + p * 4,
    scale: 1 - p * 0.06,
    rotateX: -5,
    opacity: p === 1 ? 0.42 : p === 2 ? 0.18 : 0,
    zIndex: 40 - p,
    filter: `blur(${Math.min(p * 2, 6)}px)`,
  };
}

export default function Work() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLSpanElement>(null);
  const counter = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const total = PROJECTS.length;

      /* ------------------------------------------------------------------
         Desktop: pinned card deck.

         Transport is a pinned ScrollTrigger with snap, NOT an Observer that
         swallows the wheel. Snapping to 1/(total-1) means one ordinary scroll
         gesture settles on exactly one card — the same "one flick, one card"
         feel — while keyboard, scrollbar, trackpad and touch all keep working
         and the user can never be trapped inside a section that has stopped
         responding. Observer is used for what it is uniquely good at below:
         reading a drag, and reporting gesture direction.
      ------------------------------------------------------------------ */
      mm.add(MEDIA.desktopMotion, () => {
        const trackEl = track.current;
        const railEl = rail.current;
        const counterEl = counter.current;
        if (!trackEl || !railEl || !counterEl) return;

        const release = retainDirectionObserver();
        const cards = gsap.utils.toArray<HTMLElement>("[data-card]");
        const setRail = gsap.quickSetter(railEl, "scaleX");

        let index = -1;

        /** Move the deck to `next`, animating only what actually changed. */
        const goTo = (next: number, animate = true) => {
          const clamped = gsap.utils.clamp(0, total - 1, next);
          if (clamped === index) return;
          const previous = index;
          index = clamped;

          cards.forEach((card, i) => {
            const { zIndex, ...motion } = deckState(i - index);
            // zIndex is set, never tweened: interpolating it would leave the
            // outgoing card painting over the incoming one for most of the
            // transition. Stacking order has to flip on frame one.
            gsap.set(card, { zIndex });

            gsap.to(card, {
              ...motion,
              duration: animate ? 0.5 : 0,
              ease: "power3.out",
              overwrite: "auto",
            });
          });

          // Tag pills stagger in just behind the card that just became active.
          if (animate && previous !== -1) {
            const pills = cards[index].querySelectorAll("[data-pill]");
            gsap.fromTo(
              pills,
              { opacity: 0, y: 10 },
              {
                opacity: 1,
                y: 0,
                duration: 0.4,
                stagger: 0.04,
                delay: 0.14,
                ease: "power3.out",
                overwrite: "auto",
              },
            );
          }

          setRail(gsap.utils.mapRange(0, total - 1, 1 / total, 1, index));
          counterEl.textContent =
            String(index + 1).padStart(2, "0") +
            " / " +
            String(total).padStart(2, "0");
        };

        goTo(0, false);

        const st = ScrollTrigger.create({
          trigger: root.current,
          start: "top top",
          // One viewport of scroll per transition. invalidateOnRefresh re-reads
          // this on resize so the deck keeps its pacing at any window height.
          end: () => "+=" + window.innerHeight * (total - 1),
          pin: true,
          // No anticipatePin. It pins slightly EARLY to smooth fast scrolling,
          // which is exactly wrong when ScrollSnap teleports the page — the
          // early pin fires against a scroll position that is about to jump,
          // and leaves the section half-pinned.
          invalidateOnRefresh: true,
          // NO snap here. <ScrollSnap /> already lands the page exactly on the
          // per-card stops registered below, and it gates on the same media
          // query — so a snap would be a second authority animating the same
          // scroll position, fighting Lenis and double-settling every card.
          // If ScrollSnap ever disarms itself, this degrades to continuous
          // scrubbing through the deck, which is still correct.
          onUpdate: (self) => {
            goTo(Math.round(self.progress * (total - 1)));
          },
        });

        /* One snap stop per card, taken from the pin range. This is why a
           gesture inside Work advances the DECK instead of skipping the whole
           section: ScrollSnap sees five stops here, not one. Recomputed on
           every collect(), so a resize that changes the pin length is picked
           up without re-registering. */
        const cardY = (i: number) =>
          st.start + ((st.end - st.start) * i) / (total - 1);

        const unregisterStops = registerStops(() =>
          Array.from({ length: total }, (_, i) => ({
            y: cardY(i),
            // Re-read from the live ScrollTrigger rather than a captured
            // number: st.start/st.end move whenever the pin is recalculated.
            measure: () => cardY(i),
            // Only ARRIVING at the section gets the curtain. Card-to-card steps
            // stay uncovered so the deck 3D transition is actually visible —
            // wiping the screen between cards would hide the one thing the
            // user is looking at.
            curtain: i === 0,
            eyebrow: NEXT_LABELS.work.eyebrow,
            title: NEXT_LABELS.work.title,
          })),
        );

        /** Drive the deck by moving the PAGE, so ScrollTrigger stays the single
            source of truth for where we are — the deck can never disagree with
            the scroll position. */
        const scrollToCard = (target: number) => {
          const clamped = gsap.utils.clamp(0, total - 1, target);
          if (clamped === index) return;
          const span = st.end - st.start;
          scrollToY(st.start + (span * clamped) / (total - 1), 0.5);
        };

        /* Drag / swipe to flip a card. This is the part ScrollTrigger cannot
           do: a pointer DRAG produces no scroll event at all, so without
           Observer the deck would be wheel-only. preventDefault stays false —
           the gesture is translated into a scroll position, never swallowed. */
        const observer = Observer.create({
          target: trackEl,
          type: "pointer,touch",
          preventDefault: false,
          allowClicks: true,
          tolerance: 60,
          onUp: () => scrollToCard(index + 1),
          onDown: () => scrollToCard(index - 1),
          onLeft: () => scrollToCard(index + 1),
          onRight: () => scrollToCard(index - 1),
        });

        return () => {
          unregisterStops();
          observer.kill();
          release();
        };
      });

      /* ------------------------------------------------------------------
         Below 768px: no pin, no deck. The track is a native scroll-snap rail
         (see globals.css) and cards simply rise on entry.
      ------------------------------------------------------------------ */
      mm.add(MEDIA.mobileMotion, () => {
        gsap.from("[data-card]", {
          opacity: 0,
          y: 30,
          duration: 0.7,
          stagger: 0.06,
          ease: "power3.out",
          scrollTrigger: {
            trigger: root.current,
            start: "top 75%",
            once: true,
          },
        });
      });

      mm.add(MEDIA.reduced, () => {
        gsap.from("[data-card]", {
          opacity: 0,
          duration: 0.2,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top 75%",
            once: true,
          },
        });
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="work"
      className="border-hair relative border-t"
      aria-label="Selected work"
    >
      <div
        data-work-stage
        className="flex flex-col justify-center gap-10 py-24 md:gap-0 md:py-0"
      >
        <header className="mx-auto flex w-full max-w-[1240px] flex-col gap-4 px-5 md:px-10 md:pt-[118px] md:pb-6 lg:px-[60px]">
          <p className="text-accent font-mono text-[11px] tracking-[0.22em]">
            02 / SELECTED WORK
          </p>
          <h2 className="text-hi font-display m-0 text-[clamp(30px,4.4vw,68px)] leading-[0.98] font-semibold tracking-[-0.04em]">
            Things that are
            <br />
            running right now.
          </h2>
        </header>

        <div
          ref={track}
          data-work-track
          className="no-scrollbar flex gap-5 px-5 pb-2 md:gap-[30px] md:px-10 md:pb-0 lg:px-[60px]"
        >
          {PROJECTS.map((project) => (
            <article
              key={project.title}
              data-card
              className="border-hair-2 bg-panel grid min-h-[420px] w-[85vw] shrink-0 grid-rows-[auto_1fr_auto] gap-6 border p-7 sm:w-[70vw] md:min-h-0 md:w-[520px] md:gap-[26px] md:p-[38px]"
            >
              <div className="text-dim flex items-center justify-between font-mono text-[10px] tracking-[0.18em]">
                <span className="text-accent">{project.index}</span>
                <span>{project.meta}</span>
              </div>

              <div className="grid content-start gap-4">
                <h3 className="text-hi font-display m-0 text-[36px] font-semibold tracking-[-0.03em] md:text-[44px]">
                  {project.title}
                </h3>
                <p className="text-muted-2 m-0 text-[16px] leading-[1.6] md:text-[17px]">
                  {project.summary}
                </p>
                <p className="text-dim m-0 font-mono text-[11px] leading-[1.8]">
                  {project.detail}
                </p>
              </div>

              <div className="grid gap-5">
                <ul className="flex flex-wrap gap-2">
                  {project.stack.map((tech) => (
                    <li
                      key={tech}
                      data-pill
                      className="text-muted border-hair-3 border px-2.5 py-1.5 font-mono text-[10px] tracking-[0.1em]"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>

                <div className="flex gap-5 font-mono text-[11px] tracking-[0.14em] uppercase">
                  {project.links.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      data-cursor-label="Open"
                      className={
                        link.primary
                          ? "text-accent hover:text-accent-soft transition-colors"
                          : "text-dim hover:text-body transition-colors"
                      }
                    >
                      {link.label} <span aria-hidden>↗</span>
                    </a>
                  ))}
                  {project.note && (
                    <span className="text-dim-2">{project.note}</span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mx-auto flex w-full max-w-[1240px] items-center gap-5 px-5 md:px-10 md:pb-12 lg:px-[60px]">
          <span
            ref={counter}
            className="text-dim font-mono text-[11px] tracking-[0.18em] tabular-nums"
          >
            01 / {String(PROJECTS.length).padStart(2, "0")}
          </span>
          <div
            aria-hidden
            className="relative h-px flex-1 bg-[rgb(255_255_255_/_0.1)]"
          >
            <span
              ref={rail}
              className="bg-accent absolute inset-0 block origin-left"
              style={{ transform: "scaleX(0.2)" }}
            />
          </div>
          <span className="text-dim-2 font-mono text-[10px] tracking-[0.18em]">
            <span className="md:hidden">Swipe →</span>
            <span className="hidden md:inline">Scroll / drag</span>
          </span>
        </div>
      </div>
    </section>
  );
}
