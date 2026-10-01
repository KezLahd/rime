# InputGroup examples

A text field with addons joined to it: a fixed text segment, an icon, or a button such as Copy.

```tsx
import { InputGroup } from "@/components/ui";

<Field label="Website">
  <InputGroup start="https://" placeholder="example.com" />
</Field>
```

## Text, icon and button addons

```tsx
<InputGroup start="https://" placeholder="example.com" aria-label="Website" />
<InputGroup start={<IconSearch size={16} />} placeholder="Search invoices" aria-label="Search invoices" />
<InputGroup start="$" end="USD" inputMode="decimal" aria-label="Amount" />
<InputGroup readOnly mono defaultValue="sk_live_4f9a2c" aria-label="API key"
  end={<IconButton size="sm" label="Copy key" icon={<Copy size={14} />} />} />
```

## In a Field

```tsx
<Field label="Workspace address" hint="Letters, numbers and dashes.">
  <InputGroup end=".example.app" placeholder="acme" />
</Field>
<Field label="Weight" error="Enter a weight under 30 kg.">
  <InputGroup end="kg" inputMode="decimal" />
</Field>
```

Docs: https://rime.mjsons.net/components/input-group
