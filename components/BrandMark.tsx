"use client";

import { useId } from "react";
import {
  MONOGRAM_PATH,
  MONOGRAM_VIEWBOX,
  DD_PATH,
  DD_VIEWBOX,
} from "@/lib/logo";
import {
  TILE,
  monogramFit,
  MONOGRAM_TAIL_PATH,
  MONOGRAM_TAIL_WIDTH,
} from "@/lib/brand";

type Props = {
  className?: string;
  /**
   * The size this will actually render at, in px. Picks the composition:
   * see monogramFit() for why a 30px tile cannot use the 1024px drawing.
   * Only the CSS in `className` decides the real size.
   */
  px: number;
};

/**
 * The LDD tile: flourished L on a rounded ground, exactly as the identity
 * mockup drew it. Rendered in the nav and as the loader's payoff.
 *
 * Geometry comes from lib/brand.ts, which scripts/gen-brand.mjs also reads —
 * the favicon and this component cannot drift apart. The markup is not shared,
 * deliberately: this version paints from CSS tokens so it follows the theme,
 * while the rasteriser has to bake literal hex (a PNG has no CSS).
 */
export default function BrandMark({ className, px }: Props) {
  // Two of these render at once (nav + loader). Duplicate SVG ids in one
  // document silently resolve to whichever came first, so the gradient needs a
  // per-instance id — stripped of punctuation, because React's raw ids carry
  // characters that have no business inside a url(#...) reference.
  const glow = `ldd-glow-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const { size, radius, hairline, dd } = TILE;
  const mark = monogramFit(px);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      aria-hidden
      focusable="false"
    >
      <defs>
        {/* radial-gradient(120% 120% at 50% 100%, accent/.14, transparent 60%).
            r is 120% of the box, so the mockup's 60% stop lands halfway along
            the gradient — not at 60% of it. */}
        <radialGradient id={glow} cx="50%" cy="100%" r="120%">
          <stop
            offset="0%"
            stopColor="var(--color-accent)"
            stopOpacity="0.14"
          />
          <stop offset="50%" stopColor="var(--color-accent)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width={size} height={size} rx={radius} fill={TILE.ground} />
      <rect width={size} height={size} rx={radius} fill={`url(#${glow})`} />
      <rect
        x={hairline / 2}
        y={hairline / 2}
        width={size - hairline}
        height={size - hairline}
        rx={radius - hairline / 2}
        fill="none"
        stroke="rgb(255 255 255 / 0.07)"
        strokeWidth={hairline}
      />

      {/* Nested <svg> rather than a transform: the monogram carries its own
          tight viewBox, so letting the viewport do the fitting keeps the
          placement numbers readable as plain rectangles. */}
      <svg
        x={mark.x}
        y={mark.y}
        width={mark.width}
        height={mark.height}
        viewBox={MONOGRAM_VIEWBOX}
        preserveAspectRatio="xMidYMid meet"
        overflow="visible"
      >
        <path
          d={MONOGRAM_PATH}
          fill="var(--color-accent)"
          stroke={mark.stroke ? "var(--color-accent)" : undefined}
          strokeWidth={mark.stroke || undefined}
          strokeLinejoin="round"
        />
      </svg>

      {mark.tail && (
        <path
          data-brand-tail
          d={MONOGRAM_TAIL_PATH}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={MONOGRAM_TAIL_WIDTH}
          strokeLinecap="round"
          opacity="0.9"
        />
      )}

      {mark.dd && (
        <svg
          x={dd.x}
          y={dd.y}
          width={dd.width}
          height={dd.height}
          viewBox={DD_VIEWBOX}
          preserveAspectRatio="xMidYMid meet"
        >
          <path d={DD_PATH} fill="#8d8f99" />
        </svg>
      )}
    </svg>
  );
}
