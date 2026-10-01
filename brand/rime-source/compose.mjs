// Builds the Rime SVG set (mark, wordmark, lockup, mono variants) and the
// favicon / app icon PNGs + ICO from the traced paths.
import sharp from "sharp";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const P = JSON.parse(readFileSync("paths.json", "utf8"));
const OUT = "out";
mkdirSync(OUT, { recursive: true });

const markLayers = (fills) =>
  [
    `<path fill-rule="evenodd" fill="${fills.mist}" d="${P.mark_mist}"/>`,
    `<path fill-rule="evenodd" fill="${fills.ice}" d="${P.mark_ice}"/>`,
    `<path fill-rule="evenodd" fill="${fills.frost}" d="${P.mark_frost}"/>`,
  ].join("");
const wordLayer = (fill) => `<path fill-rule="evenodd" fill="${fill}" d="${P.word}"/>`;

// Tight bounds of a fragment, found by rendering it on the full canvas.
async function bounds(inner) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${P.W}" height="${P.H}" viewBox="0 0 ${P.W} ${P.H}">${inner}</svg>`;
  const { info } = await sharp(Buffer.from(svg)).trim({ threshold: 1 }).toBuffer({ resolveWithObject: true });
  return { x: -info.trimOffsetLeft, y: -info.trimOffsetTop, w: info.width, h: info.height };
}

const BRAND = { frost: P.HEX.frost, ice: P.HEX.ice, mist: P.HEX.mist };
const markB = await bounds(markLayers(BRAND));
const wordB = await bounds(wordLayer(BRAND.ice));
const lockB = await bounds(markLayers(BRAND) + wordLayer(BRAND.ice));

function svgFile(b, inner, { pad = 0, square = false, title }) {
  let { x, y, w, h } = b;
  if (square) {
    const s = Math.max(w, h);
    x -= (s - w) / 2; y -= (s - h) / 2; w = h = s;
  }
  x -= pad; y -= pad; w += pad * 2; h += pad * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x.toFixed(0)} ${y.toFixed(0)} ${w.toFixed(0)} ${h.toFixed(0)}" role="img" aria-label="${title}"><title>${title}</title>${inner}</svg>\n`;
}

const files = {
  "rime-mark.svg": svgFile(markB, markLayers(BRAND), { square: true, title: "Rime" }),
  "rime-wordmark.svg": svgFile(wordB, wordLayer(BRAND.ice), { title: "Rime" }),
  "rime-lockup.svg": svgFile(lockB, markLayers(BRAND) + wordLayer(BRAND.ice), { title: "Rime" }),
  // One-colour versions for dark grounds and single-ink use.
  "rime-mark-white.svg": svgFile(markB, markLayers({ frost: "#ffffff", ice: "#ffffff", mist: "#ffffff" }).replace(/<path /g, (m, i) => m), { square: true, title: "Rime" }),
  "rime-lockup-white.svg": svgFile(lockB, markLayers({ frost: "#ffffff", ice: "#ffffff", mist: "#ffffff" }) + wordLayer("#ffffff"), { title: "Rime" }),
  "rime-wordmark-white.svg": svgFile(wordB, wordLayer("#ffffff"), { title: "Rime" }),
  "rime-mark-mono.svg": svgFile(markB, markLayers({ frost: "currentColor", ice: "currentColor", mist: "currentColor" }), { square: true, title: "Rime" }),
};
// White mark keeps the tonal steps through opacity so the petals still read.
files["rime-mark-white.svg"] = svgFile(
  markB,
  `<path fill-rule="evenodd" fill="#fff" fill-opacity=".55" d="${P.mark_mist}"/><path fill-rule="evenodd" fill="#fff" fill-opacity=".8" d="${P.mark_ice}"/><path fill-rule="evenodd" fill="#fff" d="${P.mark_frost}"/>`,
  { square: true, title: "Rime" },
);
files["rime-lockup-white.svg"] = svgFile(
  lockB,
  `<path fill-rule="evenodd" fill="#fff" fill-opacity=".55" d="${P.mark_mist}"/><path fill-rule="evenodd" fill="#fff" fill-opacity=".8" d="${P.mark_ice}"/><path fill-rule="evenodd" fill="#fff" d="${P.mark_frost}"/>` + wordLayer("#ffffff"),
  { title: "Rime" },
);
for (const [name, svg] of Object.entries(files)) writeFileSync(`${OUT}/${name}`, svg);

// Favicon / app icons: the mark with breathing room, transparent; apple icon on white.
const iconSvg = svgFile(markB, markLayers(BRAND), { square: true, pad: Math.round(Math.max(markB.w, markB.h) * 0.06), title: "Rime" });
writeFileSync(`${OUT}/icon.svg`, iconSvg);
const png = (size, bg) =>
  sharp(Buffer.from(iconSvg), { density: 600 })
    .resize(size, size, { fit: "contain", background: bg ?? { r: 0, g: 0, b: 0, alpha: 0 } })
    .flatten(bg ? { background: bg } : false)
    .png({ compressionLevel: 9 })
    .toBuffer();
const sizes = [16, 32, 48, 180, 192, 512];
const pngs = {};
for (const s of sizes) pngs[s] = await png(s);
writeFileSync(`${OUT}/icon-192.png`, pngs[192]);
writeFileSync(`${OUT}/icon-512.png`, pngs[512]);
writeFileSync(
  `${OUT}/apple-icon.png`,
  await sharp(Buffer.from(svgFile(markB, markLayers(BRAND), { square: true, pad: Math.round(Math.max(markB.w, markB.h) * 0.16), title: "Rime" })), { density: 600 })
    .resize(180, 180).flatten({ background: "#ffffff" }).png().toBuffer(),
);

// favicon.ico with 16/32/48 PNG entries.
const ico = (images) => {
  const n = images.length;
  const header = Buffer.alloc(6 + 16 * n);
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(n, 4);
  let offset = 6 + 16 * n;
  images.forEach(({ size, buf }, i) => {
    const e = 6 + 16 * i;
    header.writeUInt8(size >= 256 ? 0 : size, e); header.writeUInt8(size >= 256 ? 0 : size, e + 1);
    header.writeUInt8(0, e + 2); header.writeUInt8(0, e + 3);
    header.writeUInt16LE(1, e + 4); header.writeUInt16LE(32, e + 6);
    header.writeUInt32LE(buf.length, e + 8); header.writeUInt32LE(offset, e + 12);
    offset += buf.length;
  });
  return Buffer.concat([header, ...images.map((x) => x.buf)]);
};
writeFileSync(`${OUT}/favicon.ico`, ico([16, 32, 48].map((s) => ({ size: s, buf: pngs[s] }))));

// Preview sheet.
const sheet = `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="900" viewBox="0 0 1400 900">
<rect width="1400" height="450" fill="#fff"/><rect y="450" width="1400" height="450" fill="#0f172a"/>
<image href="data:image/svg+xml;base64,${Buffer.from(files["rime-lockup.svg"]).toString("base64")}" x="60" y="60" width="700" height="230"/>
<image href="data:image/svg+xml;base64,${Buffer.from(files["rime-mark.svg"]).toString("base64")}" x="860" y="60" width="230" height="230"/>
<image href="data:image/svg+xml;base64,${Buffer.from(files["rime-wordmark.svg"]).toString("base64")}" x="1120" y="140" width="240" height="90"/>
<image href="data:image/png;base64,${pngs[32].toString("base64")}" x="860" y="330" width="32" height="32"/>
<image href="data:image/png;base64,${pngs[16].toString("base64")}" x="910" y="338" width="16" height="16"/>
<image href="data:image/svg+xml;base64,${Buffer.from(files["rime-lockup-white.svg"]).toString("base64")}" x="60" y="510" width="700" height="230"/>
<image href="data:image/svg+xml;base64,${Buffer.from(files["rime-mark-white.svg"]).toString("base64")}" x="860" y="510" width="230" height="230"/>
</svg>`;
await sharp(Buffer.from(sheet)).png().toFile(`${OUT}/_preview.png`);
console.log("bounds", { markB, wordB, lockB }, "sizes", Object.fromEntries(Object.entries(files).map(([k, v]) => [k, v.length])));
