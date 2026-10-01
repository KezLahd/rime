"use client";

import { useEffect, useId, useRef } from "react";
import { focusableWithin } from "../_internal/position";
import { IconAlertCircle, IconArrowRight } from "../Icon/Icon";
import styles from "./ErrorSummary.module.css";

export type FormError = {
  /** The Field id (the control's id, or the fieldset id for a group). */
  id: string;
  message: string;
};

export type ErrorSummaryProps = {
  errors: ReadonlyArray<FormError>;
  title?: string;
  /**
   * Change this (e.g. a submit counter) to move focus to the summary again.
   * Focus moves on mount and whenever it changes.
   */
  focusKey?: number | string;
  className?: string;
};

/**
 * Shown at the top of a form after a failed submit. Takes focus so screen
 * reader users hear the count, and each entry jumps to its field. Render
 * nothing (not an empty box) when there are no errors. No left accent bar
 *: tone is the hairline, head band, tile and heading.
 */
export function ErrorSummary(props: ErrorSummaryProps) {
  if (props.errors.length === 0) return null;
  return <SummaryBox {...props} />;
}

// Mounted only while there are errors, so focus moves when it first appears
// and on each focusKey change, but not as errors clear one by one (which
// would pull focus out of the field being corrected).
function SummaryBox({ errors, title, focusKey, className }: ErrorSummaryProps) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = `error-summary-${useId()}`;
  const count = errors.length;

  useEffect(() => {
    ref.current?.focus();
  }, [focusKey]);

  const jump = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const target = el.matches("input, select, textarea, button") ? el : (focusableWithin(el)[0] ?? el);
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    target.focus({ preventScroll: true });
  };

  return (
    <div data-slot="error-summary" ref={ref} role="alert" tabIndex={-1} className={`${styles.summary} ${className ?? ""}`} aria-labelledby={titleId}>
      <div className={styles.head}>
        <span className={styles.tile} aria-hidden="true">
          <IconAlertCircle size={17} />
        </span>
        <div className={styles.heading}>
          <p id={titleId} className={styles.title}>
            {title ?? (count === 1 ? "Fix 1 thing to continue" : `Fix ${count} things to continue`)}
          </p>
          <p className={styles.lead}>Select a problem to go straight to its field.</p>
        </div>
      </div>
      <ol className={styles.list}>
        {errors.map((e, i) => (
          <li key={`${e.id}-${e.message}`}>
            <a
              href={`#${e.id}`}
              className={styles.item}
              onClick={(ev) => {
                ev.preventDefault();
                jump(e.id);
              }}
            >
              <span className={styles.index} aria-hidden="true">
                {i + 1}
              </span>
              <span className={styles.message}>{e.message}</span>
              <span className={styles.go} aria-hidden="true">
                Go to field <IconArrowRight size={13} />
              </span>
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}
