# NavSearch and SmartSearch examples

Top-bar search: NavSearch jumps to pages and actions; SmartSearch queries records with grouped results.

```tsx
import { NavSearch, SmartSearch } from "@/components/ui";

<NavSearch aria-label="Search pages" items={DESTINATIONS} />
```

## Open

inline shows the results panel open under the bar, in place.

```tsx
<NavSearch inline aria-label="Search pages and actions" items={DESTINATIONS} />
```

## NavSearch

```tsx
<NavSearch items={DESTINATIONS} aria-label="Search pages and actions" />
```

Docs: https://rime.mjsons.net/components/nav-search
