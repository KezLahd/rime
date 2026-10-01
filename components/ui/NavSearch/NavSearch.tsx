"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { cx } from "../_internal/cx";
import { Portal } from "../_internal/portal";
import { placePopup } from "../_internal/position";
import { IconChevronRight, IconSearch } from "../Icon/Icon";
import { highlightMatches, matchesQuery, queryWords } from "../SearchField/match";
import { useGlobalShortcut, useShortcutLabel } from "../SearchField/shortcut";
import styles from "./NavSearch.module.css";

export type NavSearchItem = {
  id: string;
  label: string;
  href: string;
  /** Heading the item lists under ("Pages", "Actions", "Settings"). Groups keep first-seen order. */
  group: string;
  /** 14px icon, shown in the item's tile. */
  icon?: ReactNode;
  /** One line under the label. Searched too. */
  description?: string;
  /** Extra words that find the item ("add", "new" for "Create a customer"). */
  keywords?: ReadonlyArray<string>;
};

export type NavSearchProps = {
  items: ReadonlyArray<NavSearchItem>;
  /**
   * Ids of recently opened items, newest first. Listed under "Recent" above
   * everything else while the search is empty. The host keeps the list
   * (from onSelect), so it can live wherever the rest of the session does.
   */
  recent?: ReadonlyArray<string>;
  /**
   * Runs before navigating. Return false to stay put (the styleguide does,
   * and a host can to open a dialog instead).
   */
  onSelect?: (item: NavSearchItem) => boolean | void;
  placeholder?: string;
  /** Ctrl/⌘ + this letter opens the search from anywhere. Pass null to turn it off. */
  shortcut?: string | null;
  /** Width of the bar, and the least width of its results. */
  width?: number | string;
  /** Names the search for assistive tech. */
  "aria-label"?: string;
  className?: string;
  /**
   * Show the results panel open, in place under the bar: no portal, no
   * outside-click listener, no scrolling into view. For docs and thumbnails.
   */
  inline?: boolean;
};

type Row = { key: string; item: NavSearchItem; group: string };

/**
 * The top bar's page and action finder, after the reference nav-search: a
 * frosted bar that, when focused, grows a solid results panel flush beneath
 * it, grouped, each row with an icon tile that fills with the brand gradient
 * as it is highlighted.
 *
 * Combobox with a listbox popup (WAI-ARIA APG): focus stays in the input, the
 * highlighted row is aria-activedescendant. Ctrl/⌘+K focuses it from
 * anywhere; ↑↓ move (wrapping); Enter opens; Esc closes and, if the shortcut
 * opened it, puts focus back where it was. Rows are real links, so
 * Ctrl-click and middle-click open a new tab as a link should.
 */
export function NavSearch({
  items,
  recent,
  onSelect,
  placeholder = "Search pages and actions",
  shortcut = "k",
  width = 340,
  "aria-label": ariaLabel = "Search pages and actions",
  className,
  inline = false,
}: NavSearchProps) {
  const router = useRouter();
  const autoId = useId();
  const listId = `navsearch-${autoId}-list`;
  const [openState, setOpen] = useState(false);
  const open = inline || openState;
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // Where focus was when the shortcut pulled it here, to hand it back on Esc.
  const returnTo = useRef<HTMLElement | null>(null);
  const shortcutLabel = useShortcutLabel(shortcut ?? undefined);

  const words = useMemo(() => queryWords(query), [query]);

  const rows = useMemo<Row[]>(() => {
    const out: Row[] = [];
    if (words.length === 0 && recent?.length) {
      for (const id of recent) {
        const item = items.find((i) => i.id === id);
        if (item) out.push({ key: `recent-${item.id}`, item, group: "Recent" });
      }
    }
    const order: string[] = [];
    const byGroup = new Map<string, NavSearchItem[]>();
    for (const item of items) {
      if (!matchesQuery(words, item.label, item.description, item.group, ...(item.keywords ?? []))) continue;
      if (!byGroup.has(item.group)) {
        byGroup.set(item.group, []);
        order.push(item.group);
      }
      byGroup.get(item.group)!.push(item);
    }
    for (const g of order) for (const item of byGroup.get(g)!) out.push({ key: item.id, item, group: g });
    return out;
  }, [items, recent, words]);

  const safeActive = rows.length ? Math.min(active, rows.length - 1) : -1;
  const optionId = (key: string) => `${listId}-${key}`;

  const openPanel = () => {
    setActive(0);
    setOpen(true);
  };

  const close = (restore: boolean) => {
    setOpen(false);
    setQuery("");
    const back = returnTo.current;
    returnTo.current = null;
    if (restore && back && back.isConnected) back.focus();
  };

  useGlobalShortcut(shortcut ?? undefined, () => {
    const current = document.activeElement as HTMLElement | null;
    if (current !== inputRef.current) returnTo.current = current;
    inputRef.current?.focus();
    inputRef.current?.select();
    openPanel();
  });

  const go = (item: NavSearchItem) => {
    const proceed = onSelect?.(item) !== false;
    close(false);
    inputRef.current?.blur();
    if (proceed) router.push(item.href);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) return openPanel();
        if (rows.length) setActive((safeActive + 1) % rows.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!open) return openPanel();
        if (rows.length) setActive((safeActive - 1 + rows.length) % rows.length);
        break;
      case "Enter":
        if (!open || safeActive < 0) return;
        e.preventDefault();
        go(rows[safeActive].item);
        break;
      case "Escape":
        if (!open) {
          if (query) setQuery("");
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        close(true);
        break;
      case "Tab":
        if (open) close(false);
        break;
    }
  };

  // Attach flush under the bar, at its width (or wider on a narrow bar), and
  // follow it through scroll and resize.
  useLayoutEffect(() => {
    if (!open || inline) return;
    const bar = barRef.current;
    const panel = panelRef.current;
    if (!bar || !panel) return;
    const place = () => {
      panel.style.width = `${Math.max(bar.offsetWidth, 300)}px`;
      placePopup(bar, panel, { offset: 0, side: "bottom" });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, inline, rows.length]);

  // Click away closes; the bar and the panel are one control.
  useEffect(() => {
    if (!open || inline) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (barRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      returnTo.current = null;
      setOpen(false);
      setQuery("");
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, inline]);

  useEffect(() => {
    if (!open || inline || safeActive < 0) return;
    panelRef.current?.querySelector<HTMLElement>(`[data-row="${safeActive}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, inline, safeActive]);

  const onRowClick = (e: MouseEvent<HTMLAnchorElement>, item: NavSearchItem) => {
    // New tab or window: let the browser have it and keep the panel.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    go(item);
  };

  // Rows rendered in group blocks; a row's position in `rows` is its index.
  const blocks: Array<{ group: string; start: number; rows: Row[] }> = [];
  rows.forEach((row, i) => {
    const last = blocks[blocks.length - 1];
    if (last && last.group === row.group) last.rows.push(row);
    else blocks.push({ group: row.group, start: i, rows: [row] });
  });

  const count = rows.length;

  const panel = (
      <div ref={panelRef} className={cx(styles.panel, inline && styles.panelInline)} onMouseDown={(e) => e.preventDefault()}>
        <div id={listId} role="listbox" aria-label={ariaLabel} className={styles.list}>
          {count === 0 ? (
            <div className={styles.empty} role="presentation">
              {items.length === 0 ? (
                <>
                  <p className={styles.emptyTitle}>Nothing to search yet</p>
                  <p className={styles.emptyHint}>Pages you can open will be listed here.</p>
                </>
              ) : (
                <>
                  <p className={styles.emptyTitle}>No pages or actions match &ldquo;{query.trim()}&rdquo;</p>
                  <p className={styles.emptyHint}>Try a page name, such as Customers or Orders, or a shorter word.</p>
                </>
              )}
            </div>
          ) : (
            blocks.map((block) => {
              const headingId = `${listId}-g-${block.start}`;
              return (
                <div key={`${block.group}-${block.start}`} role="group" aria-labelledby={headingId} className={styles.group}>
                  <div id={headingId} role="presentation" className={styles.groupLabel}>
                    {block.group}
                  </div>
                  {block.rows.map((row, j) => {
                    const index = block.start + j;
                    const isActive = index === safeActive;
                    return (
                      <Link
                        key={row.key}
                        id={optionId(row.key)}
                        href={row.item.href}
                        role="option"
                        // A palette opening would otherwise prefetch every
                        // page in it at once; Enter and click push directly.
                        prefetch={false}
                        aria-selected={isActive}
                        tabIndex={-1}
                        data-row={index}
                        className={cx(styles.option, isActive && styles.optionActive)}
                        onMouseMove={() => {
                          if (!isActive) setActive(index);
                        }}
                        onClick={(e) => onRowClick(e, row.item)}
                      >
                        <span className={styles.tile} aria-hidden="true">
                          {row.item.icon ?? <IconChevronRight size={14} />}
                        </span>
                        <span className={styles.text}>
                          <span className={styles.label}>{highlightMatches(row.item.label, words, styles.match)}</span>
                          {row.item.description ? <span className={styles.description}>{row.item.description}</span> : null}
                        </span>
                        <IconChevronRight size={13} className={styles.go} aria-hidden="true" />
                      </Link>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
        <div className={styles.footer} aria-hidden="true">
          <span>
            <kbd className={styles.footKey}>↑</kbd>
            <kbd className={styles.footKey}>↓</kbd> to move
          </span>
          <span>
            <kbd className={styles.footKey}>Enter</kbd> to open
          </span>
          <span>
            <kbd className={styles.footKey}>Esc</kbd> to close
          </span>
        </div>
        <span className="sr-only" role="status">
          {words.length === 0 ? "" : count === 0 ? "No results" : `${count} ${count === 1 ? "result" : "results"}`}
        </span>
      </div>
  );

  return (
    <div data-slot="nav-search" className={cx(styles.root, className)} style={{ width }}>
      <div
        ref={barRef}
        className={cx(styles.bar, open && styles.barOpen)}
        onMouseDown={(e) => {
          // Anywhere on the bar puts the caret in the input.
          if (e.target !== inputRef.current) {
            e.preventDefault();
            inputRef.current?.focus();
            if (!open) openPanel();
          }
        }}
      >
        <IconSearch size={15} className={styles.icon} aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-label={ariaLabel}
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={open && safeActive >= 0 ? optionId(rows[safeActive].key) : undefined}
          aria-keyshortcuts={shortcut ? `Control+${shortcut.toUpperCase()} Meta+${shortcut.toUpperCase()}` : undefined}
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder}
          value={query}
          className={styles.input}
          onFocus={() => {
            if (!open) openPanel();
          }}
          onClick={() => {
            // Focused but closed (after Esc): a click opens it again.
            if (!open) openPanel();
          }}
          onBlur={() => {
            // Rows keep focus off themselves (mousedown is prevented), so a
            // real blur means focus has left the control.
            if (open) close(false);
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            if (!open) setOpen(true);
          }}
          onKeyDown={onKeyDown}
        />
        {open ? (
          <kbd className={styles.kbd} aria-hidden="true">
            Esc
          </kbd>
        ) : shortcutLabel ? (
          <kbd className={styles.kbd} aria-hidden="true">
            {shortcutLabel}
          </kbd>
        ) : null}
      </div>

      {open ? (inline ? panel : <Portal>{panel}</Portal>) : null}
    </div>
  );
}
