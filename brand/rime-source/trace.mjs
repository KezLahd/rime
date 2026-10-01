// Traces the Rime logo PNG into per-colour SVG paths.
// Classifies every opaque pixel to the nearest brand colour, builds a mask per
// colour (and per region: mark vs wordmark), upscales 3x for smooth curves,
// and traces each mask with potrace.
import sharp from "sharp";
import potrace from "potrace";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const SRC = fileURLToPath(new URL("./rime-original.png", import.meta.url)); // the master artwork beside this script
const SCALE = 3;
const SPLIT_X = 760; // mark is left of this, wordmark right

const COLOURS = {
  frost: [0x46, 0x8b, 0xfc], // deep blue
  ice: [0x93, 0xc4, 0xfb], // mid blue (also the wordmark)
  mist: [0xca, 0xde, 0xfa], // pale blue
};

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;

// Average actual colours per class for accurate hexes.
const sums = Object.fromEntries(Object.keys(COLOURS).map((k) => [k, [0, 0, 0, 0]]));
const cls = new Array(W * H).fill(null);
for (let i = 0; i < W * H; i++) {
  const a = data[i * 4 + 3];
  if (a < 128) continue;
  const px = [data[i * 4], data[i * 4 + 1], data[i * 4 + 2]];
  let best = null, bd = Infinity;
  for (const [k, c] of Object.entries(COLOURS)) {
    const d = (px[0] - c[0]) ** 2 + (px[1] - c[1]) ** 2 + (px[2] - c[2]) ** 2;
    if (d < bd) { bd = d; best = k; }
  }
  cls[i] = best;
  if (a > 250) { const s = sums[best]; s[0] += px[0]; s[1] += px[1]; s[2] += px[2]; s[3]++; }
}
const hex = (k) => "#" + sums[k].slice(0, 3).map((v) => Math.round(v / sums[k][3]).toString(16).padStart(2, "0")).join("");
const HEX = Object.fromEntries(Object.keys(COLOURS).map((k) => [k, hex(k)]));
console.log(HEX);

function mask(region, key) {
  const buf = Buffer.alloc(W * H, 255);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x;
    const inRegion = region === "mark" ? x < SPLIT_X : x >= SPLIT_X;
    if (inRegion && cls[i] === key) buf[i] = 0;
  }
  return sharp(buf, { raw: { width: W, height: H, channels: 1 } })
    .resize(W * SCALE, H * SCALE, { kernel: "lanczos3" })
    .blur(1.2)
    .png()
    .toBuffer();
}

const trace = (png) =>
  new Promise((res, rej) =>
    potrace.trace(png, { turdSize: 60, optTolerance: 0.4, alphaMax: 1.0, threshold: 128 }, (err, svg) => (err ? rej(err) : res(svg))),
  );
const pathOf = (svg) => [...svg.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]).join(" ");

const out = {};
for (const key of Object.keys(COLOURS)) out[`mark_${key}`] = pathOf(await trace(await mask("mark", key)));
out.word = pathOf(await trace(await mask("word", "ice")));
writeFileSync("paths.json", JSON.stringify({ W: W * SCALE, H: H * SCALE, SCALE, HEX, ...out }));
console.log("traced", Object.keys(out).map((k) => `${k}:${out[k].length}`).join(" "));
