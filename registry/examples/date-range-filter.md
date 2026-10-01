# DateRangeFilter examples

A date-range chip for filter rows: presets plus a two-month range calendar.

```tsx
import { DateRangeFilter } from "@/components/ui";

<DateRangeFilter aria-label="Issued" value={range} onChange={setRange} />
```

## Open

inline shows the presets and calendars open under the chip, in place.

```tsx
<DateRangeFilter inline aria-label="Issued" value={range} onChange={setRange} />
```

## Chip

```tsx
<DateRangeFilter value={range} onChange={setRange} aria-label="Date" />
```

Docs: https://rime.mjsons.net/components/date-range-filter
