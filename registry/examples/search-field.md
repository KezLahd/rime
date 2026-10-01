# SearchField examples

Field-size search on the grey frosted recess: clear button, loading state and an optional key hint.

```tsx
import { SearchField } from "@/components/ui";

<SearchField aria-label="Search invoices" value={q} onValueChange={setQ} placeholder="Customer or invoice number" />
```

## Default, loading

```tsx
<SearchField value={q} onValueChange={setQ} loading={pending} shortcut="/" aria-label="Search" />
```

Docs: https://rime.mjsons.net/components/search-field
