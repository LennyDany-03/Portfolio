"use client";

import { gsap, Observer, ScrollTrigger } from "@/lib/gsap";

/**
 * Global scroll-direction signal, powered by a single GSAP Observer.
 *
 * Every reveal in the app asks this which way the user is travelling at the
 * moment it fires, so content swipes UP when scrolling down and DOWN when
 * scrolling back up — instead of every element always rising from below no
 * matter which direction you approached it from.
 *
 * Why Observer rather than ScrollTrigger's own `direction`: Observer reads the
 * raw wheel/touch gesture, so it reports intent on the first event, before the
 * scroll position has moved far enough for ScrollTrigger to flip. It also sees
 * touch drags that produce no scroll event at all.
 *
 * One instance for the page, reference-counted so it dies with its last
 * consumer.
 */

/** 1 = travelling down the page, -1 = travelling up. */
let direction = 1;
let observer: Observer | null = null;
let consumers = 0;

export const getDirection = () => direction;

/** Start (or join) the shared observer. Returns a release function. */
export function retainDirectionObserver() {
  consumers += 1;

  observer ??= Observer.create({
    target: window,
    type: "wheel,touch,scroll",
    // This observer only listens — it must never swallow a gesture. The Work
    // deck, which genuinely consumes scroll, creates its own.
    preventDefault: false,
    allowClicks: true,
    tolerance: 4,
    onChangeY: (self) => {
      // deltaY > 0 means the content moved up, i.e. the user scrolled down.
      if (self.deltaY) direction = self.deltaY > 0 ? 1 : -1;
    },
  });

  return () => {
    consumers -= 1;
    if (consumers <= 0) {
      observer?.kill();
      observer = null;
      consumers = 0;
    }
  };
}

export type RevealOptions = {
  /** Travel distance in px. */
  distance?: number;
  duration?: number;
  ease?: string;
  /** Viewport position at which the reveal fires. */
  start?: string;
  /**
   * Drive every target from ONE trigger with a stagger, instead of giving each
   * its own. Use for tight clusters (footer links, a stat row) that should move
   * as a unit; leave unset for a column, where each element's own crossing of
   * the line is a better stagger than any fixed value.
   */
  trigger?: Element | null;
  stagger?: number;
  /** Animate back out on the way past. Off = reveal once and stay put. */
  reversible?: boolean;
};

/**
 * Direction-aware reveal.
 *
 * Scrolling down, elements rise into place from below and lift away upward.
 * Scrolling up, the whole thing mirrors: they descend from above and sink back
 * down. The four ScrollTrigger callbacks map to the four ways an element can
 * cross the viewport:
 *
 *   onEnter      scrolling down, arriving from the bottom  -> come up
 *   onLeave      scrolling down, exiting via the top       -> continue up
 *   onEnterBack  scrolling up,   arriving from the top     -> come down
 *   onLeaveBack  scrolling up,   exiting via the bottom    -> continue down
 *
 * The ScrollTriggers belong to whatever gsap.context/matchMedia scope is active
 * when this is called, so they revert with it. No manual teardown needed.
 */
export function directionalReveal(
  targets: gsap.TweenTarget,
  {
    distance = 48,
    duration = 0.7,
    ease = "power3.out",
    start = "top 85%",
    trigger,
    stagger = 0.06,
    reversible = true,
  }: RevealOptions = {},
) {
  const elements = gsap.utils.toArray<HTMLElement>(targets);
  if (!elements.length) return;

  gsap.set(elements, { opacity: 0, y: distance });

  const show = (group: HTMLElement[]) =>
    gsap.to(group, {
      opacity: 1,
      y: 0,
      duration,
      ease,
      stagger: group.length > 1 ? stagger : 0,
      overwrite: "auto",
    });

  /** sign -1 continues upward (exiting the top), +1 downward. */
  const hide = (group: HTMLElement[], sign: number) =>
    gsap.to(group, {
      opacity: 0,
      y: distance * sign,
      duration: duration * 0.55,
      ease: "power2.in",
      overwrite: "auto",
    });

  const wire = (group: HTMLElement[], triggerEl: Element) => {
    const st = ScrollTrigger.create({
      trigger: triggerEl,
      start,
      end: "bottom 12%",
      onEnter: () => {
        // Seed the start position from the live gesture direction, so a fast
        // scroll that jumps the element straight into view still enters the
        // right way round.
        gsap.set(group, { y: getDirection() > 0 ? distance : -distance });
        show(group);
      },
      onEnterBack: () => {
        gsap.set(group, { y: -distance });
        show(group);
      },
      onLeave: () => {
        if (reversible) hide(group, -1);
      },
      onLeaveBack: () => {
        if (reversible) hide(group, 1);
      },
    });

    // Anything ALREADY past its start when the page settles never receives
    // onEnter, and would sit at opacity 0 forever. That is not an edge case:
    // it happens on every reload where the browser restores scroll position,
    // and on any deep link such as /#frames. Show those immediately.
    if (st.progress > 0 || st.isActive) {
      gsap.set(group, { opacity: 1, y: 0 });
    }
  };

  if (trigger) {
    wire(elements, trigger);
  } else {
    elements.forEach((el) => wire([el], el));
  }
}
