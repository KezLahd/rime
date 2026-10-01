"use client";

import { useId, useState, type ReactNode } from "react";
import { cx } from "../_internal/cx";
import { IconChevronsUpDown } from "../Icon/Icon";
import styles from "./Collapsible.module.css";

export type CollapsibleProps = {
  /** The trigger's text. A chevron button sits at its right. */
  title: ReactNode;
  /** Shown whether open or closed, under the trigger row (the first item of a list, say). */
  summary?: ReactNode;
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Accessible name for the icon trigger. Defaults to "Show more" / "Show less". */
  toggleLabel?: string;
  className?: string;
};

/**
 * One disclosure: a row with a toggle button and a region that opens and
 * closes beneath it. The region animates its height (grid rows) and drops out
 * of the tab order while closed. Reduced motion makes it instant.
 */
export function Collapsible({ title, summary, children, open: openProp, defaultOpen = false, onOpenChange, toggleLabel, className }: CollapsibleProps) {
  const id = useId();
  const [inner, setInner] = useState(defaultOpen);
  const open = openProp ?? inner;
  const set = (next: boolean) => {
    if (openProp === undefined) setInner(next);
    onOpenChange?.(next);
  };
  return (
    <div data-slot="collapsible" className={cx(styles.root, className)} data-state={open ? "open" : "closed"}>
      <div className={styles.row}>
        <span className={styles.title}>{title}</span>
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls={`${id}-region`}
          aria-label={toggleLabel ?? (open ? "Show less" : "Show more")}
          onClick={() => set(!open)}
        >
          <IconChevronsUpDown size={15} aria-hidden="true" />
        </button>
      </div>
      {summary ? <div className={styles.summary}>{summary}</div> : null}
      <div id={`${id}-region`} className={styles.region} data-open={open || undefined}>
        <div className={styles.inner} inert={!open}>
          <div className={styles.content}>{children}</div>
        </div>
      </div>
    </div>
  );
}
