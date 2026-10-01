"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { cx } from "../_internal/cx";
import { Portal } from "../_internal/portal";
import { placePopup } from "../_internal/position";
import { mergeDescribedBy, useField } from "../Field/Field";
import { IconCheck, IconChevronsUpDown, IconPlus } from "../Icon/Icon";
import boxStyles from "../TextInput/TextInput.module.css";
import styles from "./Combobox.module.css";

export type ComboboxOption = {
  value: string;
  label: string;
  /** A muted second line. Searched too. */
  description?: string;
  /** Extra words that find the option ("usd" for "US dollar"). */
  keywords?: ReadonlyArray<string>;
  disabled?: boolean;
};

export type ComboboxProps = {
  options: ReadonlyArray<ComboboxOption>;
  value: string | null;
  /** The chosen option's value, or null when the text is cleared. */
  onChange: (value: string | null) => void;
  placeholder?: string;
  /**
   * Offer "Create …" when the typed text matches no option. onCreate receives
   * the text; add the option and select it there.
   */
  creatable?: boolean;
  onCreate?: (label: string) => void;
  /** Shown when nothing matches and creatable is off. */
  emptyText?: string;
  size?: "sm" | "md";
  disabled?: boolean;
  invalid?: boolean;
  id?: string;
  name?: string;
  "aria-label"?: string;
  /** Open on mount. */
  defaultOpen?: boolean;
  /**
   * Render the list in normal flow under the field instead of portalling a
   * popover, and keep it open. For docs, previews and pickers inside a panel.
   */
  inline?: boolean;
  className?: string;
};

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");

/**
 * A text field that filters a list as you type and picks one option: the
 * WAI-ARIA editable combobox with list autocomplete. Typing opens the list
 * and narrows it, Up and Down move the highlight (aria-activedescendant, so
 * focus stays in the field), Enter picks, Esc closes then clears, and Tab
 * leaves. Leaving restores the chosen option's label, so the text never
 * disagrees with the value. With creatable, a typed value that matches
 * nothing can be added.
 */
export function Combobox({
  options,
  value,
  onChange,
  placeholder,
  creatable,
  onCreate,
  emptyText = "No matches",
  size = "md",
  disabled,
  invalid: invalidProp,
  id: idProp,
  name,
  "aria-label": ariaLabel,
  defaultOpen = false,
  inline = false,
  className,
}: ComboboxProps) {
  const field = useField();
  const autoId = useId();
  const id = idProp ?? field?.id ?? `combobox-${autoId}`;
  const listId = `${id}-list`;
  const invalid = invalidProp ?? Boolean(field?.invalid);
  const selected = options.find((o) => o.value === value) ?? null;

  const [open, setOpen] = useState(defaultOpen || inline);
  const [text, setText] = useState(selected?.label ?? "");
  const [typed, setTyped] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  // Only keyboard moves scroll the list, so mounting open never scrolls the page.
  const keyed = useRef(false);

  // Keep the text in step when the value changes from outside.
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setText(selected?.label ?? "");
    setTyped(false);
  }

  const query = typed ? norm(text.trim()) : "";
  const matches = useMemo(
    () =>
      query
        ? options.filter((o) => [o.label, o.description ?? "", ...(o.keywords ?? [])].some((f) => norm(f).includes(query)))
        : options,
    [options, query],
  );
  const exact = matches.some((o) => norm(o.label) === query);
  const showCreate = Boolean(creatable && query && !exact);
  const rows = matches.length + (showCreate ? 1 : 0);
  const isOpen = (open || inline) && !disabled;
  const activeIndex = Math.min(active, Math.max(0, rows - 1));

  // Position the portalled popover and follow scroll and resize.
  useLayoutEffect(() => {
    if (!isOpen || inline) return;
    const place = () => {
      if (boxRef.current && popupRef.current) placePopup(boxRef.current, popupRef.current, { matchWidth: true });
    };
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [isOpen, inline, rows]);

  // Close on a press outside the field and the list.
  useEffect(() => {
    if (!isOpen || inline) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (boxRef.current?.contains(t) || popupRef.current?.contains(t)) return;
      setOpen(false);
      setTyped(false);
      setText(selected?.label ?? "");
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [isOpen, inline, selected]);

  // Keep the highlighted row in view.
  useEffect(() => {
    if (!isOpen || !keyed.current) return;
    keyed.current = false;
    const el = document.getElementById(`${id}-opt-${activeIndex}`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, isOpen, id]);

  const pick = (o: ComboboxOption) => {
    if (o.disabled) return;
    onChange(o.value);
    setText(o.label);
    setTyped(false);
    if (!inline) setOpen(false);
  };

  const create = () => {
    const label = text.trim();
    if (!label) return;
    onCreate?.(label);
    setTyped(false);
    if (!inline) setOpen(false);
  };

  const commit = (i: number) => {
    if (i < matches.length) pick(matches[i]);
    else if (showCreate) create();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    keyed.current = true;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!isOpen) {
        setOpen(true);
        setActive(0);
        return;
      }
      if (!rows) return;
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((activeIndex + step + rows) % rows);
    } else if (e.key === "Home" && isOpen && rows) {
      setActive(0);
    } else if (e.key === "End" && isOpen && rows) {
      setActive(rows - 1);
    } else if (e.key === "Enter") {
      if (isOpen && rows) {
        e.preventDefault();
        commit(activeIndex);
      }
    } else if (e.key === "Escape") {
      if (isOpen && !inline) {
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
        setTyped(false);
        setText(selected?.label ?? "");
      } else if (text) {
        e.preventDefault();
        e.stopPropagation();
        setText("");
        setTyped(false);
        onChange(null);
      }
    } else if (e.key === "Tab" && isOpen && !inline) {
      setOpen(false);
      setTyped(false);
      setText(selected?.label ?? "");
    }
  };

  const list = (
    <div
      ref={popupRef}
      className={cx(styles.popup, inline && styles.inline)}
      onPointerDown={(e) => {
        // Keep focus in the field while picking with the pointer.
        if (!inline) e.preventDefault();
      }}
    >
      <ul id={listId} role="listbox" aria-label={ariaLabel ?? "Options"} className={styles.list}>
        {matches.map((o, i) => (
          <li
            key={o.value}
            id={`${id}-opt-${i}`}
            role="option"
            aria-selected={o.value === value}
            aria-disabled={o.disabled || undefined}
            className={cx(
              styles.option,
              i === activeIndex && styles.optionActive,
              o.value === value && styles.optionSelected,
              o.disabled && styles.optionDisabled,
            )}
            onPointerMove={() => setActive(i)}
            onClick={() => pick(o)}
          >
            {o.value === value ? <IconCheck size={14} className={styles.check} aria-hidden="true" /> : null}
            <span className={styles.optionText}>
              <span className={styles.optionLabel}>{o.label}</span>
              {o.description ? <span className={styles.optionDescription}>{o.description}</span> : null}
            </span>
          </li>
        ))}
        {showCreate ? (
          <li
            id={`${id}-opt-${matches.length}`}
            role="option"
            aria-selected={false}
            className={cx(styles.option, styles.create, activeIndex === matches.length && styles.optionActive)}
            onPointerMove={() => setActive(matches.length)}
            onClick={create}
          >
            <IconPlus size={14} className={styles.check} aria-hidden="true" />
            <span className={styles.optionLabel}>Create &quot;{text.trim()}&quot;</span>
          </li>
        ) : null}
      </ul>
      {!rows ? <p className={styles.empty}>{emptyText}</p> : null}
    </div>
  );

  return (
    <div data-slot="combobox" className={cx(styles.root, inline && styles.rootInline, className)}>
      <div
        ref={boxRef}
        className={cx(boxStyles.box, boxStyles[size], invalid && boxStyles.invalid, disabled && boxStyles.disabled)}
        data-invalid={invalid || undefined}
      >
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-label={field ? undefined : ariaLabel}
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={isOpen && rows ? `${id}-opt-${activeIndex}` : undefined}
          aria-invalid={invalid || undefined}
          aria-describedby={mergeDescribedBy(field?.describedBy)}
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder}
          disabled={disabled}
          value={text}
          className={boxStyles.input}
          onChange={(e) => {
            setText(e.target.value);
            setTyped(true);
            setActive(0);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={isOpen ? "Hide options" : "Show options"}
          className={styles.toggle}
          disabled={disabled}
          onClick={() => {
            if (inline) return;
            setOpen(!isOpen);
            inputRef.current?.focus();
          }}
        >
          <IconChevronsUpDown size={15} aria-hidden="true" />
        </button>
      </div>
      <span className="sr-only" role="status" aria-live="polite">
        {isOpen && typed ? `${matches.length} result${matches.length === 1 ? "" : "s"}` : ""}
      </span>
      {isOpen ? inline ? list : <Portal>{list}</Portal> : null}
      {name ? <input type="hidden" name={name} value={value ?? ""} /> : null}
    </div>
  );
}

