"use client";

import { useEffect, useRef, useState } from "react";
import { useBrandPalette } from "./controls";
import { parseHex, toHex, type Rgb } from "./engine/colour";
import styles from "./ColorPicker.module.css";

// ── RGB <-> HSV ──────────────────────────────────────────────────────────

function rgbToHsv(c: Rgb) {
  const r = c.r / 255;
  const g = c.g / 255;
  const b = c.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const v = max;
  const d = max - min;
  const s = max === 0 ? 0 : d / max;
  let h = 0;
  if (d) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, v: v * 100 };
}

function hsvToRgb(h: number, s: number, v: number): Rgb {
  const S = s / 100;
  const V = v / 100;
  const i = Math.floor(h / 60);
  const f = h / 60 - i;
  const p = V * (1 - S);
  const q = V * (1 - f * S);
  const t = V * (1 - (1 - f) * S);
  let r = 0;
  let g = 0;
  let b = 0;
  switch (i % 6) {
    case 0: r = V; g = t; b = p; break;
    case 1: r = q; g = V; b = p; break;
    case 2: r = p; g = V; b = t; break;
    case 3: r = p; g = q; b = V; break;
    case 4: r = t; g = p; b = V; break;
    case 5: r = V; g = p; b = q; break;
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255), a: 1 };
}

/**
 * The Studio's own colour picker: a saturation/value square with a hue
 * strip underneath and a hex input at the bottom. Replaces the native
 * <input type="color"> picker (which looks like 2004). Pointer drag on
 * the square sets saturation + value, pointer drag on the hue strip sets
 * hue, hex input is editable and syncs both ways. All sharp corners,
 * matches the kit's chrome.
 */
export function ColorPicker({ colour, onChange, alpha }: { colour: Rgb; onChange: (c: Rgb) => void; alpha?: boolean }) {
  const palette = useBrandPalette();
  const initial = rgbToHsv(colour);
  const [h, setH] = useState(initial.h);
  const [s, setS] = useState(initial.s);
  const [v, setV] = useState(initial.v);
  const [hexDraft, setHexDraft] = useState(toHex(colour));
  const squareRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const alphaRef = useRef<HTMLDivElement>(null);
  const colourRef = useRef(colour);
  colourRef.current = colour;
  const a = colour.a ?? 1;

  const pickSwatch = (hex: string) => {
    const parsed = parseHex(hex);
    if (!parsed) return;
    const hsv = rgbToHsv(parsed);
    setH(hsv.h);
    setS(hsv.s);
    setV(hsv.v);
    setHexDraft(hex);
    onChange({ ...parsed, a: colourRef.current.a });
  };

  const dragAlpha = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = alphaRef.current;
    if (!el) return;
    e.preventDefault();
    el.setPointerCapture(e.pointerId);
    const apply = (clientX: number) => {
      const rect = el.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      onChange({ ...colourRef.current, a: Number(x.toFixed(3)) });
    };
    apply(e.clientX);
    const onMove = (ev: PointerEvent) => apply(ev.clientX);
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  // When the external colour changes (hex typed, Reset clicked, step
  // switched), sync the HSV sliders back. Preserve hue when saturation
  // happens to be zero (grey) so the hue slider doesn't snap to 0.
  useEffect(() => {
    const next = rgbToHsv(colour);
    setHexDraft(toHex(colour));
    setV(next.v);
    setS(next.s);
    if (next.s > 0) setH(next.h);
  }, [colour.r, colour.g, colour.b]);

  const commit = (hh: number, ss: number, vv: number) => {
    const rgb = hsvToRgb(hh, ss, vv);
    onChange({ ...rgb, a: colourRef.current.a });
  };

  const dragSquare = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = squareRef.current;
    if (!el) return;
    e.preventDefault();
    el.setPointerCapture(e.pointerId);
    const apply = (clientX: number, clientY: number) => {
      const rect = el.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
      const nextS = x * 100;
      const nextV = (1 - y) * 100;
      setS(nextS);
      setV(nextV);
      commit(h, nextS, nextV);
    };
    apply(e.clientX, e.clientY);
    const onMove = (ev: PointerEvent) => apply(ev.clientX, ev.clientY);
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const dragHue = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = hueRef.current;
    if (!el) return;
    e.preventDefault();
    el.setPointerCapture(e.pointerId);
    const apply = (clientX: number) => {
      const rect = el.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const nextH = x * 360;
      setH(nextH);
      commit(nextH, s, v);
    };
    apply(e.clientX);
    const onMove = (ev: PointerEvent) => apply(ev.clientX);
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <div className={styles.picker}>
      <div
        ref={squareRef}
        className={styles.square}
        onPointerDown={dragSquare}
        style={{ background: `hsl(${h}, 100%, 50%)` }}
        role="slider"
        aria-label="Saturation and value"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(s)}
      >
        <div className={styles.squareWhite} />
        <div className={styles.squareBlack} />
        <div className={styles.cursor} style={{ left: `${s}%`, top: `${100 - v}%` }} />
      </div>

      <div
        ref={hueRef}
        className={styles.hue}
        onPointerDown={dragHue}
        role="slider"
        aria-label="Hue"
        aria-valuemin={0}
        aria-valuemax={360}
        aria-valuenow={Math.round(h)}
      >
        <div className={styles.hueCursor} style={{ left: `${(h / 360) * 100}%` }} />
      </div>

      {/* Alpha strip: a checker underlay with the current hue gradient
          over it so the user sees exactly what transparency looks like
          over the Studio background. Only rendered when the caller
          opts in (alpha prop) — most colour tokens in Rime are opaque,
          and showing it everywhere would confuse the common case. */}
      {alpha ? (
        <div
          ref={alphaRef}
          className={styles.alpha}
          onPointerDown={dragAlpha}
          role="slider"
          aria-label="Opacity"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(a * 100)}
          style={{
            backgroundImage: `linear-gradient(to right, rgba(${colour.r}, ${colour.g}, ${colour.b}, 0) 0%, rgb(${colour.r}, ${colour.g}, ${colour.b}) 100%), repeating-conic-gradient(#d6d6d6 0% 25%, #ffffff 0% 50%)`,
            backgroundSize: `100% 100%, 10px 10px`,
          }}
        >
          <div className={styles.alphaCursor} style={{ left: `${a * 100}%` }} />
        </div>
      ) : null}

      <input
        type="text"
        className={styles.hex}
        value={hexDraft}
        onChange={(e) => {
          const value = e.target.value;
          setHexDraft(value);
          const parsed = parseHex(value.trim());
          if (parsed) onChange({ ...parsed, a: colourRef.current.a });
        }}
        onBlur={() => setHexDraft(toHex(colourRef.current))}
        spellCheck={false}
        maxLength={7}
        aria-label="Hex colour"
      />

      {/* Brand palette swatches: click to snap the picker to a brand
          colour without re-typing the hex. Pulls live values from the
          palette context (Studio.tsx derives it from --brand,
          --brand-deep, --brand-soft and --support), so edits to the
          brand on step 2 are reflected here immediately. */}
      {palette ? (
        <div className={styles.swatches} role="group" aria-label="Brand palette">
          {([
            ["Brand", palette.brand],
            ["Deep", palette.deep],
            ["Accent", palette.accent],
            ["Neutral", palette.neutral],
          ] as const).map(([label, hex]) => (
            <button
              key={label}
              type="button"
              className={styles.swatch}
              style={{ background: hex }}
              aria-label={`${label} · ${hex}`}
              title={`${label} · ${hex}`}
              onClick={() => pickSwatch(hex)}
            >
              <span className={styles.swatchLabel}>{label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
