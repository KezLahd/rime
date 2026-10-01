# Checkbox examples

A native checkbox drawn as a gradient tick, plain or as a selectable card, with indeterminate.

```tsx
import { Checkbox } from "@/components/ui";

<Checkbox label="I accept the workspace terms" checked={ok} onChange={(e) => setOk(e.target.checked)} />
```

## Plain, card, indeterminate

```tsx
<Checkbox label="Email me updates" />
<Checkbox variant="card" label="I accept the terms" description="Required to continue." />
<Checkbox indeterminate label="Select all" />
```

Docs: https://rime.mjsons.net/components/checkbox
