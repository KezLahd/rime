/*
 * Dates cross component boundaries as ISO calendar strings ("2026-09-29"),
 * never Date objects: a date of birth has no time zone, and a Date built at
 * night local time slides a day when it is serialised to UTC.
 */

export type IsoDate = string;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const pad = (n: number) => String(n).padStart(2, "0");

export function toIso(y: number, m: number, d: number): IsoDate {
  return `${y}-${pad(m)}-${pad(d)}`;
}

export function parseIso(iso: IsoDate): { y: number; m: number; d: number } {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d };
}

export function isValidIso(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const { y, m, d } = parseIso(iso);
  return m >= 1 && m <= 12 && d >= 1 && d <= daysInMonth(y, m);
}

export function daysInMonth(y: number, m: number): number {
  return new Date(y, m, 0).getDate();
}

/** Today in the browser's zone. A function, so render stays free of `new Date()`. */
export function todayIso(): IsoDate {
  const now = new Date();
  return toIso(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function addDays(iso: IsoDate, days: number): IsoDate {
  const { y, m, d } = parseIso(iso);
  const date = new Date(y, m - 1, d + days);
  return toIso(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

/** Moves by months, clamping the day (31 Jan + 1 month = 28/29 Feb). */
export function addMonths(iso: IsoDate, months: number): IsoDate {
  const { y, m, d } = parseIso(iso);
  const total = y * 12 + (m - 1) + months;
  const ny = Math.floor(total / 12);
  const nm = (total % 12) + 1;
  return toIso(ny, nm, Math.min(d, daysInMonth(ny, nm)));
}

/** 0 = Monday … 6 = Sunday (ISO week). */
export function weekdayIndex(iso: IsoDate): number {
  const { y, m, d } = parseIso(iso);
  return (new Date(y, m - 1, d).getDay() + 6) % 7;
}

export function compareIso(a: IsoDate, b: IsoDate): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

export function monthLabel(y: number, m: number): string {
  return `${MONTHS[m - 1]} ${y}`;
}

/** "24 Aug 2026": the display format used across the portal. */
export function formatDate(iso: IsoDate | null | undefined): string {
  if (!iso || !isValidIso(iso)) return "";
  const { y, m, d } = parseIso(iso);
  return `${d} ${MONTHS_SHORT[m - 1]} ${y}`;
}

/** "Monday 24 August 2026", for calendar cell labels. */
export function formatDateLong(iso: IsoDate): string {
  const { y, m, d } = parseIso(iso);
  return `${WEEKDAYS[weekdayIndex(iso)]} ${d} ${MONTHS[m - 1]} ${y}`;
}

/** "24/08/2026", the typed-entry format. */
export function formatDateInput(iso: IsoDate | null | undefined): string {
  if (!iso || !isValidIso(iso)) return "";
  const { y, m, d } = parseIso(iso);
  return `${pad(d)}/${pad(m)}/${y}`;
}

/** Accepts D/M/YYYY with / . - or space separators. Two-digit years are refused. */
export function parseDateInput(text: string): IsoDate | null {
  const match = text.trim().match(/^(\d{1,2})[/.\-\s](\d{1,2})[/.\-\s](\d{4})$/);
  if (!match) return null;
  const iso = toIso(Number(match[3]), Number(match[2]), Number(match[1]));
  return isValidIso(iso) ? iso : null;
}

/** Whole years between two ISO dates: age at a date. */
export function yearsBetween(from: IsoDate, to: IsoDate): number {
  const a = parseIso(from);
  const b = parseIso(to);
  let years = b.y - a.y;
  if (b.m < a.m || (b.m === a.m && b.d < a.d)) years -= 1;
  return years;
}

export const WEEKDAY_SHORT = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
export const WEEKDAY_NAMES = WEEKDAYS;
export const MONTH_NAMES: ReadonlyArray<string> = MONTHS;
export const MONTH_SHORT: ReadonlyArray<string> = MONTHS_SHORT;
