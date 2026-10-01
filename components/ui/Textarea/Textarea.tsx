"use client";

import type { ComponentPropsWithRef } from "react";
import { cx } from "../_internal/cx";
import { mergeDescribedBy, useField } from "../Field/Field";
import boxStyles from "../TextInput/TextInput.module.css";
import styles from "./Textarea.module.css";

export type TextareaProps = ComponentPropsWithRef<"textarea"> & {
  invalid?: boolean;
  /** Shows "n / max" under the box. Requires maxLength and a controlled value. */
  showCount?: boolean;
};

export function Textarea({
  invalid: invalidProp,
  showCount,
  className,
  id: idProp,
  rows = 4,
  required,
  disabled,
  readOnly,
  maxLength,
  value,
  "aria-describedby": describedByProp,
  ...rest
}: TextareaProps) {
  const field = useField();
  const invalid = invalidProp ?? field?.invalid ?? false;
  const id = idProp ?? field?.id;
  const countId = showCount && maxLength ? `${id}-count` : undefined;
  const length = typeof value === "string" ? value.length : 0;
  const nearLimit = maxLength ? length >= maxLength * 0.9 : false;

  return (
    <div data-slot="textarea" className={styles.wrap}>
      <div
        className={cx(
          boxStyles.box,
          styles.box,
          invalid && boxStyles.invalid,
          disabled && boxStyles.disabled,
          readOnly && boxStyles.readOnly,
        )}
      >
        <textarea
          id={id}
          rows={rows}
          className={cx(styles.textarea, className)}
          aria-invalid={invalid || undefined}
          aria-describedby={mergeDescribedBy(describedByProp, field?.describedBy, countId)}
          required={required ?? field?.required}
          disabled={disabled}
          readOnly={readOnly}
          maxLength={maxLength}
          value={value}
          {...rest}
        />
      </div>
      {countId ? (
        <p id={countId} className={cx(styles.count, nearLimit && styles.countNear)} aria-live="polite">
          {length} / {maxLength}
        </p>
      ) : null}
    </div>
  );
}
