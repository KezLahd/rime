"use client";

import { useMemo, useState } from "react";
import { AreaChart } from "@/components/charts/TrendChart";
import { StatStrip } from "@/components/charts/StatStrip";
import { formatDay, formatDate } from "@/components/charts/format";
import { PageHeader } from "@/components/shell/PageHeader";
import { SidebarShell } from "@/components/shell/SidebarShell";
import { Avatar } from "@/components/ui/Avatar/Avatar";
import { StatusPill } from "@/components/ui/Badge/Badge";
import { Button } from "@/components/ui/Button/Button";
import { FilterBar } from "@/components/ui/FilterBar/FilterBar";
import { FilterSearch } from "@/components/ui/FilterChip/FilterChip";
import { GlassPanel } from "@/components/ui/GlassPanel/GlassPanel";
import { IconBook, IconClipboard, IconFile, IconHome, IconPlus, IconUsers } from "@/components/ui/Icon/Icon";
import { Select } from "@/components/ui/Select/Select";
import { Pagination, Table, type Column, type SortState } from "@/components/ui/Table/Table";
import { SegmentedControl } from "@/components/ui/Tabs/Tabs";
import { DAILY, INVOICES, STATUS, money, rangeDays, type Invoice, type Range } from "./data";
import styles from "./Dashboard.module.css";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: <IconHome size={16} />, exact: true },
  { href: "/projects", label: "Projects", icon: <IconClipboard size={16} />, count: 3 },
  { href: "/invoices", label: "Invoices", icon: <IconFile size={16} /> },
  { href: "/team", label: "Team", icon: <IconUsers size={16} /> },
  { href: "/docs", label: "Docs", icon: <IconBook size={16} /> },
];

const PAGE = 5;

const columns: Column<Invoice>[] = [
  { key: "ref", header: "Invoice", cell: (i) => i.reference, mono: true },
  { key: "customer", header: "Customer", sortable: true, cell: (i) => <strong>{i.customer}</strong> },
  { key: "issued", header: "Issued", sortable: true, cell: (i) => formatDate(i.issuedAt), hideBelow: "sm" },
  { key: "amount", header: "Amount", sortable: true, align: "right", cell: (i) => <span className="tabular">{money(i.amount)}</span> },
  { key: "status", header: "Status", cell: (i) => <StatusPill tone={STATUS[i.status].tone}>{STATUS[i.status].label}</StatusPill> },
  {
    key: "actions",
    header: <span className="sr-only">Actions</span>,
    align: "right",
    cell: () => (
      <Button variant="ghost" size="sm">
        View
      </Button>
    ),
  },
];

export type DashboardProps = {
  /** Fill the parent instead of the viewport (a docs frame, a showcase). */
  contained?: boolean;
};

/**
 * Dashboard block: the frosted shell, a page header with the one primary
 * action, headline figures as one strip with hairline cells, an area chart
 * with a range switch, and the list-page table. Drop it at app/dashboard.
 */
export default function Dashboard({ contained }: DashboardProps) {
  const [range, setRange] = useState<Range>("30d");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | Invoice["status"]>("all");
  const [sort, setSort] = useState<SortState>({ key: "issued", direction: "desc" });
  const [page, setPage] = useState(1);

  const series = useMemo(() => DAILY.slice(-rangeDays[range]), [range]);
  const total = series.reduce((n, d) => n + d.online + d.store, 0);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = INVOICES.filter(
      (i) => (status === "all" || i.status === status) && (!q || i.customer.toLowerCase().includes(q) || i.reference.toLowerCase().includes(q)),
    );
    if (!sort) return list;
    const dir = sort.direction === "asc" ? 1 : -1;
    const val = (i: Invoice) => (sort.key === "customer" ? i.customer : sort.key === "amount" ? i.amount : i.issuedAt);
    return [...list].sort((a, b) => (val(a) < val(b) ? -dir : val(a) > val(b) ? dir : 0));
  }, [query, status, sort]);
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE));
  const current = Math.min(page, pageCount);
  const filtering = query.trim() !== "" || status !== "all";

  return (
    <SidebarShell
      contained={contained}
      navLabel="Main"
      nav={NAV}
      activeHref="/dashboard"
      title="Dashboard"
      topbarRight={<Avatar name="Jane Cooper" size="sm" tone="brand" />}
    >
      <div className={styles.page}>
        <PageHeader
          title="Good morning, Jane"
          description="Orders are up on last month. Two invoices are overdue."
          actions={<Button iconStart={<IconPlus size={15} />}>New invoice</Button>}
        />

        <StatStrip
          aria-label="This month"
          stats={[
            { label: "Revenue", value: 48210, format: money, delta: { value: 0.12, period: "vs last month", format: (v) => `${Math.round(v * 100)}%` }, trend: [31, 34, 33, 38, 41, 44, 48] },
            { label: "Orders", value: total, delta: { value: 0.08, period: "vs last period", format: (v) => `${Math.round(v * 100)}%` } },
            { label: "Active projects", value: 14, note: "3 due this week" },
            { label: "Time to pay", value: 6, unit: "days", delta: { value: -3, period: "vs last month", goodWhen: "down" } },
          ]}
        />

        <GlassPanel padding="lg">
          <AreaChart
            title="Orders"
            subtitle="Online and in store"
            summary={`Daily orders over the last ${rangeDays[range]} days, online and in store.`}
            data={series}
            x="date"
            series={[
              { key: "online", label: "Online" },
              { key: "store", label: "In store" },
            ]}
            formatX={formatDay}
            stacked
            height={240}
            actions={
              <SegmentedControl
                aria-label="Range"
                size="sm"
                value={range}
                onChange={setRange}
                options={[
                  { value: "7d", label: "7 days" },
                  { value: "30d", label: "30 days" },
                  { value: "90d", label: "90 days" },
                ]}
              />
            }
          />
        </GlassPanel>

        <GlassPanel padding="lg">
          <FilterBar
            aria-label="Filter invoices"
            onClear={
              filtering
                ? () => {
                    setQuery("");
                    setStatus("all");
                    setPage(1);
                  }
                : undefined
            }
            actions={
              <Button size="sm" variant="secondary">
                Export
              </Button>
            }
          >
            <FilterSearch
              grow
              aria-label="Search invoices"
              value={query}
              onChange={(q) => {
                setQuery(q);
                setPage(1);
              }}
              placeholder="Customer or invoice number"
            />
            <Select
              appearance="chip"
              aria-label="Status"
              value={status}
              onChange={(s) => {
                setStatus(s);
                setPage(1);
              }}
              active={status !== "all"}
              options={[
                { value: "all", label: "All statuses" },
                ...(Object.keys(STATUS) as Array<Invoice["status"]>).map((s) => ({
                  value: s,
                  label: STATUS[s].label,
                  count: INVOICES.filter((i) => i.status === s).length,
                })),
              ]}
            />
          </FilterBar>
          <Table
            caption="Recent invoices"
            columns={columns}
            rows={rows.slice((current - 1) * PAGE, current * PAGE)}
            rowKey={(i) => i.id}
            sort={sort}
            onSortChange={setSort}
          />
          <Pagination page={current} pageCount={pageCount} onPageChange={setPage} totalItems={rows.length} pageSize={PAGE} itemLabel="invoices" />
        </GlassPanel>
      </div>
    </SidebarShell>
  );
}
