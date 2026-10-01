# ButtonGroup examples

Joins Buttons and IconButtons into one segmented row or column with shared outer corners.

```tsx
import { Button, ButtonGroup } from "@/components/ui";

<ButtonGroup aria-label="Invoice actions">
  <Button variant="secondary">Archive</Button>
  <Button variant="secondary">Report</Button>
</ButtonGroup>
```

## Groups and a split button

```tsx
<ButtonGroup aria-label="Invoice actions">
  <Button variant="secondary">Archive</Button>
  <Button variant="secondary">Report</Button>
  <Button variant="secondary">Snooze</Button>
</ButtonGroup>
<ButtonGroup aria-label="Send">
  <Button>Send invoice</Button>
  <IconButton variant="primary" label="More send options" icon={<IconChevronDown size={16} />} />
</ButtonGroup>
```

## Vertical

```tsx
<ButtonGroup orientation="vertical" aria-label="Order view">
  <Button variant="secondary">Details</Button>
  <Button variant="secondary">Line items</Button>
  <Button variant="secondary">History</Button>
</ButtonGroup>
```

Docs: https://rime.mjsons.net/components/button-group
