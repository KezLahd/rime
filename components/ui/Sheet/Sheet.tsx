"use client";

import { useId, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { cx } from "../_internal/cx";
import { Portal } from "../_internal/portal";
import { useDialogBehaviour, usePresence } from "../AlertDialog/dialog-core";
import { IconX } from "../Icon/Icon";
import { IconButton } from "../IconButton/IconButton";
import { themedScrollClass } from "../Scroll/ScrollArea";
import styles from "./Sheet.module.css";

export type SheetSide = "right" | "left" | "top" | "bottom";

export type SheetProps = {
  open: boolean;
  /** Esc, the scrim and the close button. */
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Buttons along the bottom edge, primary last. */
  footer?: ReactNode;
  /** The edge it slides in from. */
  side?: SheetSide;
  /** Width (left, right) or height (top, bottom), any CSS length. Defaults to --sheet-size, 420px. */
  size?: string;
  closeLabel?: string;
  /** Render the open panel in the page flow: no portal, scrim, focus trap or scroll lock (docs, previews). */
  inline?: boolean;
  className?: string;
};

export type DrawerProps = Omit<SheetProps, "side" | "size"> & {
  /** Let a downward drag on the handle dismiss it. On by default. */
  dragToClose?: boolean;
};

/**
 * A panel that slides in from an edge over a scrim: secondary tasks that
 * keep the page in view (filters, a record's details, settings). A dialog
 * in every other respect: focus moves in and is trapped, Esc and the scrim
 * close it, page scroll is locked and focus returns to the opener. The
 * header keeps one left edge, with the close button at its right.
 */
export function Sheet(props: SheetProps) {
  const present = usePresence(props.open, 260);
  if (props.inline) return <SheetFrame {...props} open />;
  if (!present) return null;
  return <SheetFrame {...props} />;
}

/** A bottom sheet with a grab handle, the mobile pattern. Drag the handle down to dismiss. */
export function Drawer({ dragToClose = true, ...props }: DrawerProps) {
  const present = usePresence(props.open, 260);
  if (props.inline) return <SheetFrame {...props} side="bottom" drawer dragToClose={false} open />;
  if (!present) return null;
  return <SheetFrame {...props} side="bottom" drawer dragToClose={dragToClose} />;
}

function SheetFrame({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  side = "right",
  size,
  closeLabel = "Close",
  inline,
  className,
  drawer,
  dragToClose,
}: SheetProps & { drawer?: boolean; dragToClose?: boolean }) {
  const id = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const { onKeyDown } = useDialogBehaviour({ open, panelRef, onEscape: onClose, enabled: !inline });
  const [drag, setDrag] = useState(0);
  const dragStart = useRef<number | null>(null);

  const onHandleDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragToClose) return;
    dragStart.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onHandleMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragStart.current === null) return;
    setDrag(Math.max(0, e.clientY - dragStart.current));
  };
  const onHandleUp = () => {
    if (dragStart.current === null) return;
    const h = panelRef.current?.offsetHeight ?? 1;
    dragStart.current = null;
    if (drag > Math.min(160, h * 0.3)) onClose();
    setDrag(0);
  };

  const panel = (
    <div data-slot="sheet"
      ref={panelRef}
      role="dialog"
      aria-modal={inline ? undefined : true}
      aria-labelledby={`${id}-t`}
      aria-describedby={description ? `${id}-d` : undefined}
      tabIndex={-1}
      data-side={side}
      data-state={open ? "open" : "closed"}
      data-surface="solid"
      className={cx(styles.panel, styles[side], drawer && styles.drawer, inline && styles.inline, className)}
      style={{
        ...(size ? { ["--sheet-size" as string]: size } : null),
        ...(drag ? { transform: `translateY(${drag}px)`, transition: "none" } : null),
      }}
      onKeyDown={onKeyDown}
    >
      {drawer ? (
        <div
          className={cx(styles.handleArea, dragToClose && styles.draggable)}
          onPointerDown={onHandleDown}
          onPointerMove={onHandleMove}
          onPointerUp={onHandleUp}
          onPointerCancel={onHandleUp}
          aria-hidden="true"
        >
          <span className={styles.handle} />
        </div>
      ) : null}
      <header className={styles.header}>
        <div className={styles.heading}>
          <h2 id={`${id}-t`} className={styles.title}>
            {title}
          </h2>
          {description ? (
            <p id={`${id}-d`} className={styles.description}>
              {description}
            </p>
          ) : null}
        </div>
        <IconButton icon={<IconX size={18} />} label={closeLabel} variant="ghost" onClick={onClose} className={styles.close} />
      </header>
      {children ? <div className={cx(styles.body, themedScrollClass)}>{children}</div> : null}
      {footer ? <footer className={styles.footer}>{footer}</footer> : null}
    </div>
  );

  if (inline) return panel;
  return (
    <Portal>
      <div className={styles.root} data-state={open ? "open" : "closed"}>
        <div className={styles.scrim} aria-hidden="true" onClick={onClose} />
        {panel}
      </div>
    </Portal>
  );
}
