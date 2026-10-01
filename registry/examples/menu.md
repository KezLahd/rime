# Menu examples

An action menu from a button: groups, headings, separators, icons, links and danger items, in a frosted popover.

```tsx
import { Menu } from "@/components/ui";

<Menu label="Actions" items={[{ id: "edit", label: "Edit", onSelect: edit }, { id: "sep", separator: true }, { id: "void", label: "Void invoice", tone: "danger", onSelect: confirm }]} />
```

## Open

inline renders the menu open under its trigger, in place.

```tsx
<Menu inline label="Actions" items={ITEMS} />
```

## Default

```tsx
<Menu label="Actions" items={ITEMS} />
```

Docs: https://rime.mjsons.net/components/menu
