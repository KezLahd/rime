import type { ComponentPropsWithRef, ReactNode } from "react";
import { cx } from "../_internal/cx";
import { Slot } from "../_internal/slot";
import { Spinner } from "../Spinner/Spinner";
import styles from "./IconButton.module.css";

export type IconButtonProps = Omit<ComponentPropsWithRef<"button">, "aria-label"> & {
  /** Required: an icon-only control has no other accessible name. */
  label: string;
  icon: ReactNode;
  variant?: "ghost" | "secondary" | "primary" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  /** Makes it a toggle button (aria-pressed). */
  pressed?: boolean;
  /** Render the single child element (a Next <Link>, an <a>) with the icon button's look; pass the icon inside the child. */
  asChild?: boolean;
  children?: ReactNode;
};

export function IconButton({
  label,
  icon,
  variant = "ghost",
  size = "md",
  loading,
  pressed,
  disabled,
  className,
  type = "button",
  title,
  asChild,
  children,
  ...rest
}: IconButtonProps) {
  const cls = cx(styles.iconButton, styles[variant], styles[size], loading && styles.loading, className);
  if (asChild) {
    return (
      <Slot aria-label={label} title={title ?? label} className={cls} data-slot="icon-button" data-variant={variant} data-size={size} {...(rest as Record<string, unknown>)}>
        {children}
      </Slot>
    );
  }
  return (
    <button
      type={type}
      aria-label={label}
      title={title ?? label}
      aria-pressed={pressed}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cls}
      data-slot="icon-button"
      data-variant={variant}
      data-size={size}
      {...rest}
    >
      {loading ? <Spinner size={size === "sm" ? 13 : 15} tone="current" /> : icon}
    </button>
  );
}
