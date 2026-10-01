# Collapsible examples

One disclosure: a title row with a toggle, an always-visible summary and a region that opens beneath it.

```tsx
import { Collapsible } from "@/components/ui";

<Collapsible title="Jane Cooper starred 3 projects" summary={<Row>north-office/website</Row>}>
  <Row>north-office/brand-refresh</Row>
  <Row>north-office/quarterly-report</Row>
</Collapsible>
```

## Open, with a summary

```tsx
<Collapsible title="Jane Cooper starred 3 projects" summary={<Row>north-office/website</Row>} defaultOpen>
  …
</Collapsible>
```

Docs: https://rime.mjsons.net/components/collapsible
