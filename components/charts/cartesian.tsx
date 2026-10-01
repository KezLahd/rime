"use client";

import type { LabelProps } from "recharts";
import { numberAt, type ChartRow, type ChartSeries } from "./scale";

// Shared axis, grid and label specs for the Cartesian charts. Spread as
// props rather than wrapped in components so Recharts sees its own children.

/** Tick text: 11px, the muted ink (5.2:1 on glass), tabular via CSS. */
export const TICK = { fill: "var(--chart-tick)", fontSize: 11 } as const;

/** The category axis: a hairline baseline, no tick marks. */
export const CATEGORY_AXIS = {
  tickLine: false,
  axisLine: { stroke: "var(--chart-axis)" },
  tick: TICK,
  tickMargin: 8,
} as const;

/** The value axis: no line at all, the gridlines carry it. */
export const VALUE_AXIS = {
  tickLine: false,
  axisLine: false,
  tick: TICK,
  tickMargin: 6,
  allowDecimals: false,
} as const;

/** Recessive grid: solid hairlines one step off the surface, never dashed. */
export const GRID = { stroke: "var(--chart-grid)", strokeDasharray: undefined } as const;

/** Recharts' default x-axis band. */
export const X_AXIS_HEIGHT = 30;

/** Crosshair on line and area: a hairline that snaps to the nearest x. */
export const CROSSHAIR = { stroke: "var(--chart-cursor)", strokeWidth: 1 } as const;

/** Bars: a faint band behind the hovered category; the mark is the target. */
export const BAND_CURSOR = { fill: "var(--chart-band)" } as const;

/**
 * Tooltip motion: Recharts' defaults, which is what shadcn ships. While the
 * tooltip is active Recharts sets `transition: transform 400ms ease` on the
 * wrapper, so the box glides between points. "auto" turns it off under
 * prefers-reduced-motion and during SSR. Never pass isAnimationActive={false}.
 */
export const TOOLTIP_MOTION = {
  isAnimationActive: "auto",
  animationDuration: 400,
  animationEasing: "ease",
} as const;

/** Dots and end-markers wear a 2px ring in the surface colour. */
export function activeDot(color: string) {
  return { r: 4, fill: color, stroke: "var(--chart-gap)", strokeWidth: 2 } as const;
}

const LABEL_CHAR_PX = 6.2;
const MIN_LABEL_GAP_PX = 14;

/** Right margin that fits the end labels, capped so a long name cannot eat the plot. */
export function endLabelMargin(series: ReadonlyArray<ChartSeries>, valueWidth = 22): number {
  const longest = Math.max(...series.map((s) => (s.shortLabel ?? s.label).length));
  return Math.min(150, Math.round(longest * LABEL_CHAR_PX + valueWidth + 14));
}

/**
 * Direct end labels work only where series separate at the right edge. The
 * domain is set from niceTicks, so each end's pixel height is known before
 * render; if any two land closer than a line of text, labels are off and the
 * legend plus tooltip carry identity (nudging them apart would detach them).
 */
export function endLabelsFit(
  rows: ReadonlyArray<ChartRow>,
  series: ReadonlyArray<ChartSeries>,
  top: number,
  plotHeight: number,
): boolean {
  if (!rows.length || series.length > 4) return false;
  const last = rows[rows.length - 1];
  const ys = series.map((s) => (numberAt(last, s.key) / top) * plotHeight).sort((a, b) => a - b);
  return ys.every((y, i) => i === 0 || y - ys[i - 1] >= MIN_LABEL_GAP_PX);
}

/** Renders a label at the last point only: the value, then the series name. */
export function endLabel(lastIndex: number, name: string, format: (n: number) => string) {
  function EndLabel(props: LabelProps) {
    const { index, value, viewBox } = props;
    if (index !== lastIndex || !viewBox || !("x" in viewBox)) return null;
    const x = Number(viewBox.x ?? 0);
    const y = Number(viewBox.y ?? 0);
    return (
      <text x={x + 9} y={y} dy="0.35em" fontSize={11} fill="var(--chart-value)" fontWeight={700}>
        {format(Number(value ?? 0))}
        <tspan dx={5} fontWeight={400} fill="var(--chart-label)">
          {name}
        </tspan>
      </text>
    );
  }
  return EndLabel;
}
