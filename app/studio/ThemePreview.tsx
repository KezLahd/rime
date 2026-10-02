"use client";

import { ArrowRight, CheckCircle2, Download, Filter, MoreHorizontal, Plus, Search } from "lucide-react";
import { memo, useState, type ReactNode } from "react";
import { cx } from "@/components/ui/_internal/cx";
import { SidebarShell } from "@/components/shell/SidebarShell";
import { Avatar } from "@/components/ui/Avatar/Avatar";
import { Badge } from "@/components/ui/Badge/Badge";
import { Button } from "@/components/ui/Button/Button";
import { Checkbox } from "@/components/ui/Checkbox/Checkbox";
import { Field } from "@/components/ui/Field/Field";
import { GlassPanel, IconBook, IconClipboard, IconHome, IconUsers, Toggletip } from "@/components/ui";
import { Alert } from "@/components/ui/Alert/Alert";
import { IconButton } from "@/components/ui/IconButton/IconButton";
import { Modal } from "@/components/ui/Modal/Modal";
import { ProgressBar } from "@/components/ui/Meter/Meter";
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
const UNSHELLED: ReadonlyArray<PreviewFocus> = ["logo", "colour", "type", "shape", "gradients", "background", "glass", "shadows", "hover", "layout"];

/**
 * Derives three stand-in strings from the business name typed on step 1:
 *   full    — the whole brand ("Acme Inc") for workspace titles and table rows
 *   word    — the first word ("Acme") for the logo corner and quick labels
 *   domain  — a lowercased slug with no spaces for emails and admin strips
 * Falls back to the "Acme" placeholders when the field is empty so every
 * preview reads naturally before the user has typed anything.
 */
type BrandNames = { full: string; word: string; domain: string };
function brandNames(brand?: string): BrandNames {
  const trimmed = (brand ?? "").trim();
  if (!trimmed) return { full: "Acme Inc", word: "Acme", domain: "acme.co" };
  const word = trimmed.split(/\s+/)[0] ?? trimmed;
  const slug = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 20) || "brand";
  return { full: trimmed, word, domain: `${slug}.co` };
}

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
  brand,
  logoSrc,
  logoAlt,
  logoCorner,
  layout,
  focus,
  peekToken,
  gradientSelection,
  shadowSelection,
  colourCategory,
  hoverCategory,
}: {
  /** The business name typed on step 1. Fills every "Acme Inc" placeholder
   *  across the showcases; falls back to "Acme Inc" when empty. */
  brand?: string;
  logoSrc?: string;
  logoAlt?: string;
  logoCorner: "glass" | "fill";
  layout: "sidebar" | "rail" | "header";
  focus?: PreviewFocus;
  /** When a token is being hovered in the controls panel, this is set to
   *  its name. The Colours showcase rings matching elements so the user
   *  sees where the token is used. */
  peekToken?: string | null;
  /** The gradient token currently open in the Gradients panel dropdown.
   *  When set, the preview renders only that gradient's specimen. */
  gradientSelection?: string | null;
  /** The shadow token currently selected in the Shadows panel. When set,
   *  the preview renders only the surface specimen that uses it. */
  shadowSelection?: string | null;
  /** The colour category currently open on the Colours step. When set,
   *  the showcase renders only components that read that category. */
  colourCategory?: "brand" | "text" | "signals" | "field" | "charts" | "ramp" | null;
  /** The hover category currently open on the Hover step. Spotlights
   *  the components whose hover behaviour reads those tokens. */
  hoverCategory?: "buttons" | "washes" | "motion" | null;
}) {
  const brandText = brandNames(brand);

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
    return <ColourShowcase peekToken={peekToken ?? null} brand={brandText} category={colourCategory ?? null} />;
  }

  // Fonts step: a type specimen with every scale (display, section, card,
  // body, small, caption, button, mono) so the user watches the whole
  // typographic hierarchy change as they pick a family.
  if (focus === "type") {
    return <TypeShowcase brand={brandText} />;
  }

  // Shape step: a dedicated showcase of radius, density, control height,
  // hairline weight and dialog widths — every shape token has a specimen
  // demonstrating what it does.
  if (focus === "shape") {
    return <ShapeShowcase brand={brandText} />;
  }

  // Gradients step: one card per gradient token, with the gradient
  // actually used in the component that reads it. Primary button for
  // --brand-gradient, danger button for --danger-gradient, admin strip
  // on a mini shell, auth field, table header sweep, highlight edge on
  // a glass card, and a labelled swatch for each of the raw gradient
  // tokens so every one is visible at once.
  if (focus === "gradients") {
    return <GradientShowcase selection={gradientSelection ?? null} brand={brandText} logoSrc={logoSrc} logoAlt={logoAlt} />;
  }

  // Background step: the full page bg with a single floating card so the
  // user can see what the blooms look like behind real surfaces. No
  // dashboard clutter — just the paint.
  if (focus === "background") {
    return <BackgroundShowcase brand={brandText} />;
  }

  // Glass step: a floating glass card centred on a visibly textured
  // field so the user actually sees the blur and tint at work. Without
  // something behind it a glass card over a flat page just reads as a
  // solid card — the whole point of the step is lost.
  if (focus === "glass") {
    return <GlassShowcase brand={brandText} />;
  }

  // Shadows step: a single specimen on a quiet backdrop so the user
  // sees exactly what the sliders are reshaping — a card for the panel
  // elevation, a tooltip for the float layer, a modal frame for the
  // modal shadow, and so on. Picks a surface based on the selected
  // token in the Shadows panel.
  if (focus === "shadows") {
    return <ShadowShowcase selection={shadowSelection ?? null} brand={brandText} logoSrc={logoSrc} logoAlt={logoAlt} />;
  }

  // Hover step: interactive specimens the user can actually hover over.
  // Each category spotlights only the components whose hover tokens
  // the user is tuning: Buttons shows real buttons; Washes shows a
  // table, sidebar and menu to hover; Motion shows timing demos.
  if (focus === "hover") {
    return <HoverShowcase category={hoverCategory ?? "buttons"} brand={brandText} />;
  }

  // Layout step: the actual SidebarShell wrapping a mock dashboard
  // page. The user sees exactly how their chosen layout (full
  // sidebar / collapsed rail / header-only) looks with a real page
  // behind it, instead of a kit-wide component grid.
  if (focus === "layout") {
    return <LayoutShowcase brand={brandText} logoSrc={logoSrc} logoAlt={logoAlt} logoCorner={logoCorner} layout={layout} />;
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
  { month: "Jan", a: 42, b: 38, c: 30, d: 24, e: 18, f: 12 },
  { month: "Feb", a: 48, b: 36, c: 34, d: 26, e: 21, f: 14 },
  { month: "Mar", a: 55, b: 44, c: 32, d: 30, e: 23, f: 16 },
  { month: "Apr", a: 51, b: 52, c: 38, d: 34, e: 26, f: 19 },
  { month: "May", a: 62, b: 48, c: 45, d: 38, e: 29, f: 22 },
  { month: "Jun", a: 68, b: 54, c: 50, d: 42, e: 32, f: 25 },
];

/**
 * Wraps a specimen element, ringing it when the active peek token is one
 * of the tokens listed in `tokens`. The ring is a brand outline + wash
 * so the user sees where a token is used.
 *
 * `as="span"` is the default and wraps inline things (badges, buttons);
 * for block elements like a <p> or <h2> pass `as="div"` so the wrapper
 * doesn't collapse the block flow.
 */
function Spot({
  tokens,
  peek,
  children,
  className,
  as: Tag = "span",
}: {
  tokens: string;
  peek: string | null;
  children: ReactNode;
  className?: string;
  as?: "div" | "span" | "section" | "p" | "h2" | "h3";
}) {
  const hit = peek ? tokens.split(/\s+/).includes(peek) : false;
  const inline = Tag === "span";
  return (
    <Tag
      className={cx(styles.colourSpot, inline && styles.colourSpotInline, className, hit && styles.colourSpotHit)}
      data-tokens={tokens}
    >
      {children}
    </Tag>
  );
}

function ColourShowcase({ peekToken, brand, category }: { peekToken: string | null; brand: BrandNames; category: "brand" | "text" | "signals" | "field" | "charts" | "ramp" | null }) {
  const peek = peekToken;
  // Category-focused showcases: one tight demo of ONLY the components
  // that read the selected category's tokens. Falls through to the full
  // composed layout when no category is set (e.g. when viewing from a
  // step that reuses the Colours showcase).
  if (category === "brand") return <ColourBrandShowcase peek={peek} brand={brand} />;
  if (category === "text") return <ColourTextShowcase peek={peek} brand={brand} />;
  if (category === "signals") return <ColourSignalsShowcase peek={peek} />;
  if (category === "field") return <ColourFieldShowcase peek={peek} brand={brand} />;
  if (category === "charts") return <ColourChartsShowcase peek={peek} />;
  if (category === "ramp") return <ColourRampShowcase peek={peek} />;
  // Full-composed fallback (category === null): used from focus=colour
  // without a sub-category, if that ever happens.
  const show = (cats: ReadonlyArray<string>) => category === null || cats.includes(category);
  return (
    <div className={styles.colourShowcase}>
      {/* Hero: brand ink + action + secondary + ghost. Every string that
          used to read as a demo for an invented product (This month,
          Good morning Jane, invoices awaiting approval…) is now coded
          to the business name typed on step 1 so the preview reads as
          the user's own dashboard, not a generic SaaS stand-in. */}
      {show(["brand", "text"]) ? (
      <GlassPanel padding="lg" className={styles.colourHero}>
        <div className={styles.colourHeroText}>
          <Spot as="div" tokens="--ink-brand" peek={peek}>
            <p className={styles.colourEyebrow}>{brand.full}</p>
          </Spot>
          <Spot as="div" tokens="--ink-heading" peek={peek}>
            <h2 className={styles.colourTitle}>Welcome to {brand.full}</h2>
          </Spot>
          <Spot as="div" tokens="--ink-secondary --ink-body" peek={peek}>
            <p className={styles.colourLede}>
              Everything the {brand.full} team ships lives here — invoices, briefs, the whole brand kit. Three items are waiting on you this week.
            </p>
          </Spot>
          <Spot as="div" tokens="--ink-muted" peek={peek}>
            <p className={styles.colourMuted}>Last synced from {brand.domain} two minutes ago.</p>
          </Spot>
          <div className={styles.colourActions}>
            <Spot tokens="--brand --brand-action --brand-strong" peek={peek}>
              <Button iconStart={<Plus size={14} aria-hidden="true" />}>Create invoice</Button>
            </Spot>
            <Spot tokens="--brand --brand-soft" peek={peek}>
              <Button variant="secondary" iconStart={<Download size={14} aria-hidden="true" />}>Export CSV</Button>
            </Spot>
            <Spot tokens="--ink-brand" peek={peek}>
              <Button variant="ghost" iconEnd={<ArrowRight size={13} aria-hidden="true" />}>
                Skip for now
              </Button>
            </Spot>
            <Spot tokens="--ink-disabled" peek={peek}>
              <Button disabled>Disabled</Button>
            </Spot>
          </div>
        </div>
        <Spot as="div" className={styles.colourAvatarStack} tokens="--brand --ink-inverse" peek={peek}>
          <Avatar name="Jane Cooper" size="md" tone="brand" />
          <Avatar name="Marco Silva" size="md" />
          <Avatar name="Priya Shah" size="md" />
        </Spot>
      </GlassPanel>
      ) : null}

      {/* Status badges + progress */}
      {show(["brand", "signals"]) ? (
      <section className={styles.colourStatusRow}>
        <GlassPanel padding="md" className={styles.colourBadges}>
          <Spot as="span" tokens="--brand --brand-soft" peek={peek}>
            <Badge tone="brand">Draft</Badge>
          </Spot>
          <Spot as="span" tokens="--success-fill --success-ink" peek={peek}>
            <Badge tone="success" variant="solid">Paid</Badge>
          </Spot>
          <Spot as="span" tokens="--warning-fill --warning-ink" peek={peek}>
            <Badge tone="warning">Pending</Badge>
          </Spot>
          <Spot as="span" tokens="--danger-base --danger-base-solid --danger-ink" peek={peek}>
            <Badge tone="danger" variant="solid">Overdue</Badge>
          </Spot>
          <Spot as="span" tokens="--info-ink --info-fill" peek={peek}>
            <Badge tone="info">In review</Badge>
          </Spot>
          <Spot as="span" tokens="--support --ink-muted" peek={peek}>
            <Badge tone="neutral">Archived</Badge>
          </Spot>
        </GlassPanel>
        <GlassPanel padding="md" className={styles.colourProgressCard}>
          <div className={styles.colourProgressTop}>
            <span className={styles.colourProgressLabel}>Collected this quarter</span>
            <Spot as="span" tokens="--ink-brand" peek={peek}>
              <span className={styles.colourProgressValue}>72%</span>
            </Spot>
          </div>
          <Spot as="div" tokens="--brand --brand-action --brand-strong" peek={peek}>
            <div className={styles.colourProgressTrack} role="progressbar" aria-valuenow={72} aria-valuemin={0} aria-valuemax={100} aria-label="Collected this quarter">
              <div className={styles.colourProgressFill} style={{ width: "72%" }} />
            </div>
          </Spot>
          {/* ProgressBar's fill is literally linear-gradient(--brand-soft,
              --brand-deep), so dragging Accent in the controls paints
              the bar immediately. The main Progress above uses the brand
              gradient (--brand-action -> --brand-strong). */}
          <div className={styles.colourProgressTop}>
            <span className={styles.colourProgressLabel}>Accent gradient (Progress bar)</span>
          </div>
          <Spot as="div" tokens="--brand-soft --brand-deep" peek={peek}>
            <ProgressBar value={60} max={100} label="Review progress" valueText="60%" />
          </Spot>
        </GlassPanel>
      </section>
      ) : null}

      {/* Alerts: info (--brand-soft) + neutral (--support) + a table-head
          strip (--support via --table-head-fill). Previously the preview
          had nothing that used Accent (--brand-soft) or Neutral (--support)
          so dragging those rows did nothing visible. */}
      {show(["signals", "text", "field"]) ? (
      <section className={styles.colourAlertsRow}>
        <Spot as="div" tokens="--brand --brand-deep --info-ink --line-brand" peek={peek}>
          <Alert tone="info" title="Three invoices awaiting review">
            Review and sign off on the current batch to clear the queue by end of day.
          </Alert>
        </Spot>
        <Spot as="div" tokens="--support --support-deep --ink-secondary" peek={peek}>
          <Alert tone="legal" title="Last quarter archived">
            Historical invoices and attached notes have moved to the archive. Access via Settings.
          </Alert>
        </Spot>
      </section>
      ) : null}

      {/* Mini table head: --support drives the sweep gradient (see
          --table-head-fill in tokens.css), so changing Neutral tints the
          strip here. */}
      {show(["field", "text", "signals"]) ? (
      <GlassPanel padding="md" className={styles.colourTableCard}>
        <header className={styles.colourCardHead}>
          <h3 className={styles.colourCardTitle}>Recent invoices</h3>
          <Badge tone="neutral" variant="soft">24 total</Badge>
        </header>
        <Spot as="div" tokens="--support --support-deep --ink-muted" peek={peek}>
          <div className={styles.colourTable}>
            <div className={styles.colourTableHead}>
              <span>Client</span>
              <span>Amount</span>
              <span>Due</span>
              <span>Status</span>
            </div>
            <div className={styles.colourTableRow}>
              <span className={styles.colourTableCell}>{brand.full}</span>
              <span className={styles.colourTableCell}>$2,400.00</span>
              <span className={styles.colourTableCell}>12 Oct</span>
              <span className={styles.colourTableCell}><Badge tone="success" variant="solid">Paid</Badge></span>
            </div>
            <div className={styles.colourTableRow}>
              <span className={styles.colourTableCell}>Globex</span>
              <span className={styles.colourTableCell}>$880.00</span>
              <span className={styles.colourTableCell}>18 Oct</span>
              <span className={styles.colourTableCell}><Badge tone="warning">Pending</Badge></span>
            </div>
            <div className={styles.colourTableRow}>
              <span className={styles.colourTableCell}>Initech</span>
              <span className={styles.colourTableCell}>$1,120.00</span>
              <span className={styles.colourTableCell}>22 Sep</span>
              <span className={styles.colourTableCell}><Badge tone="danger" variant="solid">Overdue</Badge></span>
            </div>
          </div>
        </Spot>
      </GlassPanel>
      ) : null}

      {/* Chart + form */}
      {show(["charts", "ramp", "brand", "text", "signals"]) ? (
      <section className={styles.colourGrid}>
        <GlassPanel padding="lg" className={styles.colourChartCard}>
          <header className={styles.colourCardHead}>
            <h3 className={styles.colourCardTitle}>Revenue by product</h3>
            <IconButton size="sm" variant="ghost" label="More" icon={<MoreHorizontal size={14} aria-hidden="true" />} />
          </header>
          <p className={styles.colourMuted}>Six product lines over the last six months, one per chart slot.</p>
          <Spot as="div" className={styles.colourChart} tokens="--chart-1 --chart-2 --chart-3 --chart-4 --chart-5 --chart-6" peek={peek}>
            <BarChart
              title="Revenue by product"
              summary="Six-month totals across six product lines."
              hideTitle
              data={CHART_DATA}
              category="month"
              series={[
                { key: "a", label: "Hardware" },
                { key: "b", label: "Software" },
                { key: "c", label: "Services" },
                { key: "d", label: "Support" },
                { key: "e", label: "Training" },
                { key: "f", label: "Licensing" },
              ]}
              height={200}
            />
          </Spot>
          <Spot as="div" tokens="--chart-seq-1 --chart-seq-2 --chart-seq-3 --chart-seq-4 --chart-seq-5" peek={peek}>
            <div className={styles.colourRamp} aria-label="Chart ramp">
              {["--chart-seq-1", "--chart-seq-2", "--chart-seq-3", "--chart-seq-4", "--chart-seq-5"].map((t) => (
                <span key={t} className={styles.colourRampStep} style={{ background: `var(${t})` }} />
              ))}
            </div>
          </Spot>
        </GlassPanel>

        <GlassPanel padding="lg" className={styles.colourFormCard}>
          <header className={styles.colourCardHead}>
            <h3 className={styles.colourCardTitle}>New project</h3>
            <Spot as="span" tokens="--brand --brand-soft" peek={peek}>
              <Badge tone="brand" variant="soft">Draft</Badge>
            </Spot>
          </header>
          <Spot as="div" tokens="--ink-heading --ink-placeholder --line-input" peek={peek}>
            <Field label="Project name">
              <TextInput defaultValue="Atlas redesign" />
            </Field>
          </Spot>
          <Spot as="div" tokens="--ink-body --ink-placeholder --line-input" peek={peek}>
            <Field label="Note for the customer">
              <Textarea rows={2} defaultValue="Clean, calm, carries the brand." />
            </Field>
          </Spot>
          <div className={styles.colourFormFoot}>
            <div className={styles.colourFormChecks}>
              <Spot as="span" tokens="--brand --brand-action" peek={peek}>
                <Checkbox defaultChecked label="Send a copy to me" />
              </Spot>
              <Spot as="span" tokens="--brand --brand-action" peek={peek}>
                <Checkbox defaultChecked label="Notify the team" />
              </Spot>
            </div>
            <Spot as="span" tokens="--brand-action --brand-strong" peek={peek}>
              <Button iconStart={<CheckCircle2 size={14} aria-hidden="true" />}>Save project</Button>
            </Spot>
          </div>
        </GlassPanel>
      </section>
      ) : null}

      {/* Filter chips + search */}
      {show(["brand", "text"]) ? (
      <GlassPanel padding="md" className={styles.colourFilterBar}>
        <div className={styles.colourChips}>
          <Spot as="span" tokens="--brand --ink-brand --wash-active" peek={peek}>
            <button type="button" className={styles.colourChipActive}>
              <Filter size={12} aria-hidden="true" /> All invoices · 24
            </button>
          </Spot>
          <Spot as="span" tokens="--ink-secondary --ink-muted" peek={peek}>
            <button type="button" className={styles.colourChip}>Overdue · 3</button>
          </Spot>
          <Spot as="span" tokens="--ink-secondary --ink-muted" peek={peek}>
            <button type="button" className={styles.colourChip}>Pending · 7</button>
          </Spot>
          <Spot as="span" tokens="--ink-secondary --ink-muted" peek={peek}>
            <button type="button" className={styles.colourChip}>Paid · 14</button>
          </Spot>
        </div>
        <Spot as="span" tokens="--ink-placeholder --line-input --focus-color" peek={peek}>
          <TextInput
            size="sm"
            leadingIcon={<Search size={14} aria-hidden="true" />}
            placeholder="Search invoices"
            className={styles.colourSearch}
          />
        </Spot>
      </GlassPanel>
      ) : null}
    </div>
  );
}

// ── Per-category Colour showcases ────────────────────────────────────
// Each showcase is one small, focused page of ONLY the components that
// read the selected category's tokens. Replaces the previous "render
// the whole dashboard with sections visually hidden" approach.

function ColourBrandShowcase({ peek, brand }: { peek: string | null; brand: BrandNames }) {
  return (
    <div className={styles.catShowcase}>
      <div className={styles.catIntro}>
        <p className={styles.catEyebrow}>Brand</p>
        <h3 className={styles.catTitle}>Primary gestures</h3>
        <p className={styles.catLede}>Every component that reads the brand palette directly: buttons, chips, avatars, the progress bar.</p>
      </div>
      <GlassPanel padding="lg" className={styles.catBrandCard}>
        <Spot as="div" className={styles.catRow} tokens="--brand --brand-action --brand-strong" peek={peek}>
          <Button iconStart={<Plus size={14} aria-hidden="true" />}>Create invoice</Button>
          <Button variant="secondary" iconStart={<Download size={14} aria-hidden="true" />}>Export CSV</Button>
          <Button variant="ghost" iconEnd={<ArrowRight size={13} aria-hidden="true" />}>Skip for now</Button>
        </Spot>
        <Spot as="div" className={styles.catRow} tokens="--brand --brand-soft --ink-brand" peek={peek}>
          <Badge tone="brand">Draft</Badge>
          <Avatar name="Jane Cooper" size="md" tone="brand" />
          <span className={styles.catLink}>Open brand kit</span>
        </Spot>
        <Spot as="div" tokens="--brand-soft --brand-deep" peek={peek}>
          <ProgressBar value={64} max={100} label="Collected this quarter" valueText="64%" />
        </Spot>
        {/* Neutral demo: a table-header-styled strip reads --table-head-fill,
            which is built from --rgb-support, so dragging Neutral in the
            controls tints this row immediately. Plus a neutral badge for
            the chip surface. */}
        <Spot as="div" tokens="--support --rgb-support" peek={peek}>
          <div className={styles.catNeutralStrip}>
            <span>Client</span>
            <span>Status</span>
            <span>Amount</span>
            <span>Due</span>
          </div>
        </Spot>
        <Spot as="div" className={styles.catRow} tokens="--support --ink-muted" peek={peek}>
          <Badge tone="neutral">Archived</Badge>
          <Badge tone="neutral" variant="soft">24 total</Badge>
        </Spot>
      </GlassPanel>
      <p className={styles.catFootnote}>{brand.full} · Brand colours power the main confirm button, active nav pills, the brand chip and every brand-tinted gradient.</p>
    </div>
  );
}

function ColourTextShowcase({ peek, brand }: { peek: string | null; brand: BrandNames }) {
  return (
    <div className={styles.catShowcase}>
      <div className={styles.catIntro}>
        <p className={styles.catEyebrow}>Text</p>
        <h3 className={styles.catTitle}>Ink ladder</h3>
        <p className={styles.catLede}>One short line per role, each reading the token it&apos;s named after.</p>
      </div>
      <GlassPanel padding="lg" className={styles.catTextCard}>
        <div className={styles.catInkStack}>
          <Spot as="div" tokens="--ink-heading" peek={peek} className={styles.catInkLine}>
            <span className={styles.catInkTag}>Heading</span>
            <span className={styles.catInkHeading}>{brand.full}</span>
          </Spot>
          <Spot as="div" tokens="--ink-body" peek={peek} className={styles.catInkLine}>
            <span className={styles.catInkTag}>Body</span>
            <span className={styles.catInkBody}>Paragraphs, table cells, labels and input values.</span>
          </Spot>
          <Spot as="div" tokens="--ink-secondary" peek={peek} className={styles.catInkLine}>
            <span className={styles.catInkTag}>Secondary</span>
            <span className={styles.catInkSecondary}>Field helper copy and quieter rows.</span>
          </Spot>
          <Spot as="div" tokens="--ink-muted" peek={peek} className={styles.catInkLine}>
            <span className={styles.catInkTag}>Muted</span>
            <span className={styles.catInkMuted}>Captions, metadata and column headers.</span>
          </Spot>
          <Spot as="div" tokens="--ink-brand" peek={peek} className={styles.catInkLine}>
            <span className={styles.catInkTag}>Brand</span>
            <span className={styles.catInkBrand}>Links and active nav labels.</span>
          </Spot>
          <Spot as="div" tokens="--ink-placeholder --line-input --focus-color" peek={peek} className={styles.catInkLine}>
            <span className={styles.catInkTag}>Placeholder</span>
            <TextInput size="sm" placeholder="Shown while a field is empty" />
          </Spot>
        </div>
      </GlassPanel>
    </div>
  );
}

function ColourSignalsShowcase({ peek }: { peek: string | null }) {
  return (
    <div className={styles.catShowcase}>
      <div className={styles.catIntro}>
        <p className={styles.catEyebrow}>Signals</p>
        <h3 className={styles.catTitle}>Status and focus</h3>
        <p className={styles.catLede}>Danger, warning, success and info — plus the focus ring you see when tabbing.</p>
      </div>
      <GlassPanel padding="lg" className={styles.catSignalsCard}>
        <Spot as="div" className={styles.catRow} tokens="--danger-base --danger-base-solid --danger-ink" peek={peek}>
          <Badge tone="danger" variant="solid">Overdue</Badge>
          <Button size="sm" variant="danger">Delete project</Button>
        </Spot>
        <Spot as="div" className={styles.catRow} tokens="--warning-fill --warning-ink" peek={peek}>
          <Badge tone="warning">Pending</Badge>
        </Spot>
        <Spot as="div" className={styles.catRow} tokens="--success-fill --success-ink" peek={peek}>
          <Badge tone="success" variant="solid">Paid</Badge>
        </Spot>
        <Spot as="div" className={styles.catRow} tokens="--info-ink --info-fill" peek={peek}>
          <Badge tone="info">In review</Badge>
        </Spot>
        <Spot as="div" tokens="--danger-base-solid --danger-ink" peek={peek}>
          <Alert tone="danger" title="Three invoices are overdue">
            Clear the overdue batch before Friday to keep accounts in good standing.
          </Alert>
        </Spot>
        <Spot as="div" tokens="--focus-color" peek={peek}>
          <div className={styles.catFocusDemo}>
            <TextInput size="sm" placeholder="Tab here to see the focus ring" />
          </div>
        </Spot>
      </GlassPanel>
    </div>
  );
}

function ColourFieldShowcase({ peek, brand }: { peek: string | null; brand: BrandNames }) {
  return (
    <div className={styles.catShowcase}>
      <div className={styles.catIntro}>
        <p className={styles.catEyebrow}>Page field</p>
        <h3 className={styles.catTitle}>Field and blooms</h3>
        <p className={styles.catLede}>The coloured ground glass floats on. Change these and the entire page behind every card shifts.</p>
      </div>
      <Spot as="div" className={styles.catFieldStage} tokens="--page-base --rgb-bloom-a --rgb-bloom-b" peek={peek}>
        <GlassPanel padding="lg" className={styles.catFieldCard}>
          <h3 className={styles.catFieldTitle}>Welcome back</h3>
          <p className={styles.catFieldLede}>Glass sitting on your page field — change the field and the whole page shifts under this card.</p>
          <p className={styles.catFieldSmall}>Signed in to {brand.full}.</p>
        </GlassPanel>
      </Spot>
      <Spot as="div" tokens="--night --rgb-contact" peek={peek}>
        <div className={styles.catAdminStrip}>ADMIN SESSION · dev.{brand.domain}</div>
      </Spot>
    </div>
  );
}

function ColourChartsShowcase({ peek }: { peek: string | null }) {
  return (
    <div className={styles.catShowcase}>
      <div className={styles.catIntro}>
        <p className={styles.catEyebrow}>Charts</p>
        <h3 className={styles.catTitle}>Categorical palette</h3>
        <p className={styles.catLede}>Six series. Each needs 3:1 against the surface it sits on; keep them far apart in hue for colour-blind readers.</p>
      </div>
      <GlassPanel padding="lg" className={styles.catChartCard}>
        <Spot as="div" tokens="--chart-1 --chart-2 --chart-3 --chart-4 --chart-5 --chart-6" peek={peek}>
          <BarChart
            title="Revenue by product"
            summary="Six-month totals across six product lines."
            hideTitle
            data={CHART_DATA}
            category="month"
            series={[
              { key: "a", label: "Hardware" },
              { key: "b", label: "Software" },
              { key: "c", label: "Services" },
              { key: "d", label: "Support" },
              { key: "e", label: "Training" },
              { key: "f", label: "Licensing" },
            ]}
            height={240}
          />
        </Spot>
      </GlassPanel>
    </div>
  );
}

function ColourRampShowcase({ peek }: { peek: string | null }) {
  const steps = ["--chart-seq-1", "--chart-seq-2", "--chart-seq-3", "--chart-seq-4", "--chart-seq-5"];
  return (
    <div className={styles.catShowcase}>
      <div className={styles.catIntro}>
        <p className={styles.catEyebrow}>Chart ramp</p>
        <h3 className={styles.catTitle}>Ordered scale</h3>
        <p className={styles.catLede}>One hue, light to dark, for stepwise categories: age cohorts, quartiles, severity tiers.</p>
      </div>
      <GlassPanel padding="lg" className={styles.catRampCard}>
        <Spot as="div" tokens={steps.join(" ")} peek={peek}>
          <div className={styles.catRampStrip} aria-label="Chart ramp">
            {steps.map((t, i) => (
              <div key={t} className={styles.catRampStep} style={{ background: `var(${t})` }}>
                <span>{i + 1}</span>
              </div>
            ))}
          </div>
        </Spot>
        <p className={styles.catRampLabel}>Lightest · Darkest</p>
        <Spot as="div" className={styles.catRampStackedRow} tokens={steps.join(" ")} peek={peek}>
          {steps.map((t, i) => (
            <div
              key={t}
              className={styles.catRampStackedBar}
              style={{ height: `${20 + i * 18}px`, background: `var(${t})` }}
              aria-label={`Ramp step ${i + 1}`}
            />
          ))}
        </Spot>
        <p className={styles.catRampLabel}>Stacked example (bars)</p>
      </GlassPanel>
    </div>
  );
}

/**
 * Hover step preview: one focused specimen per category. Buttons shows
 * the three button variants + their press state live; Washes shows a
 * table, a mini sidebar and a popover menu — all hoverable so the user
 * sees the washes land in real time; Motion shows a timed box transition
 * running against each duration token.
 */
function HoverShowcase({ category, brand }: { category: "buttons" | "washes" | "motion"; brand: BrandNames }) {
  if (category === "buttons") {
    return (
      <div className={styles.catShowcase}>
        <div className={styles.catIntro}>
          <p className={styles.catEyebrow}>Buttons</p>
          <h3 className={styles.catTitle}>Hover and press</h3>
          <p className={styles.catLede}>Point at a button to see the hover lift, lighten and glow. Hold the mouse down to see the press darken.</p>
        </div>
        <GlassPanel padding="lg" className={styles.hoverCard}>
          <div className={styles.hoverRow}>
            <span className={styles.hoverRowLabel}>Primary</span>
            <Button iconStart={<Plus size={14} aria-hidden="true" />}>Create invoice</Button>
          </div>
          <div className={styles.hoverRow}>
            <span className={styles.hoverRowLabel}>Secondary</span>
            <Button variant="secondary" iconStart={<Download size={14} aria-hidden="true" />}>Export CSV</Button>
          </div>
          <div className={styles.hoverRow}>
            <span className={styles.hoverRowLabel}>Ghost</span>
            <Button variant="ghost" iconEnd={<ArrowRight size={13} aria-hidden="true" />}>Skip for now</Button>
          </div>
          <div className={styles.hoverRow}>
            <span className={styles.hoverRowLabel}>Danger</span>
            <Button variant="danger">Delete project</Button>
          </div>
          <div className={styles.hoverRow}>
            <span className={styles.hoverRowLabel}>Disabled</span>
            <Button disabled>Not available</Button>
          </div>
        </GlassPanel>
        <p className={styles.catFootnote}>{brand.full} · Press and hold any button to see the press-darken overlay.</p>
      </div>
    );
  }

  if (category === "washes") {
    return (
      <div className={styles.catShowcase}>
        <div className={styles.catIntro}>
          <p className={styles.catEyebrow}>Washes</p>
          <h3 className={styles.catTitle}>Surface hover tints</h3>
          <p className={styles.catLede}>Hover any row below. Each surface takes its own tint — a table row picks up brand wash, a sidebar item lights up, a menu row paints a brand gradient.</p>
        </div>
        <section className={styles.hoverWashesGrid}>
          <GlassPanel padding="md" className={styles.hoverWashCard}>
            <p className={styles.hoverWashTitle}>Table row</p>
            <div className={styles.hoverTable}>
              <div className={styles.hoverTableHead}>
                <span>Client</span>
                <span>Amount</span>
                <span>Status</span>
              </div>
              {[[brand.full, "$2,400.00", "Paid"], ["Globex", "$880.00", "Pending"], ["Initech", "$1,120.00", "Overdue"]].map(([a, b, c]) => (
                <div key={a} className={styles.hoverTableRow}>
                  <span>{a}</span>
                  <span>{b}</span>
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </GlassPanel>
          <GlassPanel padding="md" className={styles.hoverWashCard}>
            <p className={styles.hoverWashTitle}>Sidebar item</p>
            <nav className={styles.hoverSidebar}>
              {["Dashboard", "Invoices", "Clients", "Reports", "Settings"].map((label) => (
                <button type="button" key={label} className={styles.hoverSidebarItem}>
                  {label}
                </button>
              ))}
            </nav>
          </GlassPanel>
          <GlassPanel padding="md" className={styles.hoverWashCard}>
            <p className={styles.hoverWashTitle}>Menu item</p>
            <ul className={styles.hoverMenu}>
              {["Rename", "Duplicate", "Share", "Archive"].map((label) => (
                <li key={label} className={styles.hoverMenuItem}>{label}</li>
              ))}
            </ul>
          </GlassPanel>
          <GlassPanel padding="md" className={styles.hoverWashCard}>
            <p className={styles.hoverWashTitle}>Grey control</p>
            <div className={styles.hoverRecessRow}>
              <button type="button" className={styles.hoverRecessChip}>7 days</button>
              <button type="button" className={styles.hoverRecessChip}>30 days</button>
              <button type="button" className={styles.hoverRecessChip}>Quarter</button>
              <button type="button" className={styles.hoverRecessChip}>Year</button>
            </div>
          </GlassPanel>
        </section>
      </div>
    );
  }

  // Motion: one timed box per duration token so the user sees Fast vs Standard vs Slow run against each other.
  return (
    <div className={styles.catShowcase}>
      <div className={styles.catIntro}>
        <p className={styles.catEyebrow}>Motion</p>
        <h3 className={styles.catTitle}>Transition timings</h3>
        <p className={styles.catLede}>Each row runs its box across the stage at the matching duration. Hover any row to replay. Reset the sliders to compare lengths side-by-side.</p>
      </div>
      <GlassPanel padding="lg" className={styles.hoverMotionCard}>
        {[
          { label: "Fast", varName: "--dur-fast" },
          { label: "Standard", varName: "--dur" },
          { label: "Slow", varName: "--dur-slow" },
        ].map((row) => (
          <div key={row.varName} className={styles.hoverMotionRow}>
            <span className={styles.hoverMotionLabel}>{row.label}</span>
            <div className={styles.hoverMotionTrack}>
              <span
                className={styles.hoverMotionBall}
                style={{ transitionDuration: `var(${row.varName})` }}
                aria-label={`${row.label} transition demo`}
              />
            </div>
          </div>
        ))}
        <p className={styles.catFootnote}>Hover a track and the ball slides to the far end at that row&apos;s duration; move the pointer off to run it back. Trigger them in sequence to feel the gap between Fast, Standard and Slow.</p>
      </GlassPanel>
    </div>
  );
}

/**
 * Layout step preview: the real SidebarShell with a focused mock
 * dashboard page inside — not the kit's full component grid. Shows
 * exactly how the user's chosen layout (full sidebar / collapsed rail
 * / header-only) looks when running against actual page content.
 */
function LayoutShowcase({ brand, logoSrc, logoAlt, logoCorner, layout }: { brand: BrandNames; logoSrc?: string; logoAlt?: string; logoCorner: "glass" | "fill"; layout: "sidebar" | "rail" | "header" }) {
  return (
    <SidebarShell
      contained
      navLabel="Preview nav"
      nav={NAV}
      activeHref="#preview-top"
      title="Projects"
      logoSrc={logoSrc}
      logoAlt={logoAlt}
      logoCorner={logoCorner}
      layout={layout}
    >
      <div id="preview-top" className={styles.layoutPage}>
        <section className={styles.layoutHero}>
          <div>
            <p className={styles.layoutEyebrow}>{brand.full}</p>
            <h2 className={styles.layoutTitle}>Projects</h2>
            <p className={styles.layoutLede}>Everything the team is shipping — invoices, briefs and the whole brand kit. Three items are waiting on you this week.</p>
          </div>
          <div className={styles.layoutHeroActions}>
            <Button variant="secondary" iconStart={<Filter size={14} aria-hidden="true" />}>Filter</Button>
            <Button iconStart={<Plus size={14} aria-hidden="true" />}>New project</Button>
          </div>
        </section>

        <section className={styles.layoutStats}>
          <GlassPanel padding="md" className={styles.layoutStatCard}>
            <p className={styles.layoutStatLabel}>Active</p>
            <p className={styles.layoutStatValue}>12</p>
            <p className={styles.layoutStatDelta}>+3 this week</p>
          </GlassPanel>
          <GlassPanel padding="md" className={styles.layoutStatCard}>
            <p className={styles.layoutStatLabel}>In review</p>
            <p className={styles.layoutStatValue}>5</p>
            <p className={styles.layoutStatDelta}>2 need you</p>
          </GlassPanel>
          <GlassPanel padding="md" className={styles.layoutStatCard}>
            <p className={styles.layoutStatLabel}>Shipped</p>
            <p className={styles.layoutStatValue}>48</p>
            <p className={styles.layoutStatDelta}>Last 30 days</p>
          </GlassPanel>
          <GlassPanel padding="md" className={styles.layoutStatCard}>
            <p className={styles.layoutStatLabel}>Members</p>
            <p className={styles.layoutStatValue}>8</p>
            <p className={styles.layoutStatDelta}>Across 4 teams</p>
          </GlassPanel>
        </section>

        <GlassPanel padding="lg" className={styles.layoutTableCard}>
          <header className={styles.layoutTableHead}>
            <div>
              <h3 className={styles.layoutCardTitle}>Recent projects</h3>
              <p className={styles.layoutCardLede}>Last fifteen items updated across {brand.full}.</p>
            </div>
            <Button size="sm" variant="ghost" iconEnd={<ArrowRight size={13} aria-hidden="true" />}>View all</Button>
          </header>
          <div className={styles.layoutTable}>
            <div className={styles.layoutTableRow + " " + styles.layoutTableRowHead}>
              <span>Name</span>
              <span>Owner</span>
              <span>Status</span>
              <span>Updated</span>
            </div>
            {[
              ["Atlas redesign", "Jane Cooper", "Active", "4 h ago"],
              ["Spring collection launch", "Marco Silva", "In review", "yesterday"],
              ["Brand kit refresh", "Priya Shah", "Draft", "3 d ago"],
              ["Checkout rebuild", "Noah Kim", "Shipped", "5 d ago"],
            ].map(([name, owner, status, when]) => (
              <div key={name} className={styles.layoutTableRow}>
                <span className={styles.layoutProjectName}>{name}</span>
                <span className={styles.layoutMuted}>{owner}</span>
                <span>
                  <Badge tone={status === "Active" ? "brand" : status === "Shipped" ? "success" : status === "In review" ? "warning" : "neutral"} variant={status === "Shipped" ? "solid" : "soft"}>{status}</Badge>
                </span>
                <span className={styles.layoutMuted}>{when}</span>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>
    </SidebarShell>
  );
}

/**
 * Step 4's preview: a specimen page for Shape. Every control the user can
 * change — roundness, density, control height, hairline weight, dialog
 * widths — has a dedicated row with a mini caption so the effect is
 * labelled, not just visible.
 */
function ShapeShowcase({ brand }: { brand: BrandNames }) {
  return (
    <div className={styles.shapeShowcase}>
      {/* ── One composed "Team settings" card ──────────────────────────
          Hairline, field border, control height, roundness and density
          are all demonstrated inside a single realistic settings pane:
          header (hairline below), form fields (field border + roundness
          on inputs), stacked member rows (hairline between rows), and
          footer actions (buttons at every size + badges). Updating any
          slider on the left changes this entire card at once, so the
          user sees how the tokens interact rather than reading them in
          isolated bento boxes. */}
      <GlassPanel padding="lg" className={styles.shapeCard}>
        <div className={styles.shapeHeader}>
          <div>
            <ShapeEyebrow>Team settings</ShapeEyebrow>
            <h3 className={styles.shapeTitle}>{brand.full} workspace</h3>
            <p className={styles.shapeMuted}>Everything in one card: inputs, buttons, chips and row dividers all respond together.</p>
          </div>
          <div className={styles.shapeChipsRow}>
            <Badge tone="brand">Draft</Badge>
            <Badge tone="success" variant="solid">Live</Badge>
            <Badge tone="warning">Pending</Badge>
          </div>
        </div>

        <div className={styles.shapeHeaderRule} />

        <div className={styles.shapeFormGrid}>
          <Field label="Workspace name">
            <TextInput key={brand.full} defaultValue={brand.full} />
          </Field>
          <Field label="Billing email">
            <TextInput key={brand.domain} defaultValue={`billing@${brand.domain}`} />
          </Field>
          <Field label="Note" className={styles.shapeFormGridWide}>
            <Textarea rows={2} defaultValue="Clean, calm, carries the brand." />
          </Field>
        </div>

        <div className={styles.shapeMembersCaption}>
          <ShapeEyebrow>Members</ShapeEyebrow>
          <p className={styles.shapeMuted}>Each divider between rows uses --border-w. Each input box above uses --border-w-field.</p>
        </div>

        <div className={styles.shapeHairlineStack}>
          {[
            ["Jane Cooper", "Admin"],
            ["Marco Silva", "Editor"],
            ["Priya Shah", "Viewer"],
            ["Noah Kim", "Viewer"],
          ].map(([name, role]) => (
            <div key={name} className={styles.shapeHairlineRow}>
              <span>{name}</span>
              <span className={styles.shapeMuted}>{role}</span>
            </div>
          ))}
        </div>

        <div className={styles.shapeHeaderRule} />

        <div className={styles.shapeActionsRow}>
          <div className={styles.shapeButtonsLine}>
            <Button size="sm" variant="secondary">Small</Button>
            <Button variant="secondary">Medium</Button>
            <Button size="lg" variant="secondary">Large</Button>
          </div>
          <div className={styles.shapeButtonsLine}>
            <Button variant="ghost" onClick={() => undefined}>Cancel</Button>
            <Button iconStart={<CheckCircle2 size={14} aria-hidden="true" />}>Save changes</Button>
          </div>
        </div>
      </GlassPanel>

      {/* The composed workspace card above already shows every radius
          in use (inputs, chips, buttons, cards, divider rules), so the
          separate Radius scale tile row was redundant and gave the
          Shape step a second heading. Dropped. */}
    </div>
  );
}

function ShapeEyebrow({ children }: { children: ReactNode }) {
  return <p className={styles.shapeEyebrow}>{children}</p>;
}

/**
 * Step 5's preview: ONE specimen at a time, matching the gradient open
 * in the panel on the left. The specimen is the actual component that
 * reads that gradient, rendered bare on a plain field so it looks like
 * it would in a real app — no containers, no bento cards, no "every
 * gradient at once" catalogue. Picking a different gradient in the
 * dropdown swaps this view to that one's component.
 */
function GradientShowcase({ selection, brand, logoSrc, logoAlt }: { selection: string | null; brand: BrandNames; logoSrc?: string; logoAlt?: string }) {
  const token = selection ?? "--brand-gradient";
  return (
    <div className={styles.gradientStage}>
      <GradientSpecimen token={token} brand={brand} logoSrc={logoSrc} logoAlt={logoAlt} />
    </div>
  );
}

/**
 * Background step: the full page bg with a single lifted glass card so
 * the user sees the blooms interacting with a real surface, not just
 * the paint in isolation. Keeps the preview quiet so changes to bloom
 * position / size / strength are easy to spot.
 */
function BackgroundShowcase({ brand }: { brand: BrandNames }) {
  return (
    <div className={styles.backgroundStage}>
      <GlassPanel padding="lg" className={styles.backgroundCard}>
        <p className={styles.backgroundEyebrow}>{brand.full}</p>
        <h3 className={styles.backgroundTitle}>The page you&rsquo;re painting</h3>
        <p className={styles.backgroundLede}>
          Everything behind the dashboard: the base colour plus the two soft blooms. Flatten on the left for a solid field; drag the blooms to move them around.
        </p>
      </GlassPanel>
    </div>
  );
}

/**
 * Glass step preview: a stage with a chunky colourful pattern behind
 * one floating glass card. The pattern is what sells the frosted
 * effect — tint, opacity, blur, boost all show up as the card lets
 * more or less of the pattern through. Without something behind it a
 * glass card over a flat page reads as a solid card and the user
 * can't tell their changes are landing.
 */
function GlassShowcase({ brand }: { brand: BrandNames }) {
  return (
    <div className={styles.glassStage}>
      <div className={styles.glassBackdrop} aria-hidden="true" />
      <GlassPanel padding="lg" className={styles.glassCard}>
        <div className={styles.glassCardHead}>
          <div>
            <p className={styles.glassEyebrow}>{brand.full}</p>
            <h3 className={styles.glassTitle}>Frosted at work</h3>
          </div>
          <Badge tone="success" variant="solid">Live</Badge>
        </div>
        <p className={styles.glassLede}>
          Drag the Glass opacity down and watch the pattern behind this card bleed through. Boost adds saturation; blur is how soft the pattern reads under the frost.
        </p>
        <div className={styles.glassActions}>
          <Button size="sm" iconStart={<CheckCircle2 size={14} aria-hidden="true" />}>Save changes</Button>
          <Button size="sm" variant="secondary">Cancel</Button>
        </div>
      </GlassPanel>
    </div>
  );
}

/**
 * Shadows step preview: one specimen on a soft field, chosen by the
 * token selected in the Shadows panel. Each specimen uses the actual
 * shadow token (box-shadow: var(--…)) so slider edits are visible
 * live. Backdrop is a very subtle gradient so a dark shadow still has
 * contrast; the specimen is the thing the user is reshaping.
 */
function ShadowShowcase({ selection, brand, logoSrc, logoAlt }: { selection: string | null; brand: BrandNames; logoSrc?: string; logoAlt?: string }) {
  // Decode the broadcast — it's either "--shadow-panel" (plain) or
  // "--sidebar-shadow:drawer" (token:variant). Variant routes to a
  // different specimen even when the underlying token is shared.
  const raw = selection ?? "--shadow-panel";
  const [token, variant] = raw.includes(":") ? raw.split(":") : [raw, undefined];
  return (
    <div className={styles.shadowStage}>
      <ShadowSpecimen token={token} variant={variant} brand={brand} logoSrc={logoSrc} logoAlt={logoAlt} />
    </div>
  );
}

function ShadowSpecimen({ token, variant, brand, logoSrc, logoAlt }: { token: string; variant?: string; brand: BrandNames; logoSrc?: string; logoAlt?: string }) {
  const shadow = `var(${token})`;
  switch (token) {
    case "--shadow-hairline-row":
      return (
        <div className={styles.shadowRows}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.shadowRow} style={{ boxShadow: shadow }}>
              <span>Row {i}</span>
              <span className={styles.shadowRowValue}>$2,{i * 300}.00</span>
            </div>
          ))}
          <SpecimenCaption token={token} note="The hairline above each row inside a card. Reads as a tinted divider on glass, not a solid line." />
        </div>
      );
    case "--shadow-hairline-card":
      return (
        <>
          <div className={styles.shadowSpecimenCard} style={{ boxShadow: shadow }}>
            <p className={styles.shadowCardTitle}>Card hairline</p>
            <p className={styles.shadowCardLede}>A single light ring around a flat card — the baseline elevation under glass.</p>
          </div>
          <SpecimenCaption token={token} note="Rings every card and small surface. One px, tinted, just enough to prove the edge." />
        </>
      );
    case "--shadow-panel":
      return (
        <>
          <GlassPanel padding="lg" className={styles.shadowGlassCard} style={{ boxShadow: shadow }}>
            <p className={styles.shadowCardEyebrow}>{brand.full}</p>
            <p className={styles.shadowCardTitle}>Panel elevation</p>
            <p className={styles.shadowCardLede}>The main lift on every GlassPanel: cards, dialogs, filters.</p>
            <div className={styles.shadowCardActions}>
              <Button size="sm">Continue</Button>
              <Button size="sm" variant="secondary">Cancel</Button>
            </div>
          </GlassPanel>
          <SpecimenCaption token={token} note="The main card elevation. Governs every GlassPanel's drop." />
        </>
      );
    case "--shadow-float":
      // Tooltip appears on hover of the button. The group:hover reveals
      // the tooltip so the user sees the actual hover-triggered behaviour
      // instead of a static mock.
      return (
        <>
          <div className={styles.shadowTooltipDemo}>
            <button type="button" className={styles.shadowTooltipTrigger}>Hover me</button>
            <div className={styles.shadowTooltipFloat} style={{ boxShadow: shadow }} role="tooltip">
              Tooltips use the Float shadow — enough lift to read as hovering, not enough to compete with popovers or modals.
              <span className={styles.shadowTooltipArrow} style={{ boxShadow: shadow }} />
            </div>
          </div>
          <SpecimenCaption token={token} note="The floating layer: tooltips, hover cards, inline suggestions. Hover the button to see it." />
        </>
      );
    case "--shadow-lift":
      // Highlight card carries the --highlight-edge gradient along its
      // top edge — the thin brand-tinted light-catch that distinguishes
      // it from a plain Panel. Without the edge, the specimen reads as
      // "just another card with a slightly deeper shadow".
      return (
        <>
          <div className={styles.shadowLiftCard} style={{ boxShadow: shadow }}>
            <span className={styles.shadowLiftEdge} aria-hidden="true" />
            <p className={styles.shadowCardEyebrow}>Highlighted</p>
            <p className={styles.shadowCardTitle}>Highlight card</p>
            <p className={styles.shadowCardLede}>One rank above a Panel — used when a surface needs to call attention to itself.</p>
          </div>
          <SpecimenCaption token={token} note="A card that outranks the baseline Panel: pricing highlight, featured row. The top accent is --highlight-edge." />
        </>
      );
    case "--popover-shadow":
      // Popover pops OVER a trigger button, with the arrow pointing
      // at the trigger — mirrors the kit's real Popover component.
      return (
        <>
          <div className={styles.shadowPopoverDemo}>
            <button type="button" className={styles.shadowPopoverTrigger}>Actions ▾</button>
            <div className={styles.shadowPopover} style={{ boxShadow: shadow }} role="menu">
              <span className={styles.shadowPopoverArrow} />
              <p className={styles.shadowPopoverTitle}>Open menu</p>
              <ul className={styles.shadowPopoverList}>
                <li>Rename</li>
                <li>Duplicate</li>
                <li>Archive</li>
              </ul>
            </div>
          </div>
          <SpecimenCaption token={token} note="Popovers, dropdowns, context menus. Needs more lift than a card to read as floating above the surface it anchors to." />
        </>
      );
    case "--modal-shadow":
      // Full modal mock: the backdrop scrim darkens the page behind,
      // the modal sits centred with its shadow. Scrim colour is a
      // CSS variable so edits on the Hover / Overlays steps feed in.
      return (
        <>
          <div className={styles.shadowModalStage}>
            <div className={styles.shadowModalScrim} aria-hidden="true" />
            <div className={styles.shadowModalFakePage} aria-hidden="true">
              <div className={styles.shadowModalFakeCard}>Live content behind the modal</div>
            </div>
            <div className={styles.shadowModal} style={{ boxShadow: shadow }} role="dialog" aria-label="Modal specimen">
              <div className={styles.shadowModalHead}>
                <p className={styles.shadowCardTitle}>Confirm change</p>
                <Badge tone="warning">Draft</Badge>
              </div>
              <p className={styles.shadowCardLede}>Modal elevation reads over a dim scrim. Both the drop shadow and the scrim darkness shape the depth.</p>
              <div className={styles.shadowCardActions}>
                <Button size="sm" variant="secondary">Cancel</Button>
                <Button size="sm">Save changes</Button>
              </div>
            </div>
          </div>
          <SpecimenCaption token={token} note="The highest card-shaped elevation. Modal + AlertDialog + Sheet all share this shadow and sit over a dim scrim." />
        </>
      );
    case "--shadow-chrome":
      // Chrome shadow is the subtle drop under floating navigation
      // surfaces anchored to the top bar — the NavSearch dropdown is
      // the canonical consumer. Specimen shows a search box with
      // results floating under it so the "where does this show up?"
      // question has a clear answer.
      return (
        <>
          <div className={styles.shadowChromeStage}>
            <div className={styles.shadowChromeSearch}>
              <span className={styles.shadowChromeField}>Search invoices · Ctrl K</span>
            </div>
            <div className={styles.shadowChromeDropdown} style={{ boxShadow: shadow }}>
              <p className={styles.shadowPopoverTitle}>Recent</p>
              <ul className={styles.shadowPopoverList}>
                <li>INV-1042 · {brand.full}</li>
                <li>INV-1041 · Globex</li>
                <li>INV-1040 · Initech</li>
              </ul>
            </div>
          </div>
          <SpecimenCaption token={token} note="The drop under the search dropdown (NavSearch results panel). Smaller lift than Popover because it anchors against the top bar's own chrome, not against free page space." />
        </>
      );
    case "--shadow-auth-card":
      // Sign-in card lives on the auth-background gradient with the
      // uploaded logo above it, so the user sees the actual login
      // screen shape they're reshaping — not a solo card floating in
      // the void.
      return (
        <>
          <div className={styles.shadowAuthStage}>
            <div className={styles.shadowAuthCard} style={{ boxShadow: shadow }}>
              {logoSrc ? (
                // eslint-disable-next-line @next/next/no-img-element -- user's data URL, preview only
                <img src={logoSrc} alt={logoAlt || "Logo"} className={styles.shadowAuthLogo} />
              ) : null}
              <p className={styles.shadowCardEyebrow}>Sign in to {brand.full}</p>
              <p className={styles.shadowCardTitle}>Welcome back</p>
              <div className={styles.shadowAuthField} />
              <div className={styles.shadowAuthField} />
              <Button size="sm" fullWidth>Continue</Button>
            </div>
          </div>
          <SpecimenCaption token={token} note="The sign-in card: a solo surface centred on the auth-background gradient. The drop you set here sells the floating feel." />
        </>
      );
    case "--sidebar-shadow":
      if (variant === "drawer") {
        // Drawer: slides OVER the page from the left with a scrim
        // darkening everything underneath. The scrim slider on the
        // left feeds into the live --scrim token.
        return (
          <>
            <div className={styles.shadowDrawerStage}>
              <div className={styles.shadowDrawerPage} aria-hidden="true">
                <div className={styles.shadowEdgeStubCard}>Live content behind the drawer</div>
              </div>
              <div className={styles.shadowDrawerScrim} aria-hidden="true" />
              <div className={styles.shadowDrawerPanel} style={{ boxShadow: shadow }}>
                <div className={styles.shadowEdgeChip}>{brand.full}</div>
                <div className={styles.shadowEdgeStubRow} />
                <div className={styles.shadowEdgeStubRow} />
                <div className={styles.shadowEdgeStubRow} />
                <div className={styles.shadowEdgeStubRow} />
              </div>
            </div>
            <SpecimenCaption token={token} note="A slide-over drawer: appears on top of the page with a scrim darkening the content behind. Scrim darkness is editable on the left." />
          </>
        );
      }
      // Fixed sidebar: sits beside the page, no scrim. The right-edge
      // shadow is the only visual separator between chrome and content.
      return (
        <>
          <div className={styles.shadowEdgeDemo}>
            <div className={styles.shadowEdgeSidebar} style={{ boxShadow: shadow }}>
              <div className={styles.shadowEdgeChip}>{brand.full}</div>
              <div className={styles.shadowEdgeStubRow} />
              <div className={styles.shadowEdgeStubRow} />
              <div className={styles.shadowEdgeStubRow} />
            </div>
            <div className={styles.shadowEdgePage}>
              <div className={styles.shadowEdgeStubCard}>Page content</div>
            </div>
          </div>
          <SpecimenCaption token={token} note="A fixed, always-visible sidebar: sits beside the page content and casts a soft right-edge drop. No scrim. For the slide-over version, pick Drawer in the surface list above." />
        </>
      );
    case "--topbar-shadow":
      return (
        <>
          <div className={styles.shadowEdgeDemoCol}>
            <div className={styles.shadowEdgeTopbar} style={{ boxShadow: shadow }}>
              <div className={styles.shadowEdgeChip}>Top bar</div>
              <div className={styles.shadowEdgeStubItems}>
                <span />
                <span />
                <span />
              </div>
            </div>
            <div className={styles.shadowEdgePageWide}>
              <div className={styles.shadowEdgeStubCard}>Page content</div>
            </div>
          </div>
          <SpecimenCaption token={token} note="The soft fall off the top bar's bottom edge where the chrome meets the page below. Separates the fixed header from the scrolling content under it." />
        </>
      );
    case "--glow-md":
      return (
        <>
          <Button size="lg" iconStart={<Plus size={14} aria-hidden="true" />}>Create invoice</Button>
          <SpecimenCaption token={token} note="The halo on primary buttons: brand-tinted glow at mid-density." />
        </>
      );
    default:
      return (
        <>
          <div className={styles.shadowSpecimenCard} style={{ boxShadow: shadow }}>
            <p className={styles.shadowCardTitle}>Shadow preview</p>
            <p className={styles.shadowCardLede}>{token}</p>
          </div>
          <SpecimenCaption token={token} note="A generic card showing the shadow." />
        </>
      );
  }
}

function GradientSpecimen({ token, brand, logoSrc, logoAlt }: { token: string; brand: BrandNames; logoSrc?: string; logoAlt?: string }) {
  switch (token) {
    case "--brand-gradient":
      // Primary button is the main carrier. Big + centred.
      return (
        <>
          <Button size="lg" iconStart={<CheckCircle2 size={16} aria-hidden="true" />}>Create invoice</Button>
          <SpecimenCaption token={token} note="The primary gesture: this gradient paints the main confirm button, active nav pills and the brand chip in the sidebar corner." />
        </>
      );
    case "--danger-gradient":
      return (
        <>
          <Button size="lg" variant="danger">Delete project</Button>
          <SpecimenCaption token={token} note="The destructive gesture: confirm-filled danger buttons and the destructive AlertDialog's primary button." />
        </>
      );
    case "--success-gradient":
      // Toast specimen — the real component this gradient drives.
      return (
        <>
          <div className={styles.gradientSuccessToast}>
            <CheckCircle2 size={18} aria-hidden="true" />
            <span>Invoice sent to jane@{brand.domain}</span>
          </div>
          <SpecimenCaption token={token} note="Confirm toasts and the success-tone bar on Modal. No Button variant reads this directly." />
        </>
      );
    case "--logo-corner-bg":
      return (
        <>
          <div className={styles.gradientLogoCornerBig}>
            {logoSrc ? (
              // eslint-disable-next-line @next/next/no-img-element -- user's data URL, preview only
              <img src={logoSrc} alt={logoAlt || "Logo"} className={styles.gradientLogoCornerImage} />
            ) : (
              <>
                <span className={styles.gradientLogoGlyph}>{brand.word.charAt(0).toUpperCase() || "A"}</span>
                <span className={styles.gradientLogoWord}>{brand.word}</span>
              </>
            )}
          </div>
          <SpecimenCaption token={token} note="Fills the SidebarShell's logo corner when logoCorner=&quot;fill&quot;. Shown here at the actual corner size — the logo you dropped on step 1 sits on top of the gradient." />
        </>
      );
    case "--admin-strip-bg":
      return (
        <>
          <div className={styles.gradientStripBig}>Admin session · dev.{brand.domain}</div>
          <SpecimenCaption token={token} note="Full-width context strip at the top of a SidebarShell when strip={} is set — an admin session, a staging flag." />
        </>
      );
    case "--auth-background":
      // Realistic auth card centred on the gradient field. The logo from
      // step 1 anchors the card so this reads as the user's own sign-in
      // screen, not an abstract gradient demo.
      return (
        <>
          <div className={styles.gradientAuthStage}>
            <div className={styles.gradientAuthCard}>
              {logoSrc ? (
                // eslint-disable-next-line @next/next/no-img-element -- user's data URL, preview only
                <img src={logoSrc} alt={logoAlt || "Logo"} className={styles.gradientAuthLogo} />
              ) : null}
              <p className={styles.gradientAuthEyebrow}>Sign in to {brand.full}</p>
              <h4 className={styles.gradientAuthTitle}>Welcome back</h4>
              <Field label="Work email">
                <TextInput key={brand.domain} defaultValue={`jane@${brand.domain}`} />
              </Field>
              <Field label="Password">
                <TextInput type="password" defaultValue="••••••••" />
              </Field>
              <Button fullWidth>Continue</Button>
            </div>
          </div>
          <SpecimenCaption token={token} note="The gradient behind the auth cards in templates/starter. Reads as atmosphere, not a card." />
        </>
      );
    case "--table-head-fill":
      return (
        <>
          <div className={styles.gradientTableBig}>
            <div className={styles.gradientTableHead}>
              <span>Client</span>
              <span>Amount</span>
              <span>Due</span>
              <span>Status</span>
            </div>
            {[
              [brand.full, "$2,400.00", "12 Oct", "Paid"],
              ["Globex", "$880.00", "18 Oct", "Pending"],
              ["Initech", "$1,120.00", "22 Sep", "Overdue"],
            ].map(([a, b, c, d]) => (
              <div key={a} className={styles.gradientTableRowBig}>
                <span>{a}</span>
                <span>{b}</span>
                <span>{c}</span>
                <span>{d}</span>
              </div>
            ))}
          </div>
          <SpecimenCaption token={token} note="The horizontal sweep in Table and DataTable header cells." />
        </>
      );
    case "--highlight-edge":
      return (
        <>
          <div className={styles.gradientEdgeBig}>
            <span className={styles.gradientEdgeTop} aria-hidden="true" />
            <h4 className={styles.gradientEdgeTitle}>Glass card</h4>
            <p className={styles.gradientEdgeBody}>The 2px highlight at the top edge catches light like real glass. Zoom in on the top rule.</p>
          </div>
          <SpecimenCaption token={token} note="The lit edge at the top of glass panels — reads as light catching the surface." />
        </>
      );
    case "--page-background":
      return (
        <>
          <div className={styles.gradientPageBig} />
          <SpecimenCaption token={token} note="The whole-page backdrop plus the two soft brand blooms (top-left and bottom-right). Also seen behind this preview." />
        </>
      );
    case "--gradient-brand-deep":
      return (
        <>
          <div className={styles.gradientTileBig} style={{ background: `var(${token})` }} />
          <SpecimenCaption token={token} note="A darker variant used for selected rows and some chart tooltips. Not a primary gesture." />
        </>
      );
    default:
      // Unknown token — just render it as a tile.
      return (
        <>
          <div className={styles.gradientTileBig} style={{ background: `var(${token})` }} />
          <SpecimenCaption token={token} note="This token is editable in the panel on the left." />
        </>
      );
  }
}

function SpecimenCaption({ token, note }: { token: string; note: string }) {
  return (
    <div className={styles.gradientSpecimenCaption}>
      <code className={styles.gradientToken}>{token}</code>
      <p className={styles.gradientMuted}>{note}</p>
    </div>
  );
}


/**
 * Step 3's preview: a type specimen running every scale (display, section,
 * card, body, small, caption, button, mono) so swapping the display or
 * body font is immediately visible across the whole typographic
 * hierarchy. Headings use the display font, everything else uses body.
 */
function TypeShowcase({ brand }: { brand: BrandNames }) {
  return (
    <div className={styles.typeShowcase}>
      <TypeSample
        className={styles.typeDisplay}
        info="Display · var(--text-display). Hero slogans, the biggest page-opening type. One per view."
      >
        {brand.full} looks sharp in {brand.word}.
      </TypeSample>
      <TypeSample
        className={styles.typeSection}
        info="Section heading · var(--text-section). The h2 under a page title; the start of each major block."
        tag="h2"
      >
        Welcome to {brand.full}
      </TypeSample>
      <TypeSample
        className={styles.typeCardTitle}
        info="Card title · var(--text-card-title). The h3 that labels an individual card or panel."
        tag="h3"
      >
        {brand.full} revenue by product
      </TypeSample>
      <TypeSample
        className={styles.typeHero}
        info="Hero number · 48px, display font, weight 900. Dashboard KPIs and stat strips."
      >
        $48,210
      </TypeSample>
      <TypeSample
        className={styles.typeBody}
        info="Body · 16px, --font-body. Paragraphs, labels, controls, table cells. 1.6 line-height."
      >
        Everything the {brand.full} team ships lives here — invoices, briefs, the whole brand kit. Three items are waiting on you this week.
        The pangram goes: the quick brown fox jumps over the lazy dog.
      </TypeSample>
      <TypeSample
        className={styles.typeSmall}
        info="Small · var(--text-small). Secondary rows, filter chips, assistive copy under inputs."
      >
        Last synced from {brand.domain} two minutes ago. 24 items across 8 clients, 3 overdue, 7 pending, 14 shipped.
      </TypeSample>
      <TypeSample
        className={styles.typeCaption}
        info="Caption · var(--text-caption). The quietest body copy — footnotes, legal, metadata."
      >
        Figures include GST. Rounded to the nearest dollar.
      </TypeSample>
      <TypeSample
        className={styles.typeButtons}
        info="Button labels — show how the body font reads on primary / secondary / ghost actions."
      >
        <Button iconStart={<Plus size={14} aria-hidden="true" />}>Create invoice</Button>
        <Button variant="secondary">Export CSV</Button>
        <Button variant="ghost">Skip for now</Button>
      </TypeSample>
      {/* Mono code block and the alphabet specimen were removed from
          this specimen: both read as "every character the font has",
          not "what my body / display font looks like in the real
          components", which is what the Fonts step is actually
          deciding. Both are still shipping tokens; a dedicated type
          specimen page can carry them later. */}
    </div>
  );
}

/**
 * One text row in the Fonts showcase: no "section heading" micro-label
 * cluttering the preview, just the text set in the right scale with a
 * discreet (i) toggletip on hover for anyone who wants to know what the
 * line is called and which token it uses.
 */
function TypeSample({
  children,
  className,
  info,
  tag = "div",
}: {
  children: ReactNode;
  className?: string;
  info: string;
  tag?: "div" | "h2" | "h3" | "pre";
}) {
  const Tag = tag;
  return (
    <div className={styles.typeRow}>
      <Tag className={cx(styles.typeSample, className)}>{children}</Tag>
      <span className={styles.typeInfo}>
        <Toggletip label="About this text" side="left">
          {info}
        </Toggletip>
      </span>
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
