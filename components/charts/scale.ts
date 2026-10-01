import { seriesColor } from "./palette";
import type { ChartConfig } from "./primitives";

/** A value column plotted by a chart. */
export type ChartSeries = {
  /** Field on each row. */
  key: string;
  label: string;
  /** For direct end labels, where the full name would crowd the plot. */
  shortLabel?: string;
  /**
   * Fixed categorical slot (0-based). Colour follows the entity, not its
   * position in today's list: give each region or team a stable slot so a
   * filter that removes one never repaints the others. Defaults to index.
   */
  slot?: number;
  /** Explicit colour (a var() from palette.ts). Wins over slot. */
  color?: string;
};

/**
 * shadcn-style config to Rime's series list, for the high-level charts'
 * `config` prop. Order is the categorical slot order. A label that is not a
 * string falls back to the key.
 */
export function seriesFromConfig(config: ChartConfig): ChartSeries[] {
  return Object.entries(config).map(([key, c], slot) => ({
    key,
    label: typeof c.label === "string" ? c.label : key,
    color: c.color ?? c.theme?.light,
    slot,
  }));
}

/**
 * A chart's series, either as Rime's list or as a shadcn ChartConfig.
 * Exactly one is given.
 */
export type SeriesOrConfig =
  | { series: ReadonlyArray<ChartSeries>; config?: never }
  | { config: ChartConfig; series?: never };

export function resolveSeries(p: { series?: ReadonlyArray<ChartSeries>; config?: ChartConfig }): ReadonlyArray<ChartSeries> {
  return p.series ?? (p.config ? seriesFromConfig(p.config) : []);
}

export type ChartRow = Record<string, string | number | null | undefined>;

export function colorOf(series: ChartSeries, index: number): string {
  return series.color ?? seriesColor(series.slot ?? index);
}

export function numberAt(row: ChartRow, key: string): number {
  const v = row[key];
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

/**
 * Clean, round axis ticks from zero: 0 / 5 / 10 / 15, 0 / 250 / 500. The
 * charts set their domain from these, so ticks are always whole steps and
 * direct labels can be placed (and collision-checked) before render.
 */
export function niceTicks(max: number, target = 4): number[] {
  if (!(max > 0)) return [0, 1];
  const raw = max / target;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= raw) ?? 10 * magnitude;
  // Counts are whole: never a 0.5 tick on a customer axis.
  const whole = max >= target ? Math.max(1, Math.round(step)) : step;
  const top = Math.ceil(max / whole) * whole;
  const ticks: number[] = [];
  for (let v = 0; v <= top + whole / 2; v += whole) ticks.push(Number(v.toFixed(6)));
  return ticks;
}

/** Largest value a chart has to fit: per row, summed when stacked. */
export function maxOf(rows: ReadonlyArray<ChartRow>, series: ReadonlyArray<ChartSeries>, stacked: boolean): number {
  let max = 0;
  for (const row of rows) {
    if (stacked) max = Math.max(max, series.reduce((n, s) => n + numberAt(row, s.key), 0));
    else for (const s of series) max = Math.max(max, numberAt(row, s.key));
  }
  return max;
}

export const OTHER_KEY = "__other";

/**
 * Keep the first `max - 1` series and sum the rest into "Other". Never solve
 * too many series with more hues. Survivors keep their slots, so folding
 * does not repaint them; Other takes the de-emphasis grey.
 */
export function foldSeries(
  rows: ReadonlyArray<ChartRow>,
  series: ReadonlyArray<ChartSeries>,
  max: number,
  otherLabel = "Other",
): { rows: ChartRow[]; series: ChartSeries[] } {
  if (series.length <= max) return { rows: rows.map((r) => ({ ...r })), series: series.map((s, i) => ({ slot: i, ...s })) };
  const kept = series.slice(0, max - 1).map((s, i) => ({ slot: i, ...s }));
  const folded = series.slice(max - 1);
  return {
    rows: rows.map((r) => ({ ...r, [OTHER_KEY]: folded.reduce((n, s) => n + numberAt(r, s.key), 0) })),
    series: [...kept, { key: OTHER_KEY, label: otherLabel, color: "var(--chart-other)" }],
  };
}
