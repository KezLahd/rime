# StatusPill, Badge and CountBadge examples

Status pills (tinted fill, tinted edge, deep ink), small uppercase tags, and count badges.

```tsx
import { Badge, CountBadge, StatusPill } from "@/components/ui";

<StatusPill tone="success">Paid</StatusPill>
```

## Tones

```tsx
<StatusPill tone="neutral">Draft</StatusPill>
<StatusPill tone="info">Sent</StatusPill>
<StatusPill tone="warning" dot>Overdue</StatusPill>
<StatusPill tone="success">Paid</StatusPill>
<StatusPill tone="danger">Void</StatusPill>
<Badge tone="brand" variant="solid">New</Badge>
<CountBadge count={4} label="4 waiting" />
```

## shadcn badge variants

Badge accepts shadcn's variant names: default (solid accent), secondary (soft neutral), destructive (solid danger) and outline (a hairline, no fill). asChild renders a link with the badge's look.

```tsx
<Badge variant="default">New</Badge>
<Badge variant="secondary">Draft</Badge>
<Badge variant="destructive">Overdue</Badge>
<Badge variant="outline">Beta</Badge>
<Badge variant="outline" asChild><a href="#changelog">Changelog</a></Badge>
```

Docs: https://rime.mjsons.net/components/status-pill
