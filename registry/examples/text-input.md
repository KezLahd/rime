# TextInput examples

The text field: a white box with a tinted edge, a brand halo on focus, adornments and a password reveal.

```tsx
import { Field, TextInput } from "@/components/ui";

<Field label="Email" hint="We send the sign-in link here.">
  <TextInput type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
</Field>
```

## In a Field

Label, hint and error come from Field; the input reads them from context.

```tsx
<Field label="Project name" hint="Shown to everyone on the team.">
  <TextInput placeholder="e.g. Atlas redesign" />
</Field>
```

## Adornments and reveal

```tsx
<TextInput leadingIcon={<IconSearch size={16} />} placeholder="Search" />
<TextInput trailing="kg" inputMode="decimal" />
<TextInput type="password" revealable autoComplete="current-password" />
```

## States

```tsx
<Field label="Postcode" error="Enter a 4-digit postcode.">
  <TextInput invalid defaultValue="20" />
</Field>
<TextInput readOnly defaultValue="INV-1042" mono />
<TextInput disabled placeholder="Disabled" />
<TextInput size="sm" placeholder="Small" />
```

Docs: https://rime.mjsons.net/components/text-input
