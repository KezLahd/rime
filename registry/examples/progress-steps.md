# ProgressSteps examples

A horizontal track of steps with detail and meta lines, or a compact dot track for table cells.

```tsx
import { ProgressSteps } from "@/components/ui";

<ProgressSteps aria-label="Shipment" steps={[{ label: "Packed", state: "done" }, { label: "Shipped", state: "current" }]} />
```

## Full and compact

```tsx
<ProgressSteps steps={steps} aria-label="Shipment" />
<ProgressSteps compact steps={steps} aria-label="Shipment" />
```

Docs: https://rime.mjsons.net/components/progress-steps
