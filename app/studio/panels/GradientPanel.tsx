"use client";

import { Link2, Link2Off, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button, IconButton, Select, Slider, ToggleGroup } from "@/components/ui";
import { cx } from "@/components/ui/_internal/cx";
import { Advanced } from "../advanced";
import type { StudioApi } from "../api";
import { AngleRow, ColourSwatch, Group, Notice, Row, SelectRow, SliderRow, TextRow, useGradientSelection } from "../controls";
import { parseColour, toHex, type Rgb } from "../engine/colour";
import { applySoftness, parseGradient, positioned, serializeGradient, type Layer, type Stop } from "../engine/gradient";
import { StopsBar } from "../StopsBar";
import styles from "../Studio.module.css";

const GRADIENTS: ReadonlyArray<{ token: string; label: string; help: string }> = [
  { token: "--brand-gradient", label: "Brand (primary button, active nav)", help: "The main gradient. Primary buttons, active nav pills, the brand chip in the sidebar corner. The one gradient per view that reads as the brand gesture." },
  { token: "--danger-gradient", label: "Danger", help: "Destructive confirm buttons and the danger-filled badge. Needs 4.5:1 for white text at its lightest stop." },
  { token: "--success-gradient", label: "Success", help: "The confirm-filled badge and the solid success button variant. Needs 4.5:1 for white text at its lightest stop." },
  { token: "--logo-corner-bg", label: "Logo corner", help: "Fill behind the brand logo in the SidebarShell when logoCorner=\"fill\". Hidden if the shell uses the glass corner." },
  { token: "--admin-strip-bg", label: "Context strip", help: "The full-width strip at the top of a SidebarShell when strip={...} is set (an admin session, a staging flag). Night-dark by default." },
  { token: "--auth-background", label: "Sign-in field", help: "The gradient field behind the auth cards (templates/starter uses it). Reads as atmosphere, not a card." },
  { token: "--gradient-brand-deep", label: "Deep brand gradient", help: "A darker variant used for selected rows and some chart tooltips. Not a primary gesture." },
  { token: "--highlight-edge", label: "Highlight card edge", help: "The thin highlight at the top edge of a glass card. Looks like light catching the glass." },
  { token: "--table-head-fill", label: "Table header sweep", help: "The horizontal sweep in table header cells. Reads as a tinted band, not a solid fill." },
  { token: "--page-background", label: "Page field and blooms", help: "The whole-page backdrop plus the two soft brand blooms (top-left + bottom-right). Also seen behind the preview here." },
];

/** Palette refs a stop can point at, so it keeps following the palette. */
const REFS = [
  { value: "var(--brand)", label: "Brand" },
  { value: "var(--brand-deep)", label: "Deep brand" },
  { value: "var(--brand-soft)", label: "Accent" },
  { value: "var(--support)", label: "Neutral" },
  { value: "var(--night)", label: "Night" },
  { value: "var(--danger-base-solid)", label: "Danger" },
  { value: "var(--danger-ink)", label: "Danger deep" },
  { value: "var(--success-solid)", label: "Success" },
];

/** A stop's colour as the editor shows it: a palette ref, a channel with alpha, or a literal. */
function describe(color: string, resolve: (expr: string) => Rgb | null): { rgb: Rgb; ref: string | null; channel: string | null } {
  const ref = REFS.find((r) => r.value === color)?.value ?? null;
  const ch = color.match(/^rgba\(var\((--rgb-[\w-]+)\),\s*([\d.]+)\)$/);
  const rgb = resolve(color) ?? { r: 0, g: 0, b: 0, a: 1 };
  return { rgb, ref, channel: ch ? ch[1] : null };
}

const alphaText = (rgb: Rgb, a: number) => `rgba(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)}, ${Number(a.toFixed(3))})`;

export function GradientPanel({ api, resolveColour }: { api: StudioApi; resolveColour: (expr: string) => Rgb | null }) {
  const [token, setToken] = useState(GRADIENTS[0].token);
  const value = api.value(token) ?? "";
  const layers = parseGradient(value);
  const currentHelp = GRADIENTS.find((g) => g.token === token)?.help ?? "";

  // Softness is DERIVED from the current end-stop spread, not stored
  // separately. That makes the two controls genuinely bidirectional:
  // drag the bar's end stops and the slider follows; drag the slider
  // and the stops move. Reads the preset's end stops to know what "full
  // softness" should look like for this specific token (not every
  // gradient's full spread is 0 → 100). */
  const baseLayers = parseGradient(api.base.get(token) ?? value);
  const baseLinear = baseLayers && baseLayers[0]?.kind === "linear" ? baseLayers[0] : null;
  const basePositioned = baseLinear ? positioned(baseLinear.stops) : null;
  const baseFirst = basePositioned?.[0]?.pos ?? 0;
  const baseLast = basePositioned?.[basePositioned.length - 1]?.pos ?? 100;
  const baseSpread = Math.max(0.0001, baseLast - baseFirst);
  const currentLinear = layers && layers[0]?.kind === "linear" ? layers[0] : null;
  const currentPositioned = currentLinear ? positioned(currentLinear.stops) : null;
  const currentFirst = currentPositioned?.[0]?.pos ?? baseFirst;
  const currentLast = currentPositioned?.[currentPositioned.length - 1]?.pos ?? baseLast;
  const softness = Math.max(0, Math.min(1, (currentLast - currentFirst) / baseSpread));

  // Broadcast which gradient is being edited; the preview on the right
  // renders only the specimen that uses it. Cleared on unmount so the
  // preview falls back to the all-gradients overview when the user leaves
  // the step.
  const selectGradient = useGradientSelection();
  useEffect(() => {
    selectGradient(token);
    return () => selectGradient(null);
  }, [token, selectGradient]);

  const write = (next: Layer[], controls?: Record<string, number>) => api.set({ [token]: serializeGradient(next) }, controls);
  const editLayer = (i: number, patch: Partial<Layer>) => layers && write(layers.map((l, j) => (j === i ? ({ ...l, ...patch } as Layer) : l)));

  return (
    <>
      <Group title="Which gradient" help="Rime has one gradient per gesture: brand for primary, danger for destructive, success for confirms, plus a few scene-setters (page bloom, auth background, admin strip). Pick one here to edit it, then adjust its direction, stops and softness below.">
        <SelectRow
          stacked
          label="Gradient"
          help={currentHelp}
          value={token}
          options={GRADIENTS.map((g) => ({ value: g.token, label: g.label }))}
          onChange={setToken}
        />
        {api.changed(token) ? (
          <div className={styles.actions}>
            <Button size="sm" variant="ghost" onClick={() => api.reset([token], [`soft${token}`])}>
              Reset to the preset
            </Button>
          </div>
        ) : null}
      </Group>

      {!layers ? (
        <Group title="As CSS">
          <Notice tone="warn">This value is beyond the visual editor; edit it as CSS.</Notice>
          <TextRow label="CSS value" token={token} value={value} changed={api.changed(token)} onCommit={(v) => api.set({ [token]: v })} onReset={() => api.reset([token])} />
        </Group>
      ) : (() => {
        // When the token has multiple bloom-like layers (radials + the
        // optional "middle" linear sheen that sits between them, e.g.
        // the page background), collapse them into one Group with a
        // single toggle (Bloom 1 / Middle / Bloom 2) and swap the
        // editor to match the layer's kind. Keeps everything related
        // to the page backdrop in one place instead of three stacked
        // groups full of duplicated sliders.
        const baseLayers = parseGradient(api.base.get(token) ?? value);
        const radialIdx = layers.map((l, i) => (l.kind === "radial" ? i : -1)).filter((i) => i >= 0);
        const linearSheenIdx = radialIdx.length >= 2
          ? layers.findIndex((l, i) => l.kind === "linear" && i > radialIdx[0] && i < layers.length - 0)
          : -1;
        const useBloomsGroup = radialIdx.length >= 2;
        const bloomLayerIdx = useBloomsGroup
          ? [...radialIdx, ...(linearSheenIdx >= 0 ? [linearSheenIdx] : [])].sort((a, b) => a - b)
          : [];
        const nodes: ReactNode[] = [];
        layers.forEach((layer, i) => {
          if (useBloomsGroup && bloomLayerIdx.includes(i)) return; // deferred
          nodes.push(
            <Group key={i} title={layer.kind === "linear" ? `Linear layer ${i + 1}` : layer.kind === "radial" ? `Bloom ${i + 1}` : "Base colour"}>
              {layer.kind === "linear" ? (
              <>
                <AngleRow label="Gradient direction" value={((Math.round(layer.angle) % 360) + 360) % 360} onChange={(a) => editLayer(i, { angle: a })} />
                {layers.length === 1 ? (
                  <SliderRow
                    label="Softness"
                    disabled={layer.stops.length > 2}
                    help={
                      layer.stops.length > 2
                        ? "Softness only moves the two end stops. With an intermediate stop on the bar, scaling just the ends while leaving the middle put produces a shape no single number can describe, so the slider is disabled. Delete the extra stops (click the × on each middle stop in the bar) and the slider becomes active again."
                        : "How much of the length the colours spend blending. 1 keeps the end stops at the preset's spread; 0 pulls them to the midpoint so the colours meet hard-edged. Dragging the end markers on the bar below moves this slider in step. Adding a stop on the bar disables the slider — delete the extra stops to get it back."
                    }
                    value={softness}
                    min={0}
                    max={1}
                    step={0.05}
                    onChange={(s) => {
                      // Softness re-spreads from the PRESET'S stop positions,
                      // keeping the slider reversible: no matter where the
                      // stops are now (bunched at the centre, asymmetric from
                      // a manual drag), setting softness back to 1 restores
                      // the preset's spread, and softness 0 meets at the
                      // preset's midpoint. Colours stay as currently edited.
                      const baseStops = baseLinear?.stops ?? layer.stops;
                      const src = baseStops.length === layer.stops.length
                        ? baseStops.map((bs, k) => ({ ...bs, color: layer.stops[k].color }))
                        : layer.stops;
                      write([{ ...layer, stops: applySoftness(src, s) }]);
                    }}
                  />
                ) : null}
                <StopsBar stops={layer.stops} resolve={resolveColour} onChange={(stops) => editLayer(i, { stops })} />
              </>
            ) : layer.kind === "radial" ? (
              <BloomEditor layer={layer} resolve={resolveColour} onChange={(l) => editLayer(i, l)} />
            ) : (
              <StopColour color={layer.color} resolve={resolveColour} onChange={(c) => editLayer(i, { color: c })} />
            )}
            </Group>
          );
        });
        if (useBloomsGroup) {
          const editable = bloomLayerIdx.map((i) => ({ layer: layers[i], index: i, baseLayer: baseLayers?.[i] ?? null }));
          nodes.push(
            <Group key="blooms" title="Page blooms" help="The two soft blooms + the middle sheen that paint the page background. Pick a layer at the top, then drag its position on the stage, resize, dial strength and fade. Each slider has its own reset.">
              <BloomsEditor
                items={editable}
                resolve={resolveColour}
                onItemChange={(bi, patch) => editLayer(bloomLayerIdx[bi], patch)}
              />
            </Group>,
          );
        }
        return <>{nodes}</>;
      })()}
      <Advanced api={api} tokens={GRADIENTS.map((g) => g.token)} />
    </>
  );
}

function Stops({ stops, resolve, onChange }: { stops: Stop[]; resolve: (e: string) => Rgb | null; onChange: (s: Stop[]) => void }) {
  const p = positioned(stops);
  return (
    <>
      {p.map((s, k) => (
        <div key={k} className={styles.stopRow}>
          <StopColour compact color={s.color} resolve={resolve} onChange={(c) => onChange(p.map((x, j) => (j === k ? { ...x, color: c } : x)))} />
          <Slider
            aria-label={`Stop ${k + 1} position`}
            className={styles.grow}
            showValue
            min={0}
            max={100}
            step={1}
            value={Math.round(s.pos)}
            formatValue={(v) => `${v}%`}
            onValueChange={(v: number) => onChange(p.map((x, j) => (j === k ? { ...x, pos: v } : x)))}
          />
          <IconButton size="sm" label={`Remove stop ${k + 1}`} icon={<Trash2 size={13} aria-hidden="true" />} disabled={p.length <= 2} onClick={() => onChange(p.filter((_, j) => j !== k))} />
        </div>
      ))}
      <div className={styles.actions}>
        <Button
          size="sm"
          variant="secondary"
          iconStart={<Plus size={13} aria-hidden="true" />}
          onClick={() => {
            const last = p[p.length - 1];
            const prev = p[p.length - 2] ?? last;
            onChange([...p.slice(0, -1), { color: prev.color, pos: (prev.pos + last.pos) / 2 }, last]);
          }}
        >
          Add a stop
        </Button>
      </div>
    </>
  );
}

/** A stop colour: a palette ref (select) or a fixed colour (picker), with alpha. */
function StopColour({ color, resolve, onChange, compact }: { color: string; resolve: (e: string) => Rgb | null; onChange: (c: string) => void; compact?: boolean }) {
  const d = describe(color, resolve);
  const well = (
    <ColourSwatch
      label="Stop"
      colour={d.rgb}
      fill={color}
      onChange={(p) => onChange(d.rgb.a < 1 ? alphaText(p, d.rgb.a) : toHex(p))}
    />
  );
  if (compact) return well;
  return (
    <Row label="Colour">
      {well}
      <Select
        size="sm"
        aria-label="Follow a palette colour"
        className={styles.grow}
        value={d.ref ?? "custom"}
        onChange={(v) => v !== "custom" && onChange(v)}
        options={[{ value: "custom", label: "Fixed colour" }, ...REFS]}
      />
    </Row>
  );
}

function BloomEditor({ layer, resolve, onChange }: { layer: Extract<Layer, { kind: "radial" }>; resolve: (e: string) => Rgb | null; onChange: (l: Partial<Layer>) => void }) {
  const first = layer.stops[0];
  const lastPos = positioned(layer.stops)[layer.stops.length - 1]?.pos ?? 65;
  const ch = first.color.match(/^rgba\(var\((--rgb-[\w-]+)\),\s*([\d.]+)\)$/);
  const literal = parseColour(first.color);
  const strength = ch ? Number(ch[2]) : literal ? literal.a : 1;
  const setFirst = (color: string) => onChange({ stops: [{ ...first, color }, ...layer.stops.slice(1)] });
  return (
    <>
      <SliderRow label="Across the page" value={layer.x} min={-30} max={130} step={1} unit="%" onChange={(x) => onChange({ x })} />
      <SliderRow label="Down the page" value={layer.y} min={-30} max={130} step={1} unit="%" onChange={(y) => onChange({ y })} />
      <SliderRow label="Width" value={layer.w} min={10} max={200} step={1} unit="%" onChange={(w) => onChange({ w })} />
      <SliderRow label="Height" value={layer.h} min={10} max={200} step={1} unit="%" onChange={(h) => onChange({ h })} />
      <SliderRow
        label="Strength"
        format={(v) => `${Math.round(v * 100)}%`}
        value={strength}
        min={0}
        max={1}
        step={0.01}
        onChange={(a) => setFirst(ch ? `rgba(var(${ch[1]}), ${a})` : alphaText(literal ?? { r: 0, g: 0, b: 0, a: 1 }, a))}
      />
      <SliderRow
        label="Fade"
        value={lastPos}
        min={20}
        max={100}
        step={1}
        unit="%"
        onChange={(pos) => onChange({ stops: positioned(layer.stops).map((s, k, all) => (k === all.length - 1 ? { ...s, pos } : s)) })}
      />
      <SelectRow
        label="Bloom colour"
        value={ch?.[1] ?? "custom"}
        options={[
          { value: "--rgb-bloom-a", label: "Bloom one" },
          { value: "--rgb-bloom-b", label: "Bloom two" },
          { value: "--rgb-brand", label: "Brand" },
          { value: "--rgb-brand-soft", label: "Accent" },
          { value: "--rgb-support", label: "Neutral" },
          ...(ch ? [] : [{ value: "custom", label: "Fixed colour" }]),
        ]}
        onChange={(v) => v !== "custom" && setFirst(`rgba(var(${v}), ${strength})`)}
      />
      {!ch && literal ? <p className={styles.mutedNote}>Fixed colour {toHex(literal)}. Choose a palette colour above to make it follow the palette.</p> : null}
      <p className={styles.mutedNote}>
        Now {toHex(resolve(first.color) ?? literal ?? { r: 0, g: 0, b: 0, a: 1 })} at {Math.round(strength * 100)}%.
      </p>
    </>
  );
}

type Radial = Extract<Layer, { kind: "radial" }>;
type Linear = Extract<Layer, { kind: "linear" }>;

type BloomItem = {
  layer: Layer;
  /** Position in the full layer list (for keys / resets against the base). */
  index: number;
  baseLayer: Layer | null;
};

function layerFirstStopAlpha(layer: Layer | null): number {
  if (!layer || layer.kind === "colour") return 1;
  const s = layer.stops[0];
  const ch = s.color.match(/^rgba\(var\((--rgb-[\w-]+)\),\s*([\d.]+)\)$/);
  if (ch) return Number(ch[2]);
  const literal = parseColour(s.color);
  return literal?.a ?? 1;
}

function layerLastStopPos(layer: Layer | null): number {
  if (!layer || layer.kind === "colour") return 100;
  const p = positioned(layer.stops);
  return p[p.length - 1]?.pos ?? 100;
}

/**
 * The page-background editor: one Group that owns both soft blooms AND
 * the middle linear sheen. A toggle at the top switches which layer the
 * controls apply to; the editor swaps to match the layer's kind.
 *
 * Design notes:
 *   - Stage renders on a flat white (or dark in dark mode) background
 *     so a bloom tinted the same hue as the themed page bg is still
 *     visible — the whole point of the stage is to show WHERE the bloom
 *     sits, not what the user's page looks like.
 *   - Each slider carries its own reset chip, driven by the preset
 *     gradient parsed from the token's base value.
 *   - The aspect-ratio lock sits between Width and Height, centred, so
 *     it reads as "these two are linked" instead of hovering off to the
 *     side of just one.
 *   - The colour row's swatch shows the hue at FULL opacity so the user
 *     sees the hue clearly; the alpha channel lives on the Strength
 *     slider, which is where that control actually belongs.
 */
function BloomsEditor({
  items,
  resolve,
  onItemChange,
}: {
  items: BloomItem[];
  resolve: (expr: string) => Rgb | null;
  onItemChange: (index: number, patch: Partial<Layer>) => void;
}) {
  const [active, setActive] = useState(0);
  const [aspectLocked, setAspectLocked] = useState(false);
  const padRef = useRef<HTMLDivElement>(null);
  const current = items[active];
  if (!current) return null;

  const labelFor = (it: BloomItem, i: number): string => {
    if (it.layer.kind === "linear") return "Middle";
    // Two radials: first is Bloom 1, second is Bloom 2. If the layer list
    // has the linear sandwiched between them (page-background), the
    // ordering by index already gives Bloom 1 / Middle / Bloom 2.
    const radialOrdinal = items.slice(0, i + 1).filter((x) => x.layer.kind === "radial").length;
    return `Bloom ${radialOrdinal}`;
  };

  return (
    <div className={styles.bloomEditor}>
      <ToggleGroup
        type="single"
        size="sm"
        aria-label="Which layer"
        value={String(active)}
        onValueChange={(v: string | null) => v !== null && setActive(Number(v))}
        items={items.map((it, i) => ({ value: String(i), label: labelFor(it, i) }))}
      />

      {current.layer.kind === "radial" ? (
        <RadialBloomControls
          radial={current.layer}
          base={(current.baseLayer?.kind === "radial" ? current.baseLayer : null) as Radial | null}
          allRadials={items.filter((x) => x.layer.kind === "radial") as Array<BloomItem & { layer: Radial }>}
          activeRadialKey={current.index}
          padRef={padRef}
          aspectLocked={aspectLocked}
          onAspectLockToggle={() => setAspectLocked((v) => !v)}
          resolve={resolve}
          onChange={(patch) => onItemChange(active, patch)}
        />
      ) : current.layer.kind === "linear" ? (
        <LinearSheenControls
          linear={current.layer}
          base={(current.baseLayer?.kind === "linear" ? current.baseLayer : null) as Linear | null}
          resolve={resolve}
          onChange={(patch) => onItemChange(active, patch)}
        />
      ) : null}
    </div>
  );
}

function RadialBloomControls({
  radial,
  base,
  allRadials,
  activeRadialKey,
  padRef,
  aspectLocked,
  onAspectLockToggle,
  resolve,
  onChange,
}: {
  radial: Radial;
  base: Radial | null;
  allRadials: Array<BloomItem & { layer: Radial }>;
  activeRadialKey: number;
  padRef: React.RefObject<HTMLDivElement | null>;
  aspectLocked: boolean;
  onAspectLockToggle: () => void;
  resolve: (expr: string) => Rgb | null;
  onChange: (patch: Partial<Layer>) => void;
}) {
  const first = radial.stops[0];
  const lastPos = layerLastStopPos(radial);
  const baseLast = layerLastStopPos(base);
  const strength = layerFirstStopAlpha(radial);
  const baseStrength = layerFirstStopAlpha(base);
  const ch = first.color.match(/^rgba\(var\((--rgb-[\w-]+)\),\s*([\d.]+)\)$/);
  const literal = parseColour(first.color);
  const resolvedRgb = resolve(first.color) ?? literal ?? { r: 0, g: 0, b: 0, a: 1 };
  const bloomHex = toHex(resolvedRgb);
  // Swatch shows the OPAQUE hex so the user sees the hue; strength
  // (alpha) is edited on its own slider below.
  const swatchRgb: Rgb = { ...resolvedRgb, a: 1 };

  const setFirst = (color: string) =>
    onChange({ stops: [{ ...first, color }, ...radial.stops.slice(1)] });
  const setColour = (next: Rgb) => {
    // Opacity slider in the picker IS the strength: both edit the same
    // alpha channel. Preserve whichever came from the picker so dragging
    // the alpha strip updates the Strength slider on the next render.
    const a = typeof next.a === "number" ? next.a : strength;
    setFirst(alphaText(next, a));
  };

  const applySize = (w: number, h: number) => onChange({ w, h });
  const setW = (w: number) => {
    if (aspectLocked) {
      const ratio = radial.h / Math.max(1, radial.w);
      applySize(w, Math.max(10, Math.min(200, Math.round(w * ratio))));
    } else {
      onChange({ w });
    }
  };
  const setH = (h: number) => {
    if (aspectLocked) {
      const ratio = radial.w / Math.max(1, radial.h);
      applySize(Math.max(10, Math.min(200, Math.round(h * ratio))), h);
    } else {
      onChange({ h });
    }
  };

  const dragStage = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = padRef.current;
    if (!el) return;
    e.preventDefault();
    el.setPointerCapture(e.pointerId);
    const apply = (clientX: number, clientY: number) => {
      const rect = el.getBoundingClientRect();
      const xPct = ((clientX - rect.left) / rect.width) * 100;
      const yPct = ((clientY - rect.top) / rect.height) * 100;
      onChange({
        x: Math.max(-30, Math.min(130, Math.round(xPct))),
        y: Math.max(-30, Math.min(130, Math.round(yPct))),
      });
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

  return (
    <>
      {/* Flat stage so bloom hues always read against a neutral field,
          not against a background painted the same colour. */}
      <div
        ref={padRef}
        className={styles.bloomStage}
        onPointerDown={dragStage}
        role="application"
        aria-label="Bloom position"
      >
        <div className={styles.bloomStageGrid} aria-hidden="true" />
        {allRadials.map((it) => {
          const b = it.layer;
          const rgb = resolve(b.stops[0].color) ?? parseColour(b.stops[0].color) ?? { r: 0, g: 0, b: 0, a: 1 };
          const chm = b.stops[0].color.match(/^rgba\(var\((--rgb-[\w-]+)\),\s*([\d.]+)\)$/);
          const alpha = chm ? Number(chm[2]) : (parseColour(b.stops[0].color)?.a ?? 1);
          const isActive = it.index === activeRadialKey;
          // Boost minimum alpha on the stage so a very weak bloom is
          // still visible as a shape — the goal is to show the position,
          // not to replicate the exact opacity (which the Strength slider
          // already communicates numerically).
          const stageAlpha = Math.max(0.35, alpha);
          return (
            <div
              key={it.index}
              className={cx(styles.bloomDot, isActive && styles.bloomDotActive)}
              style={{
                left: `${b.x}%`,
                top: `${b.y}%`,
                width: `${b.w * 0.6}%`,
                height: `${b.h * 0.6}%`,
                background: `radial-gradient(ellipse at center, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${stageAlpha}) 0%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0) 70%)`,
              }}
              aria-hidden="true"
            />
          );
        })}
        <p className={styles.bloomStageHint}>Drag · {radial.x}%, {radial.y}%</p>
      </div>

      <SliderRow
        label="Width"
        value={radial.w}
        min={10}
        max={200}
        step={1}
        unit="%"
        onChange={setW}
        changed={base ? radial.w !== base.w : false}
        onReset={base && radial.w !== base.w ? () => applySize(base.w, radial.h) : undefined}
      />

      {/* Aspect-ratio lock chip sits BETWEEN Width and Height, centred,
          with hairlines so it reads as "these two are linked". */}
      <div className={styles.bloomLockRow}>
        <span className={styles.bloomLockRule} />
        <button
          type="button"
          className={cx(styles.bloomLock, aspectLocked && styles.bloomLockOn)}
          aria-pressed={aspectLocked}
          aria-label={aspectLocked ? "Unlock aspect ratio" : "Lock aspect ratio"}
          title={aspectLocked ? "Unlock aspect ratio" : "Lock aspect ratio"}
          onClick={onAspectLockToggle}
        >
          {aspectLocked ? <Link2 size={13} aria-hidden="true" /> : <Link2Off size={13} aria-hidden="true" />}
          <span>{aspectLocked ? "Linked" : "Independent"}</span>
        </button>
        <span className={styles.bloomLockRule} />
      </div>

      <SliderRow
        label="Height"
        value={radial.h}
        min={10}
        max={200}
        step={1}
        unit="%"
        onChange={setH}
        changed={base ? radial.h !== base.h : false}
        onReset={base && radial.h !== base.h ? () => applySize(radial.w, base.h) : undefined}
      />

      <SliderRow
        label="Strength"
        format={(v) => `${Math.round(v * 100)}%`}
        value={strength}
        min={0}
        max={1}
        step={0.01}
        onChange={(a) => setFirst(ch ? `rgba(var(${ch[1]}), ${a})` : alphaText(literal ?? { r: 0, g: 0, b: 0, a: 1 }, a))}
        changed={base ? Math.abs(strength - baseStrength) > 0.001 : false}
        onReset={base ? () => {
          const bch = base.stops[0].color.match(/^rgba\(var\((--rgb-[\w-]+)\),\s*([\d.]+)\)$/);
          if (bch) setFirst(`rgba(var(${bch[1]}), ${bch[2]})`);
          else setFirst(base.stops[0].color);
        } : undefined}
      />
      <SliderRow
        label="Fade"
        value={lastPos}
        min={20}
        max={100}
        step={1}
        unit="%"
        onChange={(pos) => onChange({ stops: positioned(radial.stops).map((s, k, all) => (k === all.length - 1 ? { ...s, pos } : s)) })}
        changed={base ? Math.abs(lastPos - baseLast) > 0.5 : false}
        onReset={base ? () => onChange({ stops: positioned(radial.stops).map((s, k, all) => (k === all.length - 1 ? { ...s, pos: baseLast } : s)) }) : undefined}
      />

      <Row label="Bloom colour" help="Click the swatch to open the picker. The brand palette strip at the bottom of the picker is one-click shortcuts for Brand / Deep / Accent / Neutral; the opacity slider there sits beside the hue strip and edits the same value as Strength above. The dropdown next to it switches to following a palette colour by name instead of pinning a hex.">
        <ColourSwatch label="Bloom colour" alpha colour={{ ...swatchRgb, a: strength }} onChange={setColour} />
        <Select
          size="sm"
          aria-label="Follow a palette colour"
          className={styles.grow}
          value={ch?.[1] ?? "custom"}
          onChange={(v) => v !== "custom" && setFirst(`rgba(var(${v}), ${strength})`)}
          options={[
            { value: "--rgb-brand", label: "Brand" },
            { value: "--rgb-brand-soft", label: "Accent" },
            { value: "--rgb-brand-deep", label: "Deep" },
            { value: "--rgb-support", label: "Neutral" },
            { value: "--rgb-bloom-a", label: "Bloom one preset" },
            { value: "--rgb-bloom-b", label: "Bloom two preset" },
            ...(ch ? [] : [{ value: "custom", label: "Fixed colour" }]),
          ]}
        />
      </Row>
      <p className={styles.mutedNote}>
        Now {bloomHex} at {Math.round(strength * 100)}%.
      </p>
    </>
  );
}

/**
 * The "middle" layer of the page background is a thin linear sheen
 * from one bloom hue to the other. Keep its editor compact: angle +
 * stops bar, same shape as the Linear editor above but living inside
 * the unified Blooms toggle so the page background is one place.
 */
function LinearSheenControls({
  linear,
  base,
  resolve,
  onChange,
}: {
  linear: Linear;
  base: Linear | null;
  resolve: (expr: string) => Rgb | null;
  onChange: (patch: Partial<Layer>) => void;
}) {
  return (
    <>
      <p className={styles.mutedNote}>
        A subtle linear sheen between the two blooms — a diagonal wash in
        the brand hues. Drag the stops on the bar; use the direction dial
        to spin the wash.
      </p>
      <AngleRow
        label="Direction"
        value={((Math.round(linear.angle) % 360) + 360) % 360}
        onChange={(a) => onChange({ angle: a })}
        changed={base ? Math.round(linear.angle) !== Math.round(base.angle) : false}
        onReset={base ? () => onChange({ angle: base.angle }) : undefined}
      />
      <StopsBar stops={linear.stops} resolve={resolve} onChange={(stops) => onChange({ stops })} />
    </>
  );
}
