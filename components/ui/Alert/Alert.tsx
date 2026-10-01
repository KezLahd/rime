import type { ReactNode } from "react";
import { cx } from "../_internal/cx";
import { IconAlertCircle, IconAlertTriangle, IconCheckCircle, IconInfo, IconX } from "../Icon/Icon";
import styles from "./Alert.module.css";

export type AlertTone = "info" | "success" | "warning" | "danger" | "legal";

export type AlertProps = {
  tone: AlertTone;
  title?: ReactNode;
  children?: ReactNode;
  /** A button or link on the right (desktop) or below (mobile). */
  action?: ReactNode;
  icon?: ReactNode | false;
  /** Small uppercase tag before the title: "Cold chain", "Awaiting MLR". */
  badge?: ReactNode;
  /** legal only: the approval job code, set in mono under the copy. */
  jobCode?: string;
  /**
   * Announce on appearance. Use for banners that appear in response to an
   * action (a failed save), not for ones present on page load.
   */
  live?: boolean;
  onDismiss?: () => void;
  className?: string;
};

const ICONS: Record<Exclude<AlertTone, "legal">, ReactNode> = {
  info: <IconInfo size={17} />,
  success: <IconCheckCircle size={17} />,
  warning: <IconAlertTriangle size={17} />,
  danger: <IconAlertCircle size={17} />,
};

/**
 * Banners and callouts. info is the reference tinted callout (brand wash, small
 * blur); legal is a the support neutral box for approved copy that must be shown
 * verbatim, with its job code.
 */
export function Alert({ tone, title, children, action, icon, badge, jobCode, live, onDismiss, className }: AlertProps) {
  const glyph = icon === false ? null : (icon ?? (tone === "legal" ? null : ICONS[tone]));
  const role = live ? (tone === "danger" || tone === "warning" ? "alert" : "status") : undefined;

  return (
    <div data-slot="alert" role={role} className={cx(styles.alert, styles[tone], className)}>
      {glyph ? (
        <span className={styles.icon} aria-hidden="true">
          {glyph}
        </span>
      ) : null}
      <div className={styles.content}>
        {badge || title ? (
          <p className={styles.titleRow}>
            {badge ? <span className={styles.badge}>{badge}</span> : null}
            {title ? <span className={styles.title}>{title}</span> : null}
          </p>
        ) : null}
        {children ? <div className={styles.body}>{children}</div> : null}
        {jobCode ? <p className={styles.jobCode}>{jobCode}</p> : null}
      </div>
      {action ? <div className={styles.action}>{action}</div> : null}
      {onDismiss ? (
        <button type="button" className={styles.dismiss} onClick={onDismiss} aria-label="Dismiss">
          <IconX size={14} />
        </button>
      ) : null}
    </div>
  );
}
