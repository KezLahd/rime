"use client";

import { useRef, type ComponentPropsWithRef, type KeyboardEvent } from "react";
import { cx } from "../_internal/cx";
import { mergeRefs } from "../_internal/merge-refs";
import { mergeDescribedBy, useField } from "../Field/Field";
import { IconSearch, IconX } from "../Icon/Icon";
import { Spinner } from "../Spinner/Spinner";
import { useGlobalShortcut, useShortcutLabel } from "./shortcut";
import styles from "./SearchField.module.css";

export type SearchFieldProps = Omit<
  ComponentPropsWithRef<"input">,
  "size" | "type" | "value" | "defaultValue" | "onChange" | "children"
> & {
  value: string;
  onValueChange: (value: string) => void;
  /** md sits level with TextInput and Select; sm with the 36px controls. */
  size?: "sm" | "md";
  /** Results are being fetched. The magnifier turns into a spinner and the field reports busy. */
  loading?: boolean;
  /** Announced while loading. */
  loadingLabel?: string;
  /**
   * A letter that focuses the field with Ctrl/⌘. Shows as a key badge while
   * the field is empty and unfocused. Use once per page.
   */
  shortcut?: string;
  /** Enter runs this (and never submits an enclosing form). Omit for live filtering. */
  onSearch?: (value: string) => void;
  invalid?: boolean;
  /** Class for the outer box rather than the <input>. */
  boxClassName?: string;
};

/**
 * Field-size search box: the reference recessed grey frosted control at form
 * height, for page-level search (a customer list, the order queue). The
 * 32px filter-bar version is FilterSearch.
 *
 * Escape clears (and stops there, so an enclosing modal stays open); a second
 * Escape on an empty field is left to bubble. The clear button returns focus
 * to the input so the next search can be typed straight away.
 */
export function SearchField({
  value,
  onValueChange,
  size = "md",
  loading = false,
  loadingLabel = "Searching…",
  shortcut,
  onSearch,
  invalid: invalidProp,
  boxClassName,
  className,
  id: idProp,
  disabled,
  placeholder = "Search",
  onKeyDown,
  ref,
  "aria-describedby": describedByProp,
  ...rest
}: SearchFieldProps) {
  const field = useField();
  const inputRef = useRef<HTMLInputElement>(null);
  const invalid = invalidProp ?? field?.invalid ?? false;
  const shortcutLabel = useShortcutLabel(shortcut);

  useGlobalShortcut(disabled ? undefined : shortcut, () => {
    inputRef.current?.focus();
    inputRef.current?.select();
  });

  const clear = () => {
    onValueChange("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    if (e.key === "Escape" && value) {
      e.preventDefault();
      e.stopPropagation();
      onValueChange("");
    } else if (e.key === "Enter" && onSearch) {
      e.preventDefault();
      onSearch(value);
    }
  };

  const iconSize = size === "sm" ? 14 : 16;

  return (
    <div data-slot="search-field"
      className={cx(
        styles.box,
        styles[size],
        value && styles.filled,
        invalid && styles.invalid,
        disabled && styles.disabled,
        boxClassName,
      )}
    >
      <span className={styles.leading} aria-hidden="true">
        {loading ? <Spinner size={iconSize} tone="current" /> : <IconSearch size={iconSize} />}
      </span>
      <input
        ref={mergeRefs(inputRef, ref)}
        id={idProp ?? field?.id}
        type="search"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        spellCheck={false}
        aria-invalid={invalid || undefined}
        aria-busy={loading || undefined}
        aria-describedby={mergeDescribedBy(describedByProp, field?.describedBy)}
        aria-keyshortcuts={shortcut ? `Control+${shortcut.toUpperCase()} Meta+${shortcut.toUpperCase()}` : undefined}
        className={cx(styles.input, className)}
        onChange={(e) => onValueChange(e.target.value)}
        onKeyDown={handleKeyDown}
        {...rest}
      />
      {value && !disabled ? (
        <button type="button" className={styles.clear} aria-label="Clear search" onClick={clear}>
          <IconX size={size === "sm" ? 13 : 14} />
        </button>
      ) : shortcutLabel ? (
        <kbd className={styles.kbd} aria-hidden="true">
          {shortcutLabel}
        </kbd>
      ) : null}
      <span className="sr-only" role="status">
        {loading ? loadingLabel : ""}
      </span>
    </div>
  );
}
