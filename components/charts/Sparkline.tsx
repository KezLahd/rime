import styles from "./Charts.module.css";

export type SparklineProps = {
  values: ReadonlyArray<number>;
  width?: number;
  height?: number;
  /**
   * The history in the de-emphasis hue, the current period (last segment and
   * end dot) in the accent. Set false for an all-accent line.
   */
  emphasiseLast?: boolean;
  /** Accent colour, a var() from palette.ts. */
  color?: string;
  /** Include zero in the scale. On for counts, off for rates that never near it. */
  zeroBased?: boolean;
  className?: string;
};

/**
 * A tiny trend for stat tiles. Plain SVG with no axes, no tooltip and no
 * measuring, so it renders on the server. Decorative: the tile beside it
 * states the value and the change in words.
 */
export function Sparkline({
  values,
  width = 96,
  height = 28,
  emphasiseLast = true,
  color = "var(--chart-1)",
  zeroBased = true,
  className,
}: SparklineProps) {
  if (values.length < 2) return <svg width={width} height={height} aria-hidden="true" className={className} />;

  const pad = 3; // room for the 2px ring round the end dot
  const min = zeroBased ? Math.min(0, ...values) : Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = (width - pad * 2) / (values.length - 1);
  const points = values.map((v, i) => [pad + i * step, pad + (1 - (v - min) / span) * (height - pad * 2)] as const);
  const path = (pts: ReadonlyArray<readonly [number, number]>) =>
    pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const [ex, ey] = points[points.length - 1];

  return (
    <svg
      className={[styles.tokens, styles.sparkline, className].filter(Boolean).join(" ")}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      focusable="false"
    >
      <path d={path(points)} stroke={emphasiseLast ? "var(--chart-other)" : color} />
      {emphasiseLast ? <path d={path(points.slice(-2))} stroke={color} /> : null}
      <circle cx={ex} cy={ey} r={2.5} fill={color} stroke="var(--chart-gap)" strokeWidth={1.5} />
    </svg>
  );
}
