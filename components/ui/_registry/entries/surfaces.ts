import type { RegistryEntry } from "../types";

export const SURFACES: RegistryEntry[] = [
  {
    slug: "glass-panel",
    name: "GlassPanel",
    category: "Layout and surfaces",
    summary: "Frosted glass over the page field: page, light and nested variants, padding steps and an optional bloom.",
    description: [
      "GlassPanel is the signature surface: a translucent white fill, a lit edge, a specular top line and a two-layer shadow over the coloured page field. page holds a screen's main content (one or two per screen), light is for screens that are mostly panel, nested is a glass block inside a panel.",
      "It publishes --inner-radius (its radius minus its padding, floored at --r-2xs) so anything flush inside it is concentric. bloom adds a soft corner light for the one place to act; the flat preset turns it off.",
    ],
    importLine: `import { GlassPanel } from "@/components/ui";`,
    usage: `<GlassPanel padding="lg">…</GlassPanel>`,
    props: ["GlassPanel"],
    css: ["components/ui/GlassPanel/GlassPanel.module.css"],
    examples: [{ id: "default", title: "Variants", code: `<GlassPanel>Page</GlassPanel>\n<GlassPanel variant="light">Light</GlassPanel>\n<GlassPanel variant="nested" padding="sm">Nested</GlassPanel>\n<GlassPanel bloom>With bloom</GlassPanel>` }],
    accessibility: ["Glass needs contrast checks on its worst-case background: check every ink in the Studio's Contrast tab, which measures against the glass over the field."],
    dos: ["Use one page panel per job on a screen."],
    donts: ["No bento grids of panels; no left accent bars."],
    depth: "summary",
  },
  {
    slug: "card",
    name: "Card",
    category: "Layout and surfaces",
    summary: "A solid card with a washed header, a lifted highlight tone, and a sunken muted tone.",
    description: [
      "Card is a solid surface for content that should not show the field through it: summaries, forms, record details. default is a solid card with a washed header; highlight lifts the one block that needs action (white, a crisp brand hairline, a soft lift and a faint top rule); muted is a sunken box for secondary information.",
      "It sets data-surface=\"solid\", so secondary buttons inside become white tiles, and publishes --card-pad and --inner-radius to its content.",
      "Two ways to fill it, rendering identically: props (title, description, actions, footer) or shadcn's parts (CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter). With parts, the children render bare and the parts give the structure.",
    ],
    importLine: `import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui";`,
    usage: `<Card title="This month" description="Updated hourly" actions={<Button size="sm" variant="secondary">Export</Button>}>…</Card>`,
    composition: `Card
├── CardHeader
│   ├── CardTitle
│   ├── CardDescription
│   └── CardAction
├── CardContent
└── CardFooter`,
    props: ["Card", "CardHeader", "CardContent", "CardFooter"],
    css: ["components/ui/Card/Card.module.css"],
    examples: [
      { id: "default", title: "Tones", code: `<Card title="Default">…</Card>\n<Card tone="highlight" title="Two invoices are overdue">…</Card>\n<Card tone="muted">Secondary info</Card>` },
      {
        id: "parts",
        title: "Composed from parts",
        description: "The same card written with shadcn's parts; it renders identically to the props form below it.",
        code: `<Card>
  <CardHeader>
    <CardTitle>This month</CardTitle>
    <CardDescription>Updated hourly</CardDescription>
    <CardAction><Button size="sm" variant="secondary">Export</Button></CardAction>
  </CardHeader>
  <CardContent>32 invoices paid</CardContent>
  <CardFooter><Button size="sm">View all</Button></CardFooter>
</Card>

// identical to:
<Card title="This month" description="Updated hourly" actions={…} footer={…}>32 invoices paid</Card>`,
      },
    ],
    accessibility: ["The title renders as h3 by default; set headingLevel to fit the page outline."],
    dos: ["Use highlight once per screen at most."],
    donts: ["Don't tint a card to make it stand out; lift it (tone=\"highlight\")."],
    depth: "summary",
  },
  {
    slug: "scroll-area",
    name: "ScrollArea, useScrollEdges and useScrollLock",
    category: "Layout and surfaces",
    summary: "The modal's scroll, made portable: thin tinted scrollbars, contained overscroll, edge shadows and a shared scroll lock.",
    description: [
      "ScrollArea wraps any scrolling region (a long list in a panel, long terms, a wide table with axis=\"x\") and gives it the modal's scroll: thin native scrollbars in a brand tint (--scrollbar-thumb, --scrollbar-track, --scrollbar-width), overscroll-behavior: contain, and edge shadows that appear only when content has scrolled under the start edge or continues past the end (--scroll-edge-top, --scroll-edge-bottom, and -left/-right for x).",
      "useScrollEdges(ref, { target, axis }) is the engine on its own: a passive scroll listener plus a ResizeObserver that toggle data-scrolled and data-more on the scroller (or a target such as a modal panel) without re-rendering React. Use it when your header and footer are siblings of the scroller and should cast the shadows themselves, as Modal does.",
      "themedScrollClass is just the scrollbar and overscroll half, for a scroller you already have. useScrollLock() locks page scroll with a shared counter (nested overlays nest) and pays the scrollbar's width back as padding so nothing shifts.",
    ],
    importLine: `import { ScrollArea, themedScrollClass, useScrollEdges, useScrollLock } from "@/components/ui";`,
    usage: `<ScrollArea maxHeight={320} label="Workspace terms">
  {terms}
</ScrollArea>`,
    props: ["ScrollArea"],
    css: ["components/ui/Scroll/Scroll.module.css"],
    examples: [
      { id: "default", title: "Vertical", description: "Scroll it: the top shade arrives once you leave the start; the bottom shade leaves at the end.", code: `<ScrollArea maxHeight={240} label="Activity">…</ScrollArea>` },
      { id: "x", title: "Horizontal (a wide table)", code: `<ScrollArea axis="x" label="Sprints">\n  <Table … />\n</ScrollArea>` },
      {
        id: "hook",
        title: "The hook on your own scroller",
        code: `const bodyRef = useRef<HTMLDivElement>(null);
const panelRef = useRef<HTMLDivElement>(null);
useScrollEdges(bodyRef, { target: panelRef });

// CSS: .panel[data-scrolled] .header { box-shadow: var(--scroll-edge-top); }
//      .panel[data-more] .footer { box-shadow: var(--scroll-edge-bottom); }`,
      },
    ],
    accessibility: [
      "Pass label to make the region focusable (tabIndex 0) and named, so keyboard users can scroll it; skip it when the content already holds focusable items.",
      "Native scrollbars stay: they keep platform behaviour (overlay scrollbars on macOS, high contrast in forced-colors).",
    ],
    dos: ["Use it for any region that scrolls inside the page."],
    donts: ["Don't build a JavaScript scrollbar.", "Don't nest two vertical scrollers."],
    related: ["modal"],
    depth: "full",
    layout: "block",
  },
  {
    slug: "divider",
    name: "Divider",
    category: "Layout and surfaces",
    summary: "A hairline rule, horizontal or vertical, optionally labelled, with spacing steps.",
    description: ["Divider separates groups inside a panel. label puts a short word in the rule (\"or\")."],
    importLine: `import { Divider } from "@/components/ui";`,
    usage: `<Divider spacing="sm" />`,
    props: ["Divider"],
    css: ["components/ui/Divider/Divider.module.css"],
    examples: [{ id: "default", title: "Default and labelled", code: `<Divider />\n<Divider label="or" />` }],
    accessibility: ["role=\"separator\" with aria-orientation; decorative rules inside lists are hidden."],
    dos: ["Prefer space over rules where space does the job."],
    donts: ["Don't stack dividers and borders on the same edge."],
    depth: "summary",
  },
];
