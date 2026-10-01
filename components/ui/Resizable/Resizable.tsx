"use client";

import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";
import { cx } from "../_internal/cx";
import styles from "./Resizable.module.css";

type GroupContext = {
  direction: "horizontal" | "vertical";
  sizes: number[];
  mins: number[];
  ids: string[];
  resize: (handle: number, delta: number) => void;
  setTo: (handle: number, size: number) => void;
  groupRef: RefObject<HTMLDivElement | null>;
};

const Ctx = createContext<GroupContext | null>(null);

export type ResizablePanelGroupProps = {
  /** horizontal = panels side by side (drag left and right). Default horizontal. */
  direction?: "horizontal" | "vertical";
  /** ResizablePanel and ResizableHandle children, alternating. */
  children: ReactNode;
  /** Called with every panel's size, in percent, after each change. */
  onLayout?: (sizes: number[]) => void;
  /** Group height for vertical groups (or any fixed frame), e.g. 320. */
  height?: number | string;
  /** Glass frame around the group with hairline handles. Default true. */
  framed?: boolean;
  className?: string;
};

export type ResizablePanelProps = {
  /** Starting size in percent of the group. Unset panels share what is left. */
  defaultSize?: number;
  /** Smallest size in percent. Default 10. */
  minSize?: number;
  children?: ReactNode;
  className?: string;
};

export type ResizableHandleProps = {
  /** Accessible name. Defaults to "Resize". */
  "aria-label"?: string;
  /** Shows a small grip on the rule. */
  withGrip?: boolean;
  className?: string;
};

type Injected = { __index?: number };

/**
 * Panels whose split the user can drag. Each handle is a focusable
 * role="separator" with aria-valuenow (the size of the panel before it, in
 * percent), aria-valuemin and aria-valuemax; arrow keys move it 5% (Shift for
 * 10%), Home and End jump to the limits. Sizes are flex-grow proportions, so
 * handles keep their pixel width and nothing overflows.
 */
export function ResizablePanelGroup({ direction = "horizontal", children, onLayout, height, framed = true, className }: ResizablePanelGroupProps) {
  const baseId = useId();
  const groupRef = useRef<HTMLDivElement>(null);
  const items = Children.toArray(children).filter(isValidElement) as ReactElement<Injected & Record<string, unknown>>[];
  const panels = items.filter((c) => c.type === ResizablePanel) as ReactElement<ResizablePanelProps & Injected>[];
  const mins = panels.map((p) => p.props.minSize ?? 10);

  const [sizes, setSizes] = useState<number[]>(() => {
    const given = panels.map((p) => p.props.defaultSize);
    const fixed = given.reduce<number>((s, v) => s + (v ?? 0), 0);
    const free = given.filter((v) => v === undefined).length;
    return given.map((v) => v ?? Math.max(0, (100 - fixed) / Math.max(1, free)));
  });

  // Pointer moves can outpace renders, so every change reads the latest sizes.
  const resize = (h: number, delta: number) => {
    setSizes((prev) => {
      const a = prev[h];
      const b = prev[h + 1];
      if (a === undefined || b === undefined) return prev;
      const d = Math.max(mins[h] - a, Math.min(b - mins[h + 1], delta));
      if (!d) return prev;
      const next = [...prev];
      next[h] = a + d;
      next[h + 1] = b - d;
      return next;
    });
  };

  const reported = useRef(sizes);
  useEffect(() => {
    if (reported.current === sizes) return;
    reported.current = sizes;
    onLayout?.(sizes);
  }, [sizes, onLayout]);

  const setTo = (h: number, size: number) => resize(h, size - sizes[h]);

  let p = 0;
  let hIndex = 0;
  const content = items.map((child) => {
    if (child.type === ResizablePanel) return cloneElement(child, { __index: p++, key: child.key ?? `p${p}` });
    if (child.type === ResizableHandle) return cloneElement(child, { __index: hIndex++, key: child.key ?? `h${hIndex}` });
    return child;
  });

  return (
    <Ctx.Provider value={{ direction, sizes, mins, ids: panels.map((_, i) => `${baseId}-panel-${i}`), resize, setTo, groupRef }}>
      <div data-slot="resizable-panel-group"
        ref={groupRef}
        className={cx(styles.group, styles[direction], framed && styles.framed, className)}
        style={height !== undefined ? { height } : undefined}
      >
        {content}
      </div>
    </Ctx.Provider>
  );
}

export function ResizablePanel({ children, className, __index = 0 }: ResizablePanelProps & Injected) {
  const ctx = useContext(Ctx);
  const size = ctx?.sizes[__index] ?? 50;
  return (
    <div data-slot="resizable-panel" id={ctx?.ids[__index]} className={cx(styles.panel, className)} style={{ flex: `${size} 1 0px` } as CSSProperties}>
      {children}
    </div>
  );
}

export function ResizableHandle({ "aria-label": ariaLabel = "Resize", withGrip, className, __index = 0 }: ResizableHandleProps & Injected) {
  const ctx = useContext(Ctx);
  const drag = useRef<{ start: number; last: number; total: number } | null>(null);
  if (!ctx) return null;
  const { direction, sizes, mins, ids, resize, setTo, groupRef } = ctx;
  const horizontal = direction === "horizontal";
  const value = Math.round(sizes[__index] ?? 0);
  const max = Math.round((sizes[__index] ?? 0) + (sizes[__index + 1] ?? 0) - (mins[__index + 1] ?? 0));

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    const group = groupRef.current;
    if (!group) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.focus();
    const handles = Array.from(group.querySelectorAll<HTMLElement>(":scope > [role=separator]"));
    const handleSpace = handles.reduce((s, h) => s + (horizontal ? h.offsetWidth : h.offsetHeight), 0);
    const total = (horizontal ? group.clientWidth : group.clientHeight) - handleSpace;
    const pos = horizontal ? e.clientX : e.clientY;
    drag.current = { start: pos, last: pos, total };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.total <= 0) return;
    const pos = horizontal ? e.clientX : e.clientY;
    const deltaPct = ((pos - d.last) / d.total) * 100;
    d.last = pos;
    resize(__index, deltaPct);
  };

  const end = () => {
    drag.current = null;
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 5;
    const back = horizontal ? "ArrowLeft" : "ArrowUp";
    const fwd = horizontal ? "ArrowRight" : "ArrowDown";
    if (e.key === back) resize(__index, -step);
    else if (e.key === fwd) resize(__index, step);
    else if (e.key === "Home") setTo(__index, mins[__index] ?? 0);
    else if (e.key === "End") setTo(__index, max);
    else return;
    e.preventDefault();
  };

  return (
    <div data-slot="resizable-handle"
      role="separator"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-controls={ids[__index]}
      aria-orientation={horizontal ? "vertical" : "horizontal"}
      aria-valuenow={value}
      aria-valuemin={Math.round(mins[__index] ?? 0)}
      aria-valuemax={max}
      className={cx(styles.handle, className)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={end}
      onPointerCancel={end}
      onKeyDown={onKeyDown}
    >
      {withGrip ? <span className={styles.grip} aria-hidden="true" /> : null}
    </div>
  );
}
