import type { ReactNode } from "react";
import { cx } from "../_internal/cx";
import { Button } from "../Button/Button";
import styles from "./FilterBar.module.css";

export type FilterBarProps = {
  /**
   * The filters, in order: a <FilterSearch grow /> first, then <Select
   * appearance="chip" /> dropdowns. The search fills whatever the dropdowns
   * leave, so the row always spans the table's full width.
   */
  children: ReactNode;
  /** Names the filter group for screen readers: "Filter seats". */
  "aria-label": string;
  /** Shown as a ghost "Clear filters" after the dropdowns. Pass it only while a filter is applied. */
  onClear?: () => void;
  clearLabel?: string;
  /** The list's own action, at the far end after a hairline: "Add team member". */
  actions?: ReactNode;
  className?: string;
};

/**
 * The one filter row above every table: no title or
 * "n of m shown" line above it, search stretching to fill, dropdowns at the
 * end, never a row of toggle chips. Presentational: filter state lives with
 * the screen.
 */
export function FilterBar({ children, "aria-label": ariaLabel, onClear, clearLabel = "Clear filters", actions, className }: FilterBarProps) {
  return (
    <div data-slot="filter-bar" className={cx(styles.bar, className)}>
      <div className={styles.row}>
        <div role="group" aria-label={ariaLabel} className={styles.filters}>
          {children}
          {onClear ? (
            <Button variant="ghost" size="sm" onClick={onClear} className={styles.clear}>
              {clearLabel}
            </Button>
          ) : null}
        </div>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>
    </div>
  );
}
