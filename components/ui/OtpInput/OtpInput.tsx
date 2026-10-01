"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { cx } from "../_internal/cx";
import { mergeDescribedBy, useField } from "../Field/Field";
import styles from "./OtpInput.module.css";

export type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  /** Fires once when every box holds a digit, e.g. to auto-submit. */
  onComplete?: (value: string) => void;
  length?: number;
  invalid?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  /** Required when not inside a <Field group>. */
  "aria-label"?: string;
  className?: string;
};

/**
 * Six single-digit boxes (the reference MFA cells). Typing advances, Backspace
 * steps back, arrows move, and a pasted code fills from the box it lands in.
 * The first box carries autocomplete="one-time-code" so iOS and Android offer
 * the code from an SMS or authenticator.
 */
export function OtpInput({
  value,
  onChange,
  onComplete,
  length = 6,
  invalid: invalidProp,
  disabled,
  autoFocus,
  "aria-label": ariaLabel,
  className,
}: OtpInputProps) {
  const field = useField();
  const invalid = invalidProp ?? field?.invalid ?? false;
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  const focusBox = (i: number) => {
    const el = refs.current[Math.max(0, Math.min(length - 1, i))];
    el?.focus();
    el?.select();
  };

  const write = (next: string[]) => {
    const joined = next.join("").slice(0, length);
    onChange(joined);
    if (joined.length === length && !next.includes("")) onComplete?.(joined);
  };

  const setAt = (i: number, digit: string) => {
    const next = [...digits];
    next[i] = digit;
    // Keep the value contiguous: a gap would make value.length lie.
    const firstEmpty = next.indexOf("");
    if (firstEmpty !== -1 && next.slice(firstEmpty).some(Boolean)) {
      const compact = next.filter(Boolean);
      write([...compact, ...Array(length - compact.length).fill("")]);
    } else {
      write(next);
    }
  };

  const fillFrom = (start: number, text: string) => {
    const incoming = text.replace(/\D/g, "").split("");
    if (incoming.length === 0) return;
    const next = [...digits];
    let i = start;
    for (const d of incoming) {
      if (i >= length) break;
      next[i++] = d;
    }
    write(next);
    focusBox(i >= length ? length - 1 : i);
  };

  const onKeyDown = (i: number) => (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[i]) setAt(i, "");
      else if (i > 0) {
        setAt(i - 1, "");
        focusBox(i - 1);
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusBox(i - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusBox(i + 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusBox(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusBox(length - 1);
    } else if (/^\d$/.test(e.key)) {
      e.preventDefault();
      // Typing into an earlier box when later ones are empty lands at the
      // first empty box instead, so the code always fills left to right.
      const firstEmpty = digits.indexOf("");
      const target = firstEmpty !== -1 && firstEmpty < i ? firstEmpty : i;
      setAt(target, e.key);
      focusBox(target + 1);
    }
  };

  const onPaste = (i: number) => (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    fillFrom(i, e.clipboardData.getData("text"));
  };

  return (
    <div data-slot="otp-input"
      role="group"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabel ? undefined : field?.labelId}
      className={cx(styles.row, className)}
    >
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          id={i === 0 ? field?.id : undefined}
          className={cx(styles.cell, invalid && styles.invalid, digit && styles.filled)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          value={digit}
          disabled={disabled}
          autoFocus={autoFocus && i === 0}
          aria-label={`Digit ${i + 1} of ${length}`}
          aria-invalid={invalid || undefined}
          aria-describedby={i === 0 ? mergeDescribedBy(field?.describedBy) : undefined}
          onKeyDown={onKeyDown(i)}
          onPaste={onPaste(i)}
          // Covers one-time-code autofill (the whole code lands in box one) and
          // Android keyboards, which report every key as "Unidentified".
          onChange={(e) => {
            const text = e.target.value;
            const incoming = digit && text.startsWith(digit) ? text.slice(digit.length) : text;
            if (incoming.replace(/\D/g, "").length > 1) fillFrom(i, incoming);
            else if (/^\d$/.test(incoming)) {
              setAt(i, incoming);
              focusBox(i + 1);
            }
          }}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  );
}
