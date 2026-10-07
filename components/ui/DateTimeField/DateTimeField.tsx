"use client";

import { cx } from "../_internal/cx";
import { DateField } from "../DateField/DateField";
import { compareIso, type IsoDate } from "../DateField/date-utils";
import { TimeField } from "../TimeField/TimeField";
import { compareTime, type Time } from "../TimeField/time-utils";
import styles from "./DateTimeField.module.css";

/**
 * A naive local date-time: "YYYY-MM-DDTHH:MM" with no time zone. Pair with
 * a stored time zone when the moment matters across zones; keep it naive
 * for a schedule the user types in their own time ("show starts 7 pm on
 * Saturday" is the same string whether they're in Sydney or Perth).
 */
export type DateTime = string;

export type DateTimeFieldProps = {
  value: DateTime | null;
  onChange: (value: DateTime | null) => void;
  /** 24h is the default. 12h shows "9:30 AM" and parses am/pm. */
  format?: "12h" | "24h";
  /** Minute granularity for the time popup (default 15). */
  step?: number;
  min?: DateTime;
  max?: DateTime;
  disabled?: boolean;
  className?: string;
  /** aria-label for the date field (default "Date"). */
  "aria-label-date"?: string;
  /** aria-label for the time field (default "Time"). */
  "aria-label-time"?: string;
};

/**
 * Date + time on one row, each with its own popup — the DateField with a
 * month grid, the TimeField with hour/minute/period columns. The parts
 * compose into "YYYY-MM-DDTHH:MM" (local, no time zone), null when either
 * piece is cleared. The split keeps parsing fast for the common case where
 * one of the two is already known.
 */
export function DateTimeField({
  value,
  onChange,
  format = "24h",
  step = 15,
  min,
  max,
  disabled,
  className,
  "aria-label-date": ariaDate = "Date",
  "aria-label-time": ariaTime = "Time",
}: DateTimeFieldProps) {
  const date: IsoDate | null = value ? value.slice(0, 10) : null;
  const time: Time | null = value && value.length >= 16 ? value.slice(11, 16) : null;

  // Split min/max into their date and time halves so each sub-field can
  // enforce the bound it's responsible for.
  const minDate = min?.slice(0, 10);
  const maxDate = max?.slice(0, 10);
  const minTime = min && date === minDate ? min.slice(11, 16) : undefined;
  const maxTime = max && date === maxDate ? max.slice(11, 16) : undefined;

  const combine = (d: IsoDate | null, t: Time | null): DateTime | null => {
    if (!d) return null;
    const whole = `${d}T${t ?? "00:00"}`;
    // Clamp into [min, max] on the combined string so a date at the bound
    // doesn't accept a time outside it.
    if (min && whole < min) return min;
    if (max && whole > max) return max;
    return whole;
  };

  const onDateChange = (d: IsoDate | null) => {
    if (!d) return onChange(null);
    onChange(combine(d, time));
  };

  const onTimeChange = (t: Time | null) => {
    if (!date) {
      // Typing a time with no date set yet: don't commit, let the user pick
      // a date — a time without a day is ambiguous.
      if (t === null) onChange(null);
      return;
    }
    onChange(combine(date, t));
  };

  const isDateDisabled = (iso: IsoDate) => {
    if (minDate && compareIso(iso, minDate) < 0) return true;
    if (maxDate && compareIso(iso, maxDate) > 0) return true;
    return false;
  };

  // When the picked date sits strictly inside the bounds, the time has the
  // full day to pick from; only on the bound dates does the time narrow.
  const timeMin = date && minDate && compareIso(date, minDate) === 0 ? minTime : undefined;
  const timeMax = date && maxDate && compareIso(date, maxDate) === 0 ? maxTime : undefined;

  const timeRangeInvalid =
    date !== null &&
    time !== null &&
    ((timeMin !== undefined && compareTime(time, timeMin) < 0) || (timeMax !== undefined && compareTime(time, timeMax) > 0));

  return (
    <div data-slot="date-time-field" className={cx(styles.row, className)}>
      <DateField
        aria-label={ariaDate}
        value={date}
        onChange={onDateChange}
        isDateDisabled={isDateDisabled}
        min={minDate}
        max={maxDate}
        disabled={disabled}
      />
      <TimeField
        aria-label={ariaTime}
        value={time}
        onChange={onTimeChange}
        format={format}
        step={step}
        min={timeMin}
        max={timeMax}
        disabled={disabled || !date}
        invalid={timeRangeInvalid || undefined}
      />
    </div>
  );
}

// ── Range ────────────────────────────────────────────────────────────────

export type DateTimeRange = { start: DateTime | null; end: DateTime | null };

export type DateTimeRangeFieldProps = {
  value: DateTimeRange;
  onChange: (value: DateTimeRange) => void;
  format?: "12h" | "24h";
  step?: number;
  disabled?: boolean;
  className?: string;
};

/**
 * Start + end date-time pair: a schedule window ("event runs from Sat 7 pm
 * to Sat 10 pm"). The end's date and time are both bounded by the start,
 * so an end that lands before start is impossible to pick — but if the
 * parent passes an invalid pair, the end field flags it on screen.
 */
export function DateTimeRangeField({
  value,
  onChange,
  format = "24h",
  step = 15,
  disabled,
  className,
}: DateTimeRangeFieldProps) {
  const { start, end } = value;
  const endInvalid = start !== null && end !== null && end <= start;

  return (
    <div className={cx(styles.range, className)} data-slot="date-time-range-field">
      <DateTimeField
        aria-label-date="Start date"
        aria-label-time="Start time"
        value={start}
        onChange={(v) => onChange({ start: v, end })}
        format={format}
        step={step}
        max={end ?? undefined}
        disabled={disabled}
      />
      <span className={styles.rangeSep} aria-hidden="true">
        &rarr;
      </span>
      <DateTimeField
        aria-label-date="End date"
        aria-label-time="End time"
        value={end}
        onChange={(v) => onChange({ start, end: v })}
        format={format}
        step={step}
        min={start ?? undefined}
        disabled={disabled}
        className={endInvalid ? styles.endInvalid : undefined}
      />
    </div>
  );
}
