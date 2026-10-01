# Label examples

A standalone form label with required and optional markers, for controls outside a Field.

```tsx
import { Label } from "@/components/ui";

<Label htmlFor="project-name" required>Project name</Label>
<TextInput id="project-name" required />
```

## Required and optional

```tsx
<Label htmlFor="name" required>Project name</Label>
<TextInput id="name" required />
<Label htmlFor="po" optional>Purchase order</Label>
<TextInput id="po" />
```

## Styles

```tsx
<Label>Sentence label</Label>
<Label labelStyle="caps">Caps label</Label>
<Label disabled>Disabled label</Label>
```

Docs: https://rime.mjsons.net/components/label
