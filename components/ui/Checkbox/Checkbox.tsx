"use client";

import { useId, type ComponentPropsWithRef, type ReactNode } from "react";
import { cx } from "../_internal/cx";
import { mergeRefs } from "../_internal/merge-refs";
import { mergeDescribedBy } from "../Field/Field";
import { IconAlertCircle, IconCheck, IconMinus } from "../Icon/Icon";
import styles from "./Checkbox.module.css";

export type CheckboxProps = Omit<ComponentPropsWithRef<"input">, "type" | "size"> & {
  label: ReactNode;
  description?: ReactNode;
  indeterminate?: boolean;
  /** Error text for a standalone checkbox (a declaration, accepting the terms). */
  error?: ReactNode;
  invalid?: boolean;
  /**
   * plain = box and label.
   * card  = a bordered opt-in box that washes accent when ticked (declarations,
   *         an opt-in to email updates).
   */
  variant?: "plain" | "card";
};

/** Native checkbox, visually replaced. Keeps native keyboard, form and label behaviour. */
export function Checkbox({
  label,
  description,
  indeterminate,
  error,
  invalid: invalidProp,
  variant = "plain",
  className,
  id: idProp,
  disabled,
  ref,
  "aria-describedby": describedByProp,
  ...rest
}: CheckboxProps) {
  const autoId = useId();
  const id = idProp ?? `cb-${autoId}`;
  const descId = description ? `${id}-desc` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const invalid = invalidProp ?? Boolean(error);

  const setIndeterminate = (el: HTMLInputElement | null) => {
    if (el) el.indeterminate = Boolean(indeterminate);
  };

  return (
    <div data-slot="checkbox" className={cx(styles.root, className)}>
      <label
        htmlFor={id}
        className={cx(styles.control, styles[variant], invalid && styles.invalid, disabled && styles.disabled)}
      >
        <input
          ref={mergeRefs(ref, setIndeterminate)}
          id={id}
          type="checkbox"
          className={styles.input}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={mergeDescribedBy(describedByProp, descId, errorId)}
          {...rest}
        />
        <span className={styles.box} aria-hidden="true">
          <IconCheck size={12} strokeWidth={3.2} className={styles.tick} />
          <IconMinus size={12} strokeWidth={3.2} className={styles.dash} />
        </span>
        <span className={styles.text}>
          <span className={styles.label}>{label}</span>
          {description ? (
            <span id={descId} className={styles.description}>
              {description}
            </span>
          ) : null}
        </span>
      </label>
      {error ? (
        <p id={errorId} className={styles.error}>
          <IconAlertCircle size={14} />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}
