# Select examples

A custom listbox: a recessed field or filter chip that opens a frosted popover, optionally searchable.

```tsx
import { Field, Select } from "@/components/ui";

<Field label="Topic">
  <Select
    value={topic}
    onChange={setTopic}
    placeholder="Choose a topic"
    options={[
      { value: "billing", label: "Billing and invoices" },
      { value: "access", label: "Account access" },
    ]}
  />
</Field>
```

## Open

inline renders the list open under its trigger, in place: how it looks when someone opens it.

```tsx
<Select inline aria-label="Topic" value={topic} onChange={setTopic} options={TOPICS} />
```

## Field appearance

```tsx
<Select value={value} onChange={setValue} placeholder="Choose a topic" options={TOPICS} />
```

## Chip appearance (filters)

active marks a chip whose filter is applied; count shows the rows each option would leave.

```tsx
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
  ]}
/>
```

## Searchable, grouped

```tsx
<Select searchable value={project} onChange={setProject} placeholder="Choose a project" options={PROJECTS} />
```

## Invalid and disabled

```tsx
<Select invalid … />
<Select disabled … />
```

Docs: https://rime.mjsons.net/components/select
