import type { ReactNode } from "react";
import { cx } from "../_internal/cx";
import { IconCheck } from "../Icon/Icon";
import styles from "./Stepper.module.css";

export type StepState = "complete" | "current" | "upcoming" | "error";

export type StepperStep = {
  id: string;
  label: ReactNode;
  /** Short marker text; defaults to the step number. The wizard uses "A"–"F". */
  marker?: string;
  description?: ReactNode;
  state: StepState;
};

export type StepperProps = {
  steps: ReadonlyArray<StepperStep>;
  /** Makes complete, error and current steps clickable. Upcoming steps never are. */
  onStepClick?: (id: string) => void;
  "aria-label"?: string;
  className?: string;
};

const STATE_TEXT: Record<StepState, string> = {
  complete: "completed",
  current: "current step",
  upcoming: "not started",
  error: "needs attention",
};

/**
 * Horizontal progress for a multi-part form. Markers are rounded squares on
 * the radius scale, not circles, so they sit with the buttons and chips.
 */
export function Stepper({ steps, onStepClick, "aria-label": ariaLabel = "Progress", className }: StepperProps) {
  return (
    <nav data-slot="stepper" aria-label={ariaLabel} className={cx(styles.stepper, className)}>
      <ol className={styles.list}>
        {steps.map((step, i) => {
          const clickable = Boolean(onStepClick) && step.state !== "upcoming";
          const marker =
            step.state === "complete" ? <IconCheck size={14} strokeWidth={2.8} /> : step.state === "error" ? "!" : (step.marker ?? String(i + 1));
          const inner = (
            <>
              <span className={styles.marker} aria-hidden="true">
                {marker}
              </span>
              <span className={styles.text}>
                <span className={styles.label}>{step.label}</span>
                {step.description ? <span className={styles.description}>{step.description}</span> : null}
                <span className="sr-only">, {STATE_TEXT[step.state]}</span>
              </span>
            </>
          );
          return (
            <li
              key={step.id}
              className={cx(styles.step, styles[step.state], i < steps.length - 1 && styles.hasNext)}
              aria-current={step.state === "current" ? "step" : undefined}
            >
              {clickable ? (
                <button type="button" className={styles.hit} onClick={() => onStepClick?.(step.id)}>
                  {inner}
                </button>
              ) : (
                <span className={styles.hit}>{inner}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
