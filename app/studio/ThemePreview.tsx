"use client";

import { ArrowRight, CheckCircle2, Download, Filter, MoreHorizontal, Plus, Search } from "lucide-react";
import { memo } from "react";
import { SidebarShell } from "@/components/shell/SidebarShell";
import { Avatar } from "@/components/ui/Avatar/Avatar";
import { Badge } from "@/components/ui/Badge/Badge";
import { Button } from "@/components/ui/Button/Button";
import { Checkbox } from "@/components/ui/Checkbox/Checkbox";
import { Field } from "@/components/ui/Field/Field";
import { GlassPanel, IconBook, IconClipboard, IconHome, IconUsers } from "@/components/ui";
import { IconButton } from "@/components/ui/IconButton/IconButton";
import { TextInput } from "@/components/ui/TextInput/TextInput";
// Switch intentionally omitted here; it's a controlled component and we want
// a static showcase. Checkboxes carry both toggle rows instead.
import { Textarea } from "@/components/ui/Textarea/Textarea";
import { BarChart } from "@/components/charts/BarChart";
import { entriesByCategory } from "@/components/ui/_registry";
import type { Category } from "@/components/ui/_registry/types";
import { FitPreview } from "../_docs/FitPreview";
import { PREVIEWS } from "../_docs/previews";
import type { PreviewFocus } from "./Studio";
import styles from "./ThemePreview.module.css";

/** Steps that render WITHOUT the dashboard shell wrapper, so the user
 *  isn't staring at the same frosted sidebar + top bar on every step.
 *  The shell is only shown when the step is actually about the shell
 *  (layout, final export) or inherently needs the chrome (components,
 *  contrast, tokens, image). */
const UNSHELLED: ReadonlyArray<PreviewFocus> = ["logo", "colour", "type", "shape", "gradients", "glass", "shadows"];

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
  // Logo step: just the logo on a backdrop with the five brand chips
  // underneath, so the user watches it come to life as they drop a file.
  // No sidebar, no top bar, no dashboard.
  if (focus === "logo") {
    return <LogoPreview logoSrc={logoSrc} logoAlt={logoAlt} />;
  }

  // Colours step: a tight bento-style showcase of the components whose
  // colour the user is currently editing (buttons, badges, inputs, chart,
  // status) grouped as a single demo page, like shadcn's landing. No
  // sidebar, no dashboard, no uncomposed grid of category cards.
  if (focus === "colour") {
    return <ColourShowcase />;
  }

  const whitelist = focus ? FOCUS_CATEGORIES[focus] : undefined;
  const groups = entriesByCategory().filter(([category]) => !whitelist || whitelist.includes(category));
  const unshelled = focus ? UNSHELLED.includes(focus) : false;

  const content = (
    <div id="preview-top" className={unshelled ? styles.stackBare : styles.stack}>
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
  );

  if (unshelled) return content;

  return (
    <SidebarShell contained navLabel="Preview" nav={NAV} activeHref="#preview-top" title="Theme preview" logoSrc={logoSrc} logoAlt={logoAlt} logoCorner={logoCorner} layout={layout}>
      {content}
    </SidebarShell>
  );
});

/**
 * Step 2's preview: a composed demo page that fits several colour-driven
 * components together in a shadcn-landing-style bento, so the user sees
 * brand ink, status fills, chart series, text hierarchy, inputs and
 * actions in context at once instead of a decoupled grid of category
 * cards.
 */
const CHART_DATA = [
  { month: "Jan", a: 42, b: 38, c: 30 },
  { month: "Feb", a: 48, b: 36, c: 34 },
  { month: "Mar", a: 55, b: 44, c: 32 },
  { month: "Apr", a: 51, b: 52, c: 38 },
  { month: "May", a: 62, b: 48, c: 45 },
  { month: "Jun", a: 68, b: 54, c: 50 },
];

function ColourShowcase() {
  return (
    <div className={styles.colourShowcase}>
      {/* Hero: brand ink + action + secondary + ghost */}
      <GlassPanel padding="lg" className={styles.colourHero}>
        <div className={styles.colourHeroText}>
          <p className={styles.colourEyebrow}>This month</p>
          <h2 className={styles.colourTitle}>Good morning, Jane</h2>
          <p className={styles.colourLede}>
            Three invoices are overdue, two awaiting approval. Review and send to clear your inbox for the week.
          </p>
          <p className={styles.colourMuted}>Last synced 2 minutes ago.</p>
          <div className={styles.colourActions}>
            <Button iconStart={<Plus size={14} aria-hidden="true" />}>Create invoice</Button>
            <Button variant="secondary" iconStart={<Download size={14} aria-hidden="true" />}>Export CSV</Button>
            <Button variant="ghost" iconEnd={<ArrowRight size={13} aria-hidden="true" />}>
              Skip for now
            </Button>
          </div>
        </div>
        <div className={styles.colourAvatarStack} aria-hidden="true">
          <Avatar name="Jane Cooper" size="md" tone="brand" />
          <Avatar name="Marco Silva" size="md" />
          <Avatar name="Priya Shah" size="md" />
        </div>
      </GlassPanel>

      {/* Status badges + progress */}
      <section className={styles.colourStatusRow}>
        <GlassPanel padding="md" className={styles.colourBadges}>
          <Badge tone="brand">Draft</Badge>
          <Badge tone="success" variant="solid">Paid</Badge>
          <Badge tone="warning">Pending</Badge>
          <Badge tone="danger" variant="solid">Overdue</Badge>
          <Badge tone="info">In review</Badge>
          <Badge tone="neutral">Archived</Badge>
        </GlassPanel>
        <GlassPanel padding="md" className={styles.colourProgressCard}>
          <div className={styles.colourProgressTop}>
            <span className={styles.colourProgressLabel}>Collected this quarter</span>
            <span className={styles.colourProgressValue}>72%</span>
          </div>
          <div className={styles.colourProgressTrack} role="progressbar" aria-valuenow={72} aria-valuemin={0} aria-valuemax={100} aria-label="Collected this quarter">
            <div className={styles.colourProgressFill} style={{ width: "72%" }} />
          </div>
        </GlassPanel>
      </section>

      {/* Chart + form */}
      <section className={styles.colourGrid}>
        <GlassPanel padding="lg" className={styles.colourChartCard}>
          <header className={styles.colourCardHead}>
            <h3 className={styles.colourCardTitle}>Revenue by product</h3>
            <IconButton size="sm" variant="ghost" label="More" icon={<MoreHorizontal size={14} aria-hidden="true" />} />
          </header>
          <p className={styles.colourMuted}>Blue, red, green: three product lines over the last six months.</p>
          <div className={styles.colourChart}>
            <BarChart
              title="Revenue by product"
              summary="Six-month totals across three product lines."
              hideTitle
              data={CHART_DATA}
              category="month"
              series={[
                { key: "a", label: "Hardware" },
                { key: "b", label: "Software" },
                { key: "c", label: "Services" },
              ]}
              height={200}
            />
          </div>
        </GlassPanel>

        <GlassPanel padding="lg" className={styles.colourFormCard}>
          <header className={styles.colourCardHead}>
            <h3 className={styles.colourCardTitle}>New project</h3>
            <Badge tone="brand" variant="soft">Draft</Badge>
          </header>
          <Field label="Project name">
            <TextInput defaultValue="Atlas redesign" />
          </Field>
          <Field label="Note for the customer">
            <Textarea rows={2} defaultValue="Clean, calm, carries the brand." />
          </Field>
          <div className={styles.colourFormFoot}>
            <div className={styles.colourFormChecks}>
              <Checkbox defaultChecked label="Send a copy to me" />
              <Checkbox defaultChecked label="Notify the team" />
            </div>
            <Button iconStart={<CheckCircle2 size={14} aria-hidden="true" />}>Save project</Button>
          </div>
        </GlassPanel>
      </section>

      {/* Filter chips + search */}
      <GlassPanel padding="md" className={styles.colourFilterBar}>
        <div className={styles.colourChips}>
          <button type="button" className={styles.colourChipActive}>
            <Filter size={12} aria-hidden="true" /> All invoices · 24
          </button>
          <button type="button" className={styles.colourChip}>Overdue · 3</button>
          <button type="button" className={styles.colourChip}>Pending · 7</button>
          <button type="button" className={styles.colourChip}>Paid · 14</button>
        </div>
        <TextInput
          size="sm"
          leadingIcon={<Search size={14} aria-hidden="true" />}
          placeholder="Search invoices"
          className={styles.colourSearch}
        />
      </GlassPanel>
    </div>
  );
}

/**
 * Step 1's preview: the logo big-and-centred on a themed backdrop with the
 * five brand chips (brand, action brand, strong, deep, accent) tiled
 * underneath. Comes to life as the user drops a logo and applies the
 * extracted palette.
 */
function LogoPreview({ logoSrc, logoAlt }: { logoSrc?: string; logoAlt?: string }) {
  const chips = [
    { token: "--brand", label: "Brand" },
    { token: "--brand-action", label: "Action" },
    { token: "--brand-strong", label: "Strong" },
    { token: "--brand-deep", label: "Deep" },
    { token: "--brand-soft", label: "Accent" },
  ];
  return (
    <div className={styles.logoPreview}>
      <div className={styles.logoFrame}>
        {logoSrc ? (
          // eslint-disable-next-line @next/next/no-img-element -- user's own data URL, preview only
          <img src={logoSrc} alt={logoAlt || "Logo"} className={styles.logoImage} />
        ) : (
          <div className={styles.logoEmpty}>
            <span className={styles.logoEmptyTitle}>Your logo appears here</span>
            <span className={styles.logoEmptyHint}>Drop one on the left to start</span>
          </div>
        )}
      </div>
      <div className={styles.logoChipRow}>
        {chips.map((c) => (
          <div key={c.token} className={styles.logoChip}>
            <span className={styles.logoChipSwatch} style={{ background: `var(${c.token})` }} aria-hidden="true" />
            <span className={styles.logoChipLabel}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
