"use client";

/**
 * Registry of scroll "stops" — the discrete positions the page settles on when
 * <ScrollSnap /> steps forward or back.
 *
 * A registry rather than a static list of sections, because not every stop is
 * a section top. The Work deck contributes one stop per CARD from inside its
 * own pinned ScrollTrigger, so a gesture there advances the deck instead of
 * skipping the section, and a tall section contributes one stop per viewport
 * so none of it sits permanently below the fold.
 */
export type Stop = {
  /** Position at collect() time. Used for ordering and for `nearest()`. */
  y: number;
  /**
   * Re-measure this stop's position NOW.
   *
   * A pin engaging or releasing changes layout, so a position measured before
   * a jump can be stale by a fraction of a viewport by the time the jump lands
   * — which is what parked the page halfway between Work and Stack. ScrollSnap
   * calls this again one frame after jumping (still hidden behind the curtain)
   * and corrects, so landings are exact whatever the pins did.
   */
  measure: () => number;
  /**
   * Which section this stop belongs to.
   *
   * The curtain plays when a step CROSSES sections — never because of any
   * particular target. A per-stop `curtain` boolean could not express that:
   * Crest is both the Work section's entry AND card 01 of the deck, so
   * flagging it meant scrolling up from Bloom fired a full-screen wipe just to
   * move back one card.
   */
  section: string;
  /** Shown on the curtain while covered, so the wipe previews what is next. */
  eyebrow?: string;
  title?: string;
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

/**
 * Provider for a plain section.
 *
 * Emits one stop at the top, plus an interior stop every viewport for any
 * section taller than the screen. Without those, a tall section is only ever
 * seen from its top: Process is roughly 1.6 viewports, so step 04 sat
 * permanently below the fold and the next gesture jumped straight over it.
 *
 * Every stop carries the SAME section id, so moving within a section never
 * wipes the screen — only crossing into a different one does.
 */
export function sectionStop(
  el: HTMLElement | null,
  section: string,
  label?: { eyebrow: string; title: string },
): StopProvider {
  const topOf = () =>
    el ? el.getBoundingClientRect().top + window.scrollY : 0;

  return () => {
    if (!el) return [];

    const top = topOf();
    const vh = window.innerHeight;
    // A little slack so a section a few px over a viewport does not earn a
    // near-duplicate stop right beneath its own top.
    const overflow = el.offsetHeight - vh;

    const base = {
      section,
      eyebrow: label?.eyebrow,
      title: label?.title,
    };

    const stops: Stop[] = [{ y: top, measure: topOf, ...base }];

    if (overflow > vh * 0.25) {
      const steps = Math.ceil(overflow / vh);
      for (let i = 1; i <= steps; i++) {
        // Clamp to the section bottom so the last interior stop shows the end
        // of the section rather than overshooting into the next one.
        stops.push({
          y: top + Math.min(i * vh, overflow),
          measure: () => topOf() + Math.min(i * vh, el.offsetHeight - vh),
          ...base,
        });
      }
    }

    return stops;
  };
}
