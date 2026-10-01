"use client";

import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { cx } from "../_internal/cx";
import { mergeRefs } from "../_internal/merge-refs";
import { Portal } from "../_internal/portal";
import { useDismiss, useFloatingPlacement, type FloatAlign, type FloatSide } from "../Popover/floating";
import styles from "./HoverCard.module.css";

type TriggerProps = {
  ref?: Ref<HTMLElement>;
  onPointerEnter?: (e: PointerEvent<HTMLElement>) => void;
  onPointerLeave?: (e: PointerEvent<HTMLElement>) => void;
  onFocus?: (e: FocusEvent<HTMLElement>) => void;
  onBlur?: (e: FocusEvent<HTMLElement>) => void;
  "aria-describedby"?: string;
};

export type HoverCardProps = {
  /** A link or button the card previews: a person's name, a project, a reference. */
  trigger: ReactElement<TriggerProps>;
  /** The preview: a few lines of supporting detail. Never the only route to an action. */
  children: ReactNode;
  /** ms of hover or focus before it opens. */
  openDelay?: number;
  /** ms after the pointer leaves before it closes, so it can travel onto the card. */
  closeDelay?: number;
  side?: FloatSide;
  align?: FloatAlign;
  /** Panel width in px. */
  width?: number;
  /** Render the card open in the page flow under the trigger (docs, previews). */
  inline?: boolean;
  className?: string;
};

/**
 * A rich preview that appears on hover or keyboard focus of a link, after a
 * short delay, and stays while the pointer moves onto it. It is supplementary:
 * the trigger works on its own (a link still goes somewhere), the card is
 * tied to it with aria-describedby, and Esc dismisses it.
 */
export function HoverCard({
  trigger,
  children,
  openDelay = 500,
  closeDelay = 200,
  side = "bottom",
  align = "start",
  width = 300,
  inline,
  className,
}: HoverCardProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const anchorRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const timer = useRef(0);

  useFloatingPlacement(open, anchorRef, panelRef, { side, align, enabled: !inline });
  const dismiss = useCallback(() => setOpen(false), []);
  useDismiss(open, [anchorRef, panelRef], dismiss, !inline);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const schedule = (next: boolean) => {
    if (inline) return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(next), next ? openDelay : closeDelay);
  };

  const triggerEl = isValidElement(trigger)
    ? cloneElement(trigger, {
        ref: mergeRefs(trigger.props.ref, anchorRef),
        "aria-describedby": open || inline ? id : trigger.props["aria-describedby"],
        onPointerEnter: (e: PointerEvent<HTMLElement>) => {
          trigger.props.onPointerEnter?.(e);
          if (e.pointerType !== "touch") schedule(true);
        },
        onPointerLeave: (e: PointerEvent<HTMLElement>) => {
          trigger.props.onPointerLeave?.(e);
          schedule(false);
        },
        onFocus: (e: FocusEvent<HTMLElement>) => {
          trigger.props.onFocus?.(e);
          schedule(true);
        },
        onBlur: (e: FocusEvent<HTMLElement>) => {
          trigger.props.onBlur?.(e);
          schedule(false);
        },
      })
    : trigger;

  const panel = (
    <div data-slot="hover-card"
      ref={panelRef}
      id={id}
      role="tooltip"
      className={cx(styles.card, inline ? styles.inline : styles.floating, className)}
      style={{ width }}
      onPointerEnter={() => schedule(true)}
      onPointerLeave={() => schedule(false)}
    >
      {children}
    </div>
  );

  if (inline) {
    return (
      <div className={styles.inlineWrap}>
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
