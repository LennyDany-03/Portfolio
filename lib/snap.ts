"use client";

/**
 * Registry of scroll "stops" — the discrete positions the page settles on when
 * <ScrollSnap /> steps forward or back.
 *
 * A registry rather than a static list of sections because not every stop is a
 * section top, and not every stop deserves the same transition. The Work deck
 * contributes one stop per CARD from inside its own pinned ScrollTrigger, so a
 * gesture there advances the deck instead of skipping the section — but those
 * card steps are flagged `curtain: false`, because the deck already has its own
 * 3D card transition and wrapping that in a full-screen wipe would hide the
 * very thing the user is trying to look at.
 *
 * Providers are re-invoked on every collect(), so nothing is cached across a
 * resize or a ScrollTrigger refresh.
 */
export type Stop = {
  /** Absolute document Y. */
  y: number;
  /** Play the full-screen curtain when landing here? */
  curtain: boolean;
};

type StopProvider = () => Stop[];

const providers = new Set<StopProvider>();

export function registerStops(fn: StopProvider) {
  providers.add(fn);
  return () => {
    providers.delete(fn);
  };
}

/** All stops, de-duplicated and in document order. */
export function collectStops(): Stop[] {
  const all: Stop[] = [];
  providers.forEach((fn) => {
    try {
      all.push(...fn());
    } catch {
      // A section mid-unmount must never break navigation for the rest.
    }
  });

  return all
    .filter((s) => Number.isFinite(s.y) && s.y >= 0)
    .sort((a, b) => a.y - b.y)
    .filter((s, i, list) => i === 0 || s.y - list[i - 1].y > 8);
}

/** Convenience provider for a plain section: one curtained stop at its top. */
export function sectionStop(el: HTMLElement | null): StopProvider {
  return () => {
    if (!el) return [];
    return [
      { y: el.getBoundingClientRect().top + window.scrollY, curtain: true },
    ];
  };
}
