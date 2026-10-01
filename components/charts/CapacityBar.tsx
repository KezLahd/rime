import { cx } from "@/components/ui/_internal/cx";
import { ChartLegend, type LegendItem } from "./ChartFrame";
import styles from "./Charts.module.css";
import { formatNumber, formatPercent } from "./format";

export type CapacitySegment = {
  key: string;
  label: string;
  value: number;
  /** A var() from palette.ts. The remainder always takes the track colour. */
  color: string;
};

export type CapacityBarProps = {
  /** The limit: 400 program places. */
  total: number;
  /** Filled segments, in order from the start of the track. */
  segments: ReadonlyArray<CapacitySegment>;
  /** Names what the unfilled remainder is ("Behind invited or unallocated seats"). */
  remainderLabel: string;
  /** Spoken summary; the track itself is an image. */
  label: string;
  className?: string;
};

/**
 * One limit, split into the quantities that use it. Earns its place over
 * Meter where a single fill would hide the story: 400 places are not just
 * used or free, they are used, open under an active team member, or not yet
 * usable because the seat is unallocated. Segments meet on the 2px surface
 * gap; the legend carries every number, so colour never works alone.
 */
export function CapacityBar({ total, segments, remainderLabel, label, className }: CapacityBarProps) {
  const used = segments.reduce((n, s) => n + s.value, 0);
  const remainder = Math.max(0, total - used);
  const items: LegendItem[] = [
    ...segments.map((s) => ({
      key: s.key,
      label: s.label,
      color: s.color,
      shape: "rect" as const,
      value: `${formatNumber(s.value)} · ${formatPercent(s.value / total)}`,
    })),
    {
      key: "remainder",
      label: remainderLabel,
      color: "var(--chart-track)",
      shape: "rect" as const,
      value: `${formatNumber(remainder)} · ${formatPercent(remainder / total)}`,
    },
  ];

  return (
    <div className={cx(styles.tokens, styles.capacity, className)}>
      <div className={styles.capacityTrack} role="img" aria-label={label}>
        {segments.map((s) =>
          s.value > 0 ? (
            <span key={s.key} className={styles.capacitySeg} style={{ flexGrow: s.value, flexBasis: 0, background: s.color }} />
          ) : null,
        )}
        {remainder > 0 ? (
          <span className={styles.capacitySeg} style={{ flexGrow: remainder, flexBasis: 0, background: "var(--chart-track)" }} />
        ) : null}
      </div>
      <div className={styles.capacityScale} aria-hidden="true">
        <span>0</span>
        <span>{formatNumber(total)}</span>
      </div>
      <ChartLegend items={items} />
    </div>
  );
}
