"use client";

import { X } from "lucide-react";
import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Popover } from "@/components/ui";
import { cx } from "@/components/ui/_internal/cx";
import { ColorPicker } from "./ColorPicker";
import { parseColour, toCss, toHex, type Rgb } from "./engine/colour";
import { positioned, type Stop } from "./engine/gradient";
import styles from "./Studio.module.css";

/**
 * Adobe-style gradient stops editor:
 * - A horizontal bar showing the live gradient
 * - Square markers for the end stops (0% and 100%)
 * - Circle markers for every intermediate stop
 * - Click a marker to open the ColorPicker in a popover
 * - Drag a marker to reposition it (clamped 0 - 100)
 * - Click the empty bar area to add a new stop at that position
 * - Hover an intermediate marker to reveal its delete button
 */
export function StopsBar({
  stops,
  resolve,
  onChange,
}: {
  stops: Stop[];
  resolve: (expr: string) => Rgb | null;
  onChange: (next: Stop[]) => void;
}) {
  const p = positioned(stops);
  const barRef = useRef<HTMLDivElement>(null);

  const toCssString = (color: string) => {
    const r = resolve(color);
    if (!r) return color;
    return toCss(r);
  };

  const barGradient = `linear-gradient(to right, ${p
    .map((s) => `${toCssString(s.color)} ${s.pos}%`)
    .join(", ")})`;

  const sortByPos = (list: Stop[]) =>
    [...list].sort((a, b) => (a.pos ?? 0) - (b.pos ?? 0));

  const beginDrag = (index: number, e: ReactPointerEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const bar = barRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const startPos = p[index].pos ?? 0;
    const startX = e.clientX;
    let dragged = false;
    let latest = p;

    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      if (Math.abs(dx) > 3) dragged = true;
      const next = Math.max(0, Math.min(100, startPos + (dx / rect.width) * 100));
      latest = latest.map((s, i) => (i === index ? { ...s, pos: next } : s));
      onChange(latest);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      // If the user actually dragged, re-sort so left-to-right order
      // matches the visual order and the gradient CSS reads sensibly.
      if (dragged) onChange(sortByPos(latest));
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const addStop = (clientX: number) => {
    const bar = barRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    // Interpolate colour from the two neighbours.
    const sorted = sortByPos(p);
    const prev = [...sorted].reverse().find((s) => (s.pos ?? 0) <= pct) ?? sorted[0];
    const next = sorted.find((s) => (s.pos ?? 0) >= pct) ?? sorted[sorted.length - 1];
    const prevRgb = resolve(prev.color);
    const nextRgb = resolve(next.color);
    let colour = prev.color;
    if (prevRgb && nextRgb && prev !== next) {
      const span = (next.pos ?? 100) - (prev.pos ?? 0);
      const t = span === 0 ? 0 : (pct - (prev.pos ?? 0)) / span;
      const mix: Rgb = {
        r: Math.round(prevRgb.r + (nextRgb.r - prevRgb.r) * t),
        g: Math.round(prevRgb.g + (nextRgb.g - prevRgb.g) * t),
        b: Math.round(prevRgb.b + (nextRgb.b - prevRgb.b) * t),
        a: prevRgb.a + (nextRgb.a - prevRgb.a) * t,
      };
      colour = mix.a < 1 ? `rgba(${mix.r}, ${mix.g}, ${mix.b}, ${mix.a.toFixed(3)})` : toHex(mix);
    }
    onChange(sortByPos([...p, { color: colour, pos: pct }]));
  };

  const removeStop = (index: number) => {
    if (p.length <= 2) return;
    onChange(p.filter((_, i) => i !== index));
  };

  const updateStopColour = (index: number, rgb: Rgb) => {
    const original = p[index].color;
    // If the stop was a palette ref ("var(--brand)") we convert to the
    // resulting fixed colour so the picker's edit sticks. Alpha preserved.
    const next = rgb.a < 1 ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a.toFixed(3)})` : toHex(rgb);
    if (next === original) return;
    onChange(p.map((s, i) => (i === index ? { ...s, color: next } : s)));
  };

  return (
    <div className={styles.stopsBarWrap}>
      <div
        ref={barRef}
        className={styles.stopsBar}
        style={{ background: barGradient }}
        role="presentation"
        onClick={(e) => {
          // Only act on clicks landing on the bar background, not on a marker.
          if (e.target !== e.currentTarget) return;
          addStop(e.clientX);
        }}
      >
        {p.map((s, i) => {
          const isEnd = i === 0 || i === p.length - 1;
          const rgb = resolve(s.color) ?? parseColour(s.color) ?? { r: 0, g: 0, b: 0, a: 1 };
          return (
            <Popover
              key={`${i}-${s.pos}`}
              label={`Stop ${i + 1} colour`}
              width={320}
              trigger={
                <button
                  type="button"
                  className={cx(styles.stopMarker, isEnd ? styles.stopMarkerEnd : styles.stopMarkerMid)}
                  style={{ left: `${s.pos ?? 0}%`, background: toCssString(s.color) }}
                  aria-label={`Stop ${i + 1} at ${Math.round(s.pos ?? 0)}%`}
                  onPointerDown={(e) => beginDrag(i, e)}
                >
                  {!isEnd && p.length > 2 ? (
                    <span
                      role="button"
                      aria-label={`Remove stop ${i + 1}`}
                      className={styles.stopMarkerRemove}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeStop(i);
                      }}
                    >
                      <X size={9} aria-hidden="true" />
                    </span>
                  ) : null}
                </button>
              }
            >
              <ColorPicker colour={rgb} onChange={(c) => updateStopColour(i, c)} />
            </Popover>
          );
        })}
      </div>
      <span className={styles.stopsBarHint}>Click to add a stop · drag to move · click a stop to pick its colour</span>
    </div>
  );
}
