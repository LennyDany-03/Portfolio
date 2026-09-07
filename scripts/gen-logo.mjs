/**
 * Extracts glyph OUTLINES from the three OFL faces the brand mark is built on
 * and writes them to lib/logo.ts as static path data.
 *
 * Why not just render webfont <text>? Two reasons:
 *  - The loader plays in the first second, which is exactly when a webfont has
 *    not arrived. `display:swap` would flash a fallback through the signature.
 *  - A favicon has no CSS at all. It needs paths.
 *
 * Run:  node scripts/gen-logo.mjs
 * Fonts are fetched into scripts/fonts/ (gitignored) on first run.
 */
import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import opentype from "opentype.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FONT_DIR = join(ROOT, "scripts", "fonts");

const FONTS = {
  signature: {
    file: "MrsSaintDelafield-Regular.ttf",
    url: "https://github.com/google/fonts/raw/main/ofl/mrssaintdelafield/MrsSaintDelafield-Regular.ttf",
  },
  monogram: {
    file: "MonsieurLaDoulaise-Regular.ttf",
    url: "https://github.com/google/fonts/raw/main/ofl/monsieurladoulaise/MonsieurLaDoulaise-Regular.ttf",
  },
  mono: {
    file: "JetBrainsMono.ttf",
    url: "https://github.com/google/fonts/raw/main/ofl/jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf",
  },
};

async function loadFont({ file, url }) {
  const path = join(FONT_DIR, file);
  try {
    await access(path);
  } catch {
    await mkdir(FONT_DIR, { recursive: true });
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url} -> ${res.status}`);
    await writeFile(path, Buffer.from(await res.arrayBuffer()));
    console.log(`  fetched ${file}`);
  }
  const buf = await readFile(path);
  return opentype.parse(
    buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
  );
}

const round = (n, d = 2) => Number(n.toFixed(d));

/**
 * Renders `text` at a large size, then translates the result so its own ink
 * bounding box sits at (pad, pad) inside a viewBox of exactly the right size.
 * Working from the ink box rather than the font metrics matters here: a script
 * face's advance widths carry huge side bearings for the connecting strokes,
 * so an em-box viewBox would leave the signature floating in dead space.
 */
function trace(font, text, { size = 1000, pad = 0, letterSpacing = 0 } = {}) {
  const path =
    letterSpacing === 0
      ? font.getPath(text, 0, 0, size)
      : spacedPath(font, text, size, letterSpacing);

  const box = path.getBoundingBox();
  const dx = pad - box.x1;
  const dy = pad - box.y1;

  for (const cmd of path.commands) {
    for (const [ax, ay] of [
      ["x", "y"],
      ["x1", "y1"],
      ["x2", "y2"],
    ]) {
      if (cmd[ax] !== undefined) cmd[ax] = round(cmd[ax] + dx, 2);
      if (cmd[ay] !== undefined) cmd[ay] = round(cmd[ay] + dy, 2);
    }
  }

  return {
    d: path.toPathData(2),
    width: round(box.x2 - box.x1 + pad * 2, 2),
    height: round(box.y2 - box.y1 + pad * 2, 2),
  };
}

/** getPath() has no tracking option, so lay the glyphs out by hand. */
function spacedPath(font, text, size, letterSpacing) {
  const scale = size / font.unitsPerEm;
  const out = new opentype.Path();
  let x = 0;
  for (const ch of text) {
    const glyph = font.charToGlyph(ch);
    out.extend(glyph.getPath(x, 0, size));
    x += glyph.advanceWidth * scale + letterSpacing * size;
  }
  return out;
}

const banner = (t) => `\n/* ${t} */`;

async function main() {
  console.log("Loading fonts…");
  const [signature, monogram, mono] = await Promise.all([
    loadFont(FONTS.signature),
    loadFont(FONTS.monogram),
    loadFont(FONTS.mono),
  ]);

  // pad:14 on the monogram — Monsieur La Doulaise's L has hairline flourishes
  // that a zero-pad viewBox clips the moment the mark is stroked or scaled.
  const sig = trace(signature, "Lenny Dany", { size: 1000, pad: 6 });
  const mgm = trace(monogram, "L", { size: 1000, pad: 14 });
  const dd = trace(mono, "DD", { size: 1000, pad: 0, letterSpacing: 0.32 });

  const out = `/**
 * GENERATED — do not edit by hand. Run \`node scripts/gen-logo.mjs\`.
 *
 * Glyph outlines lifted out of three SIL Open Font License 1.1 faces, so the
 * brand mark needs no webfont at runtime and can be rasterised into a favicon:
 *
 *   SIGNATURE  "Lenny Dany"  — Mrs Saint Delafield, Copyright (c) Sudtipos
 *   MONOGRAM   "L"           — Monsieur La Doulaise, Copyright (c) Sudtipos
 *   DD         "DD"          — JetBrains Mono, Copyright (c) JetBrains
 *
 * Full licence text: public/brand/FONT-LICENSE.txt
 *
 * Each path is translated so its INK bounding box (not its em box — a script
 * face's side bearings are enormous) sits at the origin, and each viewBox is
 * sized to match. Companion hand-drawn paths and the intro beats live in
 * lib/brand.ts, which a regeneration deliberately does not touch.
 */

${banner("Wordmark — the copperplate signature the loader writes.").trim()}
export const SIGNATURE_PATH =
  "${sig.d}";

export const SIGNATURE_VIEWBOX = "0 0 ${sig.width} ${sig.height}";
export const SIGNATURE_SIZE = { width: ${sig.width}, height: ${sig.height} } as const;

${banner("Monogram — the flourished L. Favicon, nav logo, loader payoff.").trim()}
export const MONOGRAM_PATH =
  "${mgm.d}";

export const MONOGRAM_VIEWBOX = "0 0 ${mgm.width} ${mgm.height}";
export const MONOGRAM_SIZE = { width: ${mgm.width}, height: ${mgm.height} } as const;

${banner("The DD stamp in the tile's bottom-right corner. Only drawn >= 64px.").trim()}
export const DD_PATH =
  "${dd.d}";

export const DD_VIEWBOX = "0 0 ${dd.width} ${dd.height}";
export const DD_SIZE = { width: ${dd.width}, height: ${dd.height} } as const;
`;

  await writeFile(join(ROOT, "lib", "logo.ts"), out, "utf8");
  console.log(`\nWrote lib/logo.ts`);
  console.log(`  signature  ${sig.width} x ${sig.height}  (${sig.d.length} chars)`);
  console.log(`  monogram   ${mgm.width} x ${mgm.height}  (${mgm.d.length} chars)`);
  console.log(`  dd         ${dd.width} x ${dd.height}  (${dd.d.length} chars)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
