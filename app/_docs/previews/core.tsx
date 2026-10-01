"use client";

import { Settings, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { SidebarShell } from "@/components/shell/SidebarShell";
import {
  Alert,
  Button,
  ConfirmModal,
  DateRangeFilter,
  EmptyState,
  Field,
  FilterBar,
  FilterSearch,
  GlassPanel,
  IconArrowRight,
  IconBook,
  IconClipboard,
  IconHome,
  IconPlus,
  IconSearch,
  IconShield,
  IconUsers,
  Modal,
  Pagination,
  RadioGroup,
  ScrollArea,
  SegmentedControl,
  Select,
  StatusPill,
  Table,
  TextInput,
  formatDate,
  type Column,
  type DateRange,
  type SortState,
} from "@/components/ui";
import { PROJECTS, TOPICS, formatMoney, invoiceStatusMeta, invoices, type Invoice, type InvoiceStatus } from "@/lib/sample-data";
import styles from "./Previews.module.css";

// Live specimens for the fully documented components. Sample data only.

// ── Button ────────────────────────────────────────────────────────────────

function ButtonVariants() {
  return (
    <>
      <Button>Create invoice</Button>
      <Button variant="secondary">Save draft</Button>
      <Button variant="ghost">Cancel</Button>
      <Button variant="dangerSecondary">Review deletion</Button>
      <Button variant="danger">Delete project</Button>
    </>
  );
}

function ButtonSizes() {
  return (
    <>
      <Button size="sm">Small</Button>
      <Button>Medium</Button>
      <Button size="lg">Large</Button>
    </>
  );
}

function ButtonIcons() {
  return (
    <>
      <Button iconStart={<IconPlus size={15} />}>Add team member</Button>
      <Button variant="secondary" iconEnd={<IconArrowRight size={15} />}>
        Continue
      </Button>
    </>
  );
}

function ButtonStates() {
  const [loading, setLoading] = useState(false);
  return (
    <>
      <Button
        loading={loading}
        loadingLabel="Saving…"
        onClick={() => {
          setLoading(true);
          window.setTimeout(() => setLoading(false), 1600);
        }}
      >
        Save (press me)
      </Button>
      <Button loading loadingLabel="Saving…">
        Save
      </Button>
      <Button disabled>Submit</Button>
      <Button href="/" variant="secondary">
        Link as button
      </Button>
    </>
  );
}

function ButtonAliases() {
  return (
    <>
      <Button variant="default">Save</Button>
      <Button variant="outline">Cancel</Button>
      <Button variant="destructive">Delete</Button>
      <Button variant="link">Read the terms</Button>
      <Button variant="outline" size="icon" aria-label="Settings">
        <Settings size={16} aria-hidden="true" />
      </Button>
    </>
  );
}

function ButtonAsChild() {
  return (
    <>
      <Button asChild>
        <Link href="/components/button">New project</Link>
      </Button>
      <Button variant="destructive" size="icon" asChild>
        <Link href="/components/button" aria-label="Open trash">
          <Trash2 size={16} aria-hidden="true" />
        </Link>
      </Button>
    </>
  );
}

// ── TextInput ─────────────────────────────────────────────────────────────

function InputDefault() {
  return (
    <div className={styles.formCol}>
      <Field label="Project name" hint="Shown to everyone on the team.">
        <TextInput placeholder="e.g. Atlas redesign" />
      </Field>
    </div>
  );
}

function InputAdornments() {
  return (
    <div className={styles.formCol}>
      <TextInput leadingIcon={<IconSearch size={16} />} placeholder="Search" aria-label="Search" />
      <TextInput trailing="kg" inputMode="decimal" aria-label="Weight" defaultValue="72" />
      <TextInput type="password" revealable autoComplete="off" aria-label="Password" defaultValue="correct horse" />
    </div>
  );
}

function InputStates() {
  return (
    <div className={styles.formCol}>
      <Field label="Postcode" error="Enter a 4-digit postcode.">
        <TextInput invalid defaultValue="20" />
      </Field>
      <TextInput readOnly defaultValue="INV-1042" mono aria-label="Reference" />
      <TextInput disabled placeholder="Disabled" aria-label="Disabled" />
      <TextInput size="sm" placeholder="Small" aria-label="Small" />
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────────────────

function SelectOpen() {
  const [v, setV] = useState<string | null>("billing");
  return <Select inline aria-label="Topic" value={v} onChange={setV} options={TOPICS} />;
}

function SelectField() {
  const [v, setV] = useState<string | null>(null);
  return (
    <div className={styles.formCol}>
      <Field label="What is it about?" required>
        <Select value={v} onChange={setV} placeholder="Choose a topic" options={TOPICS} />
      </Field>
    </div>
  );
}

function SelectChip() {
  const [status, setStatus] = useState("all");
  return (
    <Select
      appearance="chip"
      aria-label="Status"
      value={status}
      onChange={setStatus}
      active={status !== "all"}
      options={[
        { value: "all", label: "All statuses" },
        { value: "sent", label: "Sent", count: 2 },
        { value: "paid", label: "Paid", count: 5 },
        { value: "overdue", label: "Overdue", count: 2 },
      ]}
    />
  );
}

function SelectSearchable() {
  const [v, setV] = useState<string | null>(null);
  return (
    <div className={styles.formCol}>
      <Field label="Project">
        <Select searchable value={v} onChange={setV} placeholder="Choose a project" options={PROJECTS} />
      </Field>
    </div>
  );
}

function SelectStates() {
  return (
    <div className={styles.formCol}>
      <Field label="Reason" error="Choose a reason.">
        <Select invalid value={null} onChange={() => {}} placeholder="Select a reason" options={TOPICS} />
      </Field>
      <Field label="Topic">
        <Select disabled value="billing" onChange={() => {}} options={TOPICS} />
      </Field>
    </div>
  );
}

// ── Table and the list page ──────────────────────────────────────────────

const PAGE = 4;

function useInvoiceList() {
  const [sort, setSort] = useState<SortState>({ key: "issued", direction: "desc" });
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | InvoiceStatus>("all");
  const [page, setPage] = useState(1);
  const [range, setRange] = useState<DateRange>({ start: null, end: null });
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = invoices.filter(
      (i) => (status === "all" || i.status === status) && (!q || i.customer.toLowerCase().includes(q) || i.reference.toLowerCase().includes(q)),
    );
    if (!sort) return list;
    const dir = sort.direction === "asc" ? 1 : -1;
    const val = (i: Invoice) => (sort.key === "customer" ? i.customer : sort.key === "amount" ? i.amount : sort.key === "status" ? i.status : i.issuedAt);
    return [...list].sort((a, b) => (val(a) < val(b) ? -dir : val(a) > val(b) ? dir : 0));
  }, [query, status, sort]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE));
  const current = Math.min(page, pageCount);
  const filtering = query.trim() !== "" || status !== "all" || Boolean(range.start);
  const clear = () => {
    setQuery("");
    setStatus("all");
    setRange({ start: null, end: null });
    setPage(1);
  };
  const statuses = [...new Set(invoices.map((i) => i.status))];
  return {
    sort,
    setSort,
    query,
    setQuery: (q: string) => {
      setQuery(q);
      setPage(1);
    },
    status,
    setStatus: (s: "all" | InvoiceStatus) => {
      setStatus(s);
      setPage(1);
    },
    page: current,
    setPage,
    range,
    setRange,
    filtered,
    pageRows: filtered.slice((current - 1) * PAGE, current * PAGE),
    pageCount,
    filtering,
    clear,
    statuses,
  };
}

const columns: Column<Invoice>[] = [
  { key: "ref", header: "Invoice", cell: (i) => i.reference, mono: true, skeletonWidth: "70%" },
  { key: "customer", header: "Customer", sortable: true, cell: (i) => <strong>{i.customer}</strong>, skeletonWidth: "60%" },
  { key: "issued", header: "Issued", sortable: true, cell: (i) => formatDate(i.issuedAt), hideBelow: "sm" },
  { key: "amount", header: "Amount", sortable: true, align: "right", cell: (i) => <span className="tabular">{formatMoney(i.amount)}</span> },
  {
    key: "status",
    header: "Status",
    sortable: true,
    cell: (i) => <StatusPill tone={invoiceStatusMeta[i.status].tone}>{invoiceStatusMeta[i.status].label}</StatusPill>,
  },
  {
    key: "actions",
    header: <span className="sr-only">Actions</span>,
    align: "right",
    cell: () => (
      <Button href="/components/table" variant="ghost" size="sm">
        View
      </Button>
    ),
  },
];

function TableDefault() {
  const l = useInvoiceList();
  return (
    <GlassPanel padding="md" className={styles.block}>
      <Table caption="Invoices" columns={columns} rows={l.pageRows} rowKey={(i) => i.id} sort={l.sort} onSortChange={l.setSort} />
      <Pagination page={l.page} pageCount={l.pageCount} onPageChange={l.setPage} totalItems={l.filtered.length} pageSize={PAGE} itemLabel="invoices" />
    </GlassPanel>
  );
}

function TableStates() {
  const [state, setState] = useState<"loading" | "empty" | "error">("loading");
  return (
    <div className={styles.block}>
      <SegmentedControl
        aria-label="Table state"
        size="sm"
        value={state}
        onChange={setState}
        options={[
          { value: "loading", label: "Loading" },
          { value: "empty", label: "Empty" },
          { value: "error", label: "Error" },
        ]}
      />
      <GlassPanel padding="md" className={styles.gapTop}>
        <Table
          caption="Invoices"
          columns={columns}
          rows={[]}
          rowKey={(i) => i.id}
          loading={state === "loading"}
          skeletonRows={3}
          empty={
            <EmptyState
              compact
              tone="filtered"
              title="No invoices match"
              description="Clear a filter to see every invoice."
              action={
                <Button size="sm" variant="secondary">
                  Clear filters
                </Button>
              }
            />
          }
          error={
            state === "error" ? (
              <Alert
                tone="danger"
                title="Couldn't load invoices"
                action={
                  <Button size="sm" variant="secondary">
                    Try again
                  </Button>
                }
              >
                Check your connection, then try again.
              </Alert>
            ) : undefined
          }
        />
      </GlassPanel>
    </div>
  );
}

function TableWhite() {
  return (
    <GlassPanel padding="md" className={styles.block}>
      <Table appearance="white" caption="Invoices" columns={columns.slice(0, 5)} rows={invoices.slice(0, 3)} rowKey={(i) => i.id} />
    </GlassPanel>
  );
}

// ── FilterBar ─────────────────────────────────────────────────────────────

function FilterBarDefault() {
  const l = useInvoiceList();
  return (
    <GlassPanel padding="md" className={styles.block}>
      <FilterBar
        aria-label="Filter invoices"
        onClear={l.filtering ? l.clear : undefined}
        actions={
          <Button size="sm" iconStart={<IconPlus size={14} />}>
            New invoice
          </Button>
        }
      >
        <FilterSearch grow aria-label="Search invoices" value={l.query} onChange={l.setQuery} placeholder="Customer or invoice number" />
        <Select
          appearance="chip"
          aria-label="Status"
          value={l.status}
          onChange={l.setStatus}
          active={l.status !== "all"}
          options={[
            { value: "all", label: "All statuses" },
            ...l.statuses.map((s) => ({
              value: s,
              label: invoiceStatusMeta[s].label,
              count: invoices.filter((i) => i.status === s).length,
            })),
          ]}
        />
        <DateRangeFilter aria-label="Issued" value={l.range} onChange={l.setRange} />
      </FilterBar>
      <Table
        caption="Invoices"
        columns={columns}
        rows={l.pageRows}
        rowKey={(i) => i.id}
        sort={l.sort}
        onSortChange={l.setSort}
        empty={
          <EmptyState
            compact
            tone="filtered"
            title="No invoices match"
            description="Try another search, or clear the filters."
            action={
              <Button size="sm" variant="secondary" onClick={l.clear}>
                Clear filters
              </Button>
            }
          />
        }
      />
      <Pagination page={l.page} pageCount={l.pageCount} onPageChange={l.setPage} totalItems={l.filtered.length} pageSize={PAGE} itemLabel="invoices" />
    </GlassPanel>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────

const TERMS = Array.from({ length: 9 }, (_, i) => (
  <p key={i}>
    {i + 1}. These terms cover use of the workspace during the trial period. Each member agrees to keep their sign-in to
    themselves, to store project files only in the shared drive, and to remove client data when a project closes.
  </p>
));

function ModalOpen() {
  return (
    <Modal
      inline
      open
      onClose={() => {}}
      title="Contact support"
      meta="Invoice INV-1042"
      description="Ask a question about this invoice. We reply within a day."
      footerStart="Recorded on the activity log."
      footer={
        <>
          <Button variant="secondary">Cancel</Button>
          <Button>Send question</Button>
        </>
      }
    >
      <Field label="Your question">
        <TextInput placeholder="Plain language." />
      </Field>
    </Modal>
  );
}

function ModalForm() {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const close = () => setOpen(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Contact support
      </Button>
      <Modal
        open={open}
        onClose={close}
        title="Contact support"
        description="Ask a question about invoice INV-1042. We reply within a day."
        busy={sending}
        footerStart="Recorded on the activity log."
        footer={
          <>
            <Button variant="secondary" onClick={close} disabled={sending}>
              Cancel
            </Button>
            <Button
              loading={sending}
              loadingLabel="Sending…"
              onClick={() => {
                setSending(true);
                window.setTimeout(() => {
                  setSending(false);
                  close();
                }, 1200);
              }}
            >
              Send question
            </Button>
          </>
        }
      >
        <Field label="What is it about?" required>
          <Select value={topic} onChange={setTopic} placeholder="Choose a topic" options={TOPICS} />
        </Field>
        <Field label="Your question">
          <TextInput placeholder="Plain language." />
        </Field>
      </Modal>
    </>
  );
}

function ModalLong() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Workspace terms
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        size="lg"
        title="Workspace terms"
        description="Scroll the body: the header shade arrives once content passes under it."
        footer={<Button onClick={() => setOpen(false)}>I agree</Button>}
      >
        {TERMS}
      </Modal>
    </>
  );
}

function ModalConfirm() {
  const [open, setOpen] = useState(false);
  const [why, setWhy] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        Delete project
      </Button>
      <ConfirmModal
        open={open}
        onClose={() => setOpen(false)}
        tone="danger"
        title="Delete Atlas redesign"
        description="This removes the project, its files and its activity for everyone."
        review={<p>Files are removed from the shared drive immediately. This cannot be undone.</p>}
        reviewTitle="Delete Atlas redesign?"
        proceedLabel="Review deletion"
        confirmLabel="Delete project"
        busy={busy}
        busyLabel="Deleting…"
        onConfirm={() => {
          setBusy(true);
          window.setTimeout(() => {
            setBusy(false);
            setOpen(false);
          }, 1200);
        }}
      >
        <RadioGroup
          variant="cards"
          columns={3}
          aria-label="Why is it being deleted?"
          value={why}
          onChange={setWhy}
          options={[
            { value: "done", label: "Finished" },
            { value: "cancelled", label: "Cancelled" },
            { value: "duplicate", label: "Duplicate" },
          ]}
        />
      </ConfirmModal>
    </>
  );
}

// ── SidebarShell ──────────────────────────────────────────────────────────

const APP_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: <IconHome size={16} />, exact: true },
  { href: "/projects", label: "Projects", icon: <IconClipboard size={16} />, count: 2 },
  { href: "/team", label: "Team", icon: <IconUsers size={16} /> },
  { href: "/docs", label: "Docs", icon: <IconBook size={16} /> },
];

const ADMIN_NAV = [
  { href: "/admin", label: "Overview", icon: <IconHome size={16} />, exact: true },
  { href: "/admin/members", label: "Members", icon: <IconUsers size={16} />, count: 3 },
  { href: "/admin/security", label: "Security", icon: <IconShield size={16} /> },
];

type ShellVariant = "sidebar" | "collapsible" | "rail" | "header" | "drawer" | "fill" | "admin";

/** The shell in a fixed-height frame, filling its width. Exported for the shell patterns. */
export function ShellFrame({ variant = "sidebar" }: { variant?: ShellVariant }) {
  const admin = variant === "admin";
  return (
    <div className={styles.shellFrame}>
      <SidebarShell
        contained
        navLabel={admin ? "Admin preview" : "App preview"}
        nav={admin ? ADMIN_NAV : APP_NAV}
        activeHref={admin ? "/admin" : "/projects"}
        title={admin ? "Overview" : "Projects"}
        strip={admin ? "Admin session" : undefined}
        logoCorner={variant === "fill" ? "fill" : "glass"}
        layout={variant === "rail" ? "rail" : variant === "header" ? "header" : "sidebar"}
        collapsible={variant === "collapsible" || variant === "rail"}
        storageKey={variant === "collapsible" ? "ui-kit-docs-shell-collapsed" : undefined}
        forceMobile={variant === "drawer"}
        defaultDrawerOpen={variant === "drawer"}
      >
        <GlassPanel padding="lg">
          <p className={styles.shellCopy}>
            {variant === "collapsible"
              ? "Press the panel button in the top bar: the sidebar folds to an icon rail, and the choice is remembered on reload."
              : variant === "drawer"
                ? "On a narrow screen the sidebar is a drawer from the menu button. Esc or the scrim closes it."
                : "Page content scrolls here, under the frosted top bar."}
          </p>
        </GlassPanel>
      </SidebarShell>
    </div>
  );
}

// ── ScrollArea ────────────────────────────────────────────────────────────

const ACTIVITY = ["was paid", "was sent to the customer", "had a note added"];

function ScrollVertical() {
  return (
    <div className={styles.block}>
      <GlassPanel padding="none" variant="nested" className={styles.scrollHost}>
        <ScrollArea maxHeight={220} label="Activity">
          <ul className={styles.activity}>
            {Array.from({ length: 14 }, (_, i) => (
              <li key={i}>
                <strong>INV-10{30 + i}</strong> {ACTIVITY[i % 3]}
              </li>
            ))}
          </ul>
        </ScrollArea>
      </GlassPanel>
    </div>
  );
}

function ScrollX() {
  return (
    <div className={styles.block}>
      <GlassPanel padding="none" variant="nested" className={styles.scrollHost}>
        <ScrollArea axis="x" label="Sprints">
          <div className={styles.wide}>
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className={styles.wideCell}>
                Sprint {i + 1}
              </div>
            ))}
          </div>
        </ScrollArea>
      </GlassPanel>
    </div>
  );
}

export const CORE_PREVIEWS: Record<string, Record<string, () => ReactNode>> = {
  button: { variants: ButtonVariants, sizes: ButtonSizes, icons: ButtonIcons, states: ButtonStates, aliases: ButtonAliases, "as-child": ButtonAsChild },
  "text-input": { default: InputDefault, adornments: InputAdornments, states: InputStates },
  select: { open: SelectOpen, field: SelectField, chip: SelectChip, searchable: SelectSearchable, states: SelectStates },
  table: { default: TableDefault, states: TableStates, white: TableWhite },
  "filter-bar": { default: FilterBarDefault },
  modal: { open: ModalOpen, form: ModalForm, long: ModalLong, confirm: ModalConfirm },
  "sidebar-shell": {
    default: () => <ShellFrame />,
    collapsible: () => <ShellFrame variant="collapsible" />,
    rail: () => <ShellFrame variant="rail" />,
    header: () => <ShellFrame variant="header" />,
    drawer: () => <ShellFrame variant="drawer" />,
    fill: () => <ShellFrame variant="fill" />,
    admin: () => <ShellFrame variant="admin" />,
  },
  "scroll-area": { default: ScrollVertical, x: ScrollX, hook: ScrollVertical },
};
