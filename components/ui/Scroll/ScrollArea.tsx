"use client";

import { useRef, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../_internal/cx";
import styles from "./Scroll.module.css";
import { useScrollEdges } from "./useScrollEdges";

/** The scrollbar and overscroll half of the pattern, for a scroller you already have. */
export const themedScrollClass = styles.themed;

export type ScrollAreaProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** Caps the viewport; the content scrolls past it. Any CSS length. */
  maxHeight?: CSSProperties["maxHeight"];
  /** "y" (default) for lists and long copy, "x" for wide tables. */
  axis?: "y" | "x";
  /**
   * A name for the scrolling region. When set, the viewport joins the tab
   * order (a keyboard user can scroll it) and is announced as a region.
   */
  label?: string;
  children?: ReactNode;
};

/**
 * Any scroll container, done the modal's way: thin brand-tinted scrollbars,
 * contained overscroll, and edge shadows that appear only once there is
 * something past the edge. No scroll listener reaches React state.
 */
export function ScrollArea({ maxHeight, axis = "y", label, className, style, children, ...rest }: ScrollAreaProps) {
  const areaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  useScrollEdges(viewportRef, { target: areaRef, axis });

  return (
    <div data-slot="scroll-area" ref={areaRef} className={cx(styles.area, styles[axis], className)} style={style} {...rest}>
      <div
        ref={viewportRef}
        className={cx(styles.viewport, styles.themed)}
        style={{ maxHeight }}
        tabIndex={label ? 0 : undefined}
        role={label ? "region" : undefined}
        aria-label={label}
      >
        {/* The observed box: it grows with the content while the viewport stays clamped. */}
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
