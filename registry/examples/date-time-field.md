# DateTimeField and DateTimeRangeField examples

A date and a time of day on one row, each with its own popup; the range variant pairs a start and end.

```tsx
import { DateTimeField, DateTimeRangeField, type DateTime, type DateTimeRange } from "@/components/ui";

<DateTimeField value={at} onChange={setAt} format="12h" step={15} />
```

## Date-time and range

```tsx
<DateTimeField value={at} onChange={setAt} format="12h" step={15} />
<DateTimeRangeField value={range} onChange={setRange} format="12h" step={30} />
```

Docs: https://rime.mjsons.net/components/date-time-field
