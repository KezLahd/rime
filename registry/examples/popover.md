# Popover examples

An anchored frosted panel for arbitrary content: a short form, a set of options, a details block.

```tsx
import { Button, Popover } from "@/components/ui";

<Popover label="Canvas dimensions" trigger={<Button variant="secondary">Dimensions</Button>}>
  …fields…
</Popover>
```

## Open

The panel under its trigger, drawn inline.

```tsx
<Popover inline label="Canvas dimensions" width={260} trigger={<Button variant="secondary">Dimensions</Button>}>
  <Field label="Width"><TextInput size="sm" defaultValue="1280" trailing="px" /></Field>
  <Field label="Height"><TextInput size="sm" defaultValue="720" trailing="px" /></Field>
</Popover>
```

## From its trigger

Press the button. Esc or a press outside closes it.

```tsx
<Popover label="Canvas dimensions" width={260} trigger={<Button variant="secondary">Dimensions</Button>}>
  …
</Popover>
```

Docs: https://rime.mjsons.net/components/popover
