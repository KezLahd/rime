"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { cx } from "../_internal/cx";
import { Portal, useIsClient } from "../_internal/portal";
import { focusableWithin } from "../_internal/position";
import { useScrollLock } from "../Scroll/scroll-lock";
import { themedScrollClass } from "../Scroll/ScrollArea";
import { useScrollEdges } from "../Scroll/useScrollEdges";
import { Button } from "../Button/Button";
import { IconAlertTriangle, IconArrowLeft, IconCheckCircle, IconInfo, IconX } from "../Icon/Icon";
import { IconButton } from "../IconButton/IconButton";
import styles from "./Modal.module.css";

export type ModalTone = "default" | "danger" | "success" | "info";

export type ModalProps = {
  open: boolean;
  /** Called on Esc, scrim click and the close button, unless dismissible is false. */
  onClose: () => void;
  title: ReactNode;
  /** A quiet line under the title: a reference, "Step 1 of 2". Never stacked over the title. */
  meta?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /**
   * Render the open panel in place, in normal flow: no portal, no scrim, no
   * inert page, no scroll lock, no focus trap and no exit animation. For
   * docs, thumbnails and design reviews, where many can render at once.
   */
  inline?: boolean;
  /** Buttons, right-aligned. Primary last, and one gradient primary at most. */
  footer?: ReactNode;
  /** Left side of the footer: a line of secondary text, a link, a Back button. */
  footerStart?: ReactNode;
  /** sm 480, md 640, lg 880 (--modal-width-*). Under 640px every size becomes a bottom sheet. */
  size?: "sm" | "md" | "lg";
  /** Under 640px: a bottom sheet (default) or the full screen, for long forms. */
  mobile?: "sheet" | "fullscreen";
  /** Tints the header wash and the icon tile. danger, success and info bring
      their own icon; pass icon={false} to drop it. */
  tone?: ModalTone;
  icon?: ReactNode;
  /** A multi-step flow: draws the segmented step rule under the heading. */
  progress?: { step: number; of: number };
  /**
   * Called when the body has been scrolled to its end (and at once if it
   * does not overflow). Gate a terms "Accept" on it: see the scroll-gated
   * accept example.
   */
  onScrollEnd?: () => void;
  /** false while a request is in flight: Esc, scrim and close are ignored. */
  dismissible?: boolean;
  /** A request is in flight: sets aria-busy and locks dismissal. */
  busy?: boolean;
  /** Focused on open. Defaults to the first field or button in the body. */
  initialFocus?: RefObject<HTMLElement | null>;
  closeLabel?: string;
  className?: string;
};

// Long enough for the exit animation (180ms panel, 200ms scrim) to finish.
const EXIT_MS = 210;

const TONE_ICON: Record<ModalTone, ReactNode> = {
  default: null,
  danger: <IconAlertTriangle size={19} />,
  success: <IconCheckCircle size={19} />,
  info: <IconInfo size={19} />,
};

// ── Inert background ─────────────────────────────────────────────────────
// Everything beside the dialog in <body> goes inert, so neither a screen
// reader's virtual cursor nor a stray click reaches the page. The toast
// region stays live: a modal that stays open after a failed request says so
// with a toast (WithdrawModal), and an inert live region is never announced.
// Popups opened from inside the modal (Select, DateField) portal in after
// this runs and are untouched.
const KEEP_LIVE = 'section[aria-label="Notifications"], [aria-live], [role="alert"], [role="status"], next-route-announcer';

function inertSiblings(root: HTMLElement): HTMLElement[] {
  const changed: HTMLElement[] = [];
  for (const el of Array.from(document.body.children)) {
    if (!(el instanceof HTMLElement) || el === root || el.contains(root)) continue;
    if (el.hasAttribute("inert") || el.matches(KEEP_LIVE)) continue;
    el.setAttribute("inert", "");
    changed.push(el);
  }
  return changed;
}

// Open modals, newest last. Only the top one answers Esc and traps Tab when
// focus has fallen out to <body> (a click on the scrim does that).
const stack: HTMLElement[] = [];

/**
 * Portalled dialog on frosted glass: focus trap, Esc, scrim click, scroll
 * lock, an inert background, and focus returned to whatever opened it.
 * Stays mounted for its exit animation after open turns false.
 */
export function Modal(props: ModalProps) {
  const { open } = props;
  const [present, setPresent] = useState(open);
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setPresent(true);
  }

  useEffect(() => {
    if (open || !present) return;
    const t = window.setTimeout(() => setPresent(false), EXIT_MS);
    return () => window.clearTimeout(t);
  }, [open, present]);

  if (props.inline) return open ? <ModalFrame {...props} /> : null;
  if (!present) return null;
  return <ModalFrame {...props} />;
}

function ModalFrame({
  open,
  onClose,
  title,
  meta,
  description,
  children,
  footer,
  footerStart,
  inline = false,
  size = "md",
  mobile = "sheet",
  tone = "default",
  icon,
  progress,
  onScrollEnd,
  dismissible = true,
  busy = false,
  initialFocus,
  closeLabel = "Close",
  className,
}: ModalProps) {
  const titleId = useId();
  const descId = useId();
  // Portal renders nothing until hydration; effects wait for the real nodes.
  const isClient = useIsClient();
  const hasBody = Boolean(children);
  const rootRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  // A press that starts inside the panel and ends on the scrim (selecting
  // text, dragging a slider) must not close the dialog.
  const pressOnScrim = useRef(false);

  const canDismiss = dismissible && !busy && open;
  // The document listener below is bound once per opening; it reads these.
  const dismissRef = useRef({ canDismiss, onClose });
  useEffect(() => {
    dismissRef.current = { canDismiss, onClose };
  });

  // Scroll lock spans the whole mount, exit animation included, so the
  // scrollbar does not come back under a panel that is still fading. The
  // counter is shared (components/ui/Scroll), so nested overlays nest.
  useScrollLock(!inline);

  // Per opening: inert the page, move focus in, trap it; on close (or an
  // abrupt unmount) release the page first, then hand focus back.
  useEffect(() => {
    if (!open || !isClient || inline) return;
    const root = rootRef.current;
    const dialog = dialogRef.current;
    if (!root || !dialog) return;

    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const released = inertSiblings(root);
    stack.push(dialog);

    const target =
      initialFocus?.current ??
      (bodyRef.current ? focusableWithin(bodyRef.current)[0] : undefined) ??
      focusableWithin(dialog).find((el) => !el.dataset.modalClose) ??
      dialog;
    target.focus({ preventScroll: true });

    const onDocKeyDown = (e: globalThis.KeyboardEvent) => {
      if (stack[stack.length - 1] !== dialog) return;
      // Only when focus has fallen out to <body>. Keys from the dialog are
      // handled on it, and a portalled popup inside it (a calendar) stops
      // its own Esc in React, which does not stop a native document listener.
      if (e.target !== document.body && e.target !== document.documentElement) return;
      if (e.key === "Escape") {
        if (dismissRef.current.canDismiss) dismissRef.current.onClose();
      } else if (e.key === "Tab") {
        e.preventDefault();
        const items = focusableWithin(dialog);
        (e.shiftKey ? items[items.length - 1] : items[0])?.focus();
      }
    };
    document.addEventListener("keydown", onDocKeyDown);

    return () => {
      document.removeEventListener("keydown", onDocKeyDown);
      const i = stack.lastIndexOf(dialog);
      if (i >= 0) stack.splice(i, 1);
      for (const el of released) el.removeAttribute("inert");
      const opener = openerRef.current;
      if (opener && opener.isConnected) opener.focus({ preventScroll: true });
    };
    // initialFocus is read once, on open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isClient]);

  // Scroll-aware dividers: a hairline under the header once the body has
  // scrolled, and one over the footer while there is more below. Written
  // straight to the panel's dataset so scrolling never re-renders.
  useScrollEdges(bodyRef, { target: dialogRef, enabled: hasBody && isClient, onEnd: onScrollEnd });

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!open || inline) return;
    if (e.key === "Escape") {
      e.stopPropagation();
      if (canDismiss) onClose();
      return;
    }
    if (e.key !== "Tab" || !dialogRef.current) return;
    const items = focusableWithin(dialogRef.current);
    if (items.length === 0) {
      e.preventDefault();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const onScrimDown = (e: MouseEvent<HTMLDivElement>) => {
    pressOnScrim.current = e.target === e.currentTarget;
  };
  const onScrimClick = (e: MouseEvent<HTMLDivElement>) => {
    const fromScrim = pressOnScrim.current && e.target === e.currentTarget;
    pressOnScrim.current = false;
    if (fromScrim && canDismiss) onClose();
  };

  const tile = icon ?? TONE_ICON[tone];
  const toneClass = tone === "default" ? undefined : styles[`tone-${tone}`];

  const panel = (
    <div data-slot="modal"
      ref={dialogRef}
      role={tone === "danger" ? "alertdialog" : "dialog"}
      aria-modal={inline ? undefined : "true"}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      aria-busy={busy || undefined}
      tabIndex={inline ? undefined : -1}
      data-surface="solid"
      className={cx(
        styles.panel,
        styles[size],
        mobile === "fullscreen" && styles.fullscreen,
        inline && styles.inline,
        toneClass,
        className,
      )}
      onKeyDown={onKeyDown}
    >
      <span className={styles.wash} aria-hidden="true" />
      <header className={styles.header}>
        <div className={styles.headerRow}>
          {tile ? (
            <span className={styles.tile} aria-hidden="true">
              {tile}
            </span>
          ) : null}
          {/* Re-keyed per step so a two-step flow cross-fades its heading. */}
          <div key={progress?.step ?? 0} className={styles.heading}>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            {meta ? <p className={styles.meta}>{meta}</p> : null}
            {description ? (
              <p id={descId} className={styles.description}>
                {description}
              </p>
            ) : null}
          </div>
          <IconButton
            icon={<IconX size={18} />}
            label={closeLabel}
            variant="ghost"
            className={styles.close}
            onClick={onClose}
            disabled={!canDismiss}
            data-modal-close="true"
          />
        </div>
        {progress && progress.of > 1 ? (
          <div className={styles.progress} aria-hidden="true">
            {Array.from({ length: progress.of }, (_, i) => (
              <span key={i} className={styles.segment} data-done={i < progress.step || undefined} />
            ))}
          </div>
        ) : null}
      </header>
      {hasBody ? (
        <div ref={bodyRef} className={cx(styles.body, themedScrollClass)}>
          {/* The observed box: it grows with the content (an error
              appearing, a step changing) while the body stays clamped. */}
          <div className={styles.content}>{children}</div>
        </div>
      ) : null}
      {footer || footerStart ? (
        <footer className={styles.footer}>
          {footerStart ? <div className={styles.footerStart}>{footerStart}</div> : null}
          {footer ? <div className={styles.actions}>{footer}</div> : null}
        </footer>
      ) : null}
    </div>
  );

  if (inline) return panel;

  return (
    <Portal>
      <div ref={rootRef} className={styles.root} data-state={open ? "open" : "closed"}>
        <div className={styles.scrim} aria-hidden="true" onMouseDown={onScrimDown} onClick={onScrimClick} />
        {panel}
      </div>
    </Portal>
  );
}

export type ConfirmModalProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  /** A quiet line under the title; two-step flows prefix it with "Step 1 of 2". */
  meta?: string;
  description?: ReactNode;
  /** Render the open dialog in place (see Modal's inline). */
  inline?: boolean;
  /** Step one: the details or form (e.g. withdrawal reason). */
  children?: ReactNode;
  /**
   * Step two: what will happen, stated plainly. When given, the first button
   * reads proceedLabel and leads here; the destructive button is only on
   * this step. Omit for a single-step confirm.
   */
  review?: ReactNode;
  reviewTitle?: ReactNode;
  /** Replaces description on step two. Omitted: step two has none. */
  reviewDescription?: ReactNode;
  proceedLabel?: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: ModalTone;
  /** Overrides the tone's icon tile; false drops it. */
  icon?: ReactNode;
  /** Return false to stay on step one (failed validation). */
  onProceed?: () => boolean;
  onConfirm: () => void;
  /** The confirm request is in flight. Locks the dialog. */
  busy?: boolean;
  busyLabel?: string;
  size?: ModalProps["size"];
  mobile?: ModalProps["mobile"];
};

/**
 * The two-step confirm: fill in, then review and confirm. The
 * irreversible button never appears on the same screen as the inputs that
 * feed it, so a stray Enter cannot confirm a destructive action.
 *
 * One dialog throughout: the step rule fills, the heading and body
 * cross-fade in the direction of travel, and a danger flow keeps its tile
 * on both steps so nothing jumps. Only step two carries the danger button.
 */
export function ConfirmModal({
  open,
  onClose,
  title,
  meta,
  description,
  inline,
  children,
  review,
  reviewTitle,
  reviewDescription,
  proceedLabel = "Continue",
  confirmLabel,
  cancelLabel = "Cancel",
  tone = "default",
  icon,
  onProceed,
  onConfirm,
  busy,
  busyLabel,
  size = "md",
  mobile,
}: ConfirmModalProps) {
  const twoStep = review !== undefined;
  const [step, setStep] = useState<1 | 2>(1);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  // Each opening starts on step one. Reset while rendering, not in an
  // effect, so the first frame of a reopened dialog is already step one.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setStep(1);
      setDirection("forward");
    }
  }

  const onReview = twoStep && step === 2;
  const stepRef = useRef<HTMLDivElement>(null);
  // Set only by Back and Continue, so the reset on reopening never pulls
  // focus away from the field the dialog focused on open.
  const focusStep = useRef(false);

  // The button that changed the step has unmounted; put focus on the new content.
  useEffect(() => {
    if (!focusStep.current) return;
    focusStep.current = false;
    stepRef.current?.focus({ preventScroll: true });
  }, [step]);

  const go = (to: 1 | 2) => {
    focusStep.current = true;
    setDirection(to > step ? "forward" : "back");
    setStep(to);
  };

  const footerStart = onReview ? (
    <Button variant="ghost" iconStart={<IconArrowLeft size={15} />} onClick={() => go(1)} disabled={busy}>
      Back
    </Button>
  ) : null;

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={busy}>
        {cancelLabel}
      </Button>
      {twoStep && step === 1 ? (
        <Button
          variant={tone === "danger" ? "dangerSecondary" : "primary"}
          onClick={() => {
            if (!onProceed || onProceed()) go(2);
          }}
        >
          {proceedLabel}
        </Button>
      ) : (
        <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm} loading={busy} loadingLabel={busyLabel}>
          {confirmLabel}
        </Button>
      )}
    </>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={onReview ? (reviewTitle ?? title) : title}
      meta={twoStep ? `Step ${step} of 2${meta ? ` · ${meta}` : ""}` : meta}
      inline={inline}
      description={onReview ? reviewDescription : description}
      tone={tone}
      icon={icon}
      progress={twoStep ? { step, of: 2 } : undefined}
      busy={busy}
      size={size}
      mobile={mobile}
      footer={footer}
      footerStart={footerStart}
    >
      <div key={step} ref={stepRef} tabIndex={-1} className={styles.step} data-direction={direction}>
        {onReview ? review : children}
      </div>
    </Modal>
  );
}
