import type { ReactNode } from "react";
import { cx } from "../_internal/cx";
import { IconCheck, IconInbox } from "../Icon/Icon";
import styles from "./EmptyState.module.css";

export type EmptyStateProps = {
  title: ReactNode;
  /** What to do next. Required: a bare "No data" is not an empty state. */
  description: ReactNode;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  icon?: ReactNode;
  /**
   * default  = nothing here yet.
   * positive = nothing needs you ("All caught up"), a green tile.
   * filtered = the filters exclude everything; offer to clear them.
   */
  tone?: "default" | "positive" | "filtered";
  /** Tighter spacing for inside tables and dropdowns. */
  compact?: boolean;
  className?: string;
};

export function EmptyState({
  title,
  description,
  action,
  secondaryAction,
  icon,
  tone = "default",
  compact,
  className,
}: EmptyStateProps) {
  const glyph = icon ?? (tone === "positive" ? <IconCheck size={18} strokeWidth={2.4} /> : <IconInbox size={18} />);
  return (
    <div data-slot="empty-state" className={cx(styles.empty, compact && styles.compact, styles[tone], className)}>
      <span className={styles.icon} aria-hidden="true">
        {glyph}
      </span>
      <p className={styles.title}>{title}</p>
      <p className={styles.description}>{description}</p>
      {action || secondaryAction ? (
        <div className={styles.actions}>
          {action}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  );
}
