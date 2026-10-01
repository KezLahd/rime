import { contrast, nudgeToContrast, over, type Rgb } from "./colour";

// The contrast guard: the text-on-surface pairs that matter, measured on the
// preview's resolved values. Glass is judged at its worst: a glass fill over
// the strongest bloom on the page base, the case tokens.md quotes.

export type Resolver = {
  colour: (expr: string) => Rgb | null;
  /** Colours of a gradient (its stops) or a plain colour, resolved. */
  stops: (expr: string) => Rgb[];
};

type Surface = { label: string; colours: (r: Resolver) => Rgb[] };

export type PairSpec = {
  id: string;
  label: string;
  fg: string;
  on: Surface;
  target: number;
  /** The token the Fix button moves, and which side of the pair it is. */
  fix: { token: string; side: "fg" | "bg" };
};

export type PairResult = PairSpec & { fgRgb: Rgb; bgRgb: Rgb; ratio: number; pass: boolean };

const WHITE: Rgb = { r: 255, g: 255, b: 255, a: 1 };

const solid = (expr: string, label: string): Surface => ({ label, colours: (r) => [r.colour(expr) ?? WHITE] });
const pageField = (r: Resolver) => r.colour("var(--page-base)") ?? WHITE;
const worstGlass = (r: Resolver) => {
  const bloom = r.colour("rgba(var(--rgb-bloom-a), 0.55)");
  const field = bloom ? over(bloom, pageField(r)) : pageField(r);
  const glass = r.colour("var(--glass-fill)");
  return glass ? over(glass, field) : field;
};
const onSolid = (fill: string) => (r: Resolver) => {
  const s = r.colour("var(--surface-solid)") ?? WHITE;
  const f = r.colour(fill);
  return f ? over(f, s) : s;
};

export const PAIRS: ReadonlyArray<PairSpec> = [
  { id: "body-solid", label: "Body text on a card", fg: "var(--ink-body)", on: solid("var(--surface-solid)", "solid surface"), target: 4.5, fix: { token: "--ink-body", side: "fg" } },
  { id: "body-glass", label: "Body text on glass", fg: "var(--ink-body)", on: { label: "worst-case glass", colours: (r) => [worstGlass(r)] }, target: 4.5, fix: { token: "--ink-body", side: "fg" } },
  { id: "muted-glass", label: "Muted text on glass", fg: "var(--ink-muted)", on: { label: "worst-case glass", colours: (r) => [worstGlass(r)] }, target: 4.5, fix: { token: "--ink-muted", side: "fg" } },
  { id: "secondary-glass", label: "Secondary text on glass", fg: "var(--ink-secondary)", on: { label: "worst-case glass", colours: (r) => [worstGlass(r)] }, target: 4.5, fix: { token: "--ink-secondary", side: "fg" } },
  { id: "heading-field", label: "Headings on the page field", fg: "var(--ink-heading)", on: { label: "page base", colours: (r) => [pageField(r)] }, target: 4.5, fix: { token: "--ink-heading", side: "fg" } },
  { id: "links", label: "Links on a card", fg: "var(--ink-brand)", on: solid("var(--surface-solid)", "solid surface"), target: 4.5, fix: { token: "--ink-brand", side: "fg" } },
  { id: "placeholder", label: "Placeholder in a field", fg: "var(--ink-placeholder)", on: solid("var(--input-bg, var(--surface-solid))", "field"), target: 4.5, fix: { token: "--ink-placeholder", side: "fg" } },
  {
    id: "muted-recess",
    label: "Muted text on a grey control",
    fg: "var(--ink-muted)",
    on: { label: "recess on glass", colours: (r) => { const f = r.colour("var(--recess-fill)"); return [f ? over(f, worstGlass(r)) : worstGlass(r)]; } },
    target: 4.5,
    fix: { token: "--ink-muted", side: "fg" },
  },
  { id: "primary-label", label: "Primary button label", fg: "var(--button-primary-ink, var(--ink-inverse))", on: { label: "each brand gradient stop", colours: (r) => r.stops("var(--button-primary-bg, var(--brand-gradient))") }, target: 4.5, fix: { token: "--brand", side: "bg" } },
  { id: "danger-label", label: "Danger button label", fg: "var(--ink-inverse)", on: { label: "each danger gradient stop", colours: (r) => r.stops("var(--button-danger-bg, var(--danger-gradient))") }, target: 4.5, fix: { token: "--danger-base-solid", side: "bg" } },
  { id: "nav-active", label: "Active nav item", fg: "var(--sidebar-active-ink, var(--ink-inverse))", on: { label: "each stop of the active pill", colours: (r) => r.stops("var(--sidebar-active-bg, var(--brand-gradient))") }, target: 4.5, fix: { token: "--brand", side: "bg" } },
  { id: "nav", label: "Sidebar nav text", fg: "var(--sidebar-ink, var(--ink-muted))", on: { label: "sidebar glass", colours: (r) => { const f = r.colour("var(--sidebar-bg, var(--chrome-sidebar))"); return [f ? over(f, pageField(r)) : pageField(r)]; } }, target: 4.5, fix: { token: "--ink-muted", side: "fg" } },
  { id: "table-head", label: "Table header labels", fg: "var(--table-head-ink)", on: { label: "header sweep on glass", colours: (r) => r.stops("var(--table-head-fill)").map((c) => over(c, worstGlass(r))) }, target: 4.5, fix: { token: "--table-head-ink", side: "fg" } },
  { id: "danger-solid", label: "Danger text on a card", fg: "var(--danger-ink)", on: solid("var(--surface-solid)", "solid surface"), target: 4.5, fix: { token: "--danger-ink", side: "fg" } },
  { id: "danger-fill", label: "Danger text on its tint", fg: "var(--danger-ink)", on: { label: "danger tint", colours: (r) => [onSolid("var(--danger-fill)")(r)] }, target: 4.5, fix: { token: "--danger-ink", side: "fg" } },
  { id: "success-fill", label: "Success text on its tint", fg: "var(--success-ink)", on: { label: "success tint", colours: (r) => [onSolid("var(--success-fill)")(r)] }, target: 4.5, fix: { token: "--success-ink", side: "fg" } },
  { id: "warning-fill", label: "Warning text on its tint", fg: "var(--warning-ink)", on: { label: "warning tint", colours: (r) => [onSolid("var(--warning-fill)")(r)] }, target: 4.5, fix: { token: "--warning-ink", side: "fg" } },
  { id: "info-fill", label: "Info text on its tint", fg: "var(--info-ink)", on: { label: "info tint", colours: (r) => [onSolid("var(--info-fill)")(r)] }, target: 4.5, fix: { token: "--info-ink", side: "fg" } },
  { id: "focus", label: "Focus ring on a card", fg: "var(--focus-color)", on: solid("var(--surface-solid)", "solid surface"), target: 3, fix: { token: "--focus-color", side: "fg" } },
  { id: "focus-field", label: "Focus ring on the page", fg: "var(--focus-color)", on: { label: "page base", colours: (r) => [pageField(r)] }, target: 3, fix: { token: "--focus-color", side: "fg" } },
  { id: "control-edge", label: "Checkbox and radio edge", fg: "var(--neutral-border)", on: solid("var(--surface-solid)", "solid surface"), target: 3, fix: { token: "--neutral-border", side: "fg" } },
];

export function measure(r: Resolver): PairResult[] {
  return PAIRS.map((p) => {
    const fg = r.colour(p.fg) ?? { r: 0, g: 0, b: 0, a: 1 };
    const bgs = p.on.colours(r);
    let worst = bgs[0] ?? WHITE;
    let ratio = Infinity;
    for (const bg of bgs) {
      const c = contrast(fg, bg);
      if (c < ratio) {
        ratio = c;
        worst = bg;
      }
    }
    if (!Number.isFinite(ratio)) ratio = contrast(fg, worst);
    return { ...p, fgRgb: fg, bgRgb: worst, ratio, pass: ratio >= p.target };
  });
}

/** The nearest passing colour for the side the pair's fix moves. */
export function fixFor(result: PairResult): Rgb | null {
  return result.fix.side === "fg"
    ? nudgeToContrast(result.fgRgb, result.bgRgb, result.target + 0.05)
    : nudgeToContrast(result.bgRgb, result.fgRgb, result.target + 0.05);
}
