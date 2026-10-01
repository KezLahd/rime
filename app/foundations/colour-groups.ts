// The colour token groups shown on /colors (plain data, so server pages can read it).
export const COLOUR_GROUPS: ReadonlyArray<{ title: string; note: string; tokens: string[] }> = [
  { title: "Rime", note: "Rime's own brand colours (app/styles/rime-site.css). Rime Default is built from them.", tokens: ["--rime-frost", "--rime-ice", "--rime-mist"] },
  { title: "Palette", note: "The theme's primitives. Text never sits on --brand; buttons start from --brand-action.", tokens: ["--brand", "--brand-action", "--brand-strong", "--brand-deep", "--brand-soft", "--support", "--danger-base", "--night"] },
  { title: "Ink", note: "Text colours. Nothing lighter than --ink-muted carries text.", tokens: ["--ink-heading", "--ink-body", "--ink-secondary", "--ink-muted", "--ink-brand", "--ink-placeholder", "--ink-disabled"] },
  { title: "Surfaces", note: "The field, solid surfaces and the frosted glass.", tokens: ["--page-base", "--surface-solid", "--surface-sunken", "--surface-sunken-2", "--glass-fill", "--glass-fill-nested", "--popover-surface", "--modal-surface"] },
  { title: "Status", note: "Each ink holds 4.5:1 on its own fill.", tokens: ["--success-ink", "--success-fill", "--warning-ink", "--warning-fill", "--danger-ink", "--danger-fill", "--info-ink", "--info-fill"] },
  { title: "Charts", note: "Categorical in order, then the ordinal ramp.", tokens: ["--chart-1", "--chart-2", "--chart-3", "--chart-4", "--chart-5", "--chart-6", "--chart-seq-1", "--chart-seq-2", "--chart-seq-3", "--chart-seq-4", "--chart-seq-5"] },
  { title: "Gradients", note: "One primary gesture per view.", tokens: ["--brand-gradient", "--danger-gradient", "--success-gradient", "--brand-gradient-soft", "--logo-corner-bg"] },
];
