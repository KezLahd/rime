"use client";

import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ColorPicker } from "./ColorPicker";

/**
 * Studio-wide context: hovering a ColourRow broadcasts the row's token here;
 * ThemePreview reads it and rings matching elements in the Colours showcase
 * so users see where each token is being used.
 */
const PeekContext = createContext<(token: string | null) => void>(() => {});

export function PeekProvider({ onPeek, children }: { onPeek: (token: string | null) => void; children: ReactNode }) {
  const stable = useCallback(onPeek, [onPeek]);
  return <PeekContext.Provider value={stable}>{children}</PeekContext.Provider>;
}

/**
 * Font-hover preview: hovering a font in the Fonts step dropdown broadcasts
 * { slot, family } here; Studio applies it as an inline style on the
 * preview wrapper so the type specimen on the right swaps to the hovered
 * font without the user having to click to select. Clear on mouse-leave.
 */
export type FontHoverState = { slot: "body" | "display"; family: string } | null;
const FontHoverContext = createContext<(state: FontHoverState) => void>(() => {});

export function FontHoverProvider({ onHover, children }: { onHover: (state: FontHoverState) => void; children: ReactNode }) {
  const stable = useCallback(onHover, [onHover]);
  return <FontHoverContext.Provider value={stable}>{children}</FontHoverContext.Provider>;
}

export function useFontHover() {
  return useContext(FontHoverContext);
}

/**
 * Gradient-selection context: GradientPanel broadcasts its currently-
 * selected gradient token here; the preview on the right renders only
 * the specimen that uses that gradient (a bare primary button for
 * --brand-gradient, a bare SidebarShell corner for --logo-corner-bg, and
 * so on) instead of a grid of every gradient at once.
 */
const GradientSelectionContext = createContext<(token: string | null) => void>(() => {});

/**
 * Current brand palette, resolved to hex. ColorPicker reads this to show
 * a strip of quick-pick swatches at the top (Brand / Deep / Accent /
 * Neutral) so a user editing another token can snap it to one of the
 * brand colours without re-typing the hex.
 */
export type BrandPalette = {
  brand: string;
  deep: string;
  accent: string;
  neutral: string;
};
export const BrandPaletteContext = createContext<BrandPalette | null>(null);

export function BrandPaletteProvider({
  palette,
  children,
}: {
  palette: BrandPalette | null;
  children: ReactNode;
}) {
  return <BrandPaletteContext.Provider value={palette}>{children}</BrandPaletteContext.Provider>;
}

export function useBrandPalette() {
  return useContext(BrandPaletteContext);
}

export function GradientSelectionProvider({
  onSelect,
  children,
}: {
  onSelect: (token: string | null) => void;
  children: ReactNode;
}) {
  const stable = useCallback(onSelect, [onSelect]);
  return <GradientSelectionContext.Provider value={stable}>{children}</GradientSelectionContext.Provider>;
}

export function useGradientSelection() {
  return useContext(GradientSelectionContext);
}

/**
 * Shadow-selection context: ShadowPanel broadcasts the shadow token
 * currently being edited; the preview renders only the specimen that
 * uses it (one card for --shadow-panel, a popover for --popover-shadow,
 * a modal frame for --modal-shadow, etc.) so the user sees exactly
 * what their sliders are reshaping.
 */
const ShadowSelectionContext = createContext<(token: string | null) => void>(() => {});

export function ShadowSelectionProvider({
  onSelect,
  children,
}: {
  onSelect: (token: string | null) => void;
  children: ReactNode;
}) {
  const stable = useCallback(onSelect, [onSelect]);
  return <ShadowSelectionContext.Provider value={stable}>{children}</ShadowSelectionContext.Provider>;
}

export function useShadowSelection() {
  return useContext(ShadowSelectionContext);
}

/**
 * Colour-category context: the Colours step broadcasts which category
 * is currently being edited (brand, text, signals, field, charts,
 * ramp); the ColourShowcase on the right reads it and renders ONLY the
 * components that use that category's tokens, so the preview spotlights
 * exactly what the user is reshaping.
 */
export type ColourCategory = "brand" | "text" | "signals" | "field" | "charts" | "ramp";
const ColourCategoryContext = createContext<(cat: ColourCategory | null) => void>(() => {});

export function ColourCategoryProvider({
  onSelect,
  children,
}: {
  onSelect: (cat: ColourCategory | null) => void;
  children: ReactNode;
}) {
  const stable = useCallback(onSelect, [onSelect]);
  return <ColourCategoryContext.Provider value={stable}>{children}</ColourCategoryContext.Provider>;
}

export function useColourCategory() {
  return useContext(ColourCategoryContext);
}
import {
  Alert,
  IconButton,
  Popover,
  Select,
  Slider,
  Switch,
  TextInput,
  ToggleGroup,
  Toggletip,
} from "@/components/ui";
import { cx } from "@/components/ui/_internal/cx";
import { Check as CheckIcon, ChevronLeft as ChevL, ChevronRight as ChevR, RotateCcw } from "lucide-react";
import { parseHex, toCss, toHex, type Rgb } from "./engine/colour";
import styles from "./Studio.module.css";

// The Studio's controls, built from the kit's own components: Slider,
// Select, Switch, ToggleGroup, a colour swatch in a Popover, Toggletip help
// and the kit's Alert. Each row has a human label, optional help, a
// "changed" dot and a reset. Raw token names never show here; they live in
// each section's Advanced block (see advanced.tsx).

export function Group({
  title,
  note,
  help,
  action,
  children,
}: {
  title: string;
  note?: ReactNode;
  /** Longer help behind an info button beside the title. */
  help?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <section className={styles.group} aria-labelledby={id}>
      <div className={styles.groupHead}>
        <h3 id={id} className={styles.groupTitle}>
          {title}
          {help ? (
            <Toggletip label={`About ${title}`} side="bottom">
              {help}
            </Toggletip>
          ) : null}
        </h3>
        {action}
      </div>
      {note ? <p className={styles.groupNote}>{note}</p> : null}
      <div className={styles.groupBody}>{children}</div>
    </section>
  );
}

function ResetButton({ label, changed, onReset }: { label: string; changed?: boolean; onReset?: () => void }) {
  const disabled = !changed || !onReset;
  return (
    <button
      type="button"
      className={cx(styles.resetChip, disabled && styles.resetChipDisabled, styles.reset)}
      disabled={disabled}
      onClick={onReset}
      aria-label={`Reset ${label}`}
      title={disabled ? "At the preset" : `Reset ${label}`}
    >
      <RotateCcw size={12} aria-hidden="true" />
    </button>
  );
}

/** A labelled row: label (with a changed dot and optional help), the control, a reset. */
export function Row({
  label,
  token,
  help,
  changed,
  onReset,
  children,
  htmlFor,
  stacked,
}: {
  label: string;
  /** Kept for call sites; the raw name shows only in Advanced. */
  token?: string;
  help?: ReactNode;
  changed?: boolean;
  onReset?: () => void;
  children: ReactNode;
  htmlFor?: string;
  /** Label above the control instead of beside it. */
  stacked?: boolean;
}) {
  const peek = useContext(PeekContext);
  const start = () => token && peek(token);
  const stop = () => peek(null);
  return (
    <div
      className={cx(styles.row, stacked && styles.rowStacked, changed && styles.rowChanged)}
      onMouseEnter={start}
      onMouseLeave={stop}
      onFocus={start}
      onBlur={stop}
    >
      <span className={styles.rowLabel}>
        <label className={styles.rowName} htmlFor={htmlFor}>
          {label}
        </label>
        {help ? (
          <Toggletip label={`About ${label}`} side="right">
            {help}
          </Toggletip>
        ) : null}
      </span>
      <div className={styles.rowControl}>{children}</div>
      <ResetButton label={label} changed={changed} onReset={onReset} />
    </div>
  );
}

/** What the user is typing, reset whenever the committed value changes from outside. */
function useDraft(value: string) {
  const [draft, setDraft] = useState(value);
  const [prev, setPrev] = useState(value);
  if (value !== prev) {
    setPrev(value);
    setDraft(value);
  }
  return { value: draft, set: setDraft };
}

/**
 * The swatch button opens a Rime-built colour picker (SV square + hue
 * strip + hex input) in a popover. The old flow used the OS-native
 * <input type="color"> which looks ancient on every platform. The hex
 * stays an input inside the picker — click a swatch to change the
 * colour, type the hex to be exact.
 */
export function ColourSwatch({
  label,
  colour,
  onChange,
  fill,
  alpha,
}: {
  label: string;
  colour: Rgb | null;
  onChange: (c: Rgb) => void;
  /** Expose an opacity slider in the picker and let onChange receive the alpha. */
  alpha?: boolean;
  /** Paint the swatch with this CSS instead (a gradient, a palette reference). */
  fill?: string;
}) {
  const c = colour ?? { r: 0, g: 0, b: 0, a: 1 };
  const hex = toHex(c);
  return (
    <Popover
      label={`${label} colour`}
      width={320}
      trigger={
        <button type="button" className={styles.swatchButton} aria-label={`${label}: ${hex}. Open colour picker`}>
          <span className={styles.swatchChecker}>
            <span className={styles.swatchPaint} style={{ background: fill ?? toCss(c) }} />
          </span>
          <span className={styles.swatchHex}>{hex}</span>
        </button>
      }
    >
      <ColorPicker
        colour={c}
        alpha={alpha}
        onChange={(next) => onChange(alpha ? next : { ...next, a: c.a })}
      />
    </Popover>
  );
}

export function ColourRow({
  label,
  token,
  help,
  colour,
  changed,
  onChange,
  onReset,
  alpha,
}: {
  label: string;
  token?: string;
  help?: ReactNode;
  colour: Rgb | null;
  changed?: boolean;
  onChange: (c: Rgb) => void;
  onReset?: () => void;
  /** Offer opacity too. */
  alpha?: boolean;
}) {
  return (
    <Row label={label} token={token} help={help} changed={changed} onReset={onReset}>
      <ColourSwatch label={label} colour={colour} onChange={onChange} alpha={alpha} />
    </Row>
  );
}

export function SliderRow({
  label,
  help,
  value,
  min,
  max,
  step,
  unit,
  format,
  displayScale,
  changed,
  onChange,
  onReset,
  disabled,
}: {
  label: string;
  token?: string;
  help?: ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  /** DEPRECATED display formatter — the field now derives its own
   *  display from value * displayScale + unit. Kept so existing call
   *  sites still compile; auto-detects the common `v*100 + %` pattern
   *  if a format is supplied without a displayScale. */
  format?: (v: number) => string;
  /** Multiplier applied to the raw value for display and reversed on
   *  commit: strength (0-1) uses displayScale={100} and unit="%" so
   *  the field reads "72" and the user types "72" to mean 0.72. */
  displayScale?: number;
  changed?: boolean;
  onChange: (v: number) => void;
  onReset?: () => void;
  /** Greys the track, label and value but keeps the (i) tooltip interactive. */
  disabled?: boolean;
}) {
  // SliderRow lays out its own head (label + help + editable value field +
  // reset chip) above the track so every section — Shadow distance,
  // Softness, Density, Height, … — has one consistent pattern:
  //   LABEL (i)                   36 px  ↺
  //   ━━━━━●━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // The value is a NumberField: typeable, clamped, step-snapped, with
  // a suffix built from the slider's own unit. The reset chip is
  // always visible but disabled until the value differs from the
  // preset (changed === true), so the user can tell at a glance which
  // sliders they have moved.
  const clamped = Math.min(max, Math.max(min, value));
  return (
    <div className={cx(styles.sliderRow, changed && styles.rowChanged, disabled && styles.sliderRowDisabled)}>
      <div className={styles.sliderHead}>
        <span className={styles.rowName}>{label}</span>
        {help ? (
          <Toggletip label={`About ${label}`} side="right">
            {help}
          </Toggletip>
        ) : null}
        <div className={styles.sliderHeadRight}>
          <NumberField
            label={label}
            value={clamped}
            min={min}
            max={max}
            step={step}
            unit={unit}
            format={format}
            displayScale={displayScale}
            disabled={disabled}
            onChange={onChange}
          />
          <ResetChip
            label={label}
            disabled={!changed || !onReset || !!disabled}
            onReset={onReset}
          />
        </div>
      </div>
      <div className={styles.sliderBody}>
        <Slider aria-label={label} disabled={disabled} min={min} max={max} step={step} value={clamped} onValueChange={onChange} />
      </div>
    </div>
  );
}

/**
 * NumberField: the editable value readout on every slider. Shows the
 * current value with its unit as a suffix (36 px, 100 %, 135 °); typing
 * a new number commits on blur or Enter. Clamps to [min, max] and
 * snaps to the slider's step. Reads from `format` first if the caller
 * supplied one (so a slider formatting as "72%" from 0.72 keeps that
 * display), with its own unit-based formatter as the default.
 */
function NumberField({
  label,
  value,
  min,
  max,
  step,
  unit,
  format,
  displayScale,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  format?: (v: number) => string;
  displayScale?: number;
  disabled?: boolean;
  onChange: (v: number) => void;
}) {
  // Work out the display scale + suffix. The caller can set them
  // directly (displayScale + unit). If a legacy `format` is given, we
  // auto-detect by comparing format(1) against raw 1: a format of
  // `${v*100}%` produces "100%" at value 1, so scale = 100 and
  // suffix = "%".
  let scale = displayScale ?? 1;
  let suffix = unit ?? "";
  if (!displayScale && format) {
    const sample = format(1);
    const parts = sample.match(/^(-?\d+(?:\.\d+)?)\s*(.*)$/);
    if (parts) {
      const n = Number(parts[1]);
      if (Number.isFinite(n) && n !== 0) scale = n;
      if (!unit) suffix = parts[2].trim();
    }
  }

  // Display decimals follow the smaller of step * scale (so a step of
  // 0.01 at scale 100 displays whole numbers; step 0.05 at scale 1
  // displays two decimals). Capped at 3 to keep the field tight.
  const effectiveStep = step * scale;
  const decimals = effectiveStep < 1 ? Math.min(3, String(effectiveStep).replace(/^0*/, "").split(".")[1]?.length ?? 2) : 0;
  const displayValue = Number((value * scale).toFixed(decimals));
  const [draft, setDraft] = useState<string | null>(null);
  const live = draft ?? String(displayValue);
  const displayMin = min * scale;
  const displayMax = max * scale;

  const commit = () => {
    if (draft === null) return;
    const raw = Number(draft);
    if (!Number.isFinite(raw)) {
      setDraft(null);
      return;
    }
    const clampedDisplay = Math.min(displayMax, Math.max(displayMin, raw));
    // Translate back to the slider's native scale, then snap to the
    // step in that native scale. Avoids `72.0001` sort of residues.
    const native = clampedDisplay / scale;
    const snapped = Math.round(native / step) * step;
    const rounded = Number(snapped.toFixed(step < 1 ? Math.min(6, String(step).split(".")[1]?.length ?? 2) : 0));
    setDraft(null);
    if (rounded !== value) onChange(rounded);
  };

  return (
    <span className={cx(styles.numberFieldShell, disabled && styles.numberFieldShellDisabled)}>
      <input
        type="number"
        inputMode="decimal"
        step={effectiveStep}
        min={displayMin}
        max={displayMax}
        className={styles.numberField}
        value={live}
        disabled={disabled}
        aria-label={`${label} value`}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          if (e.key === "Escape") {
            setDraft(null);
            (e.target as HTMLInputElement).blur();
          }
        }}
        spellCheck={false}
      />
      {suffix ? <span className={styles.numberFieldSuffix}>{suffix}</span> : null}
    </span>
  );
}

/**
 * Reset chip rendered inside the slider head. Unlike ResetButton, this
 * ships in the "disabled" state when no changes exist, so every slider
 * shows a chip — the user can see at a glance which sliders are
 * resetable (dim chip) vs edited (brand chip, clickable).
 */
function ResetChip({ label, disabled, onReset }: { label: string; disabled: boolean; onReset?: () => void }) {
  return (
    <button
      type="button"
      className={cx(styles.resetChip, disabled && styles.resetChipDisabled)}
      disabled={disabled}
      onClick={onReset}
      aria-label={`Reset ${label}`}
      title={disabled ? "At the preset" : `Reset ${label}`}
    >
      <RotateCcw size={12} aria-hidden="true" />
    </button>
  );
}

export function TextRow({
  label,
  token,
  help,
  value,
  changed,
  onCommit,
  onReset,
  mono = true,
}: {
  label: string;
  token?: string;
  help?: ReactNode;
  value: string;
  changed?: boolean;
  onCommit: (v: string) => void;
  onReset?: () => void;
  mono?: boolean;
}) {
  const id = useId();
  const draft = useDraft(value);
  // Never let a value close the declaration block it is written into.
  const safe = !/[{}<;]/.test(draft.value);
  return (
    <Row label={label} token={token} help={help} changed={changed} onReset={onReset} htmlFor={id}>
      <TextInput
        id={id}
        size="sm"
        mono={mono}
        boxClassName={styles.grow}
        value={draft.value}
        spellCheck={false}
        invalid={!safe}
        onChange={(e) => draft.set(e.target.value)}
        onBlur={() => {
          if (safe && draft.value.trim() && draft.value !== value) onCommit(draft.value.trim());
          else if (!safe) draft.set(value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          if (e.key === "Escape") draft.set(value);
        }}
      />
    </Row>
  );
}

export function SelectRow<V extends string>({
  label,
  token,
  help,
  value,
  options,
  changed,
  onChange,
  onReset,
  searchable,
  stacked,
}: {
  label: string;
  token?: string;
  help?: ReactNode;
  value: V;
  options: ReadonlyArray<{ value: V; label: string }>;
  changed?: boolean;
  onChange: (v: V) => void;
  onReset?: () => void;
  searchable?: boolean;
  /** Label above, for long option labels. */
  stacked?: boolean;
}) {
  const id = useId();
  return (
    <Row label={label} token={token} help={help} changed={changed} onReset={onReset} htmlFor={id} stacked={stacked}>
      <Select id={id} size="sm" className={styles.grow} value={value} onChange={onChange} options={options} searchable={searchable ?? options.length > 12} />
    </Row>
  );
}

/**
 * A horizontal strip of pill-chips for picking one item from an ordered
 * list, with visible progress — each option that has already been
 * touched (edited) shows a check icon so the user knows which surfaces
 * they've completed, in order, without a dropdown that hides the whole
 * list behind a click. Previous / next chevrons on each end advance the
 * selection one step; the active chip is centred into view on change.
 *
 * Used anywhere a step edits a stack of related tokens (shadow
 * elevations, gradient tokens, glass surfaces) so the editing loop
 * feels like a guided progression — pick a surface, tweak it, move on
 * — rather than a bag of unrelated dropdowns.
 */
export function SurfaceStrip<V extends string>({
  label,
  value,
  options,
  onChange,
  isComplete,
  help,
  variant = "card",
}: {
  label: string;
  value: V;
  options: ReadonlyArray<{ value: V; label: string }>;
  onChange: (v: V) => void;
  /** Returns true when the surface's state has been edited away from the preset. */
  isComplete?: (v: V) => boolean;
  help?: ReactNode;
  /** "card" sits inside a Group; "header" is a full-bleed sticky bar that
   *  carries its own title (so you don't wrap it in a Group). */
  variant?: "card" | "header";
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const activeIndex = Math.max(0, options.findIndex((o) => o.value === value));
  const go = (delta: number) => {
    const next = options[activeIndex + delta];
    if (next) onChange(next.value);
  };
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const chip = el.children[activeIndex] as HTMLElement | undefined;
    if (!chip) return;
    chip.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeIndex]);
  return (
    <div className={cx(styles.stripRow, variant === "header" && styles.stripHeader)}>
      <div className={styles.stripHead}>
        <span className={cx(variant === "header" ? styles.groupTitle : styles.rowName)}>{label}</span>
        {help ? (
          <Toggletip label={`About ${label}`} side="right">
            {help}
          </Toggletip>
        ) : null}
        <span className={styles.stripCount}>
          {activeIndex + 1} / {options.length}
        </span>
      </div>
      <div className={styles.stripShell}>
        <button
          type="button"
          className={styles.stripNav}
          aria-label={`Previous ${label.toLowerCase()}`}
          onClick={() => go(-1)}
          disabled={activeIndex <= 0}
        >
          <ChevL size={16} aria-hidden="true" />
        </button>
        <div className={styles.stripFade}>
          <div ref={trackRef} className={styles.stripTrack} role="listbox" aria-label={label}>
            {options.map((o) => {
              const active = o.value === value;
              const done = !!isComplete?.(o.value);
              return (
                <button
                  key={o.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={cx(styles.stripChip, active && styles.stripChipActive, done && styles.stripChipDone)}
                  onClick={() => onChange(o.value)}
                  title={o.label}
                >
                  {done ? <CheckIcon size={11} aria-hidden="true" className={styles.stripChipCheck} /> : null}
                  <span>{o.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        <button
          type="button"
          className={styles.stripNav}
          aria-label={`Next ${label.toLowerCase()}`}
          onClick={() => go(1)}
          disabled={activeIndex >= options.length - 1}
        >
          <ChevR size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

/** A setting that is on or off, as the kit's Switch. */
export function CheckRow({ label, checked, onChange, note }: { label: string; checked: boolean; onChange: (v: boolean) => void; note?: string }) {
  return (
    <div className={styles.switchRow}>
      <Switch label={label} description={note} checked={checked} onChange={onChange} />
    </div>
  );
}

/** One of a few choices, as the kit's segmented ToggleGroup. */
export function ChoiceRow<V extends string>({
  label,
  value,
  options,
  onChange,
  help,
  changed,
  onReset,
}: {
  label: string;
  value: V;
  options: ReadonlyArray<{ value: V; label: string }>;
  onChange: (v: V) => void;
  help?: ReactNode;
  changed?: boolean;
  onReset?: () => void;
}) {
  return (
    <Row label={label} help={help} changed={changed} onReset={onReset} stacked>
      <ToggleGroup
        type="single"
        size="sm"
        aria-label={label}
        value={value}
        onValueChange={(v: string | null) => v && onChange(v as V)}
        items={options.map((o) => ({ value: o.value, label: o.label }))}
      />
    </Row>
  );
}

const ARROWS = ["↑", "↗", "→", "↘", "↓", "↙", "←", "↖"];

/** An angle: a dial you can drag, a slider and the eight compass presets. */
export function AngleRow({ label, value, onChange, changed, onReset }: { label: string; value: number; onChange: (v: number) => void; changed?: boolean; onReset?: () => void }) {
  const fromPointer = (e: React.PointerEvent<HTMLSpanElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const deg = (Math.round(((Math.atan2(dx, -dy) * 180) / Math.PI + 360) / 5) * 5) % 360;
    onChange(deg);
  };
  return (
    <div className={cx(styles.angle, changed && styles.rowChanged)}>
      <span
        className={styles.dial}
        aria-hidden="true"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          fromPointer(e);
        }}
        onPointerMove={(e) => {
          if (e.buttons) fromPointer(e);
        }}
      >
        <span className={styles.dialHand} style={{ transform: `rotate(${value}deg)` }} />
      </span>
      <div className={styles.angleBody}>
        <Slider label={label} showValue min={0} max={355} step={5} value={value % 360} formatValue={(v) => `${v}°`} onValueChange={onChange} />
        <ToggleGroup
          type="single"
          size="sm"
          variant="ghost"
          aria-label={`${label} presets`}
          value={value % 45 === 0 ? String(value % 360) : null}
          onValueChange={(v: string | null) => v !== null && onChange(Number(v))}
          items={ARROWS.map((a, i) => ({ value: String(i * 45), label: a, "aria-label": `${i * 45} degrees` }))}
        />
      </div>
      <ResetButton label={label} changed={changed} onReset={onReset} />
    </div>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "warn" | "bad" | "ok"; children: ReactNode }) {
  const map = { info: "info", warn: "warning", bad: "danger", ok: "success" } as const;
  return (
    <Alert tone={map[tone]} className={styles.notice}>
      {children}
    </Alert>
  );
}
