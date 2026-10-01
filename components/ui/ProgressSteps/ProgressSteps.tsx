import type { ReactNode } from "react";
import { cx } from "../_internal/cx";
import styles from "./ProgressSteps.module.css";

export type ProgressStepState = "done" | "current" | "upcoming" | "issue";

export type ProgressStep = {
  label: ReactNode;
  /** e.g. "2 items · express". */
  detail?: ReactNode;
  /** Shown under the detail in full mode, e.g. "Delivered 12 Oct" or "Due 9 Nov". */
  meta?: ReactNode;
  state: ProgressStepState;
};

export type ProgressStepsProps = {
  steps: ReadonlyArray<ProgressStep>;
  "aria-label"?: string;
  /** compact = segments plus a one-line caption, for customer cards. */
  compact?: boolean;
  /** Compact caption, e.g. "Delivery 2 of 3 dispatched". Required in compact mode for meaning. */
  caption?: ReactNode;
  className?: string;
};

const STATE_TEXT: Record<ProgressStepState, string> = {
  done: "done",
  current: "in progress",
  upcoming: "not yet",
  issue: "needs attention",
};

/**
 * The three program deliveries (2 + 1 + 1 pens) as segments. Unlike Meter,
 * each segment has its own state, so an in-flight or failed delivery shows
 * where it sits in the sequence.
 */
export function ProgressSteps({ steps, "aria-label": ariaLabel = "Delivery progress", compact, caption, className }: ProgressStepsProps) {
  return (
    <div data-slot="progress-steps" className={cx(styles.root, compact && styles.compact, className)}>
      <ol className={styles.list} aria-label={ariaLabel}>
        {steps.map((step, i) => (
          <li key={i} className={cx(styles.step, styles[step.state])}>
            <span className={styles.segment} aria-hidden="true" />
            {compact ? (
              <span className="sr-only">
                {step.label}: {STATE_TEXT[step.state]}
              </span>
            ) : (
              <span className={styles.text}>
                <span className={styles.label}>
                  {step.label}
                  <span className="sr-only">, {STATE_TEXT[step.state]}</span>
                </span>
                {step.detail ? <span className={styles.detail}>{step.detail}</span> : null}
                {step.meta ? <span className={styles.meta}>{step.meta}</span> : null}
              </span>
            )}
          </li>
        ))}
      </ol>
      {compact && caption ? (
        <p className={styles.caption} aria-hidden="true">
          {caption}
        </p>
      ) : null}
    </div>
  );
}
