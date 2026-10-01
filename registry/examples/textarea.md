# Textarea examples

Multi-line text in the TextInput box, resizable vertically, with an optional character count.

```tsx
import { Field, Textarea } from "@/components/ui";

<Field label="Note for the customer">
  <Textarea maxLength={1000} showCount rows={4} />
</Field>
```

## With a count

```tsx
<Textarea maxLength={280} showCount placeholder="Plain language." />
```

Docs: https://rime.mjsons.net/components/textarea
