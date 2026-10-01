import type { LabelHTMLAttributes, ReactNode } from "react";
import { cx } from "../_internal/cx";
import styles from "./Label.module.css";

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  children: ReactNode;
  /** Adds a red asterisk after the text. Pair it with required on the control. */
  required?: boolean;
  /** Adds a muted "(optional)" after the text. Use it when most fields are required. */
  optional?: boolean;
  /** Dims the label to match a disabled control. */
  disabled?: boolean;
  /** sentence = 13px bold (default). caps = the compact uppercase micro-label. */
  labelStyle?: "sentence" | "caps";
};

/**
 * A standalone form label, for controls that are not inside a Field (a
 * Switch row, a Slider, a custom group). Field renders its own label, so
 * reach for this only when Field does not fit.
 */
export function Label({ children, required, optional, disabled, labelStyle = "sentence", className, ...rest }: LabelProps) {
  return (
    <label data-slot="label" className={cx(styles.label, styles[labelStyle], disabled && styles.disabled, className)} {...rest}>
      {children}
      {required ? (
        <span className={styles.required} aria-hidden="true">
          *
        </span>
      ) : null}
      {optional && !required ? <span className={styles.optional}>(optional)</span> : null}
    </label>
  );
}
