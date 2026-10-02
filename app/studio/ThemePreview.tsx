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
const UNSHELLED: ReadonlyArray<PreviewFocus> = ["logo", "colour", "type", "shape", "gradients", "background", "glass", "shadows"];

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
    return <ShadowShowcase selection={shadowSelection ?? null} brand={brandText} />;
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
        <p className={styles.catLede}>The six text roles, each reading the token it&apos;s named after.</p>
      </div>
      <GlassPanel padding="lg" className={styles.catTextCard}>
        <Spot as="h2" tokens="--ink-heading" peek={peek} className={styles.catInkHeading}>Welcome to {brand.full}</Spot>
        <Spot as="p" tokens="--ink-body" peek={peek} className={styles.catInkBody}>
          Body ink runs through every paragraph, table cell, label and input value. It&apos;s the colour you&apos;re reading right now.
        </Spot>
        <Spot as="p" tokens="--ink-secondary" peek={peek} className={styles.catInkSecondary}>
          Secondary ink: field helper copy, muted descriptions, quieter rows that still carry meaning.
        </Spot>
        <Spot as="p" tokens="--ink-muted" peek={peek} className={styles.catInkMuted}>
          Muted ink: captions, metadata and column headers. Lowest-weight copy that still has to clear 4.5:1 on glass.
        </Spot>
        <Spot as="p" tokens="--ink-brand" peek={peek} className={styles.catInkBrand}>
          Brand ink paints links, active nav labels and the eyebrows above headings.
        </Spot>
        <Spot as="div" tokens="--ink-placeholder --line-input --focus-color" peek={peek}>
          <TextInput size="sm" placeholder="Placeholder ink shows up here" />
        </Spot>
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

      {/* ── Radius scale (the one tile row kept) ───────────────────────
          Six tiles labelled with their --r-* token. Scaling the roundness
          slider ripples all six at once; useful as a reference even
          when the composed card above shows the applied effect. */}
      <GlassPanel padding="lg" className={styles.shapeCard}>
        <div className={styles.shapeHeader}>
          <div>
            <ShapeEyebrow>Radius scale</ShapeEyebrow>
            <h3 className={styles.shapeTitle}>--r-xs through --r-2xl</h3>
            <p className={styles.shapeMuted}>Six corner tokens, moved together by the Corner roundness slider.</p>
          </div>
        </div>
        <div className={styles.shapeRadiiRow}>
          {["xs", "sm", "md", "lg", "xl", "2xl"].map((step) => (
            <div key={step} className={styles.shapeRadiusTile} style={{ borderRadius: `var(--r-${step})` }}>
              <span className={styles.shapeRadiusLabel}>--r-{step}</span>
            </div>
          ))}
        </div>
      </GlassPanel>

      {/* ── Dialogs: the three sizes you can pop open live ─────────── */}
      <GlassPanel padding="lg" className={styles.shapeCard}>
        <div className={styles.shapeHeader}>
          <div>
            <ShapeEyebrow>Dialogs</ShapeEyebrow>
            <h3 className={styles.shapeTitle}>Modal widths</h3>
            <p className={styles.shapeMuted}>Click a button to pop a real dialog. Drag the matching slider on the left while it is open and the dialog resizes live.</p>
          </div>
        </div>
        <ShapeDialogButtons />
      </GlassPanel>
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
function ShadowShowcase({ selection, brand }: { selection: string | null; brand: BrandNames }) {
  const token = selection ?? "--shadow-panel";
  return (
    <div className={styles.shadowStage}>
      <ShadowSpecimen token={token} brand={brand} />
    </div>
  );
}

function ShadowSpecimen({ token, brand }: { token: string; brand: BrandNames }) {
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
      return (
        <>
          <div className={styles.shadowFloatRow}>
            <Button size="sm" variant="secondary">Hover me</Button>
            <div className={styles.shadowFloat} style={{ boxShadow: shadow }}>
              Tooltip · var({token})
            </div>
          </div>
          <SpecimenCaption token={token} note="The floating layer: tooltips, hover cards, inline suggestions." />
        </>
      );
    case "--shadow-lift":
      return (
        <>
          <div className={styles.shadowLiftCard} style={{ boxShadow: shadow }}>
            <p className={styles.shadowCardEyebrow}>Highlighted</p>
            <p className={styles.shadowCardTitle}>Highlight card</p>
            <p className={styles.shadowCardLede}>One rank above a Panel — used when a surface needs to call attention to itself.</p>
          </div>
          <SpecimenCaption token={token} note="A card that outranks the baseline Panel: pricing highlight, featured row." />
        </>
      );
    case "--popover-shadow":
      return (
        <>
          <div className={styles.shadowPopover} style={{ boxShadow: shadow }}>
            <p className={styles.shadowPopoverTitle}>Open menu</p>
            <ul className={styles.shadowPopoverList}>
              <li>Rename</li>
              <li>Duplicate</li>
              <li>Archive</li>
            </ul>
          </div>
          <SpecimenCaption token={token} note="Popovers, dropdowns, context menus. Needs more lift than a card to read as floating." />
        </>
      );
    case "--modal-shadow":
      return (
        <>
          <div className={styles.shadowModal} style={{ boxShadow: shadow }}>
            <div className={styles.shadowModalHead}>
              <p className={styles.shadowCardTitle}>Modal elevation</p>
              <Badge tone="warning">Draft</Badge>
            </div>
            <p className={styles.shadowCardLede}>The highest card-shaped surface — Modal, AlertDialog, Sheet. Lives above a scrim.</p>
            <div className={styles.shadowCardActions}>
              <Button size="sm" variant="secondary">Cancel</Button>
              <Button size="sm">Save changes</Button>
            </div>
          </div>
          <SpecimenCaption token={token} note="The highest card-shaped elevation. Reads over a dim scrim." />
        </>
      );
    case "--shadow-chrome":
      return (
        <>
          <div className={styles.shadowChromeBar} style={{ boxShadow: shadow }}>
            <span className={styles.shadowCardTitle}>Top bar</span>
            <span className={styles.shadowCardLede}>Chrome drop</span>
          </div>
          <SpecimenCaption token={token} note="Falls off the top bar and the sidebar's outside edges." />
        </>
      );
    case "--shadow-auth-card":
      return (
        <>
          <div className={styles.shadowAuthCard} style={{ boxShadow: shadow }}>
            <p className={styles.shadowCardEyebrow}>Sign in to {brand.full}</p>
            <p className={styles.shadowCardTitle}>Welcome back</p>
            <div className={styles.shadowAuthField} />
            <div className={styles.shadowAuthField} />
            <Button size="sm" fullWidth>Continue</Button>
          </div>
          <SpecimenCaption token={token} note="The sign-in and templates/starter card: a solo surface centred on the auth-background gradient." />
        </>
      );
    case "--sidebar-shadow":
    case "--topbar-shadow":
      return (
        <>
          <div className={styles.shadowEdge} style={{ boxShadow: shadow }}>
            <span>{token === "--sidebar-shadow" ? "Sidebar edge" : "Top bar edge"}</span>
          </div>
          <SpecimenCaption token={token} note="The soft fall off the shell's outer edge where the chrome meets the page." />
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

function ShapeDialogButtons() {
  // Keep `size` separate from `open` so closing a Small or Large dialog
  // doesn't briefly collapse it to Medium during the dismiss animation.
  // Previously, `size={size ?? "md"}` snapped to Medium the instant
  // `setSize(null)` ran, which the Modal's exit transition visibly
  // picked up for ~150 ms before unmounting.
  const [size, setSize] = useState<"sm" | "md" | "lg">("md");
  const [open, setOpen] = useState(false);
  const openWith = (next: "sm" | "md" | "lg") => {
    setSize(next);
    setOpen(true);
  };
  const close = () => setOpen(false);
  const label = size === "sm" ? "Small" : size === "md" ? "Medium" : "Large";
  return (
    <>
      <div className={styles.shapeButtonsLine}>
        <Button onClick={() => openWith("sm")}>Open small dialog</Button>
        <Button onClick={() => openWith("md")}>Open medium dialog</Button>
        <Button onClick={() => openWith("lg")}>Open large dialog</Button>
      </div>
      <p className={styles.shapeMuted}>
        Sized by <code className={styles.shapeToken}>--modal-width-sm</code>,{" "}
        <code className={styles.shapeToken}>--modal-width-md</code> and{" "}
        <code className={styles.shapeToken}>--modal-width-lg</code>. Below 640 px every size becomes a bottom sheet.
      </p>
      <Modal
        open={open}
        onClose={close}
        title={`${label} dialog preview`}
        description="Drag the matching slider on the left while this is open — the dialog resizes live."
        size={size}
        footer={
          <>
            <Button variant="secondary" onClick={close}>Cancel</Button>
            <Button onClick={close}>Save changes</Button>
          </>
        }
      >
        <div className={styles.shapeDialogBodyContent}>
          <Field label="Project name">
            <TextInput defaultValue="Atlas redesign" />
          </Field>
          <Field label="Note">
            <Textarea rows={3} defaultValue="Clean, calm, carries the brand." />
          </Field>
          <p className={styles.shapeMuted}>
            Max width in use: <code className={styles.shapeToken}>--modal-width-{size}</code>.
          </p>
        </div>
      </Modal>
    </>
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
      <TypeSample
        className={styles.typeMono}
        info="Mono · var(--font-mono). Code blocks, hex values, API samples. Separate token from body/display."
        tag="pre"
      >
        <code>{`npx shadcn@latest add KezLahd/rime/kit\nconst theme = loadWorking() ?? presetTheme();\nreturn <Button onClick={save}>Save</Button>;`}</code>
      </TypeSample>
      <TypeSample
        className={styles.typeAlphabet}
        info="Alphabet specimen — every letter, every numeral in the display font so you can scan the full character set."
      >
        ABCDEFGHIJKLMNOPQRSTUVWXYZ
        <br />
        abcdefghijklmnopqrstuvwxyz
        <br />
        0123456789 &amp; ! ? @ # $ % &lt; = &gt;
      </TypeSample>
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
