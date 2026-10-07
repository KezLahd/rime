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

prefixOptions turns the prefix into a dropdown. Each option carries its own length so a +61 mobile and a 1300 fit the same field. Pasting a full number picks the matching option automatically. Add validate(body) to catch invalid formats (an AU mobile must start with 4 after +61) and detail(body) to show a plain-English hint under the field as the user types.

```tsx
<PrefixedInput
  prefixOptions={[
    {
      value: "+61",
      label: "Mobile",
      length: 9,
      validate: (b) => (b.startsWith("4") ? null : "Australian mobile numbers start with 4 after +61."),
      detail: (b) => (b.startsWith("4") ? "Australian mobile" : null),
    },
    { value: "1300", label: "Business", length: 6, detail: () => "Local-rate business number" },
    { value: "13", label: "Short code", length: 4, detail: () => "National short code (max 4 digits)" },
    { value: "1800", label: "Toll-free", length: 6, detail: () => "Free for the caller" },
  ]}
  value={p}
  onValueChange={(code) => setP(code)}
/>
```

Docs: https://rime.mjsons.net/components/prefixed-input
