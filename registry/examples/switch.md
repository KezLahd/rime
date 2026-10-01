# Switch examples

An on/off setting that takes effect immediately, with a loading state while it saves.

```tsx
import { Switch } from "@/components/ui";

<Switch label="Email me when an invoice is paid" checked={on} onChange={setOn} />
```

## States

```tsx
<Switch label="Saving" checked loading onChange={…} />
```

Docs: https://rime.mjsons.net/components/switch
