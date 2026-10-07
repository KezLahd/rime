"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type ComponentPropsWithRef,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import { cx } from "../_internal/cx";
import { Portal } from "../_internal/portal";
import { placePopup } from "../_internal/position";
import { mergeDescribedBy, useField } from "../Field/Field";
import { IconCheck, IconChevronDown } from "../Icon/Icon";
import boxStyles from "../TextInput/TextInput.module.css";
import { codeBodyFrom, matchPrefixOption, toPrefixedCode, type PrefixedFormat, type PrefixedOption } from "./prefixed";
import styles from "./PrefixedInput.module.css";

export type PrefixedInputProps = Omit<
  ComponentPropsWithRef<"input">,
  "value" | "defaultValue" | "onChange" | "type" | "inputMode" | "size" | "children" | "maxLength" | "prefix"
> & {
  /**
   * The fixed segment set into the box and never typed: "INV", "ACC", "#".
   * Omit when passing prefixOptions; the selected option's value takes over.
   */
  prefix?: string;
  /**
   * How many characters follow the prefix. Omit when passing prefixOptions;
   * each option carries its own length.
   */
  length?: number;
  /** digits = 0-9 only (the default). alphanumeric = A-Z and 0-9, upper-cased as typed. */
  charset?: PrefixedFormat["charset"];
  /**
   * A list of switchable prefix choices, each with its own length (and
   * charset). The prefix slot becomes a dropdown button; pasting a full
   * code picks the matching option automatically. The first option is the
   * default. For a single hardcoded prefix, use prefix + length instead.
   */
  prefixOptions?: ReadonlyArray<PrefixedOption>;
  /** Controlled: which option is active. onPrefixChange fires when it changes. */
  prefixValue?: string;
  onPrefixChange?: (value: string, option: PrefixedOption) => void;
  /** The full code ("INV004213") or the body alone; either is read. */
  value: string;
  /**
   * Every edit. `code` is the full form ("" while nothing is entered, never a
   * bare prefix); `body` is what follows the prefix.
   */
  onValueChange: (code: string, body: string) => void;
  /** Overrides the Field's invalid state and the built-in check on blur. */
  invalid?: boolean;
  /** The "4/6" count at the right of the box. On by default. */
  showCounter?: boolean;
  /** Class for the outer box rather than the <input>. */
  boxClassName?: string;
};

const NUDGE_MS = 1600;

/**
 * A fixed-format code with a set prefix: an invoice number, an account code,
 * a licence or membership number. The prefix is part of the box, not typed,
 * then exactly `length` characters. There is one way to get it right:
 *
 * - Characters outside the charset are refused as they are typed, with a
 *   brief "Numbers only" (or "Letters and numbers only") in the counter,
 *   announced politely, so a refused key is never silent.
 * - Pasting or autofilling the whole code ("INV-004213", any case, with
 *   spaces) replaces the field with its body.
 * - Leaving the field part-filled marks it invalid. An empty field is left
 *   to the form's required check, so tabbing through does not paint red.
 *
 * With `name`, a hidden input posts the full code.
 */
export function PrefixedInput({
  prefix,
  length,
  charset = "digits",
  prefixOptions,
  prefixValue,
  onPrefixChange,
  value,
  onValueChange,
  invalid: invalidProp,
  showCounter = true,
  boxClassName,
  className,
  id: idProp,
  name,
  disabled,
  readOnly,
  required: requiredProp,
  placeholder,
  onKeyDown,
  onPaste,
  onBlur,
  "aria-describedby": describedByProp,
  ...rest
}: PrefixedInputProps) {
  // Multi-prefix mode: a selectable list drives the prefix and the length
  // for the current pick. The active option is controlled via prefixValue
  // when the caller passes it, or kept internally otherwise.
  const hasOptions = !!prefixOptions && prefixOptions.length > 0;
  const [internalPrefix, setInternalPrefix] = useState<string>(
    () => prefixValue ?? prefixOptions?.[0]?.value ?? prefix ?? "",
  );
  const activePrefixValue = hasOptions ? (prefixValue ?? internalPrefix) : prefix ?? "";
  const activeOption = hasOptions
    ? prefixOptions!.find((o) => o.value === activePrefixValue) ?? prefixOptions![0]
    : null;
  const activePrefix = activeOption?.value ?? prefix ?? "";
  const activeLength = activeOption?.length ?? length ?? 0;
  const activeCharset = activeOption?.charset ?? charset;
  const format: PrefixedFormat = { prefix: activePrefix, length: activeLength, charset: activeCharset };

  const commitPrefix = (next: PrefixedOption) => {
    if (prefixValue === undefined) setInternalPrefix(next.value);
    onPrefixChange?.(next.value, next);
    // Preserve any body typed so far, trimmed to the new option's length.
    const currentBody = codeBodyFrom(value, format);
    const trimmed = currentBody.slice(0, next.length);
    onValueChange(trimmed ? `${next.value}${trimmed}` : "", trimmed);
  };
  const field = useField();
  const autoId = useId();
  const id = idProp ?? field?.id ?? `prefixed-${autoId}`;
  const formatId = `${id}-format`;
  const body = codeBodyFrom(value, format);
  const complete = body.length === activeLength;
  const allowed = activeCharset === "alphanumeric" ? /[a-z0-9]/i : /\d/;
  const refusal = activeCharset === "alphanumeric" ? "Letters and numbers only" : "Numbers only";

  const [blurredPartial, setBlurredPartial] = useState(false);
  const [nudge, setNudge] = useState(false);
  const nudgeTimer = useRef(0);

  // When the active option carries a validate(body), run it only once the
  // body is complete — a half-typed number is already visibly incomplete
  // via the counter, so flagging mid-stream would just be noise. The
  // detail hint (e.g. "Mobile", "Short code") stays live as the user
  // types so they can see what their number resolves to.
  const validationError = complete && activeOption?.validate ? activeOption.validate(body) : null;
  const detailHint = activeOption?.detail?.(body) ?? null;
  const invalid = invalidProp ?? (Boolean(field?.invalid) || blurredPartial || Boolean(validationError));
  const [prefixMenuOpen, setPrefixMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => window.clearTimeout(nudgeTimer.current), []);

  const refuse = () => {
    window.clearTimeout(nudgeTimer.current);
    setNudge(true);
    nudgeTimer.current = window.setTimeout(() => setNudge(false), NUDGE_MS);
  };

  const emit = (next: string) => {
    setBlurredPartial(false);
    onValueChange(toPrefixedCode(next, format), next);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
    if (!allowed.test(e.key)) {
      e.preventDefault();
      refuse();
      return;
    }
    // Full, with nothing selected to type over: one more character goes nowhere.
    const el = e.currentTarget;
    if (body.length >= activeLength && el.selectionStart === el.selectionEnd) e.preventDefault();
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    onPaste?.(e);
    if (e.defaultPrevented) return;
    const text = e.clipboardData.getData("text");
    // In multi-prefix mode, a pasted code that matches a different option
    // swaps the dropdown to it; one entry replaces the field in one gesture.
    if (hasOptions) {
      const matched = matchPrefixOption(text, prefixOptions!);
      if (matched && matched.value !== activePrefixValue) {
        e.preventDefault();
        if (prefixValue === undefined) setInternalPrefix(matched.value);
        onPrefixChange?.(matched.value, matched);
        const nextFormat: PrefixedFormat = { prefix: matched.value, length: matched.length, charset: matched.charset ?? charset };
        const pastedBody = codeBodyFrom(text, nextFormat);
        onValueChange(pastedBody ? `${matched.value}${pastedBody}` : "", pastedBody);
        return;
      }
    }
    // A whole code replaces the field rather than landing after what's there.
    const startsWithPrefix = activePrefix ? text.trim().toLowerCase().startsWith(activePrefix.toLowerCase()) : false;
    if (startsWithPrefix || codeBodyFrom(text, format).length >= activeLength) {
      e.preventDefault();
      emit(codeBodyFrom(text, format));
    }
  };

  const handleChange = (raw: string) => {
    // Mobile keyboards and autofill skip keydown; anything outside the
    // charset is dropped here instead, and still gets the nudge.
    const p = activePrefix.replace(/[^a-z0-9]/gi, "");
    const typed = (p ? raw.trim().replace(new RegExp(`^${p}`, "i"), "") : raw).replace(/[\s-]/g, "");
    if ([...typed].some((c) => !allowed.test(c))) refuse();
    emit(codeBodyFrom(raw, format));
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    onBlur?.(e);
    setBlurredPartial(body.length > 0 && body.length < activeLength);
  };

  // Position the prefix dropdown menu under its trigger when open; close
  // on outside-click or Escape, same as DateField.
  useLayoutEffect(() => {
    if (!prefixMenuOpen) return;
    const trigger = triggerRef.current;
    const menu = menuRef.current;
    if (!trigger || !menu) return;
    const place = () => placePopup(trigger, menu, { align: "start" });
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [prefixMenuOpen]);

  useEffect(() => {
    if (!prefixMenuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setPrefixMenuOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setPrefixMenuOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [prefixMenuOpen]);

  return (
    <>
      <div data-slot="prefixed-input"
        className={cx(
          boxStyles.box,
          boxStyles.md,
          styles.box,
          invalid && boxStyles.invalid,
          disabled && boxStyles.disabled,
          readOnly && boxStyles.readOnly,
          boxClassName,
        )}
        data-invalid={invalid || undefined}
        data-disabled={disabled || undefined}
      >
        {hasOptions ? (
          <button
            ref={triggerRef}
            type="button"
            className={cx(styles.prefix, styles.prefixTrigger)}
            onClick={() => setPrefixMenuOpen((o) => !o)}
            disabled={disabled || readOnly}
            aria-haspopup="listbox"
            aria-expanded={prefixMenuOpen}
            aria-label={`Dialing prefix: ${activePrefix}. Change`}
          >
            <span>{activePrefix}</span>
            <IconChevronDown size={13} aria-hidden="true" />
          </button>
        ) : (
          <span className={styles.prefix} aria-hidden="true">
            {activePrefix}
          </span>
        )}
        <input
          {...rest}
          id={id}
          type="text"
          inputMode={activeCharset === "digits" ? "numeric" : "text"}
          autoCapitalize={activeCharset === "alphanumeric" ? "characters" : "off"}
          autoCorrect="off"
          spellCheck={false}
          placeholder={placeholder ?? "0".repeat(activeLength)}
          value={body}
          disabled={disabled}
          readOnly={readOnly}
          required={requiredProp ?? field?.required}
          aria-invalid={invalid || undefined}
          aria-describedby={mergeDescribedBy(describedByProp, field?.describedBy, formatId)}
          className={cx(boxStyles.input, boxStyles.mono, styles.input, className)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
        />
        {showCounter && !readOnly ? (
          <span
            className={cx(
              styles.counter,
              nudge && styles.counterNudge,
              !nudge && complete && styles.counterDone,
              !nudge && invalid && !complete && styles.counterInvalid,
            )}
            aria-hidden="true"
          >
            {nudge ? (
              refusal
            ) : complete ? (
              <>
                <IconCheck size={13} strokeWidth={2.6} />
                {activeLength}/{activeLength}
              </>
            ) : (
              `${body.length}/${activeLength}`
            )}
          </span>
        ) : null}
      </div>
      <span id={formatId} className="sr-only">
        {`${activePrefix} is filled in. Type the ${activeLength} ${activeCharset === "digits" ? "digits" : "characters"} that follow it.`}
      </span>
      <span className="sr-only" aria-live="polite">
        {nudge ? refusal : ""}
      </span>
      {name ? <input type="hidden" name={name} value={toPrefixedCode(body, format)} /> : null}

      {validationError || detailHint ? (
        <p
          className={cx(styles.detail, validationError && styles.detailError)}
          aria-live="polite"
        >
          {validationError ?? detailHint}
        </p>
      ) : null}

      {hasOptions && prefixMenuOpen ? (
        <Portal>
          <div
            ref={menuRef}
            role="listbox"
            aria-label="Dialing prefix"
            className={styles.prefixMenu}
          >
            {prefixOptions!.map((opt) => {
              const selected = opt.value === activePrefix;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={cx(styles.prefixOption, selected && styles.prefixOptionActive)}
                  onClick={() => {
                    commitPrefix(opt);
                    setPrefixMenuOpen(false);
                    triggerRef.current?.focus();
                  }}
                >
                  <span className={styles.prefixOptionValue}>{opt.value}</span>
                  {opt.label ? <span className={styles.prefixOptionLabel}>{opt.label}</span> : null}
                  {selected ? <IconCheck size={14} aria-hidden="true" /> : null}
                </button>
              );
            })}
          </div>
        </Portal>
      ) : null}
    </>
  );
}
