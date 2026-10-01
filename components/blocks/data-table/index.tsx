"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shell/PageHeader";
import { SidebarShell } from "@/components/shell/SidebarShell";
import { Avatar } from "@/components/ui/Avatar/Avatar";
import { Badge, StatusPill } from "@/components/ui/Badge/Badge";
import { Button } from "@/components/ui/Button/Button";
import { Checkbox } from "@/components/ui/Checkbox/Checkbox";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { FilterBar } from "@/components/ui/FilterBar/FilterBar";
import { FilterSearch } from "@/components/ui/FilterChip/FilterChip";
import { GlassPanel } from "@/components/ui/GlassPanel/GlassPanel";
import { IconBook, IconClipboard, IconFile, IconHome, IconPlus, IconUsers } from "@/components/ui/Icon/Icon";
import { Select } from "@/components/ui/Select/Select";
import { Pagination, Table, type Column, type SortState } from "@/components/ui/Table/Table";
import { PRIORITY, STATUS, TASKS, type Task, type TaskPriority, type TaskStatus } from "./data";
import styles from "./DataTable.module.css";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: <IconHome size={16} />, exact: true },
  { href: "/tasks", label: "Tasks", icon: <IconClipboard size={16} />, count: 5 },
  { href: "/invoices", label: "Invoices", icon: <IconFile size={16} /> },
  { href: "/team", label: "Team", icon: <IconUsers size={16} /> },
  { href: "/docs", label: "Docs", icon: <IconBook size={16} /> },
];

const PAGE = 8;
const PRIORITY_RANK: Record<TaskPriority, number> = { low: 0, medium: 1, high: 2 };

export type DataTableProps = {
  /** Fill the parent instead of the viewport. */
  contained?: boolean;
};

/**
 * Data table block (Tasks): the list page with row selection. One full-width
 * search and dropdown filters, a checkbox column with select-all, a bulk
 * actions bar that appears under the table while rows are selected, and
 * centred pagination. Drop it at app/tasks.
 */
export default function DataTable({ contained }: DataTableProps) {
  const [tasks, setTasks] = useState(TASKS);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | TaskStatus>("all");
  const [priority, setPriority] = useState<"all" | TaskPriority>("all");
  const [sort, setSort] = useState<SortState>({ key: "priority", direction: "desc" });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = tasks.filter(
      (t) =>
        (status === "all" || t.status === status) &&
        (priority === "all" || t.priority === priority) &&
        (!q || t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)),
    );
    if (!sort) return list;
    const dir = sort.direction === "asc" ? 1 : -1;
    const val = (t: Task) => (sort.key === "priority" ? PRIORITY_RANK[t.priority] : sort.key === "title" ? t.title : sort.key === "status" ? t.status : t.assignee);
    return [...list].sort((a, b) => (val(a) < val(b) ? -dir : val(a) > val(b) ? dir : 0));
  }, [tasks, query, status, priority, sort]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE));
  const current = Math.min(page, pageCount);
  const pageRows = rows.slice((current - 1) * PAGE, current * PAGE);
  const filtering = query.trim() !== "" || status !== "all" || priority !== "all";
  const allOnPage = pageRows.length > 0 && pageRows.every((t) => selected.has(t.id));
  const someOnPage = pageRows.some((t) => selected.has(t.id));

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const togglePage = () =>
    setSelected((s) => {
      const n = new Set(s);
      for (const t of pageRows) {
        if (allOnPage) n.delete(t.id);
        else n.add(t.id);
      }
      return n;
    });
  const clear = () => {
    setQuery("");
    setStatus("all");
    setPriority("all");
    setPage(1);
  };
  const markDone = () => {
    setTasks((list) => list.map((t) => (selected.has(t.id) ? { ...t, status: "done" } : t)));
    setSelected(new Set());
  };
  const remove = () => {
    setTasks((list) => list.filter((t) => !selected.has(t.id)));
    setSelected(new Set());
  };

  const columns: Column<Task>[] = [
    {
      key: "select",
      shrink: true,
      header: <Checkbox label={<span className="sr-only">Select every task on this page</span>} checked={allOnPage} indeterminate={someOnPage && !allOnPage} onChange={togglePage} />,
      cell: (t) => <Checkbox label={<span className="sr-only">Select {t.id}</span>} checked={selected.has(t.id)} onChange={() => toggle(t.id)} />,
    },
    { key: "id", header: "Task", cell: (t) => t.id, mono: true, hideBelow: "sm" },
    {
      key: "title",
      header: "Title",
      sortable: true,
      cell: (t) => (
        <span className={styles.title}>
          <Badge tone={t.label === "Bug" ? "danger" : t.label === "Docs" ? "neutral" : "info"}>{t.label}</Badge>
          <strong>{t.title}</strong>
        </span>
      ),
    },
    { key: "status", header: "Status", sortable: true, cell: (t) => <StatusPill tone={STATUS[t.status].tone}>{STATUS[t.status].label}</StatusPill> },
    { key: "priority", header: "Priority", sortable: true, cell: (t) => PRIORITY[t.priority], hideBelow: "sm" },
    {
      key: "assignee",
      header: "Assignee",
      sortable: true,
      hideBelow: "md",
      cell: (t) => (
        <span className={styles.person}>
          <Avatar name={t.assignee} size="sm" tone="neutral" /> {t.assignee}
        </span>
      ),
    },
  ];

  return (
    <SidebarShell
      contained={contained}
      navLabel="Main"
      nav={NAV}
      activeHref="/tasks"
      title="Tasks"
      topbarRight={<Avatar name="Jane Cooper" size="sm" tone="brand" />}
    >
      <div className={styles.page}>
        <PageHeader title="Tasks" description="Everything the team is working on this sprint." actions={<Button iconStart={<IconPlus size={15} />}>New task</Button>} />
        <GlassPanel padding="lg">
          <FilterBar aria-label="Filter tasks" onClear={filtering ? clear : undefined}>
            <FilterSearch
              grow
              aria-label="Search tasks"
              value={query}
              onChange={(q) => {
                setQuery(q);
                setPage(1);
              }}
              placeholder="Title or task number"
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
                ...(Object.keys(STATUS) as TaskStatus[]).map((s) => ({ value: s, label: STATUS[s].label, count: tasks.filter((t) => t.status === s).length })),
              ]}
            />
            <Select
              appearance="chip"
              aria-label="Priority"
              value={priority}
              onChange={(p) => {
                setPriority(p);
                setPage(1);
              }}
              active={priority !== "all"}
              options={[
                { value: "all", label: "All priorities" },
                ...(Object.keys(PRIORITY) as TaskPriority[]).map((p) => ({ value: p, label: PRIORITY[p], count: tasks.filter((t) => t.priority === p).length })),
              ]}
            />
          </FilterBar>
          <Table
            caption="Tasks"
            columns={columns}
            rows={pageRows}
            rowKey={(t) => t.id}
            sort={sort}
            onSortChange={setSort}
            isRowHighlighted={(t) => selected.has(t.id)}
            empty={
              <EmptyState
                compact
                tone="filtered"
                title="No tasks match"
                description="Try another search, or clear the filters."
                action={
                  <Button size="sm" variant="secondary" onClick={clear}>
                    Clear filters
                  </Button>
                }
              />
            }
          />
          {selected.size > 0 ? (
            <div className={styles.bulk} role="region" aria-label="Bulk actions">
              <p className={styles.count} role="status">
                {selected.size} selected
              </p>
              <div className={styles.bulkActions}>
                <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
                  Clear selection
                </Button>
                <Button size="sm" variant="secondary" onClick={markDone}>
                  Mark done
                </Button>
                <Button size="sm" variant="dangerSecondary" onClick={remove}>
                  Delete
                </Button>
              </div>
            </div>
          ) : null}
          <Pagination page={current} pageCount={pageCount} onPageChange={setPage} totalItems={rows.length} pageSize={PAGE} itemLabel="tasks" />
        </GlassPanel>
      </div>
    </SidebarShell>
  );
}
