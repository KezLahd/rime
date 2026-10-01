# PrefixedInput examples

A fixed-format code with a set prefix: an invoice number, an account code, a membership number.

```tsx
import { Field, PrefixedInput } from "@/components/ui";

<Field label="Invoice number">
  <PrefixedInput prefix="INV" length={6} value={code} onValueChange={(full) => setCode(full)} />
</Field>
```

## Digits

```tsx
<PrefixedInput prefix="INV" length={6} value={v} onValueChange={(code) => setV(code)} />
```

## Letters and numbers

```tsx
<PrefixedInput prefix="ACC-" length={8} charset="alphanumeric" value={v} onValueChange={(code) => setV(code)} />
```

Docs: https://rime.mjsons.net/components/prefixed-input
