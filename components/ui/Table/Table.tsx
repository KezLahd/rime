import type { CSSProperties, ReactNode } from "react";
import { cx } from "../_internal/cx";
import { IconChevronDown, IconChevronLeft, IconChevronRight, IconChevronUp, IconChevronsUpDown } from "../Icon/Icon";
import { Skeleton } from "../Skeleton/Skeleton";
import styles from "./Table.module.css";

export type SortDirection = "asc" | "desc";
export type SortState = { key: string; direction: SortDirection } | null;

export type Column<T> = {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  width?: number | string;
  /** Drop the column on narrow screens. */
  hideBelow?: "sm" | "md";
  /** Monospace cell: references, ID numbers. */
  mono?: boolean;
  /** Skeleton bar width for this column while loading, e.g. "60%". */
  skeletonWidth?: string;
  /**
   * Shrink the column to its content (a row action, an icon). On by default
   * for a column keyed "actions"; every other column shares the rest.
   */
  shrink?: boolean;
};

export type TableProps<T> = {
  columns: ReadonlyArray<Column<T>>;
  rows: ReadonlyArray<T>;
  rowKey: (row: T) => string;
  /** Screen-reader caption. Required: a table needs a name. */
  caption: string;
  sort?: SortState;
  /** Header click: asc first, then toggles. Sort the rows yourself. */
  onSortChange?: (sort: SortState) => void;
  loading?: boolean;
  skeletonRows?: number;
  /** Shown when not loading and rows is empty. Pass an <EmptyState compact />. */
  empty?: ReactNode;
  /** Replaces the body when the load failed. Pass an <Alert> with a retry. */
  error?: ReactNode;
  /**
   * glass = rows fall through to the frosted panel (no wrapper background).
   * white = the reference white inset table, for dense lists.
   */
  appearance?: "glass" | "white";
  /** Marks a row, e.g. the one just edited. */
  isRowHighlighted?: (row: T) => boolean;
  className?: string;
};

/**
 * Presentational table: sorting and paging state live with the caller. A
 * sortable header is the whole cell, edge to edge: the button fills the th,
 * so hover, press and focus light the full cell, never a pill inside it
 *. The sort chevron always holds its slot so labels
 * never shift. Rows are not clickable; put a link in the identifying cell so
 * keyboard users get it too.
 */
export function Table<T>({
  columns,
  rows,
  rowKey,
  caption,
  sort = null,
  onSortChange,
  loading,
  skeletonRows = 5,
  empty,
  error,
  appearance = "glass",
  isRowHighlighted,
  className,
}: TableProps<T>) {
  // Header labels stay in the body face; only a mono column's cells are mono.
  const colCls = (c: Column<T>, head = false) =>
    cx(
      (c.shrink ?? c.key === "actions") && styles.shrink,
      c.align === "right" && styles.right,
      c.align === "center" && styles.center,
      c.hideBelow === "sm" && styles.hideSm,
      c.hideBelow === "md" && styles.hideMd,
      !head && c.mono && styles.mono,
    );

  const nextSort = (key: string): SortState =>
    sort?.key === key ? { key, direction: sort.direction === "asc" ? "desc" : "asc" } : { key, direction: "asc" };

  const body = () => {
    if (error) {
      return (
        <tr>
          <td colSpan={columns.length} className={styles.slot}>
            {error}
          </td>
        </tr>
      );
    }
    if (loading) {
      return Array.from({ length: skeletonRows }, (_, r) => (
        <tr key={`sk-${r}`} className={styles.skeletonRow}>
          {columns.map((c, i) => (
            <td key={c.key} className={colCls(c)}>
              <Skeleton
                variant="text"
                height={10}
                width={c.skeletonWidth ?? `${[72, 48, 60, 40, 56][(r + i) % 5]}%`}
                style={c.align === "right" ? { marginLeft: "auto" } : undefined}
              />
            </td>
          ))}
        </tr>
      ));
    }
    if (rows.length === 0) {
      return (
        <tr>
          <td colSpan={columns.length} className={styles.slot}>
            {empty}
          </td>
        </tr>
      );
    }
    return rows.map((row) => (
      <tr key={rowKey(row)} className={cx(isRowHighlighted?.(row) && styles.highlighted)}>
        {columns.map((c) => (
          <td key={c.key} className={colCls(c)}>
            {c.cell(row)}
          </td>
        ))}
      </tr>
    ));
  };

  return (
    <div data-slot="table" className={cx(styles.wrap, styles[appearance], className)}>
      <table className={styles.table} aria-busy={loading || undefined}>
        <caption className="sr-only">
          {caption}
          {loading ? " (loading)" : ""}
        </caption>
        <thead>
          <tr>
            {columns.map((c) => {
              const active = sort?.key === c.key;
              const ariaSort = active ? (sort!.direction === "asc" ? "ascending" : "descending") : c.sortable ? "none" : undefined;
              const style: CSSProperties | undefined = c.width !== undefined ? { width: c.width } : undefined;
              const sortable = Boolean(c.sortable && onSortChange);
              return (
                <th
                  key={c.key}
                  scope="col"
                  aria-sort={ariaSort}
                  className={cx(colCls(c, true), sortable && styles.sortable, active && styles.sorted)}
                  style={style}
                >
                  {sortable ? (
                    <button type="button" className={styles.sortButton} onClick={() => onSortChange?.(nextSort(c.key))}>
                      <span>{c.header}</span>
                      <span className={styles.sortIcon} aria-hidden="true">
                        {active ? (
                          sort!.direction === "asc" ? <IconChevronUp size={12} strokeWidth={2.4} /> : <IconChevronDown size={12} strokeWidth={2.4} />
                        ) : (
                          <IconChevronsUpDown size={12} strokeWidth={2.2} />
                        )}
                      </span>
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>{body()}</tbody>
      </table>
    </div>
  );
}

export type PaginationProps = {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  /** Plural noun for the summary: "customers", "requests". */
  itemLabel?: string;
  className?: string;
};

function pageList(page: number, count: number): Array<number | "gap"> {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const set = new Set([1, count, page - 1, page, page + 1].filter((p) => p >= 1 && p <= count));
  const sorted = [...set].sort((a, b) => a - b);
  const out: Array<number | "gap"> = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

/**
 * Centred under the table: the page buttons sit on the
 * table's centre line and the "Showing 1 to 10 of 30" summary at the left. A
 * three-column grid (1fr auto 1fr) keeps the buttons centred whatever the
 * summary's length.
 */
export function Pagination({ page, pageCount, onPageChange, totalItems, pageSize, itemLabel = "results", className }: PaginationProps) {
  if (pageCount <= 1 && totalItems === undefined) return null;
  const from = totalItems !== undefined && pageSize ? (page - 1) * pageSize + 1 : undefined;
  const to = totalItems !== undefined && pageSize ? Math.min(page * pageSize, totalItems) : undefined;

  return (
    <nav data-slot="pagination" className={cx(styles.pagination, className)} aria-label="Pagination">
      <p className={styles.summary} aria-live="polite">
        {totalItems === 0
          ? `No ${itemLabel}`
          : from !== undefined
            ? `Showing ${from} to ${to} of ${totalItems} ${itemLabel}`
            : `Page ${page} of ${pageCount}`}
      </p>
      {pageCount > 1 ? (
        <div className={styles.pages}>
          <button
            type="button"
            className={styles.pageNav}
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            <IconChevronLeft size={14} />
          </button>
          {pageList(page, pageCount).map((p, i) =>
            p === "gap" ? (
              <span key={`gap-${i}`} className={styles.gap} aria-hidden="true">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                className={cx(styles.page, p === page && styles.pageActive)}
                onClick={() => onPageChange(p)}
                aria-label={`Page ${p}`}
                aria-current={p === page ? "page" : undefined}
              >
                {p}
              </button>
            ),
          )}
          <button
            type="button"
            className={styles.pageNav}
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pageCount}
            aria-label="Next page"
          >
            <IconChevronRight size={14} />
          </button>
        </div>
      ) : null}
    </nav>
  );
}
