"use client";

import { Link2, Link2Off } from "lucide-react";
import { useRef, useState } from "react";
import { Button, Select, ToggleGroup } from "@/components/ui";
import { cx } from "@/components/ui/_internal/cx";
import type { StudioApi } from "../api";
import { ColourSwatch, Group, Notice, Row, SliderRow } from "../controls";
import { parseColour, toHex, type Rgb } from "../engine/colour";
import { parseGradient, positioned, serializeGradient, type Layer } from "../engine/gradient";
import styles from "../Studio.module.css";

/**
 * Step 6: Background. Owns everything that paints the page behind the
 * app: a Flatten toggle (fall back to the plain base colour), the base
 * colour swatch, and the two soft blooms as an interactive stage.
 *
 * Pulled out of the Gradients step because this one token (--page-background)
 * is fundamentally different from the small per-gesture gradients listed
 * there (brand button, danger confirm, admin strip, auth field). It has
 * its own 2D composition rules — blooms sit on a base colour at
 * independent positions and sizes — and giving it a dedicated step keeps
 * the Gradients step focused on the smaller linear sweeps.
 *
 * Design notes:
 *   - "Flatten" writes `var(--page-base)` to the token, dropping all
 *     bloom layers. Un-flattening restores the token's preset value.
 *   - The old "middle" linear sheen between the two blooms is intentionally
 *     NOT exposed. When the user is placing blooms independently, a fixed
 *     angle in the middle layer stops making conceptual sense; keeping the
 *     editor on just the two radials makes the mental model clean.
 *   - Each slider carries its own reset. Flatten is a separate reset.
 */

type Radial = Extract<Layer, { kind: "radial" }>;

const PAGE_BG_TOKEN = "--page-background";

export function BackgroundPanel({ api, resolveColour }: { api: StudioApi; resolveColour: (expr: string) => Rgb | null }) {
  const value = api.value(PAGE_BG_TOKEN) ?? "";
  const layers = parseGradient(value);
  const baseLayers = parseGradient(api.base.get(PAGE_BG_TOKEN) ?? value);

  const isFlat = layers !== null && layers.length === 1 && layers[0].kind === "colour";
  const radialIdx = layers ? layers.map((l, i) => (l.kind === "radial" ? i : -1)).filter((i) => i >= 0) : [];
  const radials: Array<{ layer: Radial; index: number; baseLayer: Radial | null }> = radialIdx.map((i) => ({
    layer: layers![i] as Radial,
    index: i,
    baseLayer: (baseLayers?.[i]?.kind === "radial" ? baseLayers[i] : null) as Radial | null,
  }));

  const flatten = () => {
    api.set({ [PAGE_BG_TOKEN]: "var(--page-base)" });
  };
  const restore = () => {
    api.reset([PAGE_BG_TOKEN]);
  };

  const editLayer = (i: number, patch: Partial<Layer>) => {
    if (!layers) return;
    const next = layers.map((l, j) => (j === i ? ({ ...l, ...patch } as Layer) : l));
    api.set({ [PAGE_BG_TOKEN]: serializeGradient(next) });
  };

  return (
    <>
      <Group
        title="Background"
        help="The whole-page backdrop. Two soft brand blooms over a base colour by default — one in a corner, one in the opposite. Flatten below to drop the blooms entirely."
        action={
          api.changed(PAGE_BG_TOKEN) ? (
            <Button size="sm" variant="ghost" onClick={restore}>Reset to the preset</Button>
          ) : null
        }
      >
        <Row
          label={isFlat ? "Flat" : "Blooms"}
          help="Flatten drops the two bloom layers and paints the page in just the base colour. Great for a clean, no-noise look. Unflatten to bring the blooms back."
        >
          <ToggleGroup
            type="single"
            size="sm"
            aria-label="Flatten or bloom"
            value={isFlat ? "flat" : "blooms"}
            onValueChange={(v: string | null) => {
              if (v === "flat") flatten();
              else if (v === "blooms") restore();
            }}
            items={[
              { value: "blooms", label: "Blooms" },
              { value: "flat", label: "Flat" },
            ]}
          />
        </Row>
      </Group>

      {!isFlat && radials.length > 0 ? (
        <Group title="Blooms" help="Pick a bloom at the top, then drag its position on the stage, resize, dial strength and fade. Each slider has its own reset.">
          <BloomsEditor
            radials={radials}
            resolve={resolveColour}
            onBloomChange={(bi, patch) => editLayer(radials[bi].index, patch)}
          />
        </Group>
      ) : null}

      {isFlat ? (
        <Notice tone="info">
          Flattened. The page shows the plain base colour, no blooms. Switch to Blooms above to bring them back.
        </Notice>
      ) : null}

      {!layers ? (
        <Group title="As CSS">
          <Notice tone="warn">This background is beyond the visual editor.</Notice>
        </Group>
      ) : null}
    </>
  );
}

function BloomsEditor({
  radials,
  resolve,
  onBloomChange,
}: {
  radials: Array<{ layer: Radial; index: number; baseLayer: Radial | null }>;
  resolve: (expr: string) => Rgb | null;
  onBloomChange: (bi: number, patch: Partial<Layer>) => void;
}) {
  const [active, setActive] = useState(0);
  const [aspectLocked, setAspectLocked] = useState(false);
  const padRef = useRef<HTMLDivElement>(null);
  const current = radials[active];
  if (!current) return null;

  return (
    <div className={styles.bloomEditor}>
      <ToggleGroup
        type="single"
        size="sm"
        aria-label="Which bloom"
        value={String(active)}
        onValueChange={(v: string | null) => v !== null && setActive(Number(v))}
        items={radials.map((_, i) => ({ value: String(i), label: `Bloom ${i + 1}` }))}
      />
      <RadialControls
        radial={current.layer}
        base={current.baseLayer}
        allRadials={radials}
        activeRadialIndex={current.index}
        padRef={padRef}
        aspectLocked={aspectLocked}
        onAspectLockToggle={() => setAspectLocked((v) => !v)}
        resolve={resolve}
        onChange={(patch) => onBloomChange(active, patch)}
      />
    </div>
  );
}

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

const alphaText = (rgb: Rgb, a: number) => `rgba(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)}, ${Number(a.toFixed(3))})`;

function RadialControls({
  radial,
  base,
  allRadials,
  activeRadialIndex,
  padRef,
  aspectLocked,
  onAspectLockToggle,
  resolve,
  onChange,
}: {
  radial: Radial;
  base: Radial | null;
  allRadials: Array<{ layer: Radial; index: number; baseLayer: Radial | null }>;
  activeRadialIndex: number;
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
  const swatchRgb: Rgb = { ...resolvedRgb, a: 1 };

  const setFirst = (color: string) =>
    onChange({ stops: [{ ...first, color }, ...radial.stops.slice(1)] });
  const setColour = (next: Rgb) => {
    const a = typeof next.a === "number" ? next.a : strength;
    setFirst(alphaText(next, a));
  };

  const applySize = (w: number, h: number) => onChange({ w, h });
  const setW = (w: number) => {
    if (aspectLocked) {
      const ratio = radial.h / Math.max(1, radial.w);
      applySize(w, Math.max(10, Math.min(200, Math.round(w * ratio))));
    } else onChange({ w });
  };
  const setH = (h: number) => {
    if (aspectLocked) {
      const ratio = radial.w / Math.max(1, radial.h);
      applySize(Math.max(10, Math.min(200, Math.round(h * ratio))), h);
    } else onChange({ h });
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
          const stageAlpha = Math.max(0.35, alpha);
          const isActive = it.index === activeRadialIndex;
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

      <Row label="Bloom colour" help="Click the swatch to open the picker. The brand palette strip at the bottom is one-click Brand / Deep / Accent / Neutral; the opacity slider edits the same value as Strength above. The dropdown switches to following a palette token by name.">
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
