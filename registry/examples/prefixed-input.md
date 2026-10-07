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

prefixOptions turns the prefix into a dropdown. Each option carries its own length so a +61 mobile, a +61 landline, a 1300, a 13 and a 1800 all fit the same field. Pasting a full number picks the matching option automatically. Add validate(body) to catch invalid formats (AU numbers after +61 start with 2, 3, 4, 7, or 8) and detail(body) to show a plain-English hint under the field as the user types.

```tsx
const AU_AREAS = {
  "2": "NSW / ACT landline",
  "3": "VIC / TAS landline",
  "4": "Mobile",
  "7": "QLD landline",
  "8": "WA / SA / NT landline",
};

<PrefixedInput
  prefixOptions={[
    {
      value: "+61",
      label: "Mobile or landline",
      length: 9,
      validate: (b) =>
        AU_AREAS[b[0]]
          ? null
          : "Australian numbers after +61 start with 2 (NSW/ACT), 3 (VIC/TAS), 4 (mobile), 7 (QLD), or 8 (WA/SA/NT).",
      detail: (b) => AU_AREAS[b[0]] ?? null,
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
