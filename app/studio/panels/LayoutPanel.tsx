"use client";

import { SegmentedControl, ToggleGroup } from "@/components/ui";
import { Advanced } from "../advanced";
import type { StudioApi } from "../api";
import { AngleRow, ColourRow, Group, Row, SliderRow, SurfaceStrip, TextRow } from "../controls";
import type { Rgb } from "../engine/colour";
import { applySoftness, parseGradient, positioned, serializeGradient, type Layer } from "../engine/gradient";
import { colourOf, setColour } from "../engine/macros";
import { StopsBar } from "../StopsBar";
import { SurfaceEditor } from "./SurfacePanels";

export type StudioLayout = "sidebar" | "rail" | "header";
export type StudioLogoCorner = "glass" | "fill";

export const layoutOf = (api: Pick<StudioApi, "theme">): StudioLayout => {
  const v = api.theme.controls.layout;
  return v === "rail" || v === "header" ? v : "sidebar";
};
export const logoCornerOf = (api: Pick<StudioApi, "theme">): StudioLogoCorner => (api.theme.controls.logoCorner === "fill" ? "fill" : "glass");
export const collapsibleOf = (api: Pick<StudioApi, "theme">): boolean => api.theme.controls.sidebarCollapsible !== false;

const num = (v: string | undefined, fallback: number) => {
  const n = parseFloat(v ?? "");
  return Number.isFinite(n) ? n : fallback;
};

/**
 * The shell around the preview: the layout (a full sidebar, a collapsed
 * icon rail, or a header-only top nav) and the logo corner (match glass, or
 * a set brand fill). Both are SidebarShell props, stored in the theme's
 * controls and named in the export header.
 */
export function LayoutPanel({ api, resolveColour }: { api: StudioApi; resolveColour: (expr: string) => Rgb | null }) {
  const layout = layoutOf(api);
  const corner = logoCornerOf(api);
  return (
    <>
      {/* Layout picker as the sticky header strip. Three options
          determine which shell shape ships; the controls below adapt
          to whichever is picked. Mirrors the pattern on Gradients and
          Shadows — one top-level pick, then focused controls under. */}
      <SurfaceStrip
        variant="header"
        label="Layout"
        value={layout}
        options={[
          { value: "sidebar", label: "Sidebar" },
          { value: "rail", label: "Collapsed rail" },
          { value: "header", label: "Header only" },
        ]}
        onChange={(v) => api.setControls({ layout: v })}
      />

      <Group
        title="Sizing"
        help={
          <>
            In code: <code>{`<SidebarShell layout="${layout}" />`}</code>. Sidebar keeps the full nav; the collapsed rail trades labels for icons; Header only moves the navigation into the top bar and drops the sidebar entirely.
          </>
        }
      >
        {/* "User can collapse it" toggle removed from this step: the
            Layout step is about picking a visual look, not wiring the
            SidebarShell's runtime behaviour. The `collapsible` prop is
            still exposed in the exported theme / docs for anyone who
            wants the chevron behaviour in code. */}
        <SliderRow
          label="Top bar height"
          value={num(api.value("--topbar-height"), 64)}
          min={48}
          max={96}
          step={1}
          unit="px"
          changed={api.changed("--topbar-height")}
          onChange={(v) => api.set({ "--topbar-height": `${v}px` })}
          onReset={() => api.reset(["--topbar-height"])}
        />
        {layout !== "header" ? (
          <SliderRow
            label="Sidebar width"
            value={num(api.value("--shell-sidebar-width"), 212)}
            min={168}
            max={300}
            step={2}
            unit="px"
            changed={api.changed("--shell-sidebar-width")}
            onChange={(v) => api.set({ "--shell-sidebar-width": `${v}px` })}
            onReset={() => api.reset(["--shell-sidebar-width"])}
          />
        ) : null}
      </Group>

      {/* Sidebar + top-bar glass editors live here now, not on the Glass
          step. They're part of the shell: tint, opacity, blur and the
          backdrop filter all shape the sidebar's and top bar's chrome. */}
      {layout !== "header" ? <SurfaceEditor api={api} surfaceId="sidebar" /> : null}
      <SurfaceEditor api={api} surfaceId="topbar" />

      <Group
        title="Logo corner"
        note={
          corner === "fill"
            ? "A set colour or gradient behind the logo, for brands whose guidelines require one."
            : "The corner is the same frosted glass as the sidebar and top bar: one continuous L."
        }
      >
        <Row label="Corner" stacked>
          <SegmentedControl
            aria-label="Logo corner"
            size="sm"
            value={corner}
            onChange={(v) => api.setControls({ logoCorner: v })}
            options={[
              { value: "glass", label: "Match glass" },
              { value: "fill", label: "Brand fill" },
            ]}
          />
        </Row>
        {corner === "fill" ? (
          <>
            <LogoCornerFillEditor api={api} resolveColour={resolveColour} />
            <ColourRow
              label="Logo ink"
              help="The default wordmark's colour on the fill."
              colour={colourOf(api.resolved("--logo-corner-ink")) ?? colourOf(api.value("--logo-corner-ink"))}
              changed={api.changed("--logo-corner-ink")}
              onChange={(c) => api.set(setColour("--logo-corner-ink", c))}
              onReset={() => api.reset(["--logo-corner-ink"])}
            />
          </>
        ) : null}
      </Group>
      <Advanced api={api} tokens={["--topbar-height", "--shell-sidebar-width", "--logo-corner-bg", "--logo-corner-ink", "--chrome-sidebar", "--chrome-topbar", "--chrome-shadow", "--admin-strip-bg"]} />
    </>
  );
}

const TOKEN = "--logo-corner-bg";
const SOLID_FALLBACK = "linear-gradient(135deg, var(--brand), var(--brand-strong))";

/**
 * Rich editor for the logo-corner brand fill — same shape as the
 * Gradient step: a toggle between "Solid colour" and "Gradient", with
 * a swatch for solid or an AngleRow + Softness slider + StopsBar for
 * gradient. Serialises back to --logo-corner-bg; parseGradient /
 * serializeGradient handle the round-trip just like the main Gradients
 * step does for --brand-gradient and friends.
 */
function LogoCornerFillEditor({ api, resolveColour }: { api: StudioApi; resolveColour: (expr: string) => Rgb | null }) {
  const value = api.value(TOKEN) ?? SOLID_FALLBACK;
  const layers = parseGradient(value);
  const linear = layers && layers[0]?.kind === "linear" ? layers[0] : null;
  const colourLayer = layers && layers[0]?.kind === "colour" ? layers[0] : null;
  const mode: "solid" | "gradient" = colourLayer ? "solid" : "gradient";
  const changed = api.changed(TOKEN);
  const baseValue = api.base.get(TOKEN) ?? SOLID_FALLBACK;
  const baseLayers = parseGradient(baseValue);
  const baseLinear = baseLayers && baseLayers[0]?.kind === "linear" ? baseLayers[0] : null;

  // Softness: same semantics as the Gradients step — percentage of the
  // base end-stop spread currently in use. Hides when the gradient has
  // more than two stops because scaling just the ends with intermediates
  // on the bar makes no shape sense.
  const positionsNow = linear ? positioned(linear.stops) : null;
  const first = positionsNow?.[0]?.pos ?? 0;
  const last = positionsNow?.[positionsNow.length - 1]?.pos ?? 100;
  const baseFirst = baseLinear ? positioned(baseLinear.stops)[0]?.pos ?? 0 : 0;
  const baseLast = baseLinear ? positioned(baseLinear.stops)[baseLinear.stops.length - 1]?.pos ?? 100 : 100;
  const baseSpread = Math.max(0.0001, baseLast - baseFirst);
  const softness = Math.max(0, Math.min(1, (last - first) / baseSpread));

  const write = (next: Layer[]) => api.set({ [TOKEN]: serializeGradient(next) });
  const editLayer = (patch: Partial<Layer>) => {
    if (!layers) return;
    const next = layers.map((l, i) => (i === 0 ? ({ ...l, ...patch } as Layer) : l));
    write(next);
  };

  const setMode = (next: "solid" | "gradient") => {
    if (next === mode) return;
    if (next === "solid") {
      // Convert current gradient (or the brand) into a single colour.
      const resolved = linear ? resolveColour(linear.stops[0]?.color ?? "") : resolveColour("var(--brand)");
      const hex = resolved
        ? `#${[resolved.r, resolved.g, resolved.b].map((c) => c.toString(16).padStart(2, "0")).join("")}`
        : "var(--brand)";
      api.set({ [TOKEN]: hex });
    } else {
      // Convert current colour (or restore brand gradient) into a two-stop linear.
      const resolved = colourLayer ? resolveColour(colourLayer.color) : null;
      const hex = resolved
        ? `#${[resolved.r, resolved.g, resolved.b].map((c) => c.toString(16).padStart(2, "0")).join("")}`
        : "var(--brand)";
      api.set({ [TOKEN]: `linear-gradient(135deg, ${hex} 0%, var(--brand-strong) 100%)` });
    }
  };

  const setSoftness = (s: number) => {
    if (!linear || !baseLinear) return;
    const src = baseLinear.stops.length === linear.stops.length
      ? baseLinear.stops.map((bs, k) => ({ ...bs, color: linear.stops[k].color }))
      : linear.stops;
    write([{ ...linear, stops: applySoftness(src, s) }]);
  };

  return (
    <>
      <Row label="Style">
        <ToggleGroup
          type="single"
          size="sm"
          aria-label="Fill style"
          value={mode}
          onValueChange={(v: string | null) => v && (v === "solid" || v === "gradient") && setMode(v)}
          items={[
            { value: "solid", label: "Solid" },
            { value: "gradient", label: "Gradient" },
          ]}
        />
      </Row>

      {mode === "solid" ? (
        <ColourRow
          label="Fill colour"
          help="The single colour that fills the logo corner. Pick a hex or a palette ref."
          colour={colourOf(api.resolved(TOKEN)) ?? colourOf(api.resolved("--brand"))}
          changed={changed}
          onChange={(c) => api.set({ [TOKEN]: `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${c.a})` })}
          onReset={() => api.reset([TOKEN])}
        />
      ) : null}

      {mode === "gradient" && linear ? (
        <>
          <AngleRow
            label="Direction"
            value={((Math.round(linear.angle) % 360) + 360) % 360}
            onChange={(a) => editLayer({ angle: a })}
            changed={baseLinear ? Math.round(linear.angle) !== Math.round(baseLinear.angle) : false}
            onReset={baseLinear ? () => editLayer({ angle: baseLinear.angle }) : undefined}
          />
          {linear.stops.length === 2 ? (
            <SliderRow
              label="Softness"
              help="How much of the length the colours spend blending. 1 keeps the stops at the preset's spread; 0 pulls them to the midpoint for a hard-edged two-tone fill."
              value={softness}
              min={0}
              max={1}
              step={0.05}
              onChange={setSoftness}
              changed={Math.abs(softness - 1) > 0.001}
              onReset={() => setSoftness(1)}
            />
          ) : null}
          <StopsBar
            stops={linear.stops}
            resolve={resolveColour}
            onChange={(stops) => editLayer({ stops })}
            hint="Click an empty spot on the bar to add a stop · drag a marker to move it · click a marker to pick its colour or set it to a palette ref."
          />
        </>
      ) : null}

      {mode === "gradient" && !linear ? (
        <TextRow
          label="Gradient CSS"
          help="The current value isn't a linear gradient so the visual editor can't parse it. Edit it here as raw CSS."
          value={value}
          changed={changed}
          onCommit={(v) => api.set({ [TOKEN]: v })}
          onReset={() => api.reset([TOKEN])}
        />
      ) : null}
    </>
  );
}
