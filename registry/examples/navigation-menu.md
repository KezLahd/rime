# NavigationMenu examples

Top-level site navigation with frosted dropdown panels of described links, built as disclosure navigation.

```tsx
import { NavigationMenu } from "@/components/ui";

<NavigationMenu
  aria-label="Main"
  items={[
    { id: "product", label: "Product", links: [{ href: "/projects", title: "Projects", description: "Plan work and track every order." }] },
    { id: "pricing", label: "Pricing", href: "/pricing" },
  ]}
/>
```

## Open panel with a feature block

Rendered inline and open, so the panel shows in place.

```tsx
<NavigationMenu aria-label="Main" items={NAV} inline defaultValue="product" />
```

## Floating panels

The default: panels float over the page under their item.

```tsx
<NavigationMenu aria-label="Site" items={NAV} />
```

Docs: https://rime.mjsons.net/components/navigation-menu
