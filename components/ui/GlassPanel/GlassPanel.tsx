import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../_internal/cx";
import styles from "./GlassPanel.module.css";

export type GlassPanelProps = HTMLAttributes<HTMLElement> & {
  /**
   * page   = the signature panel, radius 20, two-layer shadow (one or two per screen).
   * light  = for screens that are mostly panel, so the page does not go milky.
   * nested = a glass row or block inside a page panel, radius 16, no heavy shadow.
   */
  variant?: "page" | "light" | "nested";
  padding?: "none" | "sm" | "md" | "lg";
  as?: "div" | "section" | "article" | "aside" | "header";
  /**
   * Soft corner light, the reference "something to act on here" signal. Use
   * sparingly. Off in the public system (--bloom-opacity: 0).
   */
  bloom?: boolean;
  /** Squares the top-left corner so FolderTabs can sit on it. Set by FolderTabs. */
  tabbed?: boolean;
  children?: ReactNode;
};

/**
 * Frosted glass over the page gradient. Publishes --inner-radius (its radius
 * minus its padding, floored at 4px) so anything flush inside it can be
 * concentric: `border-radius: var(--inner-radius)`.
 */
export function GlassPanel({
  variant = "page",
  padding = "md",
  as: Tag = "div",
  bloom,
  tabbed,
  className,
  style,
  children,
  ...rest
}: GlassPanelProps) {
  return (
    <Tag data-slot="glass-panel"
      className={cx(
        styles.panel,
        styles[variant],
        styles[`pad_${padding}`],
        tabbed && styles.tabbed,
        bloom && styles.bloom,
        className,
      )}
      style={style}
      {...rest}
    >
      {bloom ? <span className={styles.bloomLayer} aria-hidden="true" /> : null}
      {children}
    </Tag>
  );
}
