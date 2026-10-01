// Colour maths for the studio: parsing, WCAG contrast, OKLCH for perceptual
// lightness moves, and nudging a colour to the nearest shade that passes.
// No dependencies; sRGB in, sRGB out.

export type Rgb = { r: number; g: number; b: number; a: number };

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const hex2 = (n: number) => Math.round(clamp(n, 0, 255)).toString(16).padStart(2, "0");

export function parseHex(hex: string): Rgb | null {
  const m = hex.trim().match(/^#([0-9a-f]{3,8})$/i);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join("");
  if (h.length !== 6 && h.length !== 8) return null;
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
    a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
  };
}

const RGB = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,/]\s*([\d.]+)(%?))?\s*\)$/i;

/** Hex, rgb() or rgba() (comma or space syntax). Anything else: null. */
export function parseColour(value: string): Rgb | null {
  const v = value.trim();
  if (v === "transparent") return { r: 0, g: 0, b: 0, a: 0 };
  if (v.startsWith("#")) return parseHex(v);
  const m = v.match(RGB);
  if (!m) return null;
  const a = m[4] === undefined ? 1 : m[5] === "%" ? Number(m[4]) / 100 : Number(m[4]);
  return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]), a };
}

/** "110, 84, 153" (an --rgb-* channel) to a colour. */
export function parseChannel(value: string): Rgb | null {
  const parts = value.split(",").map((s) => Number(s.trim()));
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
  return { r: parts[0], g: parts[1], b: parts[2], a: 1 };
}

export const toHex = (c: Rgb) => `#${hex2(c.r)}${hex2(c.g)}${hex2(c.b)}`;
export const toChannel = (c: Rgb) => `${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}`;
export const toCss = (c: Rgb) =>
  c.a >= 1 ? toHex(c) : `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${Number(c.a.toFixed(3))})`;

/** Source-over: a translucent colour laid on an opaque one. */
export function over(top: Rgb, under: Rgb): Rgb {
  const a = top.a;
  return { r: top.r * a + under.r * (1 - a), g: top.g * a + under.g * (1 - a), b: top.b * a + under.b * (1 - a), a: 1 };
}

const lin = (v: number) => {
  const s = v / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const unlin = (v: number) => 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);

export function luminance(c: Rgb): number {
  return 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
}

/** WCAG 2.x contrast. Translucent inputs are flattened (background onto white first). */
export function contrast(fg: Rgb, bg: Rgb): number {
  const white: Rgb = { r: 255, g: 255, b: 255, a: 1 };
  const base = bg.a < 1 ? over(bg, white) : bg;
  const ink = fg.a < 1 ? over(fg, base) : fg;
  const [hi, lo] = [luminance(ink), luminance(base)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// ── OKLCH ─────────────────────────────────────────────────────────────────

export type Oklch = { l: number; c: number; h: number };

export function toOklch(c: Rgb): Oklch {
  const r = lin(c.r), g = lin(c.g), b = lin(c.b);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.sqrt(A * A + B * B);
  const H = (Math.atan2(B, A) * 180) / Math.PI;
  return { l: L, c: C, h: H < 0 ? H + 360 : H };
}

function oklchToLinear({ l, c, h }: Oklch): [number, number, number] {
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  const L = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const M = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const S = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S,
    -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S,
    -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S,
  ];
}

/** OKLCH to sRGB, reducing chroma until the colour fits the gamut. */
export function fromOklch(o: Oklch): Rgb {
  let c = o.c;
  for (let i = 0; i < 24; i++) {
    const [r, g, b] = oklchToLinear({ ...o, c });
    if ([r, g, b].every((v) => v >= -0.0005 && v <= 1.0005)) {
      return { r: unlin(clamp(r)), g: unlin(clamp(g)), b: unlin(clamp(b)), a: 1 };
    }
    c *= 0.9;
  }
  const [r, g, b] = oklchToLinear({ ...o, c: 0 });
  return { r: unlin(clamp(r)), g: unlin(clamp(g)), b: unlin(clamp(b)), a: 1 };
}

/** The same hue and chroma at a new perceptual lightness. */
export const withLightness = (c: Rgb, l: number, chroma?: number): Rgb => {
  const o = toOklch(c);
  return fromOklch({ l: clamp(l), c: chroma ?? o.c, h: o.h });
};

export function mix(a: Rgb, b: Rgb, t: number): Rgb {
  return { r: a.r + (b.r - a.r) * t, g: a.g + (b.g - a.g) * t, b: a.b + (b.b - a.b) * t, a: a.a + (b.a - a.a) * t };
}

/**
 * The nearest shade of `ink` (same hue, moved in OKLCH lightness only) that
 * reaches `target` against `bg`. Tries darker and lighter and keeps the one
 * that moved least; null if neither direction gets there.
 */
export function nudgeToContrast(ink: Rgb, bg: Rgb, target = 4.5): Rgb | null {
  if (contrast(ink, bg) >= target) return ink;
  const o = toOklch(ink);
  let best: { c: Rgb; d: number } | null = null;
  for (const dir of [-1, 1]) {
    for (let step = 1; step <= 100; step++) {
      const l = o.l + dir * step * 0.01;
      if (l < 0 || l > 1) break;
      const cand = fromOklch({ ...o, l });
      if (contrast(cand, bg) >= target) {
        if (!best || step < best.d) best = { c: cand, d: step };
        break;
      }
    }
  }
  return best ? best.c : null;
}

export const isLight = (c: Rgb) => luminance(c) > 0.4;
