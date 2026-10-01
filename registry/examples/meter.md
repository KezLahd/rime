# Meter and ProgressBar examples

A segmented meter for small counts (seats used) and a bar for progress through a total.

```tsx
import { Meter, ProgressBar } from "@/components/ui";

<Meter label="Seats" value={3} max={5} valueText="3 of 5 used" />
```

## Default

```tsx
<Meter label="Seats" value={3} max={5} />
<ProgressBar label="Quarterly target" value={240} max={400} />
```

Docs: https://rime.mjsons.net/components/meter
