# TypeToConfirmModal and DangerZone examples

The heaviest confirm: an impact preview and a typed phrase; and the Danger zone section that leads to it.

```tsx
import { DangerZone, DangerZoneRow, TypeToConfirmModal } from "@/components/ui";

<DangerZone>
  <DangerZoneRow title="Remove team member" actionLabel="Remove team member" confirm={{ title: "Remove Jane Cooper?", phrase: "remove jane cooper", confirmLabel: "Remove team member", onConfirm: remove, impact: ITEMS }} />
</DangerZone>
```

## Open

The confirm itself, rendered in place with inline.

```tsx
<TypeToConfirmModal inline open onClose={close} title="Remove Jane Cooper?" meta="Team member · Design" phrase="remove jane cooper" confirmLabel="Remove team member" impact={ITEMS} onConfirm={remove} />
```

## Danger zone

```tsx
<DangerZone>…</DangerZone>
```

Docs: https://rime.mjsons.net/components/type-to-confirm
