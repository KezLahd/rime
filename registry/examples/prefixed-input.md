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

## Switchable prefix (phone)

prefixOptions turns the prefix into a dropdown. Each option carries its own length so a +61 mobile and a 1300 fit the same field. Pasting a full number picks the matching option automatically.

```tsx
<PrefixedInput
  prefixOptions={[
    { value: "+61", label: "Mobile", length: 9 },
    { value: "1300", label: "Business", length: 6 },
    { value: "13", label: "Short code", length: 4 },
    { value: "1800", label: "Toll-free", length: 6 },
  ]}
  value={p}
  onValueChange={(code) => setP(code)}
/>
```

Docs: https://rime.mjsons.net/components/prefixed-input
