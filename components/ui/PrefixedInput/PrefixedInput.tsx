"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ClipboardEvent,
  type ComponentPropsWithRef,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import { cx } from "../_internal/cx";
import { mergeDescribedBy, useField } from "../Field/Field";
import { IconCheck } from "../Icon/Icon";
import boxStyles from "../TextInput/TextInput.module.css";
import { codeBodyFrom, toPrefixedCode, type PrefixedFormat } from "./prefixed";
import styles from "./PrefixedInput.module.css";

export type PrefixedInputProps = Omit<
  ComponentPropsWithRef<"input">,
  "value" | "defaultValue" | "onChange" | "type" | "inputMode" | "size" | "children" | "maxLength" | "prefix"
> & {
  /** The fixed segment set into the box and never typed: "INV", "ACC", "#". */
  prefix: string;
  /** How many characters follow the prefix. */
  length: number;
  /** digits = 0-9 only (the default). alphanumeric = A-Z and 0-9, upper-cased as typed. */
  charset?: PrefixedFormat["charset"];
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
  const format: PrefixedFormat = { prefix, length, charset };
  const field = useField();
  const autoId = useId();
  const id = idProp ?? field?.id ?? `prefixed-${autoId}`;
  const formatId = `${id}-format`;
  const body = codeBodyFrom(value, format);
  const complete = body.length === length;
  const allowed = charset === "alphanumeric" ? /[a-z0-9]/i : /\d/;
  const refusal = charset === "alphanumeric" ? "Letters and numbers only" : "Numbers only";

  const [blurredPartial, setBlurredPartial] = useState(false);
  const [nudge, setNudge] = useState(false);
  const nudgeTimer = useRef(0);

  const invalid = invalidProp ?? (Boolean(field?.invalid) || blurredPartial);

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
    if (body.length >= length && el.selectionStart === el.selectionEnd) e.preventDefault();
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    onPaste?.(e);
    if (e.defaultPrevented) return;
    const text = e.clipboardData.getData("text");
    // A whole code replaces the field rather than landing after what's there.
    const startsWithPrefix = text.trim().toLowerCase().startsWith(prefix.toLowerCase());
    if (startsWithPrefix || codeBodyFrom(text, format).length >= length) {
      e.preventDefault();
      emit(codeBodyFrom(text, format));
    }
  };

  const handleChange = (raw: string) => {
    // Mobile keyboards and autofill skip keydown; anything outside the
    // charset is dropped here instead, and still gets the nudge.
    const p = prefix.replace(/[^a-z0-9]/gi, "");
    const typed = (p ? raw.trim().replace(new RegExp(`^${p}`, "i"), "") : raw).replace(/[\s-]/g, "");
    if ([...typed].some((c) => !allowed.test(c))) refuse();
    emit(codeBodyFrom(raw, format));
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    onBlur?.(e);
    setBlurredPartial(body.length > 0 && body.length < length);
  };

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
        <span className={styles.prefix} aria-hidden="true">
          {prefix}
        </span>
        <input
          {...rest}
          id={id}
          type="text"
          inputMode={charset === "digits" ? "numeric" : "text"}
          autoCapitalize={charset === "alphanumeric" ? "characters" : "off"}
          autoCorrect="off"
          spellCheck={false}
          placeholder={placeholder ?? "0".repeat(length)}
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
                {length}/{length}
              </>
            ) : (
              `${body.length}/${length}`
            )}
          </span>
        ) : null}
      </div>
      <span id={formatId} className="sr-only">
        {`${prefix} is filled in. Type the ${length} ${charset === "digits" ? "digits" : "characters"} that follow it.`}
      </span>
      <span className="sr-only" aria-live="polite">
        {nudge ? refusal : ""}
      </span>
      {name ? <input type="hidden" name={name} value={toPrefixedCode(body, format)} /> : null}
    </>
  );
}
