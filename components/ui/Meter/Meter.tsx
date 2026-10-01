import type { ReactNode } from "react";
import { cx } from "../_internal/cx";
import styles from "./Meter.module.css";

export type MeterProps = {
  value: number;
  /** Discrete slots. The team member cap is 5. */
  max?: number;
  /** Visible caption and the basis of the accessible name, e.g. "Slots in use". */
  label: string;
  /** Spoken value; defaults to "3 of 5". */
  valueText?: string;
  /** Line under the segments, e.g. "At capacity: withdraw a customer to free a slot". */
  note?: ReactNode;
  /** md = dashboard header block. sm = inline in a table cell. */
  size?: "sm" | "md";
  className?: string;
};

/**
 * Discrete capacity: one segment per slot, not a continuous bar, because a
 * slot is a whole customer. Filled segments take the brand gradient; at the
 * cap they turn danger red (a fill, so the guide value is allowed) and the
 * note carries the words.
 */
export function Meter({ value, max = 5, label, valueText, note, size = "md", className }: MeterProps) {
  const clamped = Math.max(0, Math.min(value, max));
  const full = clamped >= max;
  return (
    <div data-slot="meter"
      role="meter"
      aria-label={label}
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuetext={valueText ?? `${clamped} of ${max}`}
      className={cx(styles.meter, styles[size], full && styles.full, className)}
    >
      {size === "md" ? (
        <div className={styles.head}>
          <span className={styles.value}>
            {clamped}
            <span className={styles.of}>/{max}</span>
          </span>
          <span className={styles.label}>{label}</span>
        </div>
      ) : null}
      <div className={styles.segments} aria-hidden="true">
        {Array.from({ length: max }, (_, i) => (
          <span key={i} className={cx(styles.segment, i < clamped && styles.filled)} />
        ))}
        {size === "sm" ? (
          <span className={styles.inlineValue}>
            {clamped}/{max}
          </span>
        ) : null}
      </div>
      {note ? <p className={styles.note}>{note}</p> : null}
    </div>
  );
}

export type ProgressBarProps = {
  value: number;
  max: number;
  label: string;
  valueText?: string;
  className?: string;
};

/** Continuous bar for program-level totals (seats allocated of 80). */
export function ProgressBar({ value, max, label, valueText, className }: ProgressBarProps) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div data-slot="progress-bar"
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuetext={valueText ?? `${value} of ${max}`}
      className={cx(styles.bar, className)}
    >
      <span className={styles.barFill} style={{ width: `${pct}%` }} />
    </div>
  );
}
