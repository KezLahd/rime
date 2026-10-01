import { PATTERNS_SHELL } from "./patterns-shell";
import type { PatternEntry } from "./types";

// Composed patterns: several primitives with one job. The /patterns page and
// the markdown both render from this list.

const BASE_PATTERNS: PatternEntry[] = [
  {
    slug: "list-page",
    name: "List page",
    summary: "One glass panel holding the filter row, the table and the pagination. Nothing above it.",
    description: [
      "Every list page is this, and only this. The FilterBar's search grows to fill the row, dropdown chips sit at the end, \"Clear filters\" appears while anything is applied, and the list's own action goes last after a hairline. The table follows, then Pagination centred beneath.",
      "Sort, filter and page state live with the screen. Reset to page one when a filter changes. The empty state says whether filters caused it and offers to clear them.",
    ],
    uses: ["GlassPanel", "FilterBar", "FilterSearch", "Select", "Table", "Pagination", "EmptyState"],
    code: `<GlassPanel padding="lg">
  <FilterBar aria-label="Filter invoices" onClear={filtering ? clear : undefined} actions={<Button size="sm" iconStart={<IconPlus size={14} />}>New invoice</Button>}>
    <FilterSearch grow aria-label="Search invoices" value={query} onChange={setQuery} />
    <Select appearance="chip" aria-label="Status" value={status} onChange={setStatus} active={status !== "all"} options={STATUSES} />
  </FilterBar>
  <Table
    caption="Invoices"
    columns={columns}
    rows={pageRows}
    rowKey={(i) => i.id}
    sort={sort}
    onSortChange={setSort}
    empty={<EmptyState compact tone={filtering ? "filtered" : "default"} title="No invoices match" description="Clear a filter to see more." action={filtering ? <Button size="sm" variant="secondary" onClick={clear}>Clear filters</Button> : undefined} />}
  />
  <Pagination page={page} pageCount={pageCount} onPageChange={setPage} totalItems={filtered.length} pageSize={20} itemLabel="invoices" />
</GlassPanel>`,
    rules: [
      "No heading or \"n of m shown\" line above the panel.",
      "Never a row of toggle chips for a single choice: use a Select chip.",
      "One table look everywhere: theme --table-* tokens, never restyle a table.",
    ],
  },
  {
    slug: "glass-shell",
    name: "Frosted glass shell",
    summary: "The signed-in frame: the page field painted once, a frosted sidebar and top bar over it, and glass panels inside.",
    description: [
      "The field (--page-background) is never white: a coloured base with soft blooms, so white glass reads as panels floating on colour. The sidebar and top bar are whitened glass over the same field, so the chrome shares its colour, and the logo corner is that same glass by default: one continuous frosted L. A brand that requires a set colour behind its logo opts in with logoCorner=\"fill\" and --logo-corner-bg. Content sits in GlassPanels; the one block that needs the user's action can be a Card tone=\"highlight\".",
      "A motif must derive from the product. The blooms here are light, not a picture; another site should choose its own field and justify any device it adds.",
    ],
    uses: ["SidebarShell", "PageHeader", "GlassPanel", "Card"],
    code: `<SidebarShell navLabel="Main" nav={NAV} title="Dashboard" topbarRight={<Avatar name="Jane Cooper" size="sm" />}>
  <PageHeader title="Good morning, Jane" description="Two invoices need your review." />
  <GlassPanel padding="lg">…</GlassPanel>
</SidebarShell>`,
    rules: ["Gate inside page.tsx, never the layout.", "No bento grids; no left accent bars; no hover scale."],
  },
  {
    slug: "summary-card",
    name: "Summary card with cells",
    summary: "One card of key figures: per cell a label, a big number and a muted line of context, separated by hairlines.",
    description: ["This month at a glance: four or five cells in one row, each a figure and a sentence of context, not a grid of separate cards. The whole set is one surface; hairlines separate the cells. The label sits beside nothing and above only its own figure, never as a stacked title."],
    uses: ["Card", "Meter"],
    code: `<Card title="This month" description="Updated hourly">
  <dl className={styles.cells}>
    <div><dt>Invoices paid</dt><dd>32</dd><p>+4 on last month</p></div>
    <div><dt>Active projects</dt><dd>14</dd><p>3 due this week</p></div>
  </dl>
</Card>`,
    rules: ["One surface with cells, never a bento of cards.", "Every figure has a line that says what it means."],
  },
  {
    slug: "modal-scroll",
    name: "Modal with scroll edges",
    summary: "A long modal whose header and footer cast shadows only when content passes under them.",
    description: [
      "The body scrolls; the header and footer do not. useScrollEdges writes data-scrolled and data-more on the panel from a passive listener, and the header and footer draw --scroll-edge-top and --scroll-edge-bottom. Thin tinted scrollbars and contained overscroll come from themedScrollClass. The page behind is locked with useScrollLock.",
      "The same three pieces work for any scroller: ScrollArea bundles them for a region inside a page.",
    ],
    uses: ["Modal", "ScrollArea", "useScrollEdges", "useScrollLock"],
    code: `const bodyRef = useRef<HTMLDivElement>(null);
const panelRef = useRef<HTMLDivElement>(null);
useScrollLock(open);
useScrollEdges(bodyRef, { target: panelRef, enabled: open });

<div ref={panelRef} className={styles.panel}>
  <header className={styles.header}>…</header>
  <div ref={bodyRef} className={cx(styles.body, themedScrollClass)}>…</div>
  <footer className={styles.footer}>…</footer>
</div>

/* .panel[data-scrolled] .header { box-shadow: var(--scroll-edge-top); }
   .panel[data-more] .footer { box-shadow: var(--scroll-edge-bottom); } */`,
    rules: ["Never a JavaScript scrollbar.", "No shadow when there is nothing under the edge."],
  },
];

const FLOWS: PatternEntry[] = [
  {
    slug: "terms-gated",
    name: "Terms with scroll-gated accept",
    summary: "A terms dialog whose Accept stays disabled until the reader has scrolled to the end.",
    description: [
      "The body scrolls; the footer says \"Scroll to the end to accept\" and the Accept button is disabled. When the scroll listener sees the far edge (useScrollEdges clears data-more and calls onEnd, surfaced on Modal as onScrollEnd), the hint turns into \"You have reached the end\" and Accept unlocks. If the terms are short enough not to scroll, it unlocks at once.",
      "The hint is a status region and the disabled button is described by it, so screen reader users hear why it is locked and when it unlocks. Reopening the dialog locks it again.",
    ],
    uses: ["Modal", "useScrollEdges", "Button"],
    code: `const [read, setRead] = useState(false);
const onEnd = useCallback(() => setRead(true), []);

<Modal
  open={open}
  onClose={close}
  size="lg"
  title="Workspace terms"
  onScrollEnd={onEnd} // useScrollEdges: fires when data-more clears
  footerStart={read
    ? <span role="status">You have reached the end</span>
    : <span role="status" id="terms-hint">Scroll to the end to accept</span>}
  footer={
    <>
      <Button variant="secondary" onClick={close}>Not now</Button>
      <Button disabled={!read} aria-describedby={read ? undefined : "terms-hint"} onClick={accept}>Accept terms</Button>
    </>
  }
>
  {terms}
</Modal>`,
    rules: [
      "Say why the button is disabled, next to it, and announce the change.",
      "Gate on reaching the end, never on a timer.",
      "Keep a way out (Not now) that is always enabled.",
    ],
  },
  {
    slug: "sign-in",
    name: "Sign-in with multi-factor authentication",
    summary: "A corporate sign-in: brand mark in the header, the form centred, a shield treatment and a security note in the footer, across the password, MFA code and authenticator setup steps.",
    description: [
      "AuthLayout paints the deep field and carries the header (the brand mark, a help link) and the footer (\"Protected by multi-factor authentication\"). One AuthCard sits in the middle per step: the password step with a lock tile, the code step with a shield tile and OtpInput, and the authenticator setup step with a QR code, the text key and a confirming code.",
      "Each step has one full-width primary. The code step auto-verifies on onComplete; the setup step is reached from \"Lost your device?\" or after a reset. Use the switcher above the preview to see each step.",
    ],
    uses: ["AuthLayout", "AuthCard", "Field", "TextInput", "OtpInput", "Button", "Checkbox"],
    code: `<AuthLayout
  header={<><Logo /><a href="/help">Need help?</a></>}
  footer={<><IconShield size={14} /> Protected by multi-factor authentication.</>}
>
  {step === "password" ? (
    <AuthCard icon={<IconLock size={22} />} title="Sign in" subtitle="Use your work email.">
      <Field label="Work email"><TextInput type="email" autoComplete="username" /></Field>
      <Field label="Password"><TextInput type="password" revealable autoComplete="current-password" /></Field>
      <Button size="lg" fullWidth onClick={next}>Continue</Button>
    </AuthCard>
  ) : step === "code" ? (
    <AuthCard icon={<IconShield size={22} />} title="Enter your code" subtitle="Open your authenticator app.">
      <OtpInput aria-label="Authentication code" value={code} onChange={setCode} onComplete={verify} />
      <Button size="lg" fullWidth disabled={code.length < 6}>Verify</Button>
    </AuthCard>
  ) : (
    <AuthCard width="md" icon={<IconShield size={22} />} title="Set up your authenticator">
      <QrCode value={otpauthUrl} />
      <code>{secret}</code>
      <OtpInput aria-label="Code from your authenticator app" value={code} onChange={setCode} />
      <Button size="lg" fullWidth>Turn on two-step sign-in</Button>
    </AuthCard>
  )}
</AuthLayout>`,
    rules: [
      "One primary per step, full width, size lg.",
      "Errors in an ErrorSummary above the form on submit.",
      "Keep an admin sign-in on its own route, never a toggle on the public one.",
      "Never ask for the code anywhere but this screen; say so in the footer.",
    ],
  },
];

const byslug = (slug: string) => BASE_PATTERNS.filter((p) => p.slug === slug);

export const PATTERNS: PatternEntry[] = [
  ...byslug("list-page"),
  ...byslug("glass-shell"),
  ...PATTERNS_SHELL,
  ...byslug("summary-card"),
  ...byslug("modal-scroll"),
  ...FLOWS,
];
