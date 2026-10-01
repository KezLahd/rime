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
import { IconAlertCircle, IconArrowRight, IconClock, IconRefresh, IconSearch } from "../Icon/Icon";
import { SearchField } from "../SearchField/SearchField";
import { Skeleton } from "../Skeleton/Skeleton";
import { highlightTokens, smartTokens } from "./smart-match";
import styles from "./SmartSearch.module.css";

export type SmartSearchResult = {
  id: string;
  /** Main line. The query's words are marked in it. */
  title: string;
  /** Second line: reference, date, team. Marked too, since people search by these. */
  subtitle?: string;
  /** Right-hand detail, usually a small StatusPill. */
  meta?: ReactNode;
  /** Where the result goes. Rows with an href are real links (Ctrl-click opens a tab). */
  href?: string;
  /** 14px icon, or two-letter initials, shown in the row's tile. */
  icon?: ReactNode;
  /** Muted trailing word ("Customer", "Seat 14"). Swapped for an Enter key when the row is highlighted. */
  hint?: string;
};

export type SmartSearchGroup = {
  id: string;
  /** "Customers", "Team members", "Projects", "Pages". Groups with no results are left out. */
  label: string;
  results: SmartSearchResult[];
  /** Every match, when results holds only the first few. The heading then reads "5 of 12". */
  total?: number;
};

export type SmartSearchSelectContext = { group: SmartSearchGroup; query: string };

export type SmartSearchResultState = {
  active: boolean;
  group: SmartSearchGroup;
  /** Marks the query's words in any text, as the default row does. */
  highlight: (text: string) => ReactNode;
};

export type SmartSearchProps = {
  /**
   * Runs the search. Called once typing pauses, with a signal that aborts
   * when the query changes, so a slow answer to "ha" never lands on top of
   * "cooper". Reject (anything but an AbortError) to show the error state.
   */
  search: (query: string, signal: AbortSignal) => Promise<SmartSearchGroup[]>;
  /**
   * A result was chosen (Enter or click). The host records it in recent
   * searches. Return false to stay put; otherwise a result with an href is
   * navigated to.
   */
  onSelect: (result: SmartSearchResult, context: SmartSearchSelectContext) => boolean | void;
  /** "View all results": the footer row, and Enter with no row highlighted. Omit to leave both out. */
  onViewAll?: (query: string) => void;
  /** Earlier queries, newest first. Offered while the field is focused and empty. */
  recent?: ReadonlyArray<string>;
  placeholder?: string;
  /** Characters before a search runs. Defaults to 2: one letter matches most of a database. */
  minChars?: number;
  /** Pause after the last keystroke before searching. */
  debounceMs?: number;
  /** Replaces the default row body (tile, text, meta, hint are all yours). */
  renderResult?: (result: SmartSearchResult, state: SmartSearchResultState) => ReactNode;
  /** Shown when focused and empty with no recent searches: say what can be searched for. */
  emptyHint?: ReactNode;
  /** Suggestion under "No results for …". */
  noResultsHint?: (query: string) => ReactNode;
  size?: "sm" | "md";
  /** Ctrl/⌘ + this letter focuses the field. Use once per page. */
  shortcut?: string;
  disabled?: boolean;
  id?: string;
  /** Needed unless a <Field> labels it. */
  "aria-label"?: string;
  className?: string;
};

type Outcome = {
  /** The trimmed query these groups answer. */
  query: string;
  groups: SmartSearchGroup[] | null;
  failed: boolean;
};

type Option =
  | { kind: "recent"; key: string; text: string }
  | { kind: "result"; key: string; result: SmartSearchResult; group: SmartSearchGroup }
  | { kind: "all"; key: string };

const NO_OUTCOME: Outcome = { query: "", groups: null, failed: false };

// Row widths for the loading skeleton: uneven, as real names and references are.
const SKELETON_ROWS = [
  { title: "46%", subtitle: "62%", meta: 64 },
  { title: "58%", subtitle: "40%", meta: 76 },
  { title: "38%", subtitle: "54%", meta: 58 },
];

/**
 * Search with results as you type. A search field whose results panel opens
 * under it once typing pauses: grouped by kind with counts, each row a tile,
 * the matched text marked, a status and a hint. Matching follows a production
 * records dashboard (smart-match.tsx); the panel follows NavSearch.
 *
 * Combobox with a listbox popup (WAI-ARIA APG, list autocomplete without
 * automatic selection): focus stays in the input and ↓/↑ move a highlight
 * (aria-activedescendant), wrapping. Enter opens the highlighted row, or
 * views all results when none is highlighted. Esc closes the panel; a second
 * Esc clears the field. Tab closes and moves on.
 *
 * States: recent searches (or a hint) when empty, "keep typing" below
 * minChars, skeleton rows on the first search, the previous results held
 * (faded, busy) while a newer query runs, no results with a suggestion, and
 * a retryable error.
 */
export function SmartSearch({
  search,
  onSelect,
  onViewAll,
  recent,
  placeholder = "Search",
  minChars = 2,
  debounceMs = 180,
  renderResult,
  emptyHint,
  noResultsHint,
  size = "md",
  shortcut,
  disabled,
  id,
  "aria-label": ariaLabel,
  className,
}: SmartSearchProps) {
  const router = useRouter();
  const autoId = useId();
  const listId = `smartsearch-${autoId}-list`;
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [outcome, setOutcome] = useState<Outcome>(NO_OUTCOME);
  const [attempt, setAttempt] = useState(0);
  const anchorRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // The latest search function, so an inline prop doesn't restart the query.
  const searchRef = useRef(search);
  useEffect(() => {
    searchRef.current = search;
  });

  const q = query.trim();
  const eligible = q.length >= minChars;

  useEffect(() => {
    if (!eligible || disabled) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      searchRef.current(q, controller.signal).then(
        (groups) => {
          if (controller.signal.aborted) return;
          setOutcome({ query: q, groups, failed: false });
          setActive(-1);
        },
        () => {
          if (controller.signal.aborted) return;
          setOutcome({ query: q, groups: null, failed: true });
          setActive(-1);
        },
      );
    }, debounceMs);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [q, eligible, disabled, debounceMs, attempt]);

  const settled = eligible && outcome.query === q && (outcome.groups !== null || outcome.failed);
  const loading = eligible && !settled;
  const groups = useMemo(
    () => (outcome.groups ?? []).filter((g) => g.results.length > 0),
    [outcome.groups],
  );
  // While a newer query runs, the last answer stays up (faded) rather than
  // flashing to skeletons on every keystroke. Only a real list is held.
  const holding = loading && !outcome.failed && groups.length > 0;
  const tokens = useMemo(() => smartTokens(outcome.query), [outcome.query]);

  type Mode = "recent" | "hint" | "short" | "skeleton" | "results" | "none" | "error";
  const mode: Mode = !eligible
    ? q.length === 0
      ? recent?.length
        ? "recent"
        : "hint"
      : "short"
    : settled
      ? outcome.failed
        ? "error"
        : groups.length
          ? "results"
          : "none"
      : holding
        ? "results"
        : "skeleton";

  const options = useMemo<Option[]>(() => {
    if (mode === "recent") return (recent ?? []).map((text, i) => ({ kind: "recent", key: `recent-${i}`, text }));
    if (mode !== "results") return [];
    const out: Option[] = [];
    for (const group of groups) {
      for (const result of group.results) out.push({ kind: "result", key: `${group.id}-${result.id}`, result, group });
    }
    if (onViewAll) out.push({ kind: "all", key: "all" });
    return out;
  }, [mode, recent, groups, onViewAll]);

  const safeActive = active < options.length ? active : -1;
  const optionId = (key: string) => `${listId}-${key}`;

  const close = () => {
    setOpen(false);
    setActive(-1);
  };

  const retry = () => {
    // Forget the failure so the state reads as loading, and run again.
    setOutcome(NO_OUTCOME);
    setAttempt((n) => n + 1);
  };

  const choose = (option: Option) => {
    if (option.kind === "recent") {
      setQuery(option.text);
      setActive(-1);
      return;
    }
    if (option.kind === "all") {
      onViewAll?.(q);
      close();
      return;
    }
    const proceed = onSelect(option.result, { group: option.group, query: outcome.query }) !== false;
    close();
    if (proceed && option.result.href) router.push(option.result.href);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const n = options.length;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) return setOpen(true);
        if (n) setActive(safeActive + 1 >= n ? 0 : safeActive + 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!open) return setOpen(true);
        if (n) setActive(safeActive <= 0 ? n - 1 : safeActive - 1);
        break;
      case "Enter":
        if (open && safeActive >= 0) {
          e.preventDefault();
          choose(options[safeActive]);
        } else if (mode === "error") {
          e.preventDefault();
          retry();
        } else if (eligible && onViewAll) {
          e.preventDefault();
          onViewAll(q);
          close();
        }
        break;
      case "Escape":
        // Open: close and stop, so an enclosing modal stays up. Closed: let
        // SearchField clear the text.
        if (open) {
          e.preventDefault();
          e.stopPropagation();
          close();
        }
        break;
      case "Tab":
        if (open) close();
        break;
    }
  };

  // Under the field, at its width (never narrower than a readable row), and
  // re-placed as the panel's content changes height, so it flips above the
  // field when it would run off the bottom of the window.
  useLayoutEffect(() => {
    if (!open) return;
    const anchor = anchorRef.current;
    const panel = panelRef.current;
    if (!anchor || !panel) return;
    const place = () => {
      panel.style.width = `${Math.max(anchor.offsetWidth, 340)}px`;
      placePopup(anchor, panel, { offset: 6 });
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(panel);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (anchorRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
      setActive(-1);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open || safeActive < 0) return;
    panelRef.current?.querySelector<HTMLElement>(`[data-row="${safeActive}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, safeActive]);

  const onRowClick = (e: MouseEvent<HTMLElement>, option: Option) => {
    // New tab or window: the browser has it, and the panel stays.
    if (option.kind === "result" && option.result.href && (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0)) return;
    e.preventDefault();
    choose(option);
  };

  const highlight = (text: string) => highlightTokens(text, tokens, styles.match);
  const indexOf = (key: string) => options.findIndex((o) => o.key === key);

  const rowProps = (option: Option, index: number) => ({
    id: optionId(option.key),
    role: "option" as const,
    "aria-selected": index === safeActive,
    tabIndex: -1,
    "data-row": index,
    onMouseMove: () => {
      if (index !== safeActive) setActive(index);
    },
    onClick: (e: MouseEvent<HTMLElement>) => onRowClick(e, option),
  });

  const renderRow = (option: Extract<Option, { kind: "result" }>) => {
    const index = indexOf(option.key);
    const isActive = index === safeActive;
    const { result, group } = option;
    const body = renderResult ? (
      renderResult(result, { active: isActive, group, highlight })
    ) : (
      <>
        <span className={styles.tile} aria-hidden="true">
          {result.icon ?? <IconSearch size={14} />}
        </span>
        <span className={styles.text}>
          <span className={styles.title}>{highlight(result.title)}</span>
          {result.subtitle ? <span className={styles.subtitle}>{highlight(result.subtitle)}</span> : null}
        </span>
        {result.meta ? <span className={styles.meta}>{result.meta}</span> : null}
        <span className={styles.trail} aria-hidden="true">
          {isActive ? <kbd className={styles.enterKey}>Enter</kbd> : result.hint}
        </span>
      </>
    );
    const className = cx(styles.option, isActive && styles.optionActive);
    return result.href ? (
      <Link key={option.key} href={result.href} prefetch={false} className={className} {...rowProps(option, index)}>
        {body}
      </Link>
    ) : (
      <div key={option.key} className={className} {...rowProps(option, index)}>
        {body}
      </div>
    );
  };

  const countLabel = (g: SmartSearchGroup) =>
    g.total !== undefined && g.total > g.results.length ? `${g.results.length} of ${g.total}` : String(g.results.length);

  const resultCount = groups.reduce((n, g) => n + (g.total ?? g.results.length), 0);
  const announcement =
    mode === "results" && settled
      ? `${resultCount} ${resultCount === 1 ? "result" : "results"}`
      : mode === "none"
        ? `No results for ${q}`
        : mode === "error"
          ? "Search didn't finish. Press Enter to try again."
          : "";

  const renderBody = () => {
    switch (mode) {
      case "recent":
        return (
          <div role="group" aria-labelledby={`${listId}-recent`} className={styles.group}>
            <div id={`${listId}-recent`} role="presentation" className={styles.groupHead}>
              <span className={styles.groupLabel}>Recent searches</span>
            </div>
            {options.map((option, index) =>
              option.kind === "recent" ? (
                <div
                  key={option.key}
                  className={cx(styles.option, styles.recent, index === safeActive && styles.optionActive)}
                  {...rowProps(option, index)}
                >
                  <IconClock size={14} className={styles.recentIcon} aria-hidden="true" />
                  <span className={styles.recentText}>{option.text}</span>
                  <IconArrowRight size={13} className={styles.recentGo} aria-hidden="true" />
                </div>
              ) : null,
            )}
          </div>
        );
      case "hint":
        return (
          <div className={styles.message} role="presentation">
            <p className={styles.messageTitle}>Start typing to search</p>
            {emptyHint ? <p className={styles.messageHint}>{emptyHint}</p> : null}
          </div>
        );
      case "short":
        return (
          <div className={styles.message} role="presentation">
            <p className={styles.messageTitle}>Keep typing</p>
            <p className={styles.messageHint}>
              Searches start at {minChars} characters, so the list is short enough to scan.
            </p>
          </div>
        );
      case "skeleton":
        return (
          <div className={styles.group} role="presentation" aria-hidden="true">
            <div className={styles.groupHead}>
              <Skeleton width={72} height={9} />
            </div>
            {SKELETON_ROWS.map((row, i) => (
              <div key={i} className={cx(styles.option, styles.skeletonRow)}>
                <Skeleton width={32} height={32} className={styles.skeletonTile} />
                <span className={styles.text}>
                  <Skeleton width={row.title} height={11} />
                  <Skeleton width={row.subtitle} height={9} />
                </span>
                <Skeleton width={row.meta} height={20} radius="var(--r-full)" />
              </div>
            ))}
          </div>
        );
      case "none":
        return (
          <div className={styles.message} role="presentation">
            <p className={styles.messageTitle}>No results for &ldquo;{q}&rdquo;</p>
            <p className={styles.messageHint}>
              {noResultsHint ? noResultsHint(q) : "Check the spelling, or try fewer or shorter words."}
            </p>
          </div>
        );
      case "error":
        return (
          <div className={cx(styles.message, styles.error)} role="presentation">
            <p className={styles.messageTitle}>
              <IconAlertCircle size={15} aria-hidden="true" />
              Search didn&rsquo;t finish
            </p>
            <p className={styles.messageHint}>Check your connection, then try again. Nothing you typed is lost.</p>
            <button type="button" className={styles.retry} onClick={retry}>
              <IconRefresh size={13} aria-hidden="true" />
              Try again
            </button>
          </div>
        );
      case "results":
        return (
          <>
            {groups.map((group) => {
              const headingId = `${listId}-g-${group.id}`;
              return (
                <div key={group.id} role="group" aria-labelledby={headingId} className={styles.group}>
                  <div id={headingId} role="presentation" className={styles.groupHead}>
                    <span className={styles.groupLabel}>{group.label}</span>
                    <span className={styles.groupCount}>{countLabel(group)}</span>
                  </div>
                  {options.map((option) =>
                    option.kind === "result" && option.group.id === group.id ? renderRow(option) : null,
                  )}
                </div>
              );
            })}
            {options.map((option, index) =>
              option.kind === "all" ? (
                <div
                  key={option.key}
                  className={cx(styles.option, styles.viewAll, index === safeActive && styles.optionActive)}
                  {...rowProps(option, index)}
                >
                  <IconSearch size={14} aria-hidden="true" />
                  <span className={styles.viewAllText}>
                    View all results for <strong>&ldquo;{holding ? outcome.query : q}&rdquo;</strong>
                  </span>
                  <IconArrowRight size={13} className={styles.viewAllGo} aria-hidden="true" />
                </div>
              ) : null,
            )}
          </>
        );
    }
  };

  return (
    <div data-slot="smart-search" className={cx(styles.root, className)}>
      <div ref={anchorRef}>
        <SearchField
          id={id}
          size={size}
          value={query}
          placeholder={placeholder}
          disabled={disabled}
          shortcut={shortcut}
          loading={loading}
          loadingLabel="Searching…"
          role="combobox"
          aria-label={ariaLabel}
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={open && safeActive >= 0 ? optionId(options[safeActive].key) : undefined}
          onValueChange={(v) => {
            setQuery(v);
            setActive(-1);
            // Esc's clear leaves the panel shut; typing opens it.
            if (v) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onClick={() => {
            if (!open) setOpen(true);
          }}
          onBlur={() => {
            // Rows keep focus off themselves (mousedown is prevented), so a
            // real blur means focus has left the control.
            if (open) close();
          }}
          onKeyDown={onKeyDown}
        />
      </div>

      <span className="sr-only" role="status" aria-live="polite">
        {open ? announcement : ""}
      </span>

      {open && !disabled ? (
        <Portal>
          <div
            ref={panelRef}
            className={cx(styles.panel, size === "sm" && styles.panelSm)}
            onMouseDown={(e) => e.preventDefault()}
          >
            <div
              id={listId}
              role="listbox"
              aria-label={ariaLabel ?? "Search results"}
              aria-busy={loading || undefined}
              className={cx(styles.list, holding && styles.holding)}
            >
              {renderBody()}
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
          </div>
        </Portal>
      ) : null}
    </div>
  );
}
