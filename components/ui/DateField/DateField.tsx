"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { cx } from "../_internal/cx";
import { Portal } from "../_internal/portal";
import { placePopup } from "../_internal/position";
import { mergeDescribedBy, useField } from "../Field/Field";
import { IconAlertCircle, IconCalendar } from "../Icon/Icon";
import boxStyles from "../TextInput/TextInput.module.css";
import { Calendar } from "./Calendar";
import { addMonths, compareIso, formatDateInput, parseDateInput, parseIso, todayIso, type IsoDate } from "./date-utils";
import styles from "./DateField.module.css";

export type DateFieldProps = {
  value: IsoDate | null;
  /** null when cleared or when the typed text is not a usable date. */
  onChange: (value: IsoDate | null) => void;
  isDateDisabled?: (date: IsoDate) => boolean;
  min?: IsoDate;
  max?: IsoDate;
  /** Month the calendar opens on when empty. For a date of birth, pass ~40 years ago (or use preset="dob"). */
  defaultMonth?: IsoDate;
  /**
   * dob: a date of birth, set up as a sign-up form does it. Month
   * and Year dropdowns in the calendar, years 1920 to this year, no future
   * dates, and an empty field opens 40 years back. Any prop passed explicitly
   * wins over the preset.
   */
  preset?: "dob";
  /** The calendar's caption. dropdown gives Month ▾ and Year ▾ quick pickers; see Calendar. */
  captionLayout?: "label" | "dropdown";
  /** Year span of the Year picker (dropdown caption only). */
  fromYear?: number;
  toYear?: number;
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  placeholder?: string;
  "aria-label"?: string;
  className?: string;
  /**
   * Show the calendar open, in place under the field: no portal, no focus
   * move, no outside-click listener. For docs and thumbnails.
   */
  inline?: boolean;
};

/** Earliest year the dob preset lists. 1920 covers anyone alive today. */
const DOB_FIRST_YEAR = 1920;
/** An empty date of birth opens here: about the middle of the adult range. */
const DOB_OPENS_YEARS_BACK = 40;

/**
 * Typed entry (DD/MM/YYYY) with a calendar popup. Typing is the fast path for
 * a date of birth decades back; the calendar is there for recent dates. Text
 * is parsed on blur, and an unusable entry is kept on screen with a reason
 * rather than silently wiped.
 */
export function DateField({
  value,
  onChange,
  isDateDisabled,
  min,
  max: maxProp,
  defaultMonth: defaultMonthProp,
  preset,
  captionLayout: captionLayoutProp,
  fromYear: fromYearProp,
  toYear: toYearProp,
  invalid: invalidProp,
  disabled,
  required,
  id: idProp,
  name,
  placeholder = "DD/MM/YYYY",
  "aria-label": ariaLabel,
  className,
  inline = false,
}: DateFieldProps) {
  const field = useField();
  const autoId = useId();
  const id = idProp ?? field?.id ?? `date-${autoId}`;
  const problemId = `${id}-format`;

  const [draft, setDraft] = useState(formatDateInput(value));
  const [synced, setSynced] = useState<IsoDate | null>(value);
  const [problem, setProblem] = useState<string | null>(null);
  const [openState, setOpen] = useState(false);
  const open = inline || openState;

  // The dob preset fills in whatever the caller left unset.
  const [today] = useState(todayIso);
  const dob = preset === "dob";
  const max = maxProp ?? (dob ? today : undefined);
  const defaultMonth = defaultMonthProp ?? (dob ? addMonths(today, -12 * DOB_OPENS_YEARS_BACK) : undefined);
  const captionLayout = captionLayoutProp ?? (dob ? "dropdown" : "label");
  const fromYear = fromYearProp ?? (dob ? DOB_FIRST_YEAR : undefined);
  const toYear = toYearProp ?? (dob ? parseIso(today).y : undefined);

  // Adopt a new value from the parent (a reset, a prefill) without an effect.
  if (value !== synced) {
    setSynced(value);
    setDraft(formatDateInput(value));
    setProblem(null);
  }

  const boxRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const invalid = invalidProp ?? (Boolean(field?.invalid) || Boolean(problem));

  const reason = (iso: IsoDate): string | null => {
    if (min && compareIso(iso, min) < 0) return `Enter a date on or after ${formatDateInput(min)}.`;
    if (max && compareIso(iso, max) > 0) return `Enter a date on or before ${formatDateInput(max)}.`;
    if (isDateDisabled?.(iso)) return "That date can't be chosen.";
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
    const iso = parseDateInput(text);
    const why = iso ? reason(iso) : "Enter the date as DD/MM/YYYY.";
    if (!iso || why) {
      setProblem(why);
      // Report the field as empty, but keep the typed text for correcting.
      setSynced(null);
      if (value !== null) onChange(null);
      return;
    }
    setProblem(null);
    setDraft(formatDateInput(iso));
    setSynced(iso);
    if (iso !== value) onChange(iso);
  };

  const pick = (iso: IsoDate) => {
    setProblem(null);
    setDraft(formatDateInput(iso));
    setSynced(iso);
    onChange(iso);
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
      // Stop here so an enclosing Modal stays open.
      e.preventDefault();
      e.stopPropagation();
      closePopup(true);
    }
  };

  const popup = (
      <div
        ref={popupRef}
        role="dialog"
        aria-label="Choose date"
        className={cx(styles.popup, inline && styles.popupInline)}
        onKeyDown={onPopupKeyDown}
      >
        <Calendar
          value={value}
          onChange={pick}
          isDateDisabled={isDateDisabled}
          min={min}
          max={max}
          defaultMonth={defaultMonth}
          captionLayout={captionLayout}
          fromYear={fromYear}
          toYear={toYear}
          autoFocus={!inline}
        />
      </div>
  );

  return (
    <div data-slot="date-field" className={cx(styles.root, inline && styles.rootInline, className)}>
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
          placeholder={placeholder}
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
          aria-label={open ? "Close calendar" : "Choose date from calendar"}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <IconCalendar size={16} />
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
