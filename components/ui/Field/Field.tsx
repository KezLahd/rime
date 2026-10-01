"use client";

import { createContext, useContext, useId, type ReactNode } from "react";
import { cx } from "../_internal/cx";
import { IconAlertCircle } from "../Icon/Icon";
import styles from "./Field.module.css";

type FieldContextValue = {
  id: string;
  /** id of the visible label or legend, for popups that need aria-labelledby. */
  labelId: string;
  describedBy: string | undefined;
  invalid: boolean;
  required: boolean;
};

const FieldContext = createContext<FieldContextValue | null>(null);

/** Read by every control, so a control inside a Field needs no id or aria wiring. */
export function useField(): FieldContextValue | null {
  return useContext(FieldContext);
}

/** Merges a control's own aria-describedby with the Field's hint and error ids. */
export function mergeDescribedBy(...ids: Array<string | undefined>): string | undefined {
  const joined = ids.filter(Boolean).join(" ");
  return joined || undefined;
}

export type FieldProps = {
  label: ReactNode;
  hint?: ReactNode;
  /** Presence marks the control invalid. Say what to do, not just what is wrong. */
  error?: ReactNode;
  required?: boolean;
  /** Shows "(optional)". Use on forms where most fields are required. */
  optional?: boolean;
  /** Pass to link a field to an ErrorSummary entry. Generated otherwise. */
  id?: string;
  /** fieldset + legend, for RadioGroup, a checkbox list, OtpInput, DateField. */
  group?: boolean;
  /** sentence = 13px bold (default, reads well for long labels).
      caps = the reference 11.5px uppercase micro-label, for short auth/admin forms. */
  labelStyle?: "sentence" | "caps";
  /** Something on the label's right edge, e.g. a "Forgot password?" link. */
  labelAction?: ReactNode;
  hideLabel?: boolean;
  className?: string;
  children: ReactNode;
};

export function Field({
  label,
  hint,
  error,
  required = false,
  optional,
  id: idProp,
  group,
  labelStyle = "sentence",
  labelAction,
  hideLabel,
  className,
  children,
}: FieldProps) {
  const autoId = useId();
  const id = idProp ?? `field-${autoId}`;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const invalid = Boolean(error);
  const describedBy = mergeDescribedBy(hintId, errorId);

  const labelContent = (
    <>
      {label}
      {required ? (
        <>
          <span className={styles.required} aria-hidden="true">
            *
          </span>
          {group ? <span className="sr-only"> (required)</span> : null}
        </>
      ) : null}
      {optional && !required ? <span className={styles.optional}>(optional)</span> : null}
    </>
  );

  const labelCls = cx(styles.label, styles[labelStyle], hideLabel && "sr-only");

  const meta = (
    <>
      {hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
    </>
  );

  const errorNode = error ? (
    <p id={errorId} className={styles.error}>
      <IconAlertCircle size={14} />
      <span>{error}</span>
    </p>
  ) : null;

  const labelId = `${id}-label`;
  const ctx: FieldContextValue = { id, labelId, describedBy, invalid, required };

  if (group) {
    return (
      <FieldContext.Provider value={ctx}>
        <fieldset data-slot="field"
          className={cx(styles.field, styles.fieldset, invalid && styles.invalid, className)}
          aria-describedby={describedBy}
          id={id}
        >
          <div className={styles.labelRow}>
            <legend id={labelId} className={labelCls}>{labelContent}</legend>
            {labelAction}
          </div>
          {meta}
          {children}
          {errorNode}
        </fieldset>
      </FieldContext.Provider>
    );
  }

  return (
    <FieldContext.Provider value={ctx}>
      <div data-slot="field" className={cx(styles.field, invalid && styles.invalid, className)}>
        <div className={styles.labelRow}>
          <label id={labelId} htmlFor={id} className={labelCls}>
            {labelContent}
          </label>
          {labelAction}
        </div>
        {meta}
        {children}
        {errorNode}
      </div>
    </FieldContext.Provider>
  );
}
