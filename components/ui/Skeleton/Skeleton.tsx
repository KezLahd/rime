import type { CSSProperties } from "react";
import { cx } from "../_internal/cx";
import styles from "./Skeleton.module.css";

export type SkeletonProps = {
  /** Size to the real content it stands in for, not a generic block. */
  width?: number | string;
  height?: number | string;
  /** text = a line of text at the given font size's height; circle = avatar. */
  variant?: "text" | "block" | "circle";
  radius?: number | string;
  className?: string;
  style?: CSSProperties;
};

/** A placeholder shape. Decorative: wrap loading regions in aria-busy and give them a label. */
export function Skeleton({ width = "100%", height, variant = "block", radius, className, style }: SkeletonProps) {
  const h = height ?? (variant === "text" ? "0.9em" : variant === "circle" ? width : 16);
  return (
    <span data-slot="skeleton"
      aria-hidden="true"
      className={cx(styles.skeleton, styles[variant], radius !== undefined && styles.custom, className)}
      style={{
        width,
        height: h,
        ...(radius !== undefined
          ? ({ "--skeleton-radius": typeof radius === "number" ? `${radius}px` : radius } as CSSProperties)
          : null),
        ...style,
      }}
    />
  );
}

export type SkeletonTextProps = {
  lines?: number;
  /** Last line is shorter, as real paragraphs are. */
  lastLineWidth?: string;
  lineHeight?: number;
  className?: string;
};

export function SkeletonText({ lines = 3, lastLineWidth = "62%", lineHeight = 14, className }: SkeletonTextProps) {
  return (
    <span data-slot="skeleton-text" className={cx(styles.lines, className)} aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} variant="text" height={lineHeight * 0.72} width={i === lines - 1 && lines > 1 ? lastLineWidth : "100%"} />
      ))}
    </span>
  );
}
