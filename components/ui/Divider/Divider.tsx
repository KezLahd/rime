import type { ReactNode } from "react";
import { cx } from "../_internal/cx";
import styles from "./Divider.module.css";

export type DividerProps = {
  orientation?: "horizontal" | "vertical";
  /** Centred text in the rule: "or", a section name. */
  label?: ReactNode;
  /** Vertical margin for horizontal dividers. */
  spacing?: "none" | "sm" | "md" | "lg";
  className?: string;
};

/** Hairline tinted toward night, never grey. */
export function Divider({ orientation = "horizontal", label, spacing = "md", className }: DividerProps) {
  if (orientation === "vertical") {
    return <span role="separator" aria-orientation="vertical" className={cx(styles.vertical, className)} />;
  }
  if (label) {
    return (
      <div role="separator" className={cx(styles.labelled, styles[spacing], className)}>
        <span className={styles.label}>{label}</span>
      </div>
    );
  }
  return <hr data-slot="divider" className={cx(styles.rule, styles[spacing], className)} />;
}
