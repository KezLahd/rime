# Card examples

A solid card with a washed header, a lifted highlight tone, and a sunken muted tone.

```tsx
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui";

<Card title="This month" description="Updated hourly" actions={<Button size="sm" variant="secondary">Export</Button>}>…</Card>
```

## Tones

```tsx
<Card title="Default">…</Card>
<Card tone="highlight" title="Two invoices are overdue">…</Card>
<Card tone="muted">Secondary info</Card>
```

## Composed from parts

The same card written with shadcn's parts; it renders identically to the props form below it.

```tsx
<Card>
  <CardHeader>
    <CardTitle>This month</CardTitle>
    <CardDescription>Updated hourly</CardDescription>
    <CardAction><Button size="sm" variant="secondary">Export</Button></CardAction>
  </CardHeader>
  <CardContent>32 invoices paid</CardContent>
  <CardFooter><Button size="sm">View all</Button></CardFooter>
</Card>

// identical to:
<Card title="This month" description="Updated hourly" actions={…} footer={…}>32 invoices paid</Card>
```

Docs: https://rime.mjsons.net/components/card
