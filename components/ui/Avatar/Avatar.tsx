import { cx } from "../_internal/cx";
import styles from "./Avatar.module.css";

export type AvatarProps = {
  /** Full name; initials are derived (titles like "Dr" are skipped). */
  name?: string;
  /** Explicit initials, e.g. a customer's "R.T." (dots are dropped). */
  initials?: string;
  size?: "sm" | "md" | "lg";
  /** brand = the gradient (the signed-in user). neutral = a record (a customer). */
  tone?: "brand" | "neutral";
  /** Decorative when a name sits next to it (the default). */
  label?: string;
  className?: string;
};

const TITLES = new Set(["dr", "a/prof", "prof", "mr", "ms", "mrs", "mx", "assoc"]);

export function initialsFrom(name: string): string {
  const parts = name
    .split(/\s+/)
    .map((p) => p.replace(/[.,]/g, ""))
    .filter((p) => p && !TITLES.has(p.toLowerCase()));
  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function Avatar({ name, initials, size = "md", tone = "brand", label, className }: AvatarProps) {
  const text = initials ? initials.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase() : initialsFrom(name ?? "");
  return (
    <span data-slot="avatar"
      className={cx(styles.avatar, styles[size], styles[tone], className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {text}
    </span>
  );
}
