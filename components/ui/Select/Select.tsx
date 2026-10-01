"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cx } from "../_internal/cx";
import { Portal } from "../_internal/portal";
import { placePopup } from "../_internal/position";
import { mergeDescribedBy, useField } from "../Field/Field";
import { IconCheck, IconChevronDown, IconSearch, IconX } from "../Icon/Icon";
import { highlightMatches, matchesQuery, queryWords } from "../SearchField/match";
import boxStyles from "../TextInput/TextInput.module.css";
import styles from "./Select.module.css";

export type SelectOption<V extends string = string> = {
  value: V;
  label: string;
  description?: string;
  disabled?: boolean;
  /** Consecutive options sharing a group render under one heading. */
  group?: string;
  /** Searchable only: extra words that find this option ("GP" for "General practice"). */
  keywords?: ReadonlyArray<string>;
  /** Filter dropdowns: how many rows this option would show, right-aligned in the list. */
  count?: number;
};

export type SelectProps<V extends string = string> = {
  options: ReadonlyArray<SelectOption<V>>;
  value: V | null;
  onChange: (value: V) => void;
  placeholder?: string;
  /** field = bordered form control. chip = the reference recessed filter-bar chip. */
  appearance?: "field" | "chip";
  size?: "sm" | "md";
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  id?: string;
  /** Emits a hidden input so the value posts with a native form. */
  name?: string;
  /** Chip only: shows the "filter applied" tint. Defaults to value !== null. */
  active?: boolean;
  leadingIcon?: ReactNode;
  className?: string;
  /**
   * A search box pinned at the top of the list. Typing filters by label,
   * description, group and keywords, and highlights the match. For long
   * lists (countries, cities, time zones); a short list reads faster without.
   */
  searchable?: boolean;
  /** Placeholder, and accessible name, of the search box. */
  searchPlaceholder?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  onBlur?: () => void;
  /**
   * Render the list open, in place under the trigger: no portal, no focus
   * move, no outside-click listener, no scrolling into view. For docs and
   * thumbnails.
   */
  inline?: boolean;
};

/**
 * Select-only combobox (WAI-ARIA APG pattern). Focus never leaves the
 * trigger: the highlighted option is tracked with aria-activedescendant, so
 * closing needs no focus restoration and screen readers stay oriented. The
 * listbox is portalled because a glass ancestor would otherwise clip it.
 *
 * Searchable, focus moves into the search box when the list opens, and that
 * box becomes the combobox (editable, list autocomplete) that owns the
 * highlighted option. Typing on the closed trigger opens the list with the
 * typed letter already in the search. Enter picks; Esc clears the search,
 * then closes; Tab closes and moves on from the trigger. Focus comes back to
 * the trigger on every close except a click elsewhere.
 */
export function Select<V extends string = string>({
  options,
  value,
  onChange,
  placeholder = "Select…",
  appearance = "field",
  size = "md",
  disabled,
  invalid: invalidProp,
  required,
  id: idProp,
  name,
  active: activeProp,
  leadingIcon,
  className,
  searchable = false,
  searchPlaceholder = "Search",
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  onBlur,
  inline = false,
}: SelectProps<V>) {
  const field = useField();
  const autoId = useId();
  const id = idProp ?? field?.id ?? `select-${autoId}`;
  const listId = `${id}-listbox`;
  const searchId = `${id}-search`;
  const invalid = invalidProp ?? field?.invalid ?? false;

  const [openState, setOpen] = useState(false);
  const open = inline || openState;
  const [activeIndex, setActiveIndex] = useState(-1);
  const [query, setQuery] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const typeahead = useRef({ text: "", timer: 0 });

  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;
  const isActive = activeProp ?? value !== null;

  // Indices into options, in order, that the list currently shows.
  const words = useMemo(() => (searchable ? queryWords(query) : []), [searchable, query]);
  const visible = useMemo(() => {
    const all = options.map((_, i) => i);
    if (words.length === 0) return all;
    return all.filter((i) => {
      const o = options[i];
      return matchesQuery(words, o.label, o.description, o.group, ...(o.keywords ?? []));
    });
  }, [options, words]);

  /** First enabled visible option at or after position `from`, stepping by `step`. */
  const enabledAt = useCallback(
    (from: number, step: 1 | -1): number => {
      for (let p = from; p >= 0 && p < visible.length; p += step) {
        if (!options[visible[p]].disabled) return visible[p];
      }
      return -1;
    },
    [options, visible],
  );

  const openList = (at?: "first" | "last", seed = "") => {
    if (disabled) return;
    let index = selectedIndex >= 0 && !options[selectedIndex].disabled ? selectedIndex : enabledAt(0, 1);
    if (at === "first") index = enabledAt(0, 1);
    if (at === "last") index = enabledAt(visible.length - 1, -1);
    if (searchable) {
      setQuery(seed);
      if (seed) {
        // Highlight the first option the seed letter finds.
        const w = queryWords(seed);
        const hit = options.findIndex(
          (o) => !o.disabled && matchesQuery(w, o.label, o.description, o.group, ...(o.keywords ?? [])),
        );
        index = hit;
      }
    }
    setActiveIndex(index);
    setOpen(true);
  };

  const close = (returnFocus = true) => {
    setOpen(false);
    setQuery("");
    // Searchable lists hold focus in the popup's input; bring it home.
    if (searchable && returnFocus) triggerRef.current?.focus();
  };

  const commit = (index: number) => {
    const option = options[index];
    if (!option || option.disabled) return;
    onChange(option.value);
    close();
  };

  const move = (step: 1 | -1, distance = 1) => {
    let pos = visible.indexOf(activeIndex);
    if (pos === -1) {
      setActiveIndex(step === 1 ? enabledAt(0, 1) : enabledAt(visible.length - 1, -1));
      return;
    }
    let index = activeIndex;
    for (let n = 0; n < distance; n++) {
      const next = enabledAt(pos + step, step);
      if (next === -1) break;
      index = next;
      pos = visible.indexOf(next);
    }
    setActiveIndex(index);
  };

  const runTypeahead = (char: string) => {
    const t = typeahead.current;
    window.clearTimeout(t.timer);
    t.text += char.toLowerCase();
    t.timer = window.setTimeout(() => (t.text = ""), 600);
    const start = open ? activeIndex + (t.text.length === 1 ? 1 : 0) : 0;
    const ordered = [...options.slice(start), ...options.slice(0, start)];
    const match = ordered.find((o) => !o.disabled && o.label.toLowerCase().startsWith(t.text));
    if (!match) return;
    const index = options.indexOf(match);
    if (open) setActiveIndex(index);
    else onChange(match.value);
  };

  // Keys shared by the trigger (plain) and the search box (searchable) while open.
  const onOpenKey = (e: KeyboardEvent<HTMLElement>): boolean => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        move(1);
        return true;
      case "ArrowUp":
        e.preventDefault();
        if (e.altKey) commit(activeIndex);
        else move(-1);
        return true;
      case "PageDown":
        e.preventDefault();
        move(1, 8);
        return true;
      case "PageUp":
        e.preventDefault();
        move(-1, 8);
        return true;
      case "Enter":
        e.preventDefault();
        commit(activeIndex);
        return true;
      case "Escape":
        // Stop here so an enclosing Modal does not close as well.
        e.preventDefault();
        e.stopPropagation();
        if (searchable && query) setQuery("");
        else close();
        return true;
      case "Tab":
        // Focus the trigger now and let the browser's Tab carry on from it,
        // so the next stop is the one after the select, not the popup's end.
        close();
        return true;
      default:
        return false;
    }
  };

  const onTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const key = e.key;
    const printable = key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;

    if (!open) {
      if (key === "ArrowDown" || key === "Enter" || key === " ") {
        e.preventDefault();
        openList();
      } else if (key === "ArrowUp") {
        e.preventDefault();
        openList();
      } else if (key === "Home") {
        e.preventDefault();
        openList("first");
      } else if (key === "End") {
        e.preventDefault();
        openList("last");
      } else if (printable) {
        if (searchable) {
          // The letter goes into the search, not onto the trigger.
          e.preventDefault();
          openList(undefined, key);
        } else {
          runTypeahead(key);
        }
      }
      return;
    }

    if (onOpenKey(e)) return;
    switch (key) {
      case " ":
        e.preventDefault();
        commit(activeIndex);
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(enabledAt(0, 1));
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(enabledAt(visible.length - 1, -1));
        break;
      default:
        if (printable) runTypeahead(key);
    }
  };

  const onSearchChange = (next: string) => {
    setQuery(next);
    // The highlight follows the filter: first enabled match, or nothing.
    const w = queryWords(next);
    const hit = options.findIndex(
      (o) => !o.disabled && matchesQuery(w, o.label, o.description, o.group, ...(o.keywords ?? [])),
    );
    const keepSelected =
      w.length === 0 && selectedIndex >= 0 && !options[selectedIndex].disabled ? selectedIndex : -1;
    setActiveIndex(keepSelected >= 0 ? keepSelected : hit);
  };

  // Position against the trigger, and keep it there through scroll, resize
  // and (searchable) the list growing or shrinking as it filters.
  useLayoutEffect(() => {
    if (!open || inline) return;
    const trigger = triggerRef.current;
    const popup = popupRef.current;
    if (!trigger || !popup) return;
    const place = () => placePopup(trigger, popup, { matchWidth: true });
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, inline, visible.length]);

  // Searchable: the search box takes focus as the list opens.
  useEffect(() => {
    if (open && searchable && !inline) searchRef.current?.focus();
  }, [open, searchable, inline]);

  // Click away closes. The trigger toggles itself, so it is excluded.
  useEffect(() => {
    if (!open || inline) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || popupRef.current?.contains(target)) return;
      setOpen(false);
      setQuery("");
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, inline]);

  useEffect(() => {
    if (!open || inline || activeIndex < 0) return;
    popupRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, inline, activeIndex]);

  useEffect(() => {
    const t = typeahead.current;
    return () => window.clearTimeout(t.timer);
  }, []);

  const optionId = (i: number) => `${id}-opt-${i}`;

  // Group consecutive visible options that share a group name. A group with
  // no matches disappears with its heading.
  const blocks: Array<{ group?: string; items: Array<{ option: SelectOption<V>; index: number }> }> = [];
  visible.forEach((index) => {
    const option = options[index];
    const last = blocks[blocks.length - 1];
    if (last && last.group === option.group) last.items.push({ option, index });
    else blocks.push({ group: option.group, items: [{ option, index }] });
  });

  const renderOption = ({ option, index }: { option: SelectOption<V>; index: number }) => {
    const isSelected = index === selectedIndex;
    return (
      <div
        key={option.value}
        id={optionId(index)}
        role="option"
        aria-selected={isSelected}
        aria-disabled={option.disabled || undefined}
        data-index={index}
        className={cx(
          styles.option,
          index === activeIndex && styles.optionActive,
          isSelected && styles.optionSelected,
          option.disabled && styles.optionDisabled,
        )}
        onMouseDown={(e) => e.preventDefault()}
        onMouseMove={() => {
          if (!option.disabled && index !== activeIndex) setActiveIndex(index);
        }}
        onClick={() => commit(index)}
      >
        {isSelected ? <IconCheck size={14} strokeWidth={2.6} className={styles.check} /> : null}
        <span className={styles.optionText}>
          <span className={styles.optionLabel}>{highlightMatches(option.label, words, styles.match)}</span>
          {option.description ? (
            <span className={styles.optionDescription}>{highlightMatches(option.description, words, styles.match)}</span>
          ) : null}
        </span>
        {option.count !== undefined ? <span className={styles.optionCount}>{option.count}</span> : null}
      </div>
    );
  };

  const activeDescendant = open && activeIndex >= 0 && visible.includes(activeIndex) ? optionId(activeIndex) : undefined;
  const matchCount = visible.length;

  const listbox = (
    <div data-slot="select-content"
      id={listId}
      role="listbox"
      aria-labelledby={ariaLabelledBy ?? field?.labelId}
      aria-label={ariaLabel}
      tabIndex={-1}
      className={cx(searchable ? styles.list : cx(styles.popup, appearance === "chip" && styles.popupChip, inline && styles.popupInline))}
      ref={searchable ? undefined : popupRef}
    >
      {options.length === 0 ? <div className={styles.empty}>No options available</div> : null}
      {options.length > 0 && matchCount === 0 ? (
        <div className={styles.noMatches} role="presentation">
          <p className={styles.noMatchesTitle}>No matches for &ldquo;{query.trim()}&rdquo;</p>
          <p className={styles.noMatchesHint}>Check the spelling, or search by a shorter part of the name.</p>
        </div>
      ) : null}
      {blocks.map((block, b) =>
        block.group ? (
          <div key={`g-${block.group}-${b}`} role="group" aria-labelledby={`${id}-group-${b}`} className={styles.group}>
            <div id={`${id}-group-${b}`} className={styles.groupLabel} role="presentation">
              {block.group}
            </div>
            {block.items.map(renderOption)}
          </div>
        ) : (
          block.items.map(renderOption)
        ),
      )}
    </div>
  );

  const Wrap = inline ? "span" : Fragment;
  return (
    <Wrap {...(inline ? { className: styles.inlineWrap } : {})}>
      <button data-slot="select-trigger"
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={searchable ? undefined : activeDescendant}
        aria-invalid={invalid || undefined}
        aria-required={required ?? field?.required ?? undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={mergeDescribedBy(ariaDescribedBy, field?.describedBy)}
        disabled={disabled}
        onClick={() => {
          if (inline) return;
          if (open) close();
          else openList();
        }}
        onKeyDown={onTriggerKeyDown}
        onBlur={onBlur}
        className={cx(
          appearance === "field"
            ? cx(boxStyles.box, boxStyles[size], styles.field, invalid && boxStyles.invalid, disabled && boxStyles.disabled)
            : cx(styles.chip, isActive && styles.chipActive),
          open && styles.open,
          className,
        )}
      >
        {leadingIcon ? <span className={styles.leading}>{leadingIcon}</span> : null}
        <span className={cx(styles.value, !selected && styles.placeholder)}>{selected ? selected.label : placeholder}</span>
        <IconChevronDown size={appearance === "chip" ? 13 : 16} className={styles.chevron} />
      </button>

      {name ? <input type="hidden" name={name} value={value ?? ""} /> : null}

      {open ? (
        <MaybePortal inline={inline}>
          {searchable ? (
            <div
              ref={popupRef}
              className={cx(styles.popup, styles.popupSearchable, appearance === "chip" && styles.popupChip, inline && styles.popupInline)}
            >
              <div className={styles.searchBar}>
                <IconSearch size={14} className={styles.searchIcon} aria-hidden="true" />
                <input
                  ref={searchRef}
                  id={searchId}
                  type="text"
                  role="combobox"
                  aria-expanded="true"
                  aria-controls={listId}
                  aria-autocomplete="list"
                  aria-activedescendant={activeDescendant}
                  aria-label={searchPlaceholder}
                  placeholder={searchPlaceholder}
                  autoComplete="off"
                  spellCheck={false}
                  value={query}
                  className={styles.searchInput}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onKeyDown={(e) => {
                    onOpenKey(e);
                  }}
                />
                {query ? (
                  <button
                    type="button"
                    className={styles.searchClear}
                    aria-label="Clear search"
                    tabIndex={-1}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onSearchChange("")}
                  >
                    <IconX size={13} />
                  </button>
                ) : null}
              </div>
              {listbox}
              <span className="sr-only" role="status">
                {words.length === 0 ? "" : matchCount === 0 ? "No matches" : `${matchCount} ${matchCount === 1 ? "match" : "matches"}`}
              </span>
            </div>
          ) : (
            listbox
          )}
        </MaybePortal>
      ) : null}
    </Wrap>
  );
}

function MaybePortal({ inline, children }: { inline: boolean; children: ReactNode }) {
  return inline ? <>{children}</> : <Portal>{children}</Portal>;
}
