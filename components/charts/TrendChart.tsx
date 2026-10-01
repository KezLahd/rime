"use client";

import { Area, CartesianGrid, ComposedChart, LabelList, Line, ReferenceLine, Tooltip, XAxis, YAxis } from "recharts";
import {
  activeDot,
  CATEGORY_AXIS,
  CROSSHAIR,
  endLabel,
  endLabelMargin,
  endLabelsFit,
  GRID,
  VALUE_AXIS,
  X_AXIS_HEIGHT,
  TOOLTIP_MOTION,
} from "./cartesian";
import { ChartFrame, type ChartBaseProps, type LegendItem } from "./ChartFrame";
import { ChartTooltip } from "./ChartTooltip";
import { formatNumber } from "./format";
import { colorOf, maxOf, niceTicks, resolveSeries, type ChartRow, type SeriesOrConfig } from "./scale";

export type TrendChartProps = ChartBaseProps & {
  data: ReadonlyArray<ChartRow>;
  /** Field holding the x value (an ISO date for time series). */
  x: string;
  /** Axis tick: short ("23 Nov"). */
  formatX?: (value: string) => string;
  /** Tooltip header and table rows: in full ("Week of 23 Nov 2026"). */
  formatXLong?: (value: string) => string;
  formatValue?: (value: number) => string;
  /** Table header for the x column. */
  xLabel?: string;
  /**
   * Value and name at each line's end. On by default for up to four series;
   * switched off automatically where the ends would collide.
   */
  endLabels?: boolean;
  /** One horizontal limit on the same axis (program places). Never a second axis. */
  reference?: { value: number; label: string };
  /** Tooltip header tag, e.g. "Cumulative". */
  tooltipTag?: string;
} & SeriesOrConfig;

type Kind = { kind: "line" } | { kind: "area"; stacked?: boolean };

const MARGIN_TOP = 12;

function TrendChart(props: TrendChartProps & Kind) {
  const {
    data,
    x,
    series: seriesProp,
    config,
    formatX = String,
    formatXLong,
    formatValue = formatNumber,
    xLabel = "Week",
    endLabels = true,
    reference,
    tooltipTag,
    height = 248,
    ...base
  } = props;
  const stacked = props.kind === "area" && Boolean(props.stacked);
  const series = resolveSeries({ series: seriesProp, config });

  const dataMax = maxOf(data, series, stacked);
  const ticks = niceTicks(Math.max(dataMax, reference?.value ?? 0));
  const top = ticks[ticks.length - 1];
  const plotHeight = height - MARGIN_TOP - X_AXIS_HEIGHT;
  const showEnds = endLabels && !stacked && endLabelsFit(data, series, top, plotHeight);
  const lastIndex = data.length - 1;
  const yWidth = Math.max(28, formatValue(top).length * 7 + 8);

  const legend: LegendItem[] = series.map((s, i) => ({
    key: s.key,
    label: s.label,
    color: colorOf(s, i),
    shape: props.kind === "line" ? "line" : "rect",
  }));

  return (
    <ChartFrame
      {...base}
      height={height}
      skeleton={props.kind === "line" ? "line" : "area"}
      legend={legend}
      isEmpty={data.length === 0}
      table={{
        rowHeader: { key: x, label: xLabel, format: (v) => (formatXLong ?? formatX)(String(v)) },
        columns: series.map((s) => ({ key: s.key, label: s.label, numeric: true, format: (v) => formatValue(Number(v ?? 0)) })),
        rows: data,
      }}
    >
      {({ width }) => (
        <ComposedChart
          width={width}
          height={height}
          data={data as ChartRow[]}
          margin={{ top: MARGIN_TOP, right: showEnds ? endLabelMargin(series) : 12, bottom: 0, left: 0 }}
          desc={base.summary}
          accessibilityLayer
        >
          <CartesianGrid vertical={false} {...GRID} />
          <XAxis
            dataKey={x}
            {...CATEGORY_AXIS}
            tickFormatter={(v) => formatX(String(v))}
            interval="preserveStartEnd"
            minTickGap={18}
          />
          <YAxis {...VALUE_AXIS} domain={[0, top]} ticks={ticks} width={yWidth} tickFormatter={(v) => formatValue(Number(v))} />
          {reference ? (
            <ReferenceLine
              y={reference.value}
              stroke="var(--chart-cursor)"
              strokeWidth={1}
              label={{
                value: `${reference.label} · ${formatValue(reference.value)}`,
                position: "insideTopLeft",
                fill: "var(--chart-label)",
                fontSize: 11,
                offset: 6,
              }}
            />
          ) : null}
          <Tooltip
            cursor={CROSSHAIR}
            {...TOOLTIP_MOTION}
            content={(p) => (
              <ChartTooltip
                {...p}
                series={series}
                formatLabel={formatXLong ?? formatX}
                formatValue={formatValue}
                tag={tooltipTag}
                total={stacked}
                indicator={props.kind === "line" ? "line" : "dot"}
              />
            )}
          />
          {series.map((s, i) => {
            const color = colorOf(s, i);
            const labels = showEnds ? (
              <LabelList dataKey={s.key} content={endLabel(lastIndex, s.shortLabel ?? s.label, formatValue)} />
            ) : null;
            return props.kind === "line" ? (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                dot={false}
                activeDot={activeDot(color)}
              >
                {labels}
              </Line>
            ) : (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stackId={stacked ? "stack" : undefined}
                stroke={color}
                strokeWidth={2}
                fill={color}
                fillOpacity={0.1}
                activeDot={activeDot(color)}
              >
                {labels}
              </Area>
            );
          })}
        </ComposedChart>
      )}
    </ChartFrame>
  );
}

/** Change over time, one or more series. Weekly orders by region. */
export function LineChart(props: TrendChartProps) {
  return <TrendChart {...props} kind="line" />;
}

export type AreaChartProps = TrendChartProps & {
  /** Parts of a whole over time. Off for a single running total. */
  stacked?: boolean;
};

/** A running total, or parts of a whole over time. Fill is a 10% wash, never a block. */
export function AreaChart({ stacked, ...props }: AreaChartProps) {
  return <TrendChart {...props} kind="area" stacked={stacked} />;
}
