# Command examples

A command palette: a search box over grouped actions with shortcuts, keyboard-first, inline or as a Ctrl+K dialog.

```tsx
import { Command, CommandDialog } from "@/components/ui";

<CommandDialog
  open={open}
  onOpenChange={setOpen}
  groups={[
    { heading: "Suggestions", items: [{ id: "invoice", label: "Create invoice", shortcut: "Ctrl N", onSelect: create }] },
    { heading: "Go to", items: [{ id: "orders", label: "Orders", onSelect: () => router.push("/orders") }] },
  ]}
/>
```

## Palette

Type to filter; arrows and Enter run a command.

```tsx
<Command groups={GROUPS} label="Search commands" />
```

## As a dialog with Ctrl+K

Press the button, or Ctrl K anywhere on this page.

```tsx
<CommandDialog open={open} onOpenChange={setOpen} groups={GROUPS} />
```

Docs: https://rime.mjsons.net/components/command
