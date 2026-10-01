"use client";

import { useRef, type KeyboardEvent, type PointerEvent } from "react";
import { cx } from "../_internal/cx";
import { useField } from "../Field/Field";
import styles from "./Slider.module.css";

type SliderBase = {
  min?: number;
  max?: number;
  step?: number;
  /** PageUp and PageDown move by this much. Defaults to a tenth of the range, rounded to the step. */
  largeStep?: number;
  /** Ticks under the track, optionally labelled: [{ value: 0, label: "0" }, { value: 50 }]. */
  marks?: ReadonlyArray<{ value: number; label?: string }>;
  /** Formats the value for aria-valuetext and the value readout: (v) => `${v}%`. */
  formatValue?: (value: number) => string;
  /** Shows the formatted value (or range) to the right of the label row. */
  showValue?: boolean;
  /** Visible label above the track. Without it, pass aria-label. */
  label?: string;
  "aria-label"?: string;
  disabled?: boolean;
  /** Posts the value (a range posts two inputs, name[0] and name[1]). */
  name?: string;
  className?: string;
};

type SliderSingle = {
  /** One thumb. */
  value: number;
  onValueChange: (value: number) => void;
};

type SliderRange = {
  /** Two thumbs: a [low, high] range. The thumbs never cross. */
  value: readonly [number, number];
  onValueChange: (value: [number, number]) => void;
};

export type SliderProps = SliderBase & (SliderSingle | SliderRange);

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Picks a number (or a range) by dragging along a track. Each thumb is a
 * role="slider" element with aria-valuemin, -max, -now and -valuetext, so it
 * is fully keyboard operable: arrows step, PageUp and PageDown take a large
 * step, Home and End jump to the ends. Pressing the track moves the nearest
 * thumb there and keeps dragging.
 */
export function Slider(props: SliderProps) {
  const {
    min = 0,
    max = 100,
    step = 1,
    largeStep,
    marks,
    formatValue = (v: number) => String(v),
    showValue,
    label,
    disabled,
    name,
    className,
  } = props;
  const field = useField();
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const dragging = useRef<number | null>(null);
  const range = Array.isArray(props.value);
  const values: number[] = range ? [...(props.value as readonly [number, number])] : [props.value as number];
  const big = largeStep ?? Math.max(step, Math.round((max - min) / 10 / step) * step);
  const decimals = (String(step).split(".")[1] ?? "").length;

  const snap = (v: number) => Number(clamp(Math.round((v - min) / step) * step + min, min, max).toFixed(decimals));
  const pct = (v: number) => ((v - min) / (max - min || 1)) * 100;

  const emit = (index: number, raw: number) => {
    const v = snap(raw);
    if (range) {
      const next: [number, number] = [values[0], values[1]];
      next[index] = index === 0 ? Math.min(v, values[1]) : Math.max(v, values[0]);
      if (next[0] !== values[0] || next[1] !== values[1]) (props as SliderRange).onValueChange(next);
    } else if (v !== values[0]) (props as SliderSingle).onValueChange(v);
  };

  const valueAt = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || !rect.width) return min;
    return min + ((clientX - rect.left) / rect.width) * (max - min);
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (disabled || e.button !== 0) return;
    e.preventDefault();
    const v = valueAt(e.clientX);
    const index = range ? (Math.abs(v - values[0]) <= Math.abs(v - values[1]) ? (v > values[1] ? 1 : 0) : 1) : 0;
    dragging.current = index;
    e.currentTarget.setPointerCapture(e.pointerId);
    emit(index, v);
    thumbRefs.current[index]?.focus();
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging.current === null) return;
    emit(dragging.current, valueAt(e.clientX));
  };

  const endDrag = () => {
    dragging.current = null;
  };

  const onKeyDown = (e: KeyboardEvent<HTMLSpanElement>, index: number) => {
    const v = values[index];
    const moves: Record<string, number> = {
      ArrowRight: v + step,
      ArrowUp: v + step,
      ArrowLeft: v - step,
      ArrowDown: v - step,
      PageUp: v + big,
      PageDown: v - big,
      Home: min,
      End: max,
    };
    if (!(e.key in moves)) return;
    e.preventDefault();
    emit(index, moves[e.key]);
  };

  const lo = range ? pct(values[0]) : 0;
  const hi = pct(range ? values[1] : values[0]);
  const labelId = field?.labelId;
  const readout = range ? `${formatValue(values[0])} to ${formatValue(values[1])}` : formatValue(values[0]);
  const thumbLabel = (i: number) => {
    const base = label ?? props["aria-label"];
    if (!range) return labelId ? undefined : base;
    return `${base ?? "Value"} ${i === 0 ? "minimum" : "maximum"}`;
  };

  return (
    <div data-slot="slider" className={cx(styles.slider, disabled && styles.disabled, className)} data-disabled={disabled || undefined}>
      {label || showValue ? (
        <div className={styles.head}>
          {label ? <span className={styles.label}>{label}</span> : <span />}
          {showValue ? (
            <span className={styles.value} aria-hidden="true">
              {readout}
            </span>
          ) : null}
        </div>
      ) : null}
      <div
        ref={trackRef}
        className={styles.hit}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div className={styles.track} />
        <div
          className={styles.fill}
          style={
            range
              ? { left: `${lo}%`, width: `${hi - lo}%` }
              : { left: "calc(var(--slider-thumb) / -2)", width: `calc(${hi}% + var(--slider-thumb) / 2)` }
          }
        />
        {values.map((v, i) => (
          <span
            key={i}
            ref={(el) => {
              thumbRefs.current[i] = el;
            }}
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-label={thumbLabel(i)}
            aria-labelledby={!range && !label && labelId ? labelId : undefined}
            aria-valuemin={range && i === 1 ? values[0] : min}
            aria-valuemax={range && i === 0 ? values[1] : max}
            aria-valuenow={v}
            aria-valuetext={formatValue(v)}
            aria-orientation="horizontal"
            aria-disabled={disabled || undefined}
            className={styles.thumb}
            style={{ left: `${pct(v)}%` }}
            onKeyDown={(e) => onKeyDown(e, i)}
          />
        ))}
      </div>
      {marks?.length ? (
        <div className={styles.marks} aria-hidden="true">
          {marks.map((m) => (
            <span key={m.value} className={styles.mark} style={{ left: `${pct(m.value)}%` }}>
              <span className={styles.tick} />
              {m.label ? <span className={styles.markLabel}>{m.label}</span> : null}
            </span>
          ))}
        </div>
      ) : null}
      {name
        ? values.map((v, i) => <input key={i} type="hidden" name={range ? `${name}[${i}]` : name} value={v} />)
        : null}
    </div>
  );
}
