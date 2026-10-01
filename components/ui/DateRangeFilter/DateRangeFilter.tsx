"use client";

import { Fragment, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { cx } from "../_internal/cx";
import { Portal } from "../_internal/portal";
import { focusableWithin, placePopup } from "../_internal/position";
import { Button } from "../Button/Button";
import { Calendar, type DateRange } from "../DateField/Calendar";
import { addMonths, formatDate, todayIso, type IsoDate } from "../DateField/date-utils";
import { mergeDescribedBy, useField } from "../Field/Field";
import { IconCalendar, IconChevronDown, IconX } from "../Icon/Icon";
import {
  clampRange,
  daysInRange,
  DEFAULT_DATE_RANGE_PRESETS,
  EMPTY_RANGE,
  formatDateRange,
  normaliseRange,
  sameRange,
  type DateRangePreset,
} from "./range-utils";
import styles from "./DateRangeFilter.module.css";

export type DateRangeFilterProps = {
  /** Both null = no filter. A half-picked range never reaches onChange. */
  value: DateRange;
  onChange: (value: DateRange) => void;
  presets?: ReadonlyArray<DateRangePreset>;
  min?: IsoDate;
  max?: IsoDate;
  isDateDisabled?: (date: IsoDate) => boolean;
  /** Shown when no range is set. */
  placeholder?: string;
  /** chip = 32px filter-bar chip. field = form-control height, beside Select. */
  appearance?: "chip" | "field";
  /** Calendars side by side. Defaults to 2, or 1 under 640px. */
  months?: 1 | 2;
  disabled?: boolean;
  invalid?: boolean;
  id?: string;
  /** Names the control. The current range is appended, so it is read too. */
  "aria-label"?: string;
  className?: string;
  /**
   * Show the panel open, in place under the trigger: no portal, no focus
   * move, no outside-click listener. For docs and thumbnails.
   */
  inline?: boolean;
};

/**
 * Date range filter: the reference recessed chip trigger over a presets list
 * and one or two calendars. Picking is a draft: nothing reaches onChange
 * until Apply, and Esc or clicking away puts the old range back. The ✕ on
 * the trigger is its own button and clears at once, without opening.
 *
 * The popover is a small dialog: focus goes into the calendar on open, Tab
 * is held inside it, and focus comes back to the trigger on Apply or Esc.
 */
export function DateRangeFilter({
  value,
  onChange,
  presets = DEFAULT_DATE_RANGE_PRESETS,
  min,
  max,
  isDateDisabled,
  placeholder = "All dates",
  appearance = "chip",
  months: monthsProp,
  disabled,
  invalid: invalidProp,
  id: idProp,
  "aria-label": ariaLabel,
  className,
  inline = false,
}: DateRangeFilterProps) {
  const field = useField();
  const autoId = useId();
  const id = idProp ?? field?.id ?? `daterange-${autoId}`;
  const dialogId = `${id}-dialog`;
  const valueId = `${id}-value`;
  const summaryId = `${id}-summary`;
  const invalid = invalidProp ?? field?.invalid ?? false;

  const [openState, setOpen] = useState(false);
  const open = inline || openState;
  const [draft, setDraft] = useState<DateRange>(() => (inline ? normaliseRange(value) : EMPTY_RANGE));
  const [today, setToday] = useState<IsoDate | null>(null);
  const [months, setMonths] = useState<1 | 2>(2);
  // Bumped when a preset moves the calendar, which remounts it on the new
  // range. Zero only for the mount that opens the popover, which takes focus.
  const [calendarKey, setCalendarKey] = useState(0);

  const anchorRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const applied = normaliseRange(value);
  const hasValue = applied.start !== null;
  const label = formatDateRange(applied) ?? placeholder;

  const openPopover = () => {
    if (disabled) return;
    setDraft(applied);
    setToday(todayIso());
    setMonths(monthsProp ?? (window.matchMedia("(max-width: 639px)").matches ? 1 : 2));
    setCalendarKey(0);
    setOpen(true);
  };

  /** Esc and click-away discard the draft; focus only returns for Esc. */
  const cancel = (returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  const apply = () => {
    const next = normaliseRange(draft);
    if (!sameRange(next, applied)) onChange(next);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const clearValue = () => {
    onChange(EMPTY_RANGE);
    setOpen(false);
    triggerRef.current?.focus();
  };

  // Inline: today is read after mount, as an opening would, so the server
  // and client renders agree.
  useEffect(() => {
    if (!inline) return;
    const frame = requestAnimationFrame(() => setToday(todayIso()));
    return () => cancelAnimationFrame(frame);
  }, [inline]);

  // Position against the trigger, and keep it there through scroll and resize.
  useLayoutEffect(() => {
    if (!open || inline) return;
    const anchor = anchorRef.current;
    const popup = popupRef.current;
    if (!anchor || !popup) return;
    const place = () => placePopup(anchor, popup, { align: "start" });
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, inline, months]);

  // Click away cancels. The trigger toggles itself, so it is excluded.
  useEffect(() => {
    if (!open || inline) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (anchorRef.current?.contains(target) || popupRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, inline]);

  const onPopupKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      // Stop here so an enclosing Modal stays open.
      e.preventDefault();
      e.stopPropagation();
      cancel(true);
      return;
    }
    if (e.key !== "Tab" || !popupRef.current) return;
    // Roving-tabindex days sit at -1; only real tab stops bound the trap.
    const items = focusableWithin(popupRef.current).filter((el) => el.tabIndex >= 0);
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const resolved = today
    ? presets.map((p) => ({ preset: p, range: clampRange(p.range(today), min, max) }))
    : [];
  const draftWhole = draft.start && draft.end ? draft : null;
  const matchedId = draftWhole ? resolved.find((r) => r.range && sameRange(r.range, draftWhole))?.preset.id : undefined;

  const choosePreset = (range: DateRange) => {
    setDraft(range);
    setCalendarKey((k) => k + 1);
  };

  // First pane: with nothing picked, two panes show last month and this one,
  // since a filter looks back from today.
  const defaultMonth = today && months === 2 ? addMonths(today, -1) : (today ?? undefined);

  const summary = (() => {
    if (draft.start && draft.end) {
      const days = daysInRange(draft.start, draft.end);
      return draft.start === draft.end
        ? `${formatDate(draft.start)} only`
        : `${formatDate(draft.start)} to ${formatDate(draft.end)} · ${days} days`;
    }
    if (draft.start) return `From ${formatDate(draft.start)}. Pick an end date, or apply for that day only.`;
    return `No range picked. Showing ${placeholder.toLowerCase()}.`;
  })();

  const isChip = appearance === "chip";
  const labelledBy = !ariaLabel && field?.labelId ? `${field.labelId} ${valueId}` : undefined;

  const popup = (
      <div
        ref={popupRef}
        id={dialogId}
        role="dialog"
        aria-label={ariaLabel ? `Choose ${ariaLabel.toLowerCase()}` : "Choose date range"}
        aria-describedby={summaryId}
        data-surface="solid"
        className={cx(styles.popup, months === 1 && styles.popupNarrow, inline && styles.popupInline)}
        onKeyDown={onPopupKeyDown}
      >
        <div className={styles.body}>
          <ul className={styles.presets} aria-label="Presets">
            {resolved.map(({ preset, range }) => (
              <li key={preset.id}>
                <button
                  type="button"
                  className={cx(styles.preset, preset.id === matchedId && styles.presetActive)}
                  aria-pressed={preset.id === matchedId}
                  disabled={!range}
                  onClick={() => range && choosePreset(range)}
                >
                  {preset.label}
                </button>
              </li>
            ))}
          </ul>

          <div className={styles.calendars}>
            <Calendar
              key={calendarKey}
              range={draft}
              onRangeChange={setDraft}
              min={min}
              max={max}
              isDateDisabled={isDateDisabled}
              defaultMonth={defaultMonth}
              numberOfMonths={months}
              autoFocus={!inline && calendarKey === 0}
            />
          </div>
        </div>

        <div className={styles.footer}>
          <p id={summaryId} className={cx(styles.summary, draft.start && styles.summarySet)} aria-live="polite">
            {summary}
          </p>
          <div className={styles.actions}>
            <Button
              variant="ghost"
              size="sm"
              disabled={!draft.start}
              onClick={() => {
                setDraft(EMPTY_RANGE);
                popupRef.current?.querySelector<HTMLButtonElement>("[data-date][tabindex='0']")?.focus();
              }}
            >
              Clear
            </Button>
            <Button size="sm" onClick={apply}>
              Apply
            </Button>
          </div>
        </div>
      </div>
  );

  const Wrap = inline ? "span" : Fragment;
  return (
    <Wrap {...(inline ? { className: styles.inlineWrap } : {})}>
      <span data-slot="date-range-filter" ref={anchorRef} className={cx(styles.root, !isChip && styles.rootField, className)}>
        <button
          ref={triggerRef}
          id={id}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? dialogId : undefined}
          aria-invalid={invalid || undefined}
          aria-label={ariaLabel ? `${ariaLabel}: ${label}` : undefined}
          aria-labelledby={labelledBy}
          aria-describedby={mergeDescribedBy(field?.describedBy)}
          disabled={disabled}
          onClick={() => {
            if (inline) return;
            if (open) cancel(false);
            else openPopover();
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown" && !open) {
              e.preventDefault();
              openPopover();
            } else if (e.key === "Escape" && open) {
              e.preventDefault();
              e.stopPropagation();
              cancel(true);
            }
          }}
          className={cx(
            isChip ? styles.chip : styles.field,
            hasValue && styles.active,
            hasValue && !disabled && styles.clearable,
            open && styles.open,
          )}
        >
          <IconCalendar size={isChip ? 12 : 16} className={styles.icon} />
          <span id={valueId} className={cx(styles.value, !hasValue && styles.placeholder)}>
            {label}
          </span>
          {hasValue && !disabled ? null : <IconChevronDown size={isChip ? 13 : 16} className={styles.chevron} />}
        </button>

        {hasValue && !disabled ? (
          <button
            type="button"
            className={styles.clear}
            aria-label={`Clear ${ariaLabel ? ariaLabel.toLowerCase() : "date range"}`}
            onClick={clearValue}
          >
            <IconX size={isChip ? 12 : 14} />
          </button>
        ) : null}
      </span>

      {open && today ? (inline ? popup : <Portal>{popup}</Portal>) : null}
    </Wrap>
  );
}
