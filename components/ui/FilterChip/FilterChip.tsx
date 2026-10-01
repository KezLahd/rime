"use client";

import { useRef, type ComponentPropsWithRef, type ReactNode } from "react";
import { cx } from "../_internal/cx";
import { IconSearch, IconX } from "../Icon/Icon";
import styles from "./FilterChip.module.css";

export type FilterChipProps = Omit<ComponentPropsWithRef<"button">, "children"> & {
  /** Filter applied. Shown by tint and ink only, never a ring. */
  active?: boolean;
  icon?: ReactNode;
  count?: number;
  children: ReactNode;
};

/**
 * A filter bar is navigation, not data entry, so its controls are recessed
 * chips rather than outlined boxes. Toggle semantics via aria-pressed.
 */
export function FilterChip({ active = false, icon, count, children, className, type = "button", ...rest }: FilterChipProps) {
  return (
    <button data-slot="filter-chip" type={type} aria-pressed={active} className={cx(styles.chip, active && styles.active, className)} {...rest}>
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      <span>{children}</span>
      {count !== undefined ? <span className={styles.count}>{count}</span> : null}
    </button>
  );
}

export type FilterSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  "aria-label": string;
  className?: string;
  /** Width of the chip. Defaults to 220px. Ignored when grow is set. */
  width?: number | string;
  /**
   * Fill the row: the search takes every pixel the other filters leave
   * (FilterBar's pattern, where dropdowns sit at the end).
   */
  grow?: boolean;
};

/**
 * Live search chip. Enter blurs (filtering is already live, and it must not
 * submit an enclosing form); Escape clears. Icon and text share one tone.
 */
export function FilterSearch({
  value,
  onChange,
  placeholder = "Search",
  "aria-label": ariaLabel,
  className,
  width = 220,
  grow,
}: FilterSearchProps) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div data-slot="filter-search" className={cx(styles.search, grow && styles.grow, value && styles.active, className)} style={grow ? undefined : { width }}>
      <IconSearch size={13} className={styles.searchIcon} />
      <input
        ref={ref}
        type="search"
        value={value}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={styles.searchInput}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            ref.current?.blur();
          } else if (e.key === "Escape" && value) {
            e.preventDefault();
            e.stopPropagation();
            onChange("");
          }
        }}
      />
      {value ? (
        <button
          type="button"
          className={styles.clear}
          aria-label="Clear search"
          onClick={() => {
            onChange("");
            ref.current?.focus();
          }}
        >
          <IconX size={12} />
        </button>
      ) : null}
    </div>
  );
}
