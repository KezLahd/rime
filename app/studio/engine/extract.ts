import { fromOklch, toOklch, type Oklch, type Rgb } from "./colour";

// Palette extraction from an image, entirely in the browser: downscale onto
// a canvas, cluster the pixels in OKLab with k-means (k-means++ seeding,
// deterministic), merge near-duplicates, and return the swatches by share.

export type Swatch = { id: string; rgb: Rgb; oklch: Oklch; share: number };

type Lab = [number, number, number];

const toLab = (c: Rgb): Lab => {
  const o = toOklch(c);
  return [o.l, o.c * Math.cos((o.h * Math.PI) / 180), o.c * Math.sin((o.h * Math.PI) / 180)];
};
const fromLab = ([l, a, b]: Lab): Rgb => {
  const c = Math.sqrt(a * a + b * b);
  const h = (Math.atan2(b, a) * 180) / Math.PI;
  return fromOklch({ l, c, h: h < 0 ? h + 360 : h });
};
const d2 = (p: Lab, q: Lab) => (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2;

/** Pixels from an image, downscaled so the longest edge is `size`. Transparent pixels are dropped. */
export function samplePixels(img: CanvasImageSource & { width: number; height: number }, size = 96): Rgb[] {
  const scale = Math.min(1, size / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;
  const out: Rgb[] = [];
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    out.push({ r: data[i], g: data[i + 1], b: data[i + 2], a: 1 });
  }
  return out;
}

export function extractPalette(pixels: Rgb[], k = 8): Swatch[] {
  if (!pixels.length) return [];
  const pts = pixels.map(toLab);
  // k-means++ seeding, made deterministic: start from the most populous
  // lightness band's first pixel, then always take the farthest point.
  const centres: Lab[] = [pts[Math.floor(pts.length / 2)]];
  const dist = pts.map((p) => d2(p, centres[0]));
  while (centres.length < Math.min(k, pts.length)) {
    let best = 0;
    for (let i = 1; i < pts.length; i++) if (dist[i] > dist[best]) best = i;
    if (dist[best] === 0) break;
    centres.push(pts[best]);
    for (let i = 0; i < pts.length; i++) dist[i] = Math.min(dist[i], d2(pts[i], pts[best]));
  }
  const assign = new Array<number>(pts.length).fill(0);
  for (let iter = 0; iter < 14; iter++) {
    let moved = false;
    for (let i = 0; i < pts.length; i++) {
      let bi = 0;
      let bd = Infinity;
      for (let c = 0; c < centres.length; c++) {
        const d = d2(pts[i], centres[c]);
        if (d < bd) {
          bd = d;
          bi = c;
        }
      }
      if (assign[i] !== bi) {
        assign[i] = bi;
        moved = true;
      }
    }
    const sums = centres.map(() => [0, 0, 0, 0]);
    pts.forEach((p, i) => {
      const s = sums[assign[i]];
      s[0] += p[0];
      s[1] += p[1];
      s[2] += p[2];
      s[3]++;
    });
    sums.forEach((s, c) => {
      if (s[3]) centres[c] = [s[0] / s[3], s[1] / s[3], s[2] / s[3]];
    });
    if (!moved) break;
  }
  const counts = centres.map(() => 0);
  assign.forEach((c) => counts[c]++);
  // Merge clusters a person could not tell apart (ΔE ok < 0.035).
  const merged: Array<{ lab: Lab; n: number }> = [];
  centres
    .map((lab, i) => ({ lab, n: counts[i] }))
    .filter((c) => c.n > 0)
    .sort((a, b) => b.n - a.n)
    .forEach((c) => {
      const near = merged.find((m) => Math.sqrt(d2(m.lab, c.lab)) < 0.035);
      if (!near) merged.push({ ...c });
      else {
        const t = c.n / (near.n + c.n);
        near.lab = [near.lab[0] + (c.lab[0] - near.lab[0]) * t, near.lab[1] + (c.lab[1] - near.lab[1]) * t, near.lab[2] + (c.lab[2] - near.lab[2]) * t];
        near.n += c.n;
      }
    });
  return merged.map((m, i) => {
    const rgb = fromLab(m.lab);
    return { id: `s${i}`, rgb, oklch: toOklch(rgb), share: m.n / pts.length };
  });
}
