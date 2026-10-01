"use client";

import { ArrowRight, CheckCircle2, Download, Filter, MoreHorizontal, Plus, Search } from "lucide-react";
import { memo, type ReactNode } from "react";
import { cx } from "@/components/ui/_internal/cx";
import { SidebarShell } from "@/components/shell/SidebarShell";
import { Avatar } from "@/components/ui/Avatar/Avatar";
import { Badge } from "@/components/ui/Badge/Badge";
import { Button } from "@/components/ui/Button/Button";
import { Checkbox } from "@/components/ui/Checkbox/Checkbox";
import { Field } from "@/components/ui/Field/Field";
import { GlassPanel, IconBook, IconClipboard, IconHome, IconUsers } from "@/components/ui";
import { Alert } from "@/components/ui/Alert/Alert";
import { IconButton } from "@/components/ui/IconButton/IconButton";
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
  peekToken,
}: {
  logoSrc?: string;
  logoAlt?: string;
  logoCorner: "glass" | "fill";
  layout: "sidebar" | "rail" | "header";
  focus?: PreviewFocus;
  /** When a token is being hovered in the controls panel, this is set to
   *  its name. The Colours showcase rings matching elements so the user
   *  sees where the token is used. */
  peekToken?: string | null;
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
    return <ColourShowcase peekToken={peekToken ?? null} />;
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
  as?: "div" | "span" | "section";
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

function ColourShowcase({ peekToken }: { peekToken: string | null }) {
  const peek = peekToken;
  return (
    <div className={styles.colourShowcase}>
      {/* Hero: brand ink + action + secondary + ghost */}
      <GlassPanel padding="lg" className={styles.colourHero}>
        <div className={styles.colourHeroText}>
          <Spot as="div" tokens="--ink-brand" peek={peek}>
            <p className={styles.colourEyebrow}>This month</p>
          </Spot>
          <Spot as="div" tokens="--ink-heading" peek={peek}>
            <h2 className={styles.colourTitle}>Good morning, Jane</h2>
          </Spot>
          <Spot as="div" tokens="--ink-secondary --ink-body" peek={peek}>
            <p className={styles.colourLede}>
              Three invoices are overdue, two awaiting approval. Review and send to clear your inbox for the week.
            </p>
          </Spot>
          <Spot as="div" tokens="--ink-muted" peek={peek}>
            <p className={styles.colourMuted}>Last synced 2 minutes ago.</p>
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

      {/* Status badges + progress */}
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

      {/* Alerts: info (--brand-soft) + neutral (--support) + a table-head
          strip (--support via --table-head-fill). Previously the preview
          had nothing that used Accent (--brand-soft) or Neutral (--support)
          so dragging those rows did nothing visible. */}
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

      {/* Mini table head: --support drives the sweep gradient (see
          --table-head-fill in tokens.css), so changing Neutral tints the
          strip here. */}
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
              <span className={styles.colourTableCell}>Acme Inc</span>
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

      {/* Chart + form */}
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

      {/* Filter chips + search */}
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
