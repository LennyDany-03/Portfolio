"use client";

import { useRef } from "react";
import { gsap, useGSAP, Observer, ScrollTrigger, MEDIA } from "@/lib/gsap";
import { collectStops, type Stop } from "@/lib/snap";
import { scrollToY, freezeScroll, thawScroll } from "@/lib/lenis";
import { runCurtain, CURTAIN_TOTAL } from "@/lib/curtain";

/**
 * Step duration for stops that do NOT play the curtain — Work card changes and
 * movement inside a tall section. Deliberately shorter than the curtain: there
 * is nothing covering the screen here, so the lock is felt directly and a long
 * one reads as the page ignoring you.
 */
const PLAIN_STEP = 0.42;

/**
 * One gesture, one beat — on a page that cannot be scrolled by hand.
 *
 * The lock is TWO things, and it does not work with only one of them:
 *
 *  1. Observer.preventDefault() cancels the browser's native wheel scroll.
 *  2. Lenis is STOPPED. Lenis drives scroll from its own wheel handling and
 *     does not care that the native default was cancelled, so leaving it
 *     running let the page keep scrolling freely between sections. Every
 *     programmatic move therefore passes `force`, which is Lenis's "scroll even
 *     though you are stopped".
 *
 * Deliberate limits, because this pattern is hostile applied bluntly:
 *
 *  - DESKTOP ONLY. On a phone the About paragraph does not fit one viewport and
 *    locking fights the platform's own scroll physics.
 *  - Reduced motion turns it off entirely; the page stays a normal document.
 *  - Keyboard, Home/End and browser find still scroll natively, and landing
 *    off-grid is fine: the next gesture steps from whichever stop is nearest.
 *  - Two failsafes below hand scrolling back rather than trapping anyone.
 */
export default function ScrollSnap() {
  const armed = useRef(true);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add(
      // All widths now, not just desktop. Mobile is the one place this pattern
      // usually breaks — long text does not fit a phone viewport — but that is
      // already solved: sectionStop() emits one interior stop per viewport, so
      // a tall section simply becomes more slides on a small screen instead of
      // hiding its bottom half.
      MEDIA.motionOK,
      () => {
        let animating = false;
        let lockedAt = 0;
        let stops: Stop[] = [];

        const refresh = () => {
          const maxY = Math.max(
            0,
            document.documentElement.scrollHeight - window.innerHeight,
          );
          stops = collectStops().filter((s) => s.y <= maxY);
          // The document bottom is ALWAYS a stop. Without it the last section
          // snaps to its own top and everything below the fold there — the
          // whole footer — becomes unreachable, because preventDefault has
          // already eaten the gesture by the time we decide not to move.
          if (!stops.length || maxY - stops[stops.length - 1].y > 8) {
            const bottom = () =>
              Math.max(
                0,
                document.documentElement.scrollHeight - window.innerHeight,
              );
            // Shares the last real stop section so reaching the footer is not
            // treated as arriving somewhere new.
            stops.push({
              y: maxY,
              measure: bottom,
              section: stops[stops.length - 1]?.section ?? "end",
            });
          }
        };

        /** Hand scrolling back permanently. Used only by the failsafes. */
        const disarm = () => {
          armed.current = false;
          observer.disable();
          thawScroll();
        };

        /** Index of the stop we are currently sitting on (or nearest to). */
        const nearest = () => {
          const y = window.scrollY;
          let best = 0;
          let bestDist = Infinity;
          stops.forEach((stop, i) => {
            const d = Math.abs(stop.y - y);
            if (d < bestDist) {
              bestDist = d;
              best = i;
            }
          });
          return best;
        };

        const go = (delta: number) => {
          if (!armed.current) return;

          if (animating) {
            // Watchdog, not an impatience counter. Counting blocked gestures
            // would punish ordinary trackpad inertia, which easily fires a
            // dozen events inside one transition. Time is the honest signal:
            // if the lock has outlived a whole transition several times over,
            // something failed to release it, so break out.
            if (performance.now() - lockedAt > CURTAIN_TOTAL * 3000) {
              animating = false;
            } else {
              return;
            }
          }

          // Re-measure on EVERY gesture, not just when the list is empty.
          // ScrollSnap mounts before the sections do, so the first refresh can
          // see nothing but the document-bottom fallback — a single stop, which
          // is not empty, so an "only if empty" guard would never correct it and
          // every gesture would be eaten with nowhere to go. Costs about five
          // getBoundingClientRect calls, once per gesture, never per frame.
          refresh();
          if (!stops.length) {
            // Nothing registered. The gesture is already cancelled, so holding
            // the lock here would leave the page unscrollable forever.
            disarm();
            return;
          }

          const from = nearest();
          stepTo(from + delta);
        };

        /** Move to a stop by index. Shared by gestures and by anchor clicks. */
        const stepTo = (next: number) => {
          // go() clears this via its watchdog first; anchor clicks come in
          // without that check, so the guard belongs here too.
          if (animating) return;
          const from = nearest();
          if (next === from || next < 0 || next >= stops.length) return;
          const delta = next > from ? 1 : -1;

          const target = stops[next];
          // The curtain marks crossing SECTIONS, not reaching a given stop.
          // Within Work that means card-to-card stays uncovered in both
          // directions — including scrolling back up to card 01, which used to
          // fire a full wipe because it doubled as the section entry.
          const crossing = stops[from].section !== target.section;
          animating = true;
          lockedAt = performance.now();

          // Curtained stop: the page TELEPORTS while the screen is covered.
          // That is what makes it read as one slide replacing another rather
          // than a fast scroll past everything in between — and the jump
          // crosses every reveal trigger at once, so the incoming section
          // animates in exactly as the bands clear.
          const covered = () => {
            scrollToY(target.y, 0, true);

            // Land, then CHECK. Engaging or releasing the Work pin changes
            // layout, so the position measured a moment ago can be stale by a
            // fraction of a viewport by the time we arrive — which is what
            // parked the page halfway between Work and Stack. We are still
            // fully covered here, so the correction is invisible.
            requestAnimationFrame(() => {
              const fresh = target.measure();
              if (
                Number.isFinite(fresh) &&
                Math.abs(fresh - window.scrollY) > 2
              ) {
                scrollToY(fresh, 0, true);
              }
            });
          };

          const usedCurtain =
            crossing &&
            runCurtain(delta > 0 ? 1 : -1, covered, {
              eyebrow: target.eyebrow,
              title: target.title,
            });

          // Uncurtained stop (a Work card): nothing is hiding the travel, so
          // animate it instead of teleporting.
          if (!usedCurtain) scrollToY(target.y, PLAIN_STEP, true);

          gsap.delayedCall(
            usedCurtain ? CURTAIN_TOTAL : PLAIN_STEP + 0.02,
            () => {
              animating = false;
            },
          );
        };

        /* Nav links have to be intercepted.
           Lenis handles #hash links itself via its `anchors` option, but that
           path calls its own scrollTo WITHOUT `force` — and the page is frozen,
           so Lenis ignores it and the link silently does nothing. Routing
           anchors through stepTo() also means clicking WORK gets the same
           curtain as swiping to it, rather than a second kind of navigation. */
        const onAnchorClick = (event: MouseEvent) => {
          if (!armed.current) return;
          if (event.defaultPrevented || event.metaKey || event.ctrlKey) return;

          const link = (event.target as Element | null)?.closest?.(
            'a[href^="#"]',
          );
          if (!link) return;

          const id = link.getAttribute("href")?.slice(1);
          const el = id ? document.getElementById(id) : null;
          if (!el) return;

          event.preventDefault();
          refresh();
          if (!stops.length) return;

          // Land on the registered stop nearest the target, so anchors can
          // never drop the page somewhere the gesture system cannot resume from.
          const y = el.getBoundingClientRect().top + window.scrollY;
          let best = 0;
          let bestDist = Infinity;
          stops.forEach((stop, i) => {
            const d = Math.abs(stop.y - y);
            if (d < bestDist) {
              bestDist = d;
              best = i;
            }
          });
          stepTo(best);
        };

        document.addEventListener("click", onAnchorClick);

        const observer = Observer.create({
          target: window,
          type: "wheel,touch",
          // Half the lock. freezeScroll() below is the other half.
          preventDefault: true,
          allowClicks: true,
          // High tolerance so one trackpad flick is one step, not five.
          tolerance: 24,
          // Touch only: ignore anything under 12px so a tap, or the tiny drag
          // that comes with one, never counts as a swipe. Without it a stray
          // finger movement while reading would flip the section.
          dragMinimum: 12,
          wheelSpeed: -1,
          onUp: () => go(1),
          onDown: () => go(-1),
        });

        refresh();
        freezeScroll();
        // Stops depend on pin lengths, which are only final after a refresh.
        ScrollTrigger.addEventListener("refresh", refresh);

        return () => {
          document.removeEventListener("click", onAnchorClick);
          ScrollTrigger.removeEventListener("refresh", refresh);
          observer.kill();
          thawScroll();
          armed.current = true;
        };
      },
    );
  });

  return null;
}
