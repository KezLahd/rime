import type { RegistryEntry } from "../types";

export const DATA: RegistryEntry[] = [
  {
    slug: "table",
    name: "Table",
    category: "Data display",
    summary: "The one table look: neutral header row, whole-cell sortable headers, skeleton, empty and error states, and Pagination.",
    description: [
      "Table is presentational: you own the rows, the sort state and the page, and it draws them. Columns declare a header, a cell renderer, alignment, width, a monospace flag for references, a skeleton width for loading, and hideBelow to drop a column on narrow screens.",
      "A sortable header is the whole cell, edge to edge: the button fills the th, so hover, press and focus light the full cell over the neutral sweep, never a pill inside it. The sort chevron always holds its slot, so labels never shift when sorting.",
      "Every state is built in: loading draws skeleton rows matching the columns; empty renders whatever you pass (an EmptyState compact that says what to do next); error replaces the body (an Alert with a retry). Pagination sits centred under the table with a summary line.",
      "Two appearances: glass (rows fall through to the frosted panel, the default inside a GlassPanel) and white (an inset solid table for dense lists). Both share one header look, set by --table-* tokens.",
    ],
    importLine: `import { Pagination, Table, type Column, type SortState } from "@/components/ui";`,
    usage: `const columns: Column<Invoice>[] = [
  { key: "ref", header: "Invoice", cell: (i) => i.reference, mono: true },
  { key: "customer", header: "Customer", sortable: true, cell: (i) => i.customer },
];

<Table caption="Invoices" columns={columns} rows={rows} rowKey={(i) => i.id} sort={sort} onSortChange={setSort} />
<Pagination page={page} pageCount={pageCount} onPageChange={setPage} totalItems={total} pageSize={20} itemLabel="invoices" />`,
    props: ["Table", "Pagination"],
    css: ["components/ui/Table/Table.module.css"],
    examples: [
      {
        id: "default",
        title: "Sortable, with pagination",
        code: `<Table caption="Invoices" columns={columns} rows={pageRows} rowKey={(i) => i.id} sort={sort} onSortChange={setSort} />
<Pagination page={page} pageCount={3} onPageChange={setPage} totalItems={11} pageSize={4} itemLabel="invoices" />`,
      },
      {
        id: "states",
        title: "Loading, empty and error",
        description: "Switch the state to see each. Empty tells the user what to do next.",
        code: `<Table … loading />
<Table … rows={[]} empty={<EmptyState compact tone="filtered" title="No invoices match" description="Clear a filter to see more." />} />
<Table … error={<Alert tone="danger" title="Couldn't load invoices" action={<Button size="sm" variant="secondary" onClick={retry}>Try again</Button>} />} />`,
      },
      { id: "white", title: "White appearance", code: `<Table appearance="white" caption="Invoices" columns={columns} rows={rows} rowKey={(r) => r.id} />` },
    ],
    accessibility: [
      "caption is required and rendered as a visually hidden <caption>: a table needs a name.",
      "Sortable headers are buttons inside the th with aria-sort on the th; the first press sorts ascending, then toggles.",
      "Rows are not clickable. Put a link (or a ghost Button with href) in the identifying cell, so keyboard and screen-reader users reach it.",
      "Pagination is a nav labelled \"Pagination\", the current page is aria-current=\"page\", and prev/next disable at the ends.",
    ],
    dos: [
      "Put the table, its FilterBar and its Pagination in one GlassPanel: that is the list page pattern.",
      "Right-align numbers and actions (align=\"right\").",
      "Give every empty state a next step.",
    ],
    donts: [
      "Never invent another table look; theme --table-* tokens instead.",
      "Don't uppercase column headers; sentence case only.",
      "Don't put a title or an \"n of m shown\" line above the table.",
    ],
    related: ["filter-bar", "empty-state", "glass-panel"],
    depth: "full",
    layout: "block",
  },
  {
    slug: "status-pill",
    name: "StatusPill, Badge and CountBadge",
    category: "Data display",
    summary: "Status pills (tinted fill, tinted edge, deep ink), small uppercase tags, and count badges.",
    description: [
      "StatusPill names a record's state in a list or header. Badge is a small uppercase tag (soft or solid) for categories and flags. CountBadge is a number of things waiting, capped at max (99+).",
      "Tones: neutral, info, success, warning, danger and deep (the brand). Every tone's ink clears 4.5:1 on its own fill over worst-case glass.",
    ],
    importLine: `import { Badge, CountBadge, StatusPill } from "@/components/ui";`,
    usage: `<StatusPill tone="success">Paid</StatusPill>`,
    props: ["StatusPill", "Badge", "CountBadge"],
    css: ["components/ui/Badge/Badge.module.css"],
    examples: [
      {
        id: "default",
        title: "Tones",
        code: `<StatusPill tone="neutral">Draft</StatusPill>
<StatusPill tone="info">Sent</StatusPill>
<StatusPill tone="warning" dot>Overdue</StatusPill>
<StatusPill tone="success">Paid</StatusPill>
<StatusPill tone="danger">Void</StatusPill>
<Badge tone="brand" variant="solid">New</Badge>
<CountBadge count={4} label="4 waiting" />`,
      },
      {
        id: "aliases",
        title: "shadcn badge variants",
        description: "Badge accepts shadcn's variant names: default (solid accent), secondary (soft neutral), destructive (solid danger) and outline (a hairline, no fill). asChild renders a link with the badge's look.",
        code: `<Badge variant="default">New</Badge>
<Badge variant="secondary">Draft</Badge>
<Badge variant="destructive">Overdue</Badge>
<Badge variant="outline">Beta</Badge>
<Badge variant="outline" asChild><a href="#changelog">Changelog</a></Badge>`,
      },
    ],
    accessibility: ["Colour is never the only signal: the label always says the state.", "CountBadge takes a label for screen readers (\"4 waiting\")."],
    dos: ["Map each status to one tone in one place and reuse it."],
    donts: ["Don't make a pill clickable; it is a label."],
    depth: "summary",
  },
  {
    slug: "avatar",
    name: "Avatar",
    category: "Data display",
    summary: "Initials on the brand gradient or a neutral disc, in three sizes.",
    description: ["Avatar shows initials, from name or given, on the brand gradient (the signed-in person) or a neutral disc (a record)."],
    importLine: `import { Avatar } from "@/components/ui";`,
    usage: `<Avatar name="Jane Cooper" />`,
    props: ["Avatar"],
    css: ["components/ui/Avatar/Avatar.module.css"],
    examples: [{ id: "default", title: "Sizes and tones", code: `<Avatar name="Jane Cooper" size="sm" />\n<Avatar name="Wade Warren" />\n<Avatar name="Esther Howard" size="lg" tone="neutral" />` }],
    accessibility: ["Decorative by default; pass label when it is the only name on screen."],
    dos: ["Pair it with the person's name in text."],
    donts: ["Don't use it as a button on its own."],
    depth: "summary",
  },
  {
    slug: "meter",
    name: "Meter and ProgressBar",
    category: "Data display",
    summary: "A segmented meter for small counts (seats used) and a bar for progress through a total.",
    description: ["Meter draws one segment per unit up to max (default 5). ProgressBar is a continuous bar for larger totals. Both announce value text."],
    importLine: `import { Meter, ProgressBar } from "@/components/ui";`,
    usage: `<Meter label="Seats" value={3} max={5} valueText="3 of 5 used" />`,
    props: ["Meter", "ProgressBar"],
    css: ["components/ui/Meter/Meter.module.css"],
    examples: [{ id: "default", title: "Default", code: `<Meter label="Seats" value={3} max={5} />\n<ProgressBar label="Quarterly target" value={240} max={400} />` }],
    accessibility: ["role=\"meter\" / role=\"progressbar\" with aria-valuenow, -min, -max and aria-valuetext."],
    dos: ["Write valueText in words people use: \"3 of 5 seats used\"."],
    donts: ["Don't use a meter for a task that is in progress over time; that is a Spinner or a toast."],
    depth: "summary",
  },
  {
    slug: "progress-steps",
    name: "ProgressSteps",
    category: "Data display",
    summary: "A horizontal track of steps with detail and meta lines, or a compact dot track for table cells.",
    description: ["ProgressSteps shows where something is in a fixed sequence (a shipment: packed, shipped, delivered). compact fits a table cell."],
    importLine: `import { ProgressSteps } from "@/components/ui";`,
    usage: `<ProgressSteps aria-label="Shipment" steps={[{ label: "Packed", state: "done" }, { label: "Shipped", state: "current" }]} />`,
    props: ["ProgressSteps"],
    css: ["components/ui/ProgressSteps/ProgressSteps.module.css"],
    examples: [{ id: "default", title: "Full and compact", code: `<ProgressSteps steps={steps} aria-label="Shipment" />\n<ProgressSteps compact steps={steps} aria-label="Shipment" />` }],
    accessibility: ["An ordered list; each step's state is in its accessible text, not colour alone."],
    dos: ["Keep labels to one or two words."],
    donts: ["Don't make it interactive; that is Stepper."],
    depth: "summary",
  },
  {
    slug: "stepper",
    name: "Stepper",
    category: "Navigation",
    summary: "The wizard's step list: lettered markers, states, and optional navigation back to finished steps.",
    description: ["Stepper heads a multi-step form. Steps are complete, current, upcoming or error; onStepClick lets people return to a finished step."],
    importLine: `import { Stepper } from "@/components/ui";`,
    usage: `<Stepper aria-label="Checkout" steps={steps} onStepClick={goTo} />`,
    props: ["Stepper"],
    css: ["components/ui/Stepper/Stepper.module.css"],
    examples: [{ id: "default", title: "Default", code: `<Stepper steps={steps} aria-label="Checkout" />` }],
    accessibility: ["The current step carries aria-current=\"step\"."],
    dos: ["Let people go back to any finished step."],
    donts: ["Don't let people jump ahead past an unfinished step."],
    depth: "summary",
    layout: "block",
  },
  {
    slug: "skeleton",
    name: "Skeleton",
    category: "Feedback",
    summary: "Loading placeholders shaped like the content they stand in for, with a soft shimmer.",
    description: ["Skeleton draws a block, a text line or a circle. Size each one to the real content (the Table does this per column) so nothing jumps when data arrives."],
    importLine: `import { Skeleton, SkeletonText } from "@/components/ui";`,
    usage: `<Skeleton width={180} height={20} />\n<SkeletonText lines={3} />`,
    props: ["Skeleton", "SkeletonText"],
    css: ["components/ui/Skeleton/Skeleton.module.css"],
    examples: [{ id: "default", title: "Shapes", code: `<Skeleton variant="circle" width={36} height={36} />\n<SkeletonText lines={2} />` }],
    accessibility: ["Hidden from assistive tech; mark the loading region aria-busy instead."],
    dos: ["Match the real layout's dimensions."],
    donts: ["Don't show grey blocks with no relation to the content."],
    depth: "summary",
  },
];
