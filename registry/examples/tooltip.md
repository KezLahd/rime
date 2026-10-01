# Tooltip and Toggletip examples

Hover and focus tooltips (dark one-liners or light rich cards) and click-to-open toggletips for help.

```tsx
import { Toggletip, Tooltip } from "@/components/ui";

<Tooltip content="Print invoice"><IconButton label="Print" icon={<IconPrinter size={17} />} /></Tooltip>
```

## Open

inline shows the bubble and the toggletip panel open beside their triggers, in place.

```tsx
<Tooltip inline content="Print invoice" shortcut={["Ctrl", "P"]}>…</Tooltip>
<Toggletip inline label="About seats" title="Seats">Each plan includes five seats.</Toggletip>
```

## Tooltip and toggletip

```tsx
<Tooltip content="Copy reference" shortcut={["Ctrl", "C"]}>…</Tooltip>
<Toggletip label="About seats">Each plan includes five seats.</Toggletip>
```

Docs: https://rime.mjsons.net/components/tooltip
