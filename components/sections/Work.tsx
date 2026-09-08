"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger, Observer, MEDIA } from "@/lib/gsap";
import { retainDirectionObserver } from "@/lib/direction";
import { scrollToY } from "@/lib/lenis";
import { registerStops } from "@/lib/snap";
import { PROJECTS, STATUS_LABEL, NEXT_LABELS } from "@/lib/data";

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

/** Max tilt in degrees when the pointer reaches the edge of the stage. */
const TILT = 5;

export default function Work() {
  const root = useRef<HTMLElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const callsign = useRef<HTMLSpanElement>(null);
  const indexNav = useRef<HTMLDivElement>(null);
  const ink = useRef<HTMLSpanElement>(null);
  const rail = useRef<HTMLSpanElement>(null);
  const counter = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const total = PROJECTS.length;

      /* ------------------------------------------------------------------
         Pinned card deck — every width.

         Transport is a pinned ScrollTrigger with per-card stops, NOT an
         Observer that swallows the wheel. <ScrollSnap /> lands the page on
         those stops, so one gesture settles on exactly one card while
         keyboard, scrollbar and browser find all keep working. Observer is
         used below only for what it is uniquely good at: reading a drag.
      ------------------------------------------------------------------ */
      mm.add(MEDIA.motionOK, () => {
        const trackEl = track.current;
        const railEl = rail.current;
        const counterEl = counter.current;
        const callsignEl = callsign.current;
        const inkEl = ink.current;
        if (!trackEl || !railEl || !counterEl || !callsignEl || !inkEl) return;

        const release = retainDirectionObserver();
        const cards = gsap.utils.toArray<HTMLElement>("[data-card]");
        const tabs = gsap.utils.toArray<HTMLElement>("[data-index-tab]");
        const setRail = gsap.quickSetter(railEl, "scaleX");

        let index = -1;

        /**
         * Slide the underline to the active tab.
         *
         * The bar is 1px wide and stretched with scaleX rather than animated
         * on `width`, so the whole move is one composited transform. Its
         * geometry is read once per card change, never per frame.
         */
        const moveInk = (animate: boolean) => {
          const tab = tabs[index];
          if (!tab) return;
          gsap.to(inkEl, {
            x: tab.offsetLeft,
            scaleX: tab.offsetWidth,
            duration: animate ? 0.5 : 0,
            ease: "power3.out",
            overwrite: "auto",
          });

          /* Keep the active tab in view. The row does not fit a phone, so by
             card 04 the marker would be sliding to somewhere off-screen.
             Scrolls the ROW, never the page: window scroll belongs to Lenis
             and ScrollSnap, and scrollIntoView would reach for it. */
          const nav = indexNav.current;
          if (!nav || nav.scrollWidth <= nav.clientWidth) return;

          const pad = 16;
          const left = tab.offsetLeft - pad;
          const right = tab.offsetLeft + tab.offsetWidth + pad;
          const target =
            left < nav.scrollLeft
              ? left
              : right > nav.scrollLeft + nav.clientWidth
                ? right - nav.clientWidth
                : null;

          if (target !== null) {
            nav.scrollTo({
              left: target,
              behavior: animate ? "smooth" : "auto",
            });
          }
        };

        /**
         * Cross-fade the outlined project name behind the deck.
         *
         * One element with its text swapped at the midpoint, rather than five
         * stacked copies: at this size (up to 300px of display type) five
         * live layers is five paint layers for four invisible words.
         */
        const swapCallsign = (animate: boolean, direction: number) => {
          const name = PROJECTS[index].title;
          if (!animate) {
            callsignEl.textContent = name;
            gsap.set(callsignEl, { opacity: 1, xPercent: 0 });
            return;
          }

          gsap
            .timeline({ overwrite: "auto" })
            .to(callsignEl, {
              opacity: 0,
              xPercent: direction * -4,
              duration: 0.22,
              ease: "power2.in",
            })
            .add(() => {
              callsignEl.textContent = name;
            })
            .fromTo(
              callsignEl,
              { opacity: 0, xPercent: direction * 4 },
              { opacity: 1, xPercent: 0, duration: 0.55, ease: "power3.out" },
            );
        };

        /** Move the deck to `next`, animating only what actually changed. */
        const goTo = (next: number, animate = true) => {
          const clamped = gsap.utils.clamp(0, total - 1, next);
          if (clamped === index) return;
          const previous = index;
          const direction = clamped > index ? 1 : -1;
          index = clamped;

          cards.forEach((card, i) => {
            const { zIndex, ...motion } = deckState(i - index);
            // zIndex is set, never tweened: interpolating it would leave the
            // outgoing card painting over the incoming one for most of the
            // transition. Stacking order has to flip on frame one.
            gsap.set(card, { zIndex });

            // Queued and spent cards are visually gone, so they must be gone
            // to the keyboard and the screen reader too. Without this, tabbing
            // out of the active card walks straight into four invisible cards
            // and their links, and focus disappears off-screen.
            const hidden = i !== index;
            card.inert = hidden;
            card.setAttribute("aria-hidden", String(hidden));

            gsap.to(card, {
              ...motion,
              duration: animate ? 0.5 : 0,
              ease: "power3.out",
              overwrite: "auto",
            });
          });

          tabs.forEach((tab, i) => {
            const current = i === index;
            tab.setAttribute("aria-current", current ? "true" : "false");
            // Roving tabindex: one stop for the whole index, arrow keys move
            // within it. Five separate tab stops for what is really one
            // control is what makes keyboard use of a deck tedious.
            tab.tabIndex = current ? 0 : -1;
          });

          swapCallsign(animate && previous !== -1, direction);
          moveInk(animate && previous !== -1);

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
        // The ink bar needs a laid-out tab row to measure, which is not
        // guaranteed on the frame useGSAP runs. One frame later it is.
        const firstInk = requestAnimationFrame(() => moveInk(false));

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
          onUpdate: (self) => {
            goTo(Math.round(self.progress * (total - 1)));
          },
          onRefresh: () => moveInk(false),
        });

        /* One snap stop per card, taken from the pin range. This is why a
           gesture inside Work advances the DECK instead of skipping the whole
           section: ScrollSnap sees five stops here, not one. */
        const cardY = (i: number) =>
          st.start + ((st.end - st.start) * i) / (total - 1);

        const unregisterStops = registerStops(() =>
          Array.from({ length: total }, (_, i) => ({
            y: cardY(i),
            // Re-read from the live ScrollTrigger rather than a captured
            // number: st.start/st.end move whenever the pin is recalculated.
            measure: () => cardY(i),
            // EVERY card shares the section id, so stepping between them never
            // wipes the screen — the deck 3D transition is the transition here,
            // and covering it would hide the one thing the user is looking at.
            section: "work",
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
          // `force`, because ScrollSnap keeps Lenis stopped. Without it Lenis
          // discards the request outright and the deck simply does not move,
          // which is what made dragging a card do nothing at all.
          scrollToY(st.start + (span * clamped) / (total - 1), 0.5, true);
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

        /* The index is a real control, not a readout: click a project to jump
           straight to it, or arrow along the row from the keyboard. It is the
           only way to reach card 04 without stepping through 02 and 03. */
        const onTabClick = (event: Event) => {
          const tab = (event.target as Element).closest("[data-index-tab]");
          if (!tab) return;
          scrollToCard(tabs.indexOf(tab as HTMLElement));
        };

        const onTabKey = (event: KeyboardEvent) => {
          const step =
            event.key === "ArrowRight" || event.key === "ArrowDown"
              ? 1
              : event.key === "ArrowLeft" || event.key === "ArrowUp"
                ? -1
                : event.key === "Home"
                  ? -total
                  : event.key === "End"
                    ? total
                    : 0;
          if (!step) return;

          event.preventDefault();
          const next = gsap.utils.clamp(0, total - 1, index + step);
          scrollToCard(next);
          // Focus follows selection, so the next arrow press continues from
          // where the user just landed rather than from the tab they left.
          tabs[next]?.focus();
        };

        const navEl = indexNav.current;
        navEl?.addEventListener("click", onTabClick);
        navEl?.addEventListener("keydown", onTabKey);

        return () => {
          cancelAnimationFrame(firstInk);
          navEl?.removeEventListener("click", onTabClick);
          navEl?.removeEventListener("keydown", onTabKey);
          unregisterStops();
          observer.kill();
          release();
          // The deck is about to stop running, so nothing will be maintaining
          // these. Leaving four cards inert would hide most of the section.
          cards.forEach((card) => {
            card.inert = false;
            card.removeAttribute("aria-hidden");
          });
        };
      });

      /* Pointer parallax over the whole stage. Applied to a wrapper rather
         than to the cards, because deckState already owns each card's rotateX
         and two authorities on one transform is a fight nobody wins. */
      mm.add(MEDIA.desktopMotion, () => {
        const tiltEl = tilt.current;
        const bodyEl = body.current;
        if (!tiltEl || !bodyEl) return;

        const rotX = gsap.quickTo(tiltEl, "rotationX", {
          duration: 0.9,
          ease: "power3",
        });
        const rotY = gsap.quickTo(tiltEl, "rotationY", {
          duration: 0.9,
          ease: "power3",
        });

        // Cached and invalidated, so pointermove performs no layout reads.
        let box = bodyEl.getBoundingClientRect();
        let stale = false;
        const markStale = () => {
          stale = true;
        };

        const onMove = (event: PointerEvent) => {
          if (stale) {
            box = bodyEl.getBoundingClientRect();
            stale = false;
          }
          const x = (event.clientX - box.left) / box.width - 0.5;
          const y = (event.clientY - box.top) / box.height - 0.5;
          rotY(x * TILT * 2);
          rotX(-y * TILT);
        };

        const onLeave = () => {
          rotX(0);
          rotY(0);
        };

        bodyEl.addEventListener("pointermove", onMove);
        bodyEl.addEventListener("pointerleave", onLeave);
        window.addEventListener("scroll", markStale, { passive: true });
        window.addEventListener("resize", markStale);

        return () => {
          bodyEl.removeEventListener("pointermove", onMove);
          bodyEl.removeEventListener("pointerleave", onLeave);
          window.removeEventListener("scroll", markStale);
          window.removeEventListener("resize", markStale);
          gsap.set(tiltEl, { rotationX: 0, rotationY: 0 });
        };
      });

      /* Reduced motion gets the CSS rail from globals.css: every card laid out
         in a horizontal scroll-snap strip, no pin, no deck, no transforms. */
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
        <header className="mx-auto flex w-full max-w-[1240px] flex-col gap-3 px-5 pt-24 pb-4 md:gap-4 md:px-10 md:pt-[118px] md:pb-6 lg:px-[60px]">
          <p className="text-accent font-mono text-[11px] tracking-[0.22em]">
            02 / SELECTED WORK
          </p>
          <h2 className="text-hi font-display m-0 text-[clamp(30px,4.4vw,68px)] leading-[0.98] font-semibold tracking-[-0.04em]">
            Things that are
            <br />
            running right now.
          </h2>
        </header>

        <div ref={body} data-work-body className="relative">
          {/* The active project's name, outlined and running off the left
              edge, sitting behind the deck. It fills the dead space the card
              used to float in, and it is the one thing on this stage that
              reads from across a room.

              The wrapper owns the positioning and the span owns nothing but
              its own transform: GSAP writes xPercent here, and a Tailwind
              translate utility on the same element would be overwritten by it
              on the first tween. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 hidden items-center overflow-hidden select-none md:flex"
          >
            <span
              ref={callsign}
              data-work-callsign
              className="font-display -ml-[3vw] text-[clamp(150px,23vw,380px)] leading-[0.8] font-bold tracking-[-0.05em] whitespace-nowrap"
            />
          </div>

          <div ref={tilt} data-work-tilt>
            <div
              ref={track}
              data-work-track
              className="no-scrollbar flex gap-5 px-5 pb-2 md:gap-[30px] md:px-10 md:pb-0 lg:px-[60px]"
            >
              {PROJECTS.map((project) => (
                <article
                  key={project.title}
                  data-card
                  className="border-hair-2 bg-panel relative grid min-h-[420px] w-[85vw] shrink-0 grid-rows-[auto_1fr_auto] gap-4 overflow-hidden border p-5 sm:w-[70vw] sm:p-6 md:min-h-0 md:w-[520px] md:gap-7 md:p-9"
                >
                  {/* Structural, not decorative: it marks the card's live edge
                      against the ghost type showing through behind it. */}
                  <span
                    aria-hidden
                    className="bg-accent absolute top-0 left-0 h-px w-10"
                  />

                  <div className="flex items-start justify-between gap-4">
                    <span className="text-accent font-display text-[34px] leading-none font-bold tracking-[-0.04em] tabular-nums md:text-[44px]">
                      {project.index}
                    </span>

                    <span className="grid justify-items-end gap-2 text-right">
                      <span className="text-dim font-mono text-[10px] tracking-[0.18em] uppercase">
                        {project.meta}
                      </span>
                      <span
                        className={`inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.16em] uppercase ${
                          project.status === "live"
                            ? "text-accent"
                            : "text-dim-2"
                        }`}
                      >
                        {/* The one dot on the page, and it means something:
                            this is running right now and you can open it. */}
                        {project.status === "live" && (
                          <span
                            aria-hidden
                            className="bg-accent animate-live inline-block h-1.5 w-1.5 rounded-full"
                          />
                        )}
                        {STATUS_LABEL[project.status]}
                      </span>
                    </span>
                  </div>

                  <div className="grid content-start gap-4">
                    <h3 className="text-hi font-display m-0 text-[30px] leading-[1] font-semibold tracking-[-0.03em] sm:text-[36px] md:text-[52px]">
                      {project.title}
                    </h3>
                    <p className="text-muted-2 m-0 max-w-[46ch] text-[14px] leading-[1.55] text-pretty sm:text-[15px] md:text-[17px]">
                      {project.summary}
                    </p>
                    <p className="text-dim m-0 max-w-[62ch] font-mono text-[10px] leading-[1.7] md:text-[11px]">
                      {project.detail}
                    </p>
                  </div>

                  <div className="grid gap-5">
                    <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                      {project.stack.map((tech) => (
                        <li
                          key={tech}
                          data-pill
                          className="text-muted border-hair-3 hover:border-accent hover:text-accent border px-2.5 py-1.5 font-mono text-[10px] tracking-[0.1em] transition-colors duration-300"
                        >
                          {tech}
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-wrap items-center gap-5 font-mono text-[11px] tracking-[0.14em] uppercase">
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
          </div>
        </div>

        {/* The index. A control, not a caption: the only way to reach card 04
            without stepping through 02 and 03, and the only way to drive the
            deck from the keyboard. */}
        <div className="mx-auto grid w-full max-w-[1240px] gap-4 px-5 pb-8 md:gap-5 md:px-10 md:pb-12 lg:px-[60px]">
          <div
            ref={indexNav}
            data-work-index
            role="group"
            aria-label="Project index"
            className="no-scrollbar relative -mx-1 flex gap-1 overflow-x-auto overscroll-x-contain px-1"
          >
            {PROJECTS.map((project, i) => (
              <button
                key={project.title}
                type="button"
                data-index-tab
                aria-current={i === 0 ? "true" : "false"}
                tabIndex={i === 0 ? 0 : -1}
                className="group text-dim hover:text-body aria-[current=true]:text-hi flex min-h-11 shrink-0 touch-manipulation items-center gap-2 pr-5 font-mono text-[10px] tracking-[0.16em] whitespace-nowrap uppercase transition-colors duration-300 md:text-[11px]"
              >
                <span className="text-dim-2 group-aria-[current=true]:text-accent tabular-nums transition-colors duration-300">
                  {project.index}
                </span>
                {project.title}
              </button>
            ))}

            {/* Baseline first, then the ink bar, so the bar paints on top of
                it without either needing a z-index. */}
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-px bg-[rgb(255_255_255_/_0.08)]"
            />
            {/* 1px wide and stretched with scaleX, so moving between tabs is
                one composited transform rather than an animated width. */}
            <span
              ref={ink}
              aria-hidden
              className="bg-accent absolute bottom-0 left-0 h-px w-px origin-left"
            />
          </div>

          <div className="flex items-center gap-4 md:gap-5">
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
          </div>
        </div>
      </div>
    </section>
  );
}
