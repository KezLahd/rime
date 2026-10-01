# ContextMenu examples

A menu of actions for a region, opened at the pointer with a right-click, Shift+F10 or a long press.

```tsx
import { ContextMenu } from "@/components/ui";

<ContextMenu label="Actions for Invoice INV-0042" items={[
  { id: "open", label: "Open", onSelect: open },
  { id: "rename", label: "Rename", shortcut: "F2", onSelect: rename },
  { id: "sep", separator: true },
  { id: "delete", label: "Move to bin", tone: "danger", onSelect: remove },
]}>
  Invoice INV-0042.pdf
</ContextMenu>
```

## Open

The menu over its region, drawn inline with one item highlighted.

```tsx
<ContextMenu inline label="Actions for Invoice INV-0042" items={ITEMS} highlightId="rename">
  Invoice INV-0042.pdf
</ContextMenu>
```

## On a region

Right-click it, or focus it and press Shift F10.

```tsx
<ContextMenu label="Actions for Invoice INV-0042" items={ITEMS}>…</ContextMenu>
```

Docs: https://rime.mjsons.net/components/context-menu
