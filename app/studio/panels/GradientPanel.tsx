"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button, IconButton, Select, Slider } from "@/components/ui";
import { Advanced } from "../advanced";
import type { StudioApi } from "../api";
import { AngleRow, ColourSwatch, Group, Notice, Row, SelectRow, SliderRow, TextRow } from "../controls";
import { parseColour, toHex, type Rgb } from "../engine/colour";
import { applySoftness, parseGradient, positioned, serializeGradient, type Layer, type Stop } from "../engine/gradient";
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
  const softness = typeof api.theme.controls[`soft${token}`] === "number" ? (api.theme.controls[`soft${token}`] as number) : 1;
  const currentHelp = GRADIENTS.find((g) => g.token === token)?.help ?? "";

  const write = (next: Layer[], controls?: Record<string, number>) => api.set({ [token]: serializeGradient(next) }, controls);
  const editLayer = (i: number, patch: Partial<Layer>) => layers && write(layers.map((l, j) => (j === i ? ({ ...l, ...patch } as Layer) : l)));

  return (
    <>
      <Group title="Gradient" help="Rime has one gradient per gesture: brand for primary, danger for destructive, success for confirms, plus a few scene-setters (page bloom, auth background, admin strip). Pick one here to edit it, then adjust its direction, stops and softness below.">
        <SelectRow
          stacked
          label="Gradient"
          help={currentHelp}
          value={token}
          options={GRADIENTS.map((g) => ({ value: g.token, label: g.label }))}
          onChange={setToken}
        />
        <div className={styles.swatchBar} style={{ background: api.resolved(token) || value }} aria-hidden="true" />
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
      ) : (
        layers.map((layer, i) => (
          <Group key={i} title={layer.kind === "linear" ? `Linear layer ${i + 1}` : layer.kind === "radial" ? `Bloom ${i + 1}` : "Base colour"}>
            {layer.kind === "linear" ? (
              <>
                <AngleRow label="Gradient direction" value={((Math.round(layer.angle) % 360) + 360) % 360} onChange={(a) => editLayer(i, { angle: a })} />
                {layers.length === 1 ? (
                  <SliderRow
                    label="Softness"
                    value={softness}
                    min={0}
                    max={1}
                    step={0.05}
                    onChange={(s) => {
                      // Softness re-spreads the original stops, so it is reversible.
                      const original = parseGradient(api.base.get(token) ?? value);
                      const src = original && original[0].kind === "linear" ? original[0].stops : layer.stops;
                      write([{ ...layer, stops: applySoftness(src.length === layer.stops.length ? src.map((s, k) => ({ ...s, color: layer.stops[k].color })) : layer.stops, s) }], { [`soft${token}`]: s });
                    }}
                  />
                ) : null}
                <Stops stops={layer.stops} resolve={resolveColour} onChange={(stops) => editLayer(i, { stops })} />
              </>
            ) : layer.kind === "radial" ? (
              <BloomEditor layer={layer} resolve={resolveColour} onChange={(l) => editLayer(i, l)} />
            ) : (
              <StopColour color={layer.color} resolve={resolveColour} onChange={(c) => editLayer(i, { color: c })} />
            )}
          </Group>
        ))
      )}
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
