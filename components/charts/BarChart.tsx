"use client";

import {
  Bar,
  BarChart as RBarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Rectangle,
  Tooltip,
  XAxis,
  YAxis,
  type BarShapeProps,
} from "recharts";
import { BAND_CURSOR, CATEGORY_AXIS, GRID, TICK, VALUE_AXIS, TOOLTIP_MOTION } from "./cartesian";
import { ChartFrame, type ChartBaseProps, type LegendItem } from "./ChartFrame";
import { ChartTooltip } from "./ChartTooltip";
import { formatNumber } from "./format";
import { colorOf, maxOf, niceTicks, numberAt, resolveSeries, type ChartRow, type SeriesOrConfig } from "./scale";

export type BarChartProps = ChartBaseProps & {
  data: ReadonlyArray<ChartRow>;
  /** Field holding the category (region, team member, week, stage). */
  category: string;
  /**
   * columns = vertical bars, for time and short labels.
   * bars    = horizontal, for many or long-named categories (regions, team members).
   */
  orientation?: "columns" | "bars";
  /** Parts of a whole per category. */
  stacked?: boolean;
  /**
   * One colour per category, for ordered categories on a single series (a
   * funnel's stages, from ordinalColors). Nominal categories never get this:
   * one series is one colour.
   */
  categoryColors?: ReadonlyArray<string>;
  formatCategory?: (value: string) => string;
  formatCategoryLong?: (value: string) => string;
  formatValue?: (value: number) => string;
  categoryLabel?: string;
  /** Value at each bar's end. Default: on for a single unstacked series. */
  valueLabels?: boolean;
  /** Fixed value-axis top, e.g. 5 for places per team member. */
  max?: number;
  /** Width reserved for horizontal-bar category labels. */
  categoryWidth?: number;
  tooltipTag?: string;
} & SeriesOrConfig;

/** Mark spec: never thicker than 24px, whatever the slot allows. */
const MAX_BAR = 24;

export function BarChart({
  data,
  category,
  series: seriesProp,
  config,
  orientation = "columns",
  stacked = false,
  categoryColors,
  formatCategory = String,
  formatCategoryLong,
  formatValue = formatNumber,
  categoryLabel = "Category",
  valueLabels,
  max,
  categoryWidth = 150,
  tooltipTag,
  height,
  ...base
}: BarChartProps) {
  const series = resolveSeries({ series: seriesProp, config });
  const horizontal = orientation === "bars";
  const plotHeight = height ?? (horizontal ? Math.max(120, data.length * 36 + 30) : 248);
  const ticks = niceTicks(max ?? maxOf(data, series, stacked), horizontal ? 5 : 4);
  const top = ticks[ticks.length - 1];
  const single = series.length === 1 && !stacked;
  const showValues = valueLabels ?? single;

  const legend: LegendItem[] = series.map((s, i) => ({ key: s.key, label: s.label, color: colorOf(s, i), shape: "rect" }));

  return (
    <ChartFrame
      {...base}
      height={plotHeight}
      skeleton={horizontal ? "bars" : "columns"}
      legend={legend}
      isEmpty={data.length === 0}
      table={{
        rowHeader: { key: category, label: categoryLabel, format: (v) => (formatCategoryLong ?? formatCategory)(String(v)) },
        columns: series.map((s) => ({ key: s.key, label: s.label, numeric: true, format: (v) => formatValue(Number(v ?? 0)) })),
        rows: data,
        totals: stacked || series.length > 1,
      }}
    >
      {({ width, markRadius: r }) => {
        // 4px rounded data-end, square at the baseline; square when the theme zeroes the radius.
        const end: [number, number, number, number] = horizontal ? [0, r, r, 0] : [r, r, 0, 0];
        // Only the outermost non-zero segment of a stack gets the rounded end,
        // so a row whose last series is 0 still ends round. Hover lightens.
        const shapeFor = (i: number, active: boolean) =>
          function BarShape(p: BarShapeProps) {
            const row = (p.payload ?? {}) as ChartRow;
            const outer = !stacked || series.slice(i + 1).every((s) => numberAt(row, s.key) <= 0);
            return (
              <Rectangle
                x={p.x}
                y={p.y}
                width={p.width}
                height={p.height}
                fill={p.fill}
                stroke={p.stroke}
                strokeWidth={p.strokeWidth}
                radius={outer ? end : 0}
                fillOpacity={active ? 0.82 : 1}
              />
            );
          };
        // Columns: a tick per bar where they fit, else every nth, evenly.
        const every = Math.max(0, Math.ceil((data.length * 52) / Math.max(1, width - 60)) - 1);
        const valueAxis = (
          <XAxis
            type="number"
            {...VALUE_AXIS}
            domain={[0, top]}
            ticks={ticks}
            tickFormatter={(v) => formatValue(Number(v))}
          />
        );
        return (
          <RBarChart
            width={width}
            height={plotHeight}
            data={data as ChartRow[]}
            layout={horizontal ? "vertical" : "horizontal"}
            margin={{ top: 12, right: showValues ? 36 : 12, bottom: 0, left: 0 }}
            barCategoryGap={horizontal ? "30%" : "28%"}
            barGap={2}
            desc={base.summary}
            accessibilityLayer
          >
            <CartesianGrid horizontal={!horizontal} vertical={horizontal} {...GRID} />
            {horizontal ? (
              <>
                {valueAxis}
                <YAxis
                  type="category"
                  dataKey={category}
                  width={categoryWidth}
                  tickLine={false}
                  axisLine={{ stroke: "var(--chart-axis)" }}
                  tick={{ ...TICK, fill: "var(--chart-label)" }}
                  tickFormatter={(v) => formatCategory(String(v))}
                  interval={0}
                />
              </>
            ) : (
              <>
                <XAxis
                  dataKey={category}
                  {...CATEGORY_AXIS}
                  tickFormatter={(v) => formatCategory(String(v))}
                  interval={every}
                />
                <YAxis
                  {...VALUE_AXIS}
                  domain={[0, top]}
                  ticks={ticks}
                  width={Math.max(28, formatValue(top).length * 7 + 8)}
                  tickFormatter={(v) => formatValue(Number(v))}
                />
              </>
            )}
            <Tooltip
              cursor={BAND_CURSOR}
              {...TOOLTIP_MOTION}
              content={(p) => (
                <ChartTooltip
                  {...p}
                  series={series}
                  formatLabel={formatCategoryLong ?? formatCategory}
                  formatValue={formatValue}
                  tag={tooltipTag}
                  total={stacked}
                />
              )}
            />
            {series.map((s, i) => {
              const color = colorOf(s, i);
              return (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  name={s.label}
                  fill={color}
                  stackId={stacked ? "stack" : undefined}
                  maxBarSize={MAX_BAR}
                  // The 2px surface gap between stacked segments.
                  stroke={stacked ? "var(--chart-gap)" : undefined}
                  strokeWidth={stacked ? 2 : 0}
                  shape={shapeFor(i, false)}
                  activeBar={shapeFor(i, true)}
                >
                  {categoryColors && single
                    ? data.map((row, j) => <Cell key={String(row[category])} fill={categoryColors[j] ?? color} />)
                    : null}
                  {showValues ? (
                    <LabelList
                      dataKey={s.key}
                      position={horizontal ? "right" : "top"}
                      offset={6}
                      fontSize={11}
                      fontWeight={700}
                      fill="var(--chart-value)"
                      formatter={(v) => formatValue(Number(v ?? 0))}
                    />
                  ) : null}
                </Bar>
              );
            })}
          </RBarChart>
        );
      }}
    </ChartFrame>
  );
}
