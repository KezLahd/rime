// Themed chart layer on Recharts. Charts read colour, type and radius from
// the design tokens (Charts.module.css), so one component renders in every
// theme. See palette.ts for the validated palette and the
// rules it carries (fixed order, fold past six, status never as a series).

export { LineChart, AreaChart, type TrendChartProps, type AreaChartProps } from "./TrendChart";
export { BarChart, type BarChartProps } from "./BarChart";
export { DonutChart, type DonutChartProps, type DonutDatum } from "./DonutChart";
export { Sparkline, type SparklineProps } from "./Sparkline";
export { StatStrip, type Stat, type StatStripProps } from "./StatStrip";
export { CapacityBar, type CapacityBarProps, type CapacitySegment } from "./CapacityBar";
export {
  ChartFrame,
  /** The series key row the high-level charts draw. shadcn's ChartLegend is the primitive below. */
  ChartLegend as ChartKeyLegend,
  ChartScope,
  ChartTable,
  ChartSkeleton,
  LegendKey,
  type ChartBaseProps,
  type ChartStatus,
  type LegendItem,
  type SkeletonShape,
  type ChartTableSpec,
  type TableColumn,
} from "./ChartFrame";
/** The tooltip the high-level charts use; shadcn's ChartTooltip is the primitive below. */
export { ChartTooltip as SeriesTooltip, type ChartTooltipOptions } from "./ChartTooltip";
// shadcn-compatible primitives: import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig }.
export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  useChart,
  LINE_CURSOR,
  TOOLTIP_MOTION,
  type ChartConfig,
  type ChartContainerProps,
  type ChartTooltipContentProps,
  type ChartLegendContentProps,
} from "./primitives";
export {
  CATEGORICAL,
  ORDINAL,
  STATUS,
  OTHER,
  SURFACE,
  SERIES_SLOTS,
  OTHER_COLOR,
  STATUS_COLOR,
  seriesColor,
  ordinalColors,
  contrastRatio,
  type PaletteSwatch,
} from "./palette";
export { foldSeries, niceTicks, seriesFromConfig, OTHER_KEY, type ChartRow, type ChartSeries } from "./scale";
export * from "./format";
