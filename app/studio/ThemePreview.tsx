"use client";

import { memo } from "react";
import { SidebarShell } from "@/components/shell/SidebarShell";
import { GlassPanel, IconBook, IconClipboard, IconHome, IconUsers } from "@/components/ui";
import { entriesByCategory } from "@/components/ui/_registry";
import { FitPreview } from "../_docs/FitPreview";
import { PREVIEWS } from "../_docs/previews";
import styles from "./ThemePreview.module.css";

const NAV = [
  { href: "#preview-top", label: "Dashboard", icon: <IconHome size={16} />, exact: true },
  { href: "#preview-forms", label: "Projects", icon: <IconClipboard size={16} />, count: 2 },
  { href: "#preview-data", label: "Team", icon: <IconUsers size={16} /> },
  { href: "#preview-docs", label: "Docs", icon: <IconBook size={16} /> },
];

/**
 * The Studio's live preview: the dashboard frame with every documented
 * component inside it, grouped by category, each the first example from the
 * docs shown whole and centred. Memoised on its props, so dragging a slider
 * (which only changes a style element) never re-renders it.
 */
export const ThemePreview = memo(function ThemePreview({
  logoSrc,
  logoAlt,
  logoCorner,
  layout,
}: {
  logoSrc?: string;
  logoAlt?: string;
  logoCorner: "glass" | "fill";
  layout: "sidebar" | "rail" | "header";
}) {
  return (
    <SidebarShell contained navLabel="Preview" nav={NAV} activeHref="#preview-top" title="Theme preview" logoSrc={logoSrc} logoAlt={logoAlt} logoCorner={logoCorner} layout={layout}>
      <div id="preview-top" className={styles.stack}>
        {entriesByCategory().map(([category, list]) => (
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
