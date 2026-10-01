// Chart colour roles. Charts never carry a hex: every mark reads a CSS custom
// property declared on the chart root (Charts.module.css), so a theme
// re-themes a chart the same way it re-themes everything else, with no client
// code. The hexes below are the documented values those properties hold,
// kept here for swatches and for anyone re-running a palette validator.
// Change a value in BOTH places and re-validate (adjacent-pair CVD
// separation, every slot at least 3:1 on the surface).

export type PaletteSwatch = {
  /** Custom property the charts read. */
  token: string;
  name: string;
  hex: string;
  /** Where the hue comes from. */
  source: string;
};

/**
 * Categorical order. The order is the colour-blind safety mechanism, not a
 * preference: assign in sequence, never cycle, never re-rank on filter. A
 * seventh series folds into "Other" (foldSeries).
 */
export const CATEGORICAL: ReadonlyArray<PaletteSwatch> = [
  { token: "--chart-1", name: "Blue", hex: "#4a8ef0", source: "Primary series, the brand hue" },
  { token: "--chart-2", name: "Red", hex: "#e85c6d", source: "Second series, warm complement" },
  { token: "--chart-3", name: "Green", hex: "#4fbb6e", source: "Third series, clear of the blue" },
  { token: "--chart-4", name: "Yellow", hex: "#f5c04c", source: "Fourth series, warm amber (no mustard)" },
  { token: "--chart-5", name: "Lavender", hex: "#a67cf2", source: "Fifth series, soft purple" },
  { token: "--chart-6", name: "Teal", hex: "#5fb4c8", source: "Sixth series, a cool close-out" },
];

/** Ordered categories (funnel stages, size bands, severity): one hue, light to dark. */
export const ORDINAL = ["#9fc6fb", "#6fa9fb", "#468cfb", "#2b6cdb", "#1d52b5"] as const;

/** State, never identity. Always with an icon and a label, never colour alone. */
export const STATUS = { good: "#1f7d57", warning: "#a8770f", danger: "#b42323" } as const;

/** "Other" and de-emphasised context series. Sub-3:1 by design: never the story. */
export const OTHER = "#a3a8b3";

/** The surface the palette was checked against. */
export const SURFACE = "#ffffff";

export const SERIES_SLOTS = 6;

/** Categorical slot colour. Slot 7 and beyond is "Other", never a new hue. */
export function seriesColor(slot: number): string {
  return slot >= 0 && slot < SERIES_SLOTS ? `var(--chart-${slot + 1})` : "var(--chart-other)";
}

export const OTHER_COLOR = "var(--chart-other)";

const ORDINAL_STEPS = 5;

/**
 * n evenly spaced steps from the ordinal ramp, light to dark. Never starts
 * lighter than step 1 (the 2:1 floor) and holds at five: more ordered bins
 * than that blur, so show a table instead.
 */
export function ordinalColors(n: number): string[] {
  const count = Math.max(1, Math.min(ORDINAL_STEPS, n));
  if (count === 1) return ["var(--chart-seq-4)"];
  return Array.from({ length: count }, (_, i) => {
    const step = Math.round((i * (ORDINAL_STEPS - 1)) / (count - 1)) + 1;
    return `var(--chart-seq-${step})`;
  });
}

export const STATUS_COLOR = {
  good: "var(--chart-good)",
  warning: "var(--chart-warning)",
  danger: "var(--chart-danger)",
} as const;

// ── WCAG contrast, for the swatch readouts ────────────────────────────────

function channel(v: number): number {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => channel(parseInt(h.slice(i, i + 2), 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
