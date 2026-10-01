import { Fragment, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../_internal/cx";
import styles from "./Kbd.module.css";

export type KbdProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  /** sm sits inside menus and tooltips; md in running text. */
  size?: "sm" | "md";
};

/** One keyboard key, as a small raised key cap. Renders a real <kbd>. */
export function Kbd({ children, size = "md", className, ...rest }: KbdProps) {
  return (
    <kbd data-slot="kbd" className={cx(styles.kbd, styles[size], className)} {...rest}>
      {children}
    </kbd>
  );
}

export type KbdGroupProps = {
  /** The keys pressed together, in order: ["Ctrl", "K"]. */
  keys: ReadonlyArray<string>;
  /** Between the keys. Defaults to a muted "+". */
  separator?: ReactNode;
  size?: "sm" | "md";
  className?: string;
};

/**
 * A key combination. The outer <kbd> wraps one <kbd> per key, which is how
 * HTML marks up a chord, so a screen reader reads it as one input.
 */
export function KbdGroup({ keys, separator = "+", size = "md", className }: KbdGroupProps) {
  return (
    <kbd data-slot="kbd-group" className={cx(styles.group, className)}>
      {keys.map((k, i) => (
        <Fragment key={`${k}-${i}`}>
          {i ? (
            <span className={styles.separator} aria-hidden="true">
              {separator}
            </span>
          ) : null}
          <kbd className={cx(styles.kbd, styles[size])}>{k}</kbd>
        </Fragment>
      ))}
    </kbd>
  );
}
