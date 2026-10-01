"use client";

import { useId, useState, type ReactNode } from "react";
import { cx } from "../_internal/cx";
import { Button } from "../Button/Button";
import { IconAlertCircle, IconAlertTriangle, IconCheck, IconCheckCircle, IconRefresh } from "../Icon/Icon";
import { Skeleton } from "../Skeleton/Skeleton";
import { Spinner } from "../Spinner/Spinner";
import styles from "./ImpactPreview.module.css";

/**
 * destructive = gone for good (access revoked, a record deleted).
 * attention = changes something someone should know about (reassigned, emailed).
 * none = checked and nothing happens here; says so, with a green check.
 */
export type ImpactSeverity = "destructive" | "attention" | "none";

export type ImpactAffected = {
  id: string;
  /** The thing affected, as the program shows it: "R.T.", "INV-0005". */
  label: ReactNode;
  /** One muted qualifier after it: "active 12 Aug", "keeps 2 other projects". */
  detail?: ReactNode;
};

export type ImpactItem = {
  id: string;
  severity: ImpactSeverity;
  /** 15 px glyph. Defaults to a triangle (destructive, attention) or a check (none). */
  icon?: ReactNode;
  /** One line, bold, stated as the outcome: "3 customers are reassigned". */
  title: ReactNode;
  /** One muted line under it: why, or what it takes to undo. */
  description?: ReactNode;
  /** Named records the row touches, listed under the explanation. */
  affected?: ImpactAffected[];
};

export type ImpactPreviewProps = {
  /** Default "Impact preview". */
  title?: ReactNode;
  /** Level of the small-caps heading. 3 inside a modal (the dialog title is the h2). */
  headingLevel?: 2 | 3 | 4;
  /**
   * A compact danger line under the heading, e.g. "This action cannot be
   * undone". TypeToConfirmModal passes its consequencesTitle here.
   */
  statement?: ReactNode;
  /**
   * One row per consequence. Omit for a panel of prose only (children); an
   * empty array renders the empty row ("Nothing else is affected").
   */
  items?: ImpactItem[];
  /** Plain text under the heading and above the rows: context the rows don't carry. */
  children?: ReactNode;
  /** The consequences are still being worked out on the server. */
  loading?: boolean;
  /** How many skeleton rows stand in while loading. Match the usual count. */
  loadingRows?: number;
  /** true for the default message, or the reason. Shown instead of the rows. */
  error?: ReactNode | boolean;
  /** Shows a Retry button in the error row. */
  onRetry?: () => void;
  /** Title of the row an empty items array renders. */
  emptyTitle?: ReactNode;
  /** Affected lists longer than this collapse behind "Show N more". Default 5. */
  affectedLimit?: number;
  className?: string;
};

const SEVERITY_LABEL: Record<ImpactSeverity, string> = {
  destructive: "Irreversible",
  attention: "Heads up",
  none: "No change",
};

function defaultIcon(severity: ImpactSeverity): ReactNode {
  return severity === "none" ? <IconCheckCircle size={15} /> : <IconAlertTriangle size={15} />;
}

/**
 * Impact preview: before an
 * irreversible action, one hairline row per consequence, so the person
 * confirming reads what will happen to whom, not a paragraph about it.
 * The tile's tone is the severity; a row with nothing to worry about says
 * so and carries a small green check, so "checked, nothing happens" never
 * reads the same as "not checked".
 */
export function ImpactPreview({
  title = "Impact preview",
  headingLevel = 3,
  statement,
  items,
  children,
  loading = false,
  loadingRows = 3,
  error,
  onRetry,
  emptyTitle = "Nothing else is affected",
  affectedLimit = 5,
  className,
}: ImpactPreviewProps) {
  const headingId = useId();
  const Heading = `h${headingLevel}` as const;
  const failed = Boolean(error) && !loading;

  return (
    <>
      <section data-slot="impact-preview"
        className={cx(styles.panel, className)}
        aria-labelledby={headingId}
        aria-busy={loading || undefined}
        data-surface="solid"
      >
        <header className={cx(styles.header, statement ? styles.headerDanger : null)}>
          <div className={styles.headerLine}>
            <Heading id={headingId} className={styles.title}>
              {title}
            </Heading>
            {loading ? (
              <span className={styles.loadingNote}>
                <Spinner size={13} />
                <span>Loading impact preview&hellip;</span>
              </span>
            ) : null}
          </div>
          {statement ? (
            <p className={styles.statement}>
              <IconAlertTriangle size={14} />
              <span>{statement}</span>
            </p>
          ) : null}
        </header>

        {children ? <div className={styles.lead}>{children}</div> : null}

        {loading ? (
          <ul className={styles.rows} aria-hidden="true">
            {Array.from({ length: Math.max(1, loadingRows) }, (_, i) => (
              <li key={i} className={styles.row}>
                <Skeleton width={32} height={32} radius="var(--r-sm)" />
                <span className={styles.skeletonText}>
                  <Skeleton variant="text" height={10} width={i % 2 ? "54%" : "68%"} />
                  <Skeleton variant="text" height={8} width={i % 2 ? "72%" : "46%"} />
                </span>
              </li>
            ))}
          </ul>
        ) : failed ? (
          <div className={styles.errorRow} role="alert">
            <span className={cx(styles.tile, styles.destructive)} aria-hidden="true">
              <IconAlertCircle size={15} />
            </span>
            <div className={styles.text}>
              <p className={styles.rowTitle}>Couldn&rsquo;t load the impact preview</p>
              <p className={styles.rowDescription}>
                {error === true ? "We couldn't work out what this changes. Try again before you confirm." : error}
              </p>
              {onRetry ? (
                <Button
                  variant="secondary"
                  size="sm"
                  className={styles.retry}
                  iconStart={<IconRefresh size={14} />}
                  onClick={onRetry}
                >
                  Try again
                </Button>
              ) : null}
            </div>
          </div>
        ) : items ? (
          <ul className={styles.rows}>
            {items.length === 0 ? (
              <ImpactRow item={{ id: "empty", severity: "none", title: emptyTitle }} limit={affectedLimit} />
            ) : (
              items.map((item) => <ImpactRow key={item.id} item={item} limit={affectedLimit} />)
            )}
          </ul>
        ) : null}
      </section>
      {/* The header note is visual; this is what a screen reader hears. Outside
        the section, because a live region inside aria-busy can be held back. */}
      <span className="sr-only" role="status" aria-live="polite">
        {loading ? "Loading impact preview." : ""}
      </span>
    </>
  );
}

function ImpactRow({ item, limit }: { item: ImpactItem; limit: number }) {
  const [expanded, setExpanded] = useState(false);
  const listId = useId();
  const { severity, icon, title, description, affected } = item;
  const list = affected ?? [];
  const hasAffected = list.length > 0;
  // "Show 1 more" costs a line to save a line: only collapse past limit + 1.
  const overflow = list.length > limit + 1;
  const shown = overflow && !expanded ? list.slice(0, limit) : list;
  const hidden = list.length - shown.length;

  return (
    <li className={cx(styles.row, styles[severity])}>
      <span className={cx(styles.tile, styles[severity])} aria-hidden="true">
        {icon ?? defaultIcon(severity)}
      </span>
      <div className={styles.text}>
        <p className={styles.rowTitle}>
          <span className="sr-only">{SEVERITY_LABEL[severity]}: </span>
          {title}
        </p>
        {description ? <p className={styles.rowDescription}>{description}</p> : null}
        {hasAffected ? (
          <>
            <ul id={listId} className={styles.affected}>
              {shown.map((a) => (
                <li key={a.id} className={styles.affectedItem}>
                  <span className={styles.dot} aria-hidden="true" />
                  <span className={styles.affectedLabel}>{a.label}</span>
                  {a.detail ? <span className={styles.affectedDetail}>{a.detail}</span> : null}
                </li>
              ))}
            </ul>
            {overflow ? (
              <button
                type="button"
                className={styles.more}
                aria-expanded={expanded}
                aria-controls={listId}
                onClick={() => setExpanded((v) => !v)}
              >
                {expanded ? "Show fewer" : `Show ${hidden} more`}
              </button>
            ) : null}
          </>
        ) : null}
      </div>
      {severity === "none" ? (
        <span className={styles.okBadge} aria-hidden="true">
          <IconCheck size={11} strokeWidth={3} />
        </span>
      ) : null}
    </li>
  );
}
