"use client";

import { useId, type ComponentPropsWithRef, type ReactNode } from "react";
import { cx } from "../_internal/cx";
import { mergeDescribedBy, useField } from "../Field/Field";
import boxStyles from "../TextInput/TextInput.module.css";
import styles from "./InputGroup.module.css";

export type InputGroupProps = Omit<ComponentPropsWithRef<"input">, "size" | "prefix"> & {
  /**
   * Before the input. A string ("https://", "$") is set off as a sunken text
   * segment with a hairline; an element (an icon, an IconButton) sits inline.
   */
  start?: ReactNode;
  /** After the input, the same way: a unit ("kg", ".com") or a button. */
  end?: ReactNode;
  size?: "sm" | "md";
  /** Overrides the Field's invalid state. */
  invalid?: boolean;
  mono?: boolean;
  /** Class for the outer box rather than the <input>. */
  boxClassName?: string;
};

const isText = (node: ReactNode) => typeof node === "string" || typeof node === "number";

/**
 * A text field with addons joined to it: a fixed text segment (a protocol, a
 * currency, a unit), an icon, or a button such as Copy or Search. It wears
 * the TextInput box and tokens, so focus, invalid and disabled draw on the
 * whole group, addons included. The <input> takes every native attribute.
 */
export function InputGroup({
  start,
  end,
  size = "md",
  invalid: invalidProp,
  mono,
  boxClassName,
  className,
  id: idProp,
  disabled,
  readOnly,
  required,
  "aria-describedby": describedBy,
  ...rest
}: InputGroupProps) {
  const field = useField();
  const autoId = useId();
  const id = idProp ?? field?.id ?? `input-group-${autoId}`;
  const invalid = invalidProp ?? Boolean(field?.invalid);

  const addon = (node: ReactNode, side: "start" | "end") =>
    node === undefined || node === null || node === false ? null : isText(node) ? (
      <span className={cx(styles.text, styles[`text_${side}`])} aria-hidden="true">
        {node}
      </span>
    ) : (
      <span className={cx(styles.slot, styles[`slot_${side}`])}>{node}</span>
    );

  return (
    <div data-slot="input-group"
      className={cx(
        boxStyles.box,
        boxStyles[size],
        styles.box,
        invalid && boxStyles.invalid,
        disabled && boxStyles.disabled,
        readOnly && boxStyles.readOnly,
        boxClassName,
      )}
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
    >
      {addon(start, "start")}
      <input
        {...rest}
        id={id}
        disabled={disabled}
        readOnly={readOnly}
        required={required ?? field?.required}
        aria-invalid={invalid || undefined}
        aria-describedby={mergeDescribedBy(describedBy, field?.describedBy)}
        className={cx(boxStyles.input, mono && boxStyles.mono, styles.input, className)}
      />
      {addon(end, "end")}
    </div>
  );
}
