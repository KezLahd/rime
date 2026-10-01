"use client";

import {
  cloneElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { cx } from "../_internal/cx";
import { Portal } from "../_internal/portal";
import { focusableWithin } from "../_internal/position";
import { IconInfo } from "../Icon/Icon";
import styles from "./Tooltip.module.css";

type TriggerProps = HTMLAttributes<HTMLElement> & { title?: string };

export type TooltipSide = "top" | "right" | "bottom" | "left";

export type TooltipProps = {
  /** Supplementary text only. Never the sole label of a control, never the only place essential information lives. */
  content: ReactNode;
  /** Makes it a rich tooltip: a bold first line above the content. */
  title?: ReactNode;
  /** Rich tooltip: a quiet line under a hairline (a source, a caveat). Not interactive: use Toggletip for a link. */
  footer?: ReactNode;
  /** Keys shown as badges after the content, e.g. ["Ctrl", "K"]. Also sets aria-keyshortcuts on the trigger. */
  shortcut?: ReadonlyArray<string>;
  /**
   * One focusable element (a button, a link). Its handlers are preserved.
   * A disabled button fires no pointer or focus events: wrap it in
   * TooltipTarget.
   */
  children: ReactElement<TriggerProps>;
  /** Preferred side. Flips to the opposite side when there is no room. */
  side?: TooltipSide;
  /** Hover delay in ms. Focus shows at once; so does hover within 400 ms of another tooltip closing. */
  delay?: number;
  /** dark (default for plain) or light (default for rich). */
  tone?: "dark" | "light";
  /** Default 240 plain, 300 rich. */
  maxWidth?: number;
  /**
   * Only open when the trigger's text is clipped (an ellipsised cell). The
   * text is already in the DOM, so no aria-describedby is added.
   */
  onlyWhenTruncated?: boolean;
  /** Switch the tooltip off without unwrapping the trigger. */
  disabled?: boolean;
  /**
   * Show the bubble open, in place beside its trigger: no portal, no
   * listeners. For docs and thumbnails.
   */
  inline?: boolean;
};

const OFFSET = 8;
const EDGE = 8;
const WARM_MS = 400;

// Once one tooltip has been read, the next one opens without the hover
// delay, so running the pointer along a toolbar reads each label in turn.
const warmth = { closedAt: 0 };

const OPPOSITE: Record<TooltipSide, TooltipSide> = { top: "bottom", bottom: "top", left: "right", right: "left" };

/**
 * Places a fixed popup on a side of its anchor, flipping when that side is
 * short of room, clamped to the viewport, and points the arrow back at the
 * anchor's centre however far the clamp moved the box. Uses offsetWidth,
 * not getBoundingClientRect, so the entrance scale does not skew the maths.
 */
function placeTip(anchor: HTMLElement, tip: HTMLElement, side: TooltipSide): void {
  const a = anchor.getBoundingClientRect();
  const w = tip.offsetWidth;
  const h = tip.offsetHeight;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const room: Record<TooltipSide, number> = {
    top: a.top - OFFSET - EDGE,
    bottom: vh - a.bottom - OFFSET - EDGE,
    left: a.left - OFFSET - EDGE,
    right: vw - a.right - OFFSET - EDGE,
  };
  const need = side === "top" || side === "bottom" ? h : w;
  const placed = room[side] < need && room[OPPOSITE[side]] > room[side] ? OPPOSITE[side] : side;

  let top: number;
  let left: number;
  if (placed === "top" || placed === "bottom") {
    top = placed === "top" ? a.top - OFFSET - h : a.bottom + OFFSET;
    left = a.left + a.width / 2 - w / 2;
  } else {
    left = placed === "left" ? a.left - OFFSET - w : a.right + OFFSET;
    top = a.top + a.height / 2 - h / 2;
  }
  left = Math.max(EDGE, Math.min(left, vw - w - EDGE));
  top = Math.max(EDGE, Math.min(top, vh - h - EDGE));

  const arrow =
    placed === "top" || placed === "bottom"
      ? Math.max(12, Math.min(a.left + a.width / 2 - left, w - 12))
      : Math.max(10, Math.min(a.top + a.height / 2 - top, h - 10));

  tip.style.top = `${Math.round(top)}px`;
  tip.style.left = `${Math.round(left)}px`;
  tip.style.setProperty("--arrow", `${Math.round(arrow)}px`);
  tip.dataset.side = placed;
}

/** Keeps a popup on its anchor while the page scrolls or resizes. */
function useTrackAnchor(open: boolean, anchor: { current: HTMLElement | null }, tip: { current: HTMLElement | null }, side: TooltipSide) {
  useLayoutEffect(() => {
    if (!open || !anchor.current || !tip.current) return;
    placeTip(anchor.current, tip.current, side);
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (anchor.current && tip.current) placeTip(anchor.current, tip.current, side);
      });
    };
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open, side, anchor, tip]);
}

/** Keyboard focus only: a tap or click focuses without :focus-visible. */
function isFocusVisible(el: HTMLElement): boolean {
  try {
    return el.matches(":focus-visible");
  } catch {
    return true;
  }
}

const KEY_NAMES: Record<string, string> = { ctrl: "Control", "⌘": "Meta", cmd: "Meta", opt: "Alt", "⌥": "Alt", "⇧": "Shift" };

function TipBody({
  title,
  content,
  footer,
  shortcut,
}: Pick<TooltipProps, "title" | "content" | "footer" | "shortcut">) {
  const keys = shortcut?.length ? (
    <span className={styles.keys}>
      {shortcut.map((k, i) => (
        <kbd key={`${k}-${i}`} className={styles.kbd}>
          {k}
        </kbd>
      ))}
    </span>
  ) : null;

  if (!title && !footer) {
    return keys ? (
      <span className={styles.withKeys}>
        <span>{content}</span>
        {keys}
      </span>
    ) : (
      <>{content}</>
    );
  }
  return (
    <>
      {title ? (
        <span className={styles.title}>
          {title}
          {keys}
        </span>
      ) : null}
      <span className={styles.body}>{content}</span>
      {footer ? <span className={styles.footer}>{footer}</span> : null}
    </>
  );
}

/**
 * Shows on hover (after a delay) and on keyboard focus (at once). Esc hides
 * it (WCAG 1.4.13) and it stays hidden until the pointer or focus leaves; it
 * stays open while the pointer moves onto it. Touch gets no tooltip: a tap
 * activates the control, and anything a touch user needs belongs in the page
 * or in a Toggletip. The description is linked by aria-describedby to a
 * hidden copy that is always in the DOM, so a screen reader hears it on
 * focus even before the visual layer has rendered.
 */
export function Tooltip({
  content,
  title,
  footer,
  shortcut,
  children,
  side = "top",
  delay = 400,
  tone,
  maxWidth,
  onlyWhenTruncated = false,
  disabled = false,
  inline = false,
}: TooltipProps) {
  const descId = `tip-${useId()}`;
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLElement | null>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const timer = useRef(0);
  const openRef = useRef(false);
  // Set by Esc; cleared when the pointer leaves or focus moves on.
  const dismissed = useRef(false);
  const rich = Boolean(title || footer);
  const resolvedTone = tone ?? (rich ? "light" : "dark");

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const close = () => {
    window.clearTimeout(timer.current);
    if (openRef.current) warmth.closedAt = performance.now();
    setOpen(false);
  };

  const show = (el: HTMLElement, wait: number) => {
    anchor.current = el;
    window.clearTimeout(timer.current);
    if (disabled || inline || dismissed.current) return;
    if (onlyWhenTruncated && el.scrollWidth <= el.clientWidth && el.scrollHeight <= el.clientHeight) return;
    const warm = performance.now() - warmth.closedAt < WARM_MS;
    timer.current = window.setTimeout(() => setOpen(true), warm ? 0 : wait);
  };

  const hide = (wait = 100) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(close, wait);
  };

  useTrackAnchor(open, anchor, tipRef, side);

  useEffect(() => {
    if (!open) return;
    // Capture, and stop there, so the first Esc closes the tooltip and not
    // the modal or menu it sits in.
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      dismissed.current = true;
      window.clearTimeout(timer.current);
      warmth.closedAt = performance.now();
      setOpen(false);
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const p = children.props;
  const describe = !onlyWhenTruncated && !disabled;
  const keyshortcuts = shortcut?.length ? shortcut.map((k) => KEY_NAMES[k.toLowerCase()] ?? KEY_NAMES[k] ?? k).join("+") : undefined;

  const trigger = cloneElement(children, {
    "aria-describedby": [p["aria-describedby"], describe ? descId : undefined].filter(Boolean).join(" ") || undefined,
    ...(keyshortcuts ? { "aria-keyshortcuts": keyshortcuts } : null),
    // An empty title stops IconButton's native tooltip doubling this one.
    title: p.title ?? "",
    onPointerEnter: (e: ReactPointerEvent<HTMLElement>) => {
      p.onPointerEnter?.(e);
      if (e.pointerType === "touch") return;
      show(e.currentTarget, delay);
    },
    onPointerLeave: (e: ReactPointerEvent<HTMLElement>) => {
      p.onPointerLeave?.(e);
      dismissed.current = false;
      hide();
    },
    onPointerDown: (e: ReactPointerEvent<HTMLElement>) => {
      p.onPointerDown?.(e);
      // Pressing the control is acting on it: the hint has done its job.
      close();
    },
    onFocus: (e: FocusEvent<HTMLElement>) => {
      p.onFocus?.(e);
      if (isFocusVisible(e.currentTarget)) show(e.currentTarget, 0);
    },
    onBlur: (e: FocusEvent<HTMLElement>) => {
      p.onBlur?.(e);
      dismissed.current = false;
      close();
    },
  });

  if (inline) {
    return (
      <span className={styles.inlineWrap} data-side={side}>
        <span data-slot="tooltip-content"
          aria-hidden="true"
          data-side={side}
          className={cx(styles.tooltip, styles[resolvedTone], rich && styles.rich, styles.inlineTip)}
          style={{ maxWidth: maxWidth ?? (rich ? 300 : 240) }}
        >
          <TipBody title={title} content={content} footer={footer} shortcut={shortcut} />
          <span className={styles.arrow} />
        </span>
        {trigger}
        {describe ? (
          <span id={descId} role="tooltip" hidden>
            {title ? <>{title}. </> : null}
            {content}
            {footer ? <> {footer}</> : null}
          </span>
        ) : null}
      </span>
    );
  }

  return (
    <>
      {trigger}
      {describe ? (
        <span id={descId} role="tooltip" hidden>
          {title ? <>{title}. </> : null}
          {content}
          {footer ? <> {footer}</> : null}
        </span>
      ) : null}
      {open ? (
        <Portal>
          <div data-slot="tooltip-content"
            ref={tipRef}
            aria-hidden="true"
            className={cx(styles.tooltip, styles[resolvedTone], rich && styles.rich)}
            style={{ maxWidth: maxWidth ?? (rich ? 300 : 240) }}
            onPointerEnter={() => window.clearTimeout(timer.current)}
            onPointerLeave={() => hide()}
          >
            <TipBody title={title} content={content} footer={footer} shortcut={shortcut} />
            <span className={styles.arrow} />
          </div>
        </Portal>
      ) : null}
    </>
  );
}

/**
 * A focusable wrapper for a trigger that fires no events of its own,
 * chiefly a disabled button. Pointer events pass through the disabled
 * control to this span (CSS), and the span takes the tab stop the disabled
 * button gave up, so a keyboard user can still reach the reason.
 */
export function TooltipTarget({ children, className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span data-slot="tooltip-target" tabIndex={0} className={cx(styles.target, className)} {...rest}>
      {children}
    </span>
  );
}

export type ToggletipProps = {
  /** The (i) button's accessible name: "Why we ask for a billing address". */
  label: string;
  title?: ReactNode;
  children: ReactNode;
  /** May hold a link: a toggletip is interactive, a tooltip is not. */
  footer?: ReactNode;
  side?: TooltipSide;
  maxWidth?: number;
  icon?: ReactNode;
  className?: string;
  /** Show the panel open, in place beside the button: no portal, no listeners. For docs and thumbnails. */
  inline?: boolean;
};

/**
 * An (i) button that opens a rich explanation on click, tap, Enter or Space.
 * The touch-friendly counterpart to Tooltip, and the one to use when the
 * explanation carries a link. The text is announced through a polite live
 * region; Tab from the button moves into the panel, Tab off its last link
 * carries on through the page. Esc and an outside click close it.
 */
export function Toggletip({ label, title, children, footer, side = "top", maxWidth = 300, icon, className, inline = false }: ToggletipProps) {
  const uid = useId();
  const panelId = `toggletip-${uid}`;
  const titleId = `${panelId}-title`;
  const [openState, setOpen] = useState(false);
  const open = inline || openState;
  const button = useRef<HTMLButtonElement | null>(null);
  const panel = useRef<HTMLDivElement>(null);

  useTrackAnchor(open && !inline, button, panel, side);

  useEffect(() => {
    if (!open || inline) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      setOpen(false);
      button.current?.focus();
    };
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node;
      if (panel.current?.contains(t) || button.current?.contains(t)) return;
      setOpen(false);
    };
    window.addEventListener("keydown", onKey, true);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open, inline]);

  const onButtonKey = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (!open || e.key !== "Tab" || e.shiftKey || !panel.current) return;
    const first = focusableWithin(panel.current)[0];
    if (!first) return;
    e.preventDefault();
    first.focus();
  };

  const onPanelKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab" || !panel.current) return;
    const items = focusableWithin(panel.current);
    const active = document.activeElement;
    if (e.shiftKey && active === items[0]) {
      e.preventDefault();
      button.current?.focus();
    } else if (!e.shiftKey && active === items[items.length - 1]) {
      // The panel lives in document.body; resume the page's tab order from
      // the button rather than falling off the end of the document.
      e.preventDefault();
      const order = focusableWithin(document.body).filter((el) => !panel.current?.contains(el));
      const next = order[order.indexOf(button.current as HTMLElement) + 1];
      setOpen(false);
      (next ?? button.current)?.focus();
    }
  };

  const onPanelBlur = (e: FocusEvent<HTMLDivElement>) => {
    const to = e.relatedTarget as Node | null;
    if (to && (panel.current?.contains(to) || button.current?.contains(to))) return;
    if (to) setOpen(false);
  };

  const buttonAndStatus = (
    <>
      <button data-slot="toggletip-trigger"
        ref={button}
        type="button"
        className={cx(styles.info, className)}
        aria-label={label}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onButtonKey}
      >
        {icon ?? <IconInfo size={15} />}
      </button>
      <span className="sr-only" role="status">
        {open ? (
          <>
            {title ? <>{title}. </> : null}
            {children}
          </>
        ) : null}
      </span>
    </>
  );

  const panelEl = (
      <div data-slot="toggletip-content"
        ref={panel}
        id={panelId}
        role="group"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : label}
        data-side={inline ? side : undefined}
        className={cx(styles.tooltip, styles.light, styles.rich, styles.toggletip, inline && styles.inlineTip)}
        style={{ maxWidth }}
        onKeyDown={onPanelKey}
        onBlur={onPanelBlur}
      >
        {title ? (
          <span id={titleId} className={styles.title}>
            {title}
          </span>
        ) : null}
        <span className={styles.body}>{children}</span>
        {footer ? <span className={styles.footer}>{footer}</span> : null}
        <span className={styles.arrow} aria-hidden="true" />
      </div>
  );

  if (inline) {
    return (
      <span className={styles.inlineWrap} data-side={side}>
        {panelEl}
        {buttonAndStatus}
      </span>
    );
  }

  return (
    <>
      {buttonAndStatus}
      {open ? <Portal>{panelEl}</Portal> : null}
    </>
  );
}
