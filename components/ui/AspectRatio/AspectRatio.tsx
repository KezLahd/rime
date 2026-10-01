import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cx } from "../_internal/cx";
import styles from "./AspectRatio.module.css";

export type AspectRatioProps = HTMLAttributes<HTMLDivElement> & {
  /** Width over height: 16 / 9, 4 / 3, 1. Default 16 / 9. */
  ratio?: number;
  /** Rounded, clipped frame with a hairline, for media on a panel. Default true. */
  framed?: boolean;
  children?: ReactNode;
};

/**
 * Holds its children to a fixed width-to-height ratio, so images, video and
 * maps keep their shape at any width and never shift the layout while they
 * load. An <img> or <video> child fills the box with object-fit: cover.
 */
export function AspectRatio({ ratio = 16 / 9, framed = true, className, style, children, ...rest }: AspectRatioProps) {
  return (
    <div data-slot="aspect-ratio"
      className={cx(styles.root, framed && styles.framed, className)}
      style={{ "--aspect-ratio": ratio, ...style } as CSSProperties}
      {...rest}
    >
      {children}
    </div>
  );
}
