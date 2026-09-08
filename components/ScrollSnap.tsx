"use client";

import { useRef } from "react";
import { gsap, useGSAP, Observer, ScrollTrigger, MEDIA } from "@/lib/gsap";
import { collectStops, maxScrollY, type Stop } from "@/lib/snap";
import { scrollToY, freezeScroll, thawScroll } from "@/lib/lenis";
import { runCurtain, CURTAIN_TOTAL } from "@/lib/curtain";
import { isIntroReleased, onIntroRelease } from "@/lib/intro";
import { setActiveSection } from "@/lib/section";

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
          const maxY = maxScrollY();

          // Clamp, never DROP. The old code filtered out every stop past the
          // maximum scroll, which silently deleted Contact's stop on any
          // viewport taller than the footer: the section then had no stop, no
          // section id and no curtain label of its own, so entering it played
          // no transition and clicking CONTACT in the nav did nothing.
          stops = [];
          for (const stop of collectStops()) {
            const y = Math.min(stop.y, maxY);
            const previous = stops[stops.length - 1];

            if (previous && y - previous.y <= 8) {
              // Two stops resolving to the same pixel. Anywhere in the middle
              // of the page the earlier one wins, as before. At the document
              // bottom the LATER one wins instead: several trailing sections
              // can clamp onto the same final pixel, and the deepest is the
              // one the visitor is trying to reach.
              if (y >= maxY - 1) stops[stops.length - 1] = { ...stop, y };
              continue;
            }

            stops.push({ ...stop, y });
          }

          // The document bottom is ALWAYS a stop. Without it the last section
          // snaps to its own top and everything below the fold there becomes
          // unreachable, because preventDefault has already eaten the gesture
          // by the time we decide not to move.
          if (!stops.length || maxY - stops[stops.length - 1].y > 8) {
            stops.push({
              y: maxY,
              measure: maxScrollY,
              // Shares the last real stop's section so reaching the footer is
              // not treated as arriving somewhere new.
              section: stops[stops.length - 1]?.section ?? "end",
              eyebrow: stops[stops.length - 1]?.eyebrow,
              title: stops[stops.length - 1]?.title,
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
          // Nothing moves until the loader hands off. useGSAP runs on a layout
          // effect, so this Observer is live before the first paint — a wheel
          // during the intro used to run a full curtain + teleport UNDER the
          // panel (z-1000 vs the curtain's z-940), landing the visitor in
          // About having never seen the hero. The freeze below still applies
          // throughout; only the stepping waits.
          if (!isIntroReleased()) return;

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
          // Publish before the move, not after: the nav marker should already
          // be on the incoming section while the curtain is covering, so it is
          // correct the instant the screen is uncovered.
          setActiveSection(target.section);
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
          if (!armed.current || !isIntroReleased()) return;
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

          /* Resolve by SECTION ID first, and only measure geometry if that
             fails. Every nav target registers stops under a section id equal
             to its own element id, so this is exact — and measuring is not:

               - A pinned section reports a bounding rect that depends on
                 whether its pin is currently engaged. Clicking WORK from
                 anywhere below it measured the pin's END, so the nearest stop
                 was the LAST card of the deck and the visitor landed on
                 project 05 having never seen 01.
               - A trailing section shorter than the viewport has a top past
                 the maximum scroll, so the nearest stop by distance is
                 whatever the clamp produced rather than the section itself.

             Falling back to distance keeps anchors working for any target that
             is not a registered section, such as the hero's #top. */
          let best = stops.findIndex((stop) => stop.section === id);

          if (best < 0) {
            const y = el.getBoundingClientRect().top + window.scrollY;
            let bestDist = Infinity;
            best = 0;
            stops.forEach((stop, i) => {
              const d = Math.abs(stop.y - y);
              if (d < bestDist) {
                bestDist = d;
                best = i;
              }
            });
          }

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
        setActiveSection(stops[nearest()]?.section ?? null);
        freezeScroll();
        // Stops depend on pin lengths, which are only final after a refresh.
        ScrollTrigger.addEventListener("refresh", refresh);
        // The hero settles out of a 1.06 scale on handoff, so re-measure once
        // it has. go() re-measures per gesture anyway; this just means the
        // first gesture after the intro is not the one paying for it.
        const offIntro = onIntroRelease(refresh);

        return () => {
          setActiveSection(null);
          offIntro();
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
