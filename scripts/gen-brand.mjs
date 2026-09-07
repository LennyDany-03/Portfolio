/**
 * Rasterises the LDD mark into public/brand/ and into the favicons Next picks
 * up from app/.
 *
 * Geometry comes from lib/brand.ts and the outlines from lib/logo.ts, the same
 * two modules <BrandMark /> reads, so the favicon and the nav logo cannot drift
 * apart. The MARKUP is built separately here on purpose: this side has to bake
 * literal hex, because a PNG has no CSS custom properties to resolve.
 *
 * Every glyph is path data, so librsvg is never asked to resolve a font.
 *
 * Run:  node scripts/gen-brand.mjs
 */
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

import {
  MONOGRAM_PATH,
  MONOGRAM_VIEWBOX,
  MONOGRAM_SIZE,
  DD_PATH,
  DD_VIEWBOX,
  SIGNATURE_PATH,
} from "../lib/logo.ts";
import {
  TILE,
  monogramFit,
  MONOGRAM_TAIL_PATH,
  MONOGRAM_TAIL_WIDTH,
  SIGNATURE_FLOURISH_PATH,
  SIGNATURE_BLOCK_VIEWBOX,
} from "../lib/brand.ts";

// lib/brand.ts hardcodes the monogram's aspect ratio so it can stay import-free
// for this script. If a font regeneration reshapes the glyph box, fail here
// rather than silently squashing every raster.
{
  const literal = 1462 / 1262;
  const actual = MONOGRAM_SIZE.width / MONOGRAM_SIZE.height;
  if (Math.abs(literal - actual) > 1e-6) {
    throw new Error(
      `MONOGRAM_ASPECT in lib/brand.ts is stale: expected ${actual}, found ${literal}. ` +
        "Update the literal and re-check monogramFit()'s placement numbers.",
    );
  }
}

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BRAND = join(ROOT, "public", "brand");
const APP = join(ROOT, "app");

/** --color-accent. Kept as one literal so a token change has one place to land. */
const ACCENT = "#ff4655";
const INK = "#0a0a0c";
const DD_GREY = "#8d8f99";

const svg = (body, w, h, viewBox) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${viewBox}">${body}</svg>`;

/** The L, plus its drawn tail. The mark itself, on no ground. */
const markBody = (m) =>
  `<svg x="${m.x}" y="${m.y}" width="${m.width}" height="${m.height}" ` +
  `viewBox="${MONOGRAM_VIEWBOX}" preserveAspectRatio="xMidYMid meet" overflow="visible">` +
  `<path d="${MONOGRAM_PATH}" fill="${ACCENT}"` +
  (m.stroke
    ? ` stroke="${ACCENT}" stroke-width="${m.stroke}" stroke-linejoin="round"`
    : "") +
  "/></svg>" +
  (m.tail
    ? `<path d="${MONOGRAM_TAIL_PATH}" fill="none" stroke="${ACCENT}" ` +
      `stroke-width="${MONOGRAM_TAIL_WIDTH}" stroke-linecap="round" opacity="0.9"/>`
    : "");

/** The full tile: rounded ground, accent bloom from the bottom edge, hairline. */
const tileBody = (px) => {
  const { size, radius, hairline, ground } = TILE;
  const d = TILE.dd;
  const m = monogramFit(px);
  return (
    `<defs><radialGradient id="g" cx="50%" cy="100%" r="120%">` +
    `<stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.14"/>` +
    `<stop offset="50%" stop-color="${ACCENT}" stop-opacity="0"/>` +
    `</radialGradient></defs>` +
    `<rect width="${size}" height="${size}" rx="${radius}" fill="${ground}"/>` +
    `<rect width="${size}" height="${size}" rx="${radius}" fill="url(#g)"/>` +
    `<rect x="${hairline / 2}" y="${hairline / 2}" width="${size - hairline}" height="${size - hairline}" ` +
    `rx="${radius - hairline / 2}" fill="none" stroke="rgb(255,255,255)" stroke-opacity="0.07" stroke-width="${hairline}"/>` +
    markBody(m) +
    (m.dd
      ? `<svg x="${d.x}" y="${d.y}" width="${d.width}" height="${d.height}" ` +
        `viewBox="${DD_VIEWBOX}" preserveAspectRatio="xMidYMid meet">` +
        `<path d="${DD_PATH}" fill="${DD_GREY}"/></svg>`
      : "")
  );
};

/** Signature + flourish, transparent ground. */
const signatureBody = () =>
  `<path d="${SIGNATURE_PATH}" fill="${ACCENT}"/>` +
  `<path d="${SIGNATURE_FLOURISH_PATH}" fill="none" stroke="${ACCENT}" stroke-width="22" stroke-linecap="round"/>`;

const png = (source, size, height = size) =>
  sharp(Buffer.from(source))
    .resize(size, height)
    .png({ compressionLevel: 9 })
    .toBuffer();

/**
 * A .ico is just a 6-byte directory header, one 16-byte entry per image, then
 * the payloads. Since Vista those payloads may be whole PNG files, which is why
 * this needs no BMP encoder. A 256px side is stored as 0 — the field is a byte.
 */
function ico(images) {
  const head = Buffer.alloc(6);
  head.writeUInt16LE(0, 0); // reserved
  head.writeUInt16LE(1, 2); // type: icon
  head.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2); // palette
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });

  return Buffer.concat([head, ...entries, ...images.map((i) => i.data)]);
}

async function main() {
  await mkdir(BRAND, { recursive: true });

  const S = TILE.size;
  const box = `0 0 ${S} ${S}`;

  // Each variant is drawn for the size it will be seen at — monogramFit()
  // thickens the hairlines and drops the tail and stamp below ~160px.
  const tileFull = svg(tileBody(1024), S, S, box);
  const tileSmall = svg(tileBody(32), S, S, box);
  const markOnly = svg(markBody(monogramFit(1024)), S, S, box);

  const [, , sw, sh] = SIGNATURE_BLOCK_VIEWBOX.split(" ").map(Number);
  const signature = svg(signatureBody(), sw, sh, SIGNATURE_BLOCK_VIEWBOX);

  /* ------------------------------------------------------- vector originals */
  const vectors = {
    "ldd-monogram-tile.svg": tileFull,
    "ldd-monogram.svg": markOnly,
    "ldd-signature.svg": signature,
  };
  for (const [name, source] of Object.entries(vectors)) {
    await writeFile(join(BRAND, name), source, "utf8");
  }

  /* ------------------------------------------------------------------ PNGs */
  const rasters = [
    ["ldd-monogram-tile-1024.png", tileFull, 1024],
    ["ldd-monogram-tile-512.png", tileFull, 512],
    ["ldd-monogram-tile-256.png", tileFull, 256],
    ["ldd-monogram-512.png", markOnly, 512],
  ];
  for (const [name, source, size] of rasters) {
    await writeFile(join(BRAND, name), await png(source, size));
  }

  const sigW = 1600;
  await writeFile(
    join(BRAND, "ldd-signature-1600.png"),
    await png(signature, sigW, Math.round((sigW * sh) / sw)),
  );

  /* -------------------------------------------------------------- favicons */
  // app/icon.png and app/apple-icon.png are auto-wired by Next's metadata file
  // convention — no `icons:` key in the layout's metadata export is needed.
  await writeFile(join(APP, "icon.png"), await png(tileFull, 512));
  await writeFile(join(APP, "apple-icon.png"), await png(tileFull, 180));

  await writeFile(
    join(APP, "favicon.ico"),
    ico(
      await Promise.all(
        [16, 32, 48].map(async (size) => ({
          size,
          data: await png(tileSmall, size),
        })),
      ),
    ),
  );

  /* -------------------------------------------------------------------- OG */
  // layout.tsx already declares twitter.card: "summary_large_image" with no
  // image on either card, so every share is currently blank.
  const ogW = 1200;
  const ogH = 630;
  const og = svg(
    `<rect width="${ogW}" height="${ogH}" fill="${INK}"/>` +
      `<g transform="translate(${(ogW - 900) / 2} ${(ogH - (900 * sh) / sw) / 2})">` +
      `<svg width="900" height="${(900 * sh) / sw}" viewBox="${SIGNATURE_BLOCK_VIEWBOX}">${signatureBody()}</svg>` +
      `</g>`,
    ogW,
    ogH,
    `0 0 ${ogW} ${ogH}`,
  );
  await writeFile(join(APP, "opengraph-image.png"), await png(og, ogW, ogH));

  console.log("Wrote:");
  console.log("  public/brand/  " + Object.keys(vectors).join(", "));
  console.log(
    "  public/brand/  " +
      rasters.map((r) => r[0]).join(", ") +
      ", ldd-signature-1600.png",
  );
  console.log(
    "  app/           icon.png, apple-icon.png, favicon.ico, opengraph-image.png",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
