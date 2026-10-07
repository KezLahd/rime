import { ACTIONS } from "./entries/actions";
import { ADDED_FORMS } from "./entries/added-forms";
import { ADDED_LAYOUT } from "./entries/added-layout";
import { ADDED_OVERLAYS } from "./entries/added-overlays";
import { DATA } from "./entries/data";
import { FEEDBACK } from "./entries/feedback";
import { FORMS } from "./entries/forms";
import { NAVIGATION } from "./entries/navigation";
import { OVERLAYS } from "./entries/overlays";
import { SHELL } from "./entries/shell";
import { SURFACES } from "./entries/surfaces";
import { GENERATED_CSS, GENERATED_PROPS, type GeneratedProp } from "./generated";
import { PATTERNS } from "./patterns";
import { tokenMeta } from "./tokens";
import { CATEGORIES, type Category, type RegistryEntry } from "./types";

export { CATEGORIES, PATTERNS };
export type { Category, RegistryEntry };

export const REGISTRY: ReadonlyArray<RegistryEntry> = [
  ...ACTIONS,
  ...FORMS,
  ...DATA,
  ...NAVIGATION,
  ...FEEDBACK,
  ...OVERLAYS,
  ...SURFACES,
  ...SHELL,
  ...ADDED_FORMS,
  ...ADDED_OVERLAYS,
  ...ADDED_LAYOUT,
];

const BY_SLUG = new Map(REGISTRY.map((e) => [e.slug, e]));

export function entryBySlug(slug: string): RegistryEntry | undefined {
  return BY_SLUG.get(slug);
}

export function entriesByCategory(): Array<[Category, RegistryEntry[]]> {
  // Within each category, components list alphabetically by name — scanning
  // the sidebar for "Checkbox" or "TimeField" should land on the right row
  // without having to read every label. Categories themselves keep their
  // narrative order (Actions, Forms, Data, …) from CATEGORIES.
  return CATEGORIES.map(
    (c) =>
      [
        c,
        REGISTRY.filter((e) => e.category === c).slice().sort((a, b) => a.name.localeCompare(b.name)),
      ] as [Category, RegistryEntry[]],
  ).filter(([, list]) => list.length > 0);
}

export type PropTable = {
  component: string;
  props: Array<GeneratedProp>;
  /** React DOM attribute types it also accepts, e.g. ButtonHTMLAttributes. */
  passThrough: string[];
};

/** The API tables for an entry: generated props with the entry's default overrides applied. */
export function propTables(entry: RegistryEntry): PropTable[] {
  return entry.props
    .map((name) => {
      const gen = GENERATED_PROPS[name];
      if (!gen) return null;
      const overrides = entry.defaults?.[name] ?? {};
      return {
        component: name,
        props: gen.props.map((p) => (overrides[p.name] !== undefined ? { ...p, default: overrides[p.name] } : p)),
        passThrough: gen.passThrough,
      };
    })
    .filter((t): t is PropTable => t !== null);
}

export type TokenRow = {
  name: string;
  /** Per-component tokens: undeclared by default; the fallback is the default. */
  hook: boolean;
  defaults: string[];
  description?: string;
};

/** The custom properties an entry's CSS reads: its own hooks first, then the system tokens. */
export function tokenRows(entry: RegistryEntry): { hooks: TokenRow[]; reads: TokenRow[] } {
  const hooks = new Map<string, TokenRow>();
  const reads = new Map<string, TokenRow>();
  for (const file of entry.css) {
    const gen = GENERATED_CSS[file];
    if (!gen) continue;
    for (const h of gen.hooks) {
      const row = hooks.get(h.name) ?? { name: h.name, hook: true, defaults: [], description: tokenMeta(h.name)?.description };
      for (const f of h.fallbacks) if (!row.defaults.includes(f)) row.defaults.push(f);
      hooks.set(h.name, row);
    }
    for (const r of gen.reads) {
      if (!hooks.has(r)) reads.set(r, { name: r, hook: false, defaults: [], description: tokenMeta(r)?.description });
    }
  }
  const byName = (a: TokenRow, b: TokenRow) => a.name.localeCompare(b.name);
  return { hooks: [...hooks.values()].sort(byName), reads: [...reads.values()].filter((r) => !hooks.has(r.name)).sort(byName) };
}
