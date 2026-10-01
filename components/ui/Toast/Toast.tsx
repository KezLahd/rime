"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type ReactNode,
} from "react";
import { cx } from "../_internal/cx";
import { Portal } from "../_internal/portal";
import { IconAlertCircle, IconCheckCircle, IconInfo, IconX } from "../Icon/Icon";
import { Spinner } from "../Spinner/Spinner";
import styles from "./Toast.module.css";

export type ToastTone = "success" | "error" | "info" | "loading";

export type ToastOptions = {
  description?: ReactNode;
  action?: { label: string; onClick: () => void };
  /** ms before auto-dismiss. Errors and loading toasts never auto-dismiss. */
  duration?: number;
};

type ToastItem = ToastOptions & { id: number; tone: ToastTone; title: ReactNode };

/** A toast in the stack. leaving = playing its exit before removal. */
type Entry = ToastItem & { leaving?: boolean };

export type ToastApi = {
  success: (title: ReactNode, options?: ToastOptions) => number;
  /** Stays until dismissed: the user must get to read what failed. */
  error: (title: ReactNode, options?: ToastOptions) => number;
  info: (title: ReactNode, options?: ToastOptions) => number;
  /** In flight. Returns an id to settle with update() or dismiss(). */
  loading: (title: ReactNode, options?: ToastOptions) => number;
  update: (id: number, patch: Partial<Omit<ToastItem, "id">>) => void;
  dismiss: (id: number) => void;
  /** Shows loading, then success or error when the promise settles. */
  promise: <T>(
    promise: Promise<T>,
    messages: { loading: ReactNode; success: ReactNode | ((value: T) => ReactNode); error: ReactNode | ((err: unknown) => ReactNode) },
  ) => Promise<T>;
};

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error("useToast must be used inside <ToastProvider>.");
  return api;
}

const DEFAULT_DURATION = 5000;
/** Live toasts kept. The oldest leaves when a fifth arrives. */
const MAX_VISIBLE = 4;
/** Matches the exit animation in Toast.module.css. */
const EXIT_MS = 220;
/** Space between toasts when the stack is fanned out. */
const GAP = 10;
/** How far each toast behind the front one peeks out above it, collapsed. */
const PEEK = 9;
/** Toasts drawn behind the front one while collapsed; the rest wait hidden. */
const STACK_DEPTH = 2;

const isTimed = (t: ToastItem) => t.tone !== "error" && t.tone !== "loading";

/** Mount once, in the root layout. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Entry[]>([]);
  const nextId = useRef(1);
  const exitTimers = useRef(new Map<number, number>());

  // Dismissal plays the exit first; the effect below removes it afterwards.
  const dismiss = useCallback(
    (id: number) => setToasts((list) => list.map((t) => (t.id === id && !t.leaving ? { ...t, leaving: true } : t))),
    [],
  );

  const push = useCallback((tone: ToastTone, title: ReactNode, options?: ToastOptions) => {
    const id = nextId.current++;
    setToasts((list) => {
      const next: Entry[] = [...list, { id, tone, title, ...options }];
      const live = next.filter((t) => !t.leaving);
      const overflow = new Set(live.slice(0, Math.max(0, live.length - MAX_VISIBLE)).map((t) => t.id));
      return overflow.size ? next.map((t) => (overflow.has(t.id) ? { ...t, leaving: true } : t)) : next;
    });
    return id;
  }, []);

  const update = useCallback(
    (id: number, patch: Partial<Omit<ToastItem, "id">>) =>
      setToasts((list) => list.map((t) => (t.id === id ? { ...t, ...patch } : t))),
    [],
  );

  useEffect(() => {
    const timers = exitTimers.current;
    for (const t of toasts) {
      if (!t.leaving || timers.has(t.id)) continue;
      timers.set(
        t.id,
        window.setTimeout(() => {
          timers.delete(t.id);
          setToasts((list) => list.filter((x) => x.id !== t.id));
        }, EXIT_MS),
      );
    }
  }, [toasts]);

  useEffect(() => {
    const timers = exitTimers.current;
    return () => {
      for (const timer of timers.values()) window.clearTimeout(timer);
      timers.clear();
    };
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      success: (title, o) => push("success", title, o),
      error: (title, o) => push("error", title, o),
      info: (title, o) => push("info", title, o),
      loading: (title, o) => push("loading", title, o),
      update,
      dismiss,
      promise: async (promise, messages) => {
        const id = push("loading", messages.loading);
        try {
          const value = await promise;
          update(id, {
            tone: "success",
            title: typeof messages.success === "function" ? messages.success(value) : messages.success,
          });
          return value;
        } catch (err) {
          update(id, {
            tone: "error",
            title: typeof messages.error === "function" ? messages.error(err) : messages.error,
          });
          throw err;
        }
      },
    }),
    [push, update, dismiss],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Portal>
        <section data-slot="toaster" className={styles.region} aria-label="Notifications">
          <ToastStack toasts={toasts} onDismiss={dismiss} live />
        </section>
      </Portal>
    </ToastContext.Provider>
  );
}

export type ToastPreviewItem = {
  /** Stable key: keep it when other items are removed. */
  id: number;
  tone: ToastTone;
  title: ReactNode;
  description?: ReactNode;
  action?: { label: string; onClick: () => void };
};

/**
 * The real stack, rendered in place with no timers and no live region, so a
 * styleguide can show it without anyone clicking. Newest last, as it would
 * arrive. `expanded` pins the stack fanned out; otherwise it collapses and
 * fans out on hover or focus exactly as the live one does.
 */
export function ToastStackPreview({
  items,
  expanded,
  onDismiss,
  className,
}: {
  items: ReadonlyArray<ToastPreviewItem>;
  expanded?: boolean;
  /** Receives the dismissed item's id. */
  onDismiss?: (id: number) => void;
  className?: string;
}) {
  const toasts = useMemo<Entry[]>(() => items.map((item) => ({ ...item })), [items]);
  return (
    <div data-slot="toast-stack-preview" className={cx(styles.preview, className)}>
      <ToastStack toasts={toasts} onDismiss={(id) => onDismiss?.(id)} expanded={expanded} still />
    </div>
  );
}

/**
 * Newest in front. Collapsed, the ones behind are clamped to the front
 * toast's height, stepped back and up so their edges show as a deck. Hover
 * or focus inside fans the stack out and pauses every timer.
 */
function ToastStack({
  toasts,
  onDismiss,
  live,
  expanded: pinned,
  still,
}: {
  toasts: Entry[];
  onDismiss: (id: number) => void;
  /** The live region. Off for previews so nothing is announced. */
  live?: boolean;
  expanded?: boolean;
  /** No timers: the timer bar is drawn part-way and held. */
  still?: boolean;
}) {
  const [heights, setHeights] = useState<Record<number, number>>({});
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const expanded = pinned ?? (hovered || focused);

  const listRef = useRef<HTMLOListElement>(null);

  const onHeight = useCallback((id: number, h: number) => {
    setHeights((prev) => (prev[id] === h ? prev : { ...prev, [id]: h }));
  }, []);

  // Closing the toast that holds focus hands focus to the newest one left,
  // or lets it go (which collapses the stack) when it was the last. Without
  // this, focus dies with the removed node and the stack stays fanned out
  // with every timer paused.
  const dismissWithFocus = useCallback(
    (id: number) => {
      const list = listRef.current;
      if (list?.contains(document.activeElement)) {
        const rest = Array.from(list.querySelectorAll<HTMLElement>("li[data-toast-id]")).filter(
          (li) => li.dataset.toastId !== String(id) && !li.hasAttribute("aria-hidden"),
        );
        const next = rest[rest.length - 1]?.querySelector<HTMLElement>("button");
        if (next) next.focus();
        else (document.activeElement as HTMLElement | null)?.blur();
      }
      onDismiss(id);
    },
    [onDismiss],
  );

  // Newest first. Leaving toasts drop out of the layout at once, so the rest
  // close up while the leaver plays its exit from where it was.
  const front = toasts.filter((t) => !t.leaving).reverse();
  const layout = new Map<number, { index: number; offset: number }>();
  let offset = 0;
  front.forEach((t, index) => {
    layout.set(t.id, { index, offset });
    offset += (heights[t.id] ?? 0) + GAP;
  });
  const frontHeight = front[0] ? (heights[front[0].id] ?? 0) : 0;
  const stackHeight = expanded
    ? Math.max(0, offset - GAP)
    : frontHeight + Math.min(front.length - 1, STACK_DEPTH) * PEEK;

  const onBlur = (e: FocusEvent<HTMLOListElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
  };

  return (
    <ol data-slot="toast-stack"
      ref={listRef}
      className={cx(styles.list, expanded && styles.expanded)}
      style={{ height: toasts.length ? stackHeight : 0 }}
      aria-live={live ? "polite" : undefined}
      aria-relevant={live ? "additions text" : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={onBlur}
    >
      {toasts.map((t) => (
        <Toast
          key={t.id}
          item={t}
          place={layout.get(t.id)}
          frontHeight={frontHeight}
          ownHeight={heights[t.id]}
          expanded={expanded}
          paused={expanded}
          still={still}
          dismiss={dismissWithFocus}
          onHeight={onHeight}
        />
      ))}
    </ol>
  );
}

const ICON: Record<ToastTone, ReactNode> = {
  success: <IconCheckCircle size={17} />,
  error: <IconAlertCircle size={17} />,
  info: <IconInfo size={17} />,
  loading: <Spinner size={16} tone="current" />,
};

function Toast({
  item,
  place,
  frontHeight,
  ownHeight,
  expanded,
  paused,
  still,
  dismiss,
  onHeight,
}: {
  item: Entry;
  /** Undefined while leaving. */
  place?: { index: number; offset: number };
  frontHeight: number;
  /** Measured natural height; undefined until the first measure. */
  ownHeight?: number;
  expanded: boolean;
  paused: boolean;
  still?: boolean;
  dismiss: (id: number) => void;
  onHeight: (id: number, h: number) => void;
}) {
  const { id } = item;
  const timed = isTimed(item) && !still;
  const duration = item.duration ?? DEFAULT_DURATION;
  const bodyRef = useRef<HTMLDivElement>(null);
  const remaining = useRef(duration);

  // A leaving toast keeps the place it had, so it exits from where it sat.
  const [held, setHeld] = useState(place ?? { index: 0, offset: 0 });
  if (place && (place.index !== held.index || place.offset !== held.offset)) setHeld(place);
  const { index, offset } = place ?? held;

  // Report the natural height. Measured on the body, which is never clamped.
  useLayoutEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    onHeight(id, el.offsetHeight);
    const observer = new ResizeObserver(() => onHeight(id, el.offsetHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, [id, onHeight]);

  // A new tone (loading → success) or duration starts a fresh countdown.
  useEffect(() => {
    remaining.current = duration;
  }, [duration, item.tone]);

  // Counts down what is left, so hovering pauses rather than restarts: the
  // bar (paused by the same flag in CSS) and the timer stay in step.
  useEffect(() => {
    if (!timed || paused || item.leaving) return;
    const started = Date.now();
    const timer = window.setTimeout(() => dismiss(id), Math.max(0, remaining.current));
    return () => {
      window.clearTimeout(timer);
      remaining.current -= Date.now() - started;
    };
  }, [timed, paused, item.leaving, item.tone, duration, id, dismiss]);

  const behind = !expanded && index > 0;
  const vars = {
    "--index": index,
    "--offset": `${offset}px`,
    "--front-height": `${frontHeight}px`,
    "--own-height": ownHeight ? `${ownHeight}px` : "auto",
    "--toast-duration": `${duration}ms`,
  } as CSSProperties;

  return (
    <li data-slot="toast"
      className={cx(
        styles.toast,
        styles[item.tone],
        behind && styles.behind,
        behind && frontHeight > 0 && styles.clamped,
        !expanded && index > STACK_DEPTH && styles.hidden,
        item.leaving && styles.leaving,
      )}
      style={vars}
      role={item.tone === "error" ? "alert" : undefined}
      aria-busy={item.tone === "loading" || undefined}
      aria-hidden={item.leaving || undefined}
      data-toast-id={id}
    >
      <div ref={bodyRef} className={styles.body}>
        <span className={styles.icon} aria-hidden="true">
          {ICON[item.tone]}
        </span>
        <div className={styles.content}>
          <p className={styles.title}>{item.title}</p>
          {item.description ? <p className={styles.description}>{item.description}</p> : null}
          {item.action ? (
            <button
              type="button"
              className={styles.action}
              tabIndex={behind ? -1 : undefined}
              onClick={() => {
                item.action?.onClick();
                dismiss(id);
              }}
            >
              {item.action.label}
            </button>
          ) : null}
        </div>
        {item.tone !== "loading" ? (
          <button
            type="button"
            className={styles.close}
            tabIndex={behind ? -1 : undefined}
            onClick={() => dismiss(id)}
            aria-label="Dismiss notification"
          >
            <IconX size={14} />
          </button>
        ) : null}
      </div>
      {isTimed(item) ? (
        <span
          key={`${item.tone}-${duration}`}
          className={cx(styles.timer, (paused || still) && styles.timerPaused, still && styles.timerStill)}
          aria-hidden="true"
        />
      ) : null}
    </li>
  );
}
