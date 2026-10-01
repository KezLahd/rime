"use client";

import { useId, type ReactNode } from "react";
import { cx } from "../_internal/cx";
import { Spinner } from "../Spinner/Spinner";
import styles from "./Switch.module.css";

export type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  /** The change is saving. Blocks input and shows a spinner in the thumb. */
  loading?: boolean;
  id?: string;
  /** Label on the left, switch pushed right: for settings rows. */
  labelPosition?: "start" | "end";
  className?: string;
};

/**
 * For settings that apply immediately. A choice that is submitted with a form
 * is a Checkbox, not a Switch. Track is a rounded rectangle with a concentric
 * thumb (8px outer, 3px inset, 5px thumb): no capsules.
 */
export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
  loading,
  id: idProp,
  labelPosition = "end",
  className,
}: SwitchProps) {
  const autoId = useId();
  const id = idProp ?? `switch-${autoId}`;
  const labelId = `${id}-label`;
  const descId = description ? `${id}-desc` : undefined;

  return (
    <div data-slot="switch" className={cx(styles.root, labelPosition === "start" && styles.start, disabled && styles.disabled, className)}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        aria-describedby={descId}
        aria-busy={loading || undefined}
        disabled={disabled || loading}
        onClick={() => onChange(!checked)}
        className={cx(styles.track, checked && styles.on, loading && styles.loading)}
      >
        <span className={styles.thumb}>{loading ? <Spinner size={11} tone="brand" /> : null}</span>
      </button>
      <span className={styles.text}>
        <label id={labelId} htmlFor={id} className={styles.label}>
          {label}
        </label>
        {description ? (
          <span id={descId} className={styles.description}>
            {description}
          </span>
        ) : null}
      </span>
    </div>
  );
}
