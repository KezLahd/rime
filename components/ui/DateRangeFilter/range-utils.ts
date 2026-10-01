import type { DateRange } from "../DateField/Calendar";
import { addDays, addMonths, compareIso, daysInMonth, formatDate, parseIso, toIso, type IsoDate } from "../DateField/date-utils";

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export type DateRangePreset = {
  id: string;
  label: string;
  /** Resolved against today each time the picker opens, so it never goes stale. */
  range: (today: IsoDate) => { start: IsoDate; end: IsoDate };
};

/** Every default ends today: records are never dated ahead of it. */
export const DEFAULT_DATE_RANGE_PRESETS: ReadonlyArray<DateRangePreset> = [
  { id: "today", label: "Today", range: (t) => ({ start: t, end: t }) },
  { id: "7d", label: "Last 7 days", range: (t) => ({ start: addDays(t, -6), end: t }) },
  { id: "30d", label: "Last 30 days", range: (t) => ({ start: addDays(t, -29), end: t }) },
  {
    id: "month",
    label: "This month",
    range: (t) => {
      const { y, m } = parseIso(t);
      return { start: toIso(y, m, 1), end: t };
    },
  },
  {
    id: "last-month",
    label: "Last month",
    range: (t) => {
      const { y, m } = parseIso(addMonths(t, -1));
      return { start: toIso(y, m, 1), end: toIso(y, m, daysInMonth(y, m)) };
    },
  },
  {
    id: "year",
    label: "This year",
    range: (t) => ({ start: toIso(parseIso(t).y, 1, 1), end: t }),
  },
];

export const EMPTY_RANGE: DateRange = { start: null, end: null };

/** Orders the ends and fills a lone one, so callers only see whole ranges. */
export function normaliseRange({ start, end }: DateRange): DateRange {
  const a = start ?? end;
  const b = end ?? start;
  if (!a || !b) return EMPTY_RANGE;
  return compareIso(a, b) <= 0 ? { start: a, end: b } : { start: b, end: a };
}

export function sameRange(a: DateRange, b: DateRange): boolean {
  return a.start === b.start && a.end === b.end;
}

/** Trims a preset to min/max. null when none of it is inside. */
export function clampRange(range: { start: IsoDate; end: IsoDate }, min?: IsoDate, max?: IsoDate): DateRange | null {
  const start = min && compareIso(range.start, min) < 0 ? min : range.start;
  const end = max && compareIso(range.end, max) > 0 ? max : range.end;
  return compareIso(start, end) <= 0 ? { start, end } : null;
}

/** Inclusive day count. UTC so a daylight-saving change can't shave an hour off a day. */
export function daysInRange(start: IsoDate, end: IsoDate): number {
  const a = parseIso(start);
  const b = parseIso(end);
  return Math.round((Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / 86_400_000) + 1;
}

/**
 * Compact trigger label. Shared parts collapse: "1 to 29 Sep 2026",
 * "1 Sep to 29 Oct 2026", "28 Dec 2025 to 3 Jan 2026"; one day is just the day.
 * null when the range is empty.
 */
export function formatDateRange(range: DateRange): string | null {
  const { start, end } = normaliseRange(range);
  if (!start || !end) return null;
  if (start === end) return formatDate(start);
  const a = parseIso(start);
  const b = parseIso(end);
  if (a.y === b.y && a.m === b.m) return `${a.d} to ${b.d} ${MONTHS_SHORT[b.m - 1]} ${b.y}`;
  if (a.y === b.y) return `${a.d} ${MONTHS_SHORT[a.m - 1]} to ${formatDate(end)}`;
  return `${formatDate(start)} to ${formatDate(end)}`;
}
