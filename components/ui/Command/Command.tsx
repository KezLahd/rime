"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "../_internal/cx";
import { Portal } from "../_internal/portal";
import { useDialogBehaviour, usePresence } from "../AlertDialog/dialog-core";
import { IconSearch } from "../Icon/Icon";
import { themedScrollClass } from "../Scroll/ScrollArea";
import styles from "./Command.module.css";

export type CommandItem = {
  id: string;
  label: string;
  icon?: ReactNode;
  /** Shown at the right edge, e.g. "Ctrl N". Display only. */
  shortcut?: string;
  /** Extra words that find it ("new", "add" for "Create invoice"). */
  keywords?: string[];
  disabled?: boolean;
  onSelect?: () => void;
};

export type CommandGroup = { heading: string; items: CommandItem[] };

export type CommandProps = {
  groups: ReadonlyArray<CommandGroup>;
  /** The input's accessible name. */
  label?: string;
  placeholder?: string;
  /** Shown when nothing matches. */
  emptyText?: ReactNode;
  /** Called with the item after its own onSelect runs. */
  onSelect?: (item: CommandItem) => void;
  /** Controlled query. Leave unset for uncontrolled. */
  query?: string;
  onQueryChange?: (q: string) => void;
  /** Focus the input on mount. */
  autoFocus?: boolean;
  className?: string;
};

export type CommandDialogProps = Omit<CommandProps, "autoFocus"> & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Toggle with Ctrl+K or Cmd+K from anywhere on the page. On by default. */
  shortcut?: boolean;
  /** Render the open palette in the page flow: no portal, scrim, focus trap or shortcut (docs, previews). */
  inline?: boolean;
};

const words = (q: string) => q.toLowerCase().split(/\s+/).filter(Boolean);
const matches = (item: CommandItem, q: string[]) => {
  if (!q.length) return true;
  const hay = [item.label, ...(item.keywords ?? [])].join(" ").toLowerCase();
  return q.every((w) => hay.includes(w));
};

/**
 * A command palette: a search box over a grouped list of actions. Typing
 * filters every group (all words must match, in the label or keywords),
 * Up and Down move the highlight, Enter runs it. It is a combobox with a
 * listbox, so focus stays in the input the whole time. Use it on its own
 * inside a page or panel, or as CommandDialog over the page with Ctrl+K.
 */
export function Command({
  groups,
  label = "Search commands",
  placeholder = "Type a command or search…",
  emptyText = "No results found.",
  onSelect,
  query: queryProp,
  onQueryChange,
  autoFocus,
  className,
}: CommandProps) {
  const id = useId();
  const [innerQuery, setInnerQuery] = useState("");
  const query = queryProp ?? innerQuery;
  const setQuery = (q: string) => {
    if (queryProp === undefined) setInnerQuery(q);
    onQueryChange?.(q);
  };
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = words(query);
    return groups.map((g) => ({ ...g, items: g.items.filter((i) => matches(i, q)) })).filter((g) => g.items.length);
  }, [groups, query]);
  const flat = useMemo(() => filtered.flatMap((g) => g.items).filter((i) => !i.disabled), [filtered]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = flat.find((i) => i.id === activeId) ?? flat[0] ?? null;

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  // Keep the highlighted row in view by scrolling the list only, never the
  // page: scrollIntoView would also scroll every ancestor, which drags the
  // docs and the Studio preview to this component on mount.
  useEffect(() => {
    const list = listRef.current;
    if (!active || !list) return;
    const row = list.querySelector<HTMLElement>(`[data-cmd-id="${CSS.escape(active.id)}"]`);
    if (!row) return;
    const top = row.getBoundingClientRect().top - list.getBoundingClientRect().top + list.scrollTop;
    if (top < list.scrollTop) list.scrollTop = top;
    else if (top + row.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = top + row.offsetHeight - list.clientHeight;
  }, [active]);

  const run = (item: CommandItem) => {
    if (item.disabled) return;
    item.onSelect?.();
    onSelect?.(item);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!flat.length) return;
    const at = active ? flat.indexOf(active) : -1;
    const move = (i: number) => {
      e.preventDefault();
      setActiveId(flat[(i + flat.length) % flat.length].id);
    };
    if (e.key === "ArrowDown") move(at + 1);
    else if (e.key === "ArrowUp") move(at - 1);
    else if (e.key === "Home" && e.ctrlKey) move(0);
    else if (e.key === "End" && e.ctrlKey) move(flat.length - 1);
    else if (e.key === "Enter" && active) {
      e.preventDefault();
      run(active);
    }
  };

  const optionId = (item: CommandItem) => `${id}-o-${item.id}`;

  return (
    <div data-slot="command" className={cx(styles.command, className)}>
      <div className={styles.searchRow}>
        <IconSearch size={16} className={styles.searchIcon} aria-hidden="true" />
        <input
          ref={inputRef}
          className={styles.input}
          role="combobox"
          aria-label={label}
          aria-expanded="true"
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-activedescendant={active ? optionId(active) : undefined}
          placeholder={placeholder}
          value={query}
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveId(null);
          }}
          onKeyDown={onKeyDown}
        />
      </div>
      <div ref={listRef} id={`${id}-list`} role="listbox" aria-label={label} className={cx(styles.list, themedScrollClass)}>
        {filtered.length === 0 ? (
          <p className={styles.empty} role="presentation">
            {emptyText}
          </p>
        ) : (
          filtered.map((g, gi) => (
            <div key={g.heading} role="group" aria-labelledby={`${id}-g${gi}`} className={styles.group}>
              <div id={`${id}-g${gi}`} className={styles.heading} role="presentation">
                {g.heading}
              </div>
              {g.items.map((item) => (
                <div
                  key={item.id}
                  id={optionId(item)}
                  data-cmd-id={item.id}
                  role="option"
                  aria-selected={active?.id === item.id}
                  aria-disabled={item.disabled || undefined}
                  className={cx(styles.item, active?.id === item.id && styles.active, item.disabled && styles.disabled)}
                  onPointerMove={() => !item.disabled && setActiveId(item.id)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => run(item)}
                >
                  {item.icon ? (
                    <span className={styles.icon} aria-hidden="true">
                      {item.icon}
                    </span>
                  ) : null}
                  <span className={styles.label}>{item.label}</span>
                  {item.shortcut ? <kbd className={styles.shortcut}>{item.shortcut}</kbd> : null}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {query ? `${flat.length} result${flat.length === 1 ? "" : "s"}` : ""}
      </p>
    </div>
  );
}

/**
 * Command over the page: a dialog holding the palette, opened and closed with
 * Ctrl+K or Cmd+K (shortcut) or by your own button. Focus goes to the input,
 * Tab is trapped, Esc and the scrim close it, and running a command closes it.
 */
export function CommandDialog({ open, onOpenChange, shortcut = true, inline, onSelect, ...rest }: CommandDialogProps) {
  const present = usePresence(open);
  const panelRef = useRef<HTMLDivElement>(null);
  const { onKeyDown } = useDialogBehaviour({ open: open && !inline, panelRef, onEscape: () => onOpenChange(false), enabled: !inline });

  useEffect(() => {
    if (!shortcut || inline) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shortcut, inline, open, onOpenChange]);

  const panel = (
    <div data-slot="command-dialog"
      ref={panelRef}
      role="dialog"
      aria-modal={inline ? undefined : true}
      aria-label={rest.label ?? "Command palette"}
      tabIndex={-1}
      className={cx(styles.dialog, inline && styles.inline)}
      onKeyDown={onKeyDown}
    >
      <Command
        {...rest}
        autoFocus={!inline}
        onSelect={(item) => {
          onSelect?.(item);
          if (!inline) onOpenChange(false);
        }}
      />
    </div>
  );

  if (inline) return panel;
  if (!present) return null;
  return (
    <Portal>
      <div className={styles.root} data-state={open ? "open" : "closed"}>
        <div className={styles.scrim} aria-hidden="true" onClick={() => onOpenChange(false)} />
        {panel}
      </div>
    </Portal>
  );
}
