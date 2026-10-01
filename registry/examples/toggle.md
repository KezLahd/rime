# Toggle examples

A two-state button, pressed or not, for toolbar formatting and view options.

```tsx
import { Toggle } from "@/components/ui";

<Toggle aria-label="Bold" icon={<Bold size={16} />} pressed={bold} onPressedChange={setBold} />
```

## Icon, text and disabled

```tsx
<Toggle aria-label="Bold" icon={<Bold size={16} />} pressed={bold} onPressedChange={setBold} />
<Toggle variant="outline" pressed={archived} onPressedChange={setArchived}>Show archived</Toggle>
<Toggle disabled>Disabled</Toggle>
```

Docs: https://rime.mjsons.net/components/toggle
