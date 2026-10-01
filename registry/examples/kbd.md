# Kbd and KbdGroup examples

Keyboard keys as small raised key caps, alone or as a combination.

```tsx
import { Kbd, KbdGroup } from "@/components/ui";

<KbdGroup keys={["Ctrl", "K"]} />
```

## Keys and combinations

```tsx
<KbdGroup keys={["Ctrl", "K"]} />
<KbdGroup keys={["Shift", "Alt", "N"]} />
<Kbd>Esc</Kbd>
<p>Press <KbdGroup keys={["Ctrl", "S"]} size="sm" /> to save the invoice.</p>
```

Docs: https://rime.mjsons.net/components/kbd
