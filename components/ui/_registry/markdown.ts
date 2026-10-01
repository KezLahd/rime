import { CATEGORIES, PATTERNS, REGISTRY, entriesByCategory, propTables, tokenRows, type RegistryEntry } from "./index";
import { SHADCN_MAP, SHADCN_TOKENS } from "./shadcn-map";
import { RIME_SITE } from "./site";
import type { PatternEntry } from "./types";

// The registry as markdown, for AI agents and for people reading the repo:
// /llms.txt (the index), /llms-full.txt (everything), /md/<slug>.md (one
// component), and docs/*.md (written by scripts/export-ui-docs.mjs from the
// same functions). Rendered from the registry, never written by hand.

const esc = (s: string) => s.replace(/\|/g, "\\|").replace(/\n/g, " ");

const kebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/([A-Z])([A-Z][a-z])/g, "$1-$2").toLowerCase();

/** The shadcn registry item that installs an entry (same naming as scripts/gen-shadcn-registry.mjs). */
export function registryItemFor(entry: RegistryEntry): string | null {
  const css = entry.css[0] ?? "";
  const ui = css.match(/^components\/ui\/([^/]+)\//);
  if (ui) return ui[1] === "Scroll" ? "scroll-area" : kebab(ui[1]);
  const shell = css.match(/^components\/shell\/([A-Za-z]+)\./);
  if (shell) return kebab(shell[1]);
  if (css.startsWith("components/charts")) return "charts";
  return null;
}

export const installAddress = (item: string) => `${RIME_SITE.owner}/${RIME_SITE.repo}/${item}`;
export const installLine = (item: string) => `npx shadcn@latest add ${installAddress(item)}`;

export const UI_RULES = [
  "Import primitives from \"@/components/ui\" (the barrel). Shells come from \"@/components/shell/*\".",
  "Never restyle a primitive from a screen. Theme it with CSS custom properties (tokens) instead: system tokens in app/styles/tokens.css, per-component tokens (--button-radius, --input-height-md, --table-head-fill) at :root or on a wrapper.",
  "CSS Modules only. No Tailwind, no inline colour values, no new component library.",
  "No heavy rounding beyond the theme's scale, no scale-up or lift on hover, no bento grids, no left accent bars, no decorative background effects that do not derive from the product.",
  "No eyebrow or small label stacked over a title. Text uses the full width of its column: no narrow measure caps.",
  "Summary stats are one card with hairline cells, never a grid of separate stat cards.",
  "Filters are dropdowns (Select chips) plus one full-width search, never a row of toggle chips. Sortable table headers are the whole cell; pagination is centred under the table.",
  "One primary button (the brand gradient) per view. One table look everywhere. Modal and sheet headers keep one left edge.",
  "Every list page is GlassPanel > FilterBar + Table + Pagination, with nothing above it.",
  "Every component needs its loading, empty, error and disabled states; an empty state always says what to do next.",
  "Text contrast 4.5:1 minimum (3:1 for focus rings and control edges). Fill colours like --brand-soft and --danger-base are never text.",
  "In Next.js, gate access inside page.tsx, never in layout.tsx (a layout gate leaks the page into the RSC payload).",
  "No em dashes in copy.",
];

export function entryToMarkdown(entry: RegistryEntry): string {
  const out: string[] = [];
  out.push(`# ${entry.name}`, "", `> ${entry.summary}`, "");
  out.push(`Category: ${entry.category}. Docs page: ${RIME_SITE.url}/components/${entry.slug}`, "");
  const item = registryItemFor(entry);
  if (item) out.push("## Installation", "", "```bash", installLine(item), "```", "");
  out.push(...entry.description.flatMap((p) => [p, ""]));
  out.push("## Usage", "", "```tsx", entry.importLine, "", entry.usage, "```", "");
  if (entry.composition) out.push("## Composition", "", "```tsx", entry.composition, "```", "");

  for (const table of propTables(entry)) {
    out.push(`## Props: ${table.component}`, "");
    if (table.props.length) {
      out.push("| Prop | Type | Default | Description |", "| --- | --- | --- | --- |");
      for (const p of table.props) {
        out.push(`| \`${p.name}\`${p.required ? " (required)" : ""} | \`${esc(p.type)}\` | ${p.default ? `\`${esc(p.default)}\`` : ""} | ${esc(p.description)} |`);
      }
      out.push("");
    }
    if (table.passThrough.length) out.push(`Also accepts the native attributes of: ${table.passThrough.join(", ")}.`, "");
  }

  if (entry.examples.length) {
    out.push("## Examples", "");
    for (const ex of entry.examples) {
      out.push(`### ${ex.title}`, "");
      if (ex.description) out.push(ex.description, "");
      out.push("```tsx", ex.code, "```", "");
    }
  }

  const { hooks, reads } = tokenRows(entry);
  if (hooks.length || reads.length) {
    out.push("## Theme tokens", "");
    if (hooks.length) {
      out.push(
        "Per-component tokens. Undeclared by default: the default below is the fallback the CSS uses. Set any of them at :root or on a wrapper to restyle every instance.",
        "",
        "| Token | Default |",
        "| --- | --- |",
      );
      for (const h of hooks) out.push(`| \`${h.name}\` | ${h.defaults.map((d) => `\`${esc(d)}\``).join(" / ")} |`);
      out.push("");
    }
    if (reads.length) out.push(`System tokens it reads: ${reads.map((r) => `\`${r.name}\``).join(", ")}.`, "");
  }

  out.push("## Accessibility", "", ...entry.accessibility.map((a) => `- ${a}`), "");
  out.push("## Do", "", ...entry.dos.map((d) => `- ${d}`), "");
  out.push("## Don't", "", ...entry.donts.map((d) => `- ${d}`), "");
  if (entry.related?.length) out.push(`Related: ${entry.related.map((r) => `${RIME_SITE.url}/components/${r}`).join(", ")}`, "");
  return out.join("\n");
}

export function patternToMarkdown(p: PatternEntry): string {
  return [
    `## Pattern: ${p.name}`,
    "",
    `> ${p.summary}`,
    "",
    ...p.description.flatMap((d) => [d, ""]),
    `Uses: ${p.uses.join(", ")}.`,
    "",
    "```tsx",
    p.code,
    "```",
    "",
    ...p.rules.map((r) => `- ${r}`),
    "",
  ].join("\n");
}

/** llms.txt: the index an agent reads first (https://llmstxt.org shape). Links are absolute (the hosted docs). */
export function llmsIndex(origin: string = RIME_SITE.url): string {
  const site = origin || RIME_SITE.url;
  const out: string[] = [
    "# Rime",
    "",
    `> Rime is a React component kit with frosted-glass surfaces: Next.js App Router, TypeScript, CSS Modules and CSS custom properties, no Tailwind and no component library underneath. It installs like shadcn/ui (the shadcn CLI copies the source into your project) and names its items as shadcn does. Each project re-themes it with one theme.css made in Rime Studio (${site}/themes). Two presets, Rime Default (frosted glass in Frost blue) and Rime Flat, each in light and dark mode.`,
    "",
    "Read the rules before writing UI code with these components:",
    "",
    ...UI_RULES.map((r) => `- ${r}`),
    "",
    "## Install",
    "",
    `- Everything: \`${installLine("kit")}\``,
    `- One component: \`${installLine("<item>")}\` (item names follow shadcn: button, dialog, dropdown-menu, select, sheet, sonner...)`,
    `- The agent docs and Claude skill for a project: \`${installLine("agents")}\``,
    `- Registry: ${site}/r/registry.json. Namespace ${RIME_SITE.namespace} for components.json: "${RIME_SITE.namespace}": "${site}/r/{name}.json". The shadcn MCP server (npx shadcn@latest mcp) then lists, searches and installs Rime items.`,
    "- Styles, imported first in app/globals.css: app/styles/tokens.css, app/styles/base.css, app/styles/shadcn-bridge.css, then the project's theme.css.",
    "",
    "## Coming from shadcn",
    "",
    "| shadcn | Rime | Install item |",
    "| --- | --- | --- |",
    ...SHADCN_MAP.map((r) => `| ${r.shadcn} | ${esc(r.rime)}${r.note ? ` (${esc(r.note)})` : ""} | ${r.install} |`),
    "",
    "shadcn CSS variable names are aliases of Rime tokens (app/styles/shadcn-bridge.css), one way only:",
    "",
    "| shadcn variable | Rime token |",
    "| --- | --- |",
    ...SHADCN_TOKENS.map(([a, b]) => `| ${a} | ${b} |`),
    "",
    "Dark mode is the .dark class or data-mode=\"dark\" on <html>; Rime Flat is data-theme=\"flat\".",
    "",
    "## Docs",
    "",
    `- [Everything in one file](${site}/llms-full.txt): every component, pattern and rule`,
    `- [Theming and tokens](${site}/md/theme.md): token layers, presets and modes, how to theme a project`,
    `- [Patterns](${site}/md/patterns.md): composed patterns (list page, shells, sign-in, terms gate)`,
    "- Any docs page as markdown: add .md to its URL (for example /components/button.md).",
    "",
  ];
  for (const [category, list] of entriesByCategory()) {
    out.push(`## ${category}`, "");
    for (const e of list) {
      const item = registryItemFor(e);
      out.push(`- [${e.name}](${site}/md/${e.slug}.md): ${e.summary}${item ? ` Install: \`${installLine(item)}\`` : ""}`);
    }
    out.push("");
  }
  out.push("## Patterns", "");
  for (const p of PATTERNS) out.push(`- [${p.name}](${site}/md/patterns.md#${p.slug}): ${p.summary}`);
  out.push("");
  return out.join("\n");
}

export function llmsFull(): string {
  return [
    llmsIndex(),
    "---",
    "",
    ...CATEGORIES.flatMap((c) => REGISTRY.filter((e) => e.category === c).map((e) => `${entryToMarkdown(e)}\n---\n`)),
    "# Patterns",
    "",
    ...PATTERNS.map(patternToMarkdown),
  ].join("\n");
}

export function patternsMarkdown(): string {
  return ["# Patterns", "", ...PATTERNS.map(patternToMarkdown)].join("\n");
}

export const THEME_MARKDOWN = `# Theming

Every visual decision in the components is a CSS custom property, in four layers:

1. Brand primitives: the palette (--brand Frost #468cfb, --brand-action the button-safe shade, --brand-strong, --brand-deep, --brand-soft Ice, --support, --danger-base, --night) and its rgb channels (--rgb-brand: 70, 140, 251), the chart palette (--chart-1..6, --chart-seq-1..5), the fonts (--font-display, --font-body) and the logo (SidebarShell logoSrc, or --shell-logo).
2. Semantic tokens: ink (--ink-body, --ink-muted…), surfaces and glass (--page-background, --glass-fill, --surface-solid), lines, status (--danger-ink…), focus (--focus-color, --focus-ring), gradients (--brand-gradient).
3. Shape and space scales: radius (--r-2xs to --r-2xl, --r-full), --density (padding multiplier), control heights (--control-h-sm|md|lg, --field-h-sm|md), border widths (--border-w, --border-w-field), shadows (--shadow-*), blurs (--blur-*), motion (--dur, --ease).
4. Per-component tokens: --button-radius, --input-height-md, --table-head-fill, --modal-width-md and so on. They are undeclared by default and each component's CSS reads them with a fallback to layer 2 or 3, so setting one restyles every instance and leaving it alone changes nothing.

To theme a project: make a theme in Rime Studio (/themes) (start from Rime Default or Rime Flat, edit light and dark modes, or drop in a logo or screenshot and let Image extract a palette), export theme.css, and load it after the base tokens (app/styles/tokens.css). Composite tokens recompute from the primitives they reference because they are declared on the same element.

A custom property resolves var() where it is declared. A theme that overrides a primitive must be declared on the same element as the composites (:root), or redeclare the composites in full, as the flat and dark layers in tokens.css do.

## Presets and modes

Theme = preset x mode. Rime Default is :root; Rime Flat is data-theme="flat". Dark mode is the .dark class or data-mode="dark" (on <html> or a wrapper), with either preset. data-theme="dark" is kept as an alias for Default dark.
`;
