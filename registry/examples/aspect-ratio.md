# AspectRatio examples

A box held to a width-to-height ratio, so media keeps its shape and never shifts the layout while loading.

```tsx
import { AspectRatio } from "@/components/ui";

<AspectRatio ratio={16 / 9}>
  <img src="/cover.jpg" alt="The new office, from the street" />
</AspectRatio>
```

## 16 / 9

```tsx
<AspectRatio ratio={16 / 9}>…</AspectRatio>
```

## Square and 4 / 3

```tsx
<AspectRatio ratio={1}>…</AspectRatio>
<AspectRatio ratio={4 / 3}>…</AspectRatio>
```

Docs: https://rime.mjsons.net/components/aspect-ratio
