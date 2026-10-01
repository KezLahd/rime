"use client";

import type { Key } from "react";
import { Cell, Pie, PieChart, Sector, Tooltip, type PieSectorDataItem, type TooltipContentProps } from "recharts";
import { ChartFrame, LegendKey, type ChartBaseProps } from "./ChartFrame";
import styles from "./Charts.module.css";
import { formatNumber, formatPercent } from "./format";
import { TOOLTIP_MOTION } from "./cartesian";
import { seriesColor } from "./palette";

export type DonutDatum = {
  key: string;
  label: string;
  value: number;
  /** Explicit colour: ordinalColors() for ordered classes (severity). Default: categorical slot. */
  color?: string;
};

export type DonutChartProps = Omit<ChartBaseProps, "height"> & {
  data: ReadonlyArray<DonutDatum>;
  /** Centre figure label, e.g. "Customers". The figure is the total. */
  centreLabel: string;
  /** Override the centre figure (defaults to the sum). */
  centreValue?: string;
  formatValue?: (value: number) => string;
  /** Ring diameter in px. */
  size?: number;
  categoryLabel?: string;
};

// Part-to-whole at a glance: five segments at most (fold the tail into
// "Other"), and close values belong in a bar chart. With three or fewer
// categorical slots the ends, which touch, are validated all-pairs.
const RING = 20;

type Slice = DonutDatum & { fill: string; share: number };

export function DonutChart({
  data,
  centreLabel,
  centreValue,
  formatValue = formatNumber,
  size = 168,
  categoryLabel = "Group",
  ...base
}: DonutChartProps) {
  const total = data.reduce((n, d) => n + d.value, 0);
  const slices: Slice[] = data.map((d, i) => ({
    ...d,
    fill: d.color ?? seriesColor(i),
    share: total > 0 ? d.value / total : 0,
  }));

  return (
    <ChartFrame
      {...base}
      height={size}
      grow
      skeleton="donut"
      isEmpty={total === 0}
      table={{
        rowHeader: { key: "label", label: categoryLabel },
        columns: [
          { key: "value", label: centreLabel, numeric: true, format: (v) => formatValue(Number(v ?? 0)) },
          { key: "share", label: "Share", numeric: true, format: (v) => formatPercent(Number(v ?? 0)) },
        ],
        rows: slices.map((s) => ({ label: s.label, value: s.value, share: s.share })),
      }}
    >
      {({ markRadius }) => (
        <div className={styles.donut}>
          <div className={styles.donutPlot} style={{ width: size, height: size }}>
            <PieChart width={size} height={size} margin={{ top: 0, right: 0, bottom: 0, left: 0 }} desc={base.summary} accessibilityLayer>
              <Pie
                data={slices}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={size / 2 - RING - 2}
                outerRadius={size / 2 - 2}
                startAngle={90}
                endAngle={-270}
                // The 2px surface gap between segments, not a drawn border.
                stroke="var(--chart-gap)"
                strokeWidth={2}
                cornerRadius={Math.min(markRadius, 2)}
                activeShape={(props: PieSectorDataItem) => {
                  // Recharts passes its React key inside the props; pass it
                  // directly rather than through the spread (React warns otherwise).
                  const { key, ...rest } = props as PieSectorDataItem & { key?: Key };
                  return <Sector key={key} {...rest} fillOpacity={0.82} />;
                }}
              >
                {slices.map((s) => (
                  <Cell key={s.key} fill={s.fill} />
                ))}
              </Pie>
              <Tooltip
                {...TOOLTIP_MOTION}
                content={(p) => <DonutTooltip {...p} formatValue={formatValue} />}
              />
            </PieChart>
            <div className={styles.donutCentre} aria-hidden="true">
              <span className={styles.donutTotal}>{centreValue ?? formatValue(total)}</span>
              <span className={styles.donutTotalLabel}>{centreLabel}</span>
            </div>
          </div>
          {/* Every value and share, so the ring needs no labels and the tooltip never gates. */}
          <ul className={styles.donutLegend}>
            {slices.map((s) => (
              <li key={s.key}>
                <LegendKey color={s.fill} shape="rect" />
                <span>{s.label}</span>
                <span className={styles.donutValue}>{formatValue(s.value)}</span>
                <span className={styles.donutShare}>{formatPercent(s.share)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </ChartFrame>
  );
}

function DonutTooltip({
  active,
  payload,
  formatValue,
}: Partial<TooltipContentProps> & { formatValue: (value: number) => string }) {
  const entry = payload?.[0];
  if (!active || !entry) return null;
  const slice = entry.payload as Slice;
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipHead}>
        <span>{slice.label}</span>
      </div>
      <dl className={styles.tooltipRows}>
        <div className={styles.tooltipRow}>
          <span className={styles.tooltipKey} style={{ background: slice.fill }} aria-hidden="true" />
          <dt>{formatPercent(slice.share)} of total</dt>
          <dd>{formatValue(slice.value)}</dd>
        </div>
      </dl>
    </div>
  );
}
