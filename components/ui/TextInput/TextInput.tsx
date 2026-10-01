"use client";

import { useState, type ComponentPropsWithRef, type ReactNode } from "react";
import { cx } from "../_internal/cx";
import { mergeDescribedBy, useField } from "../Field/Field";
import { IconEye, IconEyeOff } from "../Icon/Icon";
import styles from "./TextInput.module.css";

export type TextInputProps = Omit<ComponentPropsWithRef<"input">, "size"> & {
  leadingIcon?: ReactNode;
  /** Right-hand slot inside the box: a unit ("%"), a clear button. */
  trailing?: ReactNode;
  /** Monospace with slight tracking, for ID numbers, references, postcodes. */
  mono?: boolean;
  /** Overrides the Field's invalid state. */
  invalid?: boolean;
  /** Adds a show/hide toggle. Only meaningful with type="password". */
  revealable?: boolean;
  /** Starts with the password readable. For the styleguide and review screens. */
  defaultRevealed?: boolean;
  size?: "sm" | "md";
  /** Class for the outer box rather than the <input>. */
  boxClassName?: string;
};

export function TextInput({
  leadingIcon,
  trailing,
  mono,
  invalid: invalidProp,
  revealable,
  defaultRevealed = false,
  size = "md",
  className,
  boxClassName,
  id: idProp,
  type = "text",
  required: requiredProp,
  disabled,
  readOnly,
  "aria-describedby": describedByProp,
  ...rest
}: TextInputProps) {
  const field = useField();
  const [revealed, setRevealed] = useState(defaultRevealed);
  const invalid = invalidProp ?? field?.invalid ?? false;
  const inputType = revealable && type === "password" && revealed ? "text" : type;

  return (
    <div data-slot="text-input"
      className={cx(
        styles.box,
        styles[size],
        invalid && styles.invalid,
        disabled && styles.disabled,
        readOnly && styles.readOnly,
        boxClassName,
      )}
    >
      {leadingIcon ? <span className={styles.leading}>{leadingIcon}</span> : null}
      <input
        id={idProp ?? field?.id}
        type={inputType}
        className={cx(styles.input, mono && styles.mono, className)}
        aria-invalid={invalid || undefined}
        aria-describedby={mergeDescribedBy(describedByProp, field?.describedBy)}
        required={requiredProp ?? field?.required}
        disabled={disabled}
        readOnly={readOnly}
        {...rest}
      />
      {trailing ? <span className={styles.trailing}>{trailing}</span> : null}
      {revealable && type === "password" ? (
        <button
          type="button"
          className={styles.reveal}
          onClick={() => setRevealed((r) => !r)}
          // The icon shows the password's state: crossed out while it is
          // hidden, open while it is readable. The label names the action.
          // No aria-pressed: a toggle whose name changes must not also report
          // a pressed state, or it reads as "Hide password, pressed".
          aria-label={revealed ? "Hide password" : "Show password"}
          disabled={disabled}
        >
          {revealed ? <IconEye size={16} /> : <IconEyeOff size={16} />}
        </button>
      ) : null}
    </div>
  );
}
