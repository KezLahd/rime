# SidebarShell examples

The signed-in frame in four layouts: an expanded frosted sidebar, a collapsible icon rail, a header-only top nav, and a drawer on narrow screens.

```tsx
import { SidebarShell } from "@/components/shell/SidebarShell";

<SidebarShell
  navLabel="Main"
  logo={<img src="/logo.svg" alt="Acme" width={140} height={32} />}
  nav={[
    { href: "/dashboard", label: "Dashboard", icon: <IconHome size={16} />, exact: true },
    { href: "/projects", label: "Projects", icon: <IconClipboard size={16} />, count: 2 },
  ]}
  title="Projects"
  topbarRight={<Avatar name="Jane Cooper" size="sm" />}
  collapsible
  storageKey="app-sidebar-collapsed"
>
  {children}
</SidebarShell>
```

## Sidebar expanded (logo corner: match glass)

```tsx
<SidebarShell contained navLabel="Main" nav={NAV} activeHref="/projects" title="Projects">
  …
</SidebarShell>
```

## Collapsible, remembered

The panel button folds the sidebar to the icon rail and back. storageKey keeps the choice across reloads.

```tsx
<SidebarShell
  contained
  collapsible
  storageKey="app-sidebar-collapsed"
  onCollapsedChange={(collapsed) => console.log("collapsed", collapsed)}
  navLabel="Main"
  nav={NAV}
  title="Projects"
>
  …
</SidebarShell>
```

## Collapsed to an icon rail

layout="rail" starts collapsed. With collapsible it can still be expanded.

```tsx
<SidebarShell contained layout="rail" collapsible navLabel="Main" nav={NAV} title="Projects" logoCompact={<Mark />}>
  …
</SidebarShell>
```

## Header only (top nav)

No sidebar: the logo, the nav and topbarRight share one frosted bar.

```tsx
<SidebarShell contained layout="header" navLabel="Main" nav={NAV} topbarRight={<Avatar name="Jane Cooper" size="sm" />}>
  …
</SidebarShell>
```

## Mobile drawer

Below 900px the sidebar is a drawer from the menu button. Shown open here with forceMobile and defaultDrawerOpen.

```tsx
// Automatic below 900px of the frame's width. For a preview at desktop width:
<SidebarShell contained forceMobile defaultDrawerOpen navLabel="Main" nav={NAV} title="Projects">
  …
</SidebarShell>

// Keep the icon rail on narrow screens instead of a drawer:
<SidebarShell mobileDrawer={false} navLabel="Main" nav={NAV}>…</SidebarShell>
```

## Logo corner: brand fill

Opt in for brands that require a set colour behind the logo. Set the colour with --logo-corner-bg (a colour or a gradient).

```tsx
<SidebarShell contained logoCorner="fill" navLabel="Main" nav={NAV} activeHref="/projects" title="Projects">…</SidebarShell>

/* theme.css */
:root { --logo-corner-bg: linear-gradient(135deg, #0f766e, #0b5c56); --logo-corner-ink: #ffffff; }
```

## With a context strip

```tsx
<SidebarShell contained strip="Admin session" navLabel="Admin" nav={ADMIN_NAV} activeHref="/admin" title="Overview">…</SidebarShell>
```

Docs: https://rime.mjsons.net/components/sidebar-shell
