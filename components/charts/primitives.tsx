"use client";

// shadcn's chart primitives (ChartConfig, ChartContainer, ChartTooltip,
// ChartTooltipContent, ChartLegend, ChartLegendContent) on Rime's tokens and
// CSS Modules, with no Tailwind. A shadcn chart example works here with its
// Tailwind classes removed and ChartContainer given a height.
//
// The glide: Recharts positions the tooltip wrapper with a translate and,
// while active, sets `transition: transform 400ms ease`. TOOLTIP_MOTION keeps
// those defaults ("auto" also honours prefers-reduced-motion). Never pass
// isAnimationActive={false}: that makes the box jump.

import {
  createContext,
  useContext,
  useId,
  useMemo,
  type ComponentProps,
  type ComponentType,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  Legend as RechartsLegend,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  type LegendPayload,
  type TooltipContentProps,
  type TooltipPayloadEntry,
} from "recharts";
import { cx } from "@/components/ui/_internal/cx";
import { TOOLTIP_MOTION } from "./cartesian";
import styles from "./ChartPrimitives.module.css";
import chartTokens from "./Charts.module.css";
import { formatNumber } from "./format";

export { TOOLTIP_MOTION };

/** Crosshair for line and area charts: a hairline (colour from the container CSS). */
export const LINE_CURSOR = { strokeWidth: 1 } as const;

// ── Config ──────────────────────────────────────────────────────────────

/**
 * Theme layers a per-series colour can vary by, as tokens.css applies them:
 * the mode (dark: the .dark class, data-mode="dark", or the legacy
 * data-theme="dark") and the Flat preset.
 */
const THEME_SELECTORS = {
  light: [""],
  dark: [".dark", '[data-mode="dark"]', '[data-theme="dark"]'],
  flat: ['[data-theme="flat"]'],
} as const;

type ThemeName = keyof typeof THEME_SELECTORS;

/**
 * One entry per series key (the dataKey, or the nameKey value for pies).
 * `color` is any CSS colour; prefer a palette slot ("var(--chart-1)") so the
 * series re-themes with the preset. `theme` is for the rare series whose
 * colour must differ per preset.
 */
export type ChartConfig = Record<
  string,
  {
    label?: ReactNode;
    icon?: ComponentType<{ className?: string }>;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Partial<Record<ThemeName, string>> & { light: string } }
  )
>;

type ChartContextValue = { config: ChartConfig };

const ChartContext = createContext<ChartContextValue | null>(null);

export function useChart(): ChartContextValue {
  const ctx = useContext(ChartContext);
  if (!ctx) throw new Error("useChart must be used inside <ChartContainer>.");
  return ctx;
}

// ── Container ───────────────────────────────────────────────────────────

export type ChartContainerProps = Omit<ComponentProps<"div">, "children"> & {
  config: ChartConfig;
  /** One Recharts chart (AreaChart, BarChart...). */
  children: ComponentProps<typeof ResponsiveContainer>["children"];
  /** Size used before the first measure, so SSR and first paint are not 0 by 0. */
  initialDimension?: { width: number; height: number };
};

/**
 * Wraps one Recharts chart: provides the config, exposes each series colour
 * as --color-<key> on the wrapper, applies the chart tokens and the kit's
 * chrome overrides, and measures with ResponsiveContainer. Give it a height
 * (style={{ height: 240 }}) or keep the default 16:9 aspect ratio.
 */
export function ChartContainer({
  id,
  config,
  className,
  style,
  children,
  initialDimension = { width: 320, height: 200 },
  ...rest
}: ChartContainerProps) {
  const uid = useId();
  const chartId = `chart-${(id ?? uid).replace(/[^a-zA-Z0-9_-]/g, "")}`;

  // Single-colour series go inline: no <style> tag, CSP friendly.
  const inlineVars = useMemo(() => {
    const vars: Record<string, string> = {};
    for (const [key, item] of Object.entries(config)) {
      const value = item.color ?? item.theme?.light;
      if (value) vars[`--color-${key}`] = value;
    }
    return vars as CSSProperties;
  }, [config]);

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cx(chartTokens.tokens, styles.container, className)}
        style={{ ...inlineVars, ...style }}
        {...rest}
      >
        <ChartThemeStyle id={chartId} config={config} />
        <ResponsiveContainer initialDimension={initialDimension}>{children}</ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

/** Per-preset overrides, only for series that declare `theme`. */
function ChartThemeStyle({ id, config }: { id: string; config: ChartConfig }) {
  const themed = Object.entries(config).filter(([, item]) => item.theme);
  if (!themed.length) return null;

  const blocks = (Object.keys(THEME_SELECTORS) as ThemeName[])
    .filter((theme) => theme !== "light")
    .map((theme) => {
      const lines = themed
        .map(([key, item]) => {
          const value = item.theme?.[theme];
          return value ? `  --color-${key}: ${value};` : null;
        })
        .filter(Boolean)
        .join("\n");
      if (!lines) return "";
      // tokens.css applies a layer as an ancestor attribute or class, and via :has().
      const selectors = THEME_SELECTORS[theme].flatMap((p) => [`${p} [data-chart="${id}"]`, `:root:has(${p}) [data-chart="${id}"]`]);
      return `${selectors.join(", ")} {\n${lines}\n}`;
    })
    .filter(Boolean)
    .join("\n");

  return blocks ? <style dangerouslySetInnerHTML={{ __html: blocks }} /> : null;
}

// ── Tooltip ─────────────────────────────────────────────────────────────

/** Recharts' Tooltip, unchanged (as shadcn exports it). Spread TOOLTIP_MOTION onto it. */
export const ChartTooltip = RechartsTooltip;

type Indicator = "dot" | "line" | "dashed";

export type ChartTooltipContentProps = Omit<
  Partial<TooltipContentProps>,
  "formatter" | "labelFormatter" | "content"
> & {
  className?: string;
  /** dot (default), line or dashed key beside each row. */
  indicator?: Indicator;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  /** Config key to read the label from, when the label is not the x value. */
  labelKey?: string;
  /** Row name from this field of the datum (pies: "browser"). */
  nameKey?: string;
  /** Forces every indicator to one colour. */
  color?: string;
  /** Header text. Receives the resolved label and the payload. */
  labelFormatter?: (label: ReactNode, payload: ReadonlyArray<TooltipPayloadEntry>) => ReactNode;
  /** Replaces a row's whole body. */
  formatter?: (
    value: TooltipPayloadEntry["value"],
    name: TooltipPayloadEntry["name"],
    item: TooltipPayloadEntry,
    index: number,
    datum: unknown,
  ) => ReactNode;
  /** Formats each numeric value (kit default: formatNumber). */
  valueFormatter?: (value: number) => string;
  /** Small uppercase tag beside the label ("Cumulative"). Kit extra. */
  tag?: string;
  /** Adds a total row: stacked charts. Kit extra. */
  total?: boolean | string;
};

/**
 * The tooltip body. Same props and behaviour as shadcn's ChartTooltipContent
 * (indicator, hideLabel, hideIndicator, labelKey, nameKey, labelFormatter,
 * formatter, color), plus the kit's valueFormatter, tag and total.
 */
export function ChartTooltipContent({
  active,
  payload,
  label,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  labelKey,
  nameKey,
  color,
  labelFormatter,
  formatter,
  valueFormatter = formatNumber,
  tag,
  total,
}: ChartTooltipContentProps) {
  const { config } = useChart();

  const tooltipLabel = useMemo(() => {
    if (hideLabel || !payload?.length) return null;
    const [item] = payload;
    const key = `${labelKey ?? item?.dataKey ?? item?.name ?? "value"}`;
    const itemConfig = configFromPayload(config, item, key);
    const value: ReactNode =
      !labelKey && (typeof label === "string" || typeof label === "number")
        ? (config[String(label)]?.label ?? label)
        : itemConfig?.label;
    const text = labelFormatter ? labelFormatter(value, payload) : value;
    if (text === null || text === undefined || text === "") return null;
    return (
      <div className={styles.label}>
        {text}
        {tag ? <span className={styles.tag}>{tag}</span> : null}
      </div>
    );
  }, [config, hideLabel, label, labelFormatter, labelKey, payload, tag]);

  if (!active || !payload?.length) return null;

  const rows = payload.filter((item) => item.type !== "none");
  const nestLabel = rows.length === 1 && indicator !== "dot";
  const sum = rows.reduce((n, item) => n + (typeof item.value === "number" ? item.value : 0), 0);

  return (
    <div data-slot="chart-tooltip" className={cx(styles.tooltip, className)}>
      {nestLabel ? null : tooltipLabel}
      <div className={styles.rows}>
        {rows.map((item, index) => {
          const key = `${nameKey ?? item.name ?? item.dataKey ?? "value"}`;
          const itemConfig = configFromPayload(config, item, key);
          const datum = item.payload as Record<string, unknown> | undefined;
          const indicatorColor =
            color ?? (typeof datum?.fill === "string" ? datum.fill : undefined) ?? item.color;

          return (
            <div key={`${key}-${index}`} className={styles.row} data-indicator={indicator}>
              {formatter && item.value !== undefined && item.name !== undefined ? (
                formatter(item.value, item.name, item, index, item.payload)
              ) : (
                <>
                  {itemConfig?.icon ? (
                    <itemConfig.icon />
                  ) : hideIndicator ? null : (
                    <span
                      aria-hidden="true"
                      className={styles.indicator}
                      data-shape={indicator}
                      data-nested={nestLabel && indicator === "dashed" ? "true" : undefined}
                      style={{ "--indicator": indicatorColor } as CSSProperties}
                    />
                  )}
                  <div className={styles.rowBody} data-nested={nestLabel ? "true" : undefined}>
                    <div className={styles.rowText}>
                      {nestLabel ? tooltipLabel : null}
                      <span className={styles.name}>{itemConfig?.label ?? item.name}</span>
                    </div>
                    {item.value !== null && item.value !== undefined ? (
                      <span className={styles.value}>
                        {typeof item.value === "number" ? valueFormatter(item.value) : String(item.value)}
                      </span>
                    ) : null}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
      {total && rows.length > 1 ? (
        <div className={styles.total}>
          <span>{typeof total === "string" ? total : "Total"}</span>
          <span className={styles.value}>{valueFormatter(sum)}</span>
        </div>
      ) : null}
    </div>
  );
}

// ── Legend ──────────────────────────────────────────────────────────────

/** Recharts' Legend, unchanged. Pass content={<ChartLegendContent />}. */
export const ChartLegend = RechartsLegend;

export type ChartLegendContentProps = {
  className?: string;
  hideIcon?: boolean;
  nameKey?: string;
  payload?: ReadonlyArray<LegendPayload>;
  verticalAlign?: "top" | "middle" | "bottom";
};

export function ChartLegendContent({
  className,
  hideIcon = false,
  nameKey,
  payload,
  verticalAlign = "bottom",
}: ChartLegendContentProps) {
  const { config } = useChart();
  if (!payload?.length) return null;

  return (
    <div
      data-slot="chart-legend"
      data-align={verticalAlign === "top" ? "top" : "bottom"}
      className={cx(styles.legend, className)}
    >
      {payload
        .filter((item) => item.type !== "none")
        .map((item) => {
          const key = `${nameKey ?? item.dataKey ?? "value"}`;
          const itemConfig = configFromPayload(config, item, key);
          return (
            <div key={item.value ?? key} className={styles.legendItem}>
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <span aria-hidden="true" className={styles.legendSwatch} style={{ background: item.color }} />
              )}
              {itemConfig?.label ?? item.value}
            </div>
          );
        })}
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────

/** Port of shadcn's getPayloadConfigFromPayload: finds the config entry for a payload item. */
function configFromPayload(config: ChartConfig, item: unknown, key: string) {
  if (typeof item !== "object" || item === null) return undefined;
  const record = item as Record<string, unknown>;
  const inner =
    typeof record.payload === "object" && record.payload !== null
      ? (record.payload as Record<string, unknown>)
      : undefined;

  let configKey = key;
  if (typeof record[key] === "string") configKey = record[key] as string;
  else if (inner && typeof inner[key] === "string") configKey = inner[key] as string;

  return config[configKey] ?? config[key];
}

