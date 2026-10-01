# Sheet and Drawer examples

A panel that slides in from an edge over a scrim, and a bottom Drawer with a drag handle.

```tsx
import { Button, Drawer, Sheet } from "@/components/ui";

<Sheet
  open={open}
  onClose={() => setOpen(false)}
  title="Edit team member"
  footer={<Button onClick={save}>Save changes</Button>}
>
  …fields…
</Sheet>
```

## Open

The panel itself, drawn inline.

```tsx
<Sheet inline open onClose={close} title="Edit team member" description="Changes apply as soon as you save." footer={…}>
  …fields…
</Sheet>
```

## From each edge

```tsx
<Sheet open={open} side="left" onClose={close} title="Filters">…</Sheet>
```

## Drawer, open

```tsx
<Drawer inline open onClose={close} title="Order ORD-2041" footer={<Button>Mark as shipped</Button>}>…</Drawer>
```

## Drawer with drag to close

Drag the handle down to dismiss.

```tsx
<Drawer open={open} onClose={() => setOpen(false)} title="Order ORD-2041">…</Drawer>
```

Docs: https://rime.mjsons.net/components/sheet
