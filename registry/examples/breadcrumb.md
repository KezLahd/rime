# Breadcrumb examples

Where this page sits: a trail of links ending on the current page, folding its middle into a menu when long.

```tsx
import { Breadcrumb } from "@/components/ui";

<Breadcrumb
  items={[
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
    { label: "Website relaunch" },
  ]}
/>
```

## Default

```tsx
<Breadcrumb items={[{ label: "Home", href: "/", icon: <IconHome size={14} /> }, { label: "Projects", href: "/projects" }, { label: "Website relaunch" }]} />
```

## Long trail, folded

Six items with maxItems={4}: the middle three sit in the ellipsis menu.

```tsx
<Breadcrumb maxItems={4} items={TRAIL} />
```

## Slash separator

```tsx
<Breadcrumb separator="/" items={[{ label: "Settings", href: "/settings" }, { label: "Team", href: "/settings/team" }, { label: "Members" }]} />
```

Docs: https://rime.mjsons.net/components/breadcrumb
