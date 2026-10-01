"use client";

import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { cx } from "../_internal/cx";
import { mergeRefs } from "../_internal/merge-refs";
import { Portal } from "../_internal/portal";
import { focusableWithin } from "../_internal/position";
import { useDismiss, useFloatingPlacement, useOpenState, type FloatAlign, type FloatSide } from "./floating";
import styles from "./Popover.module.css";

type TriggerProps = {
  ref?: Ref<HTMLElement>;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  "aria-expanded"?: boolean;
  "aria-haspopup"?: "dialog";
  "aria-controls"?: string;
};

export type PopoverProps = {
  /** The button that opens it. Gets aria-expanded, aria-controls and the click handler. */
  trigger: ReactElement<TriggerProps>;
  /** The panel's content: a short form, a set of filters, a details block. */
  children: ReactNode;
  /** The panel's accessible name ("Edit dimensions"). Use it when the content has no heading. */
  label?: string;
  /** Controlled open state. Leave unset for uncontrolled. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Preferred side; flips when there is no room. */
  side?: FloatSide;
  align?: FloatAlign;
  /** Panel width in px. Defaults to the content's width (min 220px). */
  width?: number;
  /**
   * Render the open panel in the page flow under the trigger: not portalled,
   * no outside-click or Esc handling. For docs, previews and static mock-ups.
   */
  inline?: boolean;
  className?: string;
};

/**
 * An anchored floating panel for arbitrary content. Click the trigger to
 * open; Esc or a press outside closes it and returns focus to the trigger.
 * Focus moves to the first focusable element inside (or the panel itself),
 * but is not trapped: Tab out and the panel stays until dismissed.
 */
export function Popover({
  trigger,
  children,
  label,
  open: openProp,
  defaultOpen,
  onOpenChange,
  side = "bottom",
  align = "start",
  width,
  inline,
  className,
}: PopoverProps) {
  const [open, setOpen] = useOpenState(openProp, defaultOpen, onOpenChange);
  const id = useId();
  const anchorRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useFloatingPlacement(open, anchorRef, panelRef, { side, align, enabled: !inline });

  const close = useCallback(
    (reason: "escape" | "outside") => {
      setOpen(false);
      if (reason === "escape") anchorRef.current?.focus();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [openProp, onOpenChange],
  );
  useDismiss(open, [anchorRef, panelRef], close, !inline);

  // Move focus in on open.
  useEffect(() => {
    if (!open || inline) return;
    const frame = requestAnimationFrame(() => {
      const p = panelRef.current;
      if (!p) return;
      (focusableWithin(p)[0] ?? p).focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [open, inline]);

  const triggerEl = isValidElement(trigger)
    ? cloneElement(trigger, {
        ref: mergeRefs(trigger.props.ref, anchorRef),
        "aria-expanded": inline ? true : open,
        "aria-haspopup": "dialog",
        "aria-controls": open || inline ? id : undefined,
        onClick: (e: MouseEvent<HTMLElement>) => {
          trigger.props.onClick?.(e);
          if (!e.defaultPrevented && !inline) setOpen(!open);
        },
      })
    : trigger;

  const panel = (
    <div data-slot="popover"
      ref={panelRef}
      id={id}
      role="dialog"
      aria-label={label}
      tabIndex={-1}
      className={cx(styles.panel, inline ? styles.inline : styles.floating, className)}
      style={width ? { width } : undefined}
    >
      {children}
    </div>
  );

  if (inline) {
    return (
      <div className={cx(styles.inlineWrap, align === "end" && styles.alignEnd, align === "center" && styles.alignCenter)}>
        {triggerEl}
        {panel}
      </div>
    );
  }

  return (
    <>
      {triggerEl}
      {open ? <Portal>{panel}</Portal> : null}
    </>
  );
}
