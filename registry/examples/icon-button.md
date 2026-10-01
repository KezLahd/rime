# IconButton examples

A square action with only an icon, a required accessible label and a tooltip-friendly hit area.

```tsx
import { IconButton, IconX } from "@/components/ui";

<IconButton label="Close" icon={<IconX size={18} />} onClick={onClose} />
```

## Variants and states

```tsx
<IconButton label="More actions" icon={<IconMoreHorizontal size={18} />} />
<IconButton label="Print invoice" icon={<IconPrinter size={17} />} variant="secondary" />
<IconButton label="Add project" icon={<IconPlus size={17} />} variant="primary" />
<IconButton label="Filter" icon={<IconFilter size={16} />} pressed />
<IconButton label="Loading" icon={<IconMail size={16} />} loading />
```

Docs: https://rime.mjsons.net/components/icon-button
