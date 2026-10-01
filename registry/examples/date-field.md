# DateField examples

A typed DD/MM/YYYY field with a calendar popover, min/max and a date-of-birth preset.

```tsx
import { DateField } from "@/components/ui";

<Field label="Due date"><DateField value={due} onChange={setDue} /></Field>
```

## Open

inline shows the calendar open under the field, in place.

```tsx
<DateField inline aria-label="Due date" value={due} onChange={setDue} />
```

## Default

```tsx
<DateField value={date} onChange={setDate} min="2026-01-01" />
```

Docs: https://rime.mjsons.net/components/date-field
