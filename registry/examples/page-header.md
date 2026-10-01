# PageHeader examples

A page's h1 with a back link, a meta line, a description and actions.

```tsx
import { PageHeader } from "@/components/shell/PageHeader";

<PageHeader title="Atlas redesign" back={{ href: "/projects", label: "Projects" }} actions={<Button variant="secondary">Share</Button>} />
```

## Back link, meta and actions

```tsx
<PageHeader
  title="Atlas redesign"
  description="Started 12 Oct 2026 · 4 members"
  back={{ href: "/projects", label: "Projects" }}
  meta={<StatusPill tone="success">Active</StatusPill>}
  actions={<Button variant="secondary">Share</Button>}
/>
```

Docs: https://rime.mjsons.net/components/page-header
