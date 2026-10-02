import { contrast, fromOklch, nudgeToContrast, over, toChannel, toHex, toOklch, withLightness, type Rgb } from "./colour";
import type { Swatch } from "./extract";
import type { Overrides } from "./macros";

// From an extracted palette to a whole theme. Swatches are given roles
// (brand, deep, accent, neutral) by contrast-aware rules; every other token
// is derived from those four in OKLCH, so inks keep the default lightness
// ladder in the new hue. Then the contrast guard runs and nudges any
// failing ink to the nearest passing shade, saying so.

export type Role = "brand" | "deep" | "accent" | "neutral" | "chart1" | "chart2" | "chart3" | "chart4" | "chart5" | "chart6";
export const ROLES: ReadonlyArray<{ id: Role; label: string; note: string }> = [
  { id: "brand", label: "Brand", note: "Primary buttons, focus, the gradient's light stop." },
  { id: "deep", label: "Deep", note: "Headings, the gradient's dark stop." },
  { id: "accent", label: "Accent", note: "Info tints, the second bloom, the logo corner's end." },
  { id: "neutral", label: "Neutral", note: "The warm or cool neutral: table header sweep." },
  { id: "chart1", label: "Chart series 1", note: "Primary chart series." },
  { id: "chart2", label: "Chart series 2", note: "Second chart series." },
  { id: "chart3", label: "Chart series 3", note: "Third chart series." },
  { id: "chart4", label: "Chart series 4", note: "Fourth chart series." },
  { id: "chart5", label: "Chart series 5", note: "Fifth chart series." },
  { id: "chart6", label: "Chart series 6", note: "Sixth chart series." },
];

export type Assignment = Record<Role, string | null>;
export type Mapped = { overrides: Overrides; notes: string[] };

const hueGap = (a: number, b: number) => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};

/** The rules: brand is the most chromatic mid-lightness swatch weighted by share, and so on. */
export function autoAssign(swatches: Swatch[]): Assignment {
  const chromatic = swatches.filter((s) => s.oklch.c > 0.04);
  const score = (s: Swatch) => s.oklch.c * Math.sqrt(s.share) * (s.oklch.l > 0.25 && s.oklch.l < 0.8 ? 1 : 0.4);
  const brand = [...chromatic].sort((a, b) => score(b) - score(a))[0] ?? null;
  const deep = brand
    ? chromatic.filter((s) => s !== brand && hueGap(s.oklch.h, brand.oklch.h) < 45 && s.oklch.l < brand.oklch.l - 0.08).sort((a, b) => a.oklch.l - b.oklch.l)[0] ?? null
    : null;
  const accent = brand
    ? chromatic.filter((s) => s !== brand && s !== deep && hueGap(s.oklch.h, brand.oklch.h) >= 30).sort((a, b) => score(b) - score(a))[0] ?? null
    : null;
  const neutral = swatches.filter((s) => s.oklch.c <= 0.05 && s.oklch.l > 0.7).sort((a, b) => b.share - a.share)[0] ?? null;

  // Chart series 1-6: fill the categorical palette from the extracted
  // swatches, picking distinct chromatic colours by score so a logo with
  // 3-4 prominent colours actually gets them into the chart tokens too.
  // Series 1 defaults to the brand hue, then we grab the next five most
  // interesting swatches with the biggest hue separation from what's
  // already assigned so series read as a palette, not neighbours.
  const chartAssign: (string | null)[] = [brand?.id ?? null, null, null, null, null, null];
  const assigned = new Set<string>();
  if (brand) assigned.add(brand.id);
  const pool = [...chromatic].sort((a, b) => score(b) - score(a));
  for (let slot = 1; slot < 6; slot++) {
    // Prefer swatches with the largest minimum hue gap to already-used
    // chart series, falling back to raw score if no chromatic room is left.
    const choices = pool
      .filter((s) => !assigned.has(s.id))
      .map((s) => {
        const used = chartAssign
          .map((id) => (id ? chromatic.find((c) => c.id === id) : null))
          .filter((x): x is Swatch => Boolean(x));
        const minGap = used.length ? Math.min(...used.map((u) => hueGap(s.oklch.h, u.oklch.h))) : 180;
        return { s, rank: minGap * 1.2 + score(s) * 10 };
      })
      .sort((a, b) => b.rank - a.rank);
    const pick = choices[0]?.s;
    if (!pick) break;
    chartAssign[slot] = pick.id;
    assigned.add(pick.id);
  }

  return {
    brand: brand?.id ?? null,
    deep: deep?.id ?? null,
    accent: accent?.id ?? null,
    neutral: neutral?.id ?? null,
    chart1: chartAssign[0],
    chart2: chartAssign[1],
    chart3: chartAssign[2],
    chart4: chartAssign[3],
    chart5: chartAssign[4],
    chart6: chartAssign[5],
  };
}

const WHITE: Rgb = { r: 255, g: 255, b: 255, a: 1 };

export function mapToTheme(swatches: Swatch[], roles: Assignment): Mapped {
  const pick = (r: Role) => swatches.find((s) => s.id === roles[r])?.rgb ?? null;
  const notes: string[] = [];
  const fallback: Rgb = { r: 110, g: 84, b: 153, a: 1 };

  let brand = pick("brand") ?? fallback;
  // The accent as picked stays --brand (fills, focus); the button-safe shade is --brand-action.
  const accentRaw = brand;
  const bo = toOklch(brand);
  // White button text must hold 4.5:1 at the gradient's light stop.
  const nudgedBrand = nudgeToContrast(brand, WHITE, 4.5);
  if (nudgedBrand && toHex(nudgedBrand) !== toHex(brand)) {
    notes.push(`Primary buttons start from ${toHex(nudgedBrand)} (the brand ${toHex(brand)} darkened) so white button text holds 4.5:1.`);
    brand = nudgedBrand;
  }
  const deep = pick("deep") ?? withLightness(brand, Math.min(0.32, toOklch(brand).l - 0.12));
  const accent = pick("accent") ?? fromOklch({ l: 0.62, c: Math.min(0.12, bo.c), h: (bo.h + 40) % 360 });
  const neutral = pick("neutral") ?? fromOklch({ l: 0.86, c: 0.02, h: (bo.h + 180) % 360 });

  const deepO = toOklch(deep);
  const inkChroma = Math.min(0.035, deepO.c);
  const ink = (l: number) => fromOklch({ l, c: inkChroma, h: deepO.h });

  const pageBase = fromOklch({ l: 0.935, c: Math.min(0.045, bo.c * 0.5), h: bo.h });
  const bloomA = fromOklch({ l: 0.82, c: Math.min(0.11, bo.c * 0.8), h: bo.h });
  const accentO = toOklch(accent);
  const bloomB = fromOklch({ l: 0.83, c: Math.min(0.1, accentO.c * 0.8), h: accentO.h });

  // Worst case for small text: a 0.4 white pane over the strongest bloom.
  const glass = over({ ...WHITE, a: 0.4 }, over({ ...bloomA, a: 0.55 }, pageBase));

  const inks: Record<string, { c: Rgb; on: Rgb; target: number; label: string }> = {
    "--ink-body": { c: ink(0.3), on: glass, target: 4.5, label: "Body ink" },
    "--ink-secondary": { c: ink(0.4), on: glass, target: 4.5, label: "Secondary ink" },
    "--ink-muted": { c: ink(0.46), on: glass, target: 4.5, label: "Muted ink" },
    "--ink-brand": { c: withLightness(brand, Math.min(0.45, toOklch(brand).l)), on: glass, target: 4.5, label: "Brand ink" },
    "--ink-placeholder": { c: ink(0.55), on: WHITE, target: 4.5, label: "Placeholder ink" },
  };
  const out: Overrides = {};
  for (const [name, spec] of Object.entries(inks)) {
    let c = spec.c;
    if (contrast(c, spec.on) < spec.target) {
      const n = nudgeToContrast(c, spec.on, spec.target);
      if (n) {
        notes.push(`${spec.label} moved to ${toHex(n)} to reach ${spec.target}:1 on worst-case glass (was ${contrast(c, spec.on).toFixed(2)}:1).`);
        c = n;
      } else notes.push(`${spec.label} cannot reach ${spec.target}:1 in this hue; pick a darker deep colour.`);
    }
    out[name] = toHex(c);
  }
  let heading = deep;
  if (contrast(heading, glass) < 4.5) {
    const n = nudgeToContrast(heading, glass, 4.5);
    if (n) {
      notes.push(`Deep (headings) darkened to ${toHex(n)} for 4.5:1 on glass.`);
      heading = n;
    }
  }

  Object.assign(out, {
    "--brand": toHex(accentRaw),
    "--brand-action": toHex(brand),
    "--brand-strong": toHex(withLightness(brand, Math.max(0.22, toOklch(brand).l - 0.1))),
    "--rgb-brand": toChannel(brand),
    "--brand-deep": toHex(heading),
    "--rgb-brand-deep": toChannel(heading),
    "--brand-soft": toHex(accent),
    "--rgb-brand-soft": toChannel(accent),
    "--support": toHex(neutral),
    "--rgb-support": toChannel(neutral),
    "--rgb-bloom-a": toChannel(bloomA),
    "--rgb-bloom-b": toChannel(bloomB),
    "--page-base": toHex(pageBase),
    "--night": toHex(fromOklch({ l: 0.2, c: Math.min(0.02, deepO.c), h: deepO.h })),
    "--rgb-contact": toChannel(fromOklch({ l: 0.18, c: Math.min(0.04, deepO.c), h: deepO.h })),
    "--rgb-shade": toChannel(fromOklch({ l: 0.14, c: Math.min(0.04, deepO.c), h: deepO.h })),
    "--ink-disabled": toHex(ink(0.7)),
    "--logo-corner-bg": `linear-gradient(135deg, var(--brand) 0%, ${toHex(fromOklch({ l: 0.68, c: Math.min(0.13, accentO.c), h: accentO.h }))} 100%)`,
    "--ink-heading": "var(--brand-deep)",
  });

  // Chart series: write each assigned slot so a logo with 3+ prominent
  // colours actually seeds the whole chart palette rather than leaving
  // five of six slots on the default Rime set.
  const chartSlots: Array<[Role, string]> = [
    ["chart1", "--chart-1"],
    ["chart2", "--chart-2"],
    ["chart3", "--chart-3"],
    ["chart4", "--chart-4"],
    ["chart5", "--chart-5"],
    ["chart6", "--chart-6"],
  ];
  for (const [role, token] of chartSlots) {
    const rgb = pick(role);
    if (rgb) out[token] = toHex(rgb);
  }

  return { overrides: out, notes };
}
