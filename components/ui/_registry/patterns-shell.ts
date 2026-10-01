import type { PatternEntry } from "./types";

// The shell layouts as patterns: one SidebarShell, four frames. Rendered on
// /patterns (previews in app/patterns/shell-previews.tsx) and in the markdown.

export const PATTERNS_SHELL: PatternEntry[] = [
  {
    slug: "shell-sidebar",
    name: "Shell: sidebar expanded",
    summary: "The default signed-in frame: a full-height frosted sidebar and top bar forming one glass L, the logo corner in the same glass.",
    description: [
      "Use it for products with more than five sections, or sections people move between all day. The sidebar holds the primary nav with counts; the top bar names the area and holds search and the profile menu. Only the page scrolls.",
    ],
    uses: ["SidebarShell", "GlassPanel", "PageHeader"],
    code: `<SidebarShell navLabel="Main" nav={NAV} title="Projects" topbarRight={<Avatar name="Jane Cooper" size="sm" />}>
  <PageHeader title="Projects" />
  <GlassPanel padding="lg">…</GlassPanel>
</SidebarShell>`,
    rules: ["One gradient on the chrome: the active nav pill.", "The logo corner is glass unless the brand requires a fill (logoCorner=\"fill\")."],
  },
  {
    slug: "shell-rail",
    name: "Shell: collapsible icon rail",
    summary: "The same frame with a panel button that folds the sidebar to a 68px icon rail, remembered across visits.",
    description: [
      "For dense work screens (tables, boards) where width matters more than labels. The toggle sits at the start of the top bar; storageKey keeps the choice in localStorage, read after mount so the first render matches the server. In the rail each item keeps its title as a tooltip and its count on the icon.",
    ],
    uses: ["SidebarShell"],
    code: `<SidebarShell
  collapsible
  storageKey="app-sidebar-collapsed"
  logoCompact={<Mark />}
  navLabel="Main"
  nav={NAV}
  title="Projects"
>
  …
</SidebarShell>`,
    rules: ["Every nav item needs an icon in a collapsible shell.", "Give the rail a compact mark when the logo is a wide wordmark."],
  },
  {
    slug: "shell-header",
    name: "Shell: header only",
    summary: "No sidebar: the logo, a short horizontal nav and the profile in one frosted top bar, the page below at full width.",
    description: [
      "For products with five or fewer top-level sections and no deep navigation: settings sites, portals, single-purpose tools. The bar is the same chrome glass and shadow as the sidebar frame, so a product can move between the two without a visual seam.",
    ],
    uses: ["SidebarShell"],
    code: `<SidebarShell layout="header" navLabel="Main" nav={NAV} topbarRight={<Avatar name="Jane Cooper" size="sm" />}>
  <PageHeader title="Projects" />
  …
</SidebarShell>`,
    rules: ["Five sections at most in the bar; past that, use the sidebar.", "No title in the bar: the page's own h1 names it."],
  },
  {
    slug: "shell-drawer",
    name: "Shell: mobile drawer",
    summary: "On narrow screens the sidebar becomes an off-canvas drawer from a menu button, with a scrim, a focus hold and Esc to close.",
    description: [
      "Automatic below 900px of the frame's own width (mobileBelow changes it), for the sidebar and rail layouts. The menu button replaces the collapse toggle; opening moves focus into the drawer, the page behind goes inert, and Esc, the scrim or choosing a link closes it and returns focus to the button. mobileDrawer={false} keeps the icon rail instead.",
    ],
    uses: ["SidebarShell"],
    code: `// Nothing to add: narrow frames get the drawer.
<SidebarShell navLabel="Main" nav={NAV} title="Projects">…</SidebarShell>

// Preview it open at desktop width:
<SidebarShell contained forceMobile defaultDrawerOpen navLabel="Main" nav={NAV} title="Projects">…</SidebarShell>`,
    rules: ["The drawer is for narrow frames only, never a desktop pattern.", "Picking a link closes the drawer."],
  },
];
