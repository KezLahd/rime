# Menubar examples

A desktop application menu bar (File, Edit, View) with keyboard navigation across and within its menus.

```tsx
import { Menubar } from "@/components/ui";

<Menubar
  aria-label="Editor"
  menus={[
    { id: "file", label: "File", items: [{ id: "new", label: "New project", shortcut: "Ctrl N", onSelect: create }] },
    { id: "edit", label: "Edit", items: [{ id: "undo", label: "Undo", shortcut: "Ctrl Z", onSelect: undo }] },
  ]}
/>
```

## Open

The File menu drawn open under its title.

```tsx
<Menubar inline aria-label="Editor" menus={MENUS} inlineOpenId="file" inlineHighlightId="open" />
```

## Interactive

Click a title, then use the arrow keys.

```tsx
<Menubar aria-label="Editor" menus={MENUS} />
```

Docs: https://rime.mjsons.net/components/menubar
