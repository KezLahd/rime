"use client";

import { Children, useId, useState, type ReactNode } from "react";
import { cx } from "../_internal/cx";
import { Button } from "../Button/Button";
import { TypeToConfirmModal, type TypeToConfirmModalProps } from "../TypeToConfirm/TypeToConfirmModal";
import styles from "./DangerZone.module.css";

export type DangerZoneProps = {
  /** Default "Danger zone". */
  title?: ReactNode;
  /** One line under the title: whose data this is, who can see it. */
  description?: ReactNode;
  /** 2 on a settings page, 3 inside a titled section. */
  headingLevel?: 2 | 3 | 4;
  /** DangerZoneRow elements. The zone renders nothing without any. */
  children?: ReactNode;
  className?: string;
};

/**
 * Vercel's danger zone: the irreversible actions for a record or a
 * program, collected at the foot of its settings or admin page. One panel,
 * a softly tinted header, hairline rows; never a card per action. Each
 * row's button is dangerSecondary, because it only opens the confirm: the
 * solid danger button lives in the dialog, behind the typed phrase.
 */
export function DangerZone({
  title = "Danger zone",
  description,
  headingLevel = 2,
  children,
  className,
}: DangerZoneProps) {
  const headingId = useId();
  const Heading = `h${headingLevel}` as const;
  const rows = Children.toArray(children);
  if (rows.length === 0) return null;

  return (
    <section data-slot="danger-zone" className={cx(styles.zone, className)} aria-labelledby={headingId} data-surface="solid">
      <header className={styles.header}>
        {/* No icon ahead of the title: the heading, the row titles and the
            row descriptions all share one left edge. */}
        <Heading id={headingId} className={styles.title}>
          {title}
        </Heading>
        {description ? <p className={styles.description}>{description}</p> : null}
      </header>
      <ul className={styles.rows}>{rows}</ul>
    </section>
  );
}

export type DangerZoneRowProps = {
  title: ReactNode;
  /** What it does and what it takes with it. The button names the action; this explains it. */
  description?: ReactNode;
  /** A full verb phrase: "Deactivate team member", not "Deactivate". */
  actionLabel: string;
  /**
   * The row owns a TypeToConfirmModal with these props and opens it from the
   * button. It closes when onConfirm resolves. For a confirm whose extra
   * fields the page holds in state, use onAction and render the modal there.
   */
  confirm?: Omit<TypeToConfirmModalProps, "open" | "onClose">;
  /** Called instead of opening the built-in confirm. */
  onAction?: () => void;
  disabled?: boolean;
  /** Shown in the row while disabled: why, and what would enable it. */
  disabledReason?: ReactNode;
};

export function DangerZoneRow({
  title,
  description,
  actionLabel,
  confirm,
  onAction,
  disabled,
  disabledReason,
}: DangerZoneRowProps) {
  const titleId = useId();
  const descId = useId();
  const reasonId = useId();
  const [open, setOpen] = useState(false);
  const showReason = disabled && disabledReason;

  return (
    <li data-slot="danger-zone-row" className={cx(styles.row, disabled && styles.rowDisabled)}>
      <div className={styles.rowText}>
        <p id={titleId} className={styles.rowTitle}>
          {title}
        </p>
        {description ? (
          <p id={descId} className={styles.rowDescription}>
            {description}
          </p>
        ) : null}
        {showReason ? (
          <p id={reasonId} className={styles.reason}>
            {disabledReason}
          </p>
        ) : null}
      </div>
      <div className={styles.rowAction}>
        <Button
          variant="dangerSecondary"
          size="sm"
          disabled={disabled}
          aria-haspopup={confirm && !onAction ? "dialog" : undefined}
          aria-describedby={[description ? descId : null, showReason ? reasonId : null].filter(Boolean).join(" ") || undefined}
          onClick={() => {
            if (onAction) onAction();
            else if (confirm) setOpen(true);
          }}
        >
          {actionLabel}
        </Button>
      </div>
      {confirm && !onAction ? (
        <TypeToConfirmModal {...confirm} open={open} onClose={() => setOpen(false)} />
      ) : null}
    </li>
  );
}
