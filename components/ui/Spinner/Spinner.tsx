import { cx } from "../_internal/cx";
import styles from "./Spinner.module.css";

export type SpinnerProps = {
  /** Pixel size. 14 inside buttons, 16–20 inline, 24 for a panel. */
  size?: number;
  /** brand = accent on light surfaces; current = inherits text colour (buttons). */
  tone?: "brand" | "current";
  /** Announced to screen readers. Omit when the parent already says it is busy. */
  label?: string;
  className?: string;
};

export function Spinner({ size = 16, tone = "brand", label, className }: SpinnerProps) {
  const svg = (
    <svg data-slot="spinner"
      className={cx(styles.spinner, tone === "brand" && styles.brand, className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle className={styles.track} cx="12" cy="12" r="9" strokeWidth="2.5" />
      <path className={styles.arc} d="M21 12a9 9 0 0 0-9-9" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );

  if (!label) return svg;
  return (
    <span data-slot="spinner" role="status" className={styles.labelled}>
      {svg}
      <span className="sr-only">{label}</span>
    </span>
  );
}
