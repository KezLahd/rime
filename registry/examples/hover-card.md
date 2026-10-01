# HoverCard examples

A rich preview on hover or keyboard focus of a link: a person, a project, a record.

```tsx
import { HoverCard } from "@/components/ui";

<HoverCard trigger={<a href="/team/jane-cooper">@janecooper</a>}>
  …profile…
</HoverCard>
```

## Open

```tsx
<HoverCard inline trigger={<a href="/team/jane-cooper">@janecooper</a>}>
  <Avatar name="Jane Cooper" />
  <strong>Jane Cooper</strong>
  <span>Design lead on Project Atlas.</span>
</HoverCard>
```

## On hover and focus

Hover the name, or Tab to it.

```tsx
<p>Assigned to <HoverCard trigger={<a href="/team/jane-cooper">@janecooper</a>}>…</HoverCard> for review.</p>
```

Docs: https://rime.mjsons.net/components/hover-card
