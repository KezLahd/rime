# ImpactPreview examples

What a destructive action will change, row by row, before it is confirmed.

```tsx
import { ImpactPreview } from "@/components/ui";

<ImpactPreview items={[{ id: "a", severity: "destructive", title: "Signed out everywhere" }]} />
```

## Default

```tsx
<ImpactPreview statement="This action cannot be undone" items={ITEMS} />
```

Docs: https://rime.mjsons.net/components/impact-preview
