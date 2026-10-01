import { entriesByCategory } from "@/components/ui/_registry";
import { SITE } from "@/lib/site";

// The site map, in one place: the top bar, the docs sidebar, the command
// palette and the previous / next links all read it.

export type NavItem = { href: string; label: string; description?: string };
export type NavSection = { title: string; items: NavItem[] };

export const TOP_NAV: ReadonlyArray<NavItem> = [
  { href: "/docs", label: "Docs", description: "Introduction, installation, theming, dark mode and the AI guide." },
  { href: "/components", label: "Components", description: "Every component, with live examples, API and tokens." },
  { href: "/blocks", label: "Blocks", description: "Whole screens to copy: dashboard, auth, data table, settings." },
  { href: "/charts", label: "Charts", description: "Line, area, bar and donut charts with gliding tooltips." },
  { href: "/themes", label: "Themes", description: "Rime Studio: presets, colours, glass, shape and export." },
  { href: "/colors", label: "Colors", description: "The palette and every colour token, live." },
];

export const DOCS_SECTIONS: ReadonlyArray<NavSection> = [
  {
    title: "Getting started",
    items: [
      { href: "/docs", label: "Introduction" },
      { href: "/docs/installation", label: "Installation" },
      { href: "/docs/theming", label: "Theming" },
      { href: "/docs/dark-mode", label: "Dark mode" },
      { href: "/docs/ai", label: "AI agents" },
      { href: "/docs/shadcn", label: "Coming from shadcn" },
    ],
  },
  {
    title: "Guides",
    items: [
      { href: "/foundations", label: "Foundations" },
      { href: "/colors", label: "Colors" },
      { href: "/patterns", label: "Patterns" },
      { href: "/themes", label: "Rime Studio" },
    ],
  },
];

/** Docs sections plus every component, grouped by category. */
export function sidebarSections(): NavSection[] {
  return [
    ...DOCS_SECTIONS,
    ...entriesByCategory().map(([category, list]) => ({
      title: category,
      items: list.map((e) => ({ href: `/components/${e.slug}`, label: e.name, description: e.summary })),
    })),
  ];
}

/** The reading order for previous / next: the docs pages, then every component. */
export function readingOrder(): NavItem[] {
  return sidebarSections().flatMap((s) => s.items);
}

export function neighbours(href: string): { prev?: NavItem; next?: NavItem } {
  const order = readingOrder().filter((i, idx, all) => all.findIndex((j) => j.href === i.href) === idx);
  const i = order.findIndex((x) => x.href === href);
  if (i < 0) return {};
  return { prev: order[i - 1], next: order[i + 1] };
}

/** Older callers passed area names; map them onto paths. */
export function normaliseCurrent(current: string): string {
  if (current === "overview") return "/docs";
  if (current === "patterns") return "/patterns";
  if (current === "foundations") return "/foundations";
  if (current === "studio") return "/themes";
  if (current.startsWith("component:")) return `/components/${current.slice(10)}`;
  return current;
}

export const GITHUB_URL = `https://github.com/${SITE.owner}/${SITE.repo}`;
