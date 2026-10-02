"use client";

import { createContext, useCallback, useContext, useId, useState, type ReactNode } from "react";
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
import { RotateCcw } from "lucide-react";
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
  return (
    <IconButton
      size="sm"
      label={`Reset ${label}`}
      icon={<RotateCcw size={13} aria-hidden="true" />}
      className={cx(styles.reset, !(changed && onReset) && styles.resetHidden)}
      onClick={onReset}
      disabled={!changed || !onReset}
      title="Back to the preset"
    />
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
  /** Shown value: defaults to the number and its unit. */
  format?: (v: number) => string;
  changed?: boolean;
  onChange: (v: number) => void;
  onReset?: () => void;
  /** Greys the track, label and value but keeps the (i) tooltip interactive. */
  disabled?: boolean;
}) {
  const decimals = step < 1 ? Math.min(3, String(step).split(".")[1]?.length ?? 2) : 0;
  const fmt = format ?? ((v: number) => `${Number(v.toFixed(decimals))}${unit ? (unit === "%" || unit === "°" ? unit : ` ${unit}`) : ""}`);
  // The Slider renders its own head (label | value). We let it render the
  // value on the right, hide its internal label text, and overlay our own
  // label + help toggletip on the left so the (i) sits next to the words
  // instead of floating in the right-hand reset/value zone (where it
  // overlapped longer values like "100%").
  return (
    <div className={cx(styles.sliderRow, changed && styles.rowChanged, disabled && styles.sliderRowDisabled)}>
      <div className={styles.sliderBody}>
        <Slider aria-label={label} showValue disabled={disabled} min={min} max={max} step={step} value={Math.min(max, Math.max(min, value))} formatValue={fmt} onValueChange={onChange} />
        <span className={styles.sliderLabel}>
          <span className={styles.rowName}>{label}</span>
          {help ? (
            <Toggletip label={`About ${label}`} side="right">
              {help}
            </Toggletip>
          ) : null}
        </span>
      </div>
      <ResetButton label={label} changed={changed} onReset={onReset} />
    </div>
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
