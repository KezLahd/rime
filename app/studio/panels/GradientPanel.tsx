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
        // When the token has multiple radial (bloom) layers (e.g. the
        // page background), collapse them into one BloomsEditor group
        // with a Bloom 1 / Bloom 2 toggle, instead of two separate
        // groups full of duplicated sliders.
        const radialIdx = layers.map((l, i) => (l.kind === "radial" ? i : -1)).filter((i) => i >= 0);
        const useBloomsGroup = radialIdx.length >= 2;
        const nodes: ReactNode[] = [];
        layers.forEach((layer, i) => {
          if (useBloomsGroup && layer.kind === "radial") return; // deferred
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
          const bloomLayers = radialIdx.map((i) => layers[i] as Extract<Layer, { kind: "radial" }>);
          nodes.push(
            <Group key="blooms" title="Blooms" help="Each bloom is a soft, blurred glow painted on the page background. Drag its position on the grid, pull its size, pick a colour, dial strength and fade.">
              <BloomsEditor
                blooms={bloomLayers}
                resolve={resolveColour}
                onBloomChange={(bi, patch) => editLayer(radialIdx[bi], patch)}
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

/**
 * Multi-bloom editor: one component with a toggle at the top for which
 * bloom to edit (Bloom 1 / Bloom 2), an interactive 2D stage that drags
 * the bloom's centre on a mock page grid, width/height sliders with an
 * aspect-ratio lock, strength + fade sliders, and the colour swatch
 * (which pops the ColorPicker with the live brand palette strip). All
 * live-wired to the gradient layers.
 */
function BloomsEditor({
  blooms,
  resolve,
  onBloomChange,
}: {
  blooms: Radial[];
  resolve: (expr: string) => Rgb | null;
  onBloomChange: (index: number, patch: Partial<Layer>) => void;
}) {
  const [active, setActive] = useState(0);
  const [aspectLocked, setAspectLocked] = useState(false);
  const padRef = useRef<HTMLDivElement>(null);
  const bloom = blooms[active];
  if (!bloom) return null;

  const first = bloom.stops[0];
  const lastPos = positioned(bloom.stops)[bloom.stops.length - 1]?.pos ?? 65;
  const ch = first.color.match(/^rgba\(var\((--rgb-[\w-]+)\),\s*([\d.]+)\)$/);
  const literal = parseColour(first.color);
  const strength = ch ? Number(ch[2]) : literal ? literal.a : 1;
  const resolvedRgb = resolve(first.color) ?? literal ?? { r: 0, g: 0, b: 0, a: 1 };
  const bloomHex = toHex(resolvedRgb);

  const setFirst = (color: string) =>
    onBloomChange(active, { stops: [{ ...first, color }, ...bloom.stops.slice(1)] });

  const setColour = (next: Rgb) => {
    // Picking a specific hex drops the palette ref and writes the literal
    // rgba. Users who want "follow the brand" use the dropdown below the
    // swatch instead. Alpha stays at the current strength so the picker
    // changes hue/sat only.
    setFirst(alphaText(next, strength));
  };

  const setW = (w: number) => {
    if (aspectLocked) {
      const ratio = bloom.h / Math.max(1, bloom.w);
      onBloomChange(active, { w, h: Math.max(10, Math.min(200, Math.round(w * ratio))) });
    } else {
      onBloomChange(active, { w });
    }
  };
  const setH = (h: number) => {
    if (aspectLocked) {
      const ratio = bloom.w / Math.max(1, bloom.h);
      onBloomChange(active, { h, w: Math.max(10, Math.min(200, Math.round(h * ratio))) });
    } else {
      onBloomChange(active, { h });
    }
  };

  const dragStage = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = padRef.current;
    if (!el) return;
    e.preventDefault();
    el.setPointerCapture(e.pointerId);
    const apply = (clientX: number, clientY: number) => {
      const rect = el.getBoundingClientRect();
      // The stage represents the page (0 - 100 in both axes). Clamp to a
      // small margin outside so the user can push a bloom slightly off
      // the edge, matching the slider's -30 to 130 range.
      const xPct = ((clientX - rect.left) / rect.width) * 100;
      const yPct = ((clientY - rect.top) / rect.height) * 100;
      onBloomChange(active, {
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

  const colourFill = `rgba(${resolvedRgb.r}, ${resolvedRgb.g}, ${resolvedRgb.b}, ${strength})`;

  return (
    <div className={styles.bloomEditor}>
      {blooms.length > 1 ? (
        <ToggleGroup
          type="single"
          size="sm"
          aria-label="Which bloom"
          value={String(active)}
          onValueChange={(v: string | null) => v !== null && setActive(Number(v))}
          items={blooms.map((_, i) => ({ value: String(i), label: `Bloom ${i + 1}` }))}
        />
      ) : null}

      {/* Interactive stage: a mock page where the user drags the bloom.
          The dot's screen size scales with the bloom's --w / --h; its
          colour matches the live resolved colour at the current strength
          so dragging shows the actual bloom visually. */}
      <div
        ref={padRef}
        className={styles.bloomStage}
        onPointerDown={dragStage}
        role="application"
        aria-label="Bloom position"
      >
        <div className={styles.bloomStageGrid} aria-hidden="true" />
        {blooms.map((b, i) => {
          const rgb = resolve(b.stops[0].color) ?? parseColour(b.stops[0].color) ?? { r: 0, g: 0, b: 0, a: 1 };
          const chm = b.stops[0].color.match(/^rgba\(var\((--rgb-[\w-]+)\),\s*([\d.]+)\)$/);
          const alpha = chm ? Number(chm[2]) : (parseColour(b.stops[0].color)?.a ?? 1);
          const isActive = i === active;
          return (
            <div
              key={i}
              className={cx(styles.bloomDot, isActive && styles.bloomDotActive)}
              style={{
                left: `${b.x}%`,
                top: `${b.y}%`,
                width: `${b.w * 0.6}%`,
                height: `${b.h * 0.6}%`,
                background: `radial-gradient(ellipse at center, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha}) 0%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0) 70%)`,
              }}
              aria-hidden="true"
            />
          );
        })}
        <p className={styles.bloomStageHint}>Drag anywhere to move Bloom {active + 1} · {bloom.x}%, {bloom.y}%</p>
      </div>

      <div className={styles.bloomSize}>
        <SliderRow label="Width" value={bloom.w} min={10} max={200} step={1} unit="%" onChange={setW} />
        <SliderRow label="Height" value={bloom.h} min={10} max={200} step={1} unit="%" onChange={setH} />
        <button
          type="button"
          className={cx(styles.bloomLock, aspectLocked && styles.bloomLockOn)}
          aria-pressed={aspectLocked}
          aria-label={aspectLocked ? "Unlock aspect ratio" : "Lock aspect ratio"}
          title={aspectLocked ? "Unlock aspect ratio" : "Lock aspect ratio"}
          onClick={() => setAspectLocked((v) => !v)}
        >
          {aspectLocked ? <Link2 size={14} aria-hidden="true" /> : <Link2Off size={14} aria-hidden="true" />}
          <span>{aspectLocked ? "Linked" : "Independent"}</span>
        </button>
      </div>

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
        onChange={(pos) => onBloomChange(active, { stops: positioned(bloom.stops).map((s, k, all) => (k === all.length - 1 ? { ...s, pos } : s)) })}
      />

      <Row label="Bloom colour" help="Click the swatch to open the picker. The brand palette strip at the bottom of the picker is a shortcut: Brand, Deep, Accent, Neutral all one click away.">
        <ColourSwatch label="Bloom colour" colour={resolvedRgb} fill={colourFill} onChange={setColour} />
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
    </div>
  );
}
