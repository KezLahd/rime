"use client";

import { useEffect, useState } from "react";
import { Button, Select, Toggletip, ToggleGroup } from "@/components/ui";
import { Advanced } from "../advanced";
import type { StudioApi } from "../api";
import { AngleRow, CheckRow, ColourRow, ColourSwatch, Group, Notice, Row, SelectRow, SliderRow, SurfaceStrip, useShadowSelection } from "../controls";
import { parseColour, toCss, toHex, type Rgb } from "../engine/colour";
import { colourOf, controlHeights, glassOff, glassSurface, GLASS_SURFACES, radiusScale, RADIUS_STEPS, readBlur, readGlass } from "../engine/macros";
import { buildShadow, guessParams, scaleAlphas, type ShadowParams } from "../engine/shadow";
import styles from "../Studio.module.css";

const num = (v: string | undefined, fallback: number) => {
  const n = parseFloat(v ?? "");
  return Number.isFinite(n) ? n : fallback;
};
const ctl = (api: StudioApi, key: string, fallback: number) => {
  const v = api.theme.controls[key];
  return typeof v === "number" ? v : fallback;
};

// ── Shape and space ───────────────────────────────────────────────────────

const PILL_TOKENS = ["--button-radius", "--input-radius", "--chip-radius", "--icon-button-radius", "--segmented-radius"];

export function ShapePanel({ api }: { api: StudioApi }) {
  const presetRound = api.theme.base === "flat" ? 0.6 : 1;
  const roundness = ctl(api, "roundness", presetRound);
  const pill = api.theme.controls.pill === true;
  const radiusNames = [...RADIUS_STEPS, "--r-full", "--r-flat", "--r-circle", ...PILL_TOKENS];
  const setRadius = (r: number, p: boolean) => api.set(radiusScale(r, p), { roundness: r, pill: p });

  const controlScale = ctl(api, "controlScale", 1);
  const heightNames = ["--control-h-sm", "--control-h-md", "--control-h-lg", "--field-h-sm", "--field-h-md"];

  return (
    <>
      <Group
        title="Corners"
        help="One scale from square to soft: every radius in the kit moves together. Rime Default sits at 1; Rime Flat at 0.6, in either mode. Pill rounds buttons, fields and chips fully on top of the scale."
        action={
          <span className={styles.toolbarGroup}>
            <Button size="sm" variant="ghost" onClick={() => setRadius(0, false)}>
              Square
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setRadius(1, false)}>
              Default
            </Button>
          </span>
        }
      >
        <SliderRow
          label="Corner roundness"
          help="One multiplier for every corner in the kit. 0 is square, 1 is the Rime Default (modest radii), 2 is softly rounded. Rime Flat sits at 0.6. Changes all --r-* steps together."
          value={roundness}
          min={0}
          max={2}
          step={0.05}
          changed={radiusNames.some(api.changed)}
          onChange={(r) => setRadius(r, pill)}
          onReset={() => api.reset(radiusNames, ["roundness", "pill"])}
        />
        <CheckRow
          label="Pill-shaped controls"
          note="Rounds buttons, fields and chips fully on top of the roundness scale. Great for playful or ad-tech-y brands."
          checked={pill}
          onChange={(p) => setRadius(roundness, p)}
        />
      </Group>

      <Group title="Space and size" help="Density multiplies every component's padding: under 1 is compact, over 1 is roomy. Control height moves buttons, chips and fields together.">
        <SliderRow
          label="Density"
          token="--density"
          help="Multiplies the internal padding of every component. 1 is the preset default, below 1 reads as compact, above 1 as roomy. Nothing else moves."
          value={num(api.value("--density"), 1)}
          min={0.7}
          max={1.4}
          step={0.05}
          changed={api.changed("--density")}
          onChange={(v) => api.set({ "--density": String(v) })}
          onReset={() => api.reset(["--density"])}
        />
        <SliderRow
          label="Control height"
          help="Scales the small / medium / large heights for buttons, icon buttons, chips and fields together. 100% is the preset default. Scales the three field heights too."
          format={(v) => `${Math.round(v * 100)}%`}
          value={controlScale}
          min={0.8}
          max={1.3}
          step={0.025}
          changed={heightNames.some(api.changed)}
          onChange={(k) => api.set(controlHeights(k), { controlScale: k })}
          onReset={() => api.reset(heightNames, ["controlScale"])}
        />
        <SliderRow
          label="Hairline weight"
          token="--border-w"
          help="Width of the thin rules that appear between rows, under card headers and around panels. 1 px is default; drop to 0 for a completely flush look. Whole pixels only."
          value={num(api.value("--border-w"), 1)}
          min={0}
          max={4}
          step={1}
          unit="px"
          changed={api.changed("--border-w")}
          onChange={(v) => api.set({ "--border-w": `${v}px` })}
          onReset={() => api.reset(["--border-w"])}
        />
        <SliderRow
          label="Field border weight"
          token="--border-w-field"
          help="Width of the box around inputs, selects and textareas. 1 - 2 px reads as a tangible edge; thicker reads bolder. Whole pixels only."
          value={num(api.value("--border-w-field"), 1.5)}
          min={0}
          max={4}
          step={1}
          unit="px"
          changed={api.changed("--border-w-field")}
          onChange={(v) => api.set({ "--border-w-field": `${v}px` })}
          onReset={() => api.reset(["--border-w-field"])}
        />
      </Group>

      {/* Dialog widths used to live here as three sliders. Removed:
          --modal-width-sm / md / lg are shipping defaults that almost
          nobody tunes mid-walkthrough, and the three live-resizing
          dialog previews on the right were doing too much work for a
          control nobody edits. Still editable from Advanced below /
          the full tokens list if someone genuinely needs it. */}
      <Advanced api={api} tokens={[...RADIUS_STEPS, "--r-full", ...PILL_TOKENS, "--density", ...heightNames, "--border-w", "--border-w-field", "--modal-width-sm", "--modal-width-md", "--modal-width-lg"]} />
    </>
  );
}

// ── Glass ─────────────────────────────────────────────────────────────────

const ALL_GLASS = [
  ...GLASS_SURFACES.flatMap((s) => [...s.fills, s.blur, s.edge].filter((x): x is string => Boolean(x))),
  "--blur-panel-light",
  "--blur-row",
  "--blur-pill",
  "--blur-callout",
  "--blur-recess",
  "--modal-scrim-blur",
  "--chrome-backdrop",
  "--button-secondary-bg",
  "--glass-fill-chrome",
];

export function GlassTab({ api }: { api: StudioApi }) {
  const base = api.theme.base;
  return (
    <>
      {/* The preview preset: Frosted (Rime Default — translucent panels,
          soft glows) vs Flat (Rime Flat — opaque surfaces, sharp
          corners, no blur). This drives ONLY the preview on the right;
          the kit's top-bar Default / Flat buttons control the rest of
          the site + the Studio chrome, but can't reach into the preview. */}
      <Group title="Preset" help="Frosted is Rime's translucent default — glass panels, rounder radii, soft glows. Flat drops the blur, flattens the corners and loses the glow for a crisper, document-y look. All your edits so far stay; only the untouched tokens follow the new base.">
        <Row label="Style">
          <ToggleGroup
            type="single"
            size="sm"
            aria-label="Preset"
            value={base}
            onValueChange={(v: string | null) => v && (v === "default" || v === "flat") && api.setBase(v)}
            items={[
              { value: "default", label: "Frosted" },
              { value: "flat", label: "Flat" },
            ]}
          />
        </Row>
      </Group>
      {/* Glass step controls panels only: cards, overlays and the glass
          wells on buttons / fields. Sidebar, top bar, modals, popovers
          and toasts have been pulled out — those surfaces are part of
          the layout + overlay chrome, which gets its own step later
          (see Layout + a planned Overlays step). Keeping Glass focused
          on panels stops the step reading as "re-tint every surface in
          the app one at a time." */}
      {GLASS_SURFACES.filter((s) => s.id === "panels").map((s) => (
        <SurfaceEditor key={s.id} api={api} surfaceId={s.id} />
      ))}
      <Group title="Edges" help="The thin light line along the top of glass surfaces, and the lit edge round a glass panel.">
        <SliderRow
          label="Top light"
          format={(v) => `${Math.round(v * 100)}%`}
          token="--shadow-specular"
          value={num(api.value("--shadow-specular")?.match(/,\s*([\d.]+)\)\s*$/)?.[1], 0.9)}
          min={0}
          max={1}
          step={0.05}
          changed={api.changed("--shadow-specular")}
          onChange={(a) => api.set({ "--shadow-specular": `inset 0 1px 0 rgba(var(--rgb-white), ${a})` })}
          onReset={() => api.reset(["--shadow-specular"])}
        />
        <ColourRow label="Panel edge" alpha colour={colourOf(api.resolved("--glass-edge"))} changed={api.changed("--glass-edge")} onChange={(c) => api.set({ "--glass-edge": `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${c.a})` })} onReset={() => api.reset(["--glass-edge"])} />
      </Group>
      <Advanced api={api} tokens={ALL_GLASS.concat(["--shadow-specular", "--glass-edge"])} />
    </>
  );
}

const SURFACE_DEFAULTS: Record<string, { fill: string; blur: string }> = {
  toasts: { fill: "rgba(255, 255, 255, 0.82)", blur: "blur(28px) saturate(180%)" },
};

export function SurfaceEditor({ api, surfaceId }: { api: StudioApi; surfaceId: string }) {
  const s = GLASS_SURFACES.find((x) => x.id === surfaceId)!;
  const fill = api.resolved(s.fills[0]) || SURFACE_DEFAULTS[s.id]?.fill;
  const blurValue = s.blur ? api.resolved(s.blur) || SURFACE_DEFAULTS[s.id]?.blur : undefined;
  const g = readGlass(fill);
  const b = readBlur(blurValue);
  const names = [...s.fills, ...(s.blur ? [s.blur] : []), ...(s.id === "panels" ? ["--blur-panel-light", "--blur-row"] : [])];
  const apply = (patch: Partial<{ tint: typeof g.tint; opacity: number; blur: number; saturate: number }>) =>
    api.set(glassSurface(s, { tint: g.tint, opacity: g.opacity, blur: b.blur, saturate: b.saturate, ...patch }));
  const changed = names.some(api.changed);
  return (
    <Group
      title={s.label}
      action={
        changed ? (
          <Button size="sm" variant="ghost" onClick={() => api.reset(names)}>
            Reset
          </Button>
        ) : null
      }
    >
      <ColourRow label="Glass tint" colour={g.tint} changed={changed} onChange={(c) => apply({ tint: { ...c, a: 1 } })} onReset={() => api.reset(names)} />
      <SliderRow label="Glass opacity" format={(v) => `${Math.round(v * 100)}%`} value={g.opacity} min={0} max={1} step={0.01} changed={changed} onChange={(v) => apply({ opacity: v })} onReset={() => api.reset(names)} />
      {s.blur ? (
        <>
          <SliderRow label="Glass blur" value={b.blur} min={0} max={64} step={1} unit="px" changed={changed} onChange={(v) => apply({ blur: v })} onReset={() => api.reset(names)} />
          <SliderRow label="Colour boost" value={b.saturate} min={100} max={220} step={5} unit="%" changed={changed} onChange={(v) => apply({ saturate: v })} onReset={() => api.reset(names)} />
        </>
      ) : (
        <p className={styles.mutedNote}>It shares the sidebar&apos;s blur.</p>
      )}
    </Group>
  );
}

// ── Shadows ───────────────────────────────────────────────────────────────

const ELEVATIONS: ReadonlyArray<{ token: string; label: string }> = [
  { token: "--shadow-hairline-card", label: "Card" },
  { token: "--shadow-panel-light", label: "Light panel" },
  { token: "--shadow-panel", label: "Panel" },
  { token: "--shadow-float", label: "Tooltip" },
  { token: "--shadow-lift", label: "Highlight card" },
  { token: "--popover-shadow", label: "Popover" },
  { token: "--modal-shadow", label: "Modal" },
  { token: "--shadow-chrome", label: "Chrome" },
  { token: "--shadow-auth-card", label: "Sign-in card" },
  { token: "--sidebar-shadow", label: "Sidebar edge" },
  { token: "--topbar-shadow", label: "Top bar edge" },
  { token: "--glow-md", label: "Button glow" },
];

const CHANNELS = [
  { value: "--rgb-brand-deep", label: "Deep brand" },
  { value: "--rgb-brand", label: "Brand" },
  { value: "--rgb-contact", label: "Contact (near-black)" },
  { value: "--rgb-shade", label: "Press shade" },
  { value: "0, 0, 0", label: "Black" },
];

/** Which shadow tokens sit under a frosted-glass surface. Only these
 *  show the "Top light line" (specular) toggle, since that highlight
 *  reads as light catching the glass edge and makes no sense for a
 *  hairline / float / button glow / sidebar-edge drop. */
const GLASS_SHADOW_TOKENS = new Set<string>([
  "--shadow-panel",
  "--shadow-lift",
  "--popover-shadow",
  "--modal-shadow",
  "--shadow-chrome",
  "--shadow-auth-card",
]);

/**
 * Shadow colour editor: a proper swatch (opens ColorPicker with the
 * brand palette strip + opacity) + a "Follow palette" dropdown that
 * maps to the shadow-engine's palette channels (--rgb-brand-deep,
 * --rgb-brand, --rgb-contact, --rgb-shade, Black). Picking a hex in
 * the swatch writes "r, g, b" so buildShadow turns it into a literal
 * rgba; picking a palette ref writes the channel name as before.
 */
function ShadowColourRow({
  channel,
  onChange,
  changed,
  onReset,
}: {
  channel: string;
  onChange: (channel: string) => void;
  changed?: boolean;
  onReset?: () => void;
}) {
  // Current colour for the swatch preview. Palette refs resolve via
  // the CSS probe at render time; "r, g, b" literals parse directly.
  const isRef = channel.startsWith("--");
  let rgb: Rgb = { r: 0, g: 0, b: 0, a: 1 };
  if (isRef) {
    // Probe the CSS variable on an off-screen element.
    if (typeof window !== "undefined") {
      const probe = document.createElement("div");
      probe.style.position = "absolute";
      probe.style.visibility = "hidden";
      probe.style.backgroundColor = `rgb(var(${channel}))`;
      document.body.appendChild(probe);
      const resolved = parseColour(getComputedStyle(probe).backgroundColor);
      document.body.removeChild(probe);
      if (resolved) rgb = resolved;
    }
  } else {
    const match = channel.match(/^(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (match) rgb = { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]), a: 1 };
  }

  const setFromRgb = (next: Rgb) => {
    onChange(`${Math.round(next.r)}, ${Math.round(next.g)}, ${Math.round(next.b)}`);
  };

  const selectValue = CHANNELS.some((c) => c.value === channel) ? channel : "custom";

  return (
    <Row
      label="Shadow colour"
      help="Pick a specific hex in the swatch, or follow a palette token (brand / deep / contact / press). Hex pins a literal colour; the palette dropdown keeps the shadow following your theme."
      changed={changed}
      onReset={onReset}
    >
      <ColourSwatch label="Shadow colour" colour={rgb} onChange={setFromRgb} />
      <Select
        size="sm"
        aria-label="Follow a palette channel"
        className={styles.grow}
        value={selectValue}
        onChange={(v) => v !== "custom" && onChange(v)}
        options={[
          ...CHANNELS,
          ...(selectValue === "custom" ? [{ value: "custom", label: "Fixed colour" }] : []),
        ]}
      />
    </Row>
  );
}

export function ShadowPanel({ api }: { api: StudioApi }) {
  const [token, setToken] = useState(ELEVATIONS[2].token);
  const current = api.value(token) ?? api.resolved(token);
  // `p` is the LIVE params. Instead of keeping it in local state (which
  // drifts out of sync with the token when a reset chip or the brush
  // elsewhere rewrites the token), derive it from the current CSS value
  // every render. Edits flow value → setParams → buildShadow → api.set.
  const p: ShadowParams = guessParams(current || "0 12px 48px rgba(var(--rgb-brand-deep), 0.16)");
  const update = (patch: Partial<ShadowParams>) => {
    api.set({ [token]: buildShadow({ ...p, ...patch }) });
  };

  // Baseline params for per-slider resets. Prefers the applied-palette
  // baseline when the user applied one on step 1; falls back to the
  // preset's own value otherwise. So "reset Distance" means "back to
  // the Distance from your applied theme", not "back to Rime Default".
  const baselineRaw =
    api.theme.baseline?.[token] ?? api.base.get(token) ?? current ?? "0 12px 48px rgba(var(--rgb-brand-deep), 0.16)";
  const basePrms: ShadowParams = guessParams(baselineRaw);

  const depthNames = ELEVATIONS.map((e) => e.token);

  // Broadcast which shadow is being edited; the preview on the right
  // renders only the specimen that uses it, so the user sees exactly
  // the surface they're reshaping instead of a grid of every elevation.
  const selectShadow = useShadowSelection();
  useEffect(() => {
    selectShadow(token);
    return () => selectShadow(null);
  }, [token, selectShadow]);
  return (
    <>
      {/* Surface strip sits as a full-bleed sticky header above the
          sliders. Each shadow is per-surface, so the user picks WHICH
          surface they're reshaping before touching any slider; the
          strip shows a check on every elevation that's been edited
          away from the preset so progress is visible at a glance. */}
      <SurfaceStrip
        variant="header"
        label="Surface"
        value={token}
        options={ELEVATIONS.map((e) => ({ value: e.token, label: e.label }))}
        onChange={setToken}
        isComplete={(t) => api.changed(t)}
      />
      <Group title="One elevation" help="Direction, distance, softness, spread, a tinted colour and one to three layers: a shade above, the fall, and a tight contact shadow.">
        <AngleRow
          label="Shadow direction"
          value={p.angle}
          onChange={(v) => update({ angle: v })}
          changed={p.angle !== basePrms.angle}
          onReset={p.angle !== basePrms.angle ? () => update({ angle: basePrms.angle }) : undefined}
        />
        <SliderRow
          label="Distance"
          value={p.distance}
          min={0}
          max={48}
          step={1}
          unit="px"
          onChange={(v) => update({ distance: v })}
          changed={p.distance !== basePrms.distance}
          onReset={() => update({ distance: basePrms.distance })}
        />
        <SliderRow
          label="Softness"
          value={p.blur}
          min={0}
          max={96}
          step={1}
          unit="px"
          onChange={(v) => update({ blur: v })}
          changed={p.blur !== basePrms.blur}
          onReset={() => update({ blur: basePrms.blur })}
        />
        <SliderRow
          label="Spread"
          value={p.spread}
          min={-32}
          max={16}
          step={1}
          unit="px"
          onChange={(v) => update({ spread: v })}
          changed={p.spread !== basePrms.spread}
          onReset={() => update({ spread: basePrms.spread })}
        />
        <SliderRow
          label="Strength"
          displayScale={100}
          unit="%"
          value={p.opacity}
          min={0}
          max={0.6}
          step={0.01}
          onChange={(v) => update({ opacity: v })}
          changed={Math.abs(p.opacity - basePrms.opacity) > 0.001}
          onReset={() => update({ opacity: basePrms.opacity })}
        />

        {/* Shadow colour: a proper swatch + Follow-palette dropdown.
            The channel value stays as "--rgb-xxx" (palette ref) OR
            "r, g, b" (literal) so buildShadow still works unchanged. */}
        <ShadowColourRow
          channel={p.channel}
          onChange={(c) => update({ channel: c })}
          changed={p.channel !== basePrms.channel}
          onReset={() => update({ channel: basePrms.channel })}
        />

        {/* Layers: segmented 1 / 2 / 3 with an info toggletip that
            explains what each option adds, so the user isn't guessing
            which stack to pick. */}
        <Row
          label="Layers"
          help={
            <div>
              <p style={{ marginTop: 0 }}><b>1 — The fall.</b> One soft drop under the surface. Lightest, cheapest; good for Row and Hairline tokens.</p>
              <p><b>2 — Fall + contact.</b> Adds a tight contact shadow directly under the surface. Reads as &quot;sitting on&quot; rather than floating.</p>
              <p style={{ marginBottom: 0 }}><b>3 — Shade above too.</b> Adds a subtle shade ABOVE the surface opposite the fall. Reads as &quot;lit from one side&quot;; useful on Modal and Highlight cards.</p>
            </div>
          }
          changed={p.layers !== basePrms.layers}
          onReset={p.layers !== basePrms.layers ? () => update({ layers: basePrms.layers }) : undefined}
        >
          <ToggleGroup
            type="single"
            size="sm"
            aria-label="Shadow layers"
            value={String(p.layers)}
            onValueChange={(v: string | null) => v && update({ layers: Number(v) as 1 | 2 | 3 })}
            items={[
              { value: "1", label: "1" },
              { value: "2", label: "2" },
              { value: "3", label: "3" },
            ]}
          />
        </Row>

        {/* Top light line is a glass-surface detail (the specular
            highlight along the top edge of a frosted card). Hidden
            for shadow tokens that don't sit under glass — hairlines,
            float, chrome edges, button glows don't carry it. */}
        {GLASS_SHADOW_TOKENS.has(token) ? (
          <CheckRow
            label="Top light line"
            note="A thin light edge along the top of the surface. Only shown for glass elevations."
            checked={p.specular}
            onChange={(v) => update({ specular: v })}
          />
        ) : null}
      </Group>
      <Advanced api={api} tokens={depthNames.concat(["--glow-sm", "--glow-md-hover", "--glow-lg", "--glow-danger"])} />
    </>
  );
}

// ── Motion and hover ──────────────────────────────────────────────────────

const EASES = [
  { value: "preset", label: "The preset's curve" },
  { value: "cubic-bezier(0.4, 0, 0.2, 1)", label: "Standard" },
  { value: "cubic-bezier(0.16, 1, 0.3, 1)", label: "Out, long settle" },
  { value: "ease-out", label: "Ease out" },
  { value: "linear", label: "Linear" },
];

const alphaOf = (v: string | undefined, fallback: number) => num(v?.match(/,\s*([\d.]+)\)\s*\)?\s*$/)?.[1], fallback);

export function HoverPanel({ api }: { api: StudioApi }) {
  const glowK = ctl(api, "buttonGlow", 1);
  return (
    <>
      <Group title="Buttons" help="Nothing scales on hover and nothing lifts by default: buttons deepen their glow. A theme can add a small lift or change the washes here.">
        <SliderRow label="Hover lift" token="--button-lift" value={num(api.value("--button-lift"), 0)} min={-4} max={0} step={0.5} unit="px" changed={api.changed("--button-lift")} onChange={(v) => api.set({ "--button-lift": `${v}px` })} onReset={() => api.reset(["--button-lift"])} />
        <SliderRow label="Hover lighten" format={(v) => `${Math.round(v * 100)}%`} token="--button-hover-overlay" value={alphaOf(api.value("--button-hover-overlay"), 0.07)} min={0} max={0.3} step={0.01} changed={api.changed("--button-hover-overlay")} onChange={(a) => api.set({ "--button-hover-overlay": `rgba(var(--rgb-white), ${a})` })} onReset={() => api.reset(["--button-hover-overlay"])} />
        <SliderRow label="Press darken" format={(v) => `${Math.round(v * 100)}%`} token="--button-press-overlay" value={alphaOf(api.value("--button-press-overlay"), 0.14)} min={0} max={0.4} step={0.01} changed={api.changed("--button-press-overlay")} onChange={(a) => api.set({ "--button-press-overlay": `rgba(var(--rgb-shade), ${a})` })} onReset={() => api.reset(["--button-press-overlay"])} />
        <SliderRow
          label="Hover glow"
          format={(v) => `${Math.round(v * 100)}%`}
          token="--button-hover-glow"
          value={glowK}
          min={0}
          max={2}
          step={0.05}
          changed={api.changed("--button-hover-glow")}
          onChange={(k) => api.set({ "--button-hover-glow": scaleAlphas(api.base.get("--glow-md-hover") ?? "0 5px 16px rgba(var(--rgb-brand), 0.42)", k) }, { buttonGlow: k })}
          onReset={() => api.reset(["--button-hover-glow"], ["buttonGlow"])}
        />
        <SliderRow label="Secondary hover fill" format={(v) => `${Math.round(v * 100)}%`} token="--button-secondary-hover-bg" value={alphaOf(api.value("--button-secondary-hover-bg"), 0.68)} min={0.3} max={1} step={0.01} changed={api.changed("--button-secondary-hover-bg")} onChange={(a) => api.set({ "--button-secondary-hover-bg": `rgba(var(--rgb-white), ${a})` })} onReset={() => api.reset(["--button-secondary-hover-bg"])} />
        <SliderRow label="Hover speed" token="--button-dur" value={num(api.value("--button-dur"), 150)} min={0} max={500} step={10} unit="ms" changed={api.changed("--button-dur")} onChange={(v) => api.set({ "--button-dur": `${v}ms` })} onReset={() => api.reset(["--button-dur"])} />
        <SelectRow label="Hover curve" token="--button-ease" value={api.value("--button-ease") ?? "preset"} options={EASES} changed={api.changed("--button-ease")} onChange={(v) => (v === "preset" ? api.reset(["--button-ease"]) : api.set({ "--button-ease": v }))} onReset={() => api.reset(["--button-ease"])} />
      </Group>
      <Group title="Washes" help="The tint a hovered or active surface takes.">
        <SliderRow label="Table row" token="--table-row-hover" value={alphaOf(api.value("--table-row-hover") === "var(--wash-row)" ? undefined : api.value("--table-row-hover"), 0.035)} min={0} max={0.15} step={0.005} changed={api.changed("--table-row-hover")} onChange={(a) => api.set({ "--table-row-hover": `rgba(var(--rgb-brand), ${a})` })} onReset={() => api.reset(["--table-row-hover"])} />
        <SliderRow label="Sidebar item" format={(v) => `${Math.round(v * 100)}%`} token="--sidebar-hover-bg" value={alphaOf(api.value("--sidebar-hover-bg"), 0.65)} min={0} max={1} step={0.01} changed={api.changed("--sidebar-hover-bg")} onChange={(a) => api.set({ "--sidebar-hover-bg": `rgba(var(--rgb-white), ${a})` })} onReset={() => api.reset(["--sidebar-hover-bg"])} />
        <SliderRow label="Grey controls" format={(v) => `${Math.round(v * 100)}%`} token="--recess-fill-hover" value={alphaOf(api.value("--recess-fill-hover"), 0.13)} min={0} max={0.3} step={0.01} changed={api.changed("--recess-fill-hover")} onChange={(a) => api.set({ "--recess-fill-hover": `rgba(var(--rgb-brand-deep), ${a})` })} onReset={() => api.reset(["--recess-fill-hover"])} />
        <SliderRow
          label="Menu item"
          format={(v) => `${Math.round(v * 100)}%`}
          token="--popover-item-active-bg"
          value={ctl(api, "itemWash", 1)}
          min={0}
          max={2.5}
          step={0.05}
          changed={api.changed("--popover-item-active-bg")}
          onChange={(k) =>
            api.set(
              { "--popover-item-active-bg": `linear-gradient(to right, rgba(var(--rgb-brand), ${(0.14 * k).toFixed(3)}), rgba(var(--rgb-brand-deep), ${(0.07 * k).toFixed(3)}))` },
              { itemWash: k },
            )
          }
          onReset={() => api.reset(["--popover-item-active-bg"], ["itemWash"])}
        />
      </Group>
      <Group title="Motion" help="Reduced motion still zeroes these for people who ask for it.">
        {(
          [
            ["--dur-fast", "Quick transitions", 120],
            ["--dur", "Standard transitions", 150],
            ["--dur-slow", "Slow transitions", 200],
          ] as const
        ).map(([n, label, d]) => (
          <SliderRow key={n} label={label} token={n} value={num(api.value(n), d)} min={0} max={600} step={10} unit="ms" changed={api.changed(n)} onChange={(v) => api.set({ [n]: `${v}ms` })} onReset={() => api.reset([n])} />
        ))}
        <SelectRow label="Motion curve" token="--ease" value={api.changed("--ease") ? (api.value("--ease") ?? "preset") : "preset"} options={EASES} changed={api.changed("--ease")} onChange={(v) => (v === "preset" ? api.reset(["--ease"]) : api.set({ "--ease": v }))} onReset={() => api.reset(["--ease"])} />
      </Group>
      <Advanced
        api={api}
        tokens={["--button-lift", "--button-hover-overlay", "--button-press-overlay", "--button-hover-glow", "--button-secondary-hover-bg", "--button-dur", "--button-ease", "--table-row-hover", "--sidebar-hover-bg", "--recess-fill-hover", "--popover-item-active-bg", "--dur-fast", "--dur", "--dur-slow", "--ease"]}
      />
    </>
  );
}
