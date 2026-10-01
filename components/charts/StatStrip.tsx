import { TrendingDown, TrendingUp } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import { cx } from "@/components/ui/_internal/cx";
import styles from "./Charts.module.css";
import { formatDelta, formatNumber } from "./format";
import { Sparkline } from "./Sparkline";

export type Stat = {
  /** Sentence case, no trailing colon. */
  label: string;
  value: number;
  format?: (value: number) => string;
  /** Small unit after the value ("days"). */
  unit?: string;
  /** Change against a named period. Colour = direction × whether up is good. */
  delta?: {
    value: number;
    /** "vs last week". */
    period: string;
    format?: (value: number) => string;
    /** Turnaround time falls when things improve; orders rise. Default "up". */
    goodWhen?: "up" | "down";
  };
  /** Last n periods, oldest first; the current period is the accent. */
  trend?: ReadonlyArray<number>;
  /** Spoken in place of the sparkline: "Weekly, last 12 weeks: 8 to 32". */
  trendLabel?: string;
  /** Extra line under the value. */
  note?: ReactNode;
};

export type StatStripProps = {
  stats: ReadonlyArray<Stat>;
  loading?: boolean;
  className?: string;
  "aria-label"?: string;
};

/**
 * Headline figures in one row inside one panel, split by hairlines: never a
 * grid of separate cards. Values are proportional figures at display size.
 */
export function StatStrip({ stats, loading, className, "aria-label": ariaLabel }: StatStripProps) {
  const style = { "--stat-count": stats.length } as CSSProperties;
  return (
    <dl className={cx(styles.tokens, styles.strip, className)} style={style} aria-label={ariaLabel} aria-busy={loading || undefined}>
      {stats.map((s) => (
        <div key={s.label} className={styles.stat}>
          <dt className={styles.statLabel}>{s.label}</dt>
          {loading ? (
            <dd className={styles.statSkeleton}>
              <Skeleton width={72} height={28} />
              <span className={styles.statFoot}>
                <Skeleton variant="text" height={10} width={96} />
                {s.trend ? <Skeleton width={96} height={24} /> : null}
              </span>
            </dd>
          ) : (
            <>
              <dd className={styles.statValue}>
                {(s.format ?? formatNumber)(s.value)}
                {s.unit ? <span className={styles.statUnit}>{s.unit}</span> : null}
              </dd>
              <dd className={styles.statFoot}>
                {s.delta ? <Delta {...s.delta} /> : <span />}
                {s.trend ? (
                  <>
                    <Sparkline values={s.trend} zeroBased={s.delta?.goodWhen !== "down"} />
                    {s.trendLabel ? <span className="sr-only">{s.trendLabel}</span> : null}
                  </>
                ) : null}
              </dd>
              {s.note ? <dd className={styles.subtitle}>{s.note}</dd> : null}
            </>
          )}
        </div>
      ))}
    </dl>
  );
}

function Delta({ value, period, format = formatNumber, goodWhen = "up" }: NonNullable<Stat["delta"]>) {
  const flat = value === 0;
  const good = (value > 0 && goodWhen === "up") || (value < 0 && goodWhen === "down");
  const Icon = value > 0 ? TrendingUp : TrendingDown;
  return (
    <span className={cx(styles.delta, flat ? styles.deltaFlat : good ? styles.deltaGood : styles.deltaBad)}>
      {flat ? null : <Icon size={13} strokeWidth={2.4} aria-hidden="true" />}
      {flat ? "No change" : formatDelta(value, format)}
      <span className={styles.deltaPeriod}>{period}</span>
    </span>
  );
}
