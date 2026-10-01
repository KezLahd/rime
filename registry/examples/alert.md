# Alert examples

An inline message in a tone (info, success, warning, danger) or a quiet legal box for fixed wording, with an action and dismiss.

```tsx
import { Alert } from "@/components/ui";

<Alert tone="warning" title="Payment is processing">We will email you when the bank confirms it.</Alert>
```

## Tones

```tsx
<Alert tone="info" title="Heads up">…</Alert>
<Alert tone="danger" title="Couldn't save" action={<Button size="sm" variant="secondary">Try again</Button>} />
```

Docs: https://rime.mjsons.net/components/alert
