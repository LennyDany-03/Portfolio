"use client";

/**
 * Handoff between <Loader /> and the hero entrance.
 *
 * The loader is an overlay, so the hero markup is already mounted and its
 * useGSAP has already built its timelines by the time the counter is running.
 * Without a gate the entrance would play out of sight behind the panel and the
 * user would arrive at a finished, static hero.
 *
 * So Hero builds its animations PAUSED and registers them here; the loader
 * calls releaseIntro() as its wipe begins, so the entrance is already in motion
 * as the panel clears. Module-level state, deliberately: it must survive
 * Hero unmount/remount (HMR, StrictMode double-invoke) and stay released.
 */
let released = false;
const waiting = new Set<() => void>();

export const isIntroReleased = () => released;

/** Run `fn` when the loader hands off — immediately if that already happened. */
export function onIntroRelease(fn: () => void) {
  if (released) {
    fn();
    return () => {};
  }
  waiting.add(fn);
  return () => waiting.delete(fn);
}

/** Called by the loader as its exit wipe starts. Idempotent. */
export function releaseIntro() {
  if (released) return;
  released = true;
  waiting.forEach((fn) => fn());
  waiting.clear();
}

let pending = 0;

/**
 * Release on the NEXT FRAME, unless a new intro claims the gate first.
 *
 * The loader's matchMedia cleanup must not strand the hero paused. But in dev,
 * StrictMode mounts, tears down, and mounts again in one task — and a
 * synchronous release in that teardown flips the gate open about three seconds
 * before the panel actually clears, so the entire hero entrance plays unseen
 * behind it and the handoff is impossible to work on.
 *
 * Deferring by a frame lets the remount cancel it. A real teardown has nothing
 * to cancel it, so the release still lands.
 */
export function releaseIntroSoon() {
  if (released || pending) return;
  pending = requestAnimationFrame(() => {
    pending = 0;
    releaseIntro();
  });
}

/** Called by a mounting intro to take ownership of the gate. */
export function holdIntro() {
  if (!pending) return;
  cancelAnimationFrame(pending);
  pending = 0;
}

/**
 * Hold an animation until the loader hands off, then play it.
 *
 * Built inside the component's useGSAP context, so it is still reverted
 * normally on unmount — this only controls WHEN it starts. Playing an already
 * killed animation is a no-op, so a unmount-before-release is harmless.
 */
export function gateIntro<T extends gsap.core.Animation | undefined>(
  anim: T,
): T {
  // Tolerates undefined so it can wrap fromLines(), which no-ops on an empty
  // SplitText result.
  if (!anim || released) return anim;
  anim.pause();
  onIntroRelease(() => anim.play());
  return anim;
}
