/**
 * Time as "HH:MM", 24-hour, zero-padded ("09:30", "23:05"). Chosen so
 * values compare and sort as strings, round-trip through JSON cleanly,
 * and never carry a time zone — a time of day is not an instant.
 */
export type Time = string;

/** True when t is a well-formed 24h time string. */
export function isValidTime(t: unknown): t is Time {
  if (typeof t !== "string") return false;
  const m = /^(\d{2}):(\d{2})$/.exec(t);
  if (!m) return false;
  const h = Number(m[1]);
  const mm = Number(m[2]);
  return h >= 0 && h <= 23 && mm >= 0 && mm <= 59;
}

/** Build an HH:MM from numeric h/m, zero-padded. */
export function makeTime(h: number, m: number): Time {
  const hh = Math.max(0, Math.min(23, Math.floor(h)));
  const mm = Math.max(0, Math.min(59, Math.floor(m)));
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

/** Split an HH:MM into { h, m }. Assumes the input is valid. */
export function parseTime(t: Time): { h: number; m: number } {
  return { h: Number(t.slice(0, 2)), m: Number(t.slice(3, 5)) };
}

/** Compare two times. Negative if a < b, 0 if equal, positive if a > b. */
export function compareTime(a: Time, b: Time): number {
  return a.localeCompare(b);
}

/** Minutes since 00:00 (useful for duration maths). */
export function toMinutes(t: Time): number {
  const { h, m } = parseTime(t);
  return h * 60 + m;
}

/** Build an HH:MM from minutes since 00:00; wraps on 24h overflow. */
export function fromMinutes(n: number): Time {
  const total = ((n % 1440) + 1440) % 1440;
  return makeTime(Math.floor(total / 60), total % 60);
}

/** The current time rounded down to the given step (default 1 minute). */
export function nowTime(step = 1): Time {
  const d = new Date();
  const m = d.getHours() * 60 + d.getMinutes();
  return fromMinutes(Math.floor(m / step) * step);
}

/**
 * Parse user input into HH:MM, forgiving of common formats:
 *   "9:30 am"  → "09:30"
 *   "9 pm"     → "21:00"
 *   "0930"     → "09:30"
 *   "14:5"     → "14:05"
 *   "14.30"    → "14:30"
 *   "9"        → "09:00"
 *   "2330"     → "23:30"
 * Returns null when the input can't be read as a time.
 */
export function parseTimeInput(raw: string): Time | null {
  const text = raw.trim().toLowerCase();
  if (!text) return null;

  // Pull off a trailing am/pm (optionally with a dot: "a.m.").
  let suffix: "am" | "pm" | null = null;
  let body = text;
  const sfx = /\s*(a\.?m\.?|p\.?m\.?)\s*$/.exec(body);
  if (sfx) {
    suffix = sfx[1].startsWith("a") ? "am" : "pm";
    body = body.slice(0, body.length - sfx[0].length).trim();
  }

  // Split by any non-digit separator; also accept compact "0930" or "930".
  let hStr: string;
  let mStr: string;
  const parts = body.split(/[^\d]+/).filter(Boolean);
  if (parts.length >= 2) {
    hStr = parts[0];
    mStr = parts[1];
  } else if (parts.length === 1) {
    const only = parts[0];
    if (only.length <= 2) {
      // "9" or "14": hour only, no minutes.
      hStr = only;
      mStr = "0";
    } else if (only.length === 3) {
      // "930" → 9:30
      hStr = only.slice(0, 1);
      mStr = only.slice(1);
    } else if (only.length === 4) {
      // "0930" → 09:30
      hStr = only.slice(0, 2);
      mStr = only.slice(2);
    } else {
      return null;
    }
  } else {
    return null;
  }

  let h = Number(hStr);
  const m = Number(mStr);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  if (m < 0 || m > 59) return null;

  if (suffix) {
    if (h < 1 || h > 12) return null;
    if (suffix === "am") h = h === 12 ? 0 : h;
    else h = h === 12 ? 12 : h + 12;
  } else {
    if (h < 0 || h > 23) return null;
  }

  return makeTime(h, m);
}

/**
 * Format HH:MM for display in the input. 24h returns as-is; 12h returns
 * "9:30 AM" style, with no padding on the hour.
 */
export function formatTimeInput(t: Time | null, format: "12h" | "24h"): string {
  if (!t) return "";
  const { h, m } = parseTime(t);
  if (format === "24h") return t;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

/**
 * Snap a time to the nearest multiple of step minutes (default round down).
 * Used when a user types "9:17" into a 15-minute-step field.
 */
export function snapTime(t: Time, step: number, mode: "floor" | "round" | "ceil" = "floor"): Time {
  if (step <= 1) return t;
  const n = toMinutes(t);
  const f = mode === "ceil" ? Math.ceil : mode === "round" ? Math.round : Math.floor;
  return fromMinutes(f(n / step) * step);
}
