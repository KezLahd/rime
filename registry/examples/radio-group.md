# RadioGroup examples

One choice from a few: a list, inline, or cards in 1 to 3 columns.

```tsx
import { RadioGroup } from "@/components/ui";

<RadioGroup aria-label="Billing period" value={period} onChange={setPeriod} options={[{ value: "monthly", label: "Monthly" }, { value: "yearly", label: "Yearly" }]} />
```

## Cards

```tsx
<RadioGroup variant="cards" columns={3} value={v} onChange={setV} options={PERIODS} aria-label="Billing period" />
```

Docs: https://rime.mjsons.net/components/radio-group
