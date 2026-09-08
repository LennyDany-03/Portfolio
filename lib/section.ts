"use client";

/**
 * Which section the visitor is currently in.
 *
 * A module channel, like lib/curtain.ts, because the publisher and the
 * subscriber live in different branches of the layout tree and the publisher
 * runs inside a gsap.matchMedia callback where React state is not available.
 *
 * <ScrollSnap /> is the publisher under normal motion, and it is the right one:
 * it already decides which stop the page lands on, so it knows the answer
 * exactly. Deriving it instead from a ScrollTrigger per section looks simpler
 * and is wrong here, because Work is PINNED — the position its element reports
 * depends on whether the pin is currently engaged, so a trigger measured
 * against it drifts by most of the deck's four-viewport scroll length and
 * lights up the wrong nav link.
 *
 * Under reduced motion ScrollSnap does not run at all, so <Nav /> publishes for
 * itself from plain ScrollTriggers. There is no pin in that mode, so measuring
 * the sections directly is accurate there.
 */

/** Section id, matching the ids used by registerStops(). Null = none. */
let current: string | null = null;

type Listener = (section: string | null) => void;
const listeners = new Set<Listener>();

export function setActiveSection(next: string | null) {
  if (next === current) return;
  current = next;
  listeners.forEach((listener) => listener(current));
}

/**
 * Subscribe. Fires immediately with the current value, so a subscriber that
 * mounts after the page has already settled is not left blank.
 */
export function onSectionChange(listener: Listener) {
  listeners.add(listener);
  listener(current);
  return () => {
    listeners.delete(listener);
  };
}
