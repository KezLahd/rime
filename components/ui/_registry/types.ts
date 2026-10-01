// The component registry: one entry per documented component, and the single
// source the docs pages, the Rime Studio's per-component panel and the
// AI-readable markdown (/llms.txt, docs/ui/*.md) are all rendered from.
//
// Facts that live in the source code (props, defaults, the CSS custom
// properties a module reads) are NOT written here: they come from
// generated.ts (scripts/gen-ui-registry.mjs). An entry holds only what a
// person has to say: what the component is for, how to use it, the rules.
// Pure data, no JSX, so the markdown routes can import it on the server.

export type Category =
  | "Actions"
  | "Forms"
  | "Data display"
  | "Navigation"
  | "Feedback"
  | "Overlays"
  | "Layout and surfaces"
  | "Shell";

export const CATEGORIES: ReadonlyArray<Category> = [
  "Actions",
  "Forms",
  "Data display",
  "Navigation",
  "Feedback",
  "Overlays",
  "Layout and surfaces",
  "Shell",
];

export type RegistryExample = {
  /** Matches a render function in app/ui/_previews. */
  id: string;
  title: string;
  description?: string;
  /** The snippet shown in the code tab. Kept small enough to read. */
  code: string;
};

export type RegistryEntry = {
  slug: string;
  name: string;
  category: Category;
  /** One line, for the index and llms.txt. */
  summary: string;
  /** What it is for and how it behaves. Plain paragraphs. */
  description: string[];
  /** The import line, from the barrel. */
  importLine: string;
  /** The smallest useful snippet. */
  usage: string;
  /** For compound components: the part tree, as shadcn's Composition section. */
  composition?: string;
  /**
   * Keys into GENERATED_PROPS ("Button", "Pagination"). The first is the
   * component itself; any others are its companions.
   */
  props: string[];
  /** Defaults the generator cannot see (set in a helper, not the signature). */
  defaults?: Record<string, Record<string, string>>;
  /** CSS Modules it is drawn by, keys into GENERATED_CSS. */
  css: string[];
  examples: RegistryExample[];
  accessibility: string[];
  dos: string[];
  donts: string[];
  related?: string[];
  /**
   * full = every section written out; summary = documented, examples still
   * to come.
   */
  depth: "full" | "summary";
  /**
   * block = the specimen fills the width it is given (tables, shells,
   * carousels): the example stage stretches it edge to edge, and the overview
   * thumbnail lays it out on a 720px canvas before scaling it to fit.
   * Omitted = the specimen has its own natural width and is centred.
   */
  layout?: "block";
};

/** A composed pattern: several components with one job (the list page). */
export type PatternEntry = {
  slug: string;
  name: string;
  summary: string;
  description: string[];
  uses: string[];
  code: string;
  rules: string[];
};
