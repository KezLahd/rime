import type { RegistryEntry } from "../types";

// Components added to match the shadcn/ui set (layout, navigation and data).

export const ADDED_LAYOUT: RegistryEntry[] = [
  {
    slug: "accordion",
    name: "Accordion",
    category: "Layout and surfaces",
    summary: "Stacked sections that open and close in place: one at a time or several, on glass or plain hairlines.",
    description: [
      "Accordion holds a list of questions, settings groups or details where people read one section at a time. type=\"single\" keeps one section open (collapsible lets the open one close again); type=\"multiple\" lets any number stay open.",
      "Each header is a real heading (headingLevel, default h3) holding a button, so the page outline stays right. The panel animates its height with a grid-row transition, with no measuring, and reduced motion makes it instant. Closed panels are inert, so their links leave the tab order.",
      "appearance=\"glass\" is a frosted panel with hairlines between sections; \"plain\" is hairlines only, for use inside a Card or GlassPanel that already provides the surface.",
    ],
    importLine: `import { Accordion } from "@/components/ui";`,
    usage: `<Accordion
  defaultValue={["billing"]}
  items={[
    { id: "billing", title: "When is an invoice issued?", content: "On the first working day of each month." },
    { id: "seats", title: "Can I add a team member mid-cycle?", content: "Yes, from the day it is added." },
  ]}
/>`,
    props: ["Accordion"],
    css: ["components/ui/Accordion/Accordion.module.css"],
    examples: [
      { id: "default", title: "Single, one open", code: `<Accordion items={FAQ} defaultValue={["billing"]} />` },
      {
        id: "multiple",
        title: "Multiple open",
        description: "type=\"multiple\": opening one section leaves the others as they are.",
        code: `<Accordion type="multiple" items={FAQ} defaultValue={["billing", "seats"]} />`,
      },
      {
        id: "plain",
        title: "Plain, inside a surface",
        code: `<Card title="Help">\n  <Accordion appearance="plain" items={FAQ} />\n</Card>`,
      },
    ],
    accessibility: [
      "WAI-ARIA accordion: each trigger is a <button> inside a heading, with aria-expanded and aria-controls; each panel is a region labelled by its trigger.",
      "Up and Down move focus between headers, Home and End jump to the first and last; Enter and Space toggle.",
      "Closed panels are inert, so nothing hidden can take focus.",
      "Focus shows as a 2px accent outline inset in the row.",
    ],
    dos: [
      "Write titles as the question or the name of the group, so a closed list scans.",
      "Open the most useful section by default with defaultValue.",
    ],
    donts: [
      "Don't hide required form fields in a closed section.",
      "Don't nest accordions; use headings and a longer page instead.",
    ],
    related: ["collapsible", "card"],
    depth: "full",
  },
  {
    slug: "collapsible",
    name: "Collapsible",
    category: "Layout and surfaces",
    summary: "One disclosure: a title row with a toggle, an always-visible summary and a region that opens beneath it.",
    description: [
      "Collapsible shows the first part of something and keeps the rest a click away: the first of several items, advanced options, a long note. The summary stays visible whether open or closed; children open beneath it.",
      "The region animates its height on a grid-row transition and is inert while closed. Control it with open and onOpenChange, or leave it uncontrolled with defaultOpen.",
    ],
    importLine: `import { Collapsible } from "@/components/ui";`,
    usage: `<Collapsible title="Jane Cooper starred 3 projects" summary={<Row>north-office/website</Row>}>
  <Row>north-office/brand-refresh</Row>
  <Row>north-office/quarterly-report</Row>
</Collapsible>`,
    props: ["Collapsible"],
    css: ["components/ui/Collapsible/Collapsible.module.css"],
    examples: [
      {
        id: "default",
        title: "Open, with a summary",
        code: `<Collapsible title="Jane Cooper starred 3 projects" summary={<Row>north-office/website</Row>} defaultOpen>\n  …\n</Collapsible>`,
      },
    ],
    accessibility: [
      "The toggle is a button with aria-expanded and aria-controls pointing at the region; its name switches between \"Show more\" and \"Show less\" unless toggleLabel is given.",
      "The closed region is inert, so its content is out of the tab order and the accessibility tree.",
    ],
    dos: ["Use it for one disclosure; use Accordion for a list of them."],
    donts: ["Don't put the only copy of an error or a required field inside a closed Collapsible."],
    related: ["accordion"],
    depth: "summary",
  },
  {
    slug: "breadcrumb",
    name: "Breadcrumb",
    category: "Navigation",
    summary: "Where this page sits: a trail of links ending on the current page, folding its middle into a menu when long.",
    description: [
      "Breadcrumb is a nav landmark holding an ordered list of links. The last item is the current page: not a link, marked aria-current=\"page\", in heading ink. Items may carry an icon (a home glyph on the first).",
      "Past maxItems (default 4) the middle folds into an ellipsis Menu: the first item, the menu, then the last items, so the trail stays on one line. separator swaps the chevron for any node, \"/\" being the common alternative.",
    ],
    importLine: `import { Breadcrumb } from "@/components/ui";`,
    usage: `<Breadcrumb
  items={[
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
    { label: "Website relaunch" },
  ]}
/>`,
    props: ["Breadcrumb"],
    css: ["components/ui/Breadcrumb/Breadcrumb.module.css"],
    examples: [
      { id: "default", title: "Default", code: `<Breadcrumb items={[{ label: "Home", href: "/", icon: <IconHome size={14} /> }, { label: "Projects", href: "/projects" }, { label: "Website relaunch" }]} />` },
      {
        id: "collapsed",
        title: "Long trail, folded",
        description: "Six items with maxItems={4}: the middle three sit in the ellipsis menu.",
        code: `<Breadcrumb maxItems={4} items={TRAIL} />`,
      },
      { id: "slash", title: "Slash separator", code: `<Breadcrumb separator="/" items={[{ label: "Settings", href: "/settings" }, { label: "Team", href: "/settings/team" }, { label: "Members" }]} />` },
    ],
    accessibility: [
      "A <nav aria-label=\"Breadcrumb\"> wrapping an <ol>, so the count and order are announced.",
      "The current page is aria-current=\"page\" and not a link; separators are hidden from assistive tech.",
      "The ellipsis is a Menu button named \"Show n more\" with keyboard support of its own.",
    ],
    dos: ["Start from the section root, not from the site name, when the shell already shows the site."],
    donts: ["Don't use a breadcrumb as the only navigation.", "Don't link the current page to itself."],
    related: ["navigation-menu", "page-header"],
    depth: "full",
  },
  {
    slug: "navigation-menu",
    name: "NavigationMenu",
    category: "Navigation",
    summary: "Top-level site navigation with frosted dropdown panels of described links, built as disclosure navigation.",
    description: [
      "NavigationMenu is the marketing-site or docs header: a row of top-level items, each either a plain link or a button that opens a panel of links with a title, a description and an optional icon. A panel can lead with a feature block (a highlighted card) and lays its links in one to three columns.",
      "It follows the WAI-ARIA disclosure navigation pattern, not role=\"menu\": these are links, read as links. Clicking outside, tabbing out or pressing Esc closes the open panel.",
      "inline renders the panel in normal flow beneath the bar instead of floating over the page, for docs and previews where it has to show open. defaultValue opens a panel on first render.",
    ],
    importLine: `import { NavigationMenu } from "@/components/ui";`,
    usage: `<NavigationMenu
  aria-label="Main"
  items={[
    { id: "product", label: "Product", links: [{ href: "/projects", title: "Projects", description: "Plan work and track every order." }] },
    { id: "pricing", label: "Pricing", href: "/pricing" },
  ]}
/>`,
    props: ["NavigationMenu"],
    css: ["components/ui/NavigationMenu/NavigationMenu.module.css"],
    examples: [
      {
        id: "default",
        title: "Open panel with a feature block",
        description: "Rendered inline and open, so the panel shows in place.",
        code: `<NavigationMenu aria-label="Main" items={NAV} inline defaultValue="product" />`,
      },
      { id: "floating", title: "Floating panels", description: "The default: panels float over the page under their item.", code: `<NavigationMenu aria-label="Site" items={NAV} />` },
    ],
    accessibility: [
      "Each dropdown trigger is a button with aria-expanded and aria-controls; panels hold ordinary links.",
      "Left and Right move between top-level items; Down opens a panel and focuses its first link; Up and Down move through links; Esc closes and returns focus to the trigger.",
      "activeHref marks the current page's link with aria-current=\"page\".",
    ],
    dos: ["Keep to five or six top-level items.", "Give every link a one-line description in panels with more than three links."],
    donts: ["Don't use it inside an app shell; that is SidebarShell's nav.", "Don't put actions (sign out, delete) in its panels; those belong in a Menu."],
    related: ["breadcrumb", "menu", "sidebar-shell"],
    depth: "full",
  },
  {
    slug: "pagination",
    name: "Pagination",
    category: "Navigation",
    summary: "Centred page buttons with previous and next, gaps for long ranges, and a summary line at the left.",
    description: [
      "Pagination is the pager that sits under every Table, documented on its own because it works under any list: cards, search results, an activity feed. The page buttons stay on the centre line whatever the summary's length (a 1fr auto 1fr grid), and long ranges collapse into gaps around the current page.",
      "With totalItems and pageSize it says \"Showing 41 to 60 of 236 orders\"; without, \"Page 3 of 12\". It is presentational: the screen owns the page number.",
    ],
    importLine: `import { Pagination } from "@/components/ui";`,
    usage: `<Pagination page={page} pageCount={12} onPageChange={setPage} totalItems={236} pageSize={20} itemLabel="orders" />`,
    props: ["Pagination"],
    css: ["components/ui/Table/Table.module.css"],
    examples: [
      { id: "default", title: "With a summary", code: `<Pagination page={page} pageCount={12} onPageChange={setPage} totalItems={236} pageSize={20} itemLabel="orders" />` },
      { id: "pages-only", title: "Pages only", code: `<Pagination page={page} pageCount={5} onPageChange={setPage} />` },
    ],
    accessibility: [
      "A nav labelled \"Pagination\"; the current page button has aria-current=\"page\"; every button is named \"Page n\".",
      "Previous and next disable at the ends rather than disappearing, so the layout never jumps.",
      "The summary is a polite live region, so a page change is announced.",
    ],
    dos: ["Reset to page one when a filter or sort changes.", "Keep it centred under the list it pages."],
    donts: ["Don't left-align the page buttons.", "Don't use infinite scroll for records people need to find again."],
    related: ["table", "filter-bar"],
    layout: "block",
    depth: "full",
  },
  {
    slug: "carousel",
    name: "Carousel",
    category: "Layout and surfaces",
    summary: "A row of slides on a native scroll-snap track, with frosted prev and next buttons, dots and arrow keys.",
    description: [
      "Carousel lays its children out as slides on a scroll-snap track, so swipe, trackpad and the keyboard all scroll the same native element with no dependency. perView shows several at once on wide screens (one on phones); the buttons fade out at the ends unless loop is on.",
      "autoplay (off by default) advances on a timer, stops while the pointer or focus is inside and has its own pause button, as WCAG 2.2.2 requires. Reduced motion scrolls instantly.",
    ],
    importLine: `import { Carousel } from "@/components/ui";`,
    usage: `<Carousel aria-label="Featured projects" perView={3}>
  {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
</Carousel>`,
    props: ["Carousel"],
    css: ["components/ui/Carousel/Carousel.module.css"],
    examples: [
      { id: "default", title: "One per view", code: `<Carousel aria-label="Projects">{slides}</Carousel>` },
      { id: "multiple", title: "Three per view", code: `<Carousel aria-label="Projects" perView={3}>{slides}</Carousel>` },
    ],
    accessibility: [
      "A section with aria-roledescription=\"carousel\" and a required aria-label; each slide is a group with aria-roledescription=\"slide\" labelled \"2 of 5\".",
      "Left and Right arrows move a slide; the track is focusable; off-screen slides are inert so Tab never lands on a hidden card.",
      "The track is a polite live region while not autoplaying, so a change of slide is announced.",
    ],
    dos: ["Use it for browsable, optional content: featured items, screenshots.", "Show a partial next slide (perView 3 at narrower widths) so people see there is more."],
    donts: ["Don't put the only copy of important information on slide two or later.", "Don't turn autoplay on for content people need to read."],
    related: ["aspect-ratio", "card"],
    layout: "block",
    depth: "full",
  },
  {
    slug: "aspect-ratio",
    name: "AspectRatio",
    category: "Layout and surfaces",
    summary: "A box held to a width-to-height ratio, so media keeps its shape and never shifts the layout while loading.",
    description: [
      "AspectRatio sizes itself from its width and a ratio (16 / 9 by default) with the CSS aspect-ratio property. A direct <img>, <video>, <iframe> or <picture> child fills it with object-fit: cover. framed (on by default) clips it to the inner radius on a sunken fill with a hairline, so an empty or loading box still reads as a frame.",
    ],
    importLine: `import { AspectRatio } from "@/components/ui";`,
    usage: `<AspectRatio ratio={16 / 9}>
  <img src="/cover.jpg" alt="The new office, from the street" />
</AspectRatio>`,
    props: ["AspectRatio"],
    css: ["components/ui/AspectRatio/AspectRatio.module.css"],
    examples: [
      { id: "default", title: "16 / 9", code: `<AspectRatio ratio={16 / 9}>…</AspectRatio>` },
      { id: "square", title: "Square and 4 / 3", code: `<AspectRatio ratio={1}>…</AspectRatio>\n<AspectRatio ratio={4 / 3}>…</AspectRatio>` },
    ],
    accessibility: ["A plain box with no role; give the media inside it its own alt text or captions."],
    dos: ["Use it for every image whose size is not known ahead, so nothing jumps when it loads."],
    donts: ["Don't crop faces or text with cover; pick a ratio that suits the media."],
    related: ["carousel"],
    depth: "summary",
  },
  {
    slug: "resizable",
    name: "Resizable",
    category: "Layout and surfaces",
    summary: "Panels split by draggable hairline handles, side by side or stacked, with keyboard resizing and minimum sizes.",
    description: [
      "ResizablePanelGroup holds ResizablePanel and ResizableHandle children, alternating. Sizes are percentages applied as flex-grow proportions, so handles keep their pixel width and nothing overflows. Each panel can set defaultSize and minSize; onLayout reports every size after a change, for saving the split.",
      "Drag a handle with the pointer, or focus it and use the arrow keys (5%, Shift for 10%) and Home or End. withGrip draws a small grip on the rule. framed (default) puts the group on a glass panel.",
    ],
    importLine: `import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui";`,
    usage: `<ResizablePanelGroup height={320}>
  <ResizablePanel defaultSize={30} minSize={20}>Projects</ResizablePanel>
  <ResizableHandle withGrip />
  <ResizablePanel>Details</ResizablePanel>
</ResizablePanelGroup>`,
    props: ["ResizablePanelGroup", "ResizablePanel", "ResizableHandle"],
    css: ["components/ui/Resizable/Resizable.module.css"],
    examples: [
      {
        id: "default",
        title: "Three panels",
        description: "Drag a handle, or focus it and use the arrow keys.",
        code: `<ResizablePanelGroup height={240}>
  <ResizablePanel defaultSize={25} minSize={15}>Projects</ResizablePanel>
  <ResizableHandle withGrip />
  <ResizablePanel defaultSize={50}>Invoice INV-004213</ResizablePanel>
  <ResizableHandle withGrip />
  <ResizablePanel defaultSize={25} minSize={15}>Details</ResizablePanel>
</ResizablePanelGroup>`,
      },
      { id: "vertical", title: "Vertical", code: `<ResizablePanelGroup direction="vertical" height={280}>…</ResizablePanelGroup>` },
    ],
    accessibility: [
      "Each handle is a focusable role=\"separator\" with aria-valuenow (the size of the panel before it), aria-valuemin, aria-valuemax and aria-controls; aria-orientation is perpendicular to the group.",
      "Arrow keys resize in 5% steps (10% with Shift); Home and End jump to the limits.",
      "Give each handle an aria-label that says what it resizes when there is more than one.",
    ],
    dos: ["Set minSize so no panel can be dragged shut by accident.", "Save the split from onLayout so it survives a reload."],
    donts: ["Don't use it for layouts people never need to change; fixed columns are simpler."],
    layout: "block",
    depth: "summary",
  },
  {
    slug: "chart",
    name: "Chart",
    category: "Data display",
    summary: "Themed charts on Recharts: line, area, bar and donut in one frame with a table view, plus sparklines and a stat strip.",
    description: [
      "The chart layer lives in components/charts. Every chart mounts in ChartFrame: a caption, a legend, the plot and a Chart or Table toggle whose table is the same data for anyone who cannot read the picture. Loading, refreshing, empty and error states are built in (status).",
      "Charts carry no hex. Every mark reads a custom property (--chart-1 to --chart-6, --chart-seq-*, --chart-good and friends) declared in tokens.css, and chart chrome (grid, axes, ticks) derives from the global tokens, so a preset, dark mode or a Rime Studio theme re-themes them with no client code. Tooltips glide between points (TOOLTIP_MOTION: Recharts' 400ms ease, off under reduced motion) and use the compact shadcn layout on the popover glass, with dot, line or dashed indicators.",
      "The high-level charts take series (Rime's list) or config (a shadcn ChartConfig), and expose --color-<key> per series on the root. For anything custom, the shadcn-compatible primitives are here too: ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent and type ChartConfig. A shadcn chart example works with its Tailwind classes removed and ChartContainer given a height. The full gallery, with every tooltip variant, is at /charts.",
      "Series take their colour in a fixed order (the colour-blind safety mechanism): never re-rank on filter, and past six series fold the rest into \"Other\" (foldSeries). summary is required: one or two sentences a screen reader hears in place of the plot.",
      "StatStrip is the summary-card pattern for figures: one surface, hairline cells, each with a value, a delta in words and an optional Sparkline.",
    ],
    importLine: `import { AreaChart, BarChart, ChartContainer, ChartTooltip, ChartTooltipContent, DonutChart, LineChart, Sparkline, StatStrip, type ChartConfig } from "@/components/charts";`,
    usage: `<LineChart
  title="Orders per month"
  summary="Online orders rose from 182 in January to 344 in August."
  data={rows}
  x="month"
  series={[{ key: "online", label: "Online" }]}
/>`,
    props: ["TrendChart", "AreaChart", "BarChart", "DonutChart", "StatStrip", "Sparkline", "ChartContainer", "ChartTooltipContent", "ChartLegendContent"],
    css: ["components/charts/Charts.module.css", "components/charts/ChartPrimitives.module.css"],
    examples: [
      {
        id: "area",
        title: "Area, two series",
        code: `<AreaChart
  title="Orders per month"
  summary="Online orders rose every month, from 182 to 344."
  data={ORDERS}
  x="month"
  series={[{ key: "online", label: "Online" }, { key: "retail", label: "Retail" }]}
  formatX={formatMonthTick}
  formatXLong={formatMonth}
/>`,
      },
      {
        id: "line",
        title: "Line with a reference",
        code: `<LineChart title="Online orders" summary="…" data={ORDERS} x="month" series={[{ key: "online", label: "Online" }]} reference={{ value: 300, label: "Target" }} />`,
      },
      {
        id: "bar",
        title: "Bars, labelled",
        code: `<BarChart title="Revenue by region" summary="North leads with 48,200." data={REVENUE} category="region" series={[{ key: "revenue", label: "Revenue" }]} orientation="bars" valueLabels />`,
      },
      {
        id: "donut",
        title: "Donut",
        code: `<DonutChart title="Projects by status" summary="Of 40 projects, 22 are on track." centreLabel="Projects" data={STATUS_SPLIT} />`,
      },
      {
        id: "stats",
        title: "Stat strip with sparklines",
        code: `<StatStrip aria-label="This month" stats={[{ label: "Orders", value: 505, delta: { value: 32, period: "vs last month" }, trend: [302, 323, 362, 375, 416, 453, 471, 505] }]} />`,
      },
      {
        id: "primitives",
        title: "The shadcn primitives",
        description: "ChartContainer with a ChartConfig, Recharts marks reading var(--color-<key>), and ChartTooltipContent. See /charts for every tooltip variant.",
        code: `const chartConfig = {
  online: { label: "Online", color: "var(--chart-1)" },
  retail: { label: "Retail", color: "var(--chart-3)" },
} satisfies ChartConfig;

<ChartContainer config={chartConfig} style={{ aspectRatio: "auto", height: 220 }}>
  <BarChart accessibilityLayer data={rows}>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="month" tickLine={false} axisLine={false} />
    <ChartTooltip {...TOOLTIP_MOTION} content={<ChartTooltipContent indicator="dot" />} />
    <Bar dataKey="online" fill="var(--color-online)" radius={4} />
    <Bar dataKey="retail" fill="var(--color-retail)" radius={4} />
  </BarChart>
</ChartContainer>`,
      },
    ],
    accessibility: [
      "Every chart is a <figure> labelled by its title and described by summary, which is also the SVG's <desc>.",
      "The Chart or Table toggle shows the same data as a real table with a caption, for screen readers and for anyone comparing values.",
      "Colour is never the only key: legends name each series, end labels sit on lines, status hues always come with a label.",
      "The categorical order is the colour-blind safety mechanism; keep it.",
    ],
    dos: [
      "Write summary as the headline: what changed and by how much.",
      "Use StatStrip for headline figures: one surface, hairline cells, never a grid of separate cards.",
      "Pass status=\"loading\" while data loads so the skeleton matches the chart's shape.",
    ],
    donts: [
      "Don't hard-code a hex on a mark; set --chart-* tokens instead.",
      "Don't use more than six series; fold the rest into Other.",
      "Don't use status colours (good, warning, danger) as series identity.",
    ],
    related: ["meter", "table"],
    layout: "block",
    depth: "full",
  },
];
