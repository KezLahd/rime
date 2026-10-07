"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { cx } from "../_internal/cx";
import { Portal } from "../_internal/portal";
import { placePopup } from "../_internal/position";
import { mergeDescribedBy, useField } from "../Field/Field";
import { IconAlertCircle, IconClock } from "../Icon/Icon";
import boxStyles from "../TextInput/TextInput.module.css";
import {
  compareTime,
  formatTimeInput,
  makeTime,
  parseTime,
  parseTimeInput,
  snapTime,
  toMinutes,
  type Time,
} from "./time-utils";
import styles from "./TimeField.module.css";

export type TimeFieldProps = {
  value: Time | null;
  /** null when cleared or when the typed text can't be read as a time. */
  onChange: (value: Time | null) => void;
  /** 24h is the default. 12h shows "9:30 AM" and parses am/pm. */
  format?: "12h" | "24h";
  /** Minute granularity for the popup list (default 15). Set to 1 for a free picker. */
  step?: number;
  min?: Time;
  max?: Time;
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  placeholder?: string;
  "aria-label"?: string;
  className?: string;
  /** Keep the popup rendered open under the field (for docs). */
  inline?: boolean;
};

/**
 * A time of day with a typed field and a popup picker. Typing is the fast
 * path when you already know the time ("3pm", "0930", "14:30"); the picker
 * lists times at `step` minutes between `min` and `max` for people who want
 * to click. The value is "HH:MM" 24h regardless of display format, so it
 * sorts, compares and serialises predictably.
 */
export function TimeField({
  value,
  onChange,
  format = "24h",
  step = 15,
  min,
  max,
  invalid: invalidProp,
  disabled,
  required,
  id: idProp,
  name,
  placeholder,
  "aria-label": ariaLabel,
  className,
  inline = false,
}: TimeFieldProps) {
  const field = useField();
  const autoId = useId();
  const id = idProp ?? field?.id ?? `time-${autoId}`;
  const problemId = `${id}-format`;

  const [draft, setDraft] = useState(formatTimeInput(value, format));
  const [synced, setSynced] = useState<Time | null>(value);
  const [problem, setProblem] = useState<string | null>(null);
  const [openState, setOpen] = useState(false);
  const open = inline || openState;

  // Adopt a new value from the parent (reset, prefill) without an effect.
  if (value !== synced) {
    setSynced(value);
    setDraft(formatTimeInput(value, format));
    setProblem(null);
  }

  const boxRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const invalid = invalidProp ?? (Boolean(field?.invalid) || Boolean(problem));
  const defaultPlaceholder = format === "12h" ? "9:30 AM" : "HH:MM";

  const reason = (t: Time): string | null => {
    if (min && compareTime(t, min) < 0) return `Enter a time on or after ${formatTimeInput(min, format)}.`;
    if (max && compareTime(t, max) > 0) return `Enter a time on or before ${formatTimeInput(max, format)}.`;
    return null;
  };

  const commitText = () => {
    const text = draft.trim();
    if (!text) {
      setProblem(null);
      if (value !== null) {
        setSynced(null);
        onChange(null);
      }
      return;
    }
    const parsed = parseTimeInput(text);
    const snapped = parsed ? snapTime(parsed, step, "round") : null;
    const why = snapped ? reason(snapped) : "Enter a time like 9:30 or 14:30.";
    if (!snapped || why) {
      setProblem(why);
      setSynced(null);
      if (value !== null) onChange(null);
      return;
    }
    setProblem(null);
    setDraft(formatTimeInput(snapped, format));
    setSynced(snapped);
    if (snapped !== value) onChange(snapped);
  };

  const pick = (t: Time) => {
    setProblem(null);
    setDraft(formatTimeInput(t, format));
    setSynced(t);
    onChange(t);
    setOpen(false);
    if (!inline) toggleRef.current?.focus();
  };

  const closePopup = (returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) toggleRef.current?.focus();
  };

  useLayoutEffect(() => {
    if (!open || inline) return;
    const box = boxRef.current;
    const popup = popupRef.current;
    if (!box || !popup) return;
    const place = () => placePopup(box, popup, { align: "start" });
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, inline]);

  useEffect(() => {
    if (!open || inline) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (boxRef.current?.contains(target) || popupRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, inline]);

  const onPopupKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      closePopup(true);
    }
  };

  const popup = (
    <div
      ref={popupRef}
      role="dialog"
      aria-label="Choose time"
      className={cx(styles.popup, inline && styles.popupInline)}
      onKeyDown={onPopupKeyDown}
    >
      <TimePickerBody value={value} onPick={pick} step={step} format={format} min={min} max={max} />
    </div>
  );

  return (
    <div data-slot="time-field" className={cx(styles.root, inline && styles.rootInline, className)}>
      <div
        ref={boxRef}
        className={cx(boxStyles.box, boxStyles.md, invalid && boxStyles.invalid, disabled && boxStyles.disabled, open && styles.open)}
      >
        <input
          id={id}
          name={name}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          className={cx(boxStyles.input, styles.input)}
          placeholder={placeholder ?? defaultPlaceholder}
          value={draft}
          disabled={disabled}
          required={required ?? field?.required}
          aria-label={ariaLabel}
          aria-invalid={invalid || undefined}
          aria-describedby={mergeDescribedBy(field?.describedBy, problem ? problemId : undefined)}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitText}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitText();
            } else if (e.key === "ArrowDown" && e.altKey) {
              e.preventDefault();
              setOpen(true);
            }
          }}
        />
        <button
          ref={toggleRef}
          type="button"
          className={styles.toggle}
          onClick={() => {
            if (inline) return;
            if (open) closePopup(false);
            else setOpen(true);
          }}
          disabled={disabled}
          aria-label={open ? "Close time picker" : "Choose time from list"}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <IconClock size={16} />
        </button>
      </div>

      {problem ? (
        <p id={problemId} className={styles.problem}>
          <IconAlertCircle size={14} />
          <span>{problem}</span>
        </p>
      ) : null}

      {open ? (inline ? popup : <Portal>{popup}</Portal>) : null}
    </div>
  );
}

/**
 * The popup body: hour and minute columns side by side (plus AM/PM when
 * format is "12h"), each a scrollable list auto-centered on the current
 * value. Clicking a cell picks that time and closes the popup.
 */
function TimePickerBody({
  value,
  onPick,
  step,
  format,
  min,
  max,
}: {
  value: Time | null;
  onPick: (t: Time) => void;
  step: number;
  format: "12h" | "24h";
  min?: Time;
  max?: Time;
}) {
  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);

  const current = value ?? makeTime(new Date().getHours(), 0);
  const { h: curH, m: curM } = parseTime(current);

  // Hour choices depend on format: 1-12 for 12h (with period column), 0-23 for 24h.
  const hourChoices = format === "12h" ? Array.from({ length: 12 }, (_, i) => i + 1) : Array.from({ length: 24 }, (_, i) => i);
  const minuteChoices = Array.from({ length: Math.ceil(60 / step) }, (_, i) => i * step);
  const periodChoices = format === "12h" ? (["AM", "PM"] as const) : null;

  const activeHour12 = curH % 12 === 0 ? 12 : curH % 12;
  const activeHour = format === "12h" ? activeHour12 : curH;
  const activePeriod: "AM" | "PM" = curH >= 12 ? "PM" : "AM";

  const buildTime = (h: number, m: number, p: "AM" | "PM" | null): Time => {
    let H = h;
    if (format === "12h" && p) {
      if (p === "AM") H = h === 12 ? 0 : h;
      else H = h === 12 ? 12 : h + 12;
    }
    return makeTime(H, m);
  };

  const isDisabled = (t: Time) => {
    if (min && compareTime(t, min) < 0) return true;
    if (max && compareTime(t, max) > 0) return true;
    return false;
  };

  // Scroll the three columns so the active cell is centered when the popup opens.
  useLayoutEffect(() => {
    const scrollActiveIntoCenter = (col: HTMLDivElement | null) => {
      if (!col) return;
      const active = col.querySelector<HTMLElement>("[data-active='true']");
      if (!active) return;
      const colBox = col.getBoundingClientRect();
      const activeBox = active.getBoundingClientRect();
      col.scrollTop += activeBox.top - colBox.top - colBox.height / 2 + activeBox.height / 2;
    };
    scrollActiveIntoCenter(hoursRef.current);
    scrollActiveIntoCenter(minutesRef.current);
    scrollActiveIntoCenter(periodRef.current);
  }, []);

  return (
    <div className={styles.body}>
      <div ref={hoursRef} className={styles.col} role="listbox" aria-label="Hour">
        {hourChoices.map((h) => {
          const t = buildTime(h, curM, format === "12h" ? activePeriod : null);
          const active = h === activeHour;
          const dis = isDisabled(t);
          return (
            <button
              key={h}
              type="button"
              role="option"
              aria-selected={active}
              data-active={active || undefined}
              disabled={dis}
              className={cx(styles.cell, active && styles.cellActive)}
              onClick={() => onPick(t)}
            >
              {String(h).padStart(2, "0")}
            </button>
          );
        })}
      </div>

      <div className={styles.sep} aria-hidden="true">:</div>

      <div ref={minutesRef} className={styles.col} role="listbox" aria-label="Minute">
        {minuteChoices.map((m) => {
          const t = buildTime(activeHour, m, format === "12h" ? activePeriod : null);
          const active = m === curM || (step > 1 && Math.abs(m - curM) < step && m <= curM);
          const dis = isDisabled(t);
          return (
            <button
              key={m}
              type="button"
              role="option"
              aria-selected={active}
              data-active={active || undefined}
              disabled={dis}
              className={cx(styles.cell, active && styles.cellActive)}
              onClick={() => onPick(t)}
            >
              {String(m).padStart(2, "0")}
            </button>
          );
        })}
      </div>

      {periodChoices ? (
        <div ref={periodRef} className={cx(styles.col, styles.periodCol)} role="listbox" aria-label="AM or PM">
          {periodChoices.map((p) => {
            const t = buildTime(activeHour, curM, p);
            const active = p === activePeriod;
            const dis = isDisabled(t);
            return (
              <button
                key={p}
                type="button"
                role="option"
                aria-selected={active}
                data-active={active || undefined}
                disabled={dis}
                className={cx(styles.cell, active && styles.cellActive)}
                onClick={() => onPick(t)}
              >
                {p}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

// ── Range ────────────────────────────────────────────────────────────────

export type TimeRange = { start: Time | null; end: Time | null };

export type TimeRangeFieldProps = {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
  format?: "12h" | "24h";
  step?: number;
  /** When true, flag an end at or before start as invalid. Default true. */
  requireEndAfterStart?: boolean;
  min?: Time;
  max?: Time;
  disabled?: boolean;
  className?: string;
  "aria-label-start"?: string;
  "aria-label-end"?: string;
};

/**
 * Start + end pair, laid out on one row with an en dash between the two
 * fields. Flags "end at or before start" as a problem on the end field
 * so the whole row visibly disagrees; the parent can rely on both values
 * being present and ordered before accepting a submit.
 */
export function TimeRangeField({
  value,
  onChange,
  format = "24h",
  step = 15,
  requireEndAfterStart = true,
  min,
  max,
  disabled,
  className,
  "aria-label-start": ariaStart = "Start time",
  "aria-label-end": ariaEnd = "End time",
}: TimeRangeFieldProps) {
  const { start, end } = value;
  const endInvalid =
    requireEndAfterStart && start !== null && end !== null && toMinutes(end) <= toMinutes(start);

  return (
    <div className={cx(styles.range, className)} data-slot="time-range-field">
      <TimeField
        aria-label={ariaStart}
        value={start}
        onChange={(t) => onChange({ start: t, end })}
        format={format}
        step={step}
        min={min}
        max={max}
        disabled={disabled}
      />
      <span className={styles.rangeSep} aria-hidden="true">
        &ndash;
      </span>
      <TimeField
        aria-label={ariaEnd}
        value={end}
        onChange={(t) => onChange({ start, end: t })}
        format={format}
        step={step}
        min={start ?? min}
        max={max}
        invalid={endInvalid || undefined}
        disabled={disabled}
      />
    </div>
  );
}
