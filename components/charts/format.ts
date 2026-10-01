// en-AU number and date formatting for charts, ticks, tooltips and tables.
//
// Dates arrive as ISO calendar strings ("2026-11-23", "2026-11") and are
// formatted in UTC, so the server and the browser render the same label
// whatever the viewer's zone: a chart that hydrates must not shift a week.

const LOCALE = "en-AU";

const integer = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });
const oneDecimal = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 1 });
const compact = new Intl.NumberFormat(LOCALE, { notation: "compact", maximumFractionDigits: 1 });

/** 1,284. Comma separated, no decimals. */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "–";
  return Math.abs(value) < 10 && !Number.isInteger(value) ? oneDecimal.format(value) : integer.format(value);
}

/** 1,284 / 12.9K / 4.2M. For stat values and crowded axes. */
export function formatCompact(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "–";
  return Math.abs(value) < 10_000 ? integer.format(value) : compact.format(value);
}

/** A 0 to 1 ratio as a percentage: 0.625 -> "63%". */
export function formatPercent(ratio: number, digits = 0): string {
  if (!Number.isFinite(ratio)) return "–";
  return new Intl.NumberFormat(LOCALE, {
    style: "percent",
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(ratio);
}

/** Signed change with a true minus sign: "+12", "−3", "0". */
export function formatDelta(value: number, format: (n: number) => string = formatNumber): string {
  if (value === 0) return format(0);
  return `${value > 0 ? "+" : "−"}${format(Math.abs(value))}`;
}

// ── Dates ──────────────────────────────────────────────────────────────────

/** "2026-11-23" or "2026-11" -> a UTC Date. */
export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
}

const dayShort = new Intl.DateTimeFormat(LOCALE, { day: "numeric", month: "short", timeZone: "UTC" });
const dayLong = new Intl.DateTimeFormat(LOCALE, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const monthShort = new Intl.DateTimeFormat(LOCALE, { month: "short", timeZone: "UTC" });
const monthLong = new Intl.DateTimeFormat(LOCALE, { month: "long", year: "numeric", timeZone: "UTC" });

/** Axis tick for a day or week: "23 Nov". */
export function formatDay(iso: string): string {
  return dayShort.format(parseIsoDate(iso));
}

/** "23 Nov 2026". */
export function formatDate(iso: string): string {
  return dayLong.format(parseIsoDate(iso));
}

/** Tooltip header for a weekly bucket: "Week of 23 Nov 2026". */
export function formatWeekOf(iso: string): string {
  return `Week of ${formatDate(iso)}`;
}

/** Axis tick for a month: "Nov". */
export function formatMonthTick(iso: string): string {
  return monthShort.format(parseIsoDate(iso));
}

/** Tooltip header for a month: "November 2026". */
export function formatMonth(iso: string): string {
  return monthLong.format(parseIsoDate(iso));
}
