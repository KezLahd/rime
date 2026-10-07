# TimeField and TimeRangeField examples

A time of day with typed input and a popup picker; the range variant pairs start and end on one row.

```tsx
import { TimeField, TimeRangeField, type Time, type TimeRange } from "@/components/ui";

<TimeField value={at} onChange={setAt} />
```

## Open

inline shows the picker open under the field, in place.

```tsx
<TimeField inline aria-label="Opens at" value={at} onChange={setAt} format="12h" step={15} />
```

## Single time and range

```tsx
<TimeField value={at} onChange={setAt} format="12h" step={15} />
<TimeRangeField value={range} onChange={setRange} format="12h" step={30} />
```

Docs: https://rime.mjsons.net/components/time-field
