# Slider examples

Picks a number or a range by dragging along a track, with steps, marks and a value readout.

```tsx
import { Slider } from "@/components/ui";

<Slider label="Volume" value={volume} onValueChange={setVolume} showValue formatValue={(n) => `${n}%`} />
```

## Single value

```tsx
<Slider label="Volume" value={v} onValueChange={setV} showValue formatValue={(n) => `${n}%`} />
```

## Range with marks

```tsx
<Slider
  label="Order value"
  value={range}
  onValueChange={setRange}
  min={0}
  max={1000}
  step={50}
  showValue
  formatValue={(n) => `$${n}`}
  marks={[{ value: 0, label: "$0" }, { value: 500, label: "$500" }, { value: 1000, label: "$1,000" }]}
/>
```

## Step and disabled

```tsx
<Slider label="Step 5" value={35} onValueChange={set} step={5} showValue />
<Slider label="Disabled" value={40} onValueChange={set} disabled />
```

Docs: https://rime.mjsons.net/components/slider
