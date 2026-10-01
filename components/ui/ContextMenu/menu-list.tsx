"use client";

import { forwardRef, useEffect, useRef, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "../_internal/cx";
import { mergeRefs } from "../_internal/merge-refs";
import styles from "./MenuList.module.css";

// The menu list shared by ContextMenu and Menubar: role="menu", roving focus
// (arrows, Home, End, typeahead), separators, headings, shortcuts and danger
// items, drawn in the popover glass.

export type MenuListAction = {
  id: string;
  label: string;
  icon?: ReactNode;
  /** Shown at the right edge, e.g. "Ctrl C". Display only: wire the key yourself. */
  shortcut?: string;
  tone?: "default" | "danger";
  disabled?: boolean;
  onSelect?: () => void;
  separator?: false;
  heading?: undefined;
};
export type MenuListSeparator = { id: string; separator: true };
export type MenuListHeading = { id: string; heading: string; separator?: false };
export type MenuListEntry = MenuListAction | MenuListSeparator | MenuListHeading;

const isAction = (e: MenuListEntry): e is MenuListAction => !("separator" in e && e.separator) && !("heading" in e && e.heading);

/** Focuses the enabled item at index i (negative counts from the end). */
export function focusMenuItem(menu: HTMLElement | null, i: number) {
  const list = Array.from(menu?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])') ?? []);
  if (list.length) list[((i % list.length) + list.length) % list.length].focus();
}

type Props = {
  entries: ReadonlyArray<MenuListEntry>;
  /** Called after an item runs, or on Esc / Tab. */
  onClose: (reason: "select" | "escape" | "tab") => void;
  label?: string;
  labelledBy?: string;
  id?: string;
  /** Focus the first item on mount. */
  autoFocus?: boolean;
  /** Extra keys the parent handles (Menubar's Left and Right). Return true if handled. */
  onKeyExtra?: (e: KeyboardEvent<HTMLDivElement>) => boolean;
  /** No item takes focus: a static picture of the menu (docs, previews). */
  inert?: boolean;
  /** Mark one item as highlighted when inert, to show the hover state. */
  highlightId?: string;
  className?: string;
  style?: CSSProperties;
};

export const MenuList = forwardRef<HTMLDivElement, Props>(function MenuList(
  { entries, onClose, label, labelledBy, id, autoFocus, onKeyExtra, inert, highlightId, className, style },
  ref,
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const typed = useRef({ text: "", at: 0 });

  const items = () => Array.from(rootRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])') ?? []);
  const focusAt = (i: number) => focusMenuItem(rootRef.current, i);

  useEffect(() => {
    if (!autoFocus || inert) return;
    const frame = requestAnimationFrame(() => focusAt(0));
    return () => cancelAnimationFrame(frame);
  }, [autoFocus, inert]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (onKeyExtra?.(e)) return;
    const list = items();
    const at = list.indexOf(document.activeElement as HTMLElement);
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        focusAt(at + 1);
        return;
      case "ArrowUp":
        e.preventDefault();
        focusAt(at < 0 ? -1 : at - 1);
        return;
      case "Home":
        e.preventDefault();
        focusAt(0);
        return;
      case "End":
        e.preventDefault();
        focusAt(-1);
        return;
      case "Escape":
        e.preventDefault();
        e.stopPropagation();
        onClose("escape");
        return;
      case "Tab":
        onClose("tab");
        return;
    }
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const now = Date.now();
      typed.current = { text: (now - typed.current.at > 600 ? "" : typed.current.text) + e.key.toLowerCase(), at: now };
      const start = at + 1;
      const order = [...list.slice(start), ...list.slice(0, start)];
      const hit = order.find((el) => (el.textContent ?? "").trim().toLowerCase().startsWith(typed.current.text));
      hit?.focus();
    }
  };

  return (
    <div
      ref={mergeRefs(rootRef, ref)}
      id={id}
      role="menu"
      aria-label={label}
      aria-labelledby={labelledBy}
      aria-orientation="vertical"
      className={cx(styles.menu, className)}
      style={style}
      onKeyDown={onKeyDown}
      tabIndex={-1}
    >
      {entries.map((entry) => {
        if ("separator" in entry && entry.separator) return <div key={entry.id} role="separator" className={styles.separator} />;
        if ("heading" in entry && entry.heading)
          return (
            <div key={entry.id} role="presentation" className={styles.heading}>
              {entry.heading}
            </div>
          );
        if (!isAction(entry)) return null;
        return (
          <div
            key={entry.id}
            role="menuitem"
            tabIndex={-1}
            aria-disabled={entry.disabled || undefined}
            data-highlighted={inert && highlightId === entry.id ? "" : undefined}
            className={cx(styles.item, entry.tone === "danger" && styles.danger, entry.disabled && styles.disabled)}
            onPointerMove={(e) => {
              if (!inert && !entry.disabled && document.activeElement !== e.currentTarget) e.currentTarget.focus();
            }}
            onClick={() => {
              if (inert || entry.disabled) return;
              entry.onSelect?.();
              onClose("select");
            }}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && !entry.disabled && !inert) {
                e.preventDefault();
                entry.onSelect?.();
                onClose("select");
              }
            }}
          >
            {entry.icon ? (
              <span className={styles.icon} aria-hidden="true">
                {entry.icon}
              </span>
            ) : null}
            <span className={styles.label}>{entry.label}</span>
            {entry.shortcut ? (
              <kbd className={styles.shortcut} aria-label={`Shortcut ${entry.shortcut}`}>
                {entry.shortcut}
              </kbd>
            ) : null}
          </div>
        );
      })}
    </div>
  );
});
