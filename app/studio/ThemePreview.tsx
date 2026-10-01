"use client";

import { memo } from "react";
import { SidebarShell } from "@/components/shell/SidebarShell";
import { GlassPanel, IconBook, IconClipboard, IconHome, IconUsers } from "@/components/ui";
import { entriesByCategory } from "@/components/ui/_registry";
import type { Category } from "@/components/ui/_registry/types";
import { FitPreview } from "../_docs/FitPreview";
import { PREVIEWS } from "../_docs/previews";
import type { PreviewFocus } from "./Studio";
import styles from "./ThemePreview.module.css";

const NAV = [
  { href: "#preview-top", label: "Dashboard", icon: <IconHome size={16} />, exact: true },
  { href: "#preview-forms", label: "Projects", icon: <IconClipboard size={16} />, count: 2 },
  { href: "#preview-data", label: "Team", icon: <IconUsers size={16} /> },
  { href: "#preview-docs", label: "Docs", icon: <IconBook size={16} /> },
];

/**
 * Which component categories to surface for each walkthrough step. Steps
 * not in the map get the full set (all categories). Keeping focused
 * previews means a Colours step only shows the components whose colour
 * actually changes, not the entire kit.
 */
const FOCUS_CATEGORIES: Partial<Record<PreviewFocus, ReadonlyArray<Category>>> = {
  logo: ["Shell"],
  colour: ["Actions", "Feedback", "Forms"],
  type: ["Actions", "Forms", "Data display"],
  shape: ["Actions", "Forms", "Overlays", "Layout and surfaces"],
  gradients: ["Actions", "Shell"],
  glass: ["Overlays", "Layout and surfaces", "Shell"],
  shadows: ["Overlays", "Layout and surfaces"],
  layout: ["Shell"],
};

/**
 * The Studio's live preview: the dashboard frame with the component
 * categories relevant to the current step. Memoised on its props so
 * dragging a slider (which only changes a style element) never re-renders
 * it. When `focus` is "export", "contrast" or "components" the preview
 * shows the full set.
 */
export const ThemePreview = memo(function ThemePreview({
  logoSrc,
  logoAlt,
  logoCorner,
  layout,
  focus,
}: {
  logoSrc?: string;
  logoAlt?: string;
  logoCorner: "glass" | "fill";
  layout: "sidebar" | "rail" | "header";
  focus?: PreviewFocus;
}) {
  const whitelist = focus ? FOCUS_CATEGORIES[focus] : undefined;
  const groups = entriesByCategory().filter(([category]) => !whitelist || whitelist.includes(category));
  return (
    <SidebarShell contained navLabel="Preview" nav={NAV} activeHref="#preview-top" title="Theme preview" logoSrc={logoSrc} logoAlt={logoAlt} logoCorner={logoCorner} layout={layout}>
      <div id="preview-top" className={styles.stack}>
        {groups.map(([category, list]) => (
          <GlassPanel key={category} padding="lg">
            <h2 className={styles.h2}>{category}</h2>
            <div className={styles.grid}>
              {list.map((e) => {
                const id = e.examples[0]?.id;
                const Render = id ? PREVIEWS[e.slug]?.[id] : undefined;
                if (!Render) return null;
                return (
                  <figure key={e.slug} className={styles.cell}>
                    <div className={styles.window}>
                      <FitPreview block={e.layout === "block"}>
                        <Render />
                      </FitPreview>
                    </div>
                    <figcaption className={styles.caption}>{e.name}</figcaption>
                  </figure>
                );
              })}
            </div>
          </GlassPanel>
        ))}
      </div>
    </SidebarShell>
  );
});
