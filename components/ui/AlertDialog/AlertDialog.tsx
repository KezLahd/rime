"use client";

import { useId, useRef, type ReactNode } from "react";
import { cx } from "../_internal/cx";
import { Portal } from "../_internal/portal";
import { Button } from "../Button/Button";
import { IconAlertTriangle } from "../Icon/Icon";
import { useDialogBehaviour, usePresence } from "./dialog-core";
import styles from "./AlertDialog.module.css";

export type AlertDialogProps = {
  open: boolean;
  /** Cancel, Esc. There is no scrim click: the choice must be made. */
  onCancel: () => void;
  /** The action button. Close the dialog yourself once it has run. */
  onAction: () => void;
  title: ReactNode;
  description?: ReactNode;
  /** A verb plus the object: "Delete project", never "OK". */
  actionLabel: string;
  cancelLabel?: string;
  /** danger draws the action in the danger fill and a warning tile. */
  tone?: "default" | "danger";
  /** The action is in flight: both buttons lock and the action shows a spinner. */
  busy?: boolean;
  busyLabel?: string;
  /** Extra content under the description: a short list of what changes. */
  children?: ReactNode;
  /** Render the open panel in the page flow: no portal, scrim, focus trap or scroll lock (docs, previews). */
  inline?: boolean;
  className?: string;
};

/**
 * A short, interrupting question with two answers: role="alertdialog".
 * Focus starts on Cancel, so a stray Enter never confirms; Esc cancels; Tab
 * is trapped; a click on the scrim does nothing. Use it for a single
 * confirm. For forms in a dialog use Modal, and for large irreversible
 * changes TypeToConfirmModal.
 */
export function AlertDialog(props: AlertDialogProps) {
  const present = usePresence(props.open);
  if (props.inline) return <AlertPanel {...props} open />;
  if (!present) return null;
  return <AlertPanel {...props} />;
}

function AlertPanel({
  open,
  onCancel,
  onAction,
  title,
  description,
  actionLabel,
  cancelLabel = "Cancel",
  tone = "default",
  busy,
  busyLabel,
  children,
  inline,
  className,
}: AlertDialogProps) {
  const id = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const { onKeyDown } = useDialogBehaviour({
    open,
    panelRef,
    onEscape: () => {
      if (!busy) onCancel();
    },
    initialFocus: cancelRef,
    enabled: !inline,
  });

  const panel = (
    <div data-slot="alert-dialog"
      ref={panelRef}
      role="alertdialog"
      aria-modal={inline ? undefined : true}
      aria-labelledby={`${id}-t`}
      aria-describedby={description ? `${id}-d` : undefined}
      aria-busy={busy || undefined}
      tabIndex={-1}
      data-surface="solid"
      data-state={open ? "open" : "closed"}
      className={cx(styles.panel, inline && styles.inline, tone === "danger" && styles.danger, className)}
      onKeyDown={onKeyDown}
    >
      <div className={styles.header}>
        {tone === "danger" ? (
          <span className={styles.tile} aria-hidden="true">
            <IconAlertTriangle size={19} />
          </span>
        ) : null}
        <h2 id={`${id}-t`} className={styles.title}>
          {title}
        </h2>
        {description ? (
          <p id={`${id}-d`} className={styles.description}>
            {description}
          </p>
        ) : null}
      </div>
      {children ? <div className={styles.body}>{children}</div> : null}
      <div className={styles.footer}>
        <Button ref={cancelRef} variant="secondary" onClick={onCancel} disabled={busy}>
          {cancelLabel}
        </Button>
        <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onAction} loading={busy} loadingLabel={busyLabel}>
          {actionLabel}
        </Button>
      </div>
    </div>
  );

  if (inline) return panel;
  return (
    <Portal>
      <div className={styles.root} data-state={open ? "open" : "closed"}>
        <div className={styles.scrim} aria-hidden="true" />
        {panel}
      </div>
    </Portal>
  );
}
