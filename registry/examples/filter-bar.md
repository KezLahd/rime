# FilterBar examples

The one filter row above every table: a growing search, dropdown chips at the end, clear, and the list's own action.

```tsx
import { FilterBar, FilterSearch, Select } from "@/components/ui";

<FilterBar aria-label="Filter invoices" onClear={filtering ? clear : undefined} actions={<Button size="sm" iconStart={<IconPlus size={14} />}>New invoice</Button>}>
  <FilterSearch grow aria-label="Search invoices" value={query} onChange={setQuery} placeholder="Customer or invoice number" />
  <Select appearance="chip" aria-label="Status" value={status} onChange={setStatus} active={status !== "all"} options={STATUSES} />
</FilterBar>
```

## Search, dropdowns, clear and action

Type or pick a status to see Clear filters appear.

```tsx
<FilterBar aria-label="Filter invoices" onClear={filtering ? clear : undefined} actions={<Button size="sm">New invoice</Button>}>
  <FilterSearch grow aria-label="Search" value={q} onChange={setQ} />
  <Select appearance="chip" aria-label="Status" … />
  <DateRangeFilter aria-label="Issued" … />
</FilterBar>
```

Docs: https://rime.mjsons.net/components/filter-bar
