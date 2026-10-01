"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { cx } from "../_internal/cx";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "../Icon/Icon";
import {
  addDays,
  addMonths,
  compareIso,
  daysInMonth,
  formatDateLong,
  MONTH_NAMES,
  MONTH_SHORT,
  monthLabel,
  parseIso,
  toIso,
  todayIso,
  weekdayIndex,
  WEEKDAY_NAMES,
  WEEKDAY_SHORT,
  type IsoDate,
} from "./date-utils";
import styles from "./Calendar.module.css";

/** An inclusive span of days. Either end may be open while it is being picked. */
export type DateRange = { start: IsoDate | null; end: IsoDate | null };

/**
 * The range after picking a day: the first pick starts it, the second ends it,
 * and a day before the start (or any pick once both ends are set) starts over.
 */
export function nextRange(range: DateRange, iso: IsoDate): DateRange {
  if (!range.start || range.end) return { start: iso, end: null };
  if (compareIso(iso, range.start) < 0) return { start: iso, end: null };
  return { start: range.start, end: iso };
}

type CalendarBaseProps = {
  /** Days that cannot be picked. Still focusable, so keyboard users can pass over them. */
  isDateDisabled?: (date: IsoDate) => boolean;
  min?: IsoDate;
  max?: IsoDate;
  /** Month shown first when there is no value. Defaults to today's month. */
  defaultMonth?: IsoDate;
  /** Moves focus into the grid on mount (used by DateField's popup). */
  autoFocus?: boolean;
  /** Months side by side. Navigation moves them together. */
  numberOfMonths?: 1 | 2;
  /**
   * label: the month and year as a heading, with month and year arrows.
   * dropdown: Month ▾ and Year ▾ buttons that open quick pickers, for dates
   * years away such as a date of birth (a sign-up form). Month
   * arrows stay. Two-month calendars always use labels.
   */
  captionLayout?: "label" | "dropdown";
  /**
   * First and last years the Year picker lists (dropdown only). Default to
   * min's and max's years, else 100 years back and 10 on. They also bound the
   * arrows and keyboard paging, so the grid never shows a year the picker lacks.
   */
  fromYear?: number;
  toYear?: number;
  className?: string;
};

type SingleProps = {
  value: IsoDate | null;
  onChange: (value: IsoDate) => void;
  range?: never;
  onRangeChange?: never;
};

type RangeProps = {
  /** Range mode. After a start is picked, hovering or arrowing previews the range. */
  range: DateRange;
  onRangeChange: (range: DateRange) => void;
  value?: never;
  onChange?: never;
};

export type CalendarProps = CalendarBaseProps & (SingleProps | RangeProps);

type Picker = "month" | "year";

const monthIndex = (iso: IsoDate) => {
  const { y, m } = parseIso(iso);
  return y * 12 + (m - 1);
};

const later = (a: IsoDate | undefined, b: IsoDate) => (a && compareIso(a, b) > 0 ? a : b);
const earlier = (a: IsoDate | undefined, b: IsoDate) => (a && compareIso(a, b) < 0 ? a : b);

// Columns in each quick picker; arrow up and down move by a row.
const MONTH_COLS = 3;
const YEAR_COLS = 4;

/**
 * Month grid, Monday first. Arrow keys move by day and week, Home/End to the
 * week's ends, PageUp/PageDown by month (Shift for year), Enter or Space picks.
 * Only the focused day is in the tab order (roving tabindex).
 *
 * With captionLayout="dropdown" the caption's Month and Year buttons swap the
 * grid for a month grid or a year list, in the same footprint so the popup
 * never jumps. Arrows move through the picker, Enter picks, Esc goes back to
 * the days (and stops there, so an enclosing popup stays open).
 */
export function Calendar({
  value,
  onChange,
  range,
  onRangeChange,
  isDateDisabled,
  min: minProp,
  max: maxProp,
  defaultMonth,
  autoFocus,
  numberOfMonths = 1,
  captionLayout = "label",
  fromYear,
  toYear,
  className,
}: CalendarProps) {
  const idBase = `cal-${useId()}`;
  const [today] = useState(todayIso);
  const count = numberOfMonths;
  const isRange = range !== undefined;
  const dropdown = captionLayout === "dropdown" && count === 1;

  // In dropdown mode the year span is a hard bound too, folded into min/max.
  const thisYear = parseIso(today).y;
  const firstYear = fromYear ?? (minProp ? parseIso(minProp).y : thisYear - 100);
  const lastYear = toYear ?? (maxProp ? parseIso(maxProp).y : thisYear + 10);
  const min = dropdown ? later(minProp, toIso(firstYear, 1, 1)) : minProp;
  const max = dropdown ? earlier(maxProp, toIso(lastYear, 12, 31)) : maxProp;

  const clamp = (iso: IsoDate) => {
    if (min && compareIso(iso, min) < 0) return min;
    if (max && compareIso(iso, max) > 0) return max;
    return iso;
  };

  // Single mode opens on the value. Range mode opens on the range's start,
  // and focuses today when no range is set and today is on screen.
  const [initial] = useState(() => {
    if (!isRange) {
      // Dropdown mode can't show a year outside its list, so it opens within it.
      const wanted = value ?? defaultMonth ?? today;
      const start = dropdown ? clamp(wanted) : wanted;
      return { view: start, focus: start };
    }
    const anchor = range.start ?? range.end;
    const view = anchor ?? defaultMonth ?? today;
    const offset = monthIndex(today) - monthIndex(view);
    return { view, focus: anchor ?? (offset >= 0 && offset < count ? today : view) };
  });
  const [focused, setFocused] = useState<IsoDate>(initial.focus);
  const [view, setView] = useState(() => {
    const { y, m } = parseIso(initial.view);
    return { y, m };
  });
  const [hover, setHover] = useState<IsoDate | null>(null);
  const [picker, setPicker] = useState<Picker | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const monthButtonRef = useRef<HTMLButtonElement>(null);
  const yearButtonRef = useRef<HTMLButtonElement>(null);
  const moveFocus = useRef(Boolean(autoFocus));

  const outOfRange = (iso: IsoDate) => (min ? compareIso(iso, min) < 0 : false) || (max ? compareIso(iso, max) > 0 : false);
  const unavailable = (iso: IsoDate) => outOfRange(iso) || Boolean(isDateDisabled?.(iso));

  const viewIndex = view.y * 12 + (view.m - 1);
  const isVisibleMonth = (iso: IsoDate) => {
    const i = monthIndex(iso);
    return i >= viewIndex && i < viewIndex + count;
  };

  const goTo = (iso: IsoDate, focus: boolean) => {
    const next = clamp(iso);
    setFocused(next);
    // Page only when the day leaves the visible months, so arrowing across
    // the gap between two months does not jump both panes.
    if (!isVisibleMonth(next)) {
      const lead = monthIndex(next) < viewIndex ? next : addMonths(next, -(count - 1));
      const { y, m } = parseIso(lead);
      setView({ y, m });
    }
    moveFocus.current = focus;
  };

  const shiftMonth = (months: number) => {
    const first = toIso(view.y, view.m, 1);
    const target = addMonths(first, months);
    const { y, m } = parseIso(target);
    setView({ y, m });
    // Keep the focused day in the visible month, clamped to its length.
    setFocused(clamp(addMonths(focused, months)));
    moveFocus.current = false;
  };

  useEffect(() => {
    if (!moveFocus.current) return;
    rootRef.current?.querySelector<HTMLButtonElement>(`[data-date="${focused}"]`)?.focus();
    moveFocus.current = false;
  }, [focused]);

  // A picker opens on the current month or year, scrolled to the middle of
  // the list so the years either side are in reach.
  useEffect(() => {
    if (!picker) return;
    const current = pickerRef.current?.querySelector<HTMLButtonElement>('[aria-selected="true"]');
    if (!current) return;
    current.scrollIntoView({ block: "center" });
    current.focus({ preventScroll: true });
  }, [picker]);

  const pick = (iso: IsoDate) => {
    if (unavailable(iso)) return;
    if (range && onRangeChange) onRangeChange(nextRange(range, iso));
    else onChange?.(iso);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const map: Record<string, () => IsoDate> = {
      ArrowLeft: () => addDays(focused, -1),
      ArrowRight: () => addDays(focused, 1),
      ArrowUp: () => addDays(focused, -7),
      ArrowDown: () => addDays(focused, 7),
      Home: () => addDays(focused, -weekdayIndex(focused)),
      End: () => addDays(focused, 6 - weekdayIndex(focused)),
      PageUp: () => addMonths(focused, e.shiftKey ? -12 : -1),
      PageDown: () => addMonths(focused, e.shiftKey ? 12 : 1),
    };
    const fn = map[e.key];
    if (fn) {
      e.preventDefault();
      goTo(fn(), true);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pick(focused);
    }
  };

  // ── Quick pickers ───────────────────────────────────────────────────────

  const triggerFor = (which: Picker) => (which === "month" ? monthButtonRef : yearButtonRef);

  const closePicker = (which: Picker) => {
    setPicker(null);
    triggerFor(which).current?.focus();
  };

  /** Moves the view to a month, keeping the focused day's number where it fits. */
  const showMonth = (y: number, m: number, which: Picker) => {
    const { d } = parseIso(focused);
    const target = clamp(toIso(y, m, Math.min(d, daysInMonth(y, m))));
    const shown = parseIso(target);
    setView({ y: shown.y, m: shown.m });
    setFocused(target);
    moveFocus.current = false;
    closePicker(which);
  };

  const monthOutOfBounds = (y: number, m: number) =>
    (min ? compareIso(toIso(y, m, daysInMonth(y, m)), min) < 0 : false) ||
    (max ? compareIso(toIso(y, m, 1), max) > 0 : false);

  const onPickerKeyDown = (e: KeyboardEvent<HTMLDivElement>, which: Picker) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      closePicker(which);
      return;
    }
    const cols = which === "month" ? MONTH_COLS : YEAR_COLS;
    const options = Array.from(pickerRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? []);
    const at = options.indexOf(document.activeElement as HTMLButtonElement);
    if (at === -1) return;
    const step: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -cols,
      ArrowDown: cols,
      PageUp: -cols * 3,
      PageDown: cols * 3,
      Home: -at,
      End: options.length - 1 - at,
    };
    if (!(e.key in step)) return;
    e.preventDefault();
    const next = Math.max(0, Math.min(options.length - 1, at + step[e.key]));
    options[next].focus();
    options[next].scrollIntoView({ block: "nearest" });
  };

  const renderPicker = (which: Picker) => {
    if (which === "month") {
      return (
        <div
          ref={pickerRef}
          role="listbox"
          aria-label={`Month, ${view.y}`}
          className={cx(styles.picker, styles.monthPicker)}
          onKeyDown={(e) => onPickerKeyDown(e, "month")}
        >
          {MONTH_SHORT.map((label, i) => {
            const m = i + 1;
            const selected = m === view.m;
            const blocked = monthOutOfBounds(view.y, m);
            return (
              <button
                key={label}
                type="button"
                role="option"
                aria-selected={selected}
                aria-label={MONTH_NAMES[i]}
                aria-disabled={blocked || undefined}
                tabIndex={selected ? 0 : -1}
                className={cx(styles.pickerOption, selected && styles.pickerSelected, blocked && styles.pickerBlocked)}
                onClick={() => {
                  if (!blocked) showMonth(view.y, m, "month");
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      );
    }
    const lo = min ? parseIso(min).y : firstYear;
    const hi = max ? parseIso(max).y : lastYear;
    const years = Array.from({ length: Math.max(0, hi - lo + 1) }, (_, i) => lo + i);
    return (
      <div
        ref={pickerRef}
        role="listbox"
        aria-label="Year"
        className={cx(styles.picker, styles.yearPicker)}
        onKeyDown={(e) => onPickerKeyDown(e, "year")}
      >
        {years.map((y) => {
          const selected = y === view.y;
          return (
            <button
              key={y}
              type="button"
              role="option"
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              className={cx(styles.pickerOption, selected && styles.pickerSelected, y === thisYear && styles.pickerCurrent)}
              onClick={() => showMonth(y, view.m, "year")}
            >
              {y}
            </button>
          );
        })}
      </div>
    );
  };

  // ── Range band ──────────────────────────────────────────────────────────

  // Range ends. A lone end is treated as the start. While only the start is
  // set, the hovered (or keyboard-focused) day stands in as a provisional end.
  const rangeStart = range ? (range.start ?? range.end) : null;
  const committedEnd = range?.start ? range.end : null;
  const previewEnd =
    isRange && rangeStart && !committedEnd && hover && compareIso(hover, rangeStart) >= 0 ? hover : null;
  const rangeEnd = committedEnd ?? previewEnd;
  const spans = Boolean(rangeStart && rangeEnd && rangeStart !== rangeEnd);

  const firstOfView = toIso(view.y, view.m, 1);
  const canPrevMonth = !min || compareIso(addDays(firstOfView, -1), min) >= 0;
  const canNextMonth = !max || compareIso(addMonths(firstOfView, count), max) <= 0;
  const canPrevYear = !min || compareIso(addDays(addMonths(firstOfView, -11), -1), min) >= 0;
  const canNextYear = !max || compareIso(addMonths(firstOfView, 12 + count - 1), max) <= 0;

  // With a picker open the arrows would page a grid that isn't showing.
  const navLocked = picker !== null;
  const prevNav = (
    <div className={styles.navGroup}>
      {dropdown ? null : (
        <button type="button" className={styles.nav} onClick={() => shiftMonth(-12)} disabled={!canPrevYear} aria-label="Previous year">
          <IconChevronsLeft size={15} />
        </button>
      )}
      <button
        type="button"
        className={styles.nav}
        onClick={() => shiftMonth(-1)}
        disabled={!canPrevMonth || navLocked}
        aria-label="Previous month"
      >
        <IconChevronLeft size={15} />
      </button>
    </div>
  );
  const nextNav = (
    <div className={styles.navGroup}>
      <button
        type="button"
        className={styles.nav}
        onClick={() => shiftMonth(1)}
        disabled={!canNextMonth || navLocked}
        aria-label="Next month"
      >
        <IconChevronRight size={15} />
      </button>
      {dropdown ? null : (
        <button type="button" className={styles.nav} onClick={() => shiftMonth(12)} disabled={!canNextYear} aria-label="Next year">
          <IconChevronsRight size={15} />
        </button>
      )}
    </div>
  );
  // Holds the caption centred in a pane that carries only one nav group.
  const navSpacer = <div className={styles.navSpacer} aria-hidden="true" />;

  const captionButton = (which: Picker, label: string) => (
    <button
      ref={triggerFor(which)}
      type="button"
      className={styles.captionButton}
      aria-haspopup="listbox"
      aria-expanded={picker === which}
      aria-label={`${which === "month" ? "Month" : "Year"}: ${label}. Change`}
      onClick={() => (picker === which ? closePicker(which) : setPicker(which))}
    >
      <span>{label}</span>
      <IconChevronDown size={14} className={styles.captionChevron} />
    </button>
  );

  const renderMonth = (index: number) => {
    const first = addMonths(firstOfView, index);
    const { y, m: month } = parseIso(first);
    const captionId = `${idBase}-${index}`;
    // Six rows from the Monday on or before the 1st, so height never jumps.
    const gridStart = addDays(first, -weekdayIndex(first));
    const weeks = Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, d) => addDays(gridStart, w * 7 + d)));

    return (
      <div key={first} className={styles.month}>
        <div className={styles.caption}>
          {index === 0 ? prevNav : navSpacer}
          {dropdown ? (
            <>
              <div className={styles.captionButtons}>
                {captionButton("month", MONTH_NAMES[month - 1])}
                {captionButton("year", String(y))}
              </div>
              <p id={captionId} className="sr-only" aria-live="polite">
                {monthLabel(y, month)}
              </p>
            </>
          ) : (
            <p id={captionId} className={styles.captionLabel} aria-live="polite">
              {monthLabel(y, month)}
            </p>
          )}
          {index === count - 1 ? nextNav : navSpacer}
        </div>

        {dropdown && picker ? (
          renderPicker(picker)
        ) : (
          <div
            role="grid"
            aria-labelledby={captionId}
            aria-multiselectable={isRange || undefined}
            className={styles.grid}
            onKeyDown={onKeyDown}
          >
            <div role="row" className={styles.row}>
              {WEEKDAY_SHORT.map((d, i) => (
                <span key={d} role="columnheader" aria-label={WEEKDAY_NAMES[i]} className={styles.head}>
                  {d}
                </span>
              ))}
            </div>
            {weeks.map((week) => (
              <div role="row" key={week[0]} className={styles.row}>
                {week.map((iso) => {
                  const { m, d } = parseIso(iso);
                  // Days from the neighbouring months are not drawn: the grid shows one month, and the empty cells
                  // keep every date under its weekday. Arrowing or paging past
                  // the month's edge still works; it turns the page.
                  if (m !== month) {
                    return <span role="gridcell" key={iso} className={cx(styles.cell, styles.empty)} />;
                  }
                  const lastOfMonth = parseIso(addDays(iso, 1)).m !== month;

                  const isDisabled = unavailable(iso);
                  const isStart = isRange && iso === rangeStart;
                  const isEnd = isRange && iso === rangeEnd;
                  const inMiddle =
                    spans && compareIso(iso, rangeStart as IsoDate) > 0 && compareIso(iso, rangeEnd as IsoDate) < 0;
                  const isPreviewEnd = isEnd && !committedEnd && !isStart;
                  const isSelected = isRange
                    ? isStart || (Boolean(committedEnd) && (isEnd || inMiddle))
                    : iso === value;

                  return (
                    <span
                      role="gridcell"
                      key={iso}
                      aria-selected={isSelected || undefined}
                      className={cx(
                        styles.cell,
                        spans && isStart && styles.bandStart,
                        spans && isEnd && styles.bandEnd,
                        inMiddle && styles.bandMiddle,
                        // A band that carries on from the previous month, or
                        // into the next, is cut square at the month's edge: the
                        // range hasn't ended there. Only
                        // the range's real ends are rounded.
                        inMiddle && d === 1 && styles.bandContinuesIn,
                        inMiddle && lastOfMonth && styles.bandContinuesOut,
                        isRange && !committedEnd && styles.bandPreview,
                      )}
                    >
                      <button
                        type="button"
                        data-date={iso}
                        tabIndex={iso === focused ? 0 : -1}
                        aria-label={formatDateLong(iso)}
                        aria-current={iso === today ? "date" : undefined}
                        aria-disabled={isDisabled || undefined}
                        onClick={() => {
                          setFocused(iso);
                          pick(iso);
                        }}
                        onMouseEnter={isRange && !isDisabled ? () => setHover(iso) : undefined}
                        onFocus={isRange ? () => setHover(iso) : undefined}
                        className={cx(
                          styles.day,
                          iso === today && styles.today,
                          (isStart || (isEnd && !isPreviewEnd) || (!isRange && isSelected)) && styles.selected,
                          spans && isStart && styles.rangeStart,
                          spans && isEnd && !isPreviewEnd && styles.rangeEnd,
                          isPreviewEnd && styles.previewEnd,
                          inMiddle && styles.rangeMiddle,
                          isDisabled && styles.disabled,
                        )}
                      >
                        {d}
                      </button>
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div data-slot="calendar"
      ref={rootRef}
      className={cx(styles.calendar, isRange && styles.range, count > 1 && styles.multi, className)}
      onMouseLeave={isRange ? () => setHover(null) : undefined}
    >
      {Array.from({ length: count }, (_, i) => renderMonth(i))}
    </div>
  );
}
