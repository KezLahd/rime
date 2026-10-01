import Link from "next/link";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { cx } from "../_internal/cx";
import { Slot } from "../_internal/slot";
import { Spinner } from "../Spinner/Spinner";
import styles from "./Button.module.css";

/**
 * Rime's variants, plus shadcn's names as aliases: default = primary,
 * destructive = danger, outline = secondary. link is an inline text link.
 */
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "dangerSecondary"
  | "link"
  | "default"
  | "destructive"
  | "outline";
/** sm, md, lg, plus shadcn's default (= md) and the square icon sizes. */
export type ButtonSize = "sm" | "md" | "lg" | "default" | "icon" | "icon-sm" | "icon-lg";

type RimeVariant = "primary" | "secondary" | "ghost" | "danger" | "dangerSecondary" | "link";

const VARIANT_ALIAS: Record<ButtonVariant, RimeVariant> = {
  primary: "primary",
  secondary: "secondary",
  ghost: "ghost",
  danger: "danger",
  dangerSecondary: "dangerSecondary",
  link: "link",
  default: "primary",
  destructive: "danger",
  outline: "secondary",
};

/** The size class, and the base size the spinner and label follow. */
const SIZE: Record<ButtonSize, { cls: string; base: "sm" | "md" | "lg" }> = {
  sm: { cls: "sm", base: "sm" },
  md: { cls: "md", base: "md" },
  lg: { cls: "lg", base: "lg" },
  default: { cls: "md", base: "md" },
  icon: { cls: "md iconMd", base: "md" },
  "icon-sm": { cls: "sm iconSm", base: "sm" },
  "icon-lg": { cls: "lg iconLg", base: "lg" },
};

type CommonProps = {
  /** primary = the one brand gradient per view. secondary = glass (white inside solid surfaces). */
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner, sets aria-busy and blocks further presses. */
  loading?: boolean;
  /** Replaces the label while loading, e.g. "Submitting…". */
  loadingLabel?: string;
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
  fullWidth?: boolean;
  className?: string;
  children?: ReactNode;
};

export type ButtonAsButtonProps = CommonProps &
  Omit<ComponentPropsWithRef<"button">, keyof CommonProps> & {
    href?: undefined;
    /**
     * Render the single child element (a Next <Link>, an <a>) with the
     * button's look, as shadcn's asChild. The child supplies its own content.
     */
    asChild?: boolean;
  };

export type ButtonAsLinkProps = CommonProps &
  Omit<ComponentPropsWithRef<"a">, keyof CommonProps | "href"> & {
    /** Renders a Next <Link>. Internal routes only. */
    href: string;
    disabled?: boolean;
    prefetch?: boolean;
    replace?: boolean;
    scroll?: boolean;
    asChild?: undefined;
  };

export type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

/** The button look as a class, for the rare element that must be something else. */
export function buttonClassName({
  variant = "primary",
  size = "md",
  fullWidth,
  loading,
  className,
}: Pick<CommonProps, "variant" | "size" | "fullWidth" | "loading" | "className">): string {
  const v = VARIANT_ALIAS[variant] ?? "primary";
  const s = SIZE[size] ?? SIZE.md;
  return cx(
    styles.button,
    styles[v],
    ...s.cls.split(" ").map((c) => styles[c]),
    fullWidth && styles.fullWidth,
    loading && styles.loading,
    className,
  );
}

/** shadcn's name for the class helper. */
export const buttonVariants = buttonClassName;

const dataAttrs = (variant: ButtonVariant = "primary", size: ButtonSize = "md") => ({
  "data-slot": "button",
  "data-variant": VARIANT_ALIAS[variant] ?? "primary",
  "data-size": size,
});

function Inner({ loading, loadingLabel, iconStart, iconEnd, children, size }: CommonProps) {
  const base = (size && SIZE[size]?.base) || "md";
  const spinnerSize = base === "sm" ? 13 : base === "lg" ? 16 : 14;
  const label = loading && loadingLabel ? loadingLabel : children;
  return (
    <>
      {loading ? <Spinner size={spinnerSize} tone="current" /> : iconStart}
      {label ? <span className={styles.label}>{label}</span> : null}
      {!loading && iconEnd}
    </>
  );
}

export function Button(props: ButtonProps) {
  if (props.href !== undefined) {
    const {
      variant, size, loading, loadingLabel, iconStart, iconEnd, fullWidth, className, children,
      href, disabled, prefetch, replace, scroll, asChild: _asChild, ...rest
    } = props;
    void _asChild;
    const cls = buttonClassName({ variant, size, fullWidth, loading, className });
    const inner = <Inner {...{ loading, loadingLabel, iconStart, iconEnd, children, size }} />;

    // A link cannot be disabled natively. Drop the href so it is inert and out
    // of the tab order, as a disabled button would be.
    if (disabled || loading) {
      return (
        <span className={cls} role="link" aria-disabled="true" aria-busy={loading || undefined} {...dataAttrs(variant, size)}>
          {inner}
        </span>
      );
    }
    return (
      <Link href={href} prefetch={prefetch} replace={replace} scroll={scroll} className={cls} {...dataAttrs(variant, size)} {...rest}>
        {inner}
      </Link>
    );
  }

  const {
    variant, size, loading, loadingLabel, iconStart, iconEnd, fullWidth, className, children,
    type = "button", disabled, asChild, ...rest
  } = props;

  if (asChild) {
    return (
      <Slot
        className={buttonClassName({ variant, size, fullWidth, loading, className })}
        aria-busy={loading || undefined}
        aria-disabled={disabled || loading || undefined}
        {...dataAttrs(variant, size)}
        {...(rest as Record<string, unknown>)}
      >
        {children}
      </Slot>
    );
  }

  return (
    <button
      type={type}
      className={buttonClassName({ variant, size, fullWidth, loading, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...dataAttrs(variant, size)}
      {...rest}
    >
      <Inner {...{ loading, loadingLabel, iconStart, iconEnd, children, size }} />
    </button>
  );
}
