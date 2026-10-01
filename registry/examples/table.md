# Table examples

The one table look: neutral header row, whole-cell sortable headers, skeleton, empty and error states, and Pagination.

```tsx
import { Pagination, Table, type Column, type SortState } from "@/components/ui";

const columns: Column<Invoice>[] = [
  { key: "ref", header: "Invoice", cell: (i) => i.reference, mono: true },
  { key: "customer", header: "Customer", sortable: true, cell: (i) => i.customer },
];

<Table caption="Invoices" columns={columns} rows={rows} rowKey={(i) => i.id} sort={sort} onSortChange={setSort} />
<Pagination page={page} pageCount={pageCount} onPageChange={setPage} totalItems={total} pageSize={20} itemLabel="invoices" />
```

## Sortable, with pagination

```tsx
<Table caption="Invoices" columns={columns} rows={pageRows} rowKey={(i) => i.id} sort={sort} onSortChange={setSort} />
<Pagination page={page} pageCount={3} onPageChange={setPage} totalItems={11} pageSize={4} itemLabel="invoices" />
```

## Loading, empty and error

Switch the state to see each. Empty tells the user what to do next.

```tsx
<Table … loading />
<Table … rows={[]} empty={<EmptyState compact tone="filtered" title="No invoices match" description="Clear a filter to see more." />} />
<Table … error={<Alert tone="danger" title="Couldn't load invoices" action={<Button size="sm" variant="secondary" onClick={retry}>Try again</Button>} />} />
```

## White appearance

```tsx
<Table appearance="white" caption="Invoices" columns={columns} rows={rows} rowKey={(r) => r.id} />
```

Docs: https://rime.mjsons.net/components/table
