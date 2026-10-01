"use client";

import { SegmentedControl } from "@/components/ui";
import { Advanced } from "../advanced";
import type { StudioApi } from "../api";
import { ColourRow, Group, Row, SliderRow, TextRow } from "../controls";
import { colourOf, setColour } from "../engine/macros";
import styles from "../Studio.module.css";

export type StudioLayout = "sidebar" | "rail" | "header";
export type StudioLogoCorner = "glass" | "fill";

export const layoutOf = (api: Pick<StudioApi, "theme">): StudioLayout => {
  const v = api.theme.controls.layout;
  return v === "rail" || v === "header" ? v : "sidebar";
};
export const logoCornerOf = (api: Pick<StudioApi, "theme">): StudioLogoCorner => (api.theme.controls.logoCorner === "fill" ? "fill" : "glass");

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
export function LayoutPanel({ api }: { api: StudioApi }) {
  const layout = layoutOf(api);
  const corner = logoCornerOf(api);
  const bg = api.value("--logo-corner-bg") ?? "";
  return (
    <>
      <Group
        title="Layout"
        help={
          <>
            In code: <code>{`<SidebarShell layout="${layout}" />`}</code>. A collapsed rail keeps the icons and remembers its state; header only
            moves the navigation into the top bar.
          </>
        }
      >
        <Row label="Navigation" stacked>
          <SegmentedControl
            aria-label="Layout"
            size="sm"
            value={layout}
            onChange={(v) => api.setControls({ layout: v })}
            options={[
              { value: "sidebar", label: "Sidebar" },
              { value: "rail", label: "Collapsed rail" },
              { value: "header", label: "Header only" },
            ]}
          />
        </Row>
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
      </Group>

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
            <Row label="Fill" changed={api.changed("--logo-corner-bg")} onReset={() => api.reset(["--logo-corner-bg"])}>
              <span className={styles.fillPreview} style={{ background: api.resolved("--logo-corner-bg") || bg }} aria-hidden="true" />
            </Row>
            <ColourRow
              label="Solid colour"
              help="Sets the corner to one colour. Use the gradient field below for a gradient."
              colour={colourOf(api.resolved("--logo-corner-bg")) ?? colourOf(bg) ?? colourOf(api.resolved("--brand"))}
              changed={api.changed("--logo-corner-bg")}
              onChange={(c) => api.set({ "--logo-corner-bg": `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${c.a})` })}
              onReset={() => api.reset(["--logo-corner-bg"])}
            />
            <TextRow
              label="Gradient"
              help="Any CSS gradient, for example linear-gradient(135deg, var(--brand), var(--brand-strong))."
              value={bg}
              changed={api.changed("--logo-corner-bg")}
              onCommit={(v) => api.set({ "--logo-corner-bg": v })}
              onReset={() => api.reset(["--logo-corner-bg"])}
            />
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
