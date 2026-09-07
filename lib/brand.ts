/**
 * The hand-authored half of the LDD brand mark, and the intro beats.
 *
 * Deliberately separate from lib/logo.ts: that file is GENERATED from the font
 * outlines and gets overwritten wholesale by `node scripts/gen-logo.mjs`.
 * Everything a person drew, or tuned by eye, lives here instead.
 *
 * Kept import-free on purpose — scripts/gen-brand.mjs loads this module from
 * plain Node, which cannot resolve the "@/" alias.
 */

/* ---------------------------------------------------------------- signature */

/**
 * The pen. Not artwork — this never renders. It is the centreline of the
 * writing gesture, stroked fat and used as a MASK over SIGNATURE_PATH, so the
 * letterforms appear in the order a hand would make them.
 *
 * DrawSVG cannot pen-stroke the signature directly: a font outline is a closed
 * contour, so drawing it traces the EDGE of each letter — an outline filling
 * in, not a pen moving. Masking is what buys the handwriting read.
 *
 * Coordinates are SIGNATURE_VIEWBOX units (0 0 4278 1167). Because the mask
 * stroke is far fatter than the letter strokes it covers, this path only has to
 * be approximately right; it was tuned against a contact sheet of the reveal at
 * 10/25/40/55/72/88/100%.
 */
export const SIGNATURE_PEN_PATH =
  "M 30 345 C 220 190, 520 60, 815 48 C 640 210, 330 470, 150 700 C 60 800, 150 840, 330 805 C 470 795, 570 755, 700 700 C 900 640, 1150 640, 1345 690 C 1450 780, 1540 990, 1650 1140 C 1760 1070, 1830 880, 1930 640 C 2020 690, 2120 790, 2300 830 C 2500 810, 2620 700, 2760 500 C 2900 260, 3040 60, 3210 62 C 3300 150, 3230 330, 3080 520 C 2980 660, 2900 780, 2960 830 C 3060 820, 3160 760, 3290 700 C 3450 660, 3600 660, 3730 690 C 3820 780, 3900 990, 3990 1140 C 4090 1060, 4180 850, 4270 600";

/**
 * 640, not "whatever looks tight". Measured: rasterising the finished mask over
 * the glyph and counting ink pixels, 560 leaves 0.22% of the signature
 * permanently unpainted and 480 leaves 1.6%. 640 is the first width to reach
 * 0.000%. Anything narrower puts holes in the finished wordmark.
 */
export const SIGNATURE_PEN_WIDTH = 640;

/** The underline sweep, scaled up from the mockup's 420x40 card into signature space. */
export const SIGNATURE_FLOURISH_PATH =
  "M 90 1300 C 940 1090, 1530 1380, 2370 1250 C 3080 1140, 3630 1310, 4200 1130";

/** Signature + flourish together. Taller than SIGNATURE_VIEWBOX to fit the sweep. */
export const SIGNATURE_BLOCK_VIEWBOX = "0 0 4278 1420";

/* ----------------------------------------------------------------- the tile */

/**
 * Tile geometry, in a 1024 square. Shared by <BrandMark /> and
 * scripts/gen-brand.mjs so the nav logo and the favicon cannot drift apart —
 * they build different markup (one paints from CSS tokens, one bakes hex for
 * the rasteriser) but both read their numbers from here.
 *
 * Proportions carried over from the mockup's 220px card: radius 52/220,
 * DD inset 26/20 from the right/bottom edges.
 */
export const TILE = {
  size: 1024,
  radius: 242,
  ground: "#0e0f13",
  hairline: 4.65,
  /** Where DD_VIEWBOX is placed on full-detail tiles. */
  dd: { x: 841, y: 894, width: 62, height: 34 },
} as const;

/**
 * MONOGRAM_SIZE.width / .height, as a literal rather than an import, for the
 * reason given at the top of this file. scripts/gen-brand.mjs asserts the two
 * still agree, so regenerating the outlines into a differently-shaped box fails
 * loudly instead of quietly squashing the mark.
 */
const MONOGRAM_ASPECT = 1462 / 1262;

/**
 * Where the monogram sits inside the tile, and how much the mark has to be
 * thickened to survive at `px`.
 *
 * The thickening is not a stylistic choice. Monsieur La Doulaise is a hairline
 * copperplate: its thinnest strokes are ~9 units of a 1024 tile, which is
 * 0.28px at a 32px favicon and 0.14px at 16px. Rasterised, that is not a thin
 * line — it is a faint grey smear, and the L stops being readable at all. A
 * same-colour stroke on the fill brings the hairlines back to about a pixel.
 * Measured against a 16/32/48 contact sheet: 40 units is still too faint at
 * 32px, 120 fills the loops in solid, 80 is the one that reads.
 *
 * Large renders get none of it — at 160px and up the outline is already correct
 * and a stroke would only coarsen the mockup's drawing.
 *
 * Callers pass their INTENDED render size. <BrandMark /> cannot infer it (its
 * size comes from CSS), so the nav and the loader each declare theirs.
 */
export function monogramFit(px: number) {
  const full = px >= 160;
  const width = full ? 820 : px >= 64 ? 860 : 880;
  const stroke = full ? 0 : px >= 64 ? 34 : 80;
  const height = width / MONOGRAM_ASPECT;

  return {
    x: (TILE.size - width) / 2,
    // Full-detail tiles carry the DD stamp, so the mark lifts off that corner.
    // Nothing occupies it at small sizes, so there the mark is simply centred.
    y: (TILE.size - height) / 2 - (full ? 20 : 0),
    width,
    height,
    stroke,
    /** Both are sub-pixel below ~160px, where they only muddy the L. */
    tail: full,
    dd: full,
  };
}

/** The drawn arc under the L, in TILE space. Scaled from the mockup's 220 box. */
export const MONOGRAM_TAIL_PATH = "M 195 782 C 391 884, 651 866, 829 707";

export const MONOGRAM_TAIL_WIDTH = 9.3;

/* ---------------------------------------------------------------- the intro */

/**
 * Loader beats, in seconds. Change these, never the component.
 *
 * Same discipline as lib/curtain.ts, and for the same reason: every position in
 * the Loader timeline is ABSOLUTE. A relative "+=" offset is measured from the
 * timeline end, so adding one tween would silently slide every later beat out
 * of sync with INTRO_TOTAL — and INTRO_TOTAL is what schedules display:none.
 * Miss it and the panel either eats clicks forever or vanishes mid-zoom.
 */
export const INTRO = {
  /** Signature writes. */
  writeAt: 0.25,
  write: 1.5,
  /** Underline sweep. */
  flourish: 0.45,
  hold: 0.25,
  /** Signature contracts into the monogram. */
  collapse: 0.55,
  /** Camera pushes through the mark. */
  zoom: 0.85,
  /** Panel ground fades off, revealing the site. */
  reveal: 0.6,
} as const;

export const INTRO_FLOURISH_AT = INTRO.writeAt + INTRO.write - 0.15; // 1.60
export const INTRO_COLLAPSE_AT =
  INTRO_FLOURISH_AT + INTRO.flourish + INTRO.hold; // 2.30
/** The tail draws as the mark lands, not before it exists. */
export const INTRO_TAIL_AT = INTRO_COLLAPSE_AT + 0.15; // 2.45
export const INTRO_ZOOM_AT = INTRO_COLLAPSE_AT + INTRO.collapse - 0.1; // 2.75
/** releaseIntro() fires here — the hero is already moving as the ground clears. */
export const INTRO_RELEASE_AT = INTRO_ZOOM_AT + 0.2; // 2.95
export const INTRO_TOTAL = INTRO_ZOOM_AT + INTRO.zoom; // 3.60
