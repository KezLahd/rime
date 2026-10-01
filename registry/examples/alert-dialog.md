# AlertDialog examples

A short interrupting confirm with Cancel and one action; focus starts on Cancel and the scrim never dismisses it.

```tsx
import { AlertDialog } from "@/components/ui";

<AlertDialog
  open={open}
  tone="danger"
  title="Delete Project Atlas?"
  description="Its 12 tasks and 48 files are deleted with it."
  actionLabel="Delete project"
  onCancel={() => setOpen(false)}
  onAction={remove}
  busy={pending}
/>
```

## Open

```tsx
<AlertDialog inline open tone="danger" title="Delete Project Atlas?" description="…" actionLabel="Delete project" onCancel={…} onAction={…} />
```

## Danger, with a busy state

```tsx
<AlertDialog open={open} tone="danger" … busy={pending} busyLabel="Deleting…" />
```

## Default tone

```tsx
<AlertDialog open={open} title="Discard this draft?" actionLabel="Discard draft" cancelLabel="Keep editing" … />
```

Docs: https://rime.mjsons.net/components/alert-dialog
