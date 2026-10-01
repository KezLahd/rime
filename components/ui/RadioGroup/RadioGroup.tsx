"use client";

import { useId, type CSSProperties, type ReactNode } from "react";
import { cx } from "../_internal/cx";
import { mergeDescribedBy, useField } from "../Field/Field";
import styles from "./RadioGroup.module.css";

export type RadioOption<V extends string = string> = {
  value: V;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
};

export type RadioGroupProps<V extends string = string> = {
  options: ReadonlyArray<RadioOption<V>>;
  value: V | null;
  onChange: (value: V) => void;
  /** Shared native name. Generated if omitted; arrow keys work across the group natively. */
  name?: string;
  /**
   * list   = stacked radios.
   * inline = radios in a row (Yes / No).
   * cards  = choice cards: title + description tiles (withdrawal source,
   *          delivery destination).
   */
  variant?: "list" | "inline" | "cards";
  /** cards only. Collapses to one column under 640px. */
  columns?: 1 | 2 | 3;
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  className?: string;
};

/** Wrap in <Field group> for the legend, hint and error. */
export function RadioGroup<V extends string = string>({
  options,
  value,
  onChange,
  name: nameProp,
  variant = "list",
  columns = 2,
  invalid: invalidProp,
  disabled,
  required,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  className,
}: RadioGroupProps<V>) {
  const field = useField();
  const autoId = useId();
  const name = nameProp ?? `radio-${autoId}`;
  const invalid = invalidProp ?? field?.invalid ?? false;

  return (
    <div data-slot="radio-group"
      role="radiogroup"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabel ? undefined : (ariaLabelledBy ?? field?.labelId)}
      aria-describedby={mergeDescribedBy(field?.describedBy)}
      aria-required={required ?? field?.required ?? undefined}
      aria-invalid={invalid || undefined}
      className={cx(styles.group, styles[variant], className)}
      style={variant === "cards" ? ({ "--columns": columns } as CSSProperties) : undefined}
    >
      {options.map((option, i) => {
        const id = `${name}-${i}`;
        const descId = option.description ? `${id}-desc` : undefined;
        const isDisabled = disabled || option.disabled;
        return (
          <label
            key={option.value}
            htmlFor={id}
            className={cx(styles.item, invalid && styles.invalid, isDisabled && styles.disabled)}
          >
            <input
              id={id}
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              disabled={isDisabled}
              aria-describedby={descId}
              className={styles.input}
            />
            <span className={styles.dot} aria-hidden="true" />
            <span className={styles.text}>
              <span className={styles.label}>{option.label}</span>
              {option.description ? (
                <span id={descId} className={styles.description}>
                  {option.description}
                </span>
              ) : null}
            </span>
          </label>
        );
      })}
    </div>
  );
}
