"use client";

import { useEffect, useId, useState, type ReactNode, type CSSProperties } from "react";
import { Button } from "@/components/ui/Button/Button";
import { IconAlertCircle, IconInbox, IconRefresh } from "@/components/ui/Icon/Icon";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import { SegmentedControl } from "@/components/ui/Tabs/Tabs";
import { cx } from "@/components/ui/_internal/cx";
import styles from "./Charts.module.css";
import type { ChartRow } from "./scale";

/**
 * ready      = draw it.
 * loading    = first load: a skeleton shaped like this chart.
 * refreshing = refetch: keep the last render at reduced opacity, no skeleton flash.
 * empty      = nothing to plot; say what will fill it.
 * error      = the query failed; say so and offer a retry.
 */
export type ChartStatus = "ready" | "loading" | "refreshing" | "empty" | "error";

export type SkeletonShape = "line" | "area" | "columns" | "bars" | "donut";

export type LegendItem = {
  key: string;
  label: string;
  color: string;
  /** Mirrors the mark: line for lines, rect for bars and areas. */
  shape: "line" | "rect" | "dot";
  value?: ReactNode;
};

export type TableColumn = {
  key: string;
  label: string;
  numeric?: boolean;
  format?: (value: ChartRow[string]) => string;
};

export type ChartTableSpec = {
  /** The row header column (dates, regions, stages). */
  rowHeader: TableColumn;
  columns: ReadonlyArray<TableColumn>;
  rows: ReadonlyArray<ChartRow>;
  /** Adds a totals row summing every numeric column. */
  totals?: boolean;
};

/** Props every chart takes: its caption, accessible summary and states. */
export type ChartBaseProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  /**
   * One or two sentences a screen reader hears in place of the picture:
   * what is plotted and the headline ("Weekly orders rose from 8 to 32").
   * Also set as the SVG's <desc>.
   */
  summary: string;
  /** Keeps the title for assistive tech but hides it, when a Group heading already says it. */
  hideTitle?: boolean;
  status?: ChartStatus;
  emptyTitle?: ReactNode;
  /** What to do next, or what will fill this. A bare "No data" is not an empty state. */
  emptyDescription?: ReactNode;
  emptyAction?: ReactNode;
  errorTitle?: ReactNode;
  errorDescription?: ReactNode;
  onRetry?: () => void;
  /** Controls placed beside the table toggle (a segmented control, a menu). */
  actions?: ReactNode;
  /** Plot height in px, x-axis band included. */
  height?: number;
  className?: string;
};

type Measure = { width: number; markRadius: number };

type ChartFrameProps = ChartBaseProps & {
  skeleton: SkeletonShape;
  legend?: ReadonlyArray<LegendItem>;
  table: ChartTableSpec;
  isEmpty: boolean;
  height: number;
  /** Height is a floor, not a size: content beside the plot may wrap below it (donut legend). */
  grow?: boolean;
  children: (measure: Measure) => ReactNode;
};

/**
 * The container every chart mounts in: caption, legend, the plot and its
 * table-view twin, and the loading, refreshing, empty and error states.
 *
 * The plot is measured, not guessed: nothing renders into it until a
 * ResizeObserver reports a width, so the server and first client render agree
 * (no hydration mismatch) and Recharts never sees a zero-size container. The
 * same read picks up --r-2xs, so bar ends are 4px in the portal and square in
 * any theme without its radius living in JS.
 */
export function ChartFrame({
  title,
  subtitle,
  summary,
  hideTitle,
  status = "ready",
  emptyTitle = "Nothing to chart yet",
  emptyDescription = "Figures appear here as soon as the first records for this period are in.",
  emptyAction,
  errorTitle = "This chart could not load",
  errorDescription = "The figures are safe; only this view failed. Try again, or refresh the page if it keeps happening.",
  onRetry,
  actions,
  className,
  skeleton,
  legend,
  table,
  isEmpty,
  height,
  grow,
  children,
}: ChartFrameProps) {
  const id = useId();
  const [showTable, setShowTable] = useState(false);
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const [measure, setMeasure] = useState<Measure>({ width: 0, markRadius: 4 });

  useEffect(() => {
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = Math.floor(entry.contentRect.width);
      const radius = parseFloat(getComputedStyle(node).getPropertyValue("--r-2xs"));
      setMeasure((m) => {
        const markRadius = Number.isFinite(radius) ? radius : 4;
        return m.width === width && m.markRadius === markRadius ? m : { width, markRadius };
      });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);

  const effective: ChartStatus = status === "ready" && isEmpty ? "empty" : status;
  const drawable = effective === "ready" || effective === "refreshing";
  const tableOn = showTable && drawable;

  let body: ReactNode;
  if (effective === "loading") {
    body = <ChartSkeleton shape={skeleton} />;
  } else if (effective === "error") {
    body = (
      <div className={cx(styles.state, styles.stateError)} role="alert">
        <span className={styles.stateIcon} aria-hidden="true">
          <IconAlertCircle size={17} />
        </span>
        <p className={styles.stateTitle}>{errorTitle}</p>
        <p className={styles.stateBody}>{errorDescription}</p>
        {onRetry ? (
          <div className={styles.stateAction}>
            <Button variant="secondary" size="sm" iconStart={<IconRefresh size={14} />} onClick={onRetry}>
              Try again
            </Button>
          </div>
        ) : null}
      </div>
    );
  } else if (effective === "empty") {
    body = (
      <>
        {skeleton === "donut" ? null : <span className={styles.ghostAxes} aria-hidden="true" />}
        <div className={cx(styles.state, styles.stateOver)}>
          <span className={styles.stateIcon} aria-hidden="true">
            <IconInbox size={17} />
          </span>
          <p className={styles.stateTitle}>{emptyTitle}</p>
          <p className={styles.stateBody}>{emptyDescription}</p>
          {emptyAction ? <div className={styles.stateAction}>{emptyAction}</div> : null}
        </div>
      </>
    );
  } else if (measure.width > 0) {
    body = children(measure);
  } else {
    // Unmeasured (server render, first paint): the chart's own silhouette.
    body = <ChartSkeleton shape={skeleton} />;
  }

  return (
    <figure
      className={cx(styles.tokens, styles.root, className)}
      aria-labelledby={`${id}-t`}
      aria-describedby={`${id}-s`}
      style={colorVars(legend)}
    >
      <div className={styles.head}>
        <figcaption className={cx(styles.caption, hideTitle && "sr-only")}>
          <span id={`${id}-t`} className={styles.title}>
            {title}
          </span>
          {subtitle ? <span className={styles.subtitle}>{subtitle}</span> : null}
        </figcaption>
        <div className={styles.headActions}>
          {actions}
          {/* A real two-way toggle: Chart | Table, the same
              control as the other view switches, not a button that relabels itself. */}
          {drawable ? (
            <SegmentedControl<"chart" | "table">
              size="sm"
              aria-label={`View ${typeof title === "string" ? title : "this chart"} as`}
              value={tableOn ? "table" : "chart"}
              onChange={(v) => setShowTable(v === "table")}
              options={[
                { value: "chart", label: "Chart" },
                { value: "table", label: "Table" },
              ]}
            />
          ) : null}
        </div>
      </div>
      <p id={`${id}-s`} className="sr-only">
        {summary}
      </p>

      {legend && legend.length > 1 && drawable && !tableOn ? <ChartLegend items={legend} /> : null}

      {tableOn ? (
        <ChartTable spec={table} caption={typeof title === "string" ? title : undefined} />
      ) : (
        <div
          ref={setNode}
          className={cx(styles.plot, effective === "refreshing" && styles.refreshing)}
          style={grow ? { minHeight: height } : { height }}
          aria-busy={effective === "loading" || effective === "refreshing" || undefined}
        >
          {effective === "loading" ? <span className="sr-only">Loading {typeof title === "string" ? title : "chart"}</span> : null}
          {body}
        </div>
      )}
    </figure>
  );
}

// ── Legend ───────────────────────────────────────────────────────────────

/** Always present for two or more series. Text wears ink; the key carries the colour. */
export function ChartLegend({ items, className }: { items: ReadonlyArray<LegendItem>; className?: string }) {
  return (
    <ul className={cx(styles.legend, className)}>
      {items.map((item) => (
        <li key={item.key} className={styles.legendItem}>
          <LegendKey color={item.color} shape={item.shape} />
          <span>{item.label}</span>
          {item.value !== undefined ? <span className={styles.legendValue}>{item.value}</span> : null}
        </li>
      ))}
    </ul>
  );
}

export function LegendKey({ color, shape }: { color: string; shape: LegendItem["shape"] }) {
  const cls = shape === "line" ? styles.keyLine : shape === "dot" ? styles.keyDot : styles.keyRect;
  return <span className={cls} style={{ background: color }} aria-hidden="true" />;
}

// ── Table view ───────────────────────────────────────────────────────────

function cell(column: TableColumn, value: ChartRow[string]): string {
  if (column.format) return column.format(value);
  if (typeof value === "number") return new Intl.NumberFormat("en-AU").format(value);
  return value === null || value === undefined ? "–" : String(value);
}

/** The chart's WCAG-clean twin: every value, no hover required. */
export function ChartTable({ spec, caption }: { spec: ChartTableSpec; caption?: string }) {
  const { rowHeader, columns, rows, totals } = spec;
  const sums = totals
    ? columns.map((c) => (c.numeric ? rows.reduce((n, r) => n + (typeof r[c.key] === "number" ? (r[c.key] as number) : 0), 0) : null))
    : null;
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr>
            <th scope="col">{rowHeader.label}</th>
            {columns.map((c) => (
              <th key={c.key} scope="col" className={c.numeric ? styles.num : undefined}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={`${String(row[rowHeader.key])}-${i}`}>
              <th scope="row">{cell(rowHeader, row[rowHeader.key])}</th>
              {columns.map((c) => (
                <td key={c.key} className={c.numeric ? styles.num : undefined}>
                  {cell(c, row[c.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {sums ? (
          <tfoot>
            <tr>
              <th scope="row">Total</th>
              {columns.map((c, i) => (
                <td key={c.key} className={c.numeric ? styles.num : undefined}>
                  {sums[i] === null ? "" : cell({ ...c, format: undefined }, sums[i])}
                </td>
              ))}
            </tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  );
}

// ── Skeletons: the chart's silhouette ────────────────────────────────────

const COLUMN_HEIGHTS = [38, 54, 47, 68, 60, 82, 74, 90];
const BAR_WIDTHS = [92, 78, 66, 54, 41, 30];

export function ChartSkeleton({ shape }: { shape: SkeletonShape }) {
  if (shape === "donut") {
    return (
      <div className={styles.skDonut} aria-hidden="true">
        <span className={styles.skRing} style={{ width: 150, height: 150 }} />
        <span className={styles.skLegend}>
          {[70, 56, 64].map((w) => (
            <Skeleton key={w} variant="text" height={11} width={`${w}%`} />
          ))}
        </span>
      </div>
    );
  }
  if (shape === "bars") {
    return (
      <div className={styles.skBarsH} aria-hidden="true">
        {BAR_WIDTHS.map((w, i) => (
          <span key={w} className={styles.skBarRowH}>
            <Skeleton variant="text" height={10} width={`${70 + ((i * 13) % 30)}%`} />
            <Skeleton height={14} width={`${w}%`} radius={4} />
          </span>
        ))}
      </div>
    );
  }
  return (
    <div className={styles.skeleton} aria-hidden="true">
      <span className={styles.skYTicks}>
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="text" height={8} width={i === 4 ? 8 : 20} />
        ))}
      </span>
      <span className={styles.skPlot}>
        {shape === "columns" ? (
          COLUMN_HEIGHTS.map((h, i) => <Skeleton key={i} width={20} height={`${h}%`} radius={4} />)
        ) : (
          <svg className={styles.skLine} viewBox="0 0 100 100" preserveAspectRatio="none">
            {shape === "area" ? <path className={styles.skArea} d="M0 92 C 18 84, 30 70, 48 58 S 78 26, 100 12 L 100 100 L 0 100 Z" /> : null}
            <path
              d={
                shape === "area"
                  ? "M0 92 C 18 84, 30 70, 48 58 S 78 26, 100 12"
                  : "M0 78 C 10 70, 18 64, 28 66 S 44 50, 56 52 S 74 30, 84 36 S 96 22, 100 20"
              }
            />
          </svg>
        )}
      </span>
      <span className={styles.skXTicks}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} variant="text" height={8} width={28} />
        ))}
      </span>
    </div>
  );
}

/**
 * Carries the chart tokens for a chart piece rendered on its own (a tooltip
 * or legend specimen) outside a chart root.
 */
export function ChartScope({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx(styles.tokens, className)}>{children}</div>;
}

/**
 * --color-<key> for each series, on the chart root, as shadcn's
 * ChartContainer does: custom marks added inside a high-level chart can use
 * fill="var(--color-orders)" and follow the series colour.
 */
function colorVars(legend: ReadonlyArray<LegendItem> | undefined): CSSProperties | undefined {
  if (!legend?.length) return undefined;
  const vars: Record<string, string> = {};
  for (const item of legend) if (/^[w-]+$/.test(item.key)) vars[`--color-${item.key}`] = item.color;
  return vars as CSSProperties;
}
