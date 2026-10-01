import type { ReactNode } from "react";
import { cx } from "../_internal/cx";
import { Slot } from "../_internal/slot";
import styles from "./Badge.module.css";

export type Tone = "neutral" | "info" | "success" | "warning" | "danger" | "brand";

export type StatusPillProps = {
  tone: Tone;
  children: ReactNode;
  /** Leading dot in the tone colour, for dense tables where the pill needs a second cue. */
  dot?: boolean;
  size?: "sm" | "md";
  className?: string;
  /** Render the single child element (a link) with the pill's look. */
  asChild?: boolean;
};

/** Status of a record. Rounded-full (pills are the one capsule shape allowed). */
export function StatusPill({ tone, children, dot, size = "md", className, asChild }: StatusPillProps) {
  const cls = cx(styles.pill, styles[tone], styles[size], className);
  if (asChild) {
    return (
      <Slot className={cls} data-slot="status-pill" data-variant={tone} data-size={size}>
        {children}
      </Slot>
    );
  }
  return (
    <span className={cls} data-slot="status-pill" data-variant={tone} data-size={size}>
      {dot ? <span className={styles.dot} aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

export type BadgeProps = {
  tone?: Tone;
  /**
   * soft = tinted tag. solid = white text on the tone (counts needing
   * attention). shadcn's names are accepted too: default (solid brand),
   * secondary (soft neutral), destructive (solid danger), outline (a
   * hairline tag with no fill).
   */
  variant?: "soft" | "solid" | "default" | "secondary" | "destructive" | "outline";
  children: ReactNode;
  className?: string;
  /** Render the single child element (a link) with the badge's look. */
  asChild?: boolean;
};

/** shadcn badge variants mapped onto Rime's tone and fill. */
function resolveBadge(tone: Tone, variant: NonNullable<BadgeProps["variant"]>): { tone: Tone; solid: boolean; outline: boolean } {
  switch (variant) {
    case "default":
      return { tone: tone === "neutral" ? "brand" : tone, solid: true, outline: false };
    case "secondary":
      return { tone: "neutral", solid: false, outline: false };
    case "destructive":
      return { tone: "danger", solid: true, outline: false };
    case "outline":
      return { tone, solid: false, outline: true };
    default:
      return { tone, solid: variant === "solid", outline: false };
  }
}

/** A small uppercase tag: "PLACEHOLDER", "NOT A GATE", "PDF", "ADMIN". */
export function Badge({ tone = "neutral", variant = "soft", children, className, asChild }: BadgeProps) {
  const r = resolveBadge(tone, variant);
  const cls = cx(styles.badge, styles[r.tone], r.solid && styles.solid, r.outline && styles.outline, className);
  const attrs = { "data-slot": "badge", "data-variant": variant };
  if (asChild) {
    return (
      <Slot className={cls} {...attrs}>
        {children}
      </Slot>
    );
  }
  return (
    <span className={cls} {...attrs}>
      {children}
    </span>
  );
}

export type CountBadgeProps = {
  count: number;
  tone?: "brand" | "danger" | "warning" | "neutral";
  /** Accessible text, e.g. "3 pending requests". The number alone is ambiguous. */
  label?: string;
  max?: number;
  className?: string;
};

export function CountBadge({ count, tone = "brand", label, max = 99, className }: CountBadgeProps) {
  return (
    <span className={cx(styles.count, styles[`count_${tone}`], className)} aria-label={label} role={label ? "img" : undefined} data-slot="count-badge" data-variant={tone}>
      {count > max ? `${max}+` : count}
    </span>
  );
}
