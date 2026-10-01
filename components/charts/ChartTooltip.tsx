"use client";

import type { CSSProperties } from "react";
import type { TooltipContentProps } from "recharts";
import styles from "./Charts.module.css";
import { formatNumber } from "./format";
import { colorOf, type ChartSeries } from "./scale";

export type ChartTooltipOptions = {
  series: ReadonlyArray<ChartSeries>;
  /** Header: the x value, formatted in full ("Week of 23 Nov 2026"). */
  formatLabel?: (label: string) => string;
  formatValue?: (value: number) => string;
  /** Small uppercase tag in the header ("Cumulative"). */
  tag?: string;
  /** Adds a total row: stacked charts, where the sum is the question. */
  total?: boolean | string;
  /** Key beside each row, as shadcn: "dot" (bars, areas, the default), "line" (lines) or "dashed" (a forecast or reference series). */
  indicator?: "dot" | "line" | "dashed";
  /** Hide the label line (the x value). */
  hideLabel?: boolean;
};

/**
 * The one tooltip every Cartesian chart uses, in shadcn's compact layout:
 * the x value as a label line, then one row per series at that x (the
 * pointer never has to land on a line) as [indicator] name ... value, on the
 * popover glass. Recharts glides it between points (TOOLTIP_MOTION).
 * Enhances only: every value is also in the table view.
 */
export function ChartTooltip({
  active,
  payload,
  label,
  series,
  formatLabel,
  formatValue = formatNumber,
  tag,
  total,
  indicator = "dot",
  hideLabel,
}: Partial<TooltipContentProps> & ChartTooltipOptions) {
  if (!active || !payload?.length) return null;
  const header = label === undefined || label === null ? "" : String(label);

  // Keep the series' own order (the legend's), not the payload's.
  const rows = series
    .map((s, i) => {
      const entry = payload.find((p) => p.dataKey === s.key);
      return entry ? { key: s.key, label: s.label, color: colorOf(s, i), value: Number(entry.value ?? 0) } : null;
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  const sum = rows.reduce((n, r) => n + r.value, 0);

  return (
    <div className={styles.tooltip}>
      {hideLabel ? null : (
        <div className={styles.tooltipHead}>
          <span>{formatLabel ? formatLabel(header) : header}</span>
          {tag ? <span className={styles.tooltipTag}>{tag}</span> : null}
        </div>
      )}
      <dl className={styles.tooltipRows}>
        {rows.map((r) => (
          <div key={r.key} className={styles.tooltipRow}>
            <span
              className={styles.tooltipKey}
              data-shape={indicator}
              style={{ "--indicator": r.color } as CSSProperties}
              aria-hidden="true"
            />
            <dt>{r.label}</dt>
            <dd>{formatValue(r.value)}</dd>
          </div>
        ))}
      </dl>
      {total && rows.length > 1 ? (
        <p className={styles.tooltipFoot}>
          <span>{typeof total === "string" ? total : "Total"}</span>
          <strong>{formatValue(sum)}</strong>
        </p>
      ) : null}
    </div>
  );
}
